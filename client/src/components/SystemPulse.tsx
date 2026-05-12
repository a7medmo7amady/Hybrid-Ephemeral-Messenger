"use client";

import React from "react";
import { useSocket } from "@/context/SocketContext";
import { Terminal } from "./Terminal";

export const SystemPulse = () => {
	const { pulseEvents } = useSocket();

	const getTypeColor = (type: string) => {
		switch (type) {
			case "AUTH":
				return "text-blue-400";
			case "SOCKET":
				return "text-purple-400";
			case "REDIS":
				return "text-orange-400";
			case "GHOST":
				return "text-emerald-400";
			case "TWILIO":
				return "text-red-400";
			default:
				return "text-zinc-400";
		}
	};

	return (
		<Terminal title="System Pulse Monitor" className="min-h-[300px]">
			<div className="space-y-1">
				{pulseEvents.length === 0 && (
					<p className="text-zinc-600 animate-pulse">
						Waiting for backend events...
					</p>
				)}
				{pulseEvents.map((event, i) => (
					<div
						key={i}
						className="flex gap-2 leading-relaxed border-l-2 border-transparent hover:border-zinc-800 pl-2 transition-all"
					>
						<span className="text-zinc-600 whitespace-nowrap">
							[{event.timestamp}]
						</span>
						<span className={`${getTypeColor(event.type)} font-bold`}>
							[{event.type}]
						</span>
						<span className="text-zinc-300">{event.message}</span>
					</div>
				))}
			</div>
		</Terminal>
	);
};
