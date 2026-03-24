import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
	try {
		const { secretCode, userId } = await req.json();

		// PRISMA: const user = await prisma.user.update({ where: { id: userId }, data: { secretCode } });
		const [user] = await db
			.update(users)
			.set({ secretCode })
			.where(eq(users.id, userId))
			.returning();

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

		// PRISMA: const user = await prisma.user.findUnique({ where: { secretCode } });
		const user = await db.query.users.findFirst({
			where: eq(users.secretCode, secretCode),
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
