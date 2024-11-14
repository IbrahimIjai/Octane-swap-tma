"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "../use-toast";
// import { poolInfo } from "@/utils/staking-protocol-helpers";
import { StakingPool, StakingPosition, User } from "@prisma/client";

export interface UserWithStaking extends User {
	StakingPositions: (StakingPosition & { pool: StakingPool })[];
}
export const useUserStake = ({
	userWithStaking,
}: {
	userWithStaking: UserWithStaking;
}) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	//mutations
	const stakeMutation = useMutation({
		mutationFn: async (data: { userId: string; amount: string }) =>
			axios.post("/apis/staking/stake", data),
		onError(error: any) {
			toast({
				variant: "destructive",
				title: "Staking failed",
				description: `There was a problem with your request: ${error.message}`,
			});
		},
		onSuccess: () => {
			toast({
				title: "Staking successful",
				description: "Your tokens have been staked successfully.",
			});
			queryClient.invalidateQueries(["user", userWithStaking.id, "staking"]);
		},
	});

	const claimMutation = useMutation({
		mutationFn: async (data: { userId: string; positionId: string }) =>
			axios.post("/apis/staking/claim", data),
		onError(error: any) {
			toast({
				variant: "destructive",
				title: "Claim failed",
				description: `There was a problem with your request: ${error.message}`,
			});
		},
		onSuccess: (data) => {
			toast({
				title: "Claim successful",
				description: `You've successfully claimed ${data.claimedAmount} pOCT from the pool.`,
			});
			queryClient.invalidateQueries(["user", userWithStaking.id, "staking"]);
		},
	});

	const stake = async () => {
		const amount = (
			Number(userWithStaking.poctBalance) +
			Number(userWithStaking.telegramAgeOCTRewards)
		).toString();
		return stakeMutation.mutateAsync({ userId: userWithStaking.id, amount });
	};

	const claim = async ({ positionId }: { positionId: string }) => {
		return claimMutation.mutateAsync({
			userId: userWithStaking.id,
			positionId,
		});
	};

	const getTotalStaked = () => {
		return (
			userWithStaking?.StakingPositions.reduce(
				(total, position) => total + Number(position.amount),
				0,
			) || 0
		);
	};

	const getActivePool = () => {
		const now = new Date();
		return userWithStaking?.StakingPositions.find(
			(position) =>
				new Date(position.pool.startTime) <= now &&
				new Date(position.pool.endTime) > now,
		);
	};

	const getActiveStakingPools = () => {
		const now = new Date();
		return (
			userWithStaking?.StakingPositions?.filter(
				(position) =>
					Number(position.amount) > 0 &&
					new Date(position.pool.startTime) <= now &&
					new Date(position.pool.endTime) > now,
			) || []
		);
	};

	const getClaimablePools = () => {
		return (
			userWithStaking?.StakingPositions?.filter(
				(position) =>
					Number(position.amount) > 0 || Number(position.rewards) > 0,
			) || []
		);
	};

	const isCurrentlyStaking = getActiveStakingPools().length > 0;

	const hasClaimableRewards = getClaimablePools().length > 0;

	const getUserPositionsInfo = () => {
		return (
			userWithStaking?.StakingPositions.map((position) => ({
				isEnded: new Date(position.pool.endTime) < new Date(),
				isActive:
					new Date(position.pool.startTime) <= new Date() &&
					new Date(position.pool.endTime) > new Date(),

				...position,
			})) || []
		);
	};

	console.log({
		userWithStaking,
		totalStaked: getTotalStaked(),
		poolsInfo: getUserPositionsInfo(),
	});

	return {
		stake,
		claim,
		isStaking: stakeMutation.isPending,
		isClaiming: claimMutation.isPending,
		isStakeSuccess: stakeMutation.isSuccess,
		isStakeError: stakeMutation.isError,
		stakeError: stakeMutation.error,
		totalStaked: getTotalStaked(),
		isCurrentlyStaking,
		hasClaimableRewards,
		positionsInfo: getUserPositionsInfo(),
		userWithStaking,
	};
};
