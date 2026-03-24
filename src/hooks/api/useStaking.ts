"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "../use-toast";
import type { StakingPool, StakingPosition, User } from "@/db/types";
import { SECONDS_PER_YEAR } from "@/lib/config";
// Types
interface PoolWithPosition extends StakingPool {
	positions: StakingPosition[];
}

interface PoolStats {
	totalRewardsMinted: number;
	progressPercentage: number;
	totalStaked: number;
	isActive: boolean;
	timeUntilStart?: number;
	timeUntilEnd?: number;
}

export const useStakingProtocol = (userId?: string) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Get all pools with their positions
	const {
		data: pools,
		isLoading: isLoadingPools,
		error: poolsError,
	} = useQuery<PoolWithPosition[]>({
		queryKey: ["pools"],
		queryFn: async () => {
			const response = await axios.get("/apis/pool");
			return response.data;
		},
	});

	// Get current active pool or next upcoming pool
	const getCurrentPool = () => {
		if (!pools) return null;

		const now = new Date().getTime();

		// First try to find an active pool
		const activePool = pools.find((pool) => {
			if (!pool.startTime || !pool.endTime) return false;
			const startTime = new Date(pool.startTime).getTime();
			const endTime = new Date(pool.endTime).getTime();
			return now >= startTime && now <= endTime;
		});

		if (activePool) return activePool;

		// If no active pool, find the next upcoming pool
		const upcomingPools = pools
			.filter((pool) => {
				if (!pool.startTime) return false;
				return new Date(pool.startTime).getTime() > now;
			})
			.sort((a, b) => {
				if (!a.startTime || !b.startTime) return 0;
				return (
					new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
				);
			});

		return upcomingPools[0] || null;
	};

	// Calculate pool statistics
	const calculatePoolStats = (pool: PoolWithPosition): PoolStats => {
		const now = new Date().getTime();
		const startTime = pool.startTime ? new Date(pool.startTime).getTime() : 0;
		const endTime = pool.endTime ? new Date(pool.endTime).getTime() : 0;

		// Calculate total rewards minted from all positions
		const totalRewardsMinted = pool.positions.reduce(
			(sum, position) => sum + Number(position.rewards),
			0,
		);

		// Calculate progress percentage
		const progressPercentage =
			(totalRewardsMinted / Number(pool.rewardAmount)) * 100;
		const totalStaked =
			pool.positions.reduce(
				(total, position) => total + Number(position.amount),
				0,
			) || 0;

		const isActive = now >= startTime && now <= endTime;
		const timeUntilStart = startTime > now ? startTime - now : 0;
		const timeUntilEnd = endTime > now ? endTime - now : 0;

		return {
			totalRewardsMinted: Number(totalRewardsMinted),
			totalStaked,
			progressPercentage,
			isActive,
			timeUntilStart,
			timeUntilEnd,
		};
	};

	// Get user's reward per second for current pool
	const calculateUserRewardPerSecond = (
		pool: PoolWithPosition,
		userId: string,
	) => {
		if (!pool || !userId) return 0;

		const userPosition = pool.positions.find((pos) => pos.userId === userId);
		if (!userPosition || Number(pool.totalSupply) === 0) return 0;

		// Calculate user's share of the pool
		const userShare = Number(userPosition.amount) / Number(pool.totalSupply);

		// Calculate rewards per second
		return Number(pool.rewardRate) * Number(userShare);
	};

	// Get user's positions
	const {
		data: userPositions,
		isLoading: isLoadingPositions,
		refetch: refetchUserPosition,
	} = useQuery<StakingPosition[]>({
		queryKey: ["userPositions", userId],
		queryFn: async () => {
			if (!userId) return [];
			const response = await axios.get(`/apis/staking/positions/${userId}`);
			return response.data;
		},
		enabled: !!userId,
	});

	// Get current pool and its stats
	const currentPool = getCurrentPool();
	const currentPoolStats = currentPool ? calculatePoolStats(currentPool) : null;
	const userRewardPerSecond =
		currentPool && userId
			? calculateUserRewardPerSecond(currentPool, userId)
			: 0;

	// Calculate APR for current pool
	const calculatePoolAPR = (pool: PoolWithPosition): number => {
		if (!pool || Number(pool?.totalSupply) === 0) {
			return 0;
		}

		const SECONDS_PER_YEAR_NUM = 31536000;
		const rewardsPerYear = Number(pool.rewardRate) * SECONDS_PER_YEAR_NUM;
		const apr = (rewardsPerYear / Number(pool.totalSupply)) * 100;

		return apr;
	};

	// Calculate user-specific APR
	const calculateUserAPR = (pool: PoolWithPosition, userId: string): number => {
		if (!pool || !userId) return 0;

		const userPosition = pool.positions.find((pos) => pos.userId === userId);
		if (!userPosition || Number(pool?.totalSupply) === 0) return 0;

		const userShare = Number(userPosition?.amount) / Number(pool.totalSupply);

		const userRewardsPerYear =
			Number(pool.rewardRate) * SECONDS_PER_YEAR * userShare;
		const userAPR = userRewardsPerYear / (Number(userPosition.amount) * 100);

		return Number(userAPR);
	};

	// Get APR for current pool
	const currentPoolAPR = currentPool ? calculatePoolAPR(currentPool) : 0;
	const userAPR =
		currentPool && userId ? calculateUserAPR(currentPool, userId) : 0;

	return {
		// Queries
		pools,
		currentPool,
		currentPoolStats,
		userPositions,
		userRewardPerSecond,
		currentPoolAPR,

		// Loading states
		isLoadingPools,
		isLoadingPositions,

		// Mutations

		// Errors
		poolsError,

		// Helper functions
		calculatePoolStats,
		calculateUserRewardPerSecond,
	};
};
