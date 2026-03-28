import { createRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { encodeQuery } from "../utils/queryEncoding";
import { mainLayoutRoute } from "./MainLayout";

export const welcomeRoute = createRoute({
	getParentRoute: () => mainLayoutRoute,
	path: "/",
	component: Welcome,
});

const suggestions = [
	"Thriller from the 90s",
	"Oscar Best Picture",
	"Sci-Fi Noir",
	"Directed by Nolan",
	"__test__",
];

function Welcome() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="flex flex-wrap justify-center gap-2 pt-4"
		>
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
		</motion.div>
	);
}
