"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "../use-toast";
import { LocalUser } from "@/utils/types";

//Depreciated

export const useUserStake = ({
	userWithStaking,
}: {
	userWithStaking: LocalUser;
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
		},
	});

	const claimMutation = useMutation({
		mutationFn: async (data: { userId: string; poolId: string }) =>
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
				description: `You've successfully claimed  NaN pOCT from the pool.`,
			});
		},
	});

	const stake = async () => {
		const amount = "0";

		console.log(amount);
		return stakeMutation.mutateAsync({ userId: userWithStaking.id, amount });
	};

	const claim = async ({ poolId }: { poolId: string }) => {
		return claimMutation.mutateAsync({
			userId: userWithStaking.id,
			poolId,
		});
	};

	const getActivePool = () => {
		const now = new Date();
		return userWithStaking?.StakingPositions.find((position) => {
			if (!position.pool.startTime || !position.pool.endTime) return false;
			const start = new Date(position.pool.startTime);
			const end = new Date(position.pool.endTime);
			return start <= now && end > now;
		});
	};

	const getActiveStakingPools = () => {
		const now = new Date();
		return (
			userWithStaking?.StakingPositions?.filter((position) => {
				if (
					!position.pool.startTime ||
					!position.pool.endTime ||
					Number(position.amount) <= 0
				) {
					return false;
				}
				const start = new Date(position.pool.startTime);
				const end = new Date(position.pool.endTime);
				return start <= now && end > now;
			}) || []
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
			userWithStaking?.StakingPositions.map((position) => {
				const now = new Date();
				const startTime = position.pool.startTime
					? new Date(position.pool.startTime)
					: null;
				const endTime = position.pool.endTime
					? new Date(position.pool.endTime)
					: null;

				return {
					isEnded: endTime ? endTime < now : false,
					isActive:
						startTime && endTime ? startTime <= now && endTime > now : false,
					...position,
				};
			}) || []
		);
	};

	console.log({
		userWithStaking,
		// totalStaked: getTotalStaked(),
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

		// totalStaked: getTotalStaked(),
		isCurrentlyStaking,
		hasClaimableRewards,
		positionsInfo: getUserPositionsInfo(),
		userWithStaking,
	};
};
