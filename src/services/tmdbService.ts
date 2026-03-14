const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

export interface Movie {
	title: string;
	year: string;
	genre: string;
	runtime: string;
	description: string;
	cast: string[];
	director: string;
	rating: string;
	poster: string;
	backdrop: string;
}

export interface DiscoverFilters {
	yearFrom?: number;
	yearTo?: number;
	genreIds?: number[];
	withCrew?: number[];
	withCast?: number[];
	runtimeGte?: number;
	runtimeLte?: number;
	voteAverageGte?: number;
	sortBy?: string;
}

export type QueryPlan =
	| { strategy: "discover"; params: DiscoverFilters }
	| {
			strategy: "person_discover";
			personQuery: string;
			role: "crew" | "cast";
			params: DiscoverFilters;
	  }
	| { strategy: "list"; listId: number };

interface TmdbDiscoverResult {
	id: number;
	title: string;
	release_date: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	vote_average: number;
	genre_ids: number[];
}

const GENRE_CACHE_KEY = "tmdb_genre_map";

async function loadGenreMap(): Promise<Map<number, string>> {
	const cached = localStorage.getItem(GENRE_CACHE_KEY);
	if (cached) {
		return new Map<number, string>(JSON.parse(cached));
	}

	const res = await fetch(`${BASE_URL}/genre/movie/list?language=en-US`, {
		headers: {
			Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
		},
	});
	if (!res.ok) throw new Error(`Failed to fetch genres: ${res.status}`);

	const data: { genres: { id: number; name: string }[] } = await res.json();
	const entries: [number, string][] = data.genres.map((g) => [g.id, g.name]);
	localStorage.setItem(GENRE_CACHE_KEY, JSON.stringify(entries));
	return new Map(entries);
}

/** Eagerly load genre map on module import (from localStorage or network). */
const genreMapPromise: Promise<Map<number, string>> = loadGenreMap();

async function toMovie(result: TmdbDiscoverResult): Promise<Movie> {
	const genreMap = await genreMapPromise;
	const genre = result.genre_ids
		.map((id) => genreMap.get(id))
		.filter(Boolean)
		.join(" / ");

	return {
		title: result.title,
		year: result.release_date?.slice(0, 4) ?? "",
		genre,
		runtime: "",
		description: result.overview,
		cast: [],
		director: "",
		rating: result.vote_average.toFixed(1),
		poster: result.poster_path ? `${IMG_BASE}/w780${result.poster_path}` : "",
		backdrop: result.backdrop_path
			? `${IMG_BASE}/w1280${result.backdrop_path}`
			: "",
	};
}

function tmdbHeaders() {
	return {
		Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
	};
}

export async function discoverMovies(
	params: DiscoverFilters = {},
): Promise<Movie[]> {
	const url = new URL(`${BASE_URL}/discover/movie`);
	url.searchParams.set("language", "en-US");
	url.searchParams.set("sort_by", params.sortBy ?? "vote_average.desc");
	url.searchParams.set("vote_count.gte", "200");

	if (params.yearFrom != null) {
		url.searchParams.set(
			"primary_release_date.gte",
			`${params.yearFrom}-01-01`,
		);
	}
	if (params.yearTo != null) {
		url.searchParams.set("primary_release_date.lte", `${params.yearTo}-12-31`);
	}
	if (params.genreIds?.length) {
		url.searchParams.set("with_genres", params.genreIds.join(","));
	}
	if (params.withCrew?.length) {
		url.searchParams.set("with_crew", params.withCrew.join(","));
	}
	if (params.withCast?.length) {
		url.searchParams.set("with_cast", params.withCast.join(","));
	}
	if (params.runtimeGte != null) {
		url.searchParams.set("with_runtime.gte", String(params.runtimeGte));
	}
	if (params.runtimeLte != null) {
		url.searchParams.set("with_runtime.lte", String(params.runtimeLte));
	}
	if (params.voteAverageGte != null) {
		url.searchParams.set("vote_average.gte", String(params.voteAverageGte));
	}

	const res = await fetch(url, { headers: tmdbHeaders() });
	if (!res.ok) throw new Error(`TMDB discover failed: ${res.status}`);

	const data: { results: TmdbDiscoverResult[] } = await res.json();
	const top = data.results.slice(0, 5);

	return Promise.all(top.map(toMovie));
}

export async function searchPerson(query: string): Promise<number | null> {
	const url = new URL(`${BASE_URL}/search/person`);
	url.searchParams.set("query", query);
	url.searchParams.set("language", "en-US");

	const res = await fetch(url, { headers: tmdbHeaders() });
	if (!res.ok) throw new Error(`TMDB person search failed: ${res.status}`);

	const data: { results: { id: number }[] } = await res.json();
	return data.results[0]?.id ?? null;
}

export async function getListMovies(listId: number): Promise<Movie[]> {
	const url = new URL(`${BASE_URL}/list/${listId}`);
	url.searchParams.set("language", "en-US");

	const res = await fetch(url, { headers: tmdbHeaders() });
	if (!res.ok) throw new Error(`TMDB list fetch failed: ${res.status}`);

	const data: { items: TmdbDiscoverResult[] } = await res.json();
	const top = data.items.slice(0, 5);

	return Promise.all(top.map(toMovie));
}
