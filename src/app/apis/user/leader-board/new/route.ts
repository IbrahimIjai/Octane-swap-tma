import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
		const topUsers = await prisma.user.findMany({
			orderBy: [{ totalRewards: "desc" }, { createdAt: "asc" }],
			take: 100,
		});
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 500 });
		}
		const count = await prisma.user.count({
			where: {
				OR: [
					{ totalRewards: { gt: user.totalRewards } },
					{
						AND: [
							{ totalRewards: { equals: user.totalRewards } },
							{ createdAt: { lt: user.createdAt } },
						],
					},
				],
			},
		});

		return NextResponse.json({ topUsers, count: count + 1 });
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
