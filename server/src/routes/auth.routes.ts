import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import User from "../models/User";
import { logPulse } from "../services/pulse";

const router = Router();

router.post("/login", verifyToken, async (req: any, res) => {
	const { uid, name, picture } = req.user;

	try {
		let user = await User.findOne({ uid });
		if (!user) {
			user = new User({
				uid,
				displayName: name || "Anonymous",
				photoURL: picture || "",
			});
			await user.save();
			logPulse("AUTH", `New user registered: ${user.displayName}`);
		} else {
			logPulse("AUTH", `User logged in: ${user.displayName}`);
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: "Database error" });
	}
});

export default router;
