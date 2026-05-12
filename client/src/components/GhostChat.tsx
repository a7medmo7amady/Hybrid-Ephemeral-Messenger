"use client";

import { Send, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { Terminal } from "./Terminal";

interface Message {
	from: string;
	senderName: string;
	text: string;
	timestamp: number;
}

interface OnlineUser {
	uid: string;
	displayName: string;
	photoURL: string;
	lastSeen: number;
}

export const GhostChat = ({ user }: { user: any }) => {
	const { socket } = useSocket();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
	const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
	const [chatExpired, setChatExpired] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const messagesRef = useRef<Map<string, Message[]>>(new Map()); // Store messages per room
	const currentRoomRef = useRef<string>("global");

	// Deduplicate messages based on sender, timestamp, and text
	// Allows 100ms timestamp tolerance to catch near-simultaneous duplicates
	const getUniqueMessages = (msgs: Message[]): Message[] => {
		const seen = new Set<string>();
		return msgs.filter((msg) => {
			// Create a key based on sender, text, and rounded timestamp (100ms tolerance)
			const roundedTimestamp = Math.floor(msg.timestamp / 100) * 100;
			const key = `${msg.from}|${msg.text}|${roundedTimestamp}`;
			
			if (seen.has(key)) {
				return false; // Skip duplicate
			}
			seen.add(key);
			return true;
		});
	};

	useEffect(() => {
		if (!socket) return;

		// Register user presence (one-time)
		socket.emit("set-user", {
			uid: user.uid,
			displayName: user.displayName,
			photoURL: user.photoURL,
		});

		// Request online users list
		socket.emit("get-online-users");

		const handleConnect = () => {
			socket.emit("join-room", "global");
		};

		const handleNewMessage = (msg: Message) => {
			console.log("[NEW-MESSAGE] Received:", msg);
			try {
				const decryptedText = decryptMessage(msg.text);
				const decryptedMsg = { ...msg, text: decryptedText };

				// Add to current room's messages in our ref
				const roomKey = currentRoomRef.current;
				const roomMessages = messagesRef.current.get(roomKey) || [];
				
				// Deduplicate: check if message with same from, text, and timestamp already exists
				const isDuplicate = roomMessages.some(
					(m) => m.from === decryptedMsg.from && 
					       m.timestamp === decryptedMsg.timestamp
				);
				
				console.log("[NEW-MESSAGE] Dedup check:", isDuplicate, "timestamp:", decryptedMsg.timestamp);
				
				if (!isDuplicate) {
					roomMessages.push(decryptedMsg);
					messagesRef.current.set(roomKey, roomMessages);

					// Only update state if this message is for the current room
					setMessages((prev) => {
						if (currentRoomRef.current === roomKey) {
							console.log("[NEW-MESSAGE] Adding to state, new count:", prev.length + 1);
							return [...prev, decryptedMsg];
						}
						return prev;
					});
				}
			} catch (e) {
				console.log("[NEW-MESSAGE] Decrypt failed:", e);
				const roomKey = currentRoomRef.current;
				const roomMessages = messagesRef.current.get(roomKey) || [];
				
				const isDuplicate = roomMessages.some(
					(m) => m.from === msg.from && 
					       m.timestamp === msg.timestamp
				);
				
				console.log("[NEW-MESSAGE] Dedup check (encrypted):", isDuplicate);
				
				if (!isDuplicate) {
					roomMessages.push(msg);
					messagesRef.current.set(roomKey, roomMessages);

					setMessages((prev) => {
						if (currentRoomRef.current === roomKey) {
							console.log("[NEW-MESSAGE] Adding encrypted to state, new count:", prev.length + 1);
							return [...prev, msg];
						}
						return prev;
					});
				}
			}
		};

		const handleChatHistory = (history: Message[]) => {
			console.log("[CHAT-HISTORY] Received", history.length, "messages for room:", currentRoomRef.current);
			const roomKey = currentRoomRef.current;

			const decryptedHistory = history.map((msg) => {
				try {
					return { ...msg, text: decryptMessage(msg.text) };
				} catch (e) {
					return msg;
				}
			});

			// Cache the decrypted history for this room
			messagesRef.current.set(roomKey, decryptedHistory);

			// Only update state if we're still in the same room
			setMessages((prevMessages) => {
				if (currentRoomRef.current === roomKey) {
					console.log("[CHAT-HISTORY] Updating state with", decryptedHistory.length, "messages");
					return decryptedHistory;
				}
				return prevMessages;
			});
		};

		const handleWipeSignal = () => {
			setMessages([]);
		};

		const handleChatExpired = (data: { roomId: string }) => {
			if (data.roomId === currentRoomRef.current) {
				setChatExpired(true);
				setTimeout(() => {
					setMessages([]);
					messagesRef.current.set(currentRoomRef.current, []);
					setChatExpired(false);
				}, 1000);
			}
		};

		const handleOnlineUsers = (users: OnlineUser[]) => {
			const filtered = users.filter((u) => u.uid !== user.uid);
			setOnlineUsers(filtered);
		};

		socket.on("connect", handleConnect);
		socket.on("new-message", handleNewMessage);
		socket.on("chat-history", handleChatHistory);
		socket.on("wipe-signal", handleWipeSignal);
		socket.on("chat-expired", handleChatExpired);
		socket.on("online-users", handleOnlineUsers);

		// Join global room initially if not connected yet
		if (socket.connected) {
			socket.emit("join-room", "global");
		}

		return () => {
			socket.off("connect", handleConnect);
			socket.off("new-message", handleNewMessage);
			socket.off("chat-history", handleChatHistory);
			socket.off("wipe-signal", handleWipeSignal);
			socket.off("chat-expired", handleChatExpired);
			socket.off("online-users", handleOnlineUsers);
		};
	}, [socket, user.uid]);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSelectUser = (selectedUser: OnlineUser) => {
		setSelectedUser(selectedUser);
		setChatExpired(false);

		if (socket) {
			// Leave current room
			const previousRoom = currentRoomRef.current;

			// Generate new room ID
			const roomId = [user.uid, selectedUser.uid].sort().join("_");
			currentRoomRef.current = roomId;

			// Clear messages immediately (don't show old global messages)
			setMessages([]);

			// Join the new room - this will trigger chat-history event
			socket.emit("join-room", roomId);
		}
	};

	const handleCloseDirect = () => {
		setSelectedUser(null);

		if (socket) {
			// Update current room
			currentRoomRef.current = "global";

			// Clear messages immediately
			setMessages([]);

			// Join global room - this will trigger chat-history event
			socket.emit("join-room", "global");
		}
	};

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || !socket) return;

		const encryptedText = encryptMessage(input);
		const timestamp = Date.now();

		// Send encrypted version to server (no optimistic add for now to debug duplication)
		socket.emit("send-message", {
			from: user.uid,
			to: selectedUser?.uid || "global",
			message: {
				from: user.uid,
				senderName: user.displayName,
				text: encryptedText,
				timestamp,
			},
		});

		setInput("");
	};

	const chatTitle = selectedUser
		? `Direct Message: ${selectedUser.displayName}`
		: "Ghost Chat Console (Global)";

	return (
		<Terminal title={chatTitle} className="h-[500px]">
			<div className="flex flex-col h-full">
				{selectedUser && (
					<div className="mb-3 pb-3 border-b border-zinc-800 flex items-center justify-between">
						<div>
							<p className="text-emerald-400 text-sm font-bold">
								{selectedUser.displayName}
							</p>
							<p className="text-zinc-600 text-[10px] font-mono">
								{selectedUser.uid}
							</p>
						</div>
						<button
							type="button"
							onClick={handleCloseDirect}
							className="text-zinc-500 hover:text-red-400 transition-colors"
						>
							<X size={16} />
						</button>
					</div>
				)}

				{chatExpired && (
					<div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/50 rounded text-emerald-400 text-xs font-mono text-center">
						[GHOST]: TTL Expired. Messages auto-deleted.
					</div>
				)}

			<div className="flex-1 space-y-2 mb-4 overflow-y-auto">
				{messages.length === 0 && (
					<p className="text-zinc-600 text-center mt-10 text-sm">
						{selectedUser
							? `No messages with ${selectedUser.displayName} yet.`
							: "No messages in volatile storage."}
					</p>
				)}
				{getUniqueMessages(messages).map((msg, i) => {
					const isMyMessage = msg.from === user.uid;
					return (
						<div key={i} className={`flex gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-xs px-3 py-2 rounded ${
									isMyMessage
										? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
										: "bg-zinc-800 border border-zinc-700 text-zinc-300"
								}`}
							>
								{!isMyMessage && (
									<span className="text-emerald-500 font-bold text-xs block mb-1">
										{msg.senderName}
									</span>
								)}
								<span className="break-words text-sm">{msg.text}</span>
							</div>
						</div>
					);
				})}
				<div ref={chatEndRef} />
			</div>

				<form onSubmit={handleSend} className="relative mt-auto pt-2 border-t border-zinc-800">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={
							selectedUser
								? `Message ${selectedUser.displayName}...`
								: "Send to global..."
						}
						className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
					/>
					<button
						type="submit"
						className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
					>
						<Send size={18} />
					</button>
				</form>

				{!selectedUser && onlineUsers.length > 0 && (
					<div className="mt-3 pt-3 border-t border-zinc-800">
						<p className="text-[10px] text-zinc-600 font-mono mb-2">
							Click on a user to start 1-on-1 chat:
						</p>
						<div className="space-y-1">
							{onlineUsers.slice(0, 3).map((u) => (
								<button
									key={u.uid}
									type="button"
									onClick={() => handleSelectUser(u)}
									className="w-full text-left text-[10px] px-2 py-1 bg-zinc-900 rounded hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 transition-colors truncate"
								>
									→ {u.displayName}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</Terminal>
	);
};
