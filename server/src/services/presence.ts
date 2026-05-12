import redis from "../config/redis";
import { logPulse } from "./pulse";

const PRESENCE_TTL = parseInt(process.env.PRESENCE_TTL || "300", 10); // seconds - users are considered online if they've been seen in last 5 minutes

export interface OnlineUser {
	uid: string;
	displayName: string;
	photoURL: string;
	lastSeen: number;
}

export const setUserOnline = async (
	uid: string,
	displayName: string,
	photoURL: string,
) => {
	const key = `presence:${uid}`;
	const userData = JSON.stringify({
		uid,
		displayName,
		photoURL,
		lastSeen: Date.now(),
	});

	await redis.set(key, userData, "EX", PRESENCE_TTL);
	logPulse("SOCKET", `User online: ${displayName} (${uid})`);
};

export const setUserOffline = async (uid: string) => {
	const key = `presence:${uid}`;
	console.log(`[BURN-ON-DISCONNECT] Wiping presence for user: ${uid}`);
	console.log(`[BURN-ON-DISCONNECT] Deleting Redis key: ${key}`);
	
	const deleted = await redis.del(key);
	
	console.log(`[BURN-ON-DISCONNECT] Key deletion result: ${deleted === 1 ? 'SUCCESS (key existed)' : 'NO-OP (key not found)'}`);
	console.log(`[BURN-ON-DISCONNECT] User presence instantly removed from Redis`);
	
	logPulse("SOCKET", `User offline (burn-on-disconnect): ${uid}`);
};

export const getOnlineUsers = async (): Promise<OnlineUser[]> => {
	const keys = await redis.keys("presence:*");
	if (keys.length === 0) return [];

	const users: OnlineUser[] = [];
	for (const key of keys) {
		const userData = await redis.get(key);
		if (userData) {
			users.push(JSON.parse(userData));
		}
	}

	return users;
};

export const getUserById = async (uid: string): Promise<OnlineUser | null> => {
	const key = `presence:${uid}`;
	const userData = await redis.get(key);
	if (!userData) return null;
	return JSON.parse(userData);
};

export const updateUserPresence = async (uid: string) => {
	const key = `presence:${uid}`;
	const userData = await redis.get(key);

	if (userData) {
		const user = JSON.parse(userData) as OnlineUser;
		user.lastSeen = Date.now();
		await redis.set(key, JSON.stringify(user), "EX", PRESENCE_TTL);
	}
};
