import { createRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { rootRoute } from "./Root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Index,
});

const suggestions = [
	"Thriller from the 90s",
	"Oscar Best Picture",
	"Sci-Fi Noir",
	"Directed by Nolan",
	"__test__",
];

export function Index() {
	const [query, setQuery] = useState("__test__");
	const [buttonText, setButtonText] = useState("Search");
	const navigate = useNavigate();

	const handleSearch = () => {
		const trimmed = query.trim();
		if (trimmed) {
			setButtonText("Searching...");
			navigate({ to: "/discover", search: { q: trimmed } });
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col h-full px-6 pt-16 pb-8 font-body"
		>
			<p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
				Discover
			</p>
			<h1 className="font-serif text-7xl text-[#e8c97a] leading-tight mb-8">
				What are you in the mood for?
			</h1>

			<div className="flex flex-col gap-2 mb-auto">
				{suggestions.map((s) => (
					<Link
						key={s}
						to="/discover"
						search={{ q: s }}
						className="px-3 py-1.5 rounded-full border border-neutral-700 text-xs text-neutral-300 w-fit"
					>
						{s}
					</Link>
				))}
			</div>

			<div className="relative flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3">
				<textarea
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Describe the movie you want to watch..."
					className="h-24 flex-1 bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none resize-none"
				/>
				<button
					type="button"
					onClick={handleSearch}
					className="absolute bottom-2 right-2 px-4 py-2 rounded-lg bg-[#e8c97a] text-black text-sm font-medium whitespace-nowrap"
				>
					{buttonText} →
				</button>
			</div>
		</motion.div>
	);
}
