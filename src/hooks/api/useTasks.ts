import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "../use-toast";
// PRISMA: import { Task, TaskCompletion } from "@prisma/client";
import type { Task, TaskCompletion } from "@/db/types";
import { openLink, openTelegramLink } from "@telegram-apps/sdk-react";
import { ActionData } from "@/lib/types";
// PRISMA: import { JsonValue } from "@prisma/client/runtime/library";
import type { JsonValue } from "@/lib/types";
import { useEffect } from "react";

interface TaskData {
	userId: string;
	telegramId: string;
	taskId: string;
}
interface TaskError {
	message: string;
}

export const useTasks = () => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const handleError = (error: AxiosError<TaskError>) => {
		const errorMessage = error.response?.data?.message || "An error occurred";
		toast({
			title: "Error",
			description: errorMessage,
			variant: "destructive",
		});
		return Promise.reject(error);
	};

	// Helper function to invalidate task-related queries
	const invalidateTaskQueries = () => {
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
		queryClient.invalidateQueries({ queryKey: ["user"] });
	};

	//Get fns
	const {
		data: allTasks,
		isLoading: isLoadingTasks,
		isError: isTasksError,
		refetch: refetchTasks,
	} = useQuery<Task[]>({
		queryKey: ["tasks"],
		queryFn: async () => {
			const res = await axios.get<Task[]>("/apis/admin/tasks");
			return res.data;
		},
	});

	const dailyTasks =
		allTasks?.filter((task) => task.frequency === "DAILY") || [];

	//Write fn
	const startTaskMutation = useMutation({
		mutationFn: async ({ userId, taskId }: TaskData) => {
			const { data } = await axios.post<TaskCompletion>(
				"/apis/user/tasks/start",
				{
					userId,
					taskId,
				},
			);
			return data;
		},
		onMutate: async ({ userId, taskId, telegramId }) => {
			await queryClient.cancelQueries({ queryKey: ["userData", telegramId] });
			const previousUser = queryClient.getQueryData(["userData", telegramId]);

			queryClient.setQueryData(["userData", telegramId], (old: any) => {
				if (!old) return old;
				const existingCompletions = old.TaskCompletions || [];
				const exists = existingCompletions.find((c: any) => c.taskId === taskId);
				
				if (exists) {
					return {
						...old,
						TaskCompletions: existingCompletions.map((c: any) =>
							c.taskId === taskId ? { ...c, status: "IN_PROGRESS" } : c
						),
					};
				}
				return {
					...old,
					TaskCompletions: [
						...existingCompletions,
						{ id: "temp", userId, taskId, status: "IN_PROGRESS", task: { id: taskId } },
					],
				};
			});

			return { previousUser, telegramId };
		},
		onSuccess: (data, variables) => {
			toast({
				title: "Task Started",
				description: "Your task is now in progress",
			});
		},
		onError: (error: AxiosError<TaskError>, variables, context: any) => {
			if (context?.previousUser) {
				queryClient.setQueryData(["userData", context.telegramId], context.previousUser);
			}
			handleError(error);
		},
		onSettled: (data, error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userData", variables.telegramId] });
		},
	});

	const verifyTaskMutation = useMutation({
		mutationFn: async ({ userId, telegramId, taskId }: TaskData) => {
			const { data } = await axios.post("/apis/user/tasks/verify", {
				userId,
				taskId,
				telegramId,
			});
			return data;
		},
		onMutate: async ({ userId, taskId, telegramId }) => {
			await queryClient.cancelQueries({ queryKey: ["userData", telegramId] });
			const previousUser = queryClient.getQueryData(["userData", telegramId]);

			queryClient.setQueryData(["userData", telegramId], (old: any) => {
				if (!old) return old;
				const existingCompletions = old.TaskCompletions || [];
				
				return {
					...old,
					TaskCompletions: existingCompletions.map((c: any) =>
						c.taskId === taskId ? { ...c, status: "COMPLETED", completed: new Date() } : c
					),
				};
			});

			return { previousUser, telegramId };
		},
		onSuccess: (data, variables) => {
			toast({
				title: "Task Verified",
				description: data.message || "Task completed successfully!",
			});
		},
		onError: (error: AxiosError<TaskError>, variables, context: any) => {
			if (context?.previousUser) {
				queryClient.setQueryData(["userData", context.telegramId], context.previousUser);
			}
			handleError(error);
		},
		onSettled: (data, error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userData", variables.telegramId] });
		},
	});

	const claimTaskMutation = useMutation({
		mutationFn: async ({ userId, taskId }: TaskData) => {
			const { data } = await axios.post("/apis/user/tasks/claim", {
				userId,
				taskId,
			});
			return data;
		},
		onMutate: async ({ userId, taskId, telegramId }) => {
			await queryClient.cancelQueries({ queryKey: ["userData", telegramId] });
			const previousUser = queryClient.getQueryData(["userData", telegramId]);

			queryClient.setQueryData(["userData", telegramId], (old: any) => {
				if (!old) return old;
				const existingRewards = old.Rewards || [];
				const exists = existingRewards.find((r: any) => r.taskId === taskId);

				if (exists) {
					return {
						...old,
						Rewards: existingRewards.map((r: any) =>
							r.taskId === taskId ? { ...r, claimed: new Date() } : r
						),
					};
				}

				return {
					...old,
					Rewards: [
						...existingRewards,
						{ id: "temp", userId, taskId, claimed: new Date() },
					],
				};
			});

			return { previousUser, telegramId };
		},
		onSuccess: (data, variables) => {
			toast({
				title: "Rewards Claimed",
				description: data.message || "Your rewards have been successfully claimed!",
			});
		},
		onError: (error: AxiosError<TaskError>, variables, context: any) => {
			if (context?.previousUser) {
				queryClient.setQueryData(["userData", context.telegramId], context.previousUser);
			}
			handleError(error);
		},
		onSettled: (data, error, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userData", variables.telegramId] });
		},
	});

	// Helper function to get social media URL
	const parseActionData = (actionData: unknown): ActionData => {
		if (typeof actionData === "string") {
			try {
				return JSON.parse(actionData) as ActionData;
			} catch (e) {
				console.error("Error parsing actionData:", e);
				return {};
			}
		}

		if (typeof actionData === "object" && actionData !== null) {
			return actionData as ActionData;
		}

		return {};
	};

	const getSocialMediaUrl = (task: Task): string | null => {
		const parsedActionData = parseActionData(task.actionData);

		switch (task.type) {
			case "TWITTER_FOLLOW":
				return typeof parsedActionData.username === "string"
					? `https://twitter.com/${parsedActionData.username}`
					: null;
			case "TWITTER_QUOTE_RETWEET":
				return typeof parsedActionData.tweetId === "string"
					? `https://twitter.com/intent/retweet?tweet_id=${parsedActionData.tweetId}`
					: null;
			case "TELEGRAM_JOIN":
				return typeof parsedActionData.groupUsername === "string"
					? `https://t.me/${parsedActionData.groupUsername}`
					: null;
			default:
				return null;
		}
	};
	const requiresAdminVerification = (taskType: string): boolean => {
		// All tasks now auto-verify — no admin review needed
		return false;
	};

	const handleTaskStart = async (
		task: Task,
		telegramId: string,
		userId: string,
	) => {
		await startTaskMutation.mutateAsync({
			userId,
			telegramId,
			taskId: task.id,
		});
		const socialUrl = getSocialMediaUrl(task);
		if (socialUrl) {
			try {
				if ((task.type || "").startsWith("TELEGRAM")) {
					if (openTelegramLink.isAvailable()) {
						openTelegramLink(socialUrl);
					} else {
						window.open(socialUrl, "_blank");
					}
				} else {
					if (openLink.isAvailable()) {
						openLink(socialUrl, {
							tryBrowser: "chrome",
							tryInstantView: true,
						});
					} else {
						window.open(socialUrl, "_blank");
					}
				}
			} catch (e) {
				// Fallback: open in new tab if SDK not available
				window.open(socialUrl, "_blank");
			}
		}
	};

	useEffect(() => {
		refetchTasks();
	}, [
		startTaskMutation.isSuccess,
		verifyTaskMutation.isSuccess,
		claimTaskMutation.isSuccess,
	]);

	return {
		dailyTasks,
		isLoadingTasks,
		isTasksError,

		startTask: handleTaskStart,
		isStarting: startTaskMutation.isPending,
		isStartSuccess: startTaskMutation.isSuccess,
		startError: startTaskMutation.error,

		verifyTask: verifyTaskMutation.mutateAsync,
		isVerifying: verifyTaskMutation.isPending,
		isVerifySuccess: verifyTaskMutation.isSuccess,
		verifyError: verifyTaskMutation.error,

		claimRewards: claimTaskMutation.mutateAsync,
		isClaiming: claimTaskMutation.isPending,
		isClaimSuccess: claimTaskMutation.isSuccess,
		isClaimError: claimTaskMutation.error,

		requiresAdminVerification,
		getSocialMediaUrl,

		// Reset functions
		resetStartTask: startTaskMutation.reset,
		resetVerifyTask: verifyTaskMutation.reset,
	};
};
