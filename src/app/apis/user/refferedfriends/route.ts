import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { referrals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const referralResults = await db.query.referrals.findMany({
			where: eq(referrals.referrerId, userId),
			with: {
				referred: true,
			},
			orderBy: desc(referrals.createdAt),
		});

		const referredFriends = referralResults.map((referral) => ({
			id: referral.id,
			telegramId: referral.referred.telegramId,
			createdAt: referral.createdAt,
			rewardAmount: 100,
		}));

		return NextResponse.json(referredFriends);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
