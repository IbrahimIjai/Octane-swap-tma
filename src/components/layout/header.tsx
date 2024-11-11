"use client";
import { getUserProfilePhoto } from "@/utils/get-profile-image";
import { useInitData, useInitDataRaw } from "@telegram-apps/sdk-react";
import { Avatar } from "@telegram-apps/telegram-ui";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useProfilePhoto } from "@/hooks/usePrrofilePics";
import { Badge } from "../ui/badge";

interface HeaderProps {
	className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
	const initData = useInitData();
	const userId = initData?.user?.id.toString();
	const username = initData?.user?.username;
	const displayName = username || userId || "User";
	// const name = initData?.user?.username;
	// const id = initData?.user?.id;

	// const [image, setImage] = useState<string | undefined>(undefined);
	// useEffect(() => {
	// 	if (initData?.user?.id) {
	// 		getUserProfilePhoto(initData?.user?.id.toString()).then((image_url) =>
	// 			setImage(image_url),
	// 		);
	// 	}
	// }, [initData]);

	const { profilePhoto, isLoading: isPhotoLoading } = useProfilePhoto(userId);
	return (
		<header
			className={`py-4 px-6 flex justify-between gap-6 rounded-lg border mb-6 items-center bg-background ${className}`}>
			<div className="flex items-center space-x-3">
				{isPhotoLoading ? (
					<Skeleton className="w-10 h-10 rounded-full" />
				) : (
					<Avatar src={profilePhoto} alt={displayName} />
				)}
				<div>
					{initData?.user ? (
						<p className="font-medium text-foreground text-sm">{displayName}</p>
					) : (
						<Skeleton className="w-24 h-6" />
					)}
				</div>
			</div>

			<div className="flex items-center space-x-1">
				<Badge variant="secondary">Guild Level</Badge>
				<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
					1
				</div>
			</div>
		</header>
	);
};

export default Header;
