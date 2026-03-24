import { NextResponse } from "next/server";


export async function POST(req: Request) {
	try {
		const { userId, poolId } = await req.json();

		// TODO: Re-implement with Drizzle when staking claim logic is re-enabled.

	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
