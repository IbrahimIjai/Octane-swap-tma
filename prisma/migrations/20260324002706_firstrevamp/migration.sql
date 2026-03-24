/*
  Warnings:

  - You are about to drop the column `referredBy` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegramUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[twitterUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[secretCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telegramUsername` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TaskType" ADD VALUE 'INSTAGRAM_FOLLOW';
ALTER TYPE "TaskType" ADD VALUE 'YOUTUBE_SUBSCRIBE';
ALTER TYPE "TaskType" ADD VALUE 'YOUTUBE_WATCH';
ALTER TYPE "TaskType" ADD VALUE 'TELEGRAM_STORY';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referredBy_fkey";

-- AlterTable
ALTER TABLE "DailyTaskReset" ALTER COLUMN "lastReset" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Reward" ALTER COLUMN "claimed" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TaskCompletion" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED',
ALTER COLUMN "completed" DROP NOT NULL,
ALTER COLUMN "completed" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referredBy",
ADD COLUMN     "isModerator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "secretCode" TEXT,
ADD COLUMN     "telegramUsername" TEXT NOT NULL,
ADD COLUMN     "twitterUid" TEXT,
ALTER COLUMN "referralCode" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUsername_key" ON "User"("telegramUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterUid_key" ON "User"("twitterUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_secretCode_key" ON "User"("secretCode");

-- CreateIndex
CREATE INDEX "User_totalRewards_createdAt_idx" ON "User"("totalRewards" DESC, "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
