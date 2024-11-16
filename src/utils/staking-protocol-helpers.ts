import { prisma } from "@/lib/prisma";
import { Prisma, StakingPool, StakingPosition } from "@prisma/client/edge";

const { Decimal } = Prisma;

interface StakingPositionWithPool extends StakingPosition {
	pool: StakingPool;
}
export class StakingCalculator {
	static PRECISION = new Decimal("1e18");
	static async calculateRewardPerTokenStored(pool: StakingPool) {
		console.log("in....");
		if (!pool || pool.totalSupply.equals(0)) {
			return pool.rewardPerTokenStored;
		}

		const lastTimeRewardApplicable = Math.min(
			Date.now(),
			pool.endTime.getTime(),
		);

		const timeDiff = new Decimal(
			Math.max(lastTimeRewardApplicable - pool.lastUpdateTime.getTime(), 0),
		).div(1000); // Convert to seconds

		const additionalReward = timeDiff
			.mul(pool.rewardRate)
			.mul(this.PRECISION)
			.div(pool.totalSupply);

		return pool.rewardPerTokenStored.add(additionalReward);
	}

	// Replicates earned() from Synthetix
	static async calculateEarned(position: StakingPositionWithPool) {
		if (!position || position.amount.equals(0)) {
			return new Decimal(0);
		}

		const rewardPerToken = await this.calculateRewardPerTokenStored(
			position.pool,
		);
		const rewardDelta = rewardPerToken.sub(position.rewardPerTokenPaid);

		return position.amount
			.mul(rewardDelta)
			.div(this.PRECISION)
			.add(position.rewards);
	}

	// Replicates updateReward modifier functionality
	static async updateReward(userId: string, poolId: string) {
		const pool = await prisma.stakingPool.findUnique({
			where: { id: poolId },
			include: {
				positions: {
					where: { userId },
				},
			},
		});

		if (!pool) {
			console.log("DID NOT found pool andn position");
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

		console.log({ rewardPerTokenStored: Number(rewardPerTokenStored) });

		const earned = await this.calculateEarned(
			position as StakingPositionWithPool,
		);
		
		// Update pool
		await prisma.stakingPool.update({
			where: { id: poolId },
			data: {
				rewardPerTokenStored: new Decimal(rewardPerTokenStored),
				lastUpdateTime: new Date(),
			},
		});

		console.log("staking pool update completed");
		if (position) {
			console.log("done1");
			await prisma.stakingPosition.update({
				where: { id: position.id },
				data: {
					rewards: earned,
					rewardPerTokenPaid: rewardPerTokenStored,
					lastUpdateTime: new Date(),
				},
			});
			console.log("done22");
		}

		return {
			pool,
			position,
			rewardPerTokenStored,
			// lastTimeRewardApplicable,
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
