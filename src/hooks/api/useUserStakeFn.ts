import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "../use-toast";
import { poolInfo } from "@/utils/staking-protocol";

export const useUserStake = ({ user }: { user: User }) => {
	const { toast } = useToast();

	//mutations
	const stakeMutationCycle = useMutation({
		mutationFn: async (data: {
			userId: string;
			poolId: string;
			amount: string;
		}) => axios.post("/api/staking/stake", data),

		onSuccess: (data) => {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
		},
	});

	const claimMutationCycle = useMutation({
		mutationFn: async (data: {
			userId: string;
			poolId: string;
			amount: string;
		}) => axios.post("/api/staking/claim", data),

		onSuccess: (data) => {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
		},
	});

	const stake = async () => {
		//stake
		const { latestPool } = await poolInfo.getPools();
		return stakeMutationCycle.mutateAsync({
			userId: user.id,
			poolId: latestPool.id,
			amount: (
				Number(user.poctBalance) + Number(user.telegramAgeOCTRewards)
			).toString(),
		});
	};

	const claim = async () => {};

	return {
		//staking
		stake,
		isStaking: stakeMutationCycle.isPending,
		isStakeSuccess: stakeMutationCycle.isSuccess,
		isStakeError: stakeMutationCycle.isError,
		stakeError: stakeMutationCycle.error,
	};
};
