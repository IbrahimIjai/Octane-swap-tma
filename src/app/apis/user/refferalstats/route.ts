import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "Missing userId" }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				referrals: true,
				Rewards: {
					where: { type: "REFERRAL" },
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const stats = {
			activeReferrals: user.referrals.length,
			totalInvites: user.referrals.length,
			rewardsEarned: user.Rewards.reduce(
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
