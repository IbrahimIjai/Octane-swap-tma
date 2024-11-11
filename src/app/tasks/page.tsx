import LottieWallet from "@/components/tasks/lottie-wallet";
import TasksPanel from "@/components/tasks/tasks-panel";
import React from "react";

export default function Tasks() {
	return (
		<div className="px-4 flex flex-col">
			<div className="flex flex-col  items-center px-3 text-center">
				<LottieWallet />
				<h1 className="text-2xl font-semibold">Tasks</h1>
				<p className="text-sm text-muted-foreground">
					Complete tasks to partake in the $VIBEPOINT pool allocated
				</p>
			</div>

			<TasksPanel />
		</div>
	);
}
