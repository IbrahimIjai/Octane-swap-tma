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
export default function ConnectButton() {
	const { connect, error, isError, isConnecting } = useConnectUI();
	const { disconnect } = useDisconnect();
	const { isConnected } = useIsConnected();
	const { accounts } = useAccounts();
	const { wallet } = useWallet();
	const { currentConnector } = useCurrentConnector();
	const [signature, setSignature] = useState("");
	console.log({ wallet });
	async function signMessage() {
		console.log("signMessage function called");
		try {
			const message = "Hello World!";
			console.log("Message to sign:", message);

			if (hasSignMessageCustomCurve(currentConnector)) {
				console.log("Using custom curve signing");
				const { curve, signature } =
					await currentConnector.signMessageCustomCurve(message);
				console.log("Custom curve signature obtained:", { curve, signature });
				setSignature(`${curve} signature - ${signature}`);
			} else if (wallet) {
				console.log("Using native wallet signing");
				const signature = await wallet.signMessage(message);
				console.log("Native signature obtained:", signature);
				setSignature(`Native signature - ${signature}`);
			} else {
				console.log("No suitable signing method available");
			}
		} catch (error) {
			console.error("Error in signMessage:", error);
		}
	}
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
				<div className="flex items-center space-x-4">
					<Button variant="outline" onClick={() => signMessage()}>
						Sign Message
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							disconnect();
							setSignature("");
						}}>
						Disconnect
					</Button>
				</div>
			)}

			{isError && <p className="text-destructive">{error?.message}</p>}

			{wallet && (
				<div className="text-sm font-medium">
					Connected: {shortenAddress(wallet.address.toString())}
				</div>
			)}

			{isConnected && signature && (
				<div className="mt-4 text-sm">
					<h3 className="font-semibold">Signature</h3>
					<p className="mt-1 break-all">{signature}</p>
				</div>
			)}
		</div>
	);
}
