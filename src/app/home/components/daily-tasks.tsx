"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Task = {
	id: string;
	title: string;
	vibePoints: number;
	joined: boolean;
};

const initialDailyTasks: Task[] = [
	{ id: "1", title: "Share a post on Twitter", vibePoints: 50, joined: false },
	{
		id: "2",
		title: "Comment on a community thread",
		vibePoints: 30,
		joined: true,
	},
	{
		id: "3",
		title: "Invite a friend to Octane Swap",
		vibePoints: 100,
		joined: false,
	},
	{
		id: "4",
		title: "Complete a swap on Octane",
		vibePoints: 75,
		joined: false,
	},
];

const DailyTasks: React.FC = () => {
	const [dailyTasks, setDailyTasks] = useState<Task[]>(initialDailyTasks);
	const { toast } = useToast();

	const handleJoinTask = (taskId: string) => {
		setDailyTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId ? { ...task, joined: !task.joined } : task,
			),
		);

		const task = dailyTasks.find((t) => t.id === taskId);
		if (task) {
			toast({
				title: task.joined ? "Task Uncompleted" : "Task Completed!",
				description: task.joined
					? `You've uncompleted "${task.title}". You can always do it later!`
					: `Great job! You've earned ${task.vibePoints} Vibe Points for completing "${task.title}".`,
				variant: task.joined ? "destructive" : "default",
			});
		}
	};

	const totalVibePoints = dailyTasks.reduce(
		(sum, task) => sum + task.vibePoints,
		0,
	);
	const earnedVibePoints = dailyTasks
		.filter((task) => task.joined)
		.reduce((sum, task) => sum + task.vibePoints, 0);
	const progressPercentage = (earnedVibePoints / totalVibePoints) * 100;

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
							{earnedVibePoints}/{totalVibePoints} VP
						</span>
					</div>
					<Progress value={progressPercentage} className="w-full" />
				</div>
				{dailyTasks.map((task) => (
					<Card
						key={task.id}
						className={`bg-card transition-colors ${
							task.joined ? "bg-primary/10" : ""
						}`}>
						<CardContent className="flex justify-between items-center p-4">
							<div className="space-y-1">
								<p className="text-card-foreground font-medium">{task.title}</p>
								<Badge variant="secondary" className="text-primary">
									+{task.vibePoints} VP
								</Badge>
							</div>
							<Button
								variant={task.joined ? "secondary" : "default"}
								size="sm"
								onClick={() => handleJoinTask(task.id)}
								className="min-w-[80px]">
								{task.joined ? (
									<>
										<CheckCircle2 className="w-4 h-4 mr-2" />
										Done
									</>
								) : (
									<>
										<Circle className="w-4 h-4 mr-2" />
										Do It
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				))}
			</CardContent>
		</Card>
	);
};

export default DailyTasks;
