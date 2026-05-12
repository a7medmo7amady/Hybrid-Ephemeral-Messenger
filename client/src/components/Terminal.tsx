import { type ClassValue, clsx } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface TerminalProps {
	title: string;
	children: React.ReactNode;
	className?: string;
}

export const Terminal = ({ title, children, className }: TerminalProps) => {
	return (
		<div
			className={cn(
				"bg-black border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full shadow-2xl shadow-emerald-900/10",
				className,
			)}
		>
			<div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
				<div className="flex gap-1.5">
					<div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500/20" />
					<div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500/20" />
					<div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/20" />
				</div>
				<span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
					{title}
				</span>
				<div className="w-12" />
			</div>
			<div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
				{children}
			</div>
		</div>
	);
};
