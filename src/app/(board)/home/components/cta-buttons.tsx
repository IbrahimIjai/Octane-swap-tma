import { Button } from "@/components/ui/button";
import ShimmerButton from "@/components/ui/shimmer-button";
import ShinyButton from "@/components/ui/shinny-button";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { ChevronRight, Rocket, Users, Wallet2 } from "lucide-react";
import React from "react";

export default function CTAButtons() {
	//  1. Bind Wallet Button
	//  2. Boostearnings/ automations
	//  3.

	 const handleTelegramClick = async () => {
			try {
				// Check if the Telegram SDK is available
				if (typeof openTelegramLink?.ifAvailable === "function") {
					await openTelegramLink.ifAvailable("https://t.me/heyqbnk");
				} else {
					// Fallback to regular link if SDK is not available
					window.open("https://t.me/heyqbnk", "_blank");
				}
			} catch (error) {
				console.error("Error opening Telegram:", error);
				// Fallback to regular link
				window.open("https://t.me/heyqbnk", "_blank");
			}
		};

	return (
		<div className="w-full flex flex-col gap-4">
			<Button onClick={handleTelegramClick} className="w-full">Testing...</Button>
			<ShinyButton
				onClick={handleTelegramClick}
				className="w-full bg-background/10  text-foreground">
				<div className="flex items-center justify-between p-2">
					<div className="flex gap-3 items-center">
						<Users className="w-4 h-4 mr-2" />
						<span>Join our community</span>
					</div>

					<ChevronRight className="w-4 h-4" />
				</div>
			</ShinyButton>

			<ShinyButton className="w-full bg-background/10  text-foreground">
				<div className="flex items-center justify-between p-2">
					<div className="flex gap-3 items-center">
						<Wallet2 className="w-4 h-4 mr-2" />
						<span>Bind Wallet with tg profile</span>
					</div>

					<ChevronRight className="w-4 h-4" />
				</div>
			</ShinyButton>

			<ShinyButton className="w-full bg-background/10  text-foreground">
				<div className="flex items-center justify-between p-2">
					<div className="flex gap-3 items-center">
						<Rocket className="w-4 h-4 mr-2" />
						<span>Boosts and automation</span>
					</div>

					<ChevronRight className="w-4 h-4" />
				</div>
			</ShinyButton>

			<ShinyButton className="w-full bg-background/10  text-foreground">
				<div className="flex items-center justify-between p-2">
					<div className="flex gap-3 items-center">
						<Rocket className="w-4 h-4 mr-2" />
						<span>Connect twitter</span>
					</div>

					<ChevronRight className="w-4 h-4" />
				</div>
			</ShinyButton>
		</div>
	);
}
