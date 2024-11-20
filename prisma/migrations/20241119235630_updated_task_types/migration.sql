-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('BASED', 'ONCHAIN', 'PARTNER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VerifyMethod" AS ENUM ('AUTOMATIC', 'ADMIN_VERIFY');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('WELCOME', 'TASK_COMPLETION', 'REFERRAL', 'DAILY_CHECK_IN', 'WEB3_INTERACTION');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TWITTER_FOLLOW', 'TWITTER_QUOTE_RETWEET', 'TELEGRAM_JOIN', 'INVITE', 'SHARE_POST', 'TRADING', 'BOOST_CHANNEL', 'WEB3_INTERACTION', 'DAILY_CHECK_IN');

-- CreateEnum
CREATE TYPE "TaskFrequency" AS ENUM ('DAILY', 'WEEKLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "PoolName" AS ENUM ('NITRO_BOOST', 'TURBO_CHARGE', 'SUPERSONIC_STAKE', 'DRAG_RACE_REWARDS', 'OCTANE_OVERDRIVE', 'FUEL_INJECTION', 'PIT_STOP_PROFITS', 'VELOCITY_VAULT', 'IGNITION', 'COMBUSTION_CHAMBER', 'HIGH_OCTANE_REWARDS', 'FUEL_CELL_FRENZY', 'CATALYST_CONVERTER', 'THERMAL_THRUST', 'POWER_SURGE', 'ROCKET_TO_THE_MOON', 'DIAMOND_HANDS_VAULT', 'HODL_HORSEPOWER', 'DEGEN_DRAG_RACE', 'MEME_MOMENTUM', 'BULL_RUN_BOOSTER', 'WHALE_WATCHER_REWARDS', 'CRYPTO_COMBUSTION', 'MEME_MACHINE_NITRO', 'BLOCKCHAIN_BURNOUT', 'DEFI_DRIFT', 'TOKEN_TURBO_BOOST', 'NFT_NITROUS_OXIDE', 'SMART_CONTRACT_SPEEDWAY');

-- CreateEnum
CREATE TYPE "PoolCategory" AS ENUM ('SPEED', 'COMBUSTION', 'CRYPTO', 'HYBRID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "telegramId" TEXT,
    "twitterUsername" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalRewards" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" DECIMAL(65,30) NOT NULL,
    "type" "TaskType" NOT NULL,
    "frequency" "TaskFrequency" NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "actionData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "completed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTaskReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTaskReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "taskId" TEXT,
    "type" "RewardType" NOT NULL,
    "claimed" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakingPool" (
    "id" TEXT NOT NULL,
    "poolName" "PoolName" NOT NULL,
    "category" "PoolCategory" NOT NULL,
    "totalSupply" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rewardRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rewardAmount" DECIMAL(65,30) NOT NULL,
    "rewardPerTokenStored" DECIMAL(65,30) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "rewardsDuration" DECIMAL(65,30) NOT NULL,
    "lastUpdateTime" TIMESTAMP(3) NOT NULL,
    "periodFinish" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakingPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakingPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "rewardPerTokenPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rewards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastUpdateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakingPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterUsername_key" ON "User"("twitterUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_userId_taskId_key" ON "TaskCompletion"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTaskReset_userId_key" ON "DailyTaskReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_userId_taskId_key" ON "Reward"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "StakingPool_id_key" ON "StakingPool"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StakingPosition_userId_poolId_key" ON "StakingPosition"("userId", "poolId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTaskReset" ADD CONSTRAINT "DailyTaskReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakingPosition" ADD CONSTRAINT "StakingPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakingPosition" ADD CONSTRAINT "StakingPosition_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "StakingPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
