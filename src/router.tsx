import { createRouter } from "@tanstack/react-router";
import { queryRoute } from "./pages/Discover";
import { mainLayoutRoute } from "./pages/MainLayout";
import { rootRoute } from "./pages/Root";
import { welcomeRoute } from "./pages/Welcome";

const routeTree = rootRoute.addChildren([
	mainLayoutRoute.addChildren([welcomeRoute, queryRoute]),
]);

export const router = createRouter({ routeTree, defaultPreload: "render" });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
