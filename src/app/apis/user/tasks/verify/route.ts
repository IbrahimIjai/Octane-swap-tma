import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramJoin, verifyTelegramUserBoast } from "@/lib/tg";

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

	let isVerified = false;
	switch (task.type) {
		case "TELEGRAM_JOIN":
			isVerified = await verifyTelegramJoin(telegramId, "octaneswap");
			break;
		case "BOOST_CHANNEL":
			const userBoasts = await verifyTelegramUserBoast(telegramId, taskId);
			isVerified = userBoasts.length ? true : false;
			break;
	}

	if (isVerified) {
		await prisma.taskCompletion.update({
			where: { userId_taskId: { userId: userId, taskId: task.id } },
			data: { status: "COMPLETED", completed: new Date() },
		});

		await prisma.reward.create({
			data: {
				userId: userId,
				taskId: task.id,
				amount: task.points,
				type: "TASK_COMPLETION",
			},
		});
		return NextResponse.json({
			status: "COMPLETED",
			message: "Task verified successfully",
		});
	} else {
		return NextResponse.json(
			{ status: "FAILED", message: "Task verification failed" },
			{ status: 400 },
		);
	}
}
