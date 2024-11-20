// pages/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// const { Decimal } = Prisma;
export async function GET(req: NextRequest) {
	// await corsMiddleware(req, NextResponse);

	const { searchParams } = new URL(req.url);
	const telegramId = searchParams.get("telegramId");

	if (!telegramId) {
		return NextResponse.json(
			{ error: "Telegram ID is required" },
			{ status: 400 },
		);
	}

	try {
		const user = await prisma.user.findUnique({
			where: { telegramId },
			include: {
				StakingPositions: {
					include: {
						pool: true,
					},
				},

				TaskCompletions: {
					include: {
						task: true,
					},
				},

				Rewards: {
					include: {
						task: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ user: undefined });
		}

		return NextResponse.json(user);
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
		const { telegramId, referralCode } = body;

		if (!telegramId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const telegramAgeOCTRewards = calculateTelegramAgeReward(telegramId);

		console.log({ telegramAgeOCTRewards, telegramId });

		let referredByUser = null;
		if (referralCode) {
			referredByUser = await prisma.user.findUnique({
				where: { referralCode },
			});
		}

		const user = await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					telegramId,
					referralCode: `REF${Math.random().toString(36).substr(2, 9)}`,
					referredBy: referredByUser ? referredByUser.id : null,
				},
			});
			await tx.reward.create({
				data: {
					userId: newUser.id,
					amount: telegramAgeOCTRewards,
					type: "WELCOME",
				},
			});
			await tx.user.update({
				where: { id: newUser.id },
				data: { totalRewards: { increment: telegramAgeOCTRewards } },
			});
			if (referredByUser) {
				const referralReward = 100; // Set your referral reward amount
				await tx.reward.create({
					data: {
						userId: referredByUser.id,
						amount: referralReward,
						type: "REFERRAL",
					},
				});
				await tx.user.update({
					where: { id: referredByUser.id },
					data: { totalRewards: { increment: referralReward } },
				});
			}

			return newUser;
		});

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
