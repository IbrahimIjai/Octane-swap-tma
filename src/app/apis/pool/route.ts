// app/api/pools/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client/edge";

const { Decimal } = Prisma;

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
		const {
			rewardAmount, // Total rewards for the pool
			startTime, // Pool start timestamp
			endTime,
			duration, // Duration in days
			rewardRate, // Opytional: rewards per second. If not provided, calculated from rewardAmount and duration
		} = await req.json();

		// Convert duration to seconds
		const durationInSeconds = 3 * 24 * 60 * 60;
		console.log("i am in....");
		const calculatedRewardRate =
			rewardRate || new Decimal(rewardAmount).div(durationInSeconds);

		console.log({
			rewardAmount: new Decimal(rewardAmount),
			rewardRate: calculatedRewardRate,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			lastUpdateTime: new Date(startTime),
			rewardsDuration: new Decimal(durationInSeconds),
			periodFinish: new Decimal(durationInSeconds),
			totalSupply: new Decimal(0),
			rewardPerTokenStored: new Decimal(0),
		});
		const pool = await prisma.stakingPool.create({
			data: {
				rewardAmount: new Decimal(rewardAmount),
				rewardRate: calculatedRewardRate,
				startTime: new Date(startTime),
				endTime: new Date(endTime),
				lastUpdateTime: new Date(startTime),
				rewardsDuration: new Decimal(durationInSeconds),
				periodFinish: new Decimal(durationInSeconds),
				totalSupply: new Decimal(0),
				rewardPerTokenStored: new Decimal(0),
			},
		});

		console.log({ pool, msg: "finished" });

		return NextResponse.json(pool);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
