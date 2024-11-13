"use client";

import { CheckCircle2, ChevronLeft, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type TaskType = "based" | "onchain" | "partner";

interface Task {
	id: string;
	title: string;
	points: number;
	completed: boolean;
	taskType: TaskType;
}

const initialTasks: Task[] = [
	{
		id: "1",
		title: "Share a post on Twitter",
		points: 50,
		completed: false,
		taskType: "based",
	},
	{
		id: "2",
		title: "Comment on a community thread",
		points: 30,
		completed: false,
		taskType: "based",
	},
	{
		id: "3",
		title: "Invite a friend to Octane Swap",
		points: 100,
		completed: false,
		taskType: "onchain",
	},
	{
		id: "4",
		title: "Complete a swap on Octane",
		points: 75,
		completed: false,
		taskType: "partner",
	},
];

export default function Earn() {
	const router = useRouter();
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState<TaskType>("based");

	const handleTaskCompletion = (taskId: string) => {
		setTasks((prevTasks) =>
			prevTasks.map((task) =>
				task.id === taskId ? { ...task, completed: !task.completed } : task,
			),
		);

		const task = tasks.find((t) => t.id === taskId);
		if (task) {
			toast({
				title: task.completed ? "Task Uncompleted" : "Task Completed!",
				description: task.completed
					? `You've uncompleted "${task.title}". You can always do it later!`
					: `Great job! You've earned ${task.points} Vibe Points for completing "${task.title}".`,
				variant: task.completed ? "destructive" : "default",
			});
		}
	};

	const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
	const earnedPoints = tasks
		.filter((task) => task.completed)
		.reduce((sum, task) => sum + task.points, 0);
	const progressPercentage = (earnedPoints / totalPoints) * 100;

	const TaskList = ({ tasks, type }: { tasks: Task[]; type: TaskType }) => (
		<div className="space-y-4">
			{tasks
				.filter((task) => task.taskType === type)
				.map((task) => (
					<Card
						key={task.id}
						className={`transition-colors ${
							task.completed ? "bg-primary/10" : "bg-card"
						}`}>
						<CardContent className="flex justify-between items-center p-4">
							<div className="space-y-1">
								<p className="text-card-foreground font-medium">{task.title}</p>
								<Badge variant="secondary" className="text-primary">
									+{task.points} pOCT
								</Badge>
							</div>
							<Button
								variant={task.completed ? "secondary" : "default"}
								size="sm"
								onClick={() => handleTaskCompletion(task.id)}
								className="min-w-[80px]">
								{task.completed ? (
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
		</div>
	);

	return (
		<div className="relative min-h-screen w-full p-4">
			<div
				className="flex items-center gap-2 mb-6 cursor-pointer"
				onClick={() => router.push("/home")}>
				<ChevronLeft className="w-6 h-6" />
				<p className="text-xl font-bold">Tasks</p>
			</div>

			<p className="text-2xl font-semibold text-start mb-8">
				COMPLETE TASKS AND EARN REWARDS
			</p>

			<div className="mt-6">
				<p className="text-sm text-muted-foreground">
					Progress: {earnedPoints}/{totalPoints} pOCT (
					{Math.round(progressPercentage)}%)
				</p>
			</div>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as TaskType)}
				className="w-full">
				<TabsList className="w-full">
					<TabsTrigger value="based" className="w-full">
						Based
					</TabsTrigger>
					<TabsTrigger value="onchain" className="w-full">
						OnChain
					</TabsTrigger>
					<TabsTrigger value="partner" className="w-full">
						Partners
					</TabsTrigger>
				</TabsList>

				<div className="mt-4">
					<TabsContent value="based">
						<TaskList tasks={tasks} type="based" />
					</TabsContent>
					<TabsContent value="onchain">
						<TaskList tasks={tasks} type="onchain" />
					</TabsContent>
					<TabsContent value="partner">
						<TaskList tasks={tasks} type="partner" />
					</TabsContent>
				</div>
			</Tabs>

			{/* Optional: Add progress indicator */}
		</div>
	);
}
