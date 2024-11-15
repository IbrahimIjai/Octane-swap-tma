"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Pickaxe, Coins, Info } from "lucide-react";
import OctaneSwapLogo from "@/components/logo";
import { User } from "@prisma/client";
import { UserWithStaking, useUserStake } from "@/hooks/api/staking-game";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { TOTAL_POOL_SIZE } from "@/lib/config";
import { useStakingProtocol } from "@/hooks/api/useStaking";

import { ArrowRight, Zap, Flame, Rocket, Check } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/api/useUser";
import MiningDashboardSkeleton from "@/components/loaders/dashboard-loader";

const categoryIcons = {
	SPEED: <Zap className="w-4 h-4" />,
	COMBUSTION: <Flame className="w-4 h-4" />,
	CRYPTO: <Rocket className="w-4 h-4" />,
	HYBRID: <ArrowRight className="w-4 h-4" />,
};
interface MiningStats {
	totalStakable: number;
	totalStaked: number;
	currentAPR: number;
	totalPool: number;
	minedAmount: number;
	isStaked: boolean;
}

function MiningDashboard() {
	const {
		isUserReady,
		authDate,
		//fns
		claim,
		isClaiming,
		isClaimingSuccess,
		isClaimError,

		stake,
		isStaking,
		isStakeSuccess,
		isStakeError,
		stakeError,

		//data
		isCurrentlyStaking,
		hasClaimableRewards,
		positionsInfo,

		userData,
		isUserLoading,
		isFetchingUserSuccess,
		userError,
		isUserError,
	} = useUser();

	const {
		pools,
		currentPool,
		currentPoolStats,
		userPositions,
		currentPoolAPR,
		userRewardPerSecond,

		isLoadingPools,
		isLoadingPositions,

		poolsError,

		calculatePoolStats,
		calculateUserRewardPerSecond,
	} = useStakingProtocol(userData?.id);

	if (isUserLoading || !userData) {
		return <MiningDashboardSkeleton />;
	}

	const userBalance =
		Number(userData.poctBalance) + Number(userData.telegramAgeOCTRewards);

	console.log({ currentPool, pools, userBalance });

	return (
		<Card className="w-full max-w-md mx-auto my-6 border-none">
			<CardHeader className="flex flex-col items-center">
				{/* <OctaneSwapLogo size={64} animated={false} /> */}
				<OctaneSwapLogo
					size={128}
					variant={1}
					animated={isStaking ? true : false}
					className={`${isStaking && "animate-spin spin-out-12"}`}
				/>
				<CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2"></CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-muted-foreground">Available pOCT</p>
							<p className="text-2xl font-semibold">
								{userBalance.toFixed(2)} pOCT
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<p className="text-sm text-muted-foreground">Total Staked</p>
							<p className="text-2xl font-bold">
								{currentPoolStats?.totalStaked.toFixed(2)} pOCT
							</p>
						</CardContent>
					</Card>
				</div>
				{currentPool && (
					<>
						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Current APR</span>
								<Badge variant="secondary" className="text-primary">
									{currentPoolAPR.toFixed(2)}%{" "}
									<ArrowUpRight className="w-3 h-3 ml-1" />
								</Badge>
							</div>
							{isCurrentlyStaking ? (
								<p className="text-xs text-muted-foreground">
									Earning approximately {Number(userRewardPerSecond).toFixed(6)}{" "}
									pOCT per second
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									You are not currently participating in this pool
								</p>
							)}
						</div>

						<Separator />

						<div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">Pool Progress</span>
								<span className="text-sm font-medium">
									{TOTAL_POOL_SIZE} pOCT
								</span>
							</div>
							<div className="space-y-2">
								<Progress
									value={currentPoolStats?.progressPercentage}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>
										Mined:{" "}
										{currentPoolStats?.totalRewardsMinted.toLocaleString()} pOCT
									</span>
									<span>
										{currentPoolStats?.progressPercentage.toFixed(2)}%
									</span>
								</div>
							</div>
						</div>

						<div className="flex justify-center">
							{isCurrentlyStaking ? (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="inline-block w-full">
												<Button disabled className="w-full">
													Currently Staking
												</Button>
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												You must unstake from the current pool before staking in
												a new one
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							) : (
								<Button
									onClick={stake}
									disabled={isStaking || userBalance <= 0}
									className="w-full">
									{isStaking ? "Staking..." : "Stake All"}
								</Button>
							)}
						</div>
					</>
				)}

				{hasClaimableRewards && (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" className="w-full">
								Claim Rewards
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Your Staking Pools</DialogTitle>
								<DialogDescription>
									Here&apos;s a list of all your staking pools and their status.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								{positionsInfo.map((position) => (
									<Card key={position.id}>
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
											<CardTitle className="text-sm font-medium">
												{position.pool.poolName.replace(/_/g, " ")}
											</CardTitle>
											<Badge
												variant={position.isActive ? "default" : "secondary"}>
												{position.isActive ? (
													categoryIcons[position.pool.category]
												) : (
													<Check className="w-4 h-4" />
												)}
												{position.isActive ? position.pool.category : "Ended"}
											</Badge>
										</CardHeader>
										<CardContent>
											<div className="flex justify-between items-center mb-2">
												<span className="text-sm text-muted-foreground">
													Staked:
												</span>
												<span className="font-semibold">
													{Number(position.amount)} pOCT
												</span>
											</div>
											<div className="flex justify-between items-center mb-4">
												<span className="text-sm text-muted-foreground">
													Rewards:
												</span>
												<span className="font-semibold">
													{Number(position.rewards)} pOCT
												</span>
											</div>
											{(position.isEnded || Number(position.rewards) > 0) && (
												<Button
													onClick={() => claim({ poolId: position.poolId })}
													disabled={isClaiming}
													className="w-full">
													{isClaiming ? "Claiming..." : "Claim Rewards"}
													<ArrowRight className="w-4 h-4 ml-2" />
												</Button>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</DialogContent>
					</Dialog>
				)}

				{isStakeError && (
					<p className="text-red-500">Error: {stakeError?.message}</p>
				)}

				{isStakeSuccess && (
					<p className="text-green-500">Staking successful!</p>
				)}

				{!currentPool && (
					<div className="text-center text-muted-foreground">
						<Info className="w-6 h-6 mx-auto mb-2" />
						<p>There are currently no active staking pools.</p>
						<p>
							Complete tasks, refer friends and accumulate points in order to
							get bigger share of the upcoming pool. Please check back later for
							new opportunities.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default MiningDashboard;
