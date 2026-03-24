import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { rewards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		// PRISMA: const rewards = await prisma.reward.findMany({ where: { userId }, include: { task: true }, orderBy: { createdAt: "desc" }, take: 10 });
		const rewardsData = await db.query.rewards.findMany({
			where: eq(rewards.userId, userId),
			with: { task: true },
			orderBy: desc(rewards.createdAt),
			limit: 10,
		});

		return NextResponse.json({ rewards: rewardsData }, { status: 200 });
	} catch (error) {
		console.error("Error fetching user reward history:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
