import { prisma } from "@/lib/prisma";
import { Prisma, StakingPool } from "@prisma/client/edge";

const { Decimal } = Prisma;


export class StakingCalculator {
	static async calculateRewardPerTokenStored(pool: StakingPool) {
	

		if (!pool || pool.totalSupply.equals(0)) {
			return new Decimal(0);
		}

		const lastTimeRewardApplicable = Math.min(
			Date.now(),
			pool.endTime.getTime(),
		);

		const timeDiff = new Decimal(
			Math.max(lastTimeRewardApplicable - pool.lastUpdateTime.getTime(), 0),
		).div(1000); // Convert to seconds

		return pool.rewardPerTokenStored.add(
			timeDiff.mul(pool.rewardRate).mul(1e18).div(pool.totalSupply),
		);
	}

	// Replicates earned() from Synthetix
	static async calculateEarned(positionId: string) {
		const position = await prisma.stakingPosition.findUnique({
			where: { id: positionId },
			include: { pool: true },
		});

		if (!position) {
			return new Decimal(0);
		}

		const rewardPerToken = await this.calculateRewardPerTokenStored(
			position.pool,
		);

		return position.amount
			.mul(rewardPerToken.sub(position.rewardPerTokenPaid))
			.div(1e18)
			.add(position.rewards);
	}

	// Replicates updateReward modifier functionality
	static async updateReward(userId: string, poolId: string) {
		const pool = await prisma.stakingPool.findUnique({
			where: { id: poolId },
			include: {
				positions: true,
			},
		});

		if (!pool) {
			console.log("DID NOT found pool andn position");
			throw new Error("Pool and Position not found");
		}


		const position = pool.positions.find(
			(position) => position.userId === userId,
		);

		console.log("found pool andn position")

		const rewardPerTokenStored = await this.calculateRewardPerTokenStored(pool);
		const lastTimeRewardApplicable = Math.min(
			Date.now(),
			pool.endTime.getTime(),
		);

		// Update pool
		await prisma.stakingPool.update({
			where: { id: poolId },
			data: {
				rewardPerTokenStored,
				lastUpdateTime: new Date(lastTimeRewardApplicable),
			},
		});

		// If there's a user, update their position
		if (userId) {
			if (position) {
				const earned = await this.calculateEarned(position.id);
				await prisma.stakingPosition.update({
					where: { id: position.id },
					data: {
						rewards: earned,
						rewardPerTokenPaid: rewardPerTokenStored,
						lastUpdateTime: new Date(lastTimeRewardApplicable),
					},
				});
			}
		}

		return {
			pool,
			position,
			rewardPerTokenStored,
			lastTimeRewardApplicable,
		};
	}
}

export class poolInfo {
	static async getPools() {
		const pools = await prisma.stakingPool.findMany({
			orderBy: {
				startTime: "desc",
			},
			select: {
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
