"use client";

import { CheckCircle2, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { Terminal } from "./Terminal";

interface OnlineUser {
	uid: string;
	displayName: string;
	photoURL: string;
	lastSeen: number;
}

export const MemberList = ({
	currentUser,
	onSelectUser,
}: {
	currentUser: any;
	onSelectUser: (user: OnlineUser) => void;
}) => {
	const { socket } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	useEffect(() => {
		if (!socket) return;

		// Request online users on mount
		socket.emit("get-online-users");

		// Listen for online users updates
		socket.on("online-users", (users: OnlineUser[]) => {
			// Filter out current user
			const filtered = users.filter((u) => u.uid !== currentUser.uid);
			setOnlineUsers(filtered);
		});

		return () => {
			socket.off("online-users");
		};
	}, [socket, currentUser.uid]);

	const handleSelectUser = (user: OnlineUser) => {
		setSelectedUserId(user.uid);
		onSelectUser(user);
	};

	return (
		<Terminal title="Online Members" className="h-[500px]">
			<div className="flex flex-col h-full">
				<div className="space-y-2 flex-1 overflow-y-auto">
					{onlineUsers.length === 0 ? (
						<p className="text-zinc-600 text-center mt-10 text-sm">
							No other users online. Waiting for connections...
						</p>
					) : (
						onlineUsers.map((user) => (
							<button
								key={user.uid}
								onClick={() => handleSelectUser(user)}
								className={`w-full text-left px-3 py-2 rounded transition-colors ${
									selectedUserId === user.uid
										? "bg-emerald-500/20 border border-emerald-500/50"
										: "hover:bg-zinc-900 border border-transparent"
								}`}
							>
								<div className="flex items-center gap-2">
									<CheckCircle2
										size={12}
										className="text-emerald-500 flex-shrink-0"
									/>
									<div className="flex-1 min-w-0">
										<p className="text-emerald-400 font-bold text-sm truncate">
											{user.displayName}
										</p>
										<p className="text-zinc-600 text-[10px] font-mono truncate">
											{user.uid}
										</p>
									</div>
								</div>
							</button>
						))
					)}
				</div>

				<div className="border-t border-zinc-800 pt-2 mt-2">
					<p className="text-[10px] text-zinc-600 font-mono">
						Active Users: {onlineUsers.length}
					</p>
				</div>
			</div>
		</Terminal>
	);
};
