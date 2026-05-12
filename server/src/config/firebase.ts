import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import path from "path";

const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");

// Initialize immediately to avoid "no-app" errors during module evaluation
if (getApps().length === 0) {
	try {
		initializeApp({
			credential: cert(serviceAccountPath),
		});
		console.log("[FIREBASE]: Admin SDK Initialized");
	} catch (error) {
		console.error("[FIREBASE]: Initialization Error", error);
	}
}

// Export auth directly
export const auth = getAuth();

// Kept for backward compatibility in index.ts if needed
export const initFirebase = () => {};
