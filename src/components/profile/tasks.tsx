import React from "react";

import { Users, GamepadIcon, CheckSquare, Home, Clock } from "lucide-react";

export default function UserTasksSumary() {
	return (
		<div>
			<h1 className="text-xl font-semibold my-6">Your rewards</h1>
			<div className="grid grid-cols-3 gap-4">
				{[
					{
						icon: <Users size={24} />,
						label: "Friends",
						value: 0,
						color: "text-blue-500",
					},
					{
						icon: <CheckSquare size={24} />,
						label: "Tasks",
						value: 900,
						color: "text-purple-500",
					},
					{
						icon: <Clock size={24} />,
						label: "Age",
						value: 621,
						color: "text-yellow-500",
					},
				].map((reward, index) => (
					<div key={index} className="text-center border rounded-md pb-1 px-1">
						<div className={`mb-2 `}>{reward.icon}</div>
						<div className="text-sm text-gray-600">{reward.label}</div>
						<div className="text-lg font-bold">{reward.value}</div>
					</div>
				))}
			</div>
		</div>
	);
}
