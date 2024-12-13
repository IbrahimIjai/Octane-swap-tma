"use client";

import DailyTasks from "@/app/(board)/home/components/daily-tasks";
import ConnectButton from "@/components/fuel/connect-btn";
import CTAButtons from "./components/cta-buttons";
import History from "./components/history";
import MiningDashboard from "./components/mining-dashboard";
import { useUser } from "@/hooks/api/useUser";
import Notifications from "@/components/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
	const {
		//fns
		isStaking,
		userData,

		isUserLoading,
	} = useUser();
	const [showNotification, setShowNotification] = useState(true);

	return (
		<div className="relative min-h-screen flex flex-col items-center pb-[130px]">
			<AnimatePresence>{showNotification && <Notifications />}</AnimatePresence>
			<motion.div
				layout
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="w-full">
				<ConnectButton />
				<MiningDashboard
					userData={userData}
					isStaking={isStaking}
					isUserLoading={isUserLoading}
				/>
				<CTAButtons />
				<DailyTasks userData={userData} isUserLoading={isUserLoading} />
				<History />
			</motion.div>
		</div>
	);
}
