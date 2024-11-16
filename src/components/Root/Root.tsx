"use client";

// import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
// import {
// 	SDKProvider,
// 	useLaunchParams,
// 	useMiniApp,
// 	useThemeParams,
// 	useViewport,
// 	bindMiniAppCSSVars,
// 	bindThemeParamsCSSVars,
// 	bindViewportCSSVars,
// } from "@telegram-apps/sdk-react";
// import { AppRoot } from "@telegram-apps/telegram-ui";

// import { ErrorBoundary } from "@/components/ErrorBoundary";
// import { ErrorPage } from "@/components/ErrorPage";
// import { useTelegramMock } from "@/hooks/useTelegramMock";
// import { useDidMount } from "@/hooks/useDidMount";

import "./styles.css";
import { ProvidersForFuel } from "./fuel/fuel-provider";
import Notifications from "../notifications";
import PageLoadingUi from "../loaders/page-loading";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useLaunchParams, miniApp, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { init } from "@/init";
import { useClientOnce } from "@/hooks/useClientOnce";

function RootInner({ children }: PropsWithChildren) {
	// Mock Telegram environment in development mode if needed.
	if (process.env.NODE_ENV === "development") {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useTelegramMock();
	}

	const lp = useLaunchParams();
	useClientOnce(() => {
		init(lp.startParam === "debug");
	});

	const isDark = useSignal(miniApp.isDark);
	const manifestUrl = useMemo(() => {
		return new URL("tonconnect-manifest.json", window.location.href).toString();
	}, []);

	const [showNotification, setShowNotification] = useState(true);

	return (
		<AppRoot
			appearance={isDark ? "dark" : "light"}
			platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}>
			<ProvidersForFuel>
				<Notifications
					isVisible={showNotification}
					setIsVisible={setShowNotification}
				/>
				<div className={`${showNotification ? "pt-36" : "pt-10"} px-2 pb-32`}>
					{children}
				</div>
			</ProvidersForFuel>
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
		<div className="root__loading">
			<PageLoadingUi />
		</div>
	);
}
