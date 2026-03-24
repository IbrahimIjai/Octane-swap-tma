CREATE TYPE "public"."pool_category" AS ENUM('SPEED', 'COMBUSTION', 'CRYPTO', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."pool_name" AS ENUM('NITRO_BOOST', 'TURBO_CHARGE', 'SUPERSONIC_STAKE', 'DRAG_RACE_REWARDS', 'OCTANE_OVERDRIVE', 'FUEL_INJECTION', 'PIT_STOP_PROFITS', 'VELOCITY_VAULT', 'IGNITION', 'COMBUSTION_CHAMBER', 'HIGH_OCTANE_REWARDS', 'FUEL_CELL_FRENZY', 'CATALYST_CONVERTER', 'THERMAL_THRUST', 'POWER_SURGE', 'ROCKET_TO_THE_MOON', 'DIAMOND_HANDS_VAULT', 'HODL_HORSEPOWER', 'DEGEN_DRAG_RACE', 'MEME_MOMENTUM', 'BULL_RUN_BOOSTER', 'WHALE_WATCHER_REWARDS', 'CRYPTO_COMBUSTION', 'MEME_MACHINE_NITRO', 'BLOCKCHAIN_BURNOUT', 'DEFI_DRIFT', 'TOKEN_TURBO_BOOST', 'NFT_NITROUS_OXIDE', 'SMART_CONTRACT_SPEEDWAY');--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('WELCOME', 'TASK_COMPLETION', 'REFERRAL', 'DAILY_CHECK_IN', 'WEB3_INTERACTION');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('BASED', 'ONCHAIN', 'PARTNER');--> statement-breakpoint
CREATE TYPE "public"."task_frequency" AS ENUM('DAILY', 'WEEKLY', 'ONE_TIME');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('TWITTER_FOLLOW', 'TWITTER_QUOTE_RETWEET', 'INSTAGRAM_FOLLOW', 'YOUTUBE_SUBSCRIBE', 'YOUTUBE_WATCH', 'TELEGRAM_JOIN', 'BOOST_CHANNEL', 'TELEGRAM_STORY', 'INVITE', 'SHARE_POST', 'TRADING', 'WEB3_INTERACTION', 'DAILY_CHECK_IN');--> statement-breakpoint
CREATE TABLE "daily_task_reset" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"last_reset" timestamp NOT NULL,
	CONSTRAINT "daily_task_reset_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "referrals_referred_id_unique" UNIQUE("referred_id")
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text,
	"amount" numeric NOT NULL,
	"type" "reward_type",
	"claimed" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staking_pools" (
	"id" text PRIMARY KEY NOT NULL,
	"pool_name" "pool_name",
	"category" "pool_category",
	"total_supply" numeric DEFAULT '0',
	"reward_rate" numeric DEFAULT '0',
	"reward_amount" numeric NOT NULL,
	"reward_per_token_stored" numeric,
	"start_time" timestamp,
	"end_time" timestamp,
	"rewards_duration" numeric,
	"last_update_time" timestamp,
	"period_finish" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staking_positions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pool_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"reward_per_token_paid" numeric DEFAULT '0',
	"rewards" numeric DEFAULT '0',
	"last_update_time" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"status" "task_status" DEFAULT 'NOT_STARTED',
	"completed" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"points" numeric NOT NULL,
	"type" "task_type",
	"frequency" "task_frequency",
	"category" "task_category",
	"action_data" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"is_admin" boolean DEFAULT false,
	"is_moderator" boolean DEFAULT false,
	"telegram_username" text,
	"telegram_id" text,
	"twitter_uid" text,
	"twitter_username" text,
	"referral_code" text,
	"secret_code" text,
	"address" text,
	"total_rewards" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_telegram_username_unique" UNIQUE("telegram_username"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_twitter_uid_unique" UNIQUE("twitter_uid"),
	CONSTRAINT "users_twitter_username_unique" UNIQUE("twitter_username"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "users_secret_code_unique" UNIQUE("secret_code"),
	CONSTRAINT "users_address_unique" UNIQUE("address")
);
--> statement-breakpoint
ALTER TABLE "daily_task_reset" ADD CONSTRAINT "daily_task_reset_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staking_positions" ADD CONSTRAINT "staking_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staking_positions" ADD CONSTRAINT "staking_positions_pool_id_staking_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."staking_pools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referrer_idx" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_user_task" ON "rewards" USING btree ("user_id","task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_pool_unique" ON "staking_positions" USING btree ("user_id","pool_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_task" ON "task_completions" USING btree ("user_id","task_id");--> statement-breakpoint
CREATE INDEX "rewards_idx" ON "users" USING btree ("total_rewards","created_at");