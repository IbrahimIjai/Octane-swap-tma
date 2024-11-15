import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { userId: string } },
) {
	try {

        console.log("Eneterreeed fuck")
		const positions = await prisma.stakingPosition.findMany({
			where: {
				userId: params.userId,
			},
			include: {
				pool: true,
			},
		});

		return NextResponse.json(positions);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
