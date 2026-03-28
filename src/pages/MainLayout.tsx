import {
	createRoute,
	Link,
	Outlet,
	useMatch,
	useMatches,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { decodeQuery, encodeQuery } from "../utils/queryEncoding";
import { rootRoute } from "./Root";

const suggestions = [
	"Thriller from the 90s",
	"Oscar Best Picture",
	"Sci-Fi Noir",
	"Directed by Nolan",
	"__test__",
];

export const mainLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	id: "_main",
	component: MainLayout,
});

function MainLayout() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const query = (params as { query?: string }).query;
	const [input, setInput] = useState(query ? decodeQuery(query) : "");

	useEffect(() => {
		if (query) {
			setInput(decodeQuery(query));
		}
	}, [query]);

	const handleSend = () => {
		const trimmed = input.trim();
		if (trimmed) {
			navigate({
				to: "/$query",
				params: { query: encodeQuery(trimmed) },
			});
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const matches = useMatches();
	const match = useMatch({ strict: false });
	const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
	const nextMatch = matches[nextMatchIndex];

	return (
		<div className="flex flex-col h-full px-6 pt-12 pb-6 font-body items-center">
			<div className="w-full max-w-xl text-center">
				<h1 className="font-serif text-4xl text-[#e8c97a] leading-tight mb-4">
					What are you in the mood for?
				</h1>

				<div className="relative flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 mb-4">
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Describe the movie you want to watch..."
						className="h-20 flex-1 bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none resize-none"
					/>
				</div>

				<div className="flex flex-wrap justify-center gap-2">
					{suggestions.map((s) => (
						<Link
							key={s}
							to="/$query"
							params={{ query: encodeQuery(s) }}
							className="px-3 py-1.5 rounded-full border border-neutral-700 text-xs text-neutral-300"
						>
							{s}
						</Link>
					))}
				</div>
			</div>

			<div>
				<AnimatePresence mode="wait">
					<Outlet key={nextMatch?.id} />
				</AnimatePresence>
			</div>
		</div>
	);
}
