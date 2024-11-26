import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OCTANESWAP_BOT_LINK } from "@/lib/config";
import crypto from "crypto";

const SALT = process.env.REFERRAL_ID_SALT || "default_salt_change_this";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const telegramId = searchParams.get("telegramId");

	if (!telegramId) {
		return NextResponse.json({ error: "Missing telegramId" }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { telegramId },
			// select: { referralCode: true },
		});

		console.log({ user });
		let referralLink;
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 400 });
		}

		if (user.referralCode) {
			referralLink = `${OCTANESWAP_BOT_LINK}?startapp=${user.referralCode}`;
		} else {
			const hash = crypto.createHash("sha256");
			hash.update(user.id + SALT);
			const fullHash = hash.digest("hex");

			const referralIdGen = fullHash.slice(0, 8);
			referralLink = `${OCTANESWAP_BOT_LINK}?startapp=${referralIdGen}`;
			await prisma.user.update({
				where: { id: user.id },
				data: { referralCode: referralIdGen },
			});
		}
		console.log({ referralLink });

		return NextResponse.json({ referralLink });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
