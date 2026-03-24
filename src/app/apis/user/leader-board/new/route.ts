import { NextRequest, NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, desc, asc, gt, and, lt, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
	id: string;
	rank: number;
	username: string;
	score: number;
	avatar?: string;
	medal?: "gold" | "silver" | "bronze";
};

export async function GET(req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		// PRISMA: const topUsers = await prisma.user.findMany({ orderBy: [{ totalRewards: "desc" }, { createdAt: "asc" }], take: 100 });
		const topUsers = await db.query.users.findMany({
			orderBy: [desc(users.totalRewards), asc(users.createdAt)],
			limit: 100,
		});

		// PRISMA: const user = await prisma.user.findUnique({ where: { id: userId } });
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 500 });
		}

		// PRISMA: const count = await prisma.user.count({ where: { OR: [...] } });
		const [countResult] = await db.select({ value: count() }).from(users).where(
			sql`(CAST(${users.totalRewards} AS NUMERIC) > CAST(${user.totalRewards} AS NUMERIC))
			OR (CAST(${users.totalRewards} AS NUMERIC) = CAST(${user.totalRewards} AS NUMERIC) AND ${users.createdAt} < ${user.createdAt})`,
		);

		return NextResponse.json({ topUsers, count: (countResult?.value ?? 0) + 1 });
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
