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
		const [userRank, topUsers] = await Promise.all([
			prisma.$queryRaw<LeaderboardEntry[]>`
        SELECT 
          id, 
          "telegramUsername" as username, 
          "totalRewards" as score, 
          RANK () OVER (ORDER BY "totalRewards" DESC) as rank
        FROM "User"
        WHERE id = ${userId}
      `,
			prisma.$queryRaw<LeaderboardEntry[]>`
        SELECT 
          id, 
          "telegramUsername" as username, 
          "totalRewards" as score, 
          DENSE_RANK() OVER (ORDER BY "totalRewards" DESC) as rank
        FROM "User"
        ORDER BY "totalRewards" DESC
        LIMIT 100
      `,
		]);

		console.log({ userRank, topUsers });

		const _userRank = userRank.map((entry, i) => ({
			...entry,
			rank: Number(entry.rank), // Convert BigInt to Number
		}));

		const _topUsers = topUsers.map((entry, i) => ({
			...entry,
			// rank: Number(entry.rank), // Convert BigInt to Number
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

		const topUsersWithMedals = _topUsers.map((user, I) => ({
			...user,
			username: user.username || "Anonymous",
			medal:
				user.rank <= 3
					? (["gold", "silver", "bronze"][I] as "gold" | "silver" | "bronze")
					: undefined,
		}));

		const _newtopUsers = await prisma.user.findMany({
			orderBy: {
				totalRewards: "desc",
			},
			select: {
				id: true,
				telegramId: true,
				totalRewards: true,
			},
			take: 10,
		});
		console.log({ _newtopUsers, currentUser, topUsers: topUsersWithMedals });

		return NextResponse.json({
			currentUser,
			topUsers: topUsersWithMedals,
			totalUsers: await prisma.user.count(),
		});
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
