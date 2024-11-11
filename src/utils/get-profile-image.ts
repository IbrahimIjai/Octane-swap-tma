"use server"

import { TG_API } from "@/constants/links";

export async function getUserProfilePhoto(tg_id: string) {
	const BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_API_TOKEN;
	const image_endpoint = `${TG_API}/bot${BOT_TOKEN}/getUserProfilePhotos`;

	try {
		const response = await fetch(image_endpoint + `?user_id=${tg_id}&limit=1`);
		const data = await response.json();

		if (!data.ok || !data.result.photos.length) {
			throw new Error(`No profile photo found for user ${tg_id}`);
		}

		const file_id = data.result.photos[0][0].file_id;
		const fileResponse = await fetch(`${TG_API}/bot${BOT_TOKEN}/getFile`, {
			method: "POST",
			body: JSON.stringify({ file_id }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const fileData = await fileResponse.json();

		if (!fileData.ok) {
			throw new Error(`Failed to get file path for user ${tg_id}`);
		}

		return `${TG_API}/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
	} catch (error) {
		console.error(`Error processing user ${tg_id}: ${error}`);
		// throw new Error(`Error processing user ${tg_id}`);
	}
}
