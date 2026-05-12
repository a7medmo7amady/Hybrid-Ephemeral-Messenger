import type { Server } from "socket.io";

let io: Server;

export const initPulse = (socketServer: Server) => {
	io = socketServer;
};

export const logPulse = (
	type: "AUTH" | "SOCKET" | "REDIS" | "GHOST" | "TWILIO",
	message: string,
) => {
	const timestamp = new Date().toLocaleTimeString();
	const event = `[${type}]: ${message}`;
	console.log(`${timestamp} ${event}`);

	if (io) {
		io.to("pulse").emit("pulse-event", { timestamp, type, message });
	}
};
