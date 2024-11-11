"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import type { State } from "wagmi";
import { ConnectProvider } from "./connect-provider";
import { FuelProviders } from "./fuel-provider-child";

const queryClient = new QueryClient();

export function ProvidersForFuel({
	children,
	initialState: wagmiInitialState,
}: {
	children: React.ReactNode;
	initialState?: State;
}) {
	return (
		<QueryClientProvider client={queryClient}>
			<ConnectProvider wagmiInitialState={wagmiInitialState}>
				<FuelProviders>{children}</FuelProviders>
			</ConnectProvider>
		</QueryClientProvider>
	);
}
