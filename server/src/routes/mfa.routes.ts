import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { sendOTP, verifyOTP } from "../services/twilio";

const router = Router();

router.post("/send-otp", verifyToken, async (req: any, res) => {
	const { phoneNumber } = req.body;
	const { uid } = req.user;
	const success = await sendOTP(phoneNumber, uid);
	res.json({ success });
});

router.post("/verify-otp", verifyToken, async (req: any, res) => {
	const { otp } = req.body;
	const { uid } = req.user;
	const verified = await verifyOTP(uid, otp);
	if (verified) {
		res.json({ status: "SECURE" });
	} else {
		res.status(401).json({ error: "Invalid OTP" });
	}
});

export default router;
