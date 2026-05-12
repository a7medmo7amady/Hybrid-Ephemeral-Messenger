"use client";

import { CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Terminal } from "./Terminal";

interface MFAModalProps {
	onVerified: () => void;
	user: any;
}

export const MFAModal = ({ onVerified, user }: MFAModalProps) => {
	const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSendOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const token = await user.getIdToken();
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
			const res = await fetch(`${serverUrl}/api/mfa/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ phoneNumber: phone }),
			});

			if (res.ok) {
				setStep("OTP");
			} else {
				setError("Failed to send OTP. Try again.");
			}
		} catch (err) {
			setError("Connection error.");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const token = await user.getIdToken();
			const serverUrl =
				process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
			const res = await fetch(`${serverUrl}/api/mfa/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ otp }),
			});

			if (res.ok) {
				onVerified();
			} else {
				setError("Invalid code. Access Denied.");
			}
		} catch (err) {
			setError("Connection error.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
			<div className="w-full max-w-md h-[400px]">
				<Terminal title="Identity Verification Protocol">
					<div className="flex flex-col h-full justify-center items-center text-center space-y-6">
						<div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
							<ShieldCheck className="text-emerald-500" size={32} />
						</div>

						{step === "PHONE" ? (
							<>
								<div className="space-y-2">
									<h2 className="text-xl font-bold text-white">
										MFA CHALLENGE
									</h2>
									<p className="text-xs text-zinc-500 font-mono">
										Verify your identity with an SMS code
									</p>
								</div>
								<form onSubmit={handleSendOTP} className="w-full space-y-4">
									<div className="relative">
										<Smartphone
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
										/>
										<input
											type="tel"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											placeholder="+20 123 456 7890"
											className="w-full bg-zinc-900 border border-zinc-800 rounded px-10 py-3 text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-mono"
											required
										/>
									</div>
									<button
										disabled={loading}
										className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded transition-all disabled:opacity-50"
									>
										{loading ? "INITIATING..." : "REQUEST ACCESS CODE"}
									</button>
									{error && (
										<p className="text-xs text-red-500 font-mono">{error}</p>
									)}
								</form>
							</>
						) : (
							<>
								<div className="space-y-2">
									<h2 className="text-xl font-bold text-white">
										AWAITING CODE
									</h2>
									<p className="text-xs text-zinc-500 font-mono">
										Code sent to {phone}
									</p>
								</div>
								<form onSubmit={handleVerifyOTP} className="w-full space-y-4">
									<input
										type="text"
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
										placeholder="Enter 6-digit code"
										className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-center text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-mono tracking-[0.5em] text-xl"
										required
									/>
									<button
										disabled={loading}
										className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded transition-all disabled:opacity-50"
									>
										{loading ? "VERIFYING..." : "PROMOTE SESSION"}
									</button>
									{error && (
										<p className="text-xs text-red-500 font-mono">{error}</p>
									)}
								</form>
							</>
						)}
					</div>
				</Terminal>
			</div>
		</div>
	);
};
