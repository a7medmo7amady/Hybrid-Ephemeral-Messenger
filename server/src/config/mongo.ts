import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/ghost-messenger";

export const connectDB = async () => {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("[MONGODB]: Connected successfully");
	} catch (error) {
		console.error("[MONGODB]: Connection Error", error);
		process.exit(1);
	}
};
