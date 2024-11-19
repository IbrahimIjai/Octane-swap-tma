"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DEFAULT_WAGMI_CONFIG } from "@/lib/config";
import { createConfig, defaultConnectors } from "@fuels/connectors";
import { FuelProvider } from "@fuels/react";
import { CHAIN_IDS, Provider } from "fuels";
import { useState } from "react";
import { type State, WagmiProvider } from "wagmi";
export const NetworkUrl: string = "https://mainnet.fuel.network/v1/graphql";
const NETWORKS = [
	{
		chainId: CHAIN_IDS.fuel.testnet,
		url: "https://testnet.fuel.network/v1/graphql",
	},
	{
		chainId: CHAIN_IDS.fuel.mainnet,
		url: NetworkUrl,
	},
];

// For SSR application we need to use
// createConfig to avoid errors related to window
// usage inside the connectors.
const FUEL_CONFIG = createConfig(() => {
	return {
		connectors: defaultConnectors({
			devMode: true,
			
			wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
			//@ts-ignore
			ethWagmiConfig: DEFAULT_WAGMI_CONFIG,
			chainId: NETWORKS[1].chainId,
			fuelProvider: Provider.create(NETWORKS[0].url),
			
		}),
	};
});

export const FuelProviders = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	return (
		<>
			<FuelProvider theme={theme} fuelConfig={FUEL_CONFIG} networks={NETWORKS}>
				{children}
			</FuelProvider>
		</>
	);
};
