import type { Server, Socket } from "socket.io";
import { getMessages, getMessagesByRoomId, saveMessage, readAndBurnMessages, clearChat } from "../services/chat";
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

	// Bonus 1: Atomic Read-Once - fetch and burn messages atomically
	socket.on("read-once-messages", async (data: { roomId: string }) => {
		const { roomId } = data;
		const uid = socketUsers.get(socket.id);
		
		console.log(`[READ-ONCE] Request from user ${uid} for room ${roomId}`);
		
		if (!uid) {
			console.log(`[READ-ONCE] ERROR: No uid found for socket ${socket.id}`);
			return;
		}

		try {
			// Parse room ID to get UIDs
			let uid1: string;
			let uid2: string;

			if (roomId === "global") {
				// Global read-once not typical, just get normal messages
				console.log(`[READ-ONCE] Global room read (non-destructive)`);
				const messages = await getMessagesByRoomId(roomId);
				console.log(`[READ-ONCE] Found ${messages.length} messages in global`);
				socket.emit("read-once-result", { messages, burned: false });
				logPulse("GHOST", `Read-once (non-destructive) for ${roomId}`);
			} else {
				// Parse the room ID to extract the two UIDs
				const [first, second] = roomId.split("_");
				uid1 = first;
				uid2 = second;
				
				console.log(`[READ-ONCE] Private room: uid1=${uid1}, uid2=${uid2}`);
				console.log(`[READ-ONCE] Starting atomic read+delete operation...`);

				// Atomically read and delete messages
				const messages = await readAndBurnMessages(uid1, uid2);
				console.log(`[READ-ONCE] SUCCESS: Atomically read and burned ${messages.length} messages`);
				socket.emit("read-once-result", { messages, burned: true });
				
				// Notify other user in the room that messages were burned
				const otherUid = uid === uid1 ? uid2 : uid1;
				const otherUserSocketId = userSockets.get(otherUid);
				console.log(`[READ-ONCE] Other user: ${otherUid}, socket: ${otherUserSocketId}`);
				
				if (otherUserSocketId) {
					console.log(`[READ-ONCE] Notifying other user that messages were burned`);
					io.to(otherUserSocketId).emit("messages-burned", { roomId });
				} else {
					console.log(`[READ-ONCE] Other user is offline, no notification sent`);
				}
				
				logPulse("GHOST", `Messages atomically read and burned for ${roomId}`);
			}
		} catch (error) {
			console.error("[READ-ONCE] Error:", error);
			socket.emit("read-once-error", { error: "Failed to read and burn messages" });
		}
	});

	socket.on("disconnect", async () => {
		const uid = socketUsers.get(socket.id);
		console.log(`[DISCONNECT] Client disconnected: ${socket.id}, uid: ${uid}`);
		
		if (uid) {
			// Bonus 2: Burn-on-Disconnect - immediately wipe presence from Redis
			// User disappears instantly from friends' lists
			console.log(`[DISCONNECT] Starting presence wipe for user: ${uid}`);
			const userCountBefore = (await getOnlineUsers()).length;
			
			await setUserOffline(uid);
			userSockets.delete(uid);
			userCurrentRoom.delete(uid);
			
			// Broadcast updated online users list immediately
			const onlineUsers = await getOnlineUsers();
			const userCountAfter = onlineUsers.length;
			
			console.log(`[DISCONNECT] Presence wiped. Online users before: ${userCountBefore}, after: ${userCountAfter}`);
			console.log(`[DISCONNECT] Broadcasting updated online users list to all clients`);
			
			io.emit("online-users", onlineUsers);
			
			logPulse("SOCKET", `User ${uid} disconnected - presence wiped instantly`);
		}
		socketUsers.delete(socket.id);
		console.log(`[DISCONNECT] Socket entry cleaned up: ${socket.id}`);
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
