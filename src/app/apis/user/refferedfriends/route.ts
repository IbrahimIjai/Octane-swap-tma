import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const referrals = await prisma.referral.findMany({
			where: { referrerId: userId },
			include: {
				referred: {
					select: {
						telegramId: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const referredFriends = referrals.map((referral) => ({
			id: referral.id,
			telegramId: referral.referred.telegramId,
			createdAt: referral.createdAt,
			rewardAmount: 100,
		}));

		return NextResponse.json(referredFriends);
	} catch (error) {
		console.error("Error fetching referred friends:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
