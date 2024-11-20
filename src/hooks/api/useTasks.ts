import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "../use-toast";

export const useTasks = () => {
	const { toast } = useToast();
	const handleStartTaskMutation = useMutation({
		mutationFn: async (data: { userId: string; taskId: String }) =>
			await axios.post("/apis/user/tasks/start", data),
		onSuccess: () => {
			toast({
				title: "Starting task",
				description: "Your task is in progress",
			});
		},
	});

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
		startTask: handleStartTaskMutation.mutateAsync,
		isStartTaskPending: handleStartTaskMutation.isPending,
		isStartTaskError: handleStartTaskMutation.isError,

		verifyTask: handleVerifyTaskMutation.mutateAsync,
		isVerifyTaskPending: handleVerifyTaskMutation.mutateAsync,
		isVerifyTaskError: handleVerifyTaskMutation.isError,
	};
};
