import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
	req: Request,
	{ params }: { params: { taskId: string } },
) {
	try {
		const { taskId } = params;
		const taskData = await req.json();
		// PRISMA: const updatedTask = await prisma.task.update({ where: { id: taskId }, data: taskData });
		const [updatedTask] = await db
			.update(tasks)
			.set(taskData)
			.where(eq(tasks.id, taskId))
			.returning();
		return NextResponse.json(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		return NextResponse.json(
			{ error: "Failed to update task" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { taskId: string } },
) {
	try {
		const { taskId } = params;
		// PRISMA: await prisma.task.delete({ where: { id: taskId } });
		await db.delete(tasks).where(eq(tasks.id, taskId));
		return NextResponse.json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		return NextResponse.json(
			{ error: "Failed to delete task" },
			{ status: 500 },
		);
	}
}
