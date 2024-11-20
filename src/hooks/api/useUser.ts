"use client";

import { calculateTelegramAgeReward } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initData } from "@telegram-apps/sdk-react";
import { useIsMounted } from "connectkit";
import axios from "axios";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "../use-toast";
import { LocalUser } from "../../utils/types";

export const useUser = () => {
	console.log({ initData });
	const isMounted = useIsMounted();
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const { push } = useRouter();
	const telegramId = initData?.user()?.id.toString();
	const authDate = initData?.authDate;

	const isUserReady = isMounted && initData?.user()?.id ? true : false;
	const isBot = initData?.user()?.isBot;
	//GET USER
	const {
		data: userData,
		isLoading: isUserLoading,
		error: userError,
		isError: isUserError,
		isSuccess: isFetchingUserSuccess,
		refetch: refetchUser,
	} = useQuery({
		queryKey: ["user", telegramId],
		queryFn: async () => {
			const response = await axios.get<LocalUser>(
				`/apis/user?telegramId=${telegramId}`,
			);
			return response.data;
		},
		enabled: isUserReady,
	});

	// UTILS
	const getActiveStakingPools = () => {
		const now = new Date();
		return (
			userData?.StakingPositions?.filter(
				(position) =>
					Number(position.amount) > 0 &&
					new Date(position.pool.startTime) <= now &&
					new Date(position.pool.endTime) > now,
			) || []
		);
	};

	const getClaimablePools = () => {
		return (
			userData?.StakingPositions?.filter(
				(position) =>
					Number(position.amount) > 0 || Number(position.rewards) > 0,
			) || []
		);
	};
	const getUserPositionsInfo = () => {
		if (userData?.StakingPositions) {
			return (
				userData?.StakingPositions?.map((position) => ({
					isEnded: new Date(position.pool.endTime) < new Date(),
					isActive:
						new Date(position.pool.startTime) <= new Date() &&
						new Date(position.pool.endTime) > new Date(),

					...position,
				})) || []
			);
		} else {
			[];
		}
	};

	//UTILS EXPORT

	const hasClaimableRewards = getClaimablePools().length > 0;
	const isCurrentlyStaking = getActiveStakingPools().length > 0;
	const totalUserStakings =
		getUserPositionsInfo()?.reduce((acc, position) => {
			return acc + Number(position.amount); // Convert `Decimal` to a number
		}, 0) || 0;

	//MUTATIONS

	const createUserMutation = useMutation({
		mutationFn: async (data: { telegramId: string; referralCode?: string }) => {
			const response = await axios.post<User>("/apis/user", data);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["user", telegramId], data);
			refetchUser();
			push("/home");
		},
	});

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
			refetchUser();
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
			refetchUser();
			toast({
				title: "Claim successful",
				description: `You've successfully claimed  NaN pOCT from the pool.`,
			});
		},
	});
	const getReferralLinkMutation = useMutation({
		mutationFn: async () => {
			const response = await axios.get(
				`/apis/user/refferallink?telegramId=${telegramId}`,
			);
			return response.data;
		},
		onSuccess: (data) => {
			toast({
				title: "Referral Link Generated",
				description: "Your referral link has been copied to clipboard.",
			});
			navigator.clipboard.writeText(data.referralLink);
		},
	});

	//ACTIONS FROM MUTATIONS
	const createUser = async () => {
		if (!isUserReady) {
			throw new Error("User not ready");
		}
		const referralCode = initData?.startParam();

		return createUserMutation.mutateAsync({
			telegramId: telegramId!,
			referralCode,
		});
	};

	const stake = async () => {};

	const claim = async ({ poolId }: { poolId: string }) => {
		if (!userData || !poolId) {
			return toast({
				variant: "destructive",
				title: "Staking failed",
				description: `There was a problem with your request: user not initalized or Pool dosen't exist`,
			});
		}
		return claimMutation.mutateAsync({
			userId: userData.id,
			poolId,
		});
	};

	const getReferralLink = async () => {
		if (!isUserReady) {
			throw new Error("User not ready");
		}
		return getReferralLinkMutation.mutateAsync();
	};
	return {
		isUserReady,
		authDate,
		isBot,
		telegramId,

		//creating user
		createUser,
		isCreating: createUserMutation.isPending,
		isCreateSuccess: createUserMutation.isSuccess,
		isCreateError: createUserMutation.isError,
		createError: createUserMutation.error,

		//getting user
		userData,
		isUserLoading,
		isFetchingUserSuccess,
		isUserError,
		userError,

		isCurrentlyStaking,
		hasClaimableRewards,
		positionsInfo: getUserPositionsInfo(),
		totalUserStakings,

		// stakings
		stake,
		isStaking: stakeMutation.isPending,
		isStakeSuccess: stakeMutation.isSuccess,
		isStakeError: stakeMutation.isError,
		stakeError: stakeMutation.error,

		//claiming
		claim,
		isClaiming: claimMutation.isPending,
		isClaimingSuccess: claimMutation.isSuccess,
		isClaimError: claimMutation.isError,

		getReferralLink,
		isGettingReferralLink: getReferralLinkMutation.isPending,
	};
};
