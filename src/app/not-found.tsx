"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const GameInspired404 = () => {
	const router = useRouter();
	const [score, setScore] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setScore((prevScore) => prevScore + 10);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-primary to-pink-800 flex flex-col items-center justify-center text-white p-4">
			<h1 className="text-6xl font-bold mb-4 animate-bounce">404</h1>
			<p className="text-2xl mb-8 text-center">
				Oops! Looks like you&apos;ve stumbled into a bonus level!
			</p>

			<div className="bg-white/10 rounded-lg p-6 mb-8 text-center">
				<p className="text-xl mb-2">Your Score:</p>
				<p className="text-4xl font-bold">{score}</p>
			</div>

			<div className="space-y-4">
				<Button
					onClick={() => router.push("/")}
					className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
					Return to Main Menu
				</Button>
				<Button
					onClick={() => router.back()}
					className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
					Try Again
				</Button>
			</div>
		</div>
	);
};

export default GameInspired404;

