// app/api/pools/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PoolCategory, PoolName, Prisma } from "@prisma/client/edge";

const { Decimal } = Prisma;

const createPoolSchema = z.object({
	poolName: z.nativeEnum(PoolName),
	category: z.nativeEnum(PoolCategory),
	rewardAmount: z.number().positive(),
	startTime: z.string().datetime(),
	endTime: z.string().datetime(),
});

export async function GET() {
	try {
		const pools = await prisma.stakingPool.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				positions: true,
			},
		});

		return NextResponse.json(pools);
	} catch (error) {
		console.error("Failed to fetch pools:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pools" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const validatedData = createPoolSchema.parse(body);
		console.log({ body });
		const { poolName, category, rewardAmount, startTime, endTime } =
			validatedData;

		const startDate = new Date(startTime);
		const endDate = new Date(endTime);
		const durationInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

		const calculatedRewardRate = new Decimal(rewardAmount).div(
			durationInSeconds,
		);

		const pool = await prisma.stakingPool.create({
			data: {
				poolName,
				category,
				rewardAmount: new Decimal(rewardAmount),
				rewardRate: calculatedRewardRate,
				startTime: startDate,
				endTime: endDate,
				lastUpdateTime: startDate,
				rewardsDuration: new Decimal(durationInSeconds),
				periodFinish: new Decimal(durationInSeconds),
				totalSupply: new Decimal(0),
				rewardPerTokenStored: new Decimal(0),
			},
		});

		return NextResponse.json(pool);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.errors }, { status: 400 });
		}
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
