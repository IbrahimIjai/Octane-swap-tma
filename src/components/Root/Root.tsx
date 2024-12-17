"use client";
import "./styles.css";
import { ProvidersForFuel } from "./fuel/fuel-provider";
import Notifications from "../notifications";
import PageLoadingUi from "../loaders/page-loading";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
	useLaunchParams,
	miniApp,
	useSignal,
	showBackButton,
	isBackButtonVisible,
} from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { init } from "@/init";
import { useClientOnce } from "@/hooks/useClientOnce";
import { DailyCheckInModal } from "../daily-login";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { OCTANESWAP_TG_COMMUNITY } from "@/lib/config";
import ShinyButton from "../ui/shinny-button";
import { ChevronRight, Users } from "lucide-react";
import OctaneSwapLogo from "../logo";

function RootInner({ children }: PropsWithChildren) {
	if (process.env.NODE_ENV === "development") {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useTelegramMock();
	}

	const lp = useLaunchParams();
	useClientOnce(() => {
		init(lp.startParam === "debug");
	});
	if (showBackButton.isAvailable()) {
		showBackButton();
		isBackButtonVisible(); // true
	}
	const isDark = useSignal(miniApp.isDark);
	const manifestUrl = useMemo(() => {
		return new URL("tonconnect-manifest.json", window.location.href).toString();
	}, []);

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

	console.log({ islaunchdate: process.env.NEXT_PUBLIC_IS_LAUNCHED });

	return (
		<AppRoot
			appearance={isDark ? "dark" : "light"}
			platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}>
			{process.env.NEXT_PUBLIC_IS_LAUNCHED === "nlfg" ? (
				<div className="h-screen w-full  bg-gradient-to-b from-background to-primary/10 flex flex-col gap-3 items-start justify-center px-4">
					<div className="mx-auto mb-8">
						<OctaneSwapLogo
							size={128}
							variant={1}
							animated={true}
							className={`${"animate-spin spin-out-12"}`}
						/>
					</div>
					<p>
						Stay tuned to octaneswap channel to be the first to get refueled!
					</p>
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
				</div>
			) : (
				<ProvidersForFuel>
					<DailyCheckInModal />
					{children}
				</ProvidersForFuel>
			)}
		</AppRoot>
	);
}

export function Root(props: PropsWithChildren) {
	// Unfortunately, Telegram Mini Apps does not allow us to use all features of the Server Side
	// Rendering. That's why we are showing loader on the server side.
	const didMount = useDidMount();

	return didMount ? (
		<ErrorBoundary fallback={ErrorPage}>
			<RootInner {...props} />
		</ErrorBoundary>
	) : (
		<PageLoadingUi />
	);
}
