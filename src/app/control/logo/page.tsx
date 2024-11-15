"use client";

import React, { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OctaneSwapLogo from "@/components/logo";
// import OctaneSwapLogo from "./OctaneSwapLogo";

const LogoDownloader: React.FC = () => {
	const [variant, setVariant] = useState<1 | 2 | 3>(1);
	const [size, setSize] = useState(64);
	const [format, setFormat] = useState<"svg" | "png">("svg");

	const handleDownload = () => {
		const svgElement = document.querySelector("svg") as SVGSVGElement;
		if (!svgElement) return;

		if (format === "svg") {
			const svgData = new XMLSerializer().serializeToString(svgElement);
			const svgBlob = new Blob([svgData], {
				type: "image/svg+xml;charset=utf-8",
			});
			const svgUrl = URL.createObjectURL(svgBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = svgUrl;
			downloadLink.download = `octane-swap-logo-v${variant}-${size}.svg`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		} else {
			const canvas = document.createElement("canvas");
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				const img = new Image();
				img.onload = () => {
					ctx.drawImage(img, 0, 0, size, size);
					const pngUrl = canvas.toDataURL("image/png");
					const downloadLink = document.createElement("a");
					downloadLink.href = pngUrl;
					downloadLink.download = `octane-swap-logo-v${variant}-${size}.png`;
					document.body.appendChild(downloadLink);
					downloadLink.click();
					document.body.removeChild(downloadLink);
				};
				img.src =
					"data:image/svg+xml;base64," +
					btoa(new XMLSerializer().serializeToString(svgElement));
			}
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Octane Swap Logo Downloader</CardTitle>
				<CardDescription>
					Customize and download the Octane Swap logo
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex justify-center mb-6">
					<OctaneSwapLogo variant={variant} size={size} animated={false} />
				</div>
				<div className="space-y-2">
					<label htmlFor="variant-select" className="text-sm font-medium">
						Variant
					</label>
					<Select
						onValueChange={(value) => setVariant(Number(value) as 1 | 2 | 3)}>
						<SelectTrigger id="variant-select">
							<SelectValue placeholder="Select variant" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">Variant 1</SelectItem>
							<SelectItem value="2">Variant 2</SelectItem>
							<SelectItem value="3">Variant 3</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<label htmlFor="size-slider" className="text-sm font-medium">
						Size: {size}px
					</label>
					<Slider
						id="size-slider"
						min={32}
						max={512}
						step={1}
						value={[size]}
						onValueChange={(value) => setSize(value[0])}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="format-select" className="text-sm font-medium">
						Format
					</label>
					<Select onValueChange={(value) => setFormat(value as "svg" | "png")}>
						<SelectTrigger id="format-select">
							<SelectValue placeholder="Select format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="svg">SVG</SelectItem>
							<SelectItem value="png">PNG</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
			<CardFooter>
				<Button onClick={handleDownload} className="w-full">
					Download Logo
				</Button>
			</CardFooter>
		</Card>
	);
};

export default LogoDownloader;
