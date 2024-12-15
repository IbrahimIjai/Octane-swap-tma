"use client";

import CopyToClipboard from "react-copy-to-clipboard";
import { initData } from "@telegram-apps/sdk-react";
import { Avatar } from "@telegram-apps/telegram-ui";
import React, { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useProfilePhoto } from "@/hooks/usePrrofilePics";
import { Badge } from "../ui/badge";
import OctaneSwapLogo from "../logo";
import {
	CheckCheck,
	CheckCircle,
	ChevronDown,
	Copy,
	Edit2,
	Eye,
	EyeOff,
	Info,
	Key,
	Wallet,
	XCircle,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boolean, z } from "zod";
import { useUser } from "@/hooks/api/useUser";
import { shortenAddress } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Separator } from "../ui/separator";

interface HeaderProps {
	className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
	const userId = initData?.user()?.id.toString();
	const username = initData?.user()?.username;
	const displayName = username || userId || "User";
	const { profilePhoto, isLoading: isPhotoLoading } = useProfilePhoto(userId);
	return (
		<header
			className={`w-full py-1 px-2 my-3 flex justify-between gap-6 rounded-lg border mb-6 items-center bg-background ${className}`}>
			<OctaneSwapLogo animated={false} size={32} />
			<div className="flex items-center space-x-3">
				<div>
					{initData?.user() ? (
						<p className="font-medium text-foreground text-xs">{displayName}</p>
					) : (
						<Skeleton className="w-24 h-6" />
					)}
				</div>
				{isPhotoLoading ? (
					<Skeleton className="w-10 h-10 rounded-full" />
				) : (
					<SecretPhraseModal>
						<div className="flex items-center gap-1">
							<Avatar size={24} src={profilePhoto} alt={displayName} />
							<ChevronDown className="w-3 h-3 text-muted-foreground" />
						</div>
					</SecretPhraseModal>
				)}
			</div>
		</header>
	);
};

export default Header;

