import { generateETHConnectors } from "@/utils/connectors";
import {
	http,
	cookieStorage,
	createConfig,
	createStorage,
	fallback,
} from "wagmi";
import { type Chain, sepolia, mainnet } from "wagmi/chains";

export const APP = {
	name: "Fuel Connectors Example APP",
	description: "SSR Example app of Fuel Connectors",
};
export const CHAINS_TO_CONNECT = [mainnet] as [Chain, ...Chain[]];

export const TRANSPORTS = {
	[CHAINS_TO_CONNECT[0].id]: fallback(
		[
			http(
				`https://eth-${CHAINS_TO_CONNECT[0].name}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_WC_PROJECT_ID}`,
			),
			http(),
		],
		{ rank: false },
	),
};
export const DEFAULT_WAGMI_CONFIG = createConfig({
	chains: CHAINS_TO_CONNECT,
	connectors: generateETHConnectors(APP.name),
	transports: TRANSPORTS,
	storage: createStorage({
		storage: cookieStorage,
	}),
	ssr: true,
});

export const TOTAL_COMMUNITY_INCENTIVES = 22_500_000; // 22.5 million tokens
export const TELEGRAM_AGE_ALLOCATION_PERCENTAGE = 0.05; // 5% of community incentives
export const TELEGRAM_AGE_POOL =
	TOTAL_COMMUNITY_INCENTIVES * TELEGRAM_AGE_ALLOCATION_PERCENTAGE; // Total tokens for Telegram age rewards
export const MAX_ACCOUNT_AGE_DAYS = 365 * 2; // Cap at 2 years for fairness
export const MIN_ACCOUNT_AGE_DAYS = 30; // Minimum age requirement
export const DEFAULT_TWITTER_USERNAME = "octaneswap";
export const TOTAL_POOL_SIZE= 1_000_000
export const SECONDS_PER_YEAR = 31536000;

export const OCTANESWAP_TG_COMMUNITY = "t.me/octaneswap";
export const OCTANESWAP_BOT_LINK = "https://t.me/octaneswapbot";