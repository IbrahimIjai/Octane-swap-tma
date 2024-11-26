"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OctaneSwapLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initData } from "@telegram-apps/sdk-react";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { useUser } from "@/hooks/api/useUser";
import { useRouter } from "next/navigation";
import PageLoadingUi from "@/components/loaders/page-loading";

export default function OnboardingPage() {
	const { push } = useRouter();
	const [showWelcome, setShowWelcome] = useState(false);

	const {
		isUserReady,
		telegramId,
		isBot,
		userData,
		isUserLoading,
		isFetchingUserSuccess,
		createUser,
		isCreateSuccess,
		isCreating,
		isCreateError,
	} = useUser();

	const rewards = calculateTelegramAgeReward(telegramId ?? "");

	useEffect(() => {
		if (isBot) {
			throw new Error("Bots are not allowed");
		}

		if (isUserReady && !isUserLoading) {
			if (userData) {
				push("/home");
			} else {
				setShowWelcome(true);
			}
		}
	}, [isUserReady, isUserLoading, userData, isBot, push]);

	useEffect(() => {
		if (isCreateSuccess) {
			push("/home");
		}
	}, [isCreateSuccess, push]);

	const handleContinue = async () => {
		setShowWelcome(false);
		await createUser();
	};

	if (isUserLoading || !isUserReady || isCreating) {
		return <PageLoadingUi />;
	}

	if (isCreateError) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center">
				<p className="text-lg font-medium mb-4">
					There was an error creating your account. Please try again later.
				</p>
			</motion.div>
		);
	}

	if (!showWelcome) {
		return <PageLoadingUi />;
	}

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
							Welcome to OctaneSwap {initData?.user()?.firstName}
						</motion.h2>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.8 }}
							className="text-center my-3 text-sm text-muted-foreground">
							<p>
								Sign up, join our community and start participating in the
								ignition ecosystem! Here you complete tasks and earn rewards.
							</p>
							<p className="text-lg font-medium my-4 ">
								You have earned a welcoming bonus of{" "}
								<span className="text-primary">{rewards} pOCT</span>
							</p>

							<Button onClick={handleContinue} className="w-full">
								{isCreating ? "Creating Account" : "Continue to claim"}
							</Button>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
