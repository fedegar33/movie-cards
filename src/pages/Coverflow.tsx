import { createRoute } from "@tanstack/react-router";
import Coverflow from "../Coverflow";
import { rootRoute } from "./Root";

export const coverflowRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/coverflow",
	component: CoverflowPage,
});

function CoverflowPage() {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="w-3/4">
				<Coverflow />
			</div>
		</div>
	);
}
