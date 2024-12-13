import type { PropsWithChildren } from "react";
import NavigationButton from "@/components/layout/navigation-button";
import AdminHeader from "@/components/is-admin-component";

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			<AdminHeader />
			{children}
			<NavigationButton />
		</>
	);
}
