// app/api/pools/route.ts
import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { PoolCategory, PoolName, Prisma } from "@prisma/client";
import { db } from "@/db/drizzle";
import { stakingPools } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const poolNameValues = [
	"NITRO_BOOST", "TURBO_CHARGE", "SUPERSONIC_STAKE", "DRAG_RACE_REWARDS",
	"OCTANE_OVERDRIVE", "FUEL_INJECTION", "PIT_STOP_PROFITS", "VELOCITY_VAULT",
	"IGNITION", "COMBUSTION_CHAMBER", "HIGH_OCTANE_REWARDS", "FUEL_CELL_FRENZY",
	"CATALYST_CONVERTER", "THERMAL_THRUST", "POWER_SURGE", "ROCKET_TO_THE_MOON",
	"DIAMOND_HANDS_VAULT", "HODL_HORSEPOWER", "DEGEN_DRAG_RACE", "MEME_MOMENTUM",
	"BULL_RUN_BOOSTER", "WHALE_WATCHER_REWARDS", "CRYPTO_COMBUSTION", "MEME_MACHINE_NITRO",
	"BLOCKCHAIN_BURNOUT", "DEFI_DRIFT", "TOKEN_TURBO_BOOST", "NFT_NITROUS_OXIDE",
	"SMART_CONTRACT_SPEEDWAY",
] as const;

const poolCategoryValues = ["SPEED", "COMBUSTION", "CRYPTO", "HYBRID"] as const;

const createPoolSchema = z.object({
	poolName: z.enum(poolNameValues),
	category: z.enum(poolCategoryValues),
	rewardAmount: z.number().positive(),
	startTime: z.string().datetime(),
	endTime: z.string().datetime(),
});

export async function GET() {
	try {
		// PRISMA: const pools = await prisma.stakingPool.findMany({ orderBy: { createdAt: "desc" }, include: { positions: true } });
		const pools = await db.query.stakingPools.findMany({
			orderBy: desc(stakingPools.createdAt),
			with: { positions: true },
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
		const { poolName, category, rewardAmount, startTime, endTime } = validatedData;

		const startDate = new Date(startTime);
		const endDate = new Date(endTime);
		const durationInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

		const calculatedRewardRate = rewardAmount / durationInSeconds;

		// PRISMA: const pool = await prisma.stakingPool.create({ data: { ... } });
		const [pool] = await db
			.insert(stakingPools)
			.values({
				id: randomUUID(),
				poolName,
				category,
				rewardAmount: String(rewardAmount),
				rewardRate: String(calculatedRewardRate),
				startTime: startDate,
				endTime: endDate,
				lastUpdateTime: startDate,
				rewardsDuration: String(durationInSeconds),
				periodFinish: String(durationInSeconds),
				totalSupply: "0",
				rewardPerTokenStored: "0",
			})
			.returning();

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
