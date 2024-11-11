"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown, House, ListTodo, User, UserRoundPlus } from "lucide-react";

//@ts-ignore
const getIcon = (icon) => {
	const icons = {
		House,
		ListTodo,
		User,
		Crown,
		UserRoundPlus,
	};
	//@ts-ignores
	return icons[icon];
};

const navItems = [
	{ href: "/home", icon: "House", label: "Home" },
	{ href: "/earn", icon: "ListTodo", label: "Earn" },
	{ href: "/roadmap", icon: "User", label: "Roadmap" },
	{ href: "/friends", icon: "UserRoundPlus", label: "Friends" },
	{ href: "/leaderboard", icon: "Crown", label: "Leaderboard" },
];

export default function NavigationButton() {
	const pathname = usePathname();
	const { push } = useRouter();
	return (
		<div className="w-full fixed bottom-0 inset-x-0 py-3 px-2 border-t flex items-center justify-evenly bg-background">
			{navItems.map((item) => {
				const Icon = getIcon(item.icon);
				const isActive = pathname === item.href;
				return (
					<Button
						key={item.href}
						variant={"ghost"}
						className={`flex flex-col items-center gap-1 h-auto py-2 ${
							isActive ? "text-primary" : ""
						}`}
						onClick={() => push(item.href)}>
						<Icon
							className={isActive ? "text-primary" : "text-muted-foreground"}
							size={30}
						/>
						<span
							className={`text-xs ${
								isActive ? "text-primary" : "text-muted-foreground"
							}`}>
							{item.label}
						</span>
					</Button>
				);
			})}
		</div>
	);
}
