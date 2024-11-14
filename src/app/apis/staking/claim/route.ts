import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const { Decimal } = Prisma;

export async function POST(req: Request) {
	try {
		const { userId, poolId, amount } = await req.json();

		// if (!amount || new Decimal(amount).equals(0)) {
		// 	return NextResponse.json({ error: "Cannot withdraw 0" }, { status: 400 });
		// }

		const result = await prisma.$transaction(async (tx) => {
			// Update rewards
			const { pool } = await StakingCalculator.updateReward(userId, poolId);
			const position = pool.positions.find(
				(position) => position.userId === userId,
			);

			if (!position) {
				return NextResponse.json(
					{ error: "Position not found" },
					{ status: 500 },
				);
				// throw new Error("Insufficient staked balance");
			}

			// Update position
			await tx.stakingPosition.update({
				where: { id: position.id },
				data: {
					amount: { decrement: amount },
				},
			});

			// Update pool's total supply
			await tx.stakingPool.update({
				where: { id: poolId },
				data: {
					totalSupply: { decrement: amount },
				},
			});

			// Return tokens to user's balance
			await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { increment: amount },
				},
			});

			return position;
		});

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
