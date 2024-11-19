import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import ShinyButton from "../ui/shinny-button";
import { AlertTriangle, ExternalLink, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";

function BindWalletNotice() {
	return (
		<Dialog>
			<DialogTrigger>
				<ShinyButton className=" w-full">
					<div className="w-full flex items-center justify-between">
						<div className=" flex items-center gap-1">
							<Wallet className="mr-2 h-4 w-4 " />
							<span>Bind Wallet to account</span>
						</div>
					</div>
				</ShinyButton>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Bind Wallet to account</DialogTitle>
					<DialogDescription>
						<div className="space-y-4">
							<p className="text-center">
								Bind your wallet to sync rewards for on-chain tasks, mint
								passes, make in-game purchases, and more!
							</p>
							<div className="bg-muted p-4 rounded-lg space-y-2">
								<h3 className="font-semibold text-lg">How to Bind:</h3>
								<ol className="list-decimal list-inside space-y-1">
									<li>Go to octaneswap.xyz/link-telegram</li>
									<li>Connect your wallet</li>
									<li>Click &quot;Bind&quot;</li>
								</ol>
							</div>
							<div className="flex justify-center">
								<Link
									href="https://octaneswap.xyz/link-telegram"
									target="_blank"
									rel="noopener noreferrer">
									<Button className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white">
										Link Now
										<ExternalLink className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							</div>
							<div className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2 text-sm">
								<AlertTriangle className="h-4 w-4" />
								<span>
									Note: Unlinking wallet may result in loss of progress
								</span>
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
// Note,
// 						unlinking wallet will lead to lost of progress
export default BindWalletNotice;
