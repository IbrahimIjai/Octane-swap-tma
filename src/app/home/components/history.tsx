import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award } from "lucide-react";

type Task = {
	id: string;
	title: string;
	vibePoints: number;
	joined: number;
};

const dailyTasks: Task[] = [
	{
		id: "1",
		title: "Share a post on Twitter",
		vibePoints: 50,
		joined: 1686884993,
	},
	{
		id: "2",
		title: "Comment on a community thread",
		vibePoints: 30,
		joined: 1686555394,
	},
	{
		id: "3",
		title: "Invite a friend",
		vibePoints: 100,
		joined: 1686884993 - 86400 * 5,
	},
];

function formatRelativeTime(timestamp: number): string {
	const now = Math.floor(Date.now() / 1000);
	const diff = now - timestamp;

	const minute = 60;
	const hour = minute * 60;
	const day = hour * 24;
	const week = day * 7;

	if (diff < minute) {
		return "just now";
	} else if (diff < hour) {
		const minutes = Math.floor(diff / minute);
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	} else if (diff < day) {
		const hours = Math.floor(diff / hour);
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else if (diff < week) {
		const days = Math.floor(diff / day);
		return `${days} day${days > 1 ? "s" : ""} ago`;
	} else {
		const weeks = Math.floor(diff / week);
		return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
	}
}

function History() {
	return (
		<Card className="w-full max-w-2xl mx-auto mt-6">
			<CardHeader>
				<CardTitle className="text-2xl font-bold flex items-center gap-2">
					<Award className="w-6 h-6" />
					Rewards History
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{dailyTasks.map((task) => (
					<Card key={task.id} className="bg-card">
						<CardContent className="flex justify-between items-center p-4">
							<div className="space-y-1">
								<p className="text-card-foreground font-medium">{task.title}</p>
								<div className="flex items-center text-sm text-muted-foreground">
									<Clock className="w-4 h-4 mr-1" />
									{formatRelativeTime(task.joined)}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="text-primary">
									+{task.vibePoints}
								</Badge>
								<Button variant="outline" size="sm">
									pOCT
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</CardContent>
		</Card>
	);
}

export default History;
