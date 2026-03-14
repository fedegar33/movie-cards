import type { QueryPlan } from "./tmdbService";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a movie search assistant. Given a natural language query, return a JSON object describing how to search TMDB.

Return exactly ONE of these three strategies:

1. **discover** — filter by genre, year, runtime, rating, etc.
\`\`\`json
{ "strategy": "discover", "params": { "yearFrom": 1990, "yearTo": 1999, "genreIds": [53], "sortBy": "vote_average.desc" } }
\`\`\`

2. **person_discover** — search for a person by name, then discover their movies.
\`\`\`json
{ "strategy": "person_discover", "personQuery": "Christopher Nolan", "role": "crew", "params": { "sortBy": "vote_average.desc" } }
\`\`\`
Use role "crew" for directors/writers, "cast" for actors.

3. **list** — fetch a known TMDB list by ID.
\`\`\`json
{ "strategy": "list", "listId": 28 }
\`\`\`
Known list IDs:
- 28: Oscar Best Picture Winners
- 634: AFI Top 100

TMDB genre IDs:
28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime, 99=Documentary, 18=Drama, 10751=Family, 14=Fantasy, 36=History, 27=Horror, 10402=Music, 9648=Mystery, 10749=Romance, 878=Science Fiction, 10770=TV Movie, 53=Thriller, 10752=War, 37=Western

Available params fields (all optional):
- yearFrom, yearTo: number (release year range)
- genreIds: number[] (from the list above)
- runtimeGte, runtimeLte: number (minutes)
- voteAverageGte: number (0-10)
- sortBy: string ("vote_average.desc", "popularity.desc", "primary_release_date.desc")

Return ONLY valid JSON, no markdown or explanation.`;

export async function translateQuery(query: string): Promise<QueryPlan> {
	const res = await fetch(OPENAI_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: query },
			],
		}),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`OpenAI request failed (${res.status}): ${body}`);
	}

	const data: { choices: { message: { content: string } }[] } =
		await res.json();
	const plan = JSON.parse(data.choices[0].message.content) as QueryPlan;

	if (!plan.strategy) {
		throw new Error("LLM response missing 'strategy' field");
	}

	return plan;
}
