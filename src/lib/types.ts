import { PoolCategory, PoolName } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";

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

//  type JsonValue =
// 	| string
// 	| number
// 	| boolean
// 	| null
// 	| JsonValue[]
// 	| { [key: string]: JsonValue };

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

