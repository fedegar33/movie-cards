import { createRouter } from "@tanstack/react-router";
import { discoverRoute } from "./pages/Discover";
import { indexRoute } from "./pages/Index";
import { rootRoute } from "./pages/Root";

const routeTree = rootRoute.addChildren([indexRoute, discoverRoute]);

export const router = createRouter({ routeTree, defaultPreload: "render" });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
