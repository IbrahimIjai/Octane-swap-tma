"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DisplayDataRow } from "@/components/default-comp/DisplayData/DisplayData";
import OctaneSwapLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInitData } from "@telegram-apps/sdk-react";
import { Loader2 } from "lucide-react";
import { calculateAccountAge, calculateTelegramAgeReward } from "@/lib/utils";
import { useUser } from "@/hooks/api/useUser";
import { useRouter } from "next/navigation";
import PageLoadingUi from "@/components/loaders/page-loading";

export default function RewardsCalculator() {
	const { push } = useRouter();

	const {
		isUserReady,
		authDate,

		userData,
		isUserLoading,
		isFetchingUserSuccess,
		userError,
		isUserError,

		createUser,
		isCreateSuccess,
		isCreating,
		createError,
		isCreateError,
	} = useUser();

	const userExist = userData && userData?.telegramId;

	console.log({ userData, userExist });

	useEffect(() => {
		if (userExist) {
			push("/home");
		}
	}, [isFetchingUserSuccess, isUserLoading]);

	const isLoading = isUserLoading || isCreating;

	if (isLoading || !isUserReady || !isFetchingUserSuccess) {
		return (
			<>
				<PageLoadingUi />
			</>
		);
	}
	if (isUserError || isCreateError) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.8 }}
				className="text-center">
				<p className="text-lg font-medium mb-4">
					There was an error calculating your rewards. Please try again later.
				</p>
			</motion.div>
		);
	}
	// if (isFetchingUserSuccess && !userData?.id && !userData)
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
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
								className="text-center">
								<p className="text-lg font-medium mb-2">
									Your Telegram account age is{" "}
									<span className="text-primary">
										{calculateAccountAge(authDate)} days
									</span>
									.
								</p>
								<p className="text-lg font-medium mb-4">
									You have earned{" "}
									<span className="text-primary">
										{calculateTelegramAgeReward(authDate!)} points
									</span>{" "}
									for your onboarding.
								</p>

								{/* //create user */}
								<Button
									onClick={async () => await createUser()}
									className="w-full">
									Continue
								</Button>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
}
