import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "../use-toast";
import { Task, TaskCompletion } from "@prisma/client";
import { openLink } from "@telegram-apps/sdk-react";

interface TaskData {
	userId: string;
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
		mutationFn: async ({ userId, taskId }: TaskData) => {
			const { data } = await axios.post("/apis/user/tasks/verify", {
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
	const getSocialMediaUrl = (task: Task): string | null => {
		const actionData = task.actionData as { [key: string]: string };
		console.log({ actionData });
		switch (task.type) {
			case "TWITTER_FOLLOW":
				return `https://twitter.com/${actionData?.username}`;
			case "TWITTER_QUOTE_RETWEET":
				return `https://twitter.com/intent/retweet?tweet_id=${actionData?.tweetId}`;
			// case "YOUTUBE_SUBSCRIBE":
			// 	return `https://youtube.com/channel/${actionData?.channelId}`;
			// case "INSTAGRAM_FOLLOW":
			// 	return `https://instagram.com/${actionData?.username}`;
			case "TELEGRAM_JOIN":
				return `https://t.me/${actionData?.groupUsername}`;
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

	const handleTaskStart = async (task: Task, userId: string) => {
		await startTaskMutation.mutateAsync({ userId, taskId: task.id });
		const socialUrl = getSocialMediaUrl(task);
		console.log({ socialUrl });
		if (socialUrl) {
			openLink(`${socialUrl}`, {
				tryBrowser: "chrome",
				tryInstantView: true,
			});
		}
	};
	const handleVerifyTaskMutation = useMutation({
		mutationFn: async (data: { userId: string; taskId: String }) =>
			await axios.post("/apis/user/tasks/verify", data),

		onSuccess: () => {
			toast({
				title: "Starting task",
				description: "Your task is in progress",
			});
		},
	});

	return {
		startTask: handleTaskStart,
		isStarting: startTaskMutation.isPending,
		startError: startTaskMutation.error,

		verifyTask: verifyTaskMutation.mutateAsync,
		isVerifying: verifyTaskMutation.isPending,
		verifyError: verifyTaskMutation.error,

		requiresAdminVerification,
		getSocialMediaUrl,

		// Reset functions
		resetStartTask: startTaskMutation.reset,
		resetVerifyTask: verifyTaskMutation.reset,
	};
};

// GENERATE a header component with gsap on scrol, the with of the header should be reduced, and the the background colr to change from transparent to white.

// the navbar contains logo, navlinks, sign guest book botton.

// Once scroll, navlinks and sign guestbook should animate out(fade out) and replace buy a menubutton, whch onclick, extends the height of the navbar showing the vetical or column view of the navlinks and sign guestbook buttons.

// I am using nuxt js, typescript and gsap
