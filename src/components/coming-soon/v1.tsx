"use client";

import React from "react";
import ComingSoonAnimation from "../../constants/lottie-coming-soon.json";
import Lottie from "lottie-react";
export default function LottieComingSoon() {
	return (
		<div className="w-28 h-28 mx-auto relative">
			<Lottie animationData={ComingSoonAnimation} />
		</div>
	);
}
