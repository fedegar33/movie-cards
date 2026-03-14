import {
	createRootRoute,
	Outlet,
	useMatch,
	useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AnimatePresence } from "motion/react";

export const rootRoute = createRootRoute({
	component: Root,
});

function Root() {
	const matches = useMatches();
	const match = useMatch({ strict: false });
	const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
	const nextMatch = matches[nextMatchIndex];

	return (
		<div className="min-h-screen w-full h-screen bg-[#050505] flex items-center justify-center">
			<div className="relative max-w-sm w-full h-full bg-[#050505] overflow-hidden">
				<AnimatePresence mode="wait">
					<Outlet key={nextMatch?.id} />
				</AnimatePresence>
				<TanStackRouterDevtools />
			</div>
		</div>
	);
}
