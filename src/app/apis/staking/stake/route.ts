import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { Prisma } from "@prisma/client";
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

		const latestPool = await prisma.stakingPool.findFirst({
			where: {
				startTime: { lte: new Date() },
				endTime: { gt: new Date() },
			},
			orderBy: { startTime: "desc" },
		});
		// console.log(latestPool);
		if (!latestPool) {
			return NextResponse.json(
				{ error: "No active pool found" },
				{ status: 400 },
			);
		}

		const poolId = latestPool.id;

		// Start transaction
		const result = await prisma.$transaction(async (tx) => {
			await StakingCalculator.updateReward(userId, poolId);

			const user = await tx.user.findUnique({
				where: { id: userId },
			});

			console.log({
				stakingAmount: Number(amount),
				userBalanceSum: Number(
					user?.poctBalance.plus(user?.telegramAgeOCTRewards),
				),
			});
			if (!user) {
				throw new Error("User not found");
			}

			const totalBalance = user.poctBalance.plus(user.telegramAgeOCTRewards);
			console.log({ amount, totalBalance: Number(totalBalance) });
			if (Number(totalBalance) < Number(amount)) {
				throw new Error("Insufficient balance");
			}

			console.log("updating user...starts");

			await tx.user.update({
				where: { id: userId },
				data: {
					poctBalance: { decrement: amount },
				},
			});

			console.log("updating position...starts");

			const position = await tx.stakingPosition.upsert({
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
			console.log({ position });

			console.log("updating stakingpool...starts");

			await tx.stakingPool.update({
				where: { id: poolId },
				data: {
					totalSupply: { increment: amount },
				},
			});

			console.log("done...");

			return position;
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
