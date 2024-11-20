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

function MiningDashboard({
	userData,
	isUserLoading,
	isStaking,
}: {
	userData: UserWithStaking | undefined;
	isUserLoading: boolean;
	isStaking: boolean;
}) {
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

	const userBalance = Number(userData.totalRewards);

	console.log({ currentPool, pools, userBalance });

	return (
		<Card className="w-full max-w-md mx-auto my-6 border-none">
			<CardHeader className="flex flex-col items-center">
				<OctaneSwapLogo
					size={128}
					variant={1}
					animated={isStaking ? true : false}
					className={`${isStaking && "animate-spin spin-out-12"}`}
				/>
				<CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2"></CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 flex items-center justify-center">
				<div className="mx-auto flex items-center gap-2">
					<p className="text-5xl font-semibold">{userBalance.toFixed(2)}</p>
					<span>pOCT</span>
				</div>
			</CardContent>
		</Card>
	);
}

export default MiningDashboard;
