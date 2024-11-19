import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	const { taskId, userId } = await req.json();

	const taskCompletion = await prisma.taskCompletion.upsert({
		where: {
			userId_taskId: {
				userId: userId,
				taskId: taskId,
			},
		},
		update: {
			status: "IN_PROGRESS",
		},
		create: {
			userId: userId,
			taskId: taskId,
			status: "IN_PROGRESS",
		},
	});

	return NextResponse.json(taskCompletion);
}
