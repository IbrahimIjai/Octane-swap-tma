import { useState, useEffect } from "react";
import { getUserProfilePhoto } from "@/utils/get-profile-image";

export const useProfilePhoto = (userId: string | undefined) => {
	const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
		undefined,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (userId) {
			setIsLoading(true);
			getUserProfilePhoto(userId)
				.then((imageUrl) => {
					setProfilePhoto(imageUrl);
					setIsLoading(false);
				})
				.catch((err) => {
					setError(err);
					setIsLoading(false);
				});
		}
	}, [userId]);

	return { profilePhoto, isLoading, error };
};
