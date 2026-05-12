import twilio from "twilio";
import redis from "../config/redis";
import { logPulse } from "./pulse";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const OTP_TTL = parseInt(process.env.OTP_TTL || "300", 10); // seconds

let client: any = null;

// Initialize Twilio client only if credentials look valid
if (accountSid && accountSid.startsWith("AC") && authToken && twilioPhoneNumber) {
	try {
		client = twilio(accountSid, authToken);
	} catch (error) {
		console.error("[TWILIO]: Initialization Error", error);
	}
} else {
	console.warn(
		"[TWILIO]: Missing credentials (ACCOUNT_SID, AUTH_TOKEN, or PHONE_NUMBER). SMS functionality will be mocked.",
	);
}

export const sendOTP = async (phoneNumber: string, uid: string) => {
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const key = `mfa:${uid}`;

	await redis.set(key, otp, "EX", OTP_TTL);

	logPulse("TWILIO", `MFA challenge generated for ${uid}`);

	if (!client) {
		logPulse(
			"TWILIO",
			`[MOCK MODE] SMS to ${phoneNumber} skipped. USE OTP: ${otp}`,
		);
		return true; // Success in mock mode so user can proceed
	}

	try {
		// In Twilio trial mode:
		// 1. You must have a Twilio phone number (from: twilioPhoneNumber)
		// 2. The destination number must be verified in Twilio Console
		// 3. If using verified caller ID, it works for calls but NOT for SMS in trial
		
		await client.messages.create({
			body: `Your Ghost Messenger verification code is: ${otp}`,
			from: twilioPhoneNumber, // Must be a real Twilio phone number
			to: phoneNumber, // Must be verified in Twilio console for trial accounts
		});
		logPulse(
			"TWILIO",
			`SMS successfully sent from ${twilioPhoneNumber} to ${phoneNumber}`,
		);
		return true;
	} catch (error) {
		console.error("[TWILIO]: SMS Error", error);
		logPulse(
			"TWILIO",
			`SMS Delivery Failed (trial mode requires verified numbers). USE OTP: ${otp}`,
		);
		return true; // Return true so demo can continue
	}
};

export const verifyOTP = async (uid: string, otp: string) => {
	const key = `mfa:${uid}`;
	const storedOtp = await redis.get(key);

	if (storedOtp === otp) {
		await redis.del(key);
		logPulse("TWILIO", `Code verified for ${uid}`);
		return true;
	}

	logPulse("AUTH", `MFA failed for ${uid}. Code ${otp} does not match.`);
	return false;
};

