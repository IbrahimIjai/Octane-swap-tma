"use client";

import React, { useState } from "react";
import { Users, Copy, ArrowRight, Share2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// types
interface Tier {
	level: number;
	name: string;
	requiredPoints: number;
	reward: string;
	color?: string;
}

interface ReferralStats {
	activeReferrals: number;
	totalInvites: number;
	rewardsEarned: number;
	currentPoints: number;
}

// constants
const TIERS: Tier[] = [
	{
		level: 1,
		name: "Bronze",
		requiredPoints: 1000,
		reward: "5% Fee Reduction",
		color: "from-amber-500 to-amber-600",
	},
	{
		level: 2,
		name: "Silver",
		requiredPoints: 2500,
		reward: "10% Fee Reduction",
		color: "from-slate-300 to-slate-400",
	},
	{
		level: 3,
		name: "Gold",
		requiredPoints: 5000,
		reward: "15% Fee Reduction",
		color: "from-yellow-400 to-yellow-500",
	},
	{
		level: 4,
		name: "Platinum",
		requiredPoints: 10000,
		reward: "20% Fee Reduction",
		color: "from-cyan-400 to-cyan-500",
	},
	{
		level: 5,
		name: "Diamond",
		requiredPoints: 20000,
		reward: "25% Fee Reduction",
		color: "from-violet-400 to-violet-500",
	},
];

const FriendsAndReferral = () => {
	const [referralLink] = useState("https://t.me/YourDexBot?start=ref123");
	const [stats, setStats] = useState<ReferralStats>({
		activeReferrals: 12,
		totalInvites: 15,
		rewardsEarned: 500,
		currentPoints: 2800,
	});
	const [friends] = useState([
		{
			id: 1,
			username: "alice_trader",
			points: 429,
			date: "2024-11-11T23:35:00Z",
			status: "Received",
		},
		{
			id: 2,
			username: "bob_defi",
			points: 970,
			date: "2024-11-11T22:25:00Z",
			status: "Pending",
		},
	]);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(referralLink);
			// You could add a toast notification here
		} catch (err) {
			console.error("Failed to copy link:", err);
		}
	};

	const getCurrentTier = (points: number): Tier => {
		return TIERS.reduce(
			(acc, tier) => (points >= tier.requiredPoints ? tier : acc),
			TIERS[0],
		);
	};

	const getNextTier = (currentTier: Tier): Tier | null => {
		const nextIndex = TIERS.findIndex((t) => t.level === currentTier.level) + 1;
		return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
	};

	const getProgress = (points: number): number => {
		const currentTier = getCurrentTier(points);
		const nextTier = getNextTier(currentTier);
		if (!nextTier) return 100;

		const baseline = currentTier.requiredPoints;
		const target = nextTier.requiredPoints;
		return Math.min(((points - baseline) / (target - baseline)) * 100, 100);
	};

	const currentTier = getCurrentTier(stats.currentPoints);
	const nextTier = getNextTier(currentTier);
	return (
		<div className="space-y-6 max-w-md mx-auto p-4">
			{/* Tier Progress */}
			<Card className="  text-white">
				<CardHeader className="pb-2">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg font-medium">Your Progress</CardTitle>
						<Badge
							variant="outline"
							className={`bg-gradient-to-r ${currentTier.color} border-none`}>
							{currentTier.name}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Points Display */}
					<div className="text-center pt-2">
						<span className="text-3xl font-bold">
							{stats.currentPoints.toLocaleString()}
						</span>
						<span className="text-sm text-gray-400 ml-2">points</span>
					</div>

					{/* Progress Bar */}
					<div className="relative">
						<div className="h-2 bg-gray-700 rounded-full">
							<div
								className={`h-full rounded-full bg-gradient-to-r ${currentTier.color} transition-all duration-500`}
								style={{ width: `${getProgress(stats.currentPoints)}%` }}
							/>
						</div>

						{/* Next Tier Info */}
						{nextTier && (
							<div className="mt-2 flex justify-between text-xs text-gray-400">
								<span>Current: {currentTier.name}</span>
								<span>
									Next: {nextTier.name} (
									{nextTier.requiredPoints - stats.currentPoints} points needed)
								</span>
							</div>
						)}
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-3 gap-3 pt-2">
						<div className="bg-gray-800/50 rounded-lg p-3 text-center">
							<Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
							<div className="text-xs text-gray-400">Active</div>
							<div className="text-sm font-semibold">
								{stats.activeReferrals}
							</div>
						</div>
						<div className="bg-gray-800/50 rounded-lg p-3 text-center">
							<Share2 className="w-5 h-5 mx-auto mb-1 text-blue-400" />
							<div className="text-xs text-gray-400">Total</div>
							<div className="text-sm font-semibold">{stats.totalInvites}</div>
						</div>
						<div className="bg-gray-800/50 rounded-lg p-3 text-center">
							<Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
							<div className="text-xs text-gray-400">Earned</div>
							<div className="text-sm font-semibold">
								${stats.rewardsEarned}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Rewards Info */}
			<Card className="bg-card">
				<CardHeader>
					<CardTitle className="text-card-foreground">
						More Friends, More Rewards
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<p className="text-muted-foreground text-center">
							Join us in building a safer, stronger Octane Swap community! Every
							friend you invite helps strengthen our ecosystem.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-muted rounded-lg border border-border">
								<div className="flex items-center space-x-2 mb-2 p-4">
									<Users size={20} className="text-primary" />
									<span className="font-semibold text-card-foreground">
										Community Benefits
									</span>
								</div>
								<ul className="text-sm text-muted-foreground space-y-2 px-4 pb-4">
									<li className="flex items-center space-x-2">
										<div className="w-1 h-1 bg-primary rounded-full"></div>
										<span>Enhanced liquidity and trading volume</span>
									</li>
									<li className="flex items-center space-x-2">
										<div className="w-1 h-1 bg-primary rounded-full"></div>
										<span>Stronger security through wider participation</span>
									</li>
									<li className="flex items-center space-x-2">
										<div className="w-1 h-1 bg-primary rounded-full"></div>
										<span>Better price stability</span>
									</li>
								</ul>
							</div>

							<div className="bg-muted rounded-lg border border-border">
								<div className="flex items-center space-x-2 mb-2 p-4">
									<Trophy size={20} className="text-secondary" />
									<span className="font-semibold text-card-foreground">
										Your Rewards
									</span>
								</div>
								<div className="space-y-3 px-4 pb-4">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											First 5 Active Friends
										</span>
										<Badge
											variant="outline"
											className="bg-primary/10 text-primary border-primary">
											+5000 points
										</Badge>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Next 10 Active Friends
										</span>
										<Badge
											variant="outline"
											className="bg-secondary/10 text-secondary border-secondary">
											+10000 points
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground italic mt-2">
										*Active friends are those who complete at least one swap
									</p>
								</div>
							</div>
						</div>

						<Alert className="bg-muted border-primary/20">
							<AlertDescription className="text-sm text-center text-yellow-300">
								Together, we&apos;re building a healthier, more secure DeFi
								ecosystem. Every new member strengthens our community&apos;s
								safety and stability.
							</AlertDescription>
						</Alert>
					</div>
				</CardContent>
			</Card>

			{/* Invite Link */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between bg-gray-50 p-3 rounded">
						<div className="text-sm text-gray-600 overflow-hidden overflow-ellipsis">
							{referralLink}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopyLink}
							className="ml-2">
							<Copy size={16} />
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Friends List */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Invited Friends</CardTitle>
					<div className="text-sm text-gray-500">{friends.length} users</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{friends.map((friend) => (
							<div
								key={friend.id}
								className="flex items-center justify-between p-2 border-b">
								<div className="flex items-center space-x-3">
									<div className="bg-gray-200 p-2 rounded-full">
										<Users size={16} />
									</div>
									<div>
										<div className="font-medium">{friend.username}</div>
										<div className="text-sm text-gray-500">
											{new Date(friend.date).toLocaleString()}
										</div>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<span
										className={`text-sm ${
											friend.status === "Received"
												? "text-green-500"
												: "text-yellow-500"
										}`}>
										+{friend.points} PAWS
									</span>
									<span className="text-xs text-gray-500">{friend.status}</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Main Invite Button */}
			<Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
				Invite Friends
				<ArrowRight className="ml-2" size={16} />
			</Button>
		</div>
	);
};

export default FriendsAndReferral;
