import Image from "next/image";
import React from "react";

export default function Logo() {
	const oldStyleFilter =
		"grayscale(50%) sepia(20%) brightness(90%) contrast(110%)";

	return (
		<div className="">
			<div className="hidden lg:inline-flex">
				<Image
					src="/logo.png"
					alt="vibes logo"
					width={80}
					height={80}
					style={{ filter: oldStyleFilter }}
				/>
			</div>
			<div className="inline-flex lg:hidden">
				<Image
					src="/logo.png"
					alt="vibes logo"
					width={50}
					height={50}
					style={{ filter: oldStyleFilter }}
				/>
			</div>
		</div>
	);
}
