import { createRoute, useLoaderData } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CoverFlowCarousel } from "../CoverFlowCarousel";
import { executeQuery } from "../services/queryOrchestrator";
import type { Movie } from "../services/tmdbService";
import { rootRoute } from "./Root";

const TEST_MOVIES: Movie[] = [
	{
		title: "Blade Runner 2049",
		year: "2017",
		genre: "Sci-Fi",
		runtime: "164 min",
		description:
			"Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.",
		cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
		director: "Denis Villeneuve",
		rating: "8.0",
		poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
		backdrop: "",
	},
	{
		title: "Inception",
		year: "2010",
		genre: "Sci-Fi",
		runtime: "148 min",
		description:
			"A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
		cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
		director: "Christopher Nolan",
		rating: "8.8",
		poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
		backdrop: "",
	},
	{
		title: "The Dark Knight",
		year: "2008",
		genre: "Action",
		runtime: "152 min",
		description:
			"When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.",
		cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
		director: "Christopher Nolan",
		rating: "9.0",
		poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1MF0to.jpg",
		backdrop: "",
	},
	{
		title: "Parasite",
		year: "2019",
		genre: "Thriller",
		runtime: "132 min",
		description:
			"Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
		cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
		director: "Bong Joon-ho",
		rating: "8.5",
		poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
		backdrop: "",
	},
	{
		title: "Dune",
		year: "2021",
		genre: "Sci-Fi",
		runtime: "155 min",
		description:
			"Paul Atreides, a brilliant and gifted young man born into a great destiny, must travel to the most dangerous planet in the universe.",
		cast: ["Timothée Chalamet", "Rebecca Ferguson", "Zendaya"],
		director: "Denis Villeneuve",
		rating: "8.0",
		poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
		backdrop: "",
	},
];

export const discoverRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/discover",
	validateSearch: (search: Record<string, unknown>) => ({
		q: (search.q as string) || "",
	}),
	loaderDeps: ({ search }) => ({ q: search.q }),
	staleTime: 1000 * 60 * 5, // 5 minutes
	loader: async ({ deps }) => {
		if (deps.q === "__test__") {
			await new Promise((r) => setTimeout(r, 500));
			return TEST_MOVIES;
		}
		const movies = await executeQuery(deps.q);
		await Promise.all(
			// Preload poster images for the first 3 movies to improve perceived performance
			movies.slice(0, 3).map((m) => {
				if (!m.poster) return null;
				return new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = img.onerror = () => resolve();
					img.src = m.poster;
				});
			}),
		);
		return movies;
	},
	component: Discover,
});

function Discover() {
	const movies = useLoaderData({ from: "/discover" });

	return (
		<motion.div
			className="h-full"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<CoverFlowCarousel movies={movies} />
		</motion.div>
	);
}
