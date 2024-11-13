import type { PropsWithChildren } from "react";
import NavigationButton from "@/components/layout/navigation-button";

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			{children}
			<NavigationButton />
		</>
	);
}
