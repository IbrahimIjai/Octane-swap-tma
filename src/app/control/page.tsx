"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { StakingPool } from "@prisma/client";
import { CreatePoolDTO } from "@/lib/types";
import { api } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

// Form schema with TypeScript integration
const poolFormSchema = z.object({
	rewardAmount: z.string().min(1, "Reward amount is required"),
	startDate: z.date(),
	startTime: z.string(),
	endDate: z.date(),
	endTime: z.string(),
});

type PoolFormValues = z.infer<typeof poolFormSchema>;

// API functions with type safety
const fetchPools = async (): Promise<StakingPool[]> => {
	const { data } = await api.get<StakingPool[]>("/pool");
	return data;
};

const createPool = async (poolData: CreatePoolDTO): Promise<StakingPool> => {
	const { data } = await api.post<StakingPool>("/pool", poolData);
	return data;
};

function ControlPage() {
	const queryClient = useQueryClient();
	const [date, setDate] = useState<Date>(new Date());
	const { toast } = useToast();
	const form = useForm<PoolFormValues>({
		resolver: zodResolver(poolFormSchema),
		defaultValues: {
			rewardAmount: "",
			startDate: new Date(),
			startTime: "12:00",
			endDate: new Date(),
			endTime: "23:59",
		},
	});

	const {
		data: pools,
		isLoading,
		error,
	} = useQuery<StakingPool[], AxiosError>({
		queryKey: ["pools"],
		queryFn: fetchPools,
	});

	console.log({ pools });

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
				title: "Scheduled: Catch up, SUCCCESSS",
				description: "Friday, February 10, 2023 at 5:57 PM",
			});
			form.reset();
		},
		onError: (error) => {
			console.error("Failed to create pool:", error.response?.data);
			toast({
				variant: "destructive",
				title: "Error",
				description: `An error ${error.message}`,
			});
			// You might want to add toast notification here
		},
	});

	const onSubmit = (data: PoolFormValues) => {
		const startDateTime = new Date(data.startDate);
		const [startHour, startMinute] = data.startTime.split(":");
		startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

		const endDateTime = new Date(data.endDate);
		const [endHour, endMinute] = data.endTime.split(":");
		endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

		const poolData: CreatePoolDTO = {
			// rewardRate: parseFloat(data.rewardRate),
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
			<h1 className="text-2xl font-bold mb-6">Pool Management</h1>

			{/* Create Pool Form */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Create New Pool</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
													disabled={(date) => date < new Date()}
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

						<div className="flex gap-4">
							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>End Date</FormLabel>
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
													disabled={(date) => date < field.value}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time (UTC+1)</FormLabel>
										<FormControl>
											<Input {...field} type="time" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit">Create Pool</Button>
					</form>
				</Form>
			</div>

			{/* Pools List */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Existing Pools</h2>
				{isLoading ? (
					<div>Loading pools...</div>
				) : (
					<Accordion type="single" collapsible className="w-full">
						{pools?.map((pool) => (
							<AccordionItem key={pool.id} value={pool.id}>
								<AccordionTrigger>
									Pool {pool.id} - Rewards: {Number(pool.rewardAmount)}
								</AccordionTrigger>
								<AccordionContent>
									<div className="space-y-2">
										<p>Reward Rate: {Number(pool.rewardRate)}</p>
										<p>Total Supply: {Number(pool.totalSupply)}</p>
										<p>
											Start Time:{" "}
											{format(new Date(pool.startTime), "PPP HH:mm")}
										</p>
										<p>
											End Time: {format(new Date(pool.endTime), "PPP HH:mm")}
										</p>
										<p>
											Last Updated:{" "}
											{format(new Date(pool.lastUpdateTime), "PPP HH:mm")}
										</p>
									</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				)}
			</div>
		</div>
	);
}

export default ControlPage;
