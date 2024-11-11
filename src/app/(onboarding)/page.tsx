"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DisplayDataRow } from "@/components/DisplayData/DisplayData";
import OctaneSwapLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RewardsCalculator() {
	const initDataRaw = useLaunchParams().initDataRaw;
	const initData = useInitData();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [reward, setReward] = useState<number | null>(null);

	useEffect(() => {
		const accountAge = calculateAccountAge(initData?.authDate);
		const rewardAmount = accountAge * 10; // Reward 10 points per day of account age
		setReward(rewardAmount);
	}, [initData?.authDate]);

	const handleContinue = () => {
		router.push("/home");
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full">
				<Card>
					<CardContent className="p-8 flex flex-col items-center">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="mb-8">
							<OctaneSwapLogo size={64} animated={true} />
						</motion.div>
						<motion.h2
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							className="text-2xl font-bold mb-4">
							Welcome to OctaneSwap
						</motion.h2>
						{isLoading ? (
							<div className="flex flex-col items-center justify-center gap-4">
								<Loader2 className="animate-spin h-8 w-8 text-primary" />
								<p className="text-muted-foreground">
									Calculating your rewards...
								</p>
							</div>
						) : reward !== null ? (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
								className="text-center">
								<p className="text-lg font-medium mb-2">
									Your Telegram account age is{" "}
									<span className="text-primary">
										{calculateAccountAge(initData?.authDate)} days
									</span>
									.
								</p>
								<p className="text-lg font-medium mb-4">
									You have earned{" "}
									<span className="text-primary">{reward} points</span> for your
									onboarding.
								</p>
								<Button onClick={handleContinue} className="w-full">
									Continue
								</Button>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
								className="text-center">
								<p className="text-lg font-medium mb-4">
									There was an error calculating your rewards. Please try again
									later.
								</p>
								<Button onClick={handleContinue} className="w-full">
									Continue
								</Button>
							</motion.div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

function calculateAccountAge(authDate?: Date): number {
	if (!authDate) return 0;
	const accountAgeInDays = Math.floor(
		(Date.now() - authDate.getTime()) / (1000 * 60 * 60 * 24),
	);
	return accountAgeInDays;
}
