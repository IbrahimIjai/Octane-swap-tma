import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function MiningDashboardSkeleton() {
	return (
		<Card className="w-full max-w-md mx-auto my-6 border-none">
			<CardHeader className="flex flex-col items-center">
				<Skeleton className="h-32 w-32 rounded-full" />
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-2 gap-4">
					{[0, 1].map((i) => (
						<Card key={i}>
							<CardContent className="p-4">
								<Skeleton className="h-4 w-24 mb-2" />
								<Skeleton className="h-8 w-32" />
							</CardContent>
						</Card>
					))}
				</div>

				<div>
					<div className="flex justify-between items-center mb-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-6 w-16" />
					</div>
					<Skeleton className="h-4 w-full" />
				</div>

				<Separator />

				<div>
					<div className="flex justify-between items-center mb-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-24" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-2 w-full" />
						<div className="flex justify-between">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
				</div>

				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	);
}

export default MiningDashboardSkeleton;
