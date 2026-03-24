// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { stakingPools, stakingPositions } from "@/db/schema";
import { eq, and, lte, gt, desc } from "drizzle-orm";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { userId: string } },
) {
	try {
		// PRISMA: const latestPool = await prisma.stakingPool.findFirst({ where: { startTime: { lte: new Date() }, endTime: { gt: new Date() } }, orderBy: { startTime: "desc" } });
		const latestPool = await db.query.stakingPools.findFirst({
			where: and(
				lte(stakingPools.startTime, new Date()),
				gt(stakingPools.endTime, new Date()),
			),
			orderBy: desc(stakingPools.startTime),
		});

		console.log({ latestPool });
		console.log("starting....");
		if (!latestPool) {
			return NextResponse.json({ error: "no latest pool" });
		}
		await StakingCalculator.updateReward(params.userId, latestPool?.id);
		console.log("....updated current pool");

		// PRISMA: const positions = await prisma.stakingPosition.findMany({ where: { userId: params.userId }, include: { pool: true } });
		const positions = await db.query.stakingPositions.findMany({
			where: eq(stakingPositions.userId, params.userId),
			with: { pool: true },
		});

		return NextResponse.json(positions);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
