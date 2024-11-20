"use client";

import DailyTasks from "@/app/(board)/home/components/daily-tasks";
import ConnectButton from "@/components/fuel/connect-btn";
import OctaneSwapLogo from "@/components/logo";
import CTAButtons from "./components/cta-buttons";
import History from "./components/history";
import MiningDashboard from "./components/mining-dashboard";
import { useUser } from "@/hooks/api/useUser";
import MiningDashboardSkeleton from "@/components/loaders/dashboard-loader";

export default function Home() {
	const {
		isUserReady,
		authDate,
		//fns
		isStaking,
		userData,
		isUserLoading,
		isFetchingUserSuccess,
		userError,
		isUserError,
	} = useUser();
	return (
		<div className="relative  min-h-screen flex flex-col items-center">
			<ConnectButton />
			<MiningDashboard
				userData={userData}
				isStaking={isStaking}
				isUserLoading={isUserLoading}
			/>
			<CTAButtons />
			<DailyTasks userData={userData} isUserLoading={isUserLoading} />
			<History />
		</div>
	);
}
