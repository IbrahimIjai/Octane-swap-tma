"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {  LoaderCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Task, TaskCompletion } from "@prisma/client";
import { LocalUser } from "@/utils/types";
import { shareStory } from "@telegram-apps/sdk-react";
import { useTasks } from "@/hooks/api/useTasks";

const DailyTasks = ({
	userData,
	isUserLoading,
}: {
	userData: LocalUser | undefined;
	isUserLoading: boolean;
}) => {

	const {
		dailyTasks,
		isLoadingTasks,
		isTasksError,
		startTask,
		isStarting,
		startError,

		verifyTask,
		isVerifying,
		verifyError,

		claimRewards,
		isClaiming,
		isClaimError,

		requiresAdminVerification,
	} = useTasks();

	const taskCompletions = userData?.TaskCompletions;


	const totalPoints =
		dailyTasks?.reduce((sum, task) => sum + Number(task.points), 0) || 0;


	const earnedPoints =
		taskCompletions
			?.filter(
				(completion) =>
					completion.status === "COMPLETED" &&
					dailyTasks.some((dailyTask) => dailyTask.id === completion.task.id),
			)
			.reduce((sum, completion) => sum + Number(completion.task.points), 0) ||
		0;

	const progressPercentage = (earnedPoints / totalPoints) * 100;

	
	return (
		<Card className="w-full max-w-2xl mx-auto mt-8">
			<CardHeader>
				<CardTitle className="text-xl font-semibold flex items-center gap-2">
					<Trophy className="w-6 h-6 text-primary" />
					Daily Tasks
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="text-sm font-medium">Daily Progress</span>
						<span className="text-sm font-medium">
							{earnedPoints}/{totalPoints} Points
						</span>
					</div>
					<Progress value={progressPercentage} className="w-full" />
				</div>
				{dailyTasks?.map((task) => (
					<TaskRow key={task.id} task={task} userData={userData} />
				))}
			</CardContent>
		</Card>
	);
};

export default DailyTasks;

interface TaskRowProps {
	task: Task;
	userData: LocalUser | undefined;
}

const TaskRow = ({ task, userData }: TaskRowProps) => {
	const {
		startTask,
		isStarting,

		verifyTask,
		isVerifying,

		claimRewards,
		isClaiming,

		requiresAdminVerification,
		getSocialMediaUrl,
	} = useTasks();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const getTaskStatus = (taskId: string): TaskCompletion["status"] => {
		const completion = userData?.TaskCompletions?.find(
			(c) => c.taskId === taskId,
		);
		return completion?.status || "NOT_STARTED";
	};

	const taskCompletions = userData?.TaskCompletions;

	const isTaskCompleted = (taskId: string) => {
		const _task = taskCompletions?.find((task) => task.taskId === taskId);
		return _task && _task?.completed;
	};
	const isClaimed = (taskId: string) => {
		return userData?.Rewards.find((reward) => reward.taskId === taskId)
			?.claimed;
	};

	const sharePost = async () => {
		try {
			if (shareStory.isAvailable()) {
				await shareStory("https://octane-swap-tma.vercel.app/banner.png", {
					text: "Today is a good day to join the octane swap ecosystem",
				});
				toast({ title: "Story shared successfully!" });
			} else {
				toast({
					variant: "destructive",
					title: "Upgrade Required",
					description: "Please upgrade Telegram to share stories.",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description:
					"An error occurred while sharing the story. Please try again later.",
				variant: "destructive",
			});
		}
	};

	const handleTaskAction = async (task: Task) => {
		if (!userData) {
			toast({
				title: "Error",
				description: "Please log in to perform tasks.",
				variant: "destructive",
			});
			return;
		}

		const status = getTaskStatus(task.id);

		if (status === "NOT_STARTED" || status === "FAILED") {
			await startTask(task, userData?.telegramId ?? "", userData.id);
			await sharePost();
		} else if (status === "IN_PROGRESS") {
			await verifyTask({
				userId: userData.id,
				telegramId: userData.telegramId ?? "",
				taskId: task.id,
			});
		} else if (status === "COMPLETED") {
			// Implement claim logic here
			await claimRewards({
				userId: userData.id,
				telegramId: userData.telegramId ?? "",
				taskId: task.id,
			});
			toast({
				title: "Success",
				description: "Rewards claimed successfully!",
			});
			queryClient.invalidateQueries({ queryKey: ["user"] });
		}
	};

	

	const getButtonText = (task: Task) => {
		const status = getTaskStatus(task.id);
		switch (status) {
			case "NOT_STARTED":
				return "Share on story";
			case "FAILED":
				return "Retry";
			case "IN_PROGRESS":
				return requiresAdminVerification(task.type)
					? "Pending Verification"
					: "Verify";
			case "COMPLETED":
				return userData?.Rewards.find((r) => r.taskId === task.id)?.claimed
					? "Claimed" 
					: "Claim";
			default:
				return "Start";
		}
	};

	const trxLoading = isClaiming || isStarting || isVerifying;

	return (
		<Card
			key={task.id}
			className={`bg-card transition-colors ${
				isTaskCompleted(task.id) && "bg-primary/10"
			}`}>
			<CardContent className="flex justify-between items-center p-4">
				<div className="space-y-1">
					<p className="text-card-foreground font-medium">{task.title}</p>
					<Badge variant="secondary" className="text-primary">
						+{Number(task.points)} Points
					</Badge>
				</div>
				<Button
					disabled={isClaimed(task.id) ? true : false}
					onClick={() => handleTaskAction(task)}>
					{trxLoading && <LoaderCircle className="w-3 h-3 animate-spin mr-2" />}
					{getButtonText(task)}
				</Button>
			</CardContent>
		</Card>
	);
};
