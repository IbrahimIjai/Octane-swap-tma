// pages/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { Prisma } from "@prisma/client";
import { db } from "@/db/drizzle";
import { users, dailyTaskReset, rewards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { randomUUID } from "crypto";
import { addDays, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: NextRequest) {
	const userId = request.nextUrl.searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		// PRISMA: const dailyTaskReset = await prisma.dailyTaskReset.findUnique({ where: { userId } });
		const dailyTaskResetRow = await db.query.dailyTaskReset.findFirst({
			where: eq(dailyTaskReset.userId, userId),
		});

		const timeZone = "Europe/Paris";
		const now = new Date();
		const zonedNow = toZonedTime(now, timeZone);
		const startOfToday = startOfDay(zonedNow);

		const shouldShowModal =
			!dailyTaskResetRow || dailyTaskResetRow.lastReset < startOfToday;

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

		const timeZone = "Europe/Paris";
		const now = new Date();
		const zonedNow = toZonedTime(now, timeZone);
		const startOfToday = startOfDay(zonedNow);

		const dailyCheckInReward = 5;

		// PRISMA: const updatedUser = await prisma.$transaction(async (tx) => { ... });

		const dailyTaskResetRow = await db.query.dailyTaskReset.findFirst({
			where: eq(dailyTaskReset.userId, userId),
		});

		if (dailyTaskResetRow && dailyTaskResetRow.lastReset >= startOfToday) {
			throw new Error("Daily reward already claimed.");
		}

		// Update user rewards
		const [user] = await db
			.update(users)
			.set({
				totalRewards: sql`CAST(${users.totalRewards} AS NUMERIC) + ${dailyCheckInReward}`,
			})
			.where(eq(users.id, userId))
			.returning();

		// Create reward log
		await db.insert(rewards).values({
			id: randomUUID(),
			userId,
			amount: String(dailyCheckInReward),
			type: "DAILY_CHECK_IN",
		});

		// Update or create daily task reset
		if (dailyTaskResetRow) {
			await db
				.update(dailyTaskReset)
				.set({ lastReset: now })
				.where(eq(dailyTaskReset.userId, userId));
		} else {
			await db.insert(dailyTaskReset).values({
				id: randomUUID(),
				userId,
				lastReset: now,
			});
		}

		return NextResponse.json({ success: true, updatedUser: user });
	} catch (error) {
		console.error("Error claiming daily reward:", error);
		return NextResponse.json(
			{ error: error ?? "Internal server error" },
			{ status: 500 },
		);
	}
}
