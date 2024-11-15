import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const { Decimal } = Prisma;

export async function POST(req: Request) {
	try {
		const { userId, poolId } = await req.json();

		// if (!amount || new Decimal(amount).equals(0)) {
		// 	return NextResponse.json({ error: "Cannot withdraw 0" }, { status: 400 });
		// }

		console.log({ poolId, userId });

		const result = await prisma.$transaction(async (tx) => {
			// Update rewards
			const { pool, position } = await StakingCalculator.updateReward(
				userId,
				poolId,
			);

			if (!position) {
				return NextResponse.json(
					{ error: "Position not found" },
					{ status: 400 },
				);
			}

			// Update position

			await tx.stakingPosition.update({
				where: { id: position.id },
				data: {
					amount: 0,
					rewards: 0,
				},
			});
			// await tx.stakingPosition.update({
			// 	where: { id: position.id },
			// 	data: {
			// 		amount: { decrement: position.amount },
			// 		rewards: { decrement: position.rewards },
			// 	},
			// });
			// console.log({ amunt: position.amount, rewards: position.rewards });
			// Update pool's total supply
			await tx.stakingPool.update({
				where: { id: poolId },
				data: {
					totalSupply: { decrement: position.amount },
					rewardAmount: { decrement: position.rewards },
				},
			});

			// Return tokens to user's balance
			await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { increment: position.amount.plus(position.rewards) },
				},
			});

			return {
				claimedAmount: position.amount.plus(position.rewards).toString(),
				message: "Rewards and staked amount claimed successfully",
			};
		});

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
