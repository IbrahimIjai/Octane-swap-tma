import FriendsInvites from "@/components/profile/friends";
import UserTasksSumary from "@/components/profile/tasks";
import React from "react";

export default function Profile() {
	return (
		<div className="p-4 pb-20">
			<p className="text-2xl font-semibold my-6">User Profile</p>
			<UserTasksSumary />
			<FriendsInvites />
		</div>
	);
}
