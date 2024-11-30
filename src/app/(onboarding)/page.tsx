"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OctaneSwapLogo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initData } from "@telegram-apps/sdk-react";
import { calculateTelegramAgeReward } from "@/lib/utils";
import { useUser } from "@/hooks/api/useUser";
import { useRouter } from "next/navigation";
import PageLoadingUi from "@/components/loaders/page-loading";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
	const { push } = useRouter();
	const { toast } = useToast();
	const [step, setStep] = useState<"welcome" | "created" | "login">("welcome");

	const {
		isUserReady,
		telegramId,
		isBot,
		userData,
		isUserLoading,
		createUser,
		isCreating,
		isCreateError,
	} = useUser();

	const rewards = calculateTelegramAgeReward(telegramId ?? "");

	const handleCreateUser = async () => {
		try {
			await createUser();
			setStep("created");
			toast({
				title: "Success",
				description: "Your account has been created successfully!",
			});
		} catch (error) {
			console.error("Error creating user:", error);
			toast({
				title: "Error",
				description: "Failed to create your account. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleProceedToHome = () => {
		push("/home");
	};

	if (isUserLoading || !isUserReady) {
		return <PageLoadingUi />;
	}

	if (isBot) {
		return (
			<div className="flex items-center justify-center h-screen">
				<h1 className="text-2xl font-bold text-red-500">
					Bots are not allowed
				</h1>
			</div>
		);
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={step}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
				className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
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
							{userData ? (
								<motion.h2
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.5 }}
									className="text-2xl font-bold mb-4">
									Welcome back {initData?.user()?.firstName}
								</motion.h2>
							) : (
								<motion.h2
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.5 }}
									className="text-2xl font-bold mb-4">
									Welcome to OctaneSwap {initData?.user()?.firstName}
								</motion.h2>
							)}

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
								className="text-center my-3 text-sm text-muted-foreground w-full">
								{!userData && (
									<p>
										Sign up, join our community and start participating in the
										ignition ecosystem! Here you complete tasks and earn
										rewards.
									</p>
								)}
								{step === "welcome" && (
									<>
										{userData ? (
											<Button
												onClick={handleProceedToHome}
												className="w-full mt-4">
												Enter
											</Button>
										) : (
											<>
												<p className="text-lg font-medium my-4">
													You have earned a welcoming bonus of{" "}
													<span className="text-primary">{rewards} pOCT</span>
												</p>
												<Button
													onClick={handleCreateUser}
													className="w-full mt-4"
													disabled={isCreating}>
													{isCreating
														? "Creating Account..."
														: "Create Account"}
												</Button>
											</>
										)}
									</>
								)}
								{step === "created" && (
									<>
										<p className="text-lg font-medium my-4">
											Your account has been created successfully!
										</p>
										<Button
											onClick={handleProceedToHome}
											className="w-full mt-4">
											Proceed to Home
										</Button>
									</>
								)}
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
