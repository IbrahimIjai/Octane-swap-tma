import React from "react";

interface OctaneSwapLogoProps {
	variant?: 1 | 2 | 3;
	size?: number;
	className?: string;
	animated?: boolean;
}

const OctaneSwapLogo: React.FC<OctaneSwapLogoProps> = ({
	variant = 1,
	size = 64,
	className = "",
	animated = true,
}) => {
	const variants = {
		1: {
			gradient: {
				start: "#00FF9D",
				end: "#00CC7E",
			},
			innerFill: "#1A1A1A",
		},
		2: {
			gradient: {
				start: "#FF3366",
				end: "#FF6B99",
			},
			innerFill: "#1A1A1A",
		},
		3: {
			gradient: {
				start: "#9D00FF",
				end: "#CC00FF",
			},
			innerFill: "#1A1A1A",
		},
	};

	const currentTheme = variants[variant];

	const createOctagonPath = (
		centerX: number,
		centerY: number,
		radius: number,
	) => {
		const points = [];
		for (let i = 0; i < 8; i++) {
			const angle = (Math.PI / 4) * i - Math.PI / 8;
			points.push([
				centerX + radius * Math.cos(angle),
				centerY + radius * Math.sin(angle),
			]);
		}
		return `M ${points.map(([x, y]) => `${x},${y}`).join(" L ")} Z`;
	};

	return (
		<div
			className={`inline-block ${
				animated ? "animate-spin" : ""
			} ${className}`}
			style={{ width: size, height: size }}>
			<svg
				width={size}
				height={size}
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient
						id={`octaneGradient${variant}`}
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%">
						<stop offset="0%" stopColor={currentTheme.gradient.start} />
						<stop offset="100%" stopColor={currentTheme.gradient.end} />
					</linearGradient>
				</defs>

				{/* Outer octagon */}
				<path
					d={createOctagonPath(50, 50, 45)}
					fill={`url(#octaneGradient${variant})`}
					stroke={currentTheme.innerFill}
					strokeWidth="2"
				/>

				{/* Inner octagon - now with transparency */}
				<path
					d={createOctagonPath(50, 50, 30)}
					fill={currentTheme.innerFill}
					fillOpacity="0.8"
				/>

				{/* Inner design - octagonal star with transparency */}
				<path
					d={createOctagonPath(50, 50, 20)}
					fill="transparent"
					stroke={currentTheme.gradient.start}
					strokeWidth="1"
					transform="rotate(22.5, 50, 50)"
				/>

				{/* Accent points */}
				{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
					<path
						key={i}
						d={createOctagonPath(
							50 + 25 * Math.cos((Math.PI / 4) * i),
							50 + 25 * Math.sin((Math.PI / 4) * i),
							3,
						)}
						fill={currentTheme.gradient.start}
					/>
				))}
			</svg>
		</div>
	);
};

export default OctaneSwapLogo;
