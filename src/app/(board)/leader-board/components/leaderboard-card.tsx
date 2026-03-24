import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useProfilePhoto } from "@/hooks/usePrrofilePics";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@telegram-apps/telegram-ui";
import type { User } from "@/db/types";
import { LocalUser } from "@/utils/types";

type LeaderboardEntry = {
	id: string;
	telegramId: Number;
	rank: number;
	telegramUsername: string;
	score: string | number;
	medal?: "gold" | "silver" | "bronze";
};

type LeaderboardProps = {
	count: string;
	topUsers: User[];
	userData: LocalUser;
};

const LeaderboardCard = ({ count, topUsers, userData }: LeaderboardProps) => {
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
					<UserRow
						entry={{
							id: userData.id,
							telegramUsername: userData.telegramUsername ?? "Anonymous",
							telegramId: Number(userData.telegramId),
							rank: Number(count),
							score: Number(userData.totalRewards!),
							medal:
								Number(count) === 0
									? "gold"
									: Number(count) === 1
									? "silver"
									: Number(count) === 2
									? "bronze"
									: undefined,
						}}
					/>
				</div>

				{/* Top Users Section */}
				<div>
					<div className="text-sm font-medium mb-2">TOP {topUsers.length}</div>
					<div className="space-y-2 max-h-[400px] overflow-y-auto">
						{topUsers.map((entry, i) => (
							<UserRow
								key={entry.id}
								entry={{
									id: entry.id,
									telegramUsername: entry.telegramUsername ?? "Anonymous",
									telegramId: Number(entry.telegramId),
									rank: i + 1,
									score: Number(entry.totalRewards),
									medal:
										i === 0
											? "gold"
											: i === 1
											? "silver"
											: i === 2
											? "bronze"
											: undefined,
								}}
							/>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default LeaderboardCard;

const UserRow = ({ entry }: { entry: LeaderboardEntry }) => {
	const { profilePhoto, isLoading: isPhotoLoading } = useProfilePhoto(
		entry.telegramId.toString(),
	);
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
	return (
		<div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
			<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
				{isPhotoLoading ? (
					<Skeleton className="w-10 h-10 rounded-full" />
				) : (
					<div className="flex items-center gap-1">
						<Avatar size={24} src={profilePhoto} alt={entry.telegramUsername} />
					</div>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{entry.telegramUsername}</p>
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
};
