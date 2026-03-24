import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { taskCompletions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
	const { taskId, userId } = await req.json();

	// PRISMA: const taskCompletion = await prisma.taskCompletion.upsert({
	// PRISMA: 	where: { userId_taskId: { userId, taskId } },
	// PRISMA: 	update: { status: "IN_PROGRESS" },
	// PRISMA: 	create: { userId, taskId, status: "IN_PROGRESS" },
	// PRISMA: });

	// Drizzle upsert via onConflictDoUpdate
	const [taskCompletion] = await db
		.insert(taskCompletions)
		.values({
			id: randomUUID(),
			userId,
			taskId,
			status: "IN_PROGRESS",
		})
		.onConflictDoUpdate({
			target: [taskCompletions.userId, taskCompletions.taskId],
			set: { status: "IN_PROGRESS" },
		})
		.returning();

	return NextResponse.json(taskCompletion);
}
