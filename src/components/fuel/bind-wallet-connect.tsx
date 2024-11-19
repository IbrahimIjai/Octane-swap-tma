import React, { useState } from "react";
import { Button } from "../ui/button";

import { hasSignMessageCustomCurve } from "@fuels/connectors";
import {
	useAccounts,
	useConnectUI,
	useCurrentConnector,
	useDisconnect,
	useIsConnected,
	useWallet,
} from "@fuels/react";
import { ChevronRight, Loader2, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import ShinyButton from "../ui/shinny-button";

export default function BindWalletButton() {
	const { connect, error, isError, isConnecting } = useConnectUI();
	const { disconnect } = useDisconnect();
	const { isConnected } = useIsConnected();
	const { wallet } = useWallet();
	const [signature, setSignature] = useState("");
	console.log({ wallet });

	return (
		<>
			{!isConnected ? (
				<ShinyButton
					className=" w-full "
					onClick={() => {
						console.log("connect");
						connect();
					}}>
					{isConnecting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Connecting
						</>
					) : (
						<div className="w-full flex items-center justify-between">
							<div className=" flex items-center gap-1">
								<Wallet className="mr-2 h-4 w-4" />
								<span> Connect Wallet and bind wallet</span>
							</div>

							<ChevronRight className="w-4 h-4" />
						</div>
					)}
				</ShinyButton>
			) : (
				<Popover>
					<PopoverTrigger className="w-full">
						<ShinyButton className=" w-full">
							<div className="w-full flex items-center justify-between">
								<div className=" flex items-center gap-1">
									<Wallet className="mr-2 h-4 w-4 text-green-700" />
									<span>
										Connected:{" "}
										{wallet && shortenAddress(wallet.address.toString())}
									</span>
								</div>
							</div>
						</ShinyButton>
					</PopoverTrigger>
					<PopoverContent className="w-full">
						{" "}
						<Button className="w-full my-3">
							Bind Wallet Address with account
						</Button>
						<Button
							variant="destructive"
							className="w-full"
							onClick={() => {
								disconnect();
								setSignature("");
							}}>
							Disconnect
						</Button>
					</PopoverContent>
				</Popover>
			)}

			{isError && <p className="text-destructive">{error?.message}</p>}
		</>
	);
}
