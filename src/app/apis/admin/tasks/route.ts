import { NextResponse } from "next/server";
// PRISMA: import { prisma } from "@/lib/prisma";
// PRISMA: import { TaskCategory } from "@prisma/client";
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
	try {
		// PRISMA: const tasks = await prisma.task.findMany({});
		const allTasks = await db.query.tasks.findMany();
		return NextResponse.json(allTasks);
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

		// PRISMA: const newTask = await prisma.task.create({ data: taskData });
		const [newTask] = await db
			.insert(tasks)
			.values({ id: randomUUID(), ...taskData })
			.returning();

		return NextResponse.json(newTask);
	} catch (error) {
		console.error("Error creating task:", error);
		return NextResponse.json(
			{ error: "Failed to create task" },
			{ status: 500 },
		);
	}
}
