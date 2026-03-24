"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users, Clock, AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { PoolName, PoolCategory } from "@/db/types";
import type { StakingPool, StakingPosition } from "@/db/types";
import { CreatePoolDTO } from "@/lib/types";
import { api } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const poolFormSchema = z.object({
	poolName: z.nativeEnum(PoolName),
	category: z.nativeEnum(PoolCategory),
	rewardAmount: z.string().min(1, "Reward amount is required"),
	startDate: z.date(),
	startTime: z.string(),
	duration: z.string(),
});

interface StakingPoolWithPosition extends StakingPool {
	positions: StakingPosition[];
}

type PoolFormValues = z.infer<typeof poolFormSchema>;

const fetchPools = async (): Promise<StakingPoolWithPosition[]> => {
	const { data } = await api.get<StakingPool[]>("/pool");
	return data.map((pool) => ({ ...pool, positions: [] })); 
};

const createPool = async (poolData: CreatePoolDTO): Promise<StakingPool> => {
	const { data } = await api.post<StakingPool>("/pool", poolData);
	return data;
};

export default function AdminControlPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [selectedPool, setSelectedPool] =
		useState<StakingPoolWithPosition | null>(null);

	const form = useForm<PoolFormValues>({
		//@ts-ignore
		resolver: zodResolver(poolFormSchema),
		defaultValues: {
			poolName: PoolName.NITRO_BOOST,
			category: PoolCategory.SPEED,
			rewardAmount: "",
			startDate: addDays(new Date(), 1),
			startTime: "12:00",
			duration: "7",
		},
	});

	const {
		data: pools,
		isLoading,
		error,
	} = useQuery<StakingPoolWithPosition[], AxiosError>({
		queryKey: ["pools"],
		queryFn: fetchPools,
	});

	const createPoolMutation = useMutation<
		StakingPool,
		AxiosError,
		CreatePoolDTO,
		unknown
	>({
		mutationFn: createPool,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["pools"] });
			toast({
				title: "Pool created successfully",
				description: "The new staking pool has been added to the system.",
			});
			form.reset();
		},
		onError: (error) => {
			console.error("Failed to create pool:", error.response?.data);
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to create pool: ${error.message}`,
			});
		},
	});

	const onSubmit = (data: PoolFormValues) => {
		const startDateTime = new Date(data.startDate);
		const [startHour, startMinute] = data.startTime.split(":");
		startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

		const endDateTime = addDays(startDateTime, parseInt(data.duration));

		const poolData: CreatePoolDTO = {
			poolName: data.poolName,
			category: data.category,
			rewardAmount: parseFloat(data.rewardAmount),
			startTime: startDateTime.toISOString(),
			endTime: endDateTime.toISOString(),
		};

		createPoolMutation.mutate(poolData);
	};

	if (error) {
		return <div>Error loading pools: {error.message}</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-8">Octane Swap Admin Control</h1>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<h2 className="text-2xl font-semibold mb-4">Create New Pool</h2>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="poolName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pool Name</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a pool name" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.values(PoolName).map((name) => (
													<SelectItem key={name} value={name}>
														{name.replace(/_/g, " ")}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.values(PoolCategory).map((category) => (
													<SelectItem key={category} value={category}>
														{category}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="rewardAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reward Amount</FormLabel>
										<FormControl>
											<Input {...field} type="number" step="0.000001" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex gap-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Start Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className={cn(
															"w-[240px] justify-start text-left font-normal",
															!field.value && "text-muted-foreground",
														)}>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														// disabled={(date) => date <= new Date()}
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="startTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Time (UTC+1)</FormLabel>
											<FormControl>
												<Input {...field} type="time" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration (days)</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select duration" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[7, 14, 30, 60, 90].map((days) => (
													<SelectItem key={days} value={days.toString()}>
														{days} days
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit">Create Pool</Button>
						</form>
					</Form>
				</div>

				<div>
					<h2 className="text-2xl font-semibold mb-4">Existing Pools</h2>
					{isLoading ? (
						<div>Loading pools...</div>
					) : (
						<Accordion type="single" collapsible className="w-full">
							{pools?.map((pool) => (
								<AccordionItem key={pool.id} value={pool.id}>
									<AccordionTrigger onClick={() => setSelectedPool(pool)}>
										<div className="flex justify-between w-full">
											<span>{(pool.poolName || "").replace(/_/g, " ")}</span>
											<span className="text-muted-foreground">
												{format(new Date(pool.startTime as any), "dd MMM yyyy")} -{" "}
												{format(new Date(pool.endTime as any), "dd MMM yyyy")}
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-2">
											<p>
												<strong>Category:</strong> {pool.category}
											</p>
											<p>
												<strong>Reward Amount:</strong>{" "}
												{Number(pool.rewardAmount)} pOCT
											</p>
											<p>
												<strong>Total Supply:</strong>{" "}
												{Number(pool.totalSupply)} pOCT
											</p>
											<p>
												<strong>Reward Rate:</strong> {Number(pool.rewardRate)}{" "}
												pOCT/second
											</p>
											<p>
												<strong>Start Time:</strong>{" "}
												{format(new Date(pool.startTime as any), "PPP HH:mm")}
											</p>
											<p>
												<strong>End Time:</strong>{" "}
												{format(new Date(pool.endTime as any), "PPP HH:mm")}
											</p>
											<p>
												<strong>Last Updated:</strong>{" "}
												{format(new Date(pool.lastUpdateTime as any), "PPP HH:mm")}
											</p>
											<div className="flex items-center space-x-2 mt-4">
												<Users className="h-5 w-5 text-blue-500" />
												<span>
													Total Stakers: {pool.positions?.length || 0}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Clock className="h-5 w-5 text-green-500" />
												<span>
													{new Date() < new Date(pool.startTime as any)
														? `Starts in ${differenceInDays(
																new Date(pool.startTime as any),
																new Date(),
														  )} days`
														: new Date() < new Date(pool.endTime as any)
														? `Ends in ${differenceInDays(
																new Date(pool.endTime as any),
																new Date(),
														  )} days`
														: "Ended"}
												</span>
											</div>
											{new Date() > new Date(pool.endTime as any) && (
												<div className="flex items-center space-x-2 text-yellow-500">
													<AlertTriangle className="h-5 w-5" />
													<span>
														Pool has ended. Consider creating a new pool.
													</span>
												</div>
											)}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</div>
			</div>
		</div>
	);
}
