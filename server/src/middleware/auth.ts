import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../config/firebase";
import { logPulse } from "../services/pulse";

export interface AuthRequest extends Request {
	user?: DecodedIdToken;
}

export const verifyToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = req.headers.authorization?.split("Bearer ")[1];

	if (!token) {
		return res.status(401).json({ error: "No token provided" });
	}

	try {
		const decodedToken = await auth.verifyIdToken(token);
		req.user = decodedToken;
		logPulse("AUTH", `Token verified for ${decodedToken.email}`);
		next();
	} catch (error) {
		console.error("[AUTH]: Token Verification Failed", error);
		res.status(401).json({ error: "Invalid token" });
	}
};
