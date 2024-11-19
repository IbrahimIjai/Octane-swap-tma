import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const tasks = await prisma.task.findMany();
		return NextResponse.json(tasks);
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tasks" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const taskData = await req.json();
        
		const newTask = await prisma.task.create({
			data: taskData,
		});
		return NextResponse.json(newTask);
	} catch (error) {
		console.error("Error creating task:", error);
		return NextResponse.json(
			{ error: "Failed to create task" },
			{ status: 500 },
		);
	}
}
