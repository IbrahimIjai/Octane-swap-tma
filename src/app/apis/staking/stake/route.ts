import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
const { Decimal } = Prisma;

export const runtime = "edge";
export async function POST(req: Request) {
	try {
		const { userId, amount } = await req.json();

		// console.log({ amount, userId });
		// if (!amount || new Decimal(amount).equals(0)) {
		// 	return NextResponse.json({ error: "Cannot stake 0" }, { status: 400 });
		// }

		// //get latest pool

		// const latestPool = await prisma.stakingPool.findFirst({
		// 	where: {
		// 		startTime: { lte: new Date() },
		// 		endTime: { gt: new Date() },
		// 	},
		// 	orderBy: { startTime: "desc" },
		// });

		// if (!latestPool) {
		// 	return NextResponse.json(
		// 		{ error: "No active pool found" },
		// 		{ status: 400 },
		// 	);
		// }

		// // Check for existing positions in other pools
		// const activePositions = await prisma.stakingPosition.findMany({
		// 	where: {
		// 		userId,
		// 		amount: { gt: 0 },
		// 		NOT: { poolId: latestPool.id },
		// 	},
		// });

		// if (activePositions.length > 0) {
		// 	return NextResponse.json(
		// 		{ error: "Already staking in another pool" },
		// 		{ status: 400 },
		// 	);
		// }

		// const poolId = latestPool.id;

		// Start transaction
		// const result = await prisma.$transaction(async (tx) => {
		// 	const user = await tx.user.findUnique({
		// 		where: { id: userId },
		// 	});

		// 	if (!user) {
		// 		throw new Error("User not found");
		// 	}
		// 	const totalBalance = user.poctBalance.plus(user.telegramAgeOCTRewards);
		// 	if (totalBalance.lt(amount)) throw new Error("Insufficient balance");

		// 	// Update user balance
		// 	await tx.user.update({
		// 		where: { id: userId },
		// 		data: {
		// 			poctBalance: { decrement: totalBalance },
		// 		},
		// 	});

		// 	const position = await tx.stakingPosition.upsert({
		// 		where: { userId_poolId: { userId, poolId: latestPool.id } },
		// 		create: {
		// 			userId,
		// 			poolId: latestPool.id,
		// 			amount: new Decimal(totalBalance),
		// 			lastUpdateTime: new Date(),
		// 			rewardPerTokenPaid: latestPool.rewardPerTokenStored,
		// 		},
		// 		update: {
		// 			amount: { increment: new Decimal(totalBalance) },
		// 			lastUpdateTime: new Date(),
		// 		},
		// 	});
		// 	// const position = await tx.stakingPosition.upsert({
		// 	// 	where: { userId_poolId: { userId, poolId } },
		// 	// 	create: {
		// 	// 		userId,
		// 	// 		poolId,
		// 	// 		amount: new Decimal(amount),
		// 	// 		lastUpdateTime: new Date(),
		// 	// 	},
		// 	// 	update: {
		// 	// 		amount: { increment: amount },
		// 	// 		lastUpdateTime: new Date(),
		// 	// 	},
		// 	// });

		// 	// Update pool
		// 	await tx.stakingPool.update({
		// 		where: { id: latestPool.id },
		// 		data: {
		// 			totalSupply: { increment: amount },
		// 			lastUpdateTime: new Date(),
		// 		},
		// 	});

		// 	return position;
		// });

		// console.log({ result });

		// return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
