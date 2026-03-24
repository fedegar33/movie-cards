import { createRouter } from "@tanstack/react-router";
import { coverflowRoute } from "./pages/Coverflow";
import { discoverRoute } from "./pages/Discover";
import { indexRoute } from "./pages/Index";
import { rootRoute } from "./pages/Root";

const routeTree = rootRoute.addChildren([
	indexRoute,
	discoverRoute,
	coverflowRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "render" });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
