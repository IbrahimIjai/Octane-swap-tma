import { Button } from "@/components/ui/button";
import ShimmerButton from "@/components/ui/shimmer-button";
import ShinyButton from "@/components/ui/shinny-button";
import { ChevronRight, Rocket, Wallet2 } from "lucide-react";
import React from "react";

export default function CTAButtons() {
	//  1. Bind Wallet Button
	//  2. Boostearnings/ automations
	//  3.
	return (
		<div className="w-full flex flex-col gap-4">
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
		</div>
	);
}
