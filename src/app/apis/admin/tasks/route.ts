import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
	try {
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
