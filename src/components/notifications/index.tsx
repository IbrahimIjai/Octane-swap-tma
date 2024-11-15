"use client";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useIsMounted } from "connectkit";

function Notifications({
	isVisible,
	setIsVisible,
}: {
	isVisible: boolean;
	setIsVisible: Dispatch<SetStateAction<boolean>>;
}) {
	const pathname = usePathname();
	const isMounted = useIsMounted();

	useEffect(() => {
		if (pathname.startsWith("/home") || pathname.startsWith("/earn")) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [pathname, setIsVisible]);

	if (!isVisible || !isMounted) return null;

	return (
		<div className="w-full backdrop-blur-md bg-gradient-to-r from-primary/60 to-secondary/60 text-white fixed inset-x-0 top-0 z-30">
			<div className="container mx-auto px-4">
				<Alert variant="default" className="my-2 pr-12 relative ">
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
						onClick={() => {
							setIsVisible(false);
						}}
						aria-label="Close notification">
						<X className="h-4 w-4" />
					</Button>
				</Alert>
			</div>
		</div>
	);
}

export default Notifications;
