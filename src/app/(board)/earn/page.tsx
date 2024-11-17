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

// <CardContent className="space-y-6">
// 	<div className="grid grid-cols-2 gap-4">
// 		<Card>
// 			<CardContent className="p-4">
// 				<p className="text-sm text-muted-foreground">pOCT Balance</p>
// 				<p className="text-2xl font-semibold">
// 					{userBalance.toFixed(2)} pOCT
// 				</p>
// 			</CardContent>
// 		</Card>
// 		<Card>
// 			<CardContent className="p-4">
// 				<p className="text-sm text-muted-foreground">Total pOCT Staked</p>
// 				<p className="text-2xl font-bold">
// 					{totalUserStakings.toFixed(2)} pOCT
// 				</p>
// 			</CardContent>
// 		</Card>
// 	</div>
// 	{currentPool && (
// 		<>
// 			<div>
// 				<div className="flex justify-between items-center mb-2">
// 					<span className="text-sm font-medium">Current APR</span>
// 					<Badge variant="secondary" className="text-primary">
// 						{currentPoolAPR.toFixed(2)}%{" "}
// 						<ArrowUpRight className="w-3 h-3 ml-1" />
// 					</Badge>
// 				</div>
// 				{isCurrentlyStaking ? (
// 					<p className="text-xs text-muted-foreground">
// 						Earning approximately {Number(userRewardPerSecond).toFixed(6)}{" "}
// 						pOCT per second
// 					</p>
// 				) : (
// 					<p className="text-xs text-muted-foreground">
// 						You are not currently participating in this pool
// 					</p>
// 				)}
// 			</div>

// 			<Separator />

// 			<div>
// 				<div className="flex justify-between items-center mb-2">
// 					<span className="text-sm font-medium">Pool Progress</span>
// 					<span className="text-sm font-medium">{TOTAL_POOL_SIZE} pOCT</span>
// 				</div>
// 				<div className="space-y-2">
// 					<Progress
// 						value={currentPoolStats?.progressPercentage}
// 						className="w-full"
// 					/>
// 					<div className="flex justify-between text-xs text-muted-foreground">
// 						<span>
// 							Mined: {currentPoolStats?.totalRewardsMinted.toLocaleString()}{" "}
// 							pOCT
// 						</span>
// 						<span>{currentPoolStats?.progressPercentage.toFixed(2)}%</span>
// 					</div>
// 				</div>
// 			</div>

// 			<div className="flex justify-center">
// 				{isCurrentlyStaking ? (
// 					<TooltipProvider>
// 						<Tooltip>
// 							<TooltipTrigger asChild>
// 								<span className="inline-block w-full">
// 									<Button disabled className="w-full">
// 										Currently Staking
// 									</Button>
// 								</span>
// 							</TooltipTrigger>
// 							<TooltipContent>
// 								<p>
// 									You must unstake from the current pool before staking in a
// 									new one
// 								</p>
// 							</TooltipContent>
// 						</Tooltip>
// 					</TooltipProvider>
// 				) : (
// 					<Button
// 						onClick={stake}
// 						disabled={isStaking || userBalance <= 0}
// 						className="w-full">
// 						{isStaking ? "Staking..." : "Stake All"}
// 					</Button>
// 				)}
// 			</div>
// 		</>
// 	)}

// 	{hasClaimableRewards && (
// 		<Dialog>
// 			<DialogTrigger asChild>
// 				<Button variant="outline" className="w-full">
// 					Claim Rewards
// 				</Button>
// 			</DialogTrigger>
// 			<DialogContent className="sm:max-w-[425px]">
// 				<DialogHeader>
// 					<DialogTitle>Your Staking Pools</DialogTitle>
// 					<DialogDescription>
// 						Here&apos;s a list of all your staking pools and their status.
// 					</DialogDescription>
// 				</DialogHeader>
// 				<div className="grid gap-4 py-4">
// 					{positionsInfo?.map((position) => (
// 						<Card key={position.id}>
// 							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// 								<CardTitle className="text-sm font-medium">
// 									{position.pool.poolName.replace(/_/g, " ")}
// 								</CardTitle>
// 								<Badge variant={position.isActive ? "default" : "secondary"}>
// 									{position.isActive ? (
// 										categoryIcons[position.pool.category]
// 									) : (
// 										<Check className="w-4 h-4" />
// 									)}
// 									{position.isActive ? position.pool.category : "Ended"}
// 								</Badge>
// 							</CardHeader>
// 							<CardContent>
// 								<div className="flex justify-between items-center mb-2">
// 									<span className="text-sm text-muted-foreground">
// 										Staked:
// 									</span>
// 									<span className="font-semibold">
// 										{Number(position.amount)} pOCT
// 									</span>
// 								</div>
// 								<div className="flex justify-between items-center mb-4">
// 									<span className="text-sm text-muted-foreground">
// 										Rewards:
// 									</span>
// 									<span className="font-semibold">
// 										{Number(position.rewards)} pOCT
// 									</span>
// 								</div>
// 								{(position.isEnded || Number(position.rewards) > 0) && (
// 									<Button
// 										onClick={() => claim({ poolId: position.poolId })}
// 										disabled={isClaiming}
// 										className="w-full">
// 										{isClaiming ? "Claiming..." : "Claim Rewards"}
// 										<ArrowRight className="w-4 h-4 ml-2" />
// 									</Button>
// 								)}
// 							</CardContent>
// 						</Card>
// 					))}
// 				</div>
// 			</DialogContent>
// 		</Dialog>
// 	)}

// 	{isStakeError && (
// 		<p className="text-red-500">Error: {stakeError?.message} Contact Admin</p>
// 	)}

// 	{/* {isStakeSuccess && (
// 				<p className="text-green-500">Staking successful!</p>
// 			)} */}

// 	{!currentPool && (
// 		<div className="text-center text-muted-foreground">
// 			<Info className="w-6 h-6 mx-auto mb-2" />
// 			<p>There are currently no active staking pools.</p>
// 			<p>
// 				Complete tasks, refer friends and accumulate points in order to get
// 				bigger share of the upcoming pool. Please check back later for new
// 				opportunities.
// 			</p>
// 		</div>
// 	)}
// </CardContent>;
