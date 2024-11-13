import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
	try {
		const { userId, poolId } = await req.json();

		const result = await prisma.$transaction(async (tx) => {
			const position = await tx.stakingPosition.findUnique({
				where: { userId_poolId: { userId, poolId } },
			});

			if (!position) {
				throw new Error("No staking position found");
			}

			const earned = await StakingCalculator.calculateEarned(position.id);

			// Update user balance with earned rewards
			await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { increment: earned },
				},
			});

			// Reset position rewards
			await tx.stakingPosition.update({
				where: { id: position.id },
				data: {
					rewards: 0,
					lastUpdateTime: new Date(),
				},
			});

			return earned;
		});

		return NextResponse.json({ claimed: result });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 400 },
		);
	}
}
