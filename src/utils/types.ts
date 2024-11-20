import {
	Reward,
	StakingPool,
	StakingPosition,
	TaskCompletion,
	User,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Enums
export enum TaskCategory {
	BASED = "BASED",
	ONCHAIN = "ONCHAIN",
	PARTNER = "PARTNER",
}

export enum TaskStatus {
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export enum TaskType {
	TWITTER_FOLLOW = "TWITTER_FOLLOW",
	TWITTER_QUOTE_RETWEET = "TWITTER_QUOTE_RETWEET",
	TELEGRAM_JOIN = "TELEGRAM_JOIN",
	INVITE = "INVITE",
	SHARE_POST = "SHARE_POST",
	TRADING = "TRADING",
	BOOST_CHANNEL = "BOOST_CHANNEL",
	WEB3_INTERACTION = "WEB3_INTERACTION",
	DAILY_CHECK_IN = "DAILY_CHECK_IN",
}

export enum RewardType {
	WELCOME = "WELCOME",
	TASK_COMPLETION = "TASK_COMPLETION",
	REFERRAL = "REFERRAL",
	DAILY_CHECK_IN = "DAILY_CHECK_IN",
	WEB3_INTERACTION = "WEB3_INTERACTION",
}
export enum TaskFrequency {
	DAILY = "DAILY",
	WEEKLY = "WEEKLY",
	ONE_TIME = "ONE_TIME",
}

export enum PoolName {
	NITRO_BOOST = "NITRO_BOOST",
	TURBO_CHARGE = "TURBO_CHARGE",
	// ... other pool names
}

export enum PoolCategory {
	SPEED = "SPEED",
	COMBUSTION = "COMBUSTION",
	CRYPTO = "CRYPTO",
	HYBRID = "HYBRID",
}

// Interface definitions
export interface Task {
	id: string;
	title: string;
	points: Decimal;
	type: TaskType;
	frequency: TaskFrequency;
	category: TaskCategory;
	actionData: any;
	createdAt: Date;
	updatedAt: Date;
}

// export interface TaskCompletion {
// 	id: string;
// 	userId: string;
// 	taskId: string;
// 	status: TaskStatus;
// 	completed: Date;
// 	task: Task;
// }

// export interface StakingPool {
// 	id: string;
// 	poolName: PoolName;
// 	category: PoolCategory;
// 	totalSupply: Decimal;
// 	rewardRate: Decimal;
// 	rewardAmount: Decimal;
// 	rewardPerTokenStored: Decimal;
// 	startTime: Date;
// 	endTime: Date;
// 	rewardsDuration: Decimal;
// 	lastUpdateTime: Date;
// 	periodFinish: Decimal;
// 	createdAt: Date;
// 	updatedAt: Date;
// }

// export interface StakingPosition {
// 	id: string;
// 	userId: string;
// 	poolId: string;
// 	amount: Decimal;
// 	rewardPerTokenPaid: Decimal;
// 	rewards: Decimal;
// 	lastUpdateTime: Date;
// 	createdAt: Date;
// 	updatedAt: Date;
// 	pool: StakingPool;
// }

// export interface Reward {
// 	id: string;
// 	userId: string;
// 	amount: Decimal;
// 	taskId: string | null;
// 	type: RewardType;
// 	claimed: Date | null;
// 	createdAt: Date;
// 	task: Task | null;
// }

// Main User type that matches your API response
export interface LocalUser extends User {
	// StakingPositions: StakingPosition[];
	TaskCompletions: (TaskCompletion & {task:Task})[];
	Rewards: Reward[];
	StakingPositions: (StakingPosition & { pool: StakingPool })[];
}
