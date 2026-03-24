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

// Inferred row types (replaces @prisma/client imports like `User`, `Task`, etc.)
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

// Enum union types (replaces Prisma's generated enums like `TaskCategory`, `PoolName`, etc.)
export type TaskCategory = "BASED" | "ONCHAIN" | "PARTNER";
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type RewardType = "WELCOME" | "TASK_COMPLETION" | "REFERRAL" | "DAILY_CHECK_IN" | "WEB3_INTERACTION";
export type TaskType =
	| "TWITTER_FOLLOW"
	| "TWITTER_QUOTE_RETWEET"
	| "INSTAGRAM_FOLLOW"
	| "YOUTUBE_SUBSCRIBE"
	| "YOUTUBE_WATCH"
	| "TELEGRAM_JOIN"
	| "BOOST_CHANNEL"
	| "TELEGRAM_STORY"
	| "INVITE"
	| "SHARE_POST"
	| "TRADING"
	| "WEB3_INTERACTION"
	| "DAILY_CHECK_IN";
export type TaskFrequency = "DAILY" | "WEEKLY" | "ONE_TIME";
export type PoolName =
	| "NITRO_BOOST"
	| "TURBO_CHARGE"
	| "SUPERSONIC_STAKE"
	| "DRAG_RACE_REWARDS"
	| "OCTANE_OVERDRIVE"
	| "FUEL_INJECTION"
	| "PIT_STOP_PROFITS"
	| "VELOCITY_VAULT"
	| "IGNITION"
	| "COMBUSTION_CHAMBER"
	| "HIGH_OCTANE_REWARDS"
	| "FUEL_CELL_FRENZY"
	| "CATALYST_CONVERTER"
	| "THERMAL_THRUST"
	| "POWER_SURGE"
	| "ROCKET_TO_THE_MOON"
	| "DIAMOND_HANDS_VAULT"
	| "HODL_HORSEPOWER"
	| "DEGEN_DRAG_RACE"
	| "MEME_MOMENTUM"
	| "BULL_RUN_BOOSTER"
	| "WHALE_WATCHER_REWARDS"
	| "CRYPTO_COMBUSTION"
	| "MEME_MACHINE_NITRO"
	| "BLOCKCHAIN_BURNOUT"
	| "DEFI_DRIFT"
	| "TOKEN_TURBO_BOOST"
	| "NFT_NITROUS_OXIDE"
	| "SMART_CONTRACT_SPEEDWAY";
export type PoolCategory = "SPEED" | "COMBUSTION" | "CRYPTO" | "HYBRID";
