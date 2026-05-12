import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initFirebase } from "./config/firebase";
import { connectDB } from "./config/mongo";
import mainRouter from "./routes";
import { monitorTTLExpiration } from "./services/chat";
import { initPulse, logPulse } from "./services/pulse";
import { setupSocketHandlers } from "./sockets";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Services
initFirebase();
connectDB();
initPulse(io);

// Modular Routes
app.use("/api", mainRouter);

// Modular Sockets
setupSocketHandlers(io);

// Setup TTL monitoring for chat expiration
setInterval(() => {
	monitorTTLExpiration((key) => {
		// Notify all clients that a chat room has expired
		const roomId = key.replace("chat:", "");
		io.to(roomId).emit("chat-expired", { roomId });
	});
}, 2000); // Check every 2 seconds

httpServer.listen(Number(PORT), "0.0.0.0", () => {
	console.log(`[SERVER]: Running on port ${PORT}`);
	logPulse("SOCKET", `Server started on port ${PORT}`);
});
