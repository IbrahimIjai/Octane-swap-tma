// PRISMA: import { PoolCategory, PoolName } from "@prisma/client";
// PRISMA: import { JsonArray } from "@prisma/client/runtime/library";
import type { PoolCategory, PoolName } from "@/db/types";

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
	poolName: PoolName;
	category: PoolCategory;
	rewardAmount: number;
	startTime: string;
	endTime: string;
}

type JsonArray = any[];

type JsonObject = {
	[x: string]: JsonValue | undefined;
};

export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

export interface ActionData {
	username?: string;
	tweetId?: string;
	groupUsername?: string;
	[key: string]: JsonValue | undefined;
}
