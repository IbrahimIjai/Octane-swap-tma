import {
	pgTable,
	text,
	boolean,
	timestamp,
	numeric,
	json,
	pgEnum,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";

/* ================= ENUMS ================= */

export const taskCategoryEnum = pgEnum("task_category", [
	"BASED",
	"ONCHAIN",
	"PARTNER",
]);

export const taskStatusEnum = pgEnum("task_status", [
	"NOT_STARTED",
	"IN_PROGRESS",
	"COMPLETED",
	"FAILED",
]);

export const rewardTypeEnum = pgEnum("reward_type", [
	"WELCOME",
	"TASK_COMPLETION",
	"REFERRAL",
	"DAILY_CHECK_IN",
	"WEB3_INTERACTION",
]);

export const taskTypeEnum = pgEnum("task_type", [
	"TWITTER_FOLLOW",
	"TWITTER_QUOTE_RETWEET",
	"INSTAGRAM_FOLLOW",
	"YOUTUBE_SUBSCRIBE",
	"YOUTUBE_WATCH",
	"TELEGRAM_JOIN",
	"BOOST_CHANNEL",
	"TELEGRAM_STORY",
	"INVITE",
	"SHARE_POST",
	"TRADING",
	"WEB3_INTERACTION",
	"DAILY_CHECK_IN",
]);

export const taskFrequencyEnum = pgEnum("task_frequency", [
	"DAILY",
	"WEEKLY",
	"ONE_TIME",
]);

export const poolNameEnum = pgEnum("pool_name", [
	"NITRO_BOOST",
	"TURBO_CHARGE",
	"SUPERSONIC_STAKE",
	"DRAG_RACE_REWARDS",
	"OCTANE_OVERDRIVE",
	"FUEL_INJECTION",
	"PIT_STOP_PROFITS",
	"VELOCITY_VAULT",
	"IGNITION",
	"COMBUSTION_CHAMBER",
	"HIGH_OCTANE_REWARDS",
	"FUEL_CELL_FRENZY",
	"CATALYST_CONVERTER",
	"THERMAL_THRUST",
	"POWER_SURGE",
	"ROCKET_TO_THE_MOON",
	"DIAMOND_HANDS_VAULT",
	"HODL_HORSEPOWER",
	"DEGEN_DRAG_RACE",
	"MEME_MOMENTUM",
	"BULL_RUN_BOOSTER",
	"WHALE_WATCHER_REWARDS",
	"CRYPTO_COMBUSTION",
	"MEME_MACHINE_NITRO",
	"BLOCKCHAIN_BURNOUT",
	"DEFI_DRIFT",
	"TOKEN_TURBO_BOOST",
	"NFT_NITROUS_OXIDE",
	"SMART_CONTRACT_SPEEDWAY",
]);

export const poolCategoryEnum = pgEnum("pool_category", [
	"SPEED",
	"COMBUSTION",
	"CRYPTO",
	"HYBRID",
]);

/* ================= TABLES ================= */

export const users = pgTable(
	"users",
	{
		id: text("id").primaryKey(),

		isAdmin: boolean("is_admin").default(false),
		isModerator: boolean("is_moderator").default(false),

		telegramUsername: text("telegram_username").unique(),
		telegramId: text("telegram_id").unique(),

		twitterUid: text("twitter_uid").unique(),
		twitterUsername: text("twitter_username").unique(),

		referralCode: text("referral_code").unique(),
		secretCode: text("secret_code").unique(),

		address: text("address").unique(),

		totalRewards: numeric("total_rewards").default("0"),

		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		rewardsIndex: index("rewards_idx").on(table.totalRewards, table.createdAt),
	}),
);

export const tasks = pgTable("tasks", {
	id: text("id").primaryKey(),

	title: text("title").notNull(),
	points: numeric("points").notNull(),

	type: taskTypeEnum("type"),
	frequency: taskFrequencyEnum("frequency"),
	category: taskCategoryEnum("category"),

	actionData: json("action_data"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskCompletions = pgTable(
	"task_completions",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.references(() => users.id)
			.notNull(),

		taskId: text("task_id")
			.references(() => tasks.id)
			.notNull(),

		status: taskStatusEnum("status").default("NOT_STARTED"),

		completed: timestamp("completed"),
	},
	(table) => ({
		uniqueUserTask: uniqueIndex("unique_user_task").on(
			table.userId,
			table.taskId,
		),
	}),
);

export const dailyTaskReset = pgTable("daily_task_reset", {
	id: text("id").primaryKey(),

	userId: text("user_id")
		.references(() => users.id)
		.unique()
		.notNull(),

	lastReset: timestamp("last_reset").notNull(),
});

export const referrals = pgTable(
	"referrals",
	{
		id: text("id").primaryKey(),

		referrerId: text("referrer_id")
			.references(() => users.id)
			.notNull(),

		referredId: text("referred_id")
			.references(() => users.id)
			.unique()
			.notNull(),

		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => ({
		referrerIndex: index("referrer_idx").on(table.referrerId),
	}),
);

export const rewards = pgTable(
	"rewards",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.references(() => users.id)
			.notNull(),

		taskId: text("task_id").references(() => tasks.id),

		amount: numeric("amount").notNull(),

		type: rewardTypeEnum("type"),

		claimed: timestamp("claimed"),

		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => ({
		uniqueUserTask: uniqueIndex("reward_user_task").on(
			table.userId,
			table.taskId,
		),
	}),
);

export const stakingPools = pgTable("staking_pools", {
	id: text("id").primaryKey(),

	poolName: poolNameEnum("pool_name"),
	category: poolCategoryEnum("category"),

	totalSupply: numeric("total_supply").default("0"),
	rewardRate: numeric("reward_rate").default("0"),
	rewardAmount: numeric("reward_amount").notNull(),
	rewardPerTokenStored: numeric("reward_per_token_stored"),

	startTime: timestamp("start_time"),
	endTime: timestamp("end_time"),

	rewardsDuration: numeric("rewards_duration"),
	lastUpdateTime: timestamp("last_update_time"),
	periodFinish: numeric("period_finish"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const stakingPositions = pgTable(
	"staking_positions",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.references(() => users.id)
			.notNull(),

		poolId: text("pool_id")
			.references(() => stakingPools.id)
			.notNull(),

		amount: numeric("amount").notNull(),

		rewardPerTokenPaid: numeric("reward_per_token_paid").default("0"),
		rewards: numeric("rewards").default("0"),

		lastUpdateTime: timestamp("last_update_time"),

		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		uniqueUserPool: uniqueIndex("user_pool_unique").on(
			table.userId,
			table.poolId,
		),
	}),
);
