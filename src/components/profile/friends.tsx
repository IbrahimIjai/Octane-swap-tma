import { Copy, Share2Icon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Avatar } from "@telegram-apps/telegram-ui";
const friends = [
	{ name: "Deby", pointsEarned: 500 },
	{ name: "Alex", pointsEarned: 300 },
	{ name: "Sam", pointsEarned: 450 },
];
export default function FriendsInvites() {
	return (
		<div>
			<h1 className="text-xl font-semibold my-6">Friends</h1>
			<div className="flex flex-col gap-3">
				<Button>
					Share with Friends <Share2Icon className="w-3 h-3 ml-2" />
				</Button>
				<Button variant="secondary">
					Copy Referral Links <Copy className="w-3 h-3 ml-2" />
				</Button>
			</div>
			<div>
				<h1 className="text-xl font-semibold my-6">Friends Joined</h1>
				<div className="space-y-2">
					{friends.map((friend, index) => (
						<div
							key={index}
							className="flex items-center justify-between border rounded-lg p-3">
							<div className="flex items-center gap-3">
								<Avatar
									size={48}
									//   name={friend.name}
									className="bg-blue-500"
								/>
								<span className="text-white">{friend.name}</span>
							</div>
							<span className="text-green-400 font-semibold">
								+{friend.pointsEarned}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
