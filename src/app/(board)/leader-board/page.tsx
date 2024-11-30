"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useUser } from "@/hooks/api/useUser";
import axios from "axios";
import LeaderboardCard from "./components/leaderboard-card";

type LeaderboardEntry = {
	id: string;
	rank: number;
	username: string;
	score: number;
	avatar?: string;
	medal?: "gold" | "silver" | "bronze";
};

type LeaderboardData = {
	currentUser: LeaderboardEntry;
	topUsers: LeaderboardEntry[];
};

async function fetchLeaderboard(userId: string): Promise<LeaderboardData> {
	const response = await axios.get<LeaderboardData>(
		`/apis/user/leader-board?userId=${userId}`,
	);
	return response.data;
}

const LeaderBoardPage = () => {
	const { userData, isUserLoading } = useUser();

	const {
		data,
		isLoading: isLeaderBoardLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["leaderboard", userData?.id],
		queryFn: () => fetchLeaderboard(userData?.id ?? ""),
		enabled: !!userData && !isUserLoading,
	});
	console.log({ data });

	if (isUserLoading || isLeaderBoardLoading) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<Skeleton className="w-full h-12 mb-4" />
					<Skeleton className="w-full h-24 mb-4" />
					<Skeleton className="w-full h-64" />
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<p className="text-red-500">Error: {error.message}</p>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<p>No data available</p>
				</CardContent>
			</Card>
		);
	}
	return (
		<div className="flex w-full pb-[120px]">
			<LeaderboardCard
				currentUser={data.currentUser}
				topUsers={data.topUsers}
			/>
		</div>
	);
};
export default LeaderBoardPage;
