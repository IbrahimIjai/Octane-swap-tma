import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
	"http://localhost:3000",
	"https://localhost:3000",
	"https://octaneswap.xyz",
	"https://www.octaneswap.xyz",
];

export function corsMiddleware(req: NextRequest, res: NextResponse) {
	const origin = req.headers.get("origin") || "";

	// Check if the origin is in our allowed list
	if (allowedOrigins.includes(origin)) {
		// Set CORS headers
		res.headers.set("Access-Control-Allow-Origin", origin);
		res.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);
		res.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);
		res.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
	}

	// Handle preflight requests
	if (req.method === "OPTIONS") {
		return new NextResponse(null, {
			status: 204,
			headers: res.headers,
		});
	}

	return res;
}
