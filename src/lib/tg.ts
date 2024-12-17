import {
	ChatMember,
	UserChatBoosts,
	UserProfilePhotos,
} from "node_modules/telegraf/typings/core/types/typegram";
import { Telegram } from "telegraf";

const bot = new Telegram(process.env.NEXT_PUBLIC_TG_BOT_API_TOKEN!);

export async function verifyTelegramJoin(
	userId: number,
	groupId: string,
): Promise<boolean> {
	try {
		const chatMember = await bot.getChatMember(groupId, userId);
		return ["member", "administrator", "creator"].includes(chatMember.status);
	} catch (error) {
		console.error("Error verifying Telegram join:", error);
		return false;
	}
}

export async function getProfileImage(
	userId: number,
): Promise<UserProfilePhotos | null> {
	try {
		const profilePhotos = await bot.getUserProfilePhotos(userId);
		return profilePhotos;
	} catch (error) {
		console.error("Error verifying Telegram join:", error);
		return null;
	}
}

// export async function getUserNames(userId: number): Promise<ChatMember | null> {
// 	try {
// 		const user = await bot.getCh("@octaneswaps", userId);
// 		return user;
// 	} catch (error) {
// 		console.error("Error verifying Telegram join:", error);
// 		return null;
// 	}
// }
export async function verifyTelegramUserBoast(
	userId: number,
	groupId: string,
): Promise<UserChatBoosts[]> {
	try {
		const boasts = await bot.getUserChatBoosts(groupId, userId);
		return boasts;
	} catch (error) {
		console.error("Error verifying Telegram join:", error);
		return [];
	}
}
