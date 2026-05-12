"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
	socket: Socket | null;
	pulseEvents: any[];
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	pulseEvents: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [pulseEvents, setPulseEvents] = useState<any[]>([]);

	useEffect(() => {
		const serverUrl =
			process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
		const newSocket = io(serverUrl);

		newSocket.on("connect", () => {
			console.log("[SOCKET]: Connected");
			newSocket.emit("join-pulse");
		});

		newSocket.on("pulse-event", (event) => {
			setPulseEvents((prev) => [event, ...prev].slice(0, 50));
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket, pulseEvents }}>
			{children}
		</SocketContext.Provider>
	);
};
