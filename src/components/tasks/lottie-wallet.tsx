"use client";

import React from "react";
import WalletAnimation from "../../constants/lottie-wallet-animation.json";
import Lottie from "lottie-react";
export default function LottieWallet() {
	return (
		<div className="w-28 h-28 mx-auto relative">
			<Lottie animationData={WalletAnimation} />
		</div>
	);
}
