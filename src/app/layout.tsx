import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

import { Root } from "@/components/Root/Root";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "normalize.css/normalize.css";
import "@/lib/_assets/globals.css";
import { Toaster } from "@/components/ui/toaster";
export const metadata: Metadata = {
	title: "Your Application Title Goes Here",
	description: "Your application description goes here",
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body className="h-full w-full p-3">
				<Root>
					{children}
					<Toaster />
				</Root>
			</body>
		</html>
	);
}
