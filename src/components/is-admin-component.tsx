"use client";

import React, { useState } from "react";
import { useUser } from "@/hooks/api/useUser";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Settings, Twitter } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function AdminHeader() {
	const { isUserAdmin, isModerator, userData } = useUser();
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	if (!userData || (!isUserAdmin && !isModerator)) {
		return null;
	}

	const isActive = (path: string) => pathname === path;

	return (
		<div className="bg-primary text-primary-foreground py-2 mb-3">
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="container mx-auto">
				<div className="flex justify-between items-center">
					<span className="font-semibold">
						{isUserAdmin ? "Admin" : "Moderator"} Panel
					</span>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm">
							{isOpen ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent className="mt-2 space-y-2">
					{isUserAdmin && (
						<Link href="/control/tasks" passHref>
							<Button
								variant={isActive("/control") ? "secondary" : "ghost"}
								className="w-full justify-start">
								<Settings className="mr-2 h-4 w-4" />
								Control Panel
							</Button>
						</Link>
					)}
					<Link href="/control/tasks/twitter" passHref>
						<Button
							variant={isActive("/control/twitter") ? "secondary" : "ghost"}
							className="w-full justify-start">
							<Twitter className="mr-2 h-4 w-4" />
							Twitter Tasks Verification
						</Button>
					</Link>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

export default AdminHeader;
