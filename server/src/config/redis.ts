import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL);

redis.on("connect", () => {
	console.log("[REDIS]: Connected successfully");
});

redis.on("error", (err) => {
	console.error("[REDIS]: Connection Error", err);
});

export default redis;
