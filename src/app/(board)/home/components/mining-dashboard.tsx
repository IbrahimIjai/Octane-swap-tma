"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Pickaxe, Coins } from "lucide-react";
import OctaneSwapLogo from "@/components/logo";
import { User } from "@prisma/client";
import { useUserStake } from "@/hooks/api/useUserStakeFn";

interface MiningStats {
	totalStakable: number;
	totalStaked: number;
	currentAPR: number;
	totalPool: number;
	minedAmount: number;
	isStaked: boolean;
}

function MiningDashboard({ user }: { user: User }) {
	const { stake, isStaking, isStakeSuccess, isStakeError, stakeError } =
		useUserStake({ user });

	const [stats, setStats] = useState<MiningStats>({
		totalStakable: 1000,
		totalStaked: 0,
		currentAPR: 12.5,
		totalPool: 1000000,
		minedAmount: 250000,
		isStaked: false,
	});

	const handleStake = () => {
		setStats((prevStats) => ({
			...prevStats,
			isStaked: true,
			totalStaked: prevStats.totalStakable,
			totalStakable: 0,
		}));
	};

	const handleUnstake = () => {
		setStats((prevStats) => ({
			...prevStats,
			isStaked: false,
			totalStaked: 0,
			totalStakable: prevStats.totalStaked,
		}));
	};

	const percentMined = (stats.minedAmount / stats.totalPool) * 100;
	const earningsPerSecond = (
		(stats.totalStaked * stats.currentAPR) /
		(365 * 24 * 60 * 60)
	).toFixed(6);

	return (
		<Card className="w-full max-w-md mx-auto my-6 border-none">
			<CardHeader className="flex flex-col items-center">
				{/* <OctaneSwapLogo size={64} animated={false} /> */}
				<OctaneSwapLogo
					size={128}
					variant={1}
					animated={stats.isStaked ? true : false}
					className={`${stats.isStaked && "animate-spin spin-out-12"}`}
				/>
				<CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2"></CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<Card>
						<CardContent className="p-4">
							<p className="text-xm text-muted-foreground">pOCT</p>
							<p className="text-2xl font-semibold ">
								{(
									Number(user.poctBalance) + Number(user.telegramAgeOCTRewards)
								).toString()}{" "}
								pOCT
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-muted-foreground">Total Staked</p>
							<p className="text-2xl font-bold">{stats.totalStaked} pOCT</p>
						</CardContent>
					</Card>
				</div>

				<div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium">Current APR</span>
						<Badge variant="secondary" className="text-primary">
							{stats.currentAPR}% <ArrowUpRight className="w-3 h-3 ml-1" />
						</Badge>
					</div>
					{stats.isStaked && (
						<p className="text-xs text-muted-foreground">
							Earning approximately {earningsPerSecond} pOCT per second
						</p>
					)}
				</div>

				<Separator />

				<div>
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium">Total Pool</span>
						<span className="text-sm font-medium">
							{stats.totalPool.toLocaleString()} pOCT
						</span>
					</div>
					<div className="space-y-2">
						<Progress value={percentMined} className="w-full" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Mined: {stats.minedAmount.toLocaleString()} pOCT</span>
							<span>{percentMined.toFixed(2)}%</span>
						</div>
					</div>
				</div>

				<div className="flex justify-center">
					{stats.isStaked ? (
						<div className="space-y-2 w-full">
							<Badge
								variant="secondary"
								className="text-primary py-2 px-4 w-full flex justify-center items-center">
								<Coins className="w-4 h-4 mr-2" />
								Currently Staking
							</Badge>
							<Button
								onClick={handleUnstake}
								variant="outline"
								className="w-full">
								Unstake
							</Button>
						</div>
					) : (
						<Button onClick={async () => await stake()} className="w-full">
							Stake Now
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export default MiningDashboard;
