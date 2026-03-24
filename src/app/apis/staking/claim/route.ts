// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { StakingCalculator } from "@/utils/staking-protocol-helpers";
// PRISMA: import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// const { Decimal } = Prisma;

export async function POST(req: Request) {
	try {
		const { userId, poolId } = await req.json();

		// This route was entirely commented out in the original Prisma version.
		// TODO: Re-implement with Drizzle when staking claim logic is re-enabled.

	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
