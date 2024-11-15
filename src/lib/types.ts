import { PoolCategory, PoolName } from "@prisma/client";

export interface StakingPool {
	id: string;
	totalSupply: number;
	rewardRate: number;
	rewardAmount: number;
	startTime: string;
	endTime: string;
	lastUpdateTime: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePoolDTO {
	// rewardRate: number;
	poolName: PoolName;
	category: PoolCategory;
	rewardAmount: number;
	startTime: string;
	endTime: string;
}
