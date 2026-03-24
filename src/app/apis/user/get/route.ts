import { NextRequest, NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const secretCode = searchParams.get("secretCode");
	const twitterUsername = searchParams.get("twitterUsername");
	const address = searchParams.get("address");

	console.log({ secretCode, twitterUsername, address });

	try {
		let user;
		if (twitterUsername) {
			// PRISMA: user = await prisma.user.findUnique({ where: { twitterUsername } });
			user = await db.query.users.findFirst({ where: eq(users.twitterUsername, twitterUsername) });
		} else if (address) {
			// PRISMA: user = await prisma.user.findUnique({ where: { address } });
			user = await db.query.users.findFirst({ where: eq(users.address, address) });
		} else if (secretCode) {
			// PRISMA: user = await prisma.user.findUnique({ where: { secretCode } });
			user = await db.query.users.findFirst({ where: eq(users.secretCode, secretCode) });
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
	const body = await req.json();
	console.log({ body });

	const { secretCode, twitterUsername, walletAddress } = body;

	if (!secretCode || !twitterUsername || !walletAddress) {
		return NextResponse.json(
			{ error: "Secret code, Twitter username, and wallet address are required" },
			{ status: 400 },
		);
	}

	try {
		// PRISMA: const updatedUser = await prisma.user.update({ where: { secretCode }, data: { twitterUsername, address: walletAddress } });
		const [updatedUser] = await db
			.update(users)
			.set({ twitterUsername, address: walletAddress })
			.where(eq(users.secretCode, secretCode))
			.returning();

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
