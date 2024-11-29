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
		const { telegramId, referralCode } = body;

		if (!telegramId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const telegramAgeOCTRewards = calculateTelegramAgeReward(telegramId);

		const user = await prisma.$transaction(async (tx) => {
			let referrer = null;

			if (referralCode) {
				referrer = await tx.user.findUnique({ where: { referralCode } });
			}

			const newUser = await tx.user.create({
				data: {
					telegramId,
				},
			});

			if (referrer) {
				console.log({ referrerCode: referrer.referralCode });
				await tx.referral.create({
					data: {
						referrerId: referrer.id,
						referredId: newUser.id,
					},
				});
				const referralReward = 10;

				await tx.reward.create({
					data: {
						userId: referrer.id,
						amount: referralReward,
						type: "REFERRAL",
					},
				});

				await tx.user.update({
					where: { id: referrer.id },
					data: { totalRewards: { increment: referralReward } },
				});
			}

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

			return newUser;
		});

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: error ?? "Internal server error" },
			{ status: 500 },
		);
	}
}
