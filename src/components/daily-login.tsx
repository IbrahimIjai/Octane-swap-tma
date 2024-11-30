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
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export function DailyCheckInModal() {
	// const [isOpen, setIsOpen] = useState(false);
	const { userData, refetchUser } = useUser();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
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
			toast({
				title: "Success!",
				description: "You've claimed your daily 5 pOCT bonus!",
			});
			// queryClient.invalidateQueries(["dailyCheckInStatus"]);
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

	console.log({ isOpen, pathname });
	
	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Daily Check-In Bonus!</DialogTitle>
					<DialogDescription>
						Welcome back! Claim your daily 5 pOCT bonus for logging in.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						onClick={() => claimMutation.mutate()}
						disabled={claimMutation.isPending || isChecking}>
						{claimMutation.isPending
							? "Claiming..."
							: claimMutation.isSuccess
							? "Claimed successfully"
							: "Claim 5 pOCT"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
