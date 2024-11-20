"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Task } from "@prisma/client";
import { LocalUser } from "@/utils/types";
import { shareStory } from "@telegram-apps/sdk-react";

const DailyTasks = ({
	userData,
	isUserLoading,
}: {
	userData: LocalUser | undefined;
	isUserLoading: boolean;
}) => {
	const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
	const { toast } = useToast();
	const {
		data: alltasks,
		isLoading,
		isSuccess,
		isError,
	} = useQuery({
		queryFn: async () => {
			const res = await axios.get<Task[]>("/apis/admin/tasks");
			return res.data;
		},
		queryKey: ["tasks"],
	});
	console.log({ alltasks });
	console.log({ dailyTasks });
	useEffect(() => {
		const _dailyTasks: Task[] = alltasks?.length
			? alltasks.filter((task) => task.frequency === "DAILY")
			: [];
		setDailyTasks(_dailyTasks);
	}, [alltasks, isLoading, isSuccess]);

	const rewards = userData?.Rewards;
	const taskCompletions = userData?.TaskCompletions;

	const handleJoinTask = (taskId: string) => {};

	const startTaskMutation = useMutation({
		mutationFn: (taskId: string) => axios.post("/api/tasks/start", { taskId }),
		onSuccess: () => {
			//   queryClient.invalidateQueries(['tasks'])
		},
	});

	const verifyTaskMutation = useMutation({
		mutationFn: (taskId: string) => axios.post("/api/tasks/verify", { taskId }),
		onSuccess: (data, variables) => {
			toast({
				title:
					data.data.status === "COMPLETED" ? "Task Completed!" : "Task Failed",
				description:
					data.data.status === "COMPLETED"
						? `Great job! You've completed. Claim your reward now!`
						: `Verification failed. Please try again.`,
				variant: data.data.status === "COMPLETED" ? "default" : "destructive",
			});
		},
	});

	const claimRewardMutation = useMutation({
		mutationFn: (taskId: string) =>
			axios.post("/api/rewards/claim", { taskId }),
		onSuccess: (data, variables) => {
			toast({
				title: "Reward Claimed!",
				description: `You've successfully claimed points for completing a task.`,
				variant: "default",
			});
		},
	});

	//   const handleTaskAction = (task: Task) => {
	//     if (task.status === 'NOT_STARTED') {
	//       startTaskMutation.mutate(task.id)
	//     } else if (task.status === 'IN_PROGRESS') {
	//       verifyTaskMutation.mutate(task.id)
	//     } else if (task.status === 'COMPLETED' && !task.rewardClaimed) {
	//       claimRewardMutation.mutate(task.id)
	//     }
	//   }

	//   if (isLoading) return <div>Loading tasks...</div>
	//   if (isError) return <div>Error loading tasks</div>

	//   const totalPoints = tasks?.reduce((sum, task) => sum + task.points, 0) || 0
	//   const earnedPoints = tasks?.filter(task => task.status === 'COMPLETED' && task.rewardClaimed).reduce((sum, task) => sum + task.points, 0) || 0
	//   const progressPercentage = (earnedPoints / totalPoints) * 100

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

	const isTaskCompleted = (taskId: string) => {
		return (
			taskCompletions?.find((task) => task.taskId === taskId)?.completed !==
			null
		);
	};
	const isClaimed = (taskId: string) => {
		return userData?.Rewards.find((reward) => reward.taskId === taskId)
			?.claimed;
	};

	return (
		<Card className="w-full max-w-2xl mx-auto mt-8">
			<CardHeader>
				<CardTitle className="text-2xl font-semibold flex items-center gap-2">
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
							{isTaskCompleted(task.id) && (
								<Button
									disabled={isClaimed(task.id) ? true : false}
									onClick={() => claimRewardMutation.mutate(task.id)}>
									{isClaimed(task.id) ? (
										<>
											<CheckCircle2 className="w-4 h-4 mr-2" />
											Claimed
										</>
									) : (
										<>
											<Circle className="w-4 h-4 mr-2" />
											Claim
										</>
									)}
								</Button>
							)}
						</CardContent>
					</Card>
				))}
				<Card
					className={`bg-card transition-colors 
						
					`}>
					<CardContent className="flex justify-between items-center p-4">
						<div className="space-y-1">
							<p className="text-card-foreground font-medium">
								Share octaneswap on your story
							</p>
							<Badge variant="secondary" className="text-primary">
								+100 Points
							</Badge>
						</div>
						<Button
							onClick={() =>
								shareStory("https://my.media/background.png", {
									text: "Today was a good day. Love it! Thanks to this public!",
									widgetLink: {
										url: "https://t.me/heyqbnk",
										name: "heyqbnk public group",
									},
								})
							}>
							Share on story
						</Button>
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
};

export default DailyTasks;
