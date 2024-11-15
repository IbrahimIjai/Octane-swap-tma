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
	return (
		<div className="relative  min-h-screen flex flex-col items-center">
			<ConnectButton />

			<MiningDashboard />

			<CTAButtons />
			<DailyTasks />
			<History />
		</div>
	);
}
