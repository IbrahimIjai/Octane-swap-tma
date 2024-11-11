"use client"


import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";


type Task = {
	id: string;
	title: string;
	vibePoints: number;
	joined: boolean;
};

const dailyTasks: Task[] = [
	{ id: "1", title: "Share a post on Twitter", vibePoints: 50, joined: false },
	{
		id: "2",
		title: "Comment on a community thread",
		vibePoints: 30,
		joined: true,
	},
	{
		id: "3",
		title: "Invite a friend to CatchVibe",
		vibePoints: 100,
		joined: false,
	},
	{
		id: "4",
		title: "Complete a quiz about Web3",
		vibePoints: 75,
		joined: false,
	},
	{
		id: "5",
		title: "Participate in a voice chat",
		vibePoints: 60,
		joined: true,
	},
];



const DailyTasks: React.FC = () => {
	const router = useRouter();

	const handleJoinTask = (taskId: string) => {
		console.log(`Joined task with id: ${taskId}`);
		// Here you would typically update the task status in your state or backend
	};

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Daily Tasks</h2>
			{dailyTasks.map((task) => (
				<Card key={task.id} className="bg-card">
					<CardContent className="flex justify-between items-center p-4">
						<div>
							<p className="text-card-foreground">{task.title}</p>
							<p className="text-primary font-semibold">+{task.vibePoints} VP</p>
						</div>
						<Button
							variant={task.joined ? "secondary" : "default"}
							onClick={() => handleJoinTask(task.id)}>
							{task.joined ? "Joined" : "Join"}
						</Button>
					</CardContent>
				</Card>
			))}
			<Button
				variant="outline"
				className="w-full"
				onClick={() => router.push("/tasks")}>
				See All Tasks
			</Button>
		</div>
	);
};

export default DailyTasks;