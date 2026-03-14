import { translateQuery } from "./llmService";
import {
	discoverMovies,
	getListMovies,
	type Movie,
	searchPerson,
} from "./tmdbService";

export async function executeQuery(query: string): Promise<Movie[]> {
	const plan = await translateQuery(query);

	switch (plan.strategy) {
		case "discover":
			return discoverMovies(plan.params);

		case "person_discover": {
			const personId = await searchPerson(plan.personQuery);
			if (personId == null) {
				return [];
			}
			const params = { ...plan.params };
			if (plan.role === "crew") {
				params.withCrew = [...(params.withCrew ?? []), personId];
			} else {
				params.withCast = [...(params.withCast ?? []), personId];
			}
			return discoverMovies(params);
		}

		case "list":
			return getListMovies(plan.listId);
	}
}
