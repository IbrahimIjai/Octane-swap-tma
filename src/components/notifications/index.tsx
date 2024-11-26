"use client";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useIsMounted } from "connectkit";
import { motion, AnimatePresence } from "framer-motion";

function Notifications() {
	const isMounted = useIsMounted();
	const [isVisible, setIsVisible] = useState(true);

	if (!isMounted) return null;

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					className="w-full backdrop-blur-md bg-gradient-to-r from-primary/60 to-secondary/60 text-white fixed inset-x-0 top-0 z-30">
					<div className="container mx-auto px-4">
						<Alert variant="default" className="my-2 pr-12 relative">
							<Sparkles className="h-5 w-5 text-yellow-300 mr-2 animate-pulse" />
							<AlertTitle>Exciting Updates</AlertTitle>
							<AlertDescription className="text-muted-foreground">
								See Octane Swap&apos;s ambitious roadmap.
								<Link
									href="/bind-wallet"
									className="ml-2 underline font-medium text-primary">
									roadmap
								</Link>
							</AlertDescription>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-2 top-2 text-yellow-800 hover:text-yellow-900 hover:bg-yellow-200 p-0 w-fit h-fit"
								aria-label="Close notification"
								onClick={() => setIsVisible(false)}>
								<X className="h-4 w-4" />
							</Button>
						</Alert>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default Notifications;
