import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { userId, poolId, amount } = await req.json();

		// Start transaction
		const result = await prisma.$transaction(async (tx) => {
			// Update user's rewards before staking
			const position = await tx.stakingPosition.findUnique({
				where: { userId_poolId: { userId, poolId } },
			});

			if (position) {
				const earned = await StakingCalculator.calculateEarned(position.id);
				await tx.stakingPosition.update({
					where: { id: position.id },
					data: {
						rewards: earned,
						lastUpdateTime: new Date(),
					},
				});
			}

			// Update user balance
			const user = await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { decrement: amount },
				},
			});

			if (user.poctBalance.lt(0)) {
				throw new Error("Insufficient balance");
			}

			// Update or create staking position
			const updatedPosition = await tx.stakingPosition.upsert({
				where: { userId_poolId: { userId, poolId } },
				create: {
					userId,
					poolId,
					amount,
					lastUpdateTime: new Date(),
				},
				update: {
					amount: { increment: amount },
					lastUpdateTime: new Date(),
				},
			});

			// Update pool total supply
			await tx.stakingPool.update({
				where: { id: poolId },
				data: {
					totalSupply: { increment: amount },
					lastUpdateTime: new Date(),
				},
			});

			return updatedPosition;
		});

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 400 },
		);
	}
}
