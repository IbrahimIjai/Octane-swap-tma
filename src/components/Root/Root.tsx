"use client";

import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
	SDKProvider,
	useLaunchParams,
	useMiniApp,
	useThemeParams,
	useViewport,
	bindMiniAppCSSVars,
	bindThemeParamsCSSVars,
	bindViewportCSSVars,
} from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";

import "./styles.css";
import { ProvidersForFuel } from "./fuel/fuel-provider";
import Notifications from "../notifications";

function App(props: PropsWithChildren) {
	const lp = useLaunchParams();
	const miniApp = useMiniApp();
	const themeParams = useThemeParams();
	const viewport = useViewport();

	useEffect(() => {
		return bindMiniAppCSSVars(miniApp, themeParams);
	}, [miniApp, themeParams]);

	useEffect(() => {
		return bindThemeParamsCSSVars(themeParams);
	}, [themeParams]);

	useEffect(() => {
		miniApp.setHeaderColor("#00060097");
		return viewport && bindViewportCSSVars(viewport);
	}, [viewport]);

	return (
		<AppRoot
			appearance={"dark"}
			platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}>
			{props.children}
		</AppRoot>
	);
}

function RootInner({ children }: PropsWithChildren) {
	// Mock Telegram environment in development mode if needed.
	if (process.env.NODE_ENV === "development") {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useTelegramMock();
	}

	const debug = useLaunchParams().startParam === "debug";
	useEffect(() => {
		if (debug) {
			import("eruda").then((lib) => lib.default.init());
		}
	}, [debug]);

	const [showNotification, setShowNotification] = useState(true);

	return (
		<SDKProvider acceptCustomStyles debug={debug}>
			<App>
				<ProvidersForFuel>
					<Notifications
						isVisible={showNotification}
						setIsVisible={setShowNotification}
					/>
					<div className={`${showNotification ? "pt-36" : "pt-10"} px-2 pb-32`}>
						{children}
					</div>
				</ProvidersForFuel>
			</App>
		</SDKProvider>
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
		<div className="root__loading">Loading</div>
	);
}
