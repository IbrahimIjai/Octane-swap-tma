import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { secretCode, userId } = await req.json();
		

		const user = await prisma.user.upsert({
			where: { id: userId },
			update: { secretCode },
			create: { id: userId, secretCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Failed to save secret phrase" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ message: "Secret phrase saved successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error saving secret phrase:", error);
		return NextResponse.json(
			{ error: "Failed to save secret phrase" },
			{ status: 500 },
		);
	}
}

export async function GET(req: Request) {
	try {
		const { secretCode } = await req.json();
		const userId = "user_id";

		const user = await prisma.user.findUnique({
			where: { secretCode },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Failed to save secret phrase" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		console.error("Error saving secret phrase:", error);
		return NextResponse.json(
			{ error: "Failed to save secret phrase" },
			{ status: 500 },
		);
	}
}
