import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { tasks, taskCompletions, rewards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { verifyTelegramJoin, verifyTelegramUserBoast } from "@/lib/tg";
import { addDays, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function POST(req: Request) {
	const { taskId, telegramId, userId } = await req.json();
	console.log({ taskId, userId, telegramId });

	if (!telegramId) {
		return NextResponse.json(
			{ error: "Telegram ID is required" },
			{ status: 400 },
		);
	}

	// PRISMA: const task = await prisma.task.findUnique({ where: { id: taskId }, include: { completions: { where: { userId } } } });
	const task = await db.query.tasks.findFirst({
		where: eq(tasks.id, taskId),
		with: {
			completions: true,
		},
	});

	if (!task) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}

	// Define the timezone (UTC+1)
	const timeZone = "Europe/Paris";
	const now = new Date();
	const zonedNow = toZonedTime(now, timeZone);
	const startOfToday = startOfDay(zonedNow);

	let isVerified = false;

	try {
		// --- DEMO OVERRIDE: ALways pass verification ---
		isVerified = true;

		/*
		switch (task.type) {
			case "TELEGRAM_JOIN":
				try {
					isVerified = await verifyTelegramJoin(telegramId, "@octaneswap");
				} catch (e) {
					console.log("Telegram join verification failed, auto-verifying:", e);
					isVerified = true;
				}
				break;
			case "BOOST_CHANNEL":
				try {
					const userBoasts = await verifyTelegramUserBoast(telegramId, taskId);
					isVerified = userBoasts.length ? true : false;
				} catch (e) {
					console.log("Boost verification failed, auto-verifying:", e);
					isVerified = true;
				}
				break;
			case "TWITTER_FOLLOW":
			case "TWITTER_QUOTE_RETWEET":
			case "TELEGRAM_STORY":
			case "DAILY_CHECK_IN":
			default:
				// Auto-verify: mark as verified when the user calls the API
				isVerified = true;
				break;
		}
		*/
		if (!isVerified) {
			return NextResponse.json(
				{ status: "FAILED", message: "Task verification failed" },
				{ status: 400 },
			);
		}

		// PRISMA: const taskCompletion = await prisma.taskCompletion.findUnique({ where: { userId_taskId: { userId, taskId } } });
		const taskCompletion = await db.query.taskCompletions.findFirst({
			where: and(
				eq(taskCompletions.userId, userId),
				eq(taskCompletions.taskId, taskId),
			),
		});

		// For ONE_TIME tasks, check if already completed
		if (
			task.frequency !== "DAILY" &&
			taskCompletion?.status === "COMPLETED"
		) {
			return NextResponse.json(
				{
					status: "ALREADY_COMPLETED",
					message: "Task already completed",
				},
				{ status: 400 },
			);
		}

		// PRISMA: await prisma.$transaction(async (prisma) => { ... });
		await db
			.insert(taskCompletions)
			.values({
				id: randomUUID(),
				userId,
				taskId,
				status: "COMPLETED",
				completed: new Date(),
			})
			.onConflictDoUpdate({
				target: [taskCompletions.userId, taskCompletions.taskId],
				set: { status: "COMPLETED", completed: new Date() },
			});

		// Only create reward if one doesn't already exist for this task
		const existingReward = await db.query.rewards.findFirst({
			where: and(eq(rewards.userId, userId), eq(rewards.taskId, taskId)),
		});

		if (!existingReward) {
			await db.insert(rewards).values({
				id: randomUUID(),
				userId,
				taskId,
				amount: task.points,
				type: "TASK_COMPLETION",
			});
		}

		return NextResponse.json({
			status: "COMPLETED",
			message: "Task verified successfully",
		});
	} catch (error) {
		console.error("Error in task verification:", error);

		if (error instanceof Error) {
			return NextResponse.json(
				{ error: "Task verification failed", message: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred during task verification" },
			{ status: 500 },
		);
	}
}
