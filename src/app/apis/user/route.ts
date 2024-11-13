// pages/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import cors from "cors";

// // CORS middleware
// const corsMiddleware = cors({
// 	methods: ["GET", "POST"],
// 	origin: "*", // Replace with your frontend URL in production
// 	optionsSuccessStatus: 200,
// });

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
		console.log({ telegramId, mesage: "In" });
		const user = await prisma.user.findUnique({
			where: { telegramId },
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
		const { telegramId, telegramAgeOCTRewards } = body;

		if (!telegramId || !telegramAgeOCTRewards) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		console.log({ telegramAgeOCTRewards, telegramId });

		const user = await prisma.user.create({
			data: {
				telegramId,
				telegramAgeOCTRewards,
                
			},
		});

		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
