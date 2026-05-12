import type { Server, Socket } from "socket.io";
import { getMessages, getMessagesByRoomId, saveMessage } from "../services/chat";
import {
	getOnlineUsers,
	setUserOffline,
	setUserOnline,
} from "../services/presence";
import { logPulse } from "../services/pulse";

const userSockets = new Map<string, string>(); // Map of uid to socket.id
const socketUsers = new Map<string, string>(); // Map of socket.id to uid
const userCurrentRoom = new Map<string, string>(); // Track which room each user is in

export const setupSocketHandlers = (io: Server) => {
	io.on("connection", (socket: Socket) => {
		logPulse("SOCKET", `Client connected: ${socket.id}`);

	socket.on("set-user", async (userData: {
		uid: string;
		displayName: string;
		photoURL: string;
	}) => {
		const { uid, displayName, photoURL } = userData;
		userSockets.set(uid, socket.id);
		socketUsers.set(socket.id, uid);
		userCurrentRoom.set(uid, "global"); // Default to global

		await setUserOnline(uid, displayName, photoURL);

		// Broadcast online users list to all connected clients
		const onlineUsers = await getOnlineUsers();
		logPulse(
			"SOCKET",
			`User registered: ${displayName} (${uid}) - Online users: ${onlineUsers.length}`,
		);
		io.emit("online-users", onlineUsers);
	});

	socket.on("join-room", async (roomId: string) => {
		const uid = socketUsers.get(socket.id);
		if (!uid) return;

		// Leave previous room
		const previousRoom = userCurrentRoom.get(uid);
		if (previousRoom && previousRoom !== roomId) {
			socket.leave(previousRoom);
			logPulse("SOCKET", `User ${uid} left room: ${previousRoom}`);
		}

		// Join new room
		socket.join(roomId);
		userCurrentRoom.set(uid, roomId);
		logPulse("SOCKET", `User ${uid} joined room: ${roomId}`);

		// Send history if available (only for chat rooms)
		if (roomId === "global" || roomId.includes("_")) {
			const messages = await getMessagesByRoomId(roomId);
			logPulse("SOCKET", `Sending ${messages.length} messages to ${uid} for room ${roomId}`);
			socket.emit("chat-history", messages);
		}
	});

		socket.on("join-pulse", () => {
			socket.join("pulse");
			logPulse("SOCKET", `Client subscribed to pulse stream`);
		});

	socket.on("send-message", async (data) => {
		const { from, to, message } = data;

		// Determine the room ID based on the conversation
		let roomId: string;
		if (to === "global") {
			roomId = "global";
		} else {
			// Private message room
			const ids = [from, to].sort();
			roomId = `${ids[0]}_${ids[1]}`;
		}

		// Save to volatile storage
		await saveMessage(from, to, message);

		// Emit to ALL clients in the room (including sender for confirmation)
		io.to(roomId).emit("new-message", message);

		logPulse(
			"REDIS",
			`Message sent from ${from} to ${to} in room ${roomId}`,
		);
	});

		socket.on("get-online-users", async () => {
			const onlineUsers = await getOnlineUsers();
			socket.emit("online-users", onlineUsers);
		});

		socket.on("disconnect", async () => {
			const uid = socketUsers.get(socket.id);
			if (uid) {
				await setUserOffline(uid);
				userSockets.delete(uid);
				userCurrentRoom.delete(uid);

				// Broadcast updated online users list
				const onlineUsers = await getOnlineUsers();
				io.emit("online-users", onlineUsers);
			}
			socketUsers.delete(socket.id);
			logPulse("SOCKET", `Client disconnected: ${socket.id}`);
		});
	});
};

// Setup Redis key expiration monitoring for chat TTL
export const setupTTLMonitoring = (_io: Server) => {
	// Poll Redis for expired keys and notify clients
	setInterval(async () => {
		// This is a workaround since Redis keyspace notifications require special config
		// In production, you'd use Redis keyspace notifications (NOTIFY)
	}, 1000);
};
