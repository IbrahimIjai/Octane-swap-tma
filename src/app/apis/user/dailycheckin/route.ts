// pages/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTelegramAgeReward } from "@/lib/utils";

import { addDays, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { Prisma } from "@prisma/client";

// const { Decimal } = Prisma;

export async function GET(request: NextRequest) {
	const userId = request.nextUrl.searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		// Find the user's last daily task reset
		const dailyTaskReset = await prisma.dailyTaskReset.findUnique({
			where: { userId },
		});

		// Define the timezone (UTC+1)
		const timeZone = "Europe/Paris";
		const now = new Date();
		const zonedNow = toZonedTime(now, timeZone);
		const startOfToday = startOfDay(zonedNow);

		// Check if user has already claimed today's reward
		const shouldShowModal =
			!dailyTaskReset || dailyTaskReset.lastReset < startOfToday;

		return NextResponse.json({ shouldShowModal });
	} catch (error) {
		console.error("Error checking daily login:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		// Define the timezone (UTC+1)
		const timeZone = "Europe/Paris";
		const now = new Date();
		const zonedNow = toZonedTime(now, timeZone);
		const startOfToday = startOfDay(zonedNow);

		const dailyCheckInReward = 5; // Reward amount

		const updatedUser = await prisma.$transaction(async (tx) => {
			// Get the user's last daily task reset
			const dailyTaskReset = await tx.dailyTaskReset.findUnique({
				where: { userId },
			});

			// Check if user already claimed today's reward
			if (dailyTaskReset && dailyTaskReset.lastReset >= startOfToday) {
				throw new Error("Daily reward already claimed.");
			}

			// Update the user's total rewards
			const user = await tx.user.update({
				where: { id: userId },
				data: {
					totalRewards: { increment: dailyCheckInReward },
				},
			});

			// Create a reward log entry
			await tx.reward.create({
				data: {
					userId,
					amount: dailyCheckInReward,
					type: "DAILY_CHECK_IN",
				},
			});

			// Update or create the daily task reset
			if (dailyTaskReset) {
				await tx.dailyTaskReset.update({
					where: { userId },
					data: { lastReset: now },
				});
			} else {
				await tx.dailyTaskReset.create({
					data: { userId, lastReset: now },
				});
			}

			return user;
		});

		return NextResponse.json({ success: true, updatedUser });
	} catch (error) {
		console.error("Error claiming daily reward:", error);

		return NextResponse.json(
			{ error: error ?? "Internal server error" },
			{ status: 500 },
		);
	}
}
