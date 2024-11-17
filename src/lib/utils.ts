import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	MAX_ACCOUNT_AGE_DAYS,
	MIN_ACCOUNT_AGE_DAYS,
	TELEGRAM_AGE_POOL,
} from "./config";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function shortenAddress(address: string) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// export function calculateAccountAge(authDate?: Date): number {
// 	if (!authDate) return 0;
// 	const accountAgeInDays = Math.floor(
// 		(Date.now() - authDate.getTime()) / (1000 * 60 * 60 * 24),
// 	);
// 	return accountAgeInDays;
// }

// export const calculateTelegramAgeReward = (authDate: Date) => {
// 	const accountAge = calculateAccountAge(authDate);

// 	if (accountAge < MIN_ACCOUNT_AGE_DAYS) {
// 		return 0;
// 	}
// 	// Cap the account age at maximum days
// 	const cappedAge = Math.min(accountAge, MAX_ACCOUNT_AGE_DAYS);

// 	// Calculate the reward based on a logarithmic scale
// 	// This gives diminishing returns for older accounts while still rewarding loyalty
// 	const rewardMultiplier =
// 		Math.log10(cappedAge - MIN_ACCOUNT_AGE_DAYS + 1) /
// 		Math.log10(MAX_ACCOUNT_AGE_DAYS - MIN_ACCOUNT_AGE_DAYS + 1);

// 	// Calculate the final reward
// 	const rewardAmount = TELEGRAM_AGE_POOL * rewardMultiplier;

// 	// Round to 2 decimal places
// 	return Math.round(rewardAmount * 100) / 100;
// };

// lib/utils.ts

export const calculateAccountAge = (userId: string): number => {
	// Extract creation timestamp from Telegram user ID
	const creationTimestamp = Math.floor(parseInt(userId) / 2 ** 32);
	const creationDate = new Date(creationTimestamp * 1000);
	const currentDate = new Date();

	// Calculate age in days
	const ageInMilliseconds = currentDate.getTime() - creationDate.getTime();
	const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));

	return ageInDays;
};

export const calculateTelegramAgeReward = (userId: string): number => {
	const accountAge = calculateAccountAge(userId);

	if (accountAge <= 30) return 100;
	if (accountAge <= 90) return 200;
	if (accountAge <= 180) return 300;
	if (accountAge <= 365) return 400;
	return 500;
};

export const generateReferralLink = (
	// botUsername: string,
	referralCode: string,
) => {
	return ` t.me/octaneswapbot/octaneswaptma?start=${referralCode}`;
};
