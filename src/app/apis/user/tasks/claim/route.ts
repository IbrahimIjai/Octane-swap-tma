import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	const { taskId, userId } = await req.json();
	if (!taskId || !userId) {
		return NextResponse.json({ error: "Task not found" }, { status: 404 });
	}
	const reward = await prisma.reward.findUnique({
		where: {
			userId_taskId: {
				userId: userId,
				taskId: taskId,
			},
		},
	});

	if (!reward) {
		return NextResponse.json({ error: "Reward not found" }, { status: 404 });
	}

	const _task = await prisma.task.findUnique({ where: { id: taskId } });

	if (!_task) {
		return NextResponse.json({ error: "Tak not found" }, { status: 404 });
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
	const updatedReward = await prisma.$transaction(async (prisma) => {
		const claimedReward = await prisma.reward.update({
			where: { id: reward.id },
			data: {
				claimed: new Date(), // Set to current timestamp
			},
		});

		await prisma.user.update({
			where: { id: userId },
			data: {
				totalRewards: {
					increment: reward.amount,
				},
			},
		});

		return claimedReward;
	});

	return NextResponse.json(updatedReward);
}
