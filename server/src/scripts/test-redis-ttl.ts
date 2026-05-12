import redis from "../config/redis";

const TEST_KEY = "chat:test_user";
const TTL = 5; // 5 seconds for testing

async function testTTL() {
	console.log("--- Redis TTL Test ---");

	await redis.set(TEST_KEY, "test_message");
	await redis.expire(TEST_KEY, TTL);

	console.log(`Key ${TEST_KEY} set with TTL ${TTL}s`);

	const timeLeft = TTL;
	const interval = setInterval(async () => {
		const exists = await redis.exists(TEST_KEY);
		const currentTTL = await redis.ttl(TEST_KEY);

		if (exists) {
			console.log(`Key exists. TTL remaining: ${currentTTL}s`);
		} else {
			console.log("Key has expired!");
			clearInterval(interval);
			process.exit(0);
		}
	}, 1000);
}

testTTL();
