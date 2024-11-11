"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import LottieComingSoon from "../coming-soon/v1";

const ComingSoonPage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-blue-900">
			<Card className="w-[350px] text-center bg-white/90 backdrop-blur-sm">
				<CardHeader>
					<CardTitle className="text-3xl font-bold text-blue-800">
						Coming Soon
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-xl mb-4 text-blue-700">Passport Minting</p>
					<p className="mb-4 text-blue-600">
						Mint your unique passport to participate in the decentralized
						community
					</p>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Button
						variant="outline"
						className="bg-blue-500 text-white hover:bg-blue-600"
						onClick={() => window.open("https://your-docs-link.com", "_blank")}>
						Learn More
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ComingSoonPage;
