"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OctaneSwapLogo from "@/components/logo";
import { useStakingProtocol } from "@/hooks/api/useStaking";

import { ArrowRight, Zap, Flame, Rocket, Check } from "lucide-react";
import MiningDashboardSkeleton from "@/components/loaders/dashboard-loader";
import { LocalUser } from "@/utils/types";
import { Skeleton } from "@/components/ui/skeleton";

function MiningDashboard({
	userData,
	isUserLoading,
	isStaking,
}: {
	userData: LocalUser | undefined;
	isUserLoading: boolean;
	isStaking: boolean;
}) {
	const userBalance = Number(userData?.totalRewards);

	return (
		<Card className="w-full max-w-md mx-auto my-6 border-none">
			<CardHeader className="flex flex-col items-center">
				<OctaneSwapLogo
					size={128}
					variant={1}
					animated={isUserLoading ? true : false}
					className={`${isUserLoading && "animate-spin spin-out-12"}`}
				/>
				<CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2"></CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 flex items-center justify-center">
				<div className="mx-auto flex items-center gap-2">
					{isUserLoading ? (
						<Skeleton className="w-20 h-6 mr-2" />
					) : (
						<p className="text-5xl font-semibold">{userBalance.toFixed(2)}</p>
					)}
					<span>pOCT</span>
				</div>
			</CardContent>
		</Card>
	);
}

export default MiningDashboard;
