import redis from "../config/redis";
import { logPulse } from "./pulse";

const CHAT_TTL = parseInt(process.env.CHAT_MESSAGE_TTL || "120", 10); // seconds
const MONITORED_KEYS = new Set<string>(); // Track keys we're monitoring for expiration

export const getChatKey = (uid1: string, uid2: string) => {
	if (uid1 === "global" || uid2 === "global") return "chat:global";
	const ids = [uid1, uid2].sort();
	return `chat:${ids[0]}_${ids[1]}`;
};

export const saveMessage = async (uid1: string, uid2: string, message: any) => {
	const key = getChatKey(uid1, uid2);
	const messageStr = JSON.stringify({
		...message,
		timestamp: Date.now(),
	});

	await redis.rpush(key, messageStr);
	await redis.expire(key, CHAT_TTL);

	// Track this key for TTL monitoring
	MONITORED_KEYS.add(key);

	logPulse("REDIS", `Message saved to ${key} with TTL ${CHAT_TTL}s`);
};

export const getMessages = async (uid1: string, uid2: string) => {
	const key = getChatKey(uid1, uid2);
	const messages = await redis.lrange(key, 0, -1);
	return messages.map((m) => JSON.parse(m));
};

export const getMessagesByRoomId = async (roomId: string) => {
	const key = roomId === "global" ? "chat:global" : `chat:${roomId}`;
	const messages = await redis.lrange(key, 0, -1);
	return messages.map((m) => JSON.parse(m));
};

// Bonus 1: Atomic Read-Once
export const readAndBurnMessages = async (uid1: string, uid2: string) => {
	const key = getChatKey(uid1, uid2);
	
	console.log(`[ATOMIC-READ-BURN] Starting atomic operation for key: ${key}`);
	console.log(`[ATOMIC-READ-BURN] UIDs: ${uid1} <-> ${uid2}`);

	const pipeline = redis.multi();
	pipeline.lrange(key, 0, -1);
	pipeline.del(key);

	console.log(`[ATOMIC-READ-BURN] Executing Redis pipeline (LRANGE + DEL in single transaction)...`);
	const results = await pipeline.exec();
	
	if (!results) {
		console.log(`[ATOMIC-READ-BURN] ERROR: Pipeline returned no results`);
		return [];
	}

	const messages = results[0]?.[1] as string[] | undefined;
	console.log(`[ATOMIC-READ-BURN] Pipeline executed successfully`);
	console.log(`[ATOMIC-READ-BURN] Messages read: ${messages?.length || 0}`);
	console.log(`[ATOMIC-READ-BURN] Key deleted: ${results[1]?.[1] === 1 ? 'YES' : 'NO'}`);
	console.log(`[ATOMIC-READ-BURN] Atomic operation completed - no race conditions possible`);
	
	logPulse("GHOST", `Messages read and burned for ${key} (${messages?.length || 0} messages)`);

	return messages ? messages.map((m) => JSON.parse(m)) : [];
};

export const clearChat = async (uid1: string, uid2: string) => {
	const key = getChatKey(uid1, uid2);
	await redis.del(key);
	MONITORED_KEYS.delete(key);
	logPulse("GHOST", `Chat cleared for ${key}`);
};

// Monitor keys for TTL expiration
let lastCheckedKeys: Set<string> = new Set();

export const monitorTTLExpiration = async (
	onExpired: (key: string) => void,
) => {
	try {
		for (const key of MONITORED_KEYS) {
			const exists = await redis.exists(key);

			if (!exists && lastCheckedKeys.has(key)) {
				// Key has expired
				MONITORED_KEYS.delete(key);
				logPulse("GHOST", `Redis key expired: ${key}`);
				onExpired(key);
			}
		}

		lastCheckedKeys = new Set(MONITORED_KEYS);
	} catch (error) {
		console.error("Error monitoring TTL expiration:", error);
	}
};

export const getMonitoredKeys = () => Array.from(MONITORED_KEYS);