const secretPhraseSchema = z.object({
	secretCode: z
		.string()
		.min(8, "Secret phrase must be at least 8 characters long")
		.regex(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[*#@])/,
			"Must include letters, numbers, and symbols (*#@)",
		),
});

type SecretPhraseFormData = z.infer<typeof secretPhraseSchema>;

function SecretPhraseModal({ children }: { children?: ReactNode }) {
	const { userData } = useUser();

	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isUpdating, setIsUpdating] = useState(false);
	const [secreteCodeCopied, setSecreteCodeCopied] = useState(false);
	const [showSecretCode, setShowSecretCode] = useState(true);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<SecretPhraseFormData>({
		resolver: zodResolver(secretPhraseSchema),
	});

	const secretPhrase = watch("secretCode");

	const calculateStrength = (phrase: string) => {
		let score = 0;
		if (phrase.length >= 8) score += 25;
		if (phrase.match(/[a-z]/) && phrase.match(/[A-Z]/)) score += 25;
		if (phrase.match(/\d/)) score += 25;
		if (phrase.match(/[*#@]/)) score += 25;
		return score;
	};

	const mutation = useMutation({
		mutationFn: async (data: { userId: string; secretCode: string }) =>
			axios.post("/apis/user/secretcode", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userData"] });
			toast({
				title: "Success",
				description: "Your secret code has been saved.",
				duration: 3000,
			});
			setIsUpdating(false);
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to save your secret code. Please try again.",
				variant: "destructive",
				duration: 3000,
			});
		},
	});

	const onSubmit: SubmitHandler<SecretPhraseFormData> = async (data) => {
		console.log("Form is being submitted", data);
		if (!userData?.id) {
			toast({
				title: "Error",
				description: "User ID not found. Please try again later.",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}
		await mutation.mutate({ ...data, userId: userData.id });
	};

	return (
		<Dialog>
			<DialogTrigger>{children ?? ""}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Account</DialogTitle>
				</DialogHeader>
				<div>
					<AnimatePresence>
						{!isUpdating && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}>
								<div className="flex items-center space-x-2 mb-3">
									<Wallet className="w-5 h-5" />
									<div>
										<p className="text-sm font-medium">Binded Wallet Address</p>
										<p className="text-xs text-muted-foreground">
											{userData?.address
												? shortenAddress(userData.address)
												: "Not binded"}
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2 mb-3">
									<TwitterLogo />
									<div>
										<p className="text-sm font-medium">Binded X Account</p>
										<p className="text-xs text-muted-foreground">
											{userData?.twitterUsername || "Not binded"}
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					{!userData?.address && !userData?.twitterUsername && (
						<p className="text-xs text-red-500 mb-6">
							You need to link twitter and wallet on octaneswap.xyz
						</p>
					)}
					<Separator />

					<div className="space-y-2 mt-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 ">
								<Key className="w-5 h-5" />
								<Label className="font-medium">Secret Code</Label>
							</div>
							<div className="">
								{!isUpdating && (
									<Button
										variant="outline"
										className="mx-2"
										onClick={() => setIsUpdating(true)}>
										<Edit2 className="h-3 w-3" />
									</Button>
								)}
								<Popover>
									<PopoverTrigger>
										<Button variant="outline" className="mr-2">
											<Info className="w-4 h-4 text-muted-foreground" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80 p-4 bg-secondary text-secondary-foreground">
										<p className="text-sm">
											Your secret code is a unique access token that enables you
											to bind your account to a Twitter account and a wallet
											address. It&apos;s unique to your Telegram account and can
											only be used once for binding. Never share it with anyone.
										</p>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						{userData?.secretCode && (
							<div className="flex items-center space-x-2">
								<Input
									type={showSecretCode ? "text" : "password"}
									value={userData.secretCode}
									readOnly
									className="font-mono"
								/>
								<Button
									variant="outline"
									onClick={() => setShowSecretCode(!showSecretCode)}>
									{showSecretCode ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>

								{secreteCodeCopied ? (
									<Button variant="outline">
										<CheckCheck className="w-3 h-3 mr-2" />
										<span>Copied..</span>
									</Button>
								) : (
									<CopyToClipboard
										text={userData.secretCode}
										onCopy={() => {
											setSecreteCodeCopied(true);
											setTimeout(() => {
												setSecreteCodeCopied(false);
											}, 800);
										}}>
										<Button variant="outline">
											<Copy className="w-3 h-3 mr-2" />
											<span className=" whitespace-nowrap text-xs">
												Copy secrete code
											</span>
										</Button>
									</CopyToClipboard>
								)}
							</div>
						)}
						{!isUpdating && !userData?.secretCode && (
							<Button onClick={() => setIsUpdating(!isUpdating)}>
								{userData?.secretCode
									? "Update secretecode"
									: "Set Secret Code"}
							</Button>
						)}
					</div>
					<AnimatePresence>
						{isUpdating && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-4 mt-4">
								<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="secretPhrase">New Secret Phrase</Label>
										<div className="flex items-center gap-1 relative">
											<Input
												id="secretPhrase"
												type={showSecretCode ? "text" : "password"}
												{...register("secretCode")}
											/>
											<Button
												variant="outline"
												className="absolute inset-y-0 right-2 flex items-center"
												onClick={() => setShowSecretCode(!showSecretCode)}>
												{showSecretCode ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</Button>
										</div>
										{errors.secretCode && (
											<p className="text-sm text-destructive">
												{errors.secretCode.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label>Strength</Label>
										<Progress
											value={calculateStrength(secretPhrase ?? "")}
											className="w-full"
										/>
										<div className="flex justify-between text-sm text-muted-foreground">
											<span>Weak</span>
											<span>Strong</span>
										</div>
									</div>
									<div className="space-y-2">
										<Label>Requirements</Label>
										<ul className="text-sm space-y-1">
											<RequirementItem
												met={secretPhrase?.length >= 8}
												text="At least 8 characters"
											/>
											<RequirementItem
												met={!!secretPhrase?.match(/[a-zA-Z]/)}
												text="Includes letters"
											/>
											<RequirementItem
												met={!!secretPhrase?.match(/\d/)}
												text="Includes numbers"
											/>
											<RequirementItem
												met={!!secretPhrase?.match(/[*#@]/)}
												text="Includes symbols (*#@)"
											/>
										</ul>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsUpdating(false)}>
											Cancel
										</Button>
										<Button type="submit">Save Secret Phrase</Button>
									</div>
								</form>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</DialogContent>
		</Dialog>
	);
}

const AccountInfoItem: React.FC<{
	label: string;
	value: string;
	icon: React.ReactNode;
}> = ({ label, value, icon }) => (
	<div className="flex items-center space-x-2">
		{icon}
		<div>
			<p className="text-sm font-medium">{label}</p>
			<p className="text-sm text-muted-foreground">{value}</p>
		</div>
	</div>
);

const RequirementItem: React.FC<{ met: boolean; text: string }> = ({
	met,
	text,
}) => (
	<li className="flex items-center">
		{met ? (
			<CheckCircle className="w-4 h-4 text-green-500 mr-2" />
		) : (
			<XCircle className="w-4 h-4 text-red-500 mr-2" />
		)}
		{text}
	</li>
);

const TwitterLogo = () => (
	<svg
		viewBox="0 0 1200 1227"
		xmlns="http://www.w3.org/2000/svg"
		className="w-5 h-5">
		<path
			fill="currentColor"
			d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
		/>
	</svg>
);
