"use client";

import DailyTasks from "@/app/(board)/home/components/daily-tasks";
import ConnectButton from "@/components/fuel/connect-btn";
import OctaneSwapLogo from "@/components/logo";
import CTAButtons from "./components/cta-buttons";
import History from "./components/history";
import MiningDashboard from "./components/mining-dashboard";
import { useUser } from "@/hooks/api/useUser";
import { useUserStake } from "@/hooks/api/useUserStakeFn";
import MiningDashboardSkeleton from "@/components/loaders/dashboard-loader";

export default function Home() {
	const {
		isUserReady,
		authDate,

		userData,
		isUserLoading,
		isFetchingUserSuccess,
		userError,
		isUserError,
	} = useUser();

	const isLoading = isUserLoading || !userData;
	// const testloading = false;
	return (
		<div className="relative  min-h-screen flex flex-col items-center">
			<ConnectButton />

			{isLoading ? (
				<MiningDashboardSkeleton />
			) : (
				<MiningDashboard user={userData} />
			)}

			<CTAButtons />
			<DailyTasks />
			<History />
		</div>
	);
}
