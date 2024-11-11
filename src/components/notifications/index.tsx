"use client";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

function Notifications() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;
	return (
		<>
			<div className="w-full bg-yellow-50 border-b border-yellow-200">
				<div className="container mx-auto px-4">
					<Alert
						variant="default"
						className="my-2 pr-12 relative bg-yellow-100 border-yellow-300 text-yellow-800">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Action Required</AlertTitle>
						<AlertDescription>
							You have not bound your wallet address to your TMA.
							<Link
								href="/bind-wallet"
								className="ml-2 underline font-medium text-yellow-900 hover:text-yellow-700">
								Click here to proceed
							</Link>
						</AlertDescription>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-2 text-yellow-800 hover:text-yellow-900 hover:bg-yellow-200"
							onClick={() => setIsVisible(false)}
							aria-label="Close notification">
							<X className="h-4 w-4" />
						</Button>
					</Alert>
				</div>
			</div>
		</>
	);
}

export default Notifications;
