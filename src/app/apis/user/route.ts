// pages/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { Prisma } from "@prisma/client";
import { db } from "@/db/drizzle";
import { users, referrals, rewards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const telegramId = searchParams.get("telegramId");

	if (!telegramId) {
		return NextResponse.json(
			{ error: "Telegram ID is required" },
			{ status: 400 },
		);
	}

	try {
		// PRISMA: const user = await prisma.user.findUnique({
		// PRISMA: 	where: { telegramId },
		// PRISMA: 	include: { StakingPositions: { include: { pool: true } }, TaskCompletions: { include: { task: true } }, Rewards: { include: { task: true } } },
		// PRISMA: });
		const user = await db.query.users.findFirst({
			where: eq(users.telegramId, telegramId),
			with: {
				StakingPositions: { with: { pool: true } },
				TaskCompletions: { with: { task: true } },
				Rewards: { with: { task: true } },
			},
		});

		if (!user) {
			return NextResponse.json({ user });
		}

		console.log({ user });
		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { telegramId, telegramUsername, referralCode } = body;

		if (!telegramId || !telegramUsername) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const telegramAgeOCTRewards = calculateTelegramAgeReward(telegramId);

		// PRISMA: const user = await prisma.$transaction(async (tx) => { ... });
		// Drizzle neon-http doesn't support interactive transactions,
		// so we run sequential queries. For atomicity you'd use neon-serverless (ws).
		let referrer = null;

		if (referralCode) {
			referrer = await db.query.users.findFirst({
				where: eq(users.referralCode, referralCode),
			});
		}

		const newUserId = randomUUID();
		const [newUser] = await db
			.insert(users)
			.values({
				id: newUserId,
				telegramId,
				telegramUsername,
			})
			.returning();

		if (referrer) {
			console.log({ referrerCode: referrer.referralCode });
			await db.insert(referrals).values({
				id: randomUUID(),
				referrerId: referrer.id,
				referredId: newUser.id,
			});
			const referralReward = 10;

			await db.insert(rewards).values({
				id: randomUUID(),
				userId: referrer.id,
				amount: String(referralReward),
				type: "REFERRAL",
			});

			await db
				.update(users)
				.set({
					totalRewards: sql`CAST(${users.totalRewards} AS NUMERIC) + ${referralReward}`,
				})
				.where(eq(users.id, referrer.id));
		}

		await db.insert(rewards).values({
			id: randomUUID(),
			userId: newUser.id,
			amount: String(telegramAgeOCTRewards),
			type: "WELCOME",
		});

		await db
			.update(users)
			.set({
				totalRewards: sql`CAST(${users.totalRewards} AS NUMERIC) + ${telegramAgeOCTRewards}`,
			})
			.where(eq(users.id, newUser.id));

		return NextResponse.json(newUser, { status: 200 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: error ?? "Internal server error" },
			{ status: 500 },
		);
	}
}
