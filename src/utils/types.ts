// PRISMA: import { Reward, StakingPool, StakingPosition, TaskCompletion, User } from "@prisma/client";
// PRISMA: import { Decimal } from "@prisma/client/runtime/library";
import type {
	Reward,
	StakingPool,
	StakingPosition,
	TaskCompletion,
	User,
	TaskCategory,
	TaskStatus,
	TaskType,
	RewardType,
	TaskFrequency,
	PoolName,
	PoolCategory,
} from "@/db/types";

export type { TaskCategory, TaskStatus, TaskType, RewardType, TaskFrequency, PoolName, PoolCategory };

// Interface definitions
export interface Task {
	id: string;
	title: string;
	points: string; // Was Prisma Decimal, now string from numeric
	type: TaskType | null;
	frequency: TaskFrequency | null;
	category: TaskCategory | null;
	actionData: any;
	createdAt: Date | null;
	updatedAt: Date | null;
}

// Main User type that matches your API response

export interface LocalUserRespons {
	user: LocalUser;
}
export interface LocalUser extends User {
	TaskCompletions: (TaskCompletion & { task: Task })[];
	Rewards: Reward[];
	StakingPositions: (StakingPosition & { pool: StakingPool })[];
}
