import { relations } from "drizzle-orm";
import {
	users,
	tasks,
	taskCompletions,
	dailyTaskReset,
	referrals,
	rewards,
	stakingPools,
	stakingPositions,
} from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
	StakingPositions: many(stakingPositions),
	TaskCompletions: many(taskCompletions),
	Rewards: many(rewards),
	referrals: many(referrals, { relationName: "referrer" }),
	referredBy: one(referrals, {
		fields: [users.id],
		references: [referrals.referredId],
		relationName: "referred",
	}),
	DailyTaskReset: one(dailyTaskReset),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
	completions: many(taskCompletions),
	rewards: many(rewards),
}));

export const taskCompletionsRelations = relations(
	taskCompletions,
	({ one }) => ({
		user: one(users, {
			fields: [taskCompletions.userId],
			references: [users.id],
		}),
		task: one(tasks, {
			fields: [taskCompletions.taskId],
			references: [tasks.id],
		}),
	}),
);

export const dailyTaskResetRelations = relations(
	dailyTaskReset,
	({ one }) => ({
		user: one(users, {
			fields: [dailyTaskReset.userId],
			references: [users.id],
		}),
	}),
);

export const referralsRelations = relations(referrals, ({ one }) => ({
	referrer: one(users, {
		fields: [referrals.referrerId],
		references: [users.id],
		relationName: "referrer",
	}),
	referred: one(users, {
		fields: [referrals.referredId],
		references: [users.id],
		relationName: "referred",
	}),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
	user: one(users, {
		fields: [rewards.userId],
		references: [users.id],
	}),
	task: one(tasks, {
		fields: [rewards.taskId],
		references: [tasks.id],
	}),
}));

export const stakingPoolsRelations = relations(stakingPools, ({ many }) => ({
	positions: many(stakingPositions),
}));

export const stakingPositionsRelations = relations(
	stakingPositions,
	({ one }) => ({
		user: one(users, {
			fields: [stakingPositions.userId],
			references: [users.id],
		}),
		pool: one(stakingPools, {
			fields: [stakingPositions.poolId],
			references: [stakingPools.id],
		}),
	}),
);
