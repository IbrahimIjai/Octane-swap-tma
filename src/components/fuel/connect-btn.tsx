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
import { Loader2 } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export default function ConnectButton() {
	const { connect, error, isError, isConnecting } = useConnectUI();
	const { disconnect } = useDisconnect();
	const { isConnected } = useIsConnected();
	const { accounts } = useAccounts();
	const { wallet } = useWallet();
	const { currentConnector } = useCurrentConnector();
	const [signature, setSignature] = useState("");
	console.log({ wallet });

	return (
		<div className="flex flex-col items-center space-y-4">
			{!isConnected ? (
				<Button
					onClick={() => {
						console.log("connect");
						connect();
					}}
					disabled={isConnecting}>
					{isConnecting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Connecting
						</>
					) : (
						"Connect Wallet"
					)}
				</Button>
			) : (
				<Popover>
					<PopoverTrigger>
						Connected: {wallet && shortenAddress(wallet.address.toString())}
					</PopoverTrigger>
					<PopoverContent>
						{" "}
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
		</div>
	);
}
