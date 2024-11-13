import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";

export class StakingCalculator {
	static async calculateRewardPerToken(poolId: string): Promise<Decimal> {
		const pool = await prisma.stakingPool.findUnique({
			where: { id: poolId },
			select: {
				totalSupply: true,
				rewardRate: true,
				lastUpdateTime: true,
				endTime: true,
			},
		});

		if (!pool || pool.totalSupply.equals(0)) {
			return new Decimal(0);
		}

		const currentTime = new Date();
		const lastTimeRewardApplicable =
			currentTime > pool.endTime ? pool.endTime : currentTime;

		const timeDelta =
			lastTimeRewardApplicable.getTime() - pool.lastUpdateTime.getTime();
		const timeInSeconds = timeDelta / 1000;

		return pool.rewardRate.mul(timeInSeconds).mul(1e18).div(pool.totalSupply);
	}

	static async calculateEarned(positionId: string): Promise<Decimal> {
		const position = await prisma.stakingPosition.findUnique({
			where: { id: positionId },
			include: { pool: true },
		});

		if (!position) {
			return new Decimal(0);
		}

		const rewardPerToken = await this.calculateRewardPerToken(position.poolId);

		return position.amount
			.mul(rewardPerToken.sub(position.rewardPerTokenPaid))
			.div(1e18)
			.add(position.rewards);
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
