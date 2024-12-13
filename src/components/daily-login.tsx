"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/api/useUser";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Gift, X } from "lucide-react";
import confetti from "canvas-confetti";

export function DailyCheckInModal() {
	const { userData, refetchUser } = useUser();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const [isSuccess, setIsSuccess] = useState(false);
	const { toast } = useToast();

	const {
		data: dailyCheckStatus,
		isLoading: isChecking,
		refetch,
	} = useQuery({
		queryKey: ["dailyCheckInStatus", userData?.id],
		queryFn: async () => {
			const response = await fetch(
				`/apis/user/dailycheckin?userId=${userData?.id}`,
			);
			if (!response.ok)
				throw new Error("Failed to fetch daily check-in status");
			return response.json();
		},
		enabled: !!userData?.id,
	});

	const claimMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/apis/user/dailycheckin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId: userData?.id }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to claim daily bonus");
			}

			return response.json();
		},
		onSuccess: async () => {
			setIsSuccess(true);
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 },
			});
			// queryClient.invalidateQueries(["dailyCheckInStatus"]);
			await refetchUser();
		},
		onError: (error: any) => {
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to claim daily bonus. Please try again.",
				variant: "destructive",
			});
		},
	});

	useEffect(() => {
		refetch();
	}, [claimMutation.isSuccess, claimMutation.isPending]);

	const isOpen =
		userData && dailyCheckStatus?.shouldShowModal && pathname === "/home";

	const handleClose = () => {
		queryClient.setQueryData(["dailyCheckInStatus", userData?.id], {
			shouldShowModal: false,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold flex items-center gap-2">
						<Gift className="w-6 h-6 text-primary" />
						Daily Check-In Bonus!
					</DialogTitle>
					<DialogDescription>
						Welcome back! Claim your daily 5 pOCT bonus for logging in.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<AnimatePresence mode="wait">
						{!isSuccess ? (
							<motion.div
								key="claim"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}>
								<p className="text-center text-lg mb-4">
									You&apos;re on a {dailyCheckStatus?.streak || 1} day streak!
								</p>
								<div className="flex justify-center">
									<Button
										onClick={() => claimMutation.mutate()}
										disabled={claimMutation.isPending || isChecking}
										size="lg"
										className="animate-pulse hover:animate-none">
										{claimMutation.isPending ? "Claiming..." : "Claim 5 pOCT"}
									</Button>
								</div>
							</motion.div>
						) : (
							<motion.div
								key="success"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, type: "spring" }}
								className="text-center">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 0.5, ease: "easeInOut" }}
									className="inline-block mb-4">
									<CheckCircle className="w-16 h-16 text-green-500" />
								</motion.div>
								<h3 className="text-xl font-semibold mb-2">
									Claimed Successfully!
								</h3>
								<p className="text-muted-foreground mb-4">
									You&apos;ve earned 5 pOCT. Keep up the daily streak!
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
				<DialogFooter>
					{isSuccess && (
						<Button onClick={handleClose} variant="outline">
							Close
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
