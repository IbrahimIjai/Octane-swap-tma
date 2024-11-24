import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OCTANESWAP_BOT_LINK } from "@/lib/config";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const telegramId = searchParams.get("telegramId");

	if (!telegramId) {
		return NextResponse.json({ error: "Missing telegramId" }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { telegramId },
			select: { referralCode: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const referralLink = `${OCTANESWAP_BOT_LINK}?startapp=${user.referralCode}`;
        
		return NextResponse.json({ referralLink });
	} catch (error) {
		console.error("Error generating referral link:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
