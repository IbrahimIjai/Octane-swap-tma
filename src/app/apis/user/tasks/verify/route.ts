import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

	const task = await prisma.task.findUnique({
		where: { id: taskId },
		include: { completions: { where: { userId: userId } } },
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
		const taskCompletion = await prisma.taskCompletion.findUnique({
			where: {
				userId_taskId: {
					userId,
					taskId,
				},
			},
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
		await prisma.$transaction(async (prisma) => {
			await prisma.taskCompletion.upsert({
				where: { userId_taskId: { userId, taskId } },
				update: { status: "COMPLETED", completed: new Date() },
				create: { userId, taskId, status: "COMPLETED", completed: new Date() },
			});

			await prisma.reward.create({
				data: {
					userId,
					taskId,
					amount: task.points,
					type: "TASK_COMPLETION",
				},
			});
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
