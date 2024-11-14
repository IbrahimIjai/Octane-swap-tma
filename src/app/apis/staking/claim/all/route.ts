import { prisma } from "@/lib/prisma";
import { StakingCalculator } from "@/utils/staking-protocol-helpers";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const { Decimal } = Prisma;

//CLAIM ALL REWARDS
export async function POST(req: Request) {
	try {
		const { userId } = await req.json();

		// const results = await prisma.$transaction(async (tx) => {
		// 	// Get all positions for the user
		// 	const positions = await tx.stakingPosition.findMany({
		// 		where: {
		// 			userId,
		// 			amount: {
		// 				gt: 0,
		// 			},
		// 		},
		// 		include: {
		// 			pool: true,
		// 		},
		// 	});

		// 	console.log({ positions });

		// 	const claims = [];
		// 	let totalRewards = new Decimal(0);

		// 	// Process each position
		// 	for (const position of positions) {
		// 		await StakingCalculator.updateReward(userId, position.poolId);

		// 		console.log({ msg: "starting loop" });

		// 		const pool = position.pool;

		// 		console.log({
		// 			endtime: pool.endTime,
		// 			checks: pool.endTime < new Date(),
		// 		});

		// 		// Check if pool has ended
		// 		if (pool.endTime < new Date()) {
		// 			console.log("PASSED CHECKS....");
		// 			// Update rewards first
		// 			await StakingCalculator.updateReward(userId, pool.id);

		// 			// Calculate earned rewards
		// 			const earned = await StakingCalculator.calculateEarned(position.id);

		// 			if (earned.greaterThan(0)) {
		// 				// Update position
		// 				await tx.stakingPosition.update({
		// 					where: { id: position.id },
		// 					data: {
		// 						rewards: new Decimal(0),
		// 						amount: new Decimal(0),
		// 					},
		// 				});

		// 				// Update pool
		// 				await tx.stakingPool.update({
		// 					where: { id: pool.id },
		// 					data: {
		// 						totalSupply: {
		// 							decrement: position.amount,
		// 						},
		// 					},
		// 				});

		// 				// Add rewards and original stake to user balance
		// 				await tx.user.update({
		// 					where: { id: userId },
		// 					data: {
		// 						poctBalance: {
		// 							increment: earned.add(position.amount),
		// 						},
		// 					},
		// 				});

		// 				claims.push({
		// 					poolId: pool.id,
		// 					staked: position.amount,
		// 					rewards: earned,
		// 				});

		// 				totalRewards = totalRewards.add(earned);
		// 			}
		// 		}
		// 	}

		// 	console.log({ totalRewards, claims });

		// 	return {
		// 		claims,
		// 		totalRewards,
		// 		claimedPools: claims.length,
		// 	};
		// });

		const results = await prisma.$transaction(
			async (tx) => {
				// Get all positions for the user
				const positions = await tx.stakingPosition.findMany({
					where: {
						userId,
						amount: { gt: 0 },
					},
					include: {
						pool: true,
					},
				});

				const now = new Date();
				const claims = [];
				let totalRewards = new Decimal(0);

				// Process each position concurrently
				await Promise.all(
					positions.map(async (position) => {
						const pool = position.pool;

						// Check if pool has ended
						if (pool.endTime < now) {
							// Calculate earned rewards
							const earned = await StakingCalculator.calculateEarned(
								position.id,
							);

							if (earned.greaterThan(0)) {
								// Prepare update operations
								const updatePromises = [
									tx.stakingPosition.update({
										where: { id: position.id },
										data: {
											rewards: new Decimal(0),
											amount: new Decimal(0),
										},
									}),
									tx.stakingPool.update({
										where: { id: pool.id },
										data: {
											totalSupply: {
												decrement: position.amount,
											},
										},
									}),
									tx.user.update({
										where: { id: userId },
										data: {
											poctBalance: {
												increment: earned.add(position.amount),
											},
										},
									}),
								];

								// Execute all updates concurrently
								await Promise.all(updatePromises);

								claims.push({
									poolId: pool.id,
									staked: position.amount,
									rewards: earned,
								});

								totalRewards = totalRewards.add(earned);
							}
						}
					}),
				);

				return {
					claims,
					totalRewards,
					claimedPools: claims.length,
				};
			},
			{
				timeout: 30000, // Increase timeout to 30 seconds
				maxWait: 35000, // Maximum time to wait for a transaction slot
			},
		);

		return NextResponse.json(results ?? {});
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
