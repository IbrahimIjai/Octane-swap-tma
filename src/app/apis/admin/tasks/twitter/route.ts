import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskType } from "@prisma/client";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const filter = searchParams.get("filter") as TaskType | "ALL" | null;

	let whereClause: { type?: { in: TaskType[] } | TaskType } = {};

	if (filter && filter !== "ALL") {
		if (filter === "TWITTER_FOLLOW" || filter === "TWITTER_QUOTE_RETWEET") {
			whereClause.type = filter;
		}
	} else {
		whereClause.type = { in: ["TWITTER_FOLLOW", "TWITTER_QUOTE_RETWEET"] };
	}
	const twitterTasks = await prisma.task.findMany({
		where: whereClause,
		include: {
			completions: {
				include: {
					user: {
						select: {
							id: true,
							twitterUsername: true,
						},
					},
				},
			},
		},
	});

	return NextResponse.json(twitterTasks);
}

export async function POST(
	req: Request,
	{ params }: { params: { taskId: string } },
) {
	const { taskId } = params;
	const { userId, status } = await req.json();

	if (status !== "COMPLETED" && status !== "FAILED") {
		return NextResponse.json({ error: "Invalid status" }, { status: 400 });
	}

	if (status !== "COMPLETED") {
		await prisma.taskCompletion.update({
			where: {
				userId_taskId: {
					userId: userId,
					taskId: taskId,
				},
			},
			data: {
				status: status,
				completed: new Date(),
			},
		});
	} else if (status !== "FAILED") {
		await prisma.taskCompletion.update({
			where: {
				userId_taskId: {
					userId: userId,
					taskId: taskId,
				},
			},
			data: {
				status: status,
			},
		});
	}

	if (status === "COMPLETED") {
		const task = await prisma.task.findUnique({ where: { id: taskId } });
		if (task) {
			await prisma.reward.create({
				data: {
					userId: userId,
					taskId: taskId,
					amount: task.points,
					type: "TASK_COMPLETION",
				},
			});
			await prisma.user.update({
				where: { id: userId },
				data: {
					totalRewards: {
						increment: task.points,
					},
				},
			});
		}
	}

	return NextResponse.json({ status: 200 });
}
