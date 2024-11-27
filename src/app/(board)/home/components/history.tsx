"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Award } from "lucide-react";
import { useUser } from "@/hooks/api/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { Reward } from "@prisma/client";

const REWARD_TYPE_LABELS: Record<string, string> = {
	WELCOME: "Welcome Bonus",
	TASK_COMPLETION: "Task Completion",
	REFERRAL: "Referral Reward",
	DAILY_CHECK_IN: "Daily Check-In",
	WEB3_INTERACTION: "Web3 Interaction",
};

function formatRelativeTime(timestamp: Date): string {
	const now = new Date();
	const date = new Date(timestamp);
	const diff = now.getTime() - date.getTime();

	const minute = 60 * 1000;
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
	const { userData } = useUser();

	const {
		data: rewardsData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["rewardHistory", userData?.id],
		queryFn: async () => {
			const response = await axios.get(
				`/apis/user/history?userId=${userData?.id}`,
			);
			return response.data.rewards as Reward[];
		},
		enabled: !!userData?.id,
	});

	if (isLoading) {
		return (
			<Card className="w-full max-w-2xl mx-auto mt-6">
				<CardHeader>
					<CardTitle className="text-2xl font-bold flex items-center gap-2">
						<Award className="w-6 h-6" />
						Rewards History
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{Array(4)
						.fill(null)
						.map((_, i) => (
							<div key={i}>
								<Skeleton className="w-full " />
								<Skeleton />
							</div>
						))}
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return <div>Error loading reward history. Please try again later.</div>;
	}

	return (
		<Card className="w-full max-w-2xl mx-auto mt-6">
			<CardHeader>
				<CardTitle className="text-2xl font-bold flex items-center gap-2">
					<Award className="w-6 h-6" />
					Rewards History
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{rewardsData && rewardsData.length > 0 ? (
					rewardsData.map((reward) => (
						<Card key={reward.id} className="bg-card">
							<CardContent className="flex justify-between items-center p-4">
								<div className="space-y-1">
									<p className="text-card-foreground font-medium">
										{REWARD_TYPE_LABELS[reward.type] || "Unknown Reward"}
									</p>
									<div className="flex items-center text-sm text-muted-foreground">
										<Clock className="w-4 h-4 mr-1" />
										{formatRelativeTime(reward.createdAt)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="text-primary">
										+{Number(reward.amount)}
									</Badge>
									<Button variant="outline" size="sm">
										pOCT
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<div className="text-center text-muted-foreground">
						No reward history available.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default History;
