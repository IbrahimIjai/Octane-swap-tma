"use client";

import { useEffect, useState } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function OnboardingPage() {
	const { push } = useRouter();
	const { toast } = useToast();
	const [step, setStep] = useState<
		"welcome" | "created" | "set-username" | "login"
	>("welcome");
	const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);

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
	useEffect(() => {
		if (isUserReady && !initData.user()?.username) {
			setStep("set-username");
			setIsUsernameDialogOpen(true);
		}
	}, [isUserReady]);

	const handleSetUsername = () => {
		// Open Telegram app to settings
		window.open("tg://settings", "_blank");
	};

	const handleProceedToHome = () => {
		push("/home");
	};
	const handleRetryUsernameCheck = () => {
		window.location.reload();
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
									className="text-2xl font-bold mb-4 text-center">
									Welcome back {initData?.user()?.firstName}
								</motion.h2>
							) : (
								<motion.h2
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.5 }}
									className="text-2xl font-bold mb-4  items-center">
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
			<Dialog
				open={isUsernameDialogOpen}
				onOpenChange={setIsUsernameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set Your Telegram Username</DialogTitle>
						<DialogDescription>
							To use OctaneSwap, you need to set a username for your Telegram
							account. This helps us identify you and ensures a smooth
							experience.
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col space-y-4">
						<p>Follow these steps to set your username:</p>
						<ol className="list-decimal list-inside space-y-2">
							<li>Open your Telegram app</li>
							<li>Go to Settings</li>
							<li>Tap on &quot;Username&quot; and set a unique username</li>
							<li>
								Return to OctaneSwap and click &quot;I&apos;ve set my
								username&quot;
							</li>
						</ol>
						<div className="flex justify-between">
							<Button onClick={handleSetUsername}>
								Open Telegram Settings
							</Button>
							<Button onClick={handleRetryUsernameCheck}>
								I&apos;ve set my username
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</AnimatePresence>
	);
}
