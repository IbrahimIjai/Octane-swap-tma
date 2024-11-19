"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Task } from "@prisma/client";

const taskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	points: z.number().min(1, "Points must be at least 1"),
	type: z.enum([
		"TWITTER",
		"TELEGRAM",
		"INVITE",
		"SHARE_POST",
		"TRADING",
		"BOOST_CHANNEL",
		"WEB3_INTERACTION",
		"DAILY_CHECK_IN",
	]),
	category: z.enum(["BASED", "ONCHAIN", "PARTNER"]),
	// action: z.enum([
	// 	"JOIN_TELEGRAM",
	// 	"SHARE_STORY",
	// 	"BOOST_CHANNEL",
	// 	"INVITE_FRIEND",
	// 	"CUSTOM",
	// ]),
	frequency: z.enum(["DAILY", "WEEKLY", "ONE_TIME"]),
	actionData: z.string().min(1, "Action data is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTaskManager() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const { toast } = useToast();

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			points: 0,
			type: "TWITTER",
			category: "BASED",
			// action: "CUSTOM",
			actionData: "",
		},
	});

	useEffect(() => {
		fetchTasks();
	}, []);

	const fetchTasks = async () => {
		try {
			const response = await axios.get<Task[]>("/apis/admin/tasks");
			const data = await response.data;
			setTasks(data);
		} catch (error) {
			console.error("Error fetching tasks:", error);
			toast({
				title: "Error",
				description: "Failed to fetch tasks. Please try again.",
				variant: "destructive",
			});
		}
	};

	const onSubmit = async (values: TaskFormValues) => {
		try {
			const url = editingTask
				? `/apis/admin/tasks/${editingTask.title}`
				: "/apis/admin/tasks";
			const method = editingTask ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			if (response.ok) {
				toast({
					title: editingTask ? "Task Updated" : "Task Created",
					description: `The task has been successfully ${
						editingTask ? "updated" : "created"
					}.`,
				});
				fetchTasks();
				form.reset();
				setEditingTask(null);
			} else {
				throw new Error("Failed to save task");
			}
		} catch (error) {
			console.error("Error saving task:", error);
			toast({
				title: "Error",
				description: "Failed to save task. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleEdit = (task: Task) => {
		setEditingTask(task);
		// form.reset(task);
	};

	const handleDelete = async (taskId: string) => {
		if (confirm("Are you sure you want to delete this task?")) {
			try {
				const response = await fetch(`/apis/admin/tasks/${taskId}`, {
					method: "DELETE",
				});

				if (response.ok) {
					toast({
						title: "Task Deleted",
						description: "The task has been successfully deleted.",
					});
					fetchTasks();
				} else {
					throw new Error("Failed to delete task");
				}
			} catch (error) {
				console.error("Error deleting task:", error);
				toast({
					title: "Error",
					description: "Failed to delete task. Please try again.",
					variant: "destructive",
				});
			}
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Admin Task Manager</h1>
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>{editingTask ? "Edit Task" : "Create New Task"}</CardTitle>
					<CardDescription>
						Fill in the details to {editingTask ? "update the" : "create a new"}{" "}
						task.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Enter task title" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="points"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Points</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) =>
													field.onChange(parseFloat(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select task type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="TWITTER">Twitter</SelectItem>
												<SelectItem value="TELEGRAM">Telegram</SelectItem>
												<SelectItem value="INVITE">Invite</SelectItem>
												<SelectItem value="SHARE_POST">Share Post</SelectItem>
												<SelectItem value="TRADING">Trading</SelectItem>
												<SelectItem value="BOOST_CHANNEL">
													Boost Channel
												</SelectItem>
												<SelectItem value="WEB3_INTERACTION">
													Web3 Interaction
												</SelectItem>
												<SelectItem value="DAILY_CHECK_IN">
													Daily Check-in
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select task category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="BASED">Based</SelectItem>
												<SelectItem value="ONCHAIN">OnChain</SelectItem>
												<SelectItem value="PARTNER">Partner</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="frequency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Frequency</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select task frequency" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="DAILY">Daily</SelectItem>
												<SelectItem value="WEEKLY">Weekly</SelectItem>
												<SelectItem value="ONE_TIME">One Time</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="actionData"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Action Data</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter action data (e.g., Telegram group link)"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Specific data required for the task (e.g., Telegram group
											link, Twitter post URL)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">
								{editingTask ? "Update Task" : "Create Task"}
							</Button>
							{editingTask && (
								<Button
									type="button"
									variant="outline"
									className="ml-2"
									onClick={() => {
										setEditingTask(null);
										form.reset();
									}}>
									Cancel Edit
								</Button>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Existing Tasks</CardTitle>
					<CardDescription>
						Manage and edit your existing tasks.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Points</TableHead>
								<TableHead>Frequency</TableHead>
								<TableHead>Manage</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tasks.map((task) => (
								<TableRow key={task.title}>
									<TableCell>{task.title}</TableCell>
									<TableCell>{task.type}</TableCell>
									<TableCell>{task.category}</TableCell>
									<TableCell>{Number(task.points).toFixed(2)}</TableCell>
									<TableCell>{task.frequency}</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEdit(task)}>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(task.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
