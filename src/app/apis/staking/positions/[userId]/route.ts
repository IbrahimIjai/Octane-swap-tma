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
