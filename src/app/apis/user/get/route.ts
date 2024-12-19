import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const secretCode = searchParams.get("secretCode");
	const twitterUsername = searchParams.get("twitterUsername");
	const address = searchParams.get("address");

	console.log({ secretCode, twitterUsername, address });

	// if (!secretCode) {
	// 	return NextResponse.json(
	// 		{ error: "At least one search parameter is required" },
	// 		{ status: 400 },
	// 	);
	// }

	try {
		let user;
		if (twitterUsername) {
			user = await prisma.user.findUnique({
				where: { twitterUsername },
			});
		} else if (address) {
			user = await prisma.user.findUnique({
				where: { address },
			});
		} else if (secretCode) {
			user = await prisma.user.findUnique({
				where: { secretCode },
			});
		}

		console.log({ user });

		const isFullyLinked = user?.twitterUsername && user?.address;
		return NextResponse.json({
			user,
			isFullyLinked,
			message: isFullyLinked
				? "User has already linked Twitter and wallet"
				: "User found, proceed to next step",
		});
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

	console.log({ body });

	const { secretCode, twitterUsername, walletAddress } = body;

	if (!secretCode || !twitterUsername || !walletAddress) {
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
