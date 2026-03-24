import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { users, referrals, rewards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		// PRISMA: const user = await prisma.user.findUnique({ where: { id: userId }, include: { referrals: true, Rewards: { where: { type: "REFERRAL" } } } });
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			with: {
				referrals: true,
				Rewards: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const referralRewards = user.Rewards.filter((r) => r.type === "REFERRAL");

		const stats = {
			activeReferrals: user.referrals.length,
			totalInvites: user.referrals.length,
			rewardsEarned: referralRewards.reduce(
				(sum, reward) => sum + Number(reward.amount),
				0,
			),
			currentPoints: Number(user.totalRewards),
		};

		return NextResponse.json(stats);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
