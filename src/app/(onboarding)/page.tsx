"use client";

import { Section, Cell, Image, List } from "@telegram-apps/telegram-ui";

import { Link } from "@/components/Link/Link";

import tonSvg from "./_assets/ton.svg";
import UserHomeInfo from "@/components/ibelick-ui/swipable-stack-cards";
import Header from "@/components/layout/header";
import DailyTasks from "@/components/daily-tasks";
import PageContent from "@/components/Root/fuel/page-content";
import ConnectButton from "@/components/fuel/connect-btn";

export default function Home() {
	return (
		<div className="relative  min-h-screen flex flex-col items-center">
			{/* <Header />
			<UserHomeInfo />
			<div className="min-h-screen bg-background rounded-t-lg w-full mt-8 px-4 pt-4 pb-24">
				<DailyTasks />
			</div> */}
			{/* <PageContent/> */}
			<ConnectButton />
		</div>
	);
}
