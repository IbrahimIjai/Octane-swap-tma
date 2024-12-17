import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { corsMiddleware } from "@/lib/cors";

export async function GET(req: NextRequest) {
	// const res = new NextResponse();
	// const corsRes = corsMiddleware(req, res);
	// if (req.method === "OPTIONS") {
	// 	return corsRes;
	// }

	const { searchParams } = new URL(req.url);
	const secretCode = searchParams.get("secretCode");

	console.log({ secretCode });

	if (!secretCode) {
		return NextResponse.json(
			{ error: "Secret code is required" },
			{ status: 400 },
		);
	}

	try {
		const user = await prisma.user.findUnique({
			where: { secretCode },
		});

		if (user) {
			const isFullyLinked = user.twitterUsername && user.address;
			return NextResponse.json({
				user,
				isFullyLinked,
				message: isFullyLinked
					? "User has already linked Twitter and wallet"
					: "User found, proceed to next step",
			});
		} else {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	// const res = new NextResponse();
	// const corsRes = corsMiddleware(req, res);

	// if (req.method === "OPTIONS") {
	// 	return corsRes;
	// }
	const body = await req.json();
	const { secretCode, twitterUsername, twitterUid, walletAddress } = body;

	if (!secretCode || !twitterUsername || !walletAddress || !twitterUid) {
		return NextResponse.json(
			{
				error: "Secret code, Twitter username, and wallet address are required",
			},
			{ status: 400 },
		);
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { secretCode },
			data: {
				twitterUsername,
				twitterUid,
				address: walletAddress,
			},
		});

		return NextResponse.json({
			user: updatedUser,
			message: "User successfully updated with Twitter and wallet information",
		});
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
