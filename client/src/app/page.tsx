"use client";

import {
	type User as FirebaseUser,
	onAuthStateChanged,
	signInWithPopup,
} from "firebase/auth";
import { Activity, Ghost, LogIn, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { GhostChat } from "@/components/GhostChat";
import { MFAModal } from "@/components/MFAModal";
import { SystemPulse } from "@/components/SystemPulse";
import { auth, googleProvider } from "@/lib/firebase";

export default function Home() {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [mfaVerified, setMfaVerified] = useState(() => {
		if (typeof window !== "undefined") {
			return sessionStorage.getItem("ghost_mfa_verified") === "true";
		}
		return false;
	});

	const handleMfaSuccess = () => {
		setMfaVerified(true);
		sessionStorage.setItem("ghost_mfa_verified", "true");
	};
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				const token = await firebaseUser.getIdToken();
				const serverUrl =
					process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

				try {
					const res = await fetch(`${serverUrl}/api/auth/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					});
					if (res.ok) {
						setUser(firebaseUser);
					}
				} catch (error) {
					console.error("[AUTH]: Sync Error", error);
				}
			} else {
				setUser(null);
				setMfaVerified(false);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const handleLogin = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
		} catch (error) {
			console.error("[AUTH]: Login Error", error);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 flex items-center justify-center bg-black">
				<div className="text-emerald-500 font-mono animate-pulse">
					Initializing Ghost Console...
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center bg-black p-6">
				<div className="w-full max-w-md space-y-8 text-center">
					<div className="relative inline-block">
						<Ghost size={64} className="text-emerald-500 animate-bounce" />
						<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500/20 blur-sm rounded-full" />
					</div>
					<div>
						<h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
							HYBRID GHOST
						</h1>
						<p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
							Secure Ephemeral Messenger
						</p>
					</div>
					<button
						onClick={handleLogin}
						className="w-full group relative flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 py-4 rounded-lg transition-all duration-300"
					>
						<LogIn
							size={20}
							className="text-emerald-500 group-hover:scale-110 transition-transform"
						/>
						<span className="font-mono text-zinc-300 group-hover:text-white">
							Authenticate with Google
						</span>
					</button>
					<p className="text-xs text-zinc-600 font-mono italic">
						"What happens in the ghost layer, stays in the ghost layer."
					</p>
				</div>
			</div>
		);
	}

	if (!mfaVerified) {
		return <MFAModal user={user} onVerified={handleMfaSuccess} />;
	}

	return (
		<main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-8">
			<header className="flex items-center justify-between border-b border-zinc-800 pb-6">
				<div className="flex items-center gap-3">
					<Ghost className="text-emerald-500" />
					<div>
						<h1 className="text-xl font-bold tracking-tight text-white leading-none">
							GHOST CONSOLE
						</h1>
						<span className="text-[10px] text-zinc-500 font-mono">
							STATUS: SECURE_VOLATILE
						</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
						<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-xs font-mono text-zinc-400">
							{user.displayName}
						</span>
					</div>
					<button
						onClick={() => auth.signOut()}
						className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
					>
						DISCONNECT
					</button>
				</div>
			</header>

			<div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
				<section className="lg:col-span-2 flex flex-col gap-3">
					<div className="flex items-center gap-2 text-zinc-500 mb-1">
						<Ghost size={14} />
						<span className="text-xs font-mono uppercase tracking-wider font-bold">
							Volatile Messaging
						</span>
					</div>
					<GhostChat user={user} />
				</section>

				<section className="flex flex-col gap-8">
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2 text-zinc-500 mb-1">
							<Users size={14} />
							<span className="text-xs font-mono uppercase tracking-wider font-bold">
								Online Members
							</span>
						</div>
						{/* Member list is now integrated in GhostChat */}
					</div>

					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2 text-zinc-500 mb-1">
							<Activity size={14} />
							<span className="text-xs font-mono uppercase tracking-wider font-bold">
								Backend Stream
							</span>
						</div>
						<SystemPulse />
					</div>
				</section>
			</div>

			<footer className="pt-4 border-t border-zinc-800">
				<p className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-[0.2em]">
					End-to-End Encrypted | Auto-Wipe Active (120s Inactivity) | No Logs
					Persisted
				</p>
			</footer>
		</main>
	);
}
