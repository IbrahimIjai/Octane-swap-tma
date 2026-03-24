import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { tasks, taskCompletions, rewards, users } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

type TaskType = typeof tasks.$inferSelect["type"];

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const filter = searchParams.get("filter") as TaskType | "ALL" | null;

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

		const task = await db.query.tasks.findFirst({
			where: eq(tasks.id, taskId),
		});

		if (!task) {
			return NextResponse.json({ error: "Task not found" }, { status: 400 });
		}

		if (modeVedict === "FAILED") {
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

			const reward = await db.query.rewards.findFirst({
				where: and(eq(rewards.userId, userId), eq(rewards.taskId, taskId)),
			});

			if (!reward) {
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
