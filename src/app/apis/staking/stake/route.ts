import { prisma } from "@/lib/prisma";
import { poolInfo, StakingCalculator } from "@/utils/staking-protocol-helpers";
import { Prisma } from "@prisma/client";
import { error } from "console";
import { NextResponse } from "next/server";
const { Decimal } = Prisma;
export const runtime = "edge";
export async function POST(req: Request) {
	try {
		const { userId, amount } = await req.json();

		console.log({ amount, userId });
		if (!amount || new Decimal(amount).equals(0)) {
			return NextResponse.json({ error: "Cannot stake 0" }, { status: 400 });
		}

		//get latest pool

		const { latestPool } = await poolInfo.getPools();
		console.log({ latestPool });
		const poolId = latestPool.id;

		// Start transaction
		const result = await prisma.$transaction(async (tx) => {
			await StakingCalculator.updateReward(userId, poolId);

			// Check user balance
			const __user = await tx.user.findUnique({
				where: { id: userId },
			});

			console.log();
			if (
				!__user ||
				__user.poctBalance.plus(__user.telegramAgeOCTRewards).lessThan(amount)
			) {
				throw new Error("Insufficient balance");
			}

			// Deduct from user's balance
			await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { decrement: amount },
				},
			});

			// Update user's staking position
			const __position = await tx.stakingPosition.upsert({
				where: { userId_poolId: { userId, poolId } },
				create: {
					userId,
					poolId,
					amount: new Decimal(amount),
					lastUpdateTime: new Date(),
				},
				update: {
					amount: { increment: amount },
					lastUpdateTime: new Date(),
				},
			});

			// Update pool's total supply
			await tx.stakingPool.update({
				where: { id: poolId },
				data: {
					totalSupply: { increment: amount },
				},
			});

			return __position;
		});

		console.log({ result });

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
