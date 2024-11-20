"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface TwitterTask {
	id: string;
	title: string;
	points: number;
	type: "TWITTER_FOLLOW" | "TWITTER_QUOTE_RETWEET";
	actionData: { username?: string; tweetId?: string };
	completions: {
		id: string;
		status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
		user: {
			id: string;
			twitterUsername: string;
		};
	}[];
}

export default function AdminTwitterTasks() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [filter, setFilter] = useState<
		"ALL" | "TWITTER_FOLLOW" | "TWITTER_QUOTE_RETWEET"
	>("ALL");

	const {
		data: tasks,
		isLoading,
		isError,
	} = useQuery<TwitterTask[]>({
		queryKey: ["adminTwitterTasks", filter],
		queryFn: async () => {
			const res = await axios.get(`/api/admin/tasks/twitter?filter=${filter}`);
			return res.data;
		},
	});

	const verifyMutation = useMutation({
		mutationFn: ({
			taskId,
			userId,
			status,
		}: {
			taskId: string;
			userId: string;
			status: "COMPLETED" | "FAILED";
		}) =>
			axios.post(`/api/admin/tasks/twitter/${taskId}`, {
				userId,
				status,
			}),
		onSuccess: () => {
			// queryClient.invalidateQueries(["adminTwitterTasks"]);
			toast({
				title: "Task Updated",
				description: "The task status has been updated successfully.",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update task status. Please try again.",
				variant: "destructive",
			});
		},
	});

	if (isLoading) return <div>Loading tasks...</div>;
	if (isError) return <div>Error loading tasks</div>;

	const filteredTasks =
		filter === "ALL" ? tasks : tasks?.filter((task) => task.type === filter);

	return (
		<Card className="w-full max-w-4xl mx-auto mt-8">
			<CardHeader>
				<div className="flex justify-between items-center">
					<CardTitle className="text-2xl font-semibold">
						Admin Twitter Tasks
					</CardTitle>
					<Select
						onValueChange={(
							value: "ALL" | "TWITTER_FOLLOW" | "TWITTER_QUOTE_RETWEET",
						) => setFilter(value)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter tasks" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Tasks</SelectItem>
							<SelectItem value="TWITTER_FOLLOW">Follow Tasks</SelectItem>
							<SelectItem value="TWITTER_QUOTE_RETWEET">
								Quote Retweet Tasks
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Task</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Points</TableHead>
							<TableHead>User</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTasks?.flatMap((task) =>
							task.completions.map((completion) => (
								<TableRow key={`${task.id}-${completion.id}`}>
									<TableCell>{task.title}</TableCell>
									<TableCell>{task.type}</TableCell>
									<TableCell>{task.points}</TableCell>
									<TableCell>{completion.user.twitterUsername}</TableCell>
									<TableCell>
										<Badge
											variant={
												completion.status === "COMPLETED"
													? "default"
													: "secondary"
											}>
											{completion.status}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => {
													const url =
														task.type === "TWITTER_FOLLOW"
															? `https://twitter.com/${task.actionData.username}`
															: `https://twitter.com/${completion.user.twitterUsername}/status/${task.actionData.tweetId}`;
													window.open(url, "_blank");
												}}>
												<ExternalLink className="w-4 h-4 mr-2" />
												Check
											</Button>
											<Button
												size="sm"
												variant="default"
												onClick={() =>
													verifyMutation.mutate({
														taskId: task.id,
														userId: completion.user.id,
														status: "COMPLETED",
													})
												}
												disabled={completion.status === "COMPLETED"}>
												<CheckCircle className="w-4 h-4 mr-2" />
												Verify
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() =>
													verifyMutation.mutate({
														taskId: task.id,
														userId: completion.user.id,
														status: "FAILED",
													})
												}
												disabled={completion.status === "FAILED"}>
												<XCircle className="w-4 h-4 mr-2" />
												Fail
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)),
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
