import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		const rewards = await prisma.reward.findMany({
			where: { userId },
			include: {
				task: true,
			
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10, // Limit to the last 10 rewards
		});
		return NextResponse.json({ rewards }, { status: 200 });
	} catch (error) {
		console.error("Error fetching user reward history:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
