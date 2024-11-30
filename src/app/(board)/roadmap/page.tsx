"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Rocket,
	Users,
	Droplet,
	BarChart3,
	Flame,
	Zap,
	CheckCheck,
	Sparkles,
	Layers,
	Repeat,
	TrendingUp,
} from "lucide-react";

interface Feature {
	text: string;
	isAchieved: boolean;
}

interface RoadmapPhase {
	title: string;
	timeline: string;
	description: string;
	features: Feature[];
	status: "completed" | "current" | "upcoming";
	icon: React.ReactNode;
	highlightFeature?: string;
}

const roadmapData: RoadmapPhase[] = [
	{
		title: "Community Ignition",
		timeline: "Q4 2024",
		description:
			"Laying the groundwork for a revolutionary DeFi experience on Fuel Network",
		features: [
			{
				text: "Launch Telegram Mini App with seamless wallet integration",
				isAchieved: true,
			},
			{
				text: "Engage community through innovative reward programs",
				isAchieved: true,
			},
			{
				text: "Forge strategic partnerships within the Fuel ecosystem",
				isAchieved: false,
			},
		],
		status: "completed",
		icon: <Users className="w-6 h-6" />,
		highlightFeature: "100,000 Early Adopters Onboarded",
	},
	{
		title: "Octane Testnet Ignition",
		timeline: "Q1 2025, Jan - Feb",
		description: "Unveiling Octane Swap, Launch on Fuel's testnet",
		features: [
			{
				text: "Deploy core swap functionality on Fuel testnet",
				isAchieved: false,
			},
			{ text: "Conduct comprehensive security audits", isAchieved: false },
			{
				text: "Introduce NFT collection for community funding and rewards",
				isAchieved: false,
			},
			{
				text: "Launch beta testing program with exclusive rewards",
				isAchieved: false,
			},
			{
				text: "Implement advanced trading features and UI enhancements",
				isAchieved: false,
			},
		],
		status: "current",
		icon: <Droplet className="w-6 h-6" />,
		highlightFeature: "Fuel-Native AMM Debut",
	},
	{
		title: "Mainnet Liftoff & LGE",
		timeline: "Q1 2025, Feb",
		description: "Propelling Octane Swap into the Fuel mainnet with a bang",
		features: [
			{
				text: "Execute Fair Launch Liquidity Generation Event",
				isAchieved: false,
			},
			{ text: "Deploy Octane Swap core on Fuel mainnet", isAchieved: false },
			{ text: "Introduce liquidity mining programs", isAchieved: false },
			{
				text: "Launch trading competitions with massive prize pools",
				isAchieved: false,
			},
		],
		status: "upcoming",
		icon: <Rocket className="w-6 h-6" />,
		highlightFeature: "Revolutionary LGE Model",
	},
	{
		title: "OctanePad Ignition",
		timeline: "Q1 2025",
		description:
			"Empowering projects to launch with instant liquidity and community support",
		features: [
			{
				text: "Introduce OctanePad for seamless token launches",
				isAchieved: false,
			},
			{
				text: "Implement auto-liquidity generation for new tokens",
				isAchieved: false,
			},
			{
				text: "Develop vetting process for high-quality projects",
				isAchieved: false,
			},
			{
				text: "Create exclusive participation tiers for OCT holders",
				isAchieved: false,
			},
		],
		status: "upcoming",
		icon: <Sparkles className="w-6 h-6" />,
		highlightFeature: "Next-Gen Launchpad on Fuel",
	},
	{
		title: "Ecosystem Acceleration",
		timeline: "Q2 2025",
		description:
			"Expanding Octane Swap's reach and utility across the DeFi landscape",
		features: [
			{
				text: "Launch cross-chain bridge for seamless asset transfers",
				isAchieved: false,
			},
			{
				text: "Introduce advanced analytics and trading tools",
				isAchieved: false,
			},
			{ text: "Develop yield optimization strategies", isAchieved: false },
			{
				text: "Forge strategic partnerships for increased liquidity",
				isAchieved: false,
			},
		],
		status: "upcoming",
		icon: <TrendingUp className="w-6 h-6" />,
		highlightFeature: "DeFi Super App Vision",
	},
	{
		title: "Octane Perpetuals",
		timeline: "Q4, 2025",
		description:
			"Revolutionizing DeFi trading with cutting-edge perpetual contracts",
		features: [
			{
				text: "Launch Octane Perpetuals with up to 100x leverage",
				isAchieved: false,
			},
			{ text: "Implement advanced risk management systems", isAchieved: false },
			{
				text: "Introduce innovative liquidation mechanisms",
				isAchieved: false,
			},
		],
		status: "upcoming",
		icon: <Repeat className="w-6 h-6" />,
		highlightFeature: "Next-Gen DeFi Trading",
	},
];

const DexRoadmap = () => {
	return (
		<div className="max-w-4xl mx-auto pb-[120px]">
			<div className="mb-8">
				<div className="flex items-center gap-2 mb-2">
					<Flame className="w-6 h-6 text-orange-500" />
					<h2 className="text-2xl font-bold mb-3">Octane Swap Roadmap</h2>
					{/* Igniting DeFi on Fuel */}
				</div>
				<p className="text-muted-foreground">
					Revolutionizing decentralized trading with unparalleled speed and
					efficiency
				</p>
			</div>

			<div className="space-y-8">
				{roadmapData.map((phase, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.2 }}>
						<Card
							className={`${
								phase.status === "current"
									? "border-primary"
									: phase.status === "completed"
									? "border-green-500"
									: ""
							} relative overflow-hidden`}>
							<div
								className={`absolute top-0 left-0 w-1 h-full ${
									phase.status === "current"
										? "bg-primary"
										: phase.status === "completed"
										? "bg-green-500"
										: "bg-muted"
								}`}
							/>

							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-4">
											<div
												className={`p-2 rounded-lg ${
													phase.status === "current"
														? "bg-primary"
														: phase.status === "completed"
														? "bg-green-500"
														: "bg-muted"
												}`}>
												{phase.icon}
											</div>
											<div>
												<h3 className="text-xl font-semibold">{phase.title}</h3>
												<p className="text-sm text-muted-foreground">
													{phase.timeline}
												</p>
											</div>
										</div>

										<p className="text-muted-foreground mb-4">
											{phase.description}
										</p>

										<div className="space-y-2">
											{phase.features.map((feature, idx) => (
												<motion.div
													key={idx}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.2 + idx * 0.1 }}
													className="flex items-center gap-2">
													{feature.isAchieved ? (
														<CheckCheck className="text-green-500 w-5 h-5" />
													) : (
														<Zap className="w-5 h-5 text-yellow-500" />
													)}
													<span
														className={
															feature.isAchieved ? "text-green-500" : "text-muted-foreground"
														}>
														{feature.text}
													</span>
												</motion.div>
											))}
										</div>

										{phase.highlightFeature && (
											<div className="mt-4">
												<Badge
													variant={
														phase.status === "current" ? "secondary" : "outline"
													}
													className="text-sm font-semibold">
													🚀 {phase.highlightFeature}
												</Badge>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</div>
	);
};

export default DexRoadmap;
