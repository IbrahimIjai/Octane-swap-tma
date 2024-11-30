import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

type LeaderboardEntry = {
	id: string;
	rank: number;
	username: string;
	score: string | number;
	avatar?: string;
	medal?: "gold" | "silver" | "bronze";
};

type LeaderboardProps = {
	currentUser: LeaderboardEntry;
	topUsers: LeaderboardEntry[];
};

const LeaderboardCard = ({ currentUser, topUsers }: LeaderboardProps) => {
	const formatScore = (score: string | number): string => {
		const numScore = typeof score === "string" ? parseFloat(score) : score;
		if (numScore >= 1000000) {
			return `${(numScore / 1000000).toFixed(2)}M`;
		} else if (numScore >= 1000) {
			return `${(numScore / 1000).toFixed(1)}K`;
		}
		return numScore.toLocaleString();
	};

	const getMedalEmoji = (medal?: "gold" | "silver" | "bronze") => {
		switch (medal) {
			case "gold":
				return "🥇";
			case "silver":
				return "🥈";
			case "bronze":
				return "🥉";
			default:
				return null;
		}
	};

	const UserRow = ({ entry }: { entry: LeaderboardEntry }) => (
		<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
			<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
				{entry.avatar ? (
					<img
						src={entry.avatar}
						alt={entry.username}
						className="w-full h-full rounded-full"
					/>
				) : (
					<span className="text-primary">
						{entry.username.charAt(0).toUpperCase()}
					</span>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{entry.username}</p>
				<p className="text-xs text-muted-foreground">
					{formatScore(entry.score)} pOCT
				</p>
			</div>

			<div className="flex items-center gap-2">
				{getMedalEmoji(entry.medal)}
				<span className="text-sm text-muted-foreground">#{entry.rank}</span>
			</div>
		</div>
	);

	return (
		<Card className="w-full bg-background border-border mx-auto p-0">
			<CardHeader className="space-y-2 ">
				<div className="flex items-center justify-between px-3">
					<h2 className="text-xl font-bold">Leaderboard</h2>
					<Trophy className="w-6 h-6 text-yellow-500" />
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Current User Position */}
				<div className="bg-muted/30 rounded-lg p-4 border border-border">
					<div className="text-sm text-muted-foreground mb-2">
						Your Position
					</div>
					<UserRow entry={currentUser} />
				</div>

				{/* Top Users Section */}
				<div>
					<div className="text-sm font-medium mb-2">TOP {topUsers.length}</div>
					<div className="space-y-2 max-h-[400px] overflow-y-auto">
						{topUsers.map((entry) => (
							<UserRow key={entry.id} entry={entry} />
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LeaderboardCard;
