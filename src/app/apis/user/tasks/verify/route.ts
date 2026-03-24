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
		switch (task.type) {
			case "TELEGRAM_JOIN":
				isVerified = await verifyTelegramJoin(telegramId, "@octaneswap");
				break;
			case "BOOST_CHANNEL":
				const userBoasts = await verifyTelegramUserBoast(telegramId, taskId);
				isVerified = userBoasts.length ? true : false;
				break;
			case "TELEGRAM_STORY":
				isVerified = true;
				break;
			default:
				return NextResponse.json(
					{ error: "Invalid task type" },
					{ status: 400 },
				);
		}
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

		if (
			task.frequency === "DAILY" &&
			taskCompletion?.completed &&
			taskCompletion.completed >= startOfToday
		) {
			return NextResponse.json(
				{
					status: "ALREADY_COMPLETED",
					message: "Task already completed today",
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

		await db.insert(rewards).values({
			id: randomUUID(),
			userId,
			taskId,
			amount: task.points,
			type: "TASK_COMPLETION",
		});

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
