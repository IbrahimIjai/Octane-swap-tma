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

export async function POST(req: Request) {
	try {
		const { userId, taskId, completionStatus, modeVedict } = await req.json();

		console.log({ userId, taskId, completionStatus, modeVedict });

		if (completionStatus !== "IN_PROGRESS") {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		const task = await prisma.task.findUnique({ where: { id: taskId } });

		if (!task) {
			return NextResponse.json({ error: "Task not found" }, { status: 400 });
		}

		if (modeVedict === "FAILED") {
			await prisma.taskCompletion.update({
				where: {
					userId_taskId: {
						userId: userId,
						taskId: taskId,
					},
				},
				data: {
					status: modeVedict,
				},
			});
		} else if (modeVedict === "COMPLETED") {
			await prisma.taskCompletion.update({
				where: {
					userId_taskId: {
						userId: userId,
						taskId: taskId,
					},
				},
				data: {
					status: modeVedict,
					...(modeVedict === "COMPLETED" ? { completed: new Date() } : {}),
				},
			});
			const reward = await prisma.reward.findUnique({
				where: {
					userId_taskId: {
						userId: userId,
						taskId: taskId,
					},
				},
			});

			if (!reward) {
				await prisma.$transaction([
					prisma.reward.create({
						data: {
							userId: userId,
							taskId: taskId,
							amount: task.points,
							type: "TASK_COMPLETION",
						},
					}),
					prisma.user.update({
						where: { id: userId },
						data: {
							totalRewards: {
								increment: task.points,
							},
						},
					}),
				]);
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
