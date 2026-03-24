import { InferSelectModel } from "drizzle-orm";
import {
	users,
	tasks,
	taskCompletions,
	dailyTaskReset,
	referrals,
	rewards,
	stakingPools,
	stakingPositions,
} from "./schema";

export type User = InferSelectModel<typeof users>;
export type Task = InferSelectModel<typeof tasks>;
export type TaskCompletion = InferSelectModel<typeof taskCompletions>;
export type DailyTaskReset = InferSelectModel<typeof dailyTaskReset>;
export type Referral = InferSelectModel<typeof referrals>;
export type Reward = InferSelectModel<typeof rewards>;
export type StakingPool = InferSelectModel<typeof stakingPools>;
export type StakingPosition = InferSelectModel<typeof stakingPositions>;

// Re-export enum values for use in client code
export {
	taskCategoryEnum,
	taskStatusEnum,
	rewardTypeEnum,
	taskTypeEnum,
	taskFrequencyEnum,
	poolNameEnum,
	poolCategoryEnum,
} from "./schema";

// ============ Runtime enum objects (for z.nativeEnum, Object.values, etc.) ============

export const TaskCategory = {
	BASED: "BASED",
	ONCHAIN: "ONCHAIN",
	PARTNER: "PARTNER",
} as const;
export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];

export const TaskStatus = {
	NOT_STARTED: "NOT_STARTED",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const RewardType = {
	WELCOME: "WELCOME",
	TASK_COMPLETION: "TASK_COMPLETION",
	REFERRAL: "REFERRAL",
	DAILY_CHECK_IN: "DAILY_CHECK_IN",
	WEB3_INTERACTION: "WEB3_INTERACTION",
} as const;
export type RewardType = (typeof RewardType)[keyof typeof RewardType];

export const TaskType = {
	TWITTER_FOLLOW: "TWITTER_FOLLOW",
	TWITTER_QUOTE_RETWEET: "TWITTER_QUOTE_RETWEET",
	INSTAGRAM_FOLLOW: "INSTAGRAM_FOLLOW",
	YOUTUBE_SUBSCRIBE: "YOUTUBE_SUBSCRIBE",
	YOUTUBE_WATCH: "YOUTUBE_WATCH",
	TELEGRAM_JOIN: "TELEGRAM_JOIN",
	BOOST_CHANNEL: "BOOST_CHANNEL",
	TELEGRAM_STORY: "TELEGRAM_STORY",
	INVITE: "INVITE",
	SHARE_POST: "SHARE_POST",
	TRADING: "TRADING",
	WEB3_INTERACTION: "WEB3_INTERACTION",
	DAILY_CHECK_IN: "DAILY_CHECK_IN",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const TaskFrequency = {
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	ONE_TIME: "ONE_TIME",
} as const;
export type TaskFrequency = (typeof TaskFrequency)[keyof typeof TaskFrequency];

export const PoolName = {
	NITRO_BOOST: "NITRO_BOOST",
	TURBO_CHARGE: "TURBO_CHARGE",
	SUPERSONIC_STAKE: "SUPERSONIC_STAKE",
	DRAG_RACE_REWARDS: "DRAG_RACE_REWARDS",
	OCTANE_OVERDRIVE: "OCTANE_OVERDRIVE",
	FUEL_INJECTION: "FUEL_INJECTION",
	PIT_STOP_PROFITS: "PIT_STOP_PROFITS",
	VELOCITY_VAULT: "VELOCITY_VAULT",
	IGNITION: "IGNITION",
	COMBUSTION_CHAMBER: "COMBUSTION_CHAMBER",
	HIGH_OCTANE_REWARDS: "HIGH_OCTANE_REWARDS",
	FUEL_CELL_FRENZY: "FUEL_CELL_FRENZY",
	CATALYST_CONVERTER: "CATALYST_CONVERTER",
	THERMAL_THRUST: "THERMAL_THRUST",
	POWER_SURGE: "POWER_SURGE",
	ROCKET_TO_THE_MOON: "ROCKET_TO_THE_MOON",
	DIAMOND_HANDS_VAULT: "DIAMOND_HANDS_VAULT",
	HODL_HORSEPOWER: "HODL_HORSEPOWER",
	DEGEN_DRAG_RACE: "DEGEN_DRAG_RACE",
	MEME_MOMENTUM: "MEME_MOMENTUM",
	BULL_RUN_BOOSTER: "BULL_RUN_BOOSTER",
	WHALE_WATCHER_REWARDS: "WHALE_WATCHER_REWARDS",
	CRYPTO_COMBUSTION: "CRYPTO_COMBUSTION",
	MEME_MACHINE_NITRO: "MEME_MACHINE_NITRO",
	BLOCKCHAIN_BURNOUT: "BLOCKCHAIN_BURNOUT",
	DEFI_DRIFT: "DEFI_DRIFT",
	TOKEN_TURBO_BOOST: "TOKEN_TURBO_BOOST",
	NFT_NITROUS_OXIDE: "NFT_NITROUS_OXIDE",
	SMART_CONTRACT_SPEEDWAY: "SMART_CONTRACT_SPEEDWAY",
} as const;
export type PoolName = (typeof PoolName)[keyof typeof PoolName];

export const PoolCategory = {
	SPEED: "SPEED",
	COMBUSTION: "COMBUSTION",
	CRYPTO: "CRYPTO",
	HYBRID: "HYBRID",
} as const;
export type PoolCategory = (typeof PoolCategory)[keyof typeof PoolCategory];
