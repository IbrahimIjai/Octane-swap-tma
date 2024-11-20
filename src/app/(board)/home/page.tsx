"use client";

import DailyTasks from "@/app/(board)/home/components/daily-tasks";
import ConnectButton from "@/components/fuel/connect-btn";
import CTAButtons from "./components/cta-buttons";
import History from "./components/history";
import MiningDashboard from "./components/mining-dashboard";
import { useUser } from "@/hooks/api/useUser";

export default function Home() {
	const {
		//fns
		isStaking,
		userData,
		isUserLoading,
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
