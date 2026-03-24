// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { Prisma, StakingPool, StakingPosition } from "@prisma/client";
// PRISMA: const { Decimal } = Prisma;
import { db } from "@/db/drizzle";
import { stakingPools, stakingPositions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { StakingPool, StakingPosition } from "@/db/types";

interface StakingPositionWithPool extends StakingPosition {
	pool: StakingPool;
}

export class StakingCalculator {
	static PRECISION = 1e18;

	static async calculateRewardPerTokenStored(pool: StakingPool) {
		console.log("in....");
		if (!pool || Number(pool.totalSupply) === 0) {
			return Number(pool.rewardPerTokenStored ?? 0);
		}

		const lastTimeRewardApplicable = Math.min(
			Date.now(),
			pool.endTime!.getTime(),
		);

		const timeDiff = Math.max(
			lastTimeRewardApplicable - pool.lastUpdateTime!.getTime(),
			0,
		) / 1000;

		const additionalReward =
			(timeDiff * Number(pool.rewardRate) * this.PRECISION) /
			Number(pool.totalSupply);

		console.log({
			poolrewardsPerTokenstoredzzzzzz:
				Number(pool.rewardPerTokenStored ?? 0) + additionalReward,
		});

		return Number(pool.rewardPerTokenStored ?? 0) + additionalReward;
	}

	static async calculateEarned(position: StakingPositionWithPool) {
		if (!position || Number(position.amount) === 0) {
			return 0;
		}

		const rewardPerToken = await this.calculateRewardPerTokenStored(
			position.pool,
		);
		const rewardDelta = rewardPerToken - Number(position.rewardPerTokenPaid ?? 0);

		return (
			(Number(position.amount) * rewardDelta) / this.PRECISION +
			Number(position.rewards ?? 0)
		);
	}

	static async updateReward(userId: string, poolId: string) {
		// PRISMA: const pool = await prisma.stakingPool.findUnique({ where: { id: poolId }, include: { positions: { where: { userId } } } });
		const pool = await db.query.stakingPools.findFirst({
			where: eq(stakingPools.id, poolId),
			with: { positions: true },
		});

		if (!pool) {
			console.log("DID NOT found pool and position");
			throw new Error("Pool and Position not found");
		}

		const position = pool.positions.find(
			(position) => position.userId === userId,
		);

		if (!position) {
			console.log({ userId, positionsfrompool: pool.positions });
			throw new Error(" Position not found for userId");
		}
		console.log("found pool and position");

		const rewardPerTokenStored = await this.calculateRewardPerTokenStored(pool);

		console.log({ rewardPerTokenStored });

		const earned = await this.calculateEarned(
			{ ...position, pool } as StakingPositionWithPool,
		);

		// Update pool
		console.log("Updating staking pool with rewardspertoken stored....");
		// PRISMA: await prisma.stakingPool.update({ where: { id: poolId }, data: { rewardPerTokenStored, lastUpdateTime: new Date() } });
		await db
			.update(stakingPools)
			.set({
				rewardPerTokenStored: String(rewardPerTokenStored / this.PRECISION),
				lastUpdateTime: new Date(),
			})
			.where(eq(stakingPools.id, poolId));

		console.log("Finished....Updating staking pool with rewardspertoken stored....");

		if (position) {
			console.log("done1");
			// PRISMA: await prisma.stakingPosition.update({ where: { id: position.id }, data: { rewards: earned, rewardPerTokenPaid: rewardPerTokenStored, lastUpdateTime: new Date() } });
			await db
				.update(stakingPositions)
				.set({
					rewards: String(earned),
					rewardPerTokenPaid: String(rewardPerTokenStored),
					lastUpdateTime: new Date(),
				})
				.where(eq(stakingPositions.id, position.id));
			console.log("done22");
		}

		return {
			pool,
			position,
			rewardPerTokenStored,
		};
	}
}

export class poolInfo {
	static async getPools() {
		// PRISMA: const pools = await prisma.stakingPool.findMany({ orderBy: { startTime: "desc" }, select: { ... } });
		const pools = await db.query.stakingPools.findMany({
			orderBy: (stakingPools, { desc }) => [desc(stakingPools.startTime)],
			columns: {
				id: true,
				totalSupply: true,
				rewardRate: true,
				lastUpdateTime: true,
				startTime: true,
				endTime: true,
			},
		});
		const latestPool = pools[0];
		return { pools, latestPool };
	}
}
