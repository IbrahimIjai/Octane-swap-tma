import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: { taskId: string } },
) {
	try {
		const { taskId } = params;
		const taskData = await req.json();
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: taskData,
		});
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
		await prisma.task.delete({
			where: { id: taskId },
		});
		return NextResponse.json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		return NextResponse.json(
			{ error: "Failed to delete task" },
			{ status: 500 },
		);
	}
}
