"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { CheckCircle } from "lucide-react";

interface TaskListProps {
	tasks: Task[];
	onJoin: (id: number) => void;
	onComplete: (id: number) => void;
	showCompleteButton: boolean;
}
interface Task {
	id: number;
	title: string;
	vibePoints: number;
	joined: boolean;
	completed: boolean;
}
const initialTasks: Task[] = [
	{
		id: 1,
		title: "Morning Meditation",
		vibePoints: 10,
		joined: false,
		completed: false,
	},
	{
		id: 2,
		title: "Daily Exercise",
		vibePoints: 15,
		joined: false,
		completed: false,
	},
	{
		id: 3,
		title: "Read a Chapter",
		vibePoints: 5,
		joined: false,
		completed: false,
	},
	{
		id: 4,
		title: "Healthy Meal Prep",
		vibePoints: 10,
		joined: false,
		completed: false,
	},
	{
		id: 5,
		title: "Connect with a Friend",
		vibePoints: 5,
		joined: false,
		completed: false,
	},
];
export default function TasksPanel() {
	const [tasks, setTasks] = useState(initialTasks);

	const handleJoinTask = (id: number) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, joined: !task.joined } : task,
			),
		);
	};

	const handleCompleteTask = (id: number) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, completed: true } : task,
			),
		);
	};

	const ongoingTasks = tasks.filter((task) => !task.completed);
	const completedTasks = tasks.filter((task) => task.completed);

	const TaskList: React.FC<TaskListProps> = ({
		tasks,
		onJoin,
		onComplete,
		showCompleteButton,
	}) => (
		<div className="space-y-4">
			{tasks.map((task) => (
				<Card key={task.id} className="bg-card">
					<CardContent className="flex justify-between items-center p-4">
						<div>
							<p className="text-card-foreground">{task.title}</p>
							<p className="text-primary font-semibold">
								+{task.vibePoints} VP
							</p>
						</div>
						<div className="space-x-2">
							{showCompleteButton && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => onComplete(task.id)}>
									<CheckCircle className="mr-2 h-4 w-4" />
									Complete
								</Button>
							)}
							<Button
								variant={task.joined ? "secondary" : "default"}
								size="sm"
								onClick={() => onJoin(task.id)}>
								{task.joined ? "Joined" : "Join"}
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	return (
		<div className="mt-8 relative">
			<Tabs defaultValue="account" className="w-full">
				<TabsList className="w-full flex justify-evenly">
					<TabsTrigger className="flex-1" value="Ongoing">
						Ongoing
					</TabsTrigger>
					<TabsTrigger className="flex-1" value="completed">
						Completed
					</TabsTrigger>
				</TabsList>
				<TabsContent value="Ongoing">
					<TaskList
						tasks={ongoingTasks}
						onJoin={handleJoinTask}
						onComplete={handleCompleteTask}
						showCompleteButton={true}
					/>
				</TabsContent>
				<TabsContent value="completed">
					<TaskList
						tasks={completedTasks}
						onJoin={handleJoinTask}
						onComplete={handleCompleteTask}
						showCompleteButton={false}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
