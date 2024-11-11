import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { title } from "process";
// import { copyFile } from "fs";
import React, { useState } from "react";

interface CardRotateProps {
	children: React.ReactNode;
	onSendToBack: () => void;
}

function CardRotate({ children, onSendToBack }: CardRotateProps) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useTransform(y, [-100, 100], [60, -60]);
	const rotateY = useTransform(x, [-100, 100], [-60, 60]);

	function handleDragEnd(_: any, info: PanInfo) {
		const threshold = 180;
		if (
			Math.abs(info.offset.x) > threshold ||
			Math.abs(info.offset.y) > threshold
		) {
			onSendToBack();
		} else {
			x.set(0);
			y.set(0);
		}
	}

	return (
		<motion.div
			className="absolute h-64 w-64 cursor-grab"
			style={{ x, y, rotateX, rotateY }}
			drag
			dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
			dragElastic={0.6}
			whileTap={{ cursor: "grabbing" }}
			onDragEnd={handleDragEnd}>
			{children}
		</motion.div>
	);
}

export default function UserHomeInfo() {
	const initialCards = [
		{
			id: 1,
			title: "$VIBEPOINTS💰",
			z: 4,
			value: "500",
		},
		{
			id: 2,
			title: "Total Tasks⚒️",
			z: 3,
			value: "500",
		},
		{
			id: 3,
			title: "Rank 🏆",
			z: 2,
			value: "top 20%",
		},
	];
	const [cards, setCards] = useState(initialCards);

	const sendToBack = (id: number) => {
		setCards((prev) => {
			const newCards = [...prev];
			const index = newCards.findIndex((card) => card.id === id);
			const [card] = newCards.splice(index, 1);
			newCards.unshift(card);
			return newCards;
		});
	};

	return (
		<div
			className="relative h-52 w-52 flex items-center justify-center"
			style={{ perspective: 600 }}>
			{cards.map((card, index) => {
				return (
					<CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)}>
						<motion.div
							className="h-full w-full rounded-lg overflow-clip border"
							animate={{
								rotateZ: (cards.length - index - 1) * 5,
								scale: 1 + index * 0.06 - cards.length * 0.06,
								transformOrigin: "90% 90%",
							}}
							initial={false}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}>
							<div className="h-full w-full bg-background  text-white items-center justify-center flex flex-col gap-4">
								<h1 className="text-3xl font-bold">{card.title}</h1>
								<p>{card.value}</p>
							</div>
						</motion.div>
					</CardRotate>
				);
			})}
		</div>
	);
}
