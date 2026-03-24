import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { TaskType } from "@prisma/client";
import { db } from "@/db/drizzle";
import { tasks, taskCompletions, rewards, users } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

type TaskType = typeof tasks.$inferSelect["type"];

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const filter = searchParams.get("filter") as TaskType | "ALL" | null;

	// PRISMA: const twitterTasks = await prisma.task.findMany({ where: whereClause, include: { completions: { include: { user: { select: { id: true, twitterUsername: true } } } } } });
	let twitterTasks;

	if (filter && filter !== "ALL") {
		twitterTasks = await db.query.tasks.findMany({
			where: eq(tasks.type, filter),
			with: {
				completions: {
					with: {
						user: true,
					},
				},
			},
		});
	} else {
		twitterTasks = await db.query.tasks.findMany({
			where: inArray(tasks.type, ["TWITTER_FOLLOW", "TWITTER_QUOTE_RETWEET"]),
			with: {
				completions: {
					with: {
						user: true,
					},
				},
			},
		});
	}

	return NextResponse.json(twitterTasks);
}

export async function POST(req: Request) {
	try {
		const { userId, taskId, completionStatus, modeVedict } = await req.json();

		console.log({ userId, taskId, completionStatus, modeVedict });

		if (completionStatus !== "IN_PROGRESS") {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		// PRISMA: const task = await prisma.task.findUnique({ where: { id: taskId } });
		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, taskId),
		});

		if (!task) {
			return NextResponse.json({ error: "Task not found" }, { status: 400 });
		}

		if (modeVedict === "FAILED") {
			// PRISMA: await prisma.taskCompletion.update({ where: { userId_taskId: { userId, taskId } }, data: { status: modeVedict } });
			await db
				.update(taskCompletions)
				.set({ status: modeVedict })
				.where(
					and(
						eq(taskCompletions.userId, userId),
						eq(taskCompletions.taskId, taskId),
					),
				);
		} else if (modeVedict === "COMPLETED") {
			// PRISMA: await prisma.taskCompletion.update(...)
			await db
				.update(taskCompletions)
				.set({
					status: modeVedict,
					completed: new Date(),
				})
				.where(
					and(
						eq(taskCompletions.userId, userId),
						eq(taskCompletions.taskId, taskId),
					),
				);

			// PRISMA: const reward = await prisma.reward.findUnique({ where: { userId_taskId: { userId, taskId } } });
			const reward = await db.query.rewards.findFirst({
				where: and(eq(rewards.userId, userId), eq(rewards.taskId, taskId)),
			});

			if (!reward) {
				// PRISMA: await prisma.$transaction([prisma.reward.create(...), prisma.user.update(...)]);
				await db.insert(rewards).values({
					id: randomUUID(),
					userId,
					taskId,
					amount: task.points,
					type: "TASK_COMPLETION",
				});

				await db
					.update(users)
					.set({
						totalRewards: sql`CAST(${users.totalRewards} AS NUMERIC) + CAST(${task.points} AS NUMERIC)`,
					})
					.where(eq(users.id, userId));
			}
		}

		console.log("I was here...1 ");

		return NextResponse.json({ status: "success" });
	} catch (error) {
		console.error("Error in POST /api/admin/tasks/twitter/[taskId]:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
