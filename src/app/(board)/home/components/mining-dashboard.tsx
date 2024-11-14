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
import { UserWithStaking, useUserStake } from "@/hooks/api/staking-game";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
interface MiningStats {
	totalStakable: number;
	totalStaked: number;
	currentAPR: number;
	totalPool: number;
	minedAmount: number;
	isStaked: boolean;
}

function MiningDashboard({ user }: { user: UserWithStaking }) {
	const {
		stake,
		claim,
		isStaking,
		isClaiming,
		isStakeSuccess,
		isStakeError,
		stakeError,
		totalStaked,
		isCurrentlyStaking,
		hasClaimableRewards,
		positionsInfo,
		userWithStaking,
	} = useUserStake({ userWithStaking: user });

	console.log({ isStaking, isStakeSuccess, isStakeError, stakeError });

	// const percentMined = (stats.minedAmount / stats.totalPool) * 100;
	// const earningsPerSecond = (
	// 	(stats.totalStaked * stats.currentAPR) /
	// 	(365 * 24 * 60 * 60)
	// ).toFixed(6);

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
							<p className="text-2xl font-bold">{totalStaked} pOCT</p>
						</CardContent>
					</Card>
				</div>
				{/* 
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
				</div> */}

				<Separator />

				{/* <div>
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
				</div> */}

				<div className="flex justify-center">
					{hasClaimableRewards ? (
						<Button disabled={isStaking} className="w-full">
							{isStaking ? "Claiming..." : "Claim Rewards"}
						</Button>
					) : (
						<Button onClick={stake} disabled={isStaking} className="w-full">
							{isStaking ? "Staking..." : "Stake All"}
						</Button>
					)}
					{isStakeError && (
						<p className="text-red-500">Error: {stakeError?.message}</p>
					)}
					{isStakeSuccess && (
						<p className="text-green-500">Staking successful!</p>
					)}

					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">View All Pools</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Your Staking Pools</DialogTitle>
								<DialogDescription>
									Here&apos;s a list of all your staking pools and their status.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								{positionsInfo.map((position) => (
									<div key={position.id} className="border p-4 rounded">
										<p>Pool ID: {position.poolId}</p>
										<p>Amount Staked: {Number(position.amount)} pOCT</p>
										<p>Rewards: {Number(position.rewards)} pOCT</p>
										<p>
											Status:{" "}
											{position.isEnded
												? "Ended"
												: position.isActive
												? "Active"
												: "Not Started"}
										</p>
										{(position.isEnded || Number(position.rewards) > 0) && (
											<Button
												onClick={() => claim({ positionId: position.id })}
												disabled={isClaiming}
												className="mt-2">
												{isClaiming ? "Claiming..." : "Claim Rewards"}
											</Button>
										)}
									</div>
								))}
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	);
}

export default MiningDashboard;
