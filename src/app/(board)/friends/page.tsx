"use client";

import React, { useState } from "react";
import { Users, Copy, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/api/useUser";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { sendData } from "@telegram-apps/sdk-react";
import PageLoadingUi from "@/components/loaders/page-loading";

interface ReferredFriend {
	id: string;
	telegramId: string;
	createdAt: string;
	rewardAmount: number;
}

const FriendsAndReferral = () => {
	const { toast } = useToast();
	const { userData, getReferralLink, isGettingReferralLink } = useUser();
	const [referralLink, setReferralLink] = useState<string | null>(null);

	const { data: friends, isLoading: isLoadingFriends } = useQuery<
		ReferredFriend[]
	>({
		queryKey: ["referredFriends", userData?.id],
		queryFn: async () => {
			const response = await axios.get(
				`/apis/user/refferedfriends?userId=${userData?.id}`,
			);
			return response.data;
		},
		enabled: !!userData?.id,
	});

	const handleGetReferralLink = async () => {
		try {
			const response = await getReferralLink();
			setReferralLink(response.referralLink);
			toast({
				title: "Success",
				description: "Referral link generated successfully!",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to generate referral link. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleCopyLink = async () => {
		if (referralLink) {
			await navigator.clipboard.writeText(referralLink);
			toast({
				title: "Copied",
				description: "Referral link copied to clipboard",
			});
		}
	};

	const handleShare = () => {
		if (referralLink && sendData.isAvailable()) {
			sendData(referralLink);
		} else {
			toast({
				title: "Error",
				description: "Sharing is not available in this context",
				variant: "destructive",
			});
		}
	};

	if (isLoadingFriends) {
		return <PageLoadingUi />;
	}

	const totalRewardsEarned =
		friends?.reduce((sum, friend) => sum + friend.rewardAmount, 0) || 0;

	return (
		<div className="space-y-6 max-w-md mx-auto p-4 pb-[120px]">
			{/* Rewards Summary */}
			<Card>
				<CardContent className="pt-6">
					<div className="text-center space-y-2">
						<h3 className="text-2xl font-bold">{friends?.length || 0}</h3>
						<p className="text-muted-foreground">Friends Invited</p>
					</div>
					<div className="mt-4 text-center">
						<p className="text-lg font-semibold text-green-500">
							+{totalRewardsEarned} pOCT
						</p>
						<p className="text-sm text-muted-foreground">
							Total Rewards Earned
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Referral Actions */}
			<Card>
				<CardContent className="pt-6">
					{!referralLink ? (
						<Button
							onClick={handleGetReferralLink}
							disabled={isGettingReferralLink}
							className="w-full">
							{isGettingReferralLink
								? "Generating..."
								: "Generate Referral Link"}
						</Button>
					) : (
						<div className="space-y-3">
							<Button
								variant="outline"
								onClick={handleCopyLink}
								className="w-full">
								<Copy className="mr-2 h-4 w-4" />
								Copy Link
							</Button>
							<Button onClick={handleShare} className="w-full">
								<Share2 className="mr-2 h-4 w-4" />
								Share with Friends
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Encouraging Message */}
			<Alert>
				<AlertDescription className="text-sm text-center">
					Invite your friends to join Octane Swap and earn rewards together!
					Each friend you invite helps grow our community and earns you pOCT
					tokens.
				</AlertDescription>
			</Alert>

			{/* Friends List */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Invited Friends</CardTitle>
				</CardHeader>
				<CardContent>
					{friends && friends.length > 0 ? (
						<div className="space-y-4">
							{friends.map((friend) => (
								<div
									key={friend.id}
									className="flex items-center justify-between p-2 border-b">
									<div className="flex items-center space-x-3">
										<div className="bg-muted p-2 rounded-full">
											<Users size={16} />
										</div>
										<div>
											<div className="font-medium">{friend.telegramId}</div>
											<div className="text-sm text-muted-foreground">
												{new Date(friend.createdAt).toLocaleString()}
											</div>
										</div>
									</div>
									<span className="text-sm text-green-500">
										+{friend.rewardAmount} pOCT
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="text-center text-muted-foreground py-8">
							You haven&apos;t invited any friends yet.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default FriendsAndReferral;
