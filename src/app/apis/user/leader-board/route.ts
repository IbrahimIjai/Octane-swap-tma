import { NextRequest, NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { desc, count, sql } from "drizzle-orm";

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
		// PRISMA: prisma.$queryRaw for RANK() OVER
		const userRank = await db.execute<LeaderboardEntry>(sql`
			SELECT
				id,
				telegram_username as username,
				total_rewards as score,
				RANK() OVER (ORDER BY CAST(total_rewards AS NUMERIC) DESC) as rank
			FROM users
			WHERE id = ${userId}
		`);

		const topUsersRaw = await db.execute<LeaderboardEntry>(sql`
			SELECT
				id,
				telegram_username as username,
				total_rewards as score,
				DENSE_RANK() OVER (ORDER BY CAST(total_rewards AS NUMERIC) DESC) as rank
			FROM users
			ORDER BY CAST(total_rewards AS NUMERIC) DESC
			LIMIT 100
		`);

		const _userRank = (userRank.rows ?? userRank).map((entry: any) => ({
			...entry,
			rank: Number(entry.rank),
		}));

		const _topUsers = (topUsersRaw.rows ?? topUsersRaw).map((entry: any, i: number) => ({
			...entry,
			rank: i + 1,
		}));

		console.log({ _userRank, _topUsers });

		if (_userRank.length === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const currentUser = {
			..._userRank[0],
			medal:
				_userRank[0].rank <= 3
					? (["gold", "silver", "bronze"][Number(_userRank[0].rank) - 1] as
							| "gold"
							| "silver"
							| "bronze")
					: undefined,
		};

		const topUsersWithMedals = _topUsers.map((user: any, I: number) => ({
			...user,
			username: user.username || "Anonymous",
			medal:
				user.rank <= 3
					? (["gold", "silver", "bronze"][I] as "gold" | "silver" | "bronze")
					: undefined,
		}));

		// PRISMA: const _newtopUsers = await prisma.user.findMany({ ... })
		const _newtopUsers = await db.query.users.findMany({
			orderBy: desc(users.totalRewards),
			columns: {
				id: true,
				telegramId: true,
				totalRewards: true,
			},
			limit: 10,
		});

		console.log({ _newtopUsers, currentUser, topUsers: topUsersWithMedals });

		// PRISMA: totalUsers: await prisma.user.count()
		const [totalUsersResult] = await db.select({ value: count() }).from(users);

		return NextResponse.json({
			currentUser,
			topUsers: topUsersWithMedals,
			totalUsers: totalUsersResult.value,
		});
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
