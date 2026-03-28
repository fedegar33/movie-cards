import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const rootRoute = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<div className="min-h-screen w-full h-screen bg-[#050505] flex items-center justify-center">
			<div className="w-full max-w-5xl h-full bg-[#050505] overflow-x-hidden relative">
				<Outlet />
				<TanStackRouterDevtools />
			</div>
		</div>
	);
}
