import { NextResponse } from "next/server";

// TODO: Re-implement with Drizzle when staking stake logic is re-enabled.

export async function POST(req: Request) {
	try {
		const { userId, amount } = await req.json();


	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
