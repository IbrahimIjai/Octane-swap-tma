import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { error } from "console";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { userId: string } },
) {
	try {
		const latestPool = await prisma.stakingPool.findFirst({
			where: {
				startTime: { lte: new Date() },
				endTime: { gt: new Date() },
			},
			orderBy: { startTime: "desc" },
		});

		console.log({ latestPool });
		console.log("starting....");
		// if (latestPool) {
		if (!latestPool) {
			return NextResponse.json({ error: "no latest pool" });
		}
		await StakingCalculator.updateReward(params.userId, latestPool?.id);
		console.log("....updated current pool");
		// }

		const positions = await prisma.stakingPosition.findMany({
			where: {
				userId: params.userId,
			},
			include: {
				pool: true,
			},
		});

		return NextResponse.json(positions);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
