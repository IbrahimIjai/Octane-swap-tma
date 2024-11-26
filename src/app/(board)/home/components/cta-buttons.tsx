import BindWalletNotice from "@/components/fuel/bind-wallet-notice";
import ShinyButton from "@/components/ui/shinny-button";
import { OCTANESWAP_TG_COMMUNITY } from "@/lib/config";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { ChevronRight, Users } from "lucide-react";
import React from "react";

export default function CTAButtons() {
	const handleTelegramClick = async () => {
		try {
			// Check if the Telegram SDK is available
			if (typeof openTelegramLink?.ifAvailable === "function") {
				await openTelegramLink.ifAvailable(`${OCTANESWAP_TG_COMMUNITY}`);
			} else {
				// Fallback to regular link if SDK is not available
				window.open(`${OCTANESWAP_TG_COMMUNITY}`, "_blank");
			}
		} catch (error) {
			// Fallback to regular link
			window.open(`${OCTANESWAP_TG_COMMUNITY}`, "_blank");
		}
	};

	return (
		<div className="w-full flex flex-col gap-4">
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

			<BindWalletNotice />
		</div>
	);
}
