import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "../use-toast";
import { Task, TaskCompletion } from "@prisma/client";
import { openLink } from "@telegram-apps/sdk-react";
import { ActionData } from "@/lib/types";
import { JsonValue } from "@prisma/client/runtime/library";
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
		onSuccess: (data, variables) => {
			toast({
				title: "Task Started",
				description: "Your task is now in progress",
			});
			invalidateTaskQueries();
		},
		onError: handleError,
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
		onSuccess: (data) => {
			toast({
				title: "Task Verified",
				description: data.message || "Task completed successfully!",
			});
			invalidateTaskQueries();
		},
		onError: handleError,
	});

	const claimTaskMutation = useMutation({
		mutationFn: async ({ userId, taskId }: TaskData) => {
			const { data } = await axios.post("/apis/user/tasks/claim", {
				userId,
				taskId,
			});
			return data;
		},
		onSuccess: (data) => {
			toast({
				title: "Task Verified",
				description: data.message || "Task completed successfully!",
			});
			invalidateTaskQueries();
		},
		onError: handleError,
	});

	// Helper function to get social media URL
	const parseActionData = (actionData: JsonValue | null): ActionData => {
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
		return [
			"TWITTER_FOLLOW",
			"TWITTER_QUOTE_RETWEET",
			// "YOUTUBE_SUBSCRIBE",
			// "INSTAGRAM_FOLLOW",
		].includes(taskType);
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
			openLink(`${socialUrl}`, {
				tryBrowser: "chrome",
				tryInstantView: true,
			});
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
		isStartuccess: startTaskMutation.isSuccess,
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
