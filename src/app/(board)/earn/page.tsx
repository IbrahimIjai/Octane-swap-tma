"use client";

import {
	CheckCircle2,
	ChevronLeft,
	LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// PRISMA: import { Task, TaskCategory, TaskCompletion } from "@prisma/client";
import type { Task, TaskCategory, TaskCompletion } from "@/db/types";
import { useUser } from "@/hooks/api/useUser";
import { useTasks } from "@/hooks/api/useTasks";

export default function Earn() {
	const router = useRouter();
	const [tasks, setTasks] = useState<Task[]>([]);
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("based");
	const queryClient = useQueryClient();
	const {
		isUserReady,
		authDate,
		//fns
		isStaking,
		userData,
		telegramId,
		isUserLoading,
		isFetchingUserSuccess,
		userError,
		isUserError,
		refetchUser,
	} = useUser();

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

	const {
		data: alltasks,
		isLoading,
		isSuccess,
		isError,
		refetch: refetchTask,
	} = useQuery({
		queryFn: async () => {
			const res = await axios.get<Task[]>("/apis/admin/tasks");
			return res.data;
		},
		queryKey: ["tasks"],
	});

	const taskToDisplay = alltasks?.filter((task) => task.frequency !== "DAILY");

	const totalPoints =
		taskToDisplay?.reduce((sum, task) => sum + Number(task.points), 0) || 0;
	const earnedPoints =
		userData?.TaskCompletions?.filter(
			(completion) =>
				completion.status === "COMPLETED" &&
				taskToDisplay?.some((dailyTask) => dailyTask.id === completion.task.id),
		).reduce((sum, completion) => sum + Number(completion.task.points), 0) || 0;

	const progressPercentage = (earnedPoints / totalPoints) * 100;

	const TaskList = ({ tasks, type }: { tasks: Task[]; type: TaskCategory }) => (
		<div className="space-y-4">
			{tasks
				.filter((task) => task.category === type)
				.filter((task) => task.frequency !== "DAILY")
				.map((task) => (
					<TaskRow
						key={task.id}
						task={task}
						// userData={userData}
						// telegramId={telegramId}
					/>
				))}
		</div>
	);

	return (
		<div className="relative min-h-screen w-full pb-[120px]">
			<div
				className="flex items-center gap-2 mb-6 cursor-pointer"
				onClick={() => router.push("/home")}>
				<ChevronLeft className="w-6 h-6" />
				<p className="text-xl font-bold">Tasks</p>
			</div>

			<p className="text-2xl font-semibold text-start mb-8">
				COMPLETE TASKS AND EARN REWARDS
			</p>

			<div className="my-6">
				<p className="text-sm text-muted-foreground">
					Progress: {earnedPoints}/{totalPoints} pOCT (
					{Math.round(progressPercentage)}%)
				</p>
			</div>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as TaskCategory)}
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

				<div className="my-2">
					<TabsContent value="based">
						<TaskList tasks={alltasks ?? []} type="BASED" />
					</TabsContent>
					<TabsContent value="onchain">
						<TaskList tasks={alltasks ?? []} type="ONCHAIN" />
					</TabsContent>
					<TabsContent value="partner">
						<TaskList tasks={alltasks ?? []} type="PARTNER" />
					</TabsContent>
				</div>
			</Tabs>

			{/* Optional: Add progress indicator */}
		</div>
	);
}

interface TaskRowProps {
	task: Task;
	// userData: LocalUser | undefined;
	// telegramId: string;
}

const TaskRow = ({ task }: TaskRowProps) => {
	const {
		startTask,
		isStarting,
		isStartSuccess,

		verifyTask,
		isVerifying,
		isVerifySuccess,

		claimRewards,
		isClaiming,
		isClaimSuccess,

		requiresAdminVerification,
		getSocialMediaUrl,
	} = useTasks();
	const {
		userData,
		telegramId,
		isUserLoading,
		refetchUser,
	} = useUser();

	useEffect(() => {
		refetchUser();
	}, [isStartSuccess, isVerifySuccess, isClaimSuccess]);

	const { toast } = useToast();
	const queryClient = useQueryClient();

	const getTaskStatus = (taskId: string): TaskCompletion["status"] => {
		const completion = userData?.TaskCompletions?.find(
			(c) => c.taskId === taskId,
		);
		return completion?.status || "NOT_STARTED";
	};

	const isTaskCompletedAndClaimed = (taskId: string) => {
		const completion = userData?.TaskCompletions?.find((t) => t.taskId === taskId);
		if (!completion || completion.status !== "COMPLETED") return false;
		const reward = userData?.Rewards?.find((r) => r.taskId === taskId);
		return reward?.claimed !== null && reward?.claimed !== undefined;
	};

	const getButtonText = (task: Task) => {
		const status = getTaskStatus(task.id);
		switch (status) {
			case "NOT_STARTED":
				return "Start";
			case "FAILED":
				return "Retry";
			case "IN_PROGRESS":
				return "Verify";
			case "COMPLETED":
				return isTaskCompletedAndClaimed(task.id) ? "Claimed" : "Claim";
			default:
				return "Start";
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

		try {
			if (status === "NOT_STARTED" || status === "FAILED") {
				// startTask already opens the social media URL via useTasks hook
				await startTask(task, telegramId, userData.id);
				queryClient.invalidateQueries({ queryKey: ["user"] });
			} else if (status === "IN_PROGRESS") {
				await verifyTask({
					userId: userData.id,
					telegramId,
					taskId: task.id,
				});
				queryClient.invalidateQueries({ queryKey: ["user"] });
			} else if (status === "COMPLETED") {
				if (isTaskCompletedAndClaimed(task.id)) return; // Already claimed
				await claimRewards({
					userId: userData.id,
					telegramId: userData.telegramId ?? "",
					taskId: task.id,
				});
				queryClient.invalidateQueries({ queryKey: ["user"] });
			}
		} catch (error) {
			console.error("Task action failed:", error);
		}
	};

	const trxLoading = isClaiming || isStarting || isVerifying;
	const status = getTaskStatus(task.id);
	const isClaimed = isTaskCompletedAndClaimed(task.id);

	return (
		<Card
			key={task.id}
			className={`transition-colors border ${
				isClaimed ? "bg-primary/10" : "bg-card"
			} `}>
			<CardContent className="flex justify-between items-center p-4">
				<div className="space-y-1">
					<p className="text-card-foreground font-medium">{task.title}</p>
					<Badge variant="secondary" className="text-primary">
						+{Number(task.points)} pOCT
					</Badge>
				</div>
				<Button
					onClick={() => handleTaskAction(task)}
					disabled={trxLoading || isClaimed}
					variant={isClaimed ? "outline" : "default"}>
					{trxLoading && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
					{!trxLoading && isClaimed && <CheckCircle2 className="w-4 h-4 mr-2" />}
					{getButtonText(task)}
				</Button>
			</CardContent>
		</Card>
	);
};
