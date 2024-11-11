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
	Lock,
	Flame,
	MessageSquare,
	Gift,
	Zap,
	CheckCheck,
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
	status: "current" | "upcoming";
	icon: React.ReactNode;
	highlightFeature?: string;
}

const roadmapData: RoadmapPhase[] = [
	{
		title: "Community Genesis Phase",
		timeline: "November - December 2024",
		description:
			"Building the foundation of our vibrant community through our innovative Telegram-first approach",
		features: [
			{
				text: "Launch Telegram Mini App with wallet integration",
				isAchieved: true,
			},
			{ text: "Community engagement programs & contests", isAchieved: true },
			{ text: "Early adopter rewards program", isAchieved: false },
			{
				text: "Strategic partnerships with Fuel ecosystem projects",
				isAchieved: false,
			},
		],
		status: "current",
		icon: <Users className="w-6 h-6" />,
		highlightFeature: "10,000 Early Access Spots",
	},
	{
		title: "Beta Launch & LGE",
		timeline: "December 2024",
		description:
			"Kickstarting liquidity and introducing core swap functionality",
		features: [
			{ text: "Fair Launch Liquidity Generation Event", isAchieved: false },
			{ text: "Core swap functionality deployment on Fuel", isAchieved: false },
			{ text: "Security audit completion", isAchieved: false },
			{ text: "Initial liquidity provider incentives", isAchieved: false },
			{ text: "Trading competition for beta users", isAchieved: false },
		],
		status: "upcoming",
		icon: <Droplet className="w-6 h-6" />,
		highlightFeature: "Exclusive Beta Access NFTs",
	},
	{
		title: "Ecosystem Expansion",
		timeline: "January 2025",
		description: "Introducing advanced DeFi features and yield opportunities",
		features: [
			{ text: "Launch of yield farming programs", isAchieved: false },
			{ text: "Staking mechanisms", isAchieved: false },
			{ text: "Price prediction markets", isAchieved: false },
			{ text: "Advanced analytics dashboard", isAchieved: false },
		],
		status: "upcoming",
		icon: <BarChart3 className="w-6 h-6" />,
		highlightFeature: "Yield Farming Pools",
	},
	{
		title: "V2 Innovation",
		timeline: "Late Q1 2025",
		description:
			"Revolutionary upgrade with concentrated liquidity and advanced features",
		features: [
			{ text: "Concentrated liquidity implementation", isAchieved: false },
			{ text: "Enhanced mobile experience", isAchieved: false },
		],
		status: "upcoming",
		icon: <Rocket className="w-6 h-6" />,
		highlightFeature: "Industry-Leading Capital Efficiency",
	},
];

const DexRoadmap = () => {
	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-8">
				<div className="flex items-center gap-2 mb-2">
					<Flame className="w-6 h-6 text-orange-500" />
					<h2 className="text-2xl font-bold">Octane Swap Roadmap</h2>
				</div>
				<p className="text-gray-600">
					Building the fastest DEX on Fuel Network
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
								phase.status === "current" ? "" : "text-muted-foreground"
							} relative overflow-hidden `}>
							<div
								className={`absolute top-0 left-0 w-1 h-full ${
									phase.status === "current" ? "bg-green-500" : "bg-muted"
								}`}
							/>

							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-4">
											<div
												className={`p-2 rounded-lg ${
													phase.status === "current" ? "bg-primary" : "bg-muted"
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
														<CheckCheck className="text-primary w-4 h-4" />
													) : (
														<Zap className="w-4 h-4 text-muted-foreground" />
													)}
													<span
														className={
															feature.isAchieved ? "" : "text-muted-foreground"
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
													className={`${
														phase.status === "current"
															? ""
															: "text-muted-foreground"
													}  text-sm`}>
													🔥 {phase.highlightFeature}
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
