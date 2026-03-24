import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { rewards, tasks, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: Request) {
	const { taskId, userId } = await req.json();
	if (!taskId || !userId) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	// PRISMA: const reward = await prisma.reward.findUnique({ where: { userId_taskId: { userId, taskId } } });
	const reward = await db.query.rewards.findFirst({
		where: and(eq(rewards.userId, userId), eq(rewards.taskId, taskId)),
	});

	if (!reward) {
		return NextResponse.json({ error: "Reward not found" }, { status: 404 });
	}

	// PRISMA: const _task = await prisma.task.findUnique({ where: { id: taskId } });
	const _task = await db.query.tasks.findFirst({
		where: eq(tasks.id, taskId),
	});

	if (!_task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}
	if (reward.claimed) {
		if (_task.frequency !== "DAILY") {
			return NextResponse.json(
				{ error: "Reward already claimed" },
				{ status: 400 },
			);
		}
	}

	// Update reward status and user balance
	// PRISMA: const updatedReward = await prisma.$transaction(async (prisma) => { ... });
	const [claimedReward] = await db
		.update(rewards)
		.set({ claimed: new Date() })
		.where(eq(rewards.id, reward.id))
		.returning();

	await db
		.update(users)
		.set({
			totalRewards: sql`CAST(${users.totalRewards} AS NUMERIC) + CAST(${reward.amount} AS NUMERIC)`,
		})
		.where(eq(users.id, userId));

	return NextResponse.json(claimedReward);
}
