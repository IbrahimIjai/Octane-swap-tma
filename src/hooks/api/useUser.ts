"use client";

import { calculateTelegramAgeReward } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { useIsMounted } from "connectkit";
import axios from "axios";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { UserWithStaking } from "./staking-game";

export const useUser = () => {
	const initData = useInitData();
	const isMounted = useIsMounted();
	const queryClient = useQueryClient();

	const { push } = useRouter();
	const telegramId = initData?.user?.id.toString();
	const authDate = initData?.authDate;

	const isUserReady = isMounted && initData?.user ? true : false;

	const {
		data: userData,
		isLoading: isUserLoading,
		error: userError,
		isError: isUserError,
		isSuccess: isFetchingUserSuccess,
	} = useQuery({
		queryKey: ["user", telegramId],
		queryFn: async () => {
			const response = await axios.get<UserWithStaking>(
				`/apis/user?telegramId=${telegramId}`,
			);
			return response.data;
		},
		enabled: isUserReady,
	});

	const createUserMutation = useMutation({
		mutationFn: async (data: {
			telegramId: string;
			telegramAgeOCTRewards: string;
		}) => {
			const response = await axios.post<User>("/apis/user", data);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["user", telegramId], data);
			push("/home");
		},
	});

	const createUser = async () => {
		if (!isUserReady) {
			throw new Error("User not ready");
		}

		const tgRewards = await calculateTelegramAgeReward(
			new Date(initData?.authDate!),
		);
		return createUserMutation.mutateAsync({
			telegramId: telegramId!,
			telegramAgeOCTRewards: tgRewards.toString(),
		});
	};

	return {
		isUserReady,
		authDate,

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
	};
};
