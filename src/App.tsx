import type { Movie } from "./MovieCard";
import { StackCarousel } from "./StackCarousel";

const movies: Movie[] = [
	{
		title: "The Shawshank Redemption",
		year: "1994",
		genre: "Drama / Crime",
		runtime: "2h 22m",
		description:
			"Imprisoned for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at Shawshank prison, where his integrity and unquenchable hope earn the admiration of fellow inmates.",
		cast: [
			"Tim Robbins",
			"Morgan Freeman",
			"Bob Gunton",
			"William Sadler",
			"James Whitmore",
			"Clancy Brown",
		],
		director: "Frank Darabont",
		rating: "8.7",
		poster: "https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
		backdrop:
			"https://image.tmdb.org/t/p/w1280/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg",
	},
	{
		title: "The Godfather",
		year: "1972",
		genre: "Drama / Crime",
		runtime: "2h 55m",
		description:
			"When patriarch Vito Corleone barely survives an assassination attempt, his youngest son Michael steps in to exact bloody revenge — launching a transformation no one could have foreseen.",
		cast: [
			"Marlon Brando",
			"Al Pacino",
			"James Caan",
			"Robert Duvall",
			"Diane Keaton",
			"Talia Shire",
		],
		director: "Francis Ford Coppola",
		rating: "8.7",
		poster: "https://image.tmdb.org/t/p/w780/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
		backdrop:
			"https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
	},
	{
		title: "The Godfather Part II",
		year: "1974",
		genre: "Drama / Crime",
		runtime: "3h 22m",
		description:
			"In a dual saga, a young Vito Corleone rises to power in 1910s New York while his son Michael expands the family empire into Las Vegas, Hollywood, and Cuba — at devastating personal cost.",
		cast: [
			"Al Pacino",
			"Robert Duvall",
			"Diane Keaton",
			"Robert De Niro",
			"Talia Shire",
			"Michael V. Gazzo",
		],
		director: "Francis Ford Coppola",
		rating: "8.6",
		poster: "https://image.tmdb.org/t/p/w780/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
		backdrop:
			"https://image.tmdb.org/t/p/w1280/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
	},
	{
		title: "Schindler's List",
		year: "1993",
		genre: "Drama / History",
		runtime: "3h 15m",
		description:
			"The true story of businessman Oskar Schindler, who saved over a thousand Jewish lives from the Nazis by employing them in his factory during the horrors of World War II.",
		cast: [
			"Liam Neeson",
			"Ben Kingsley",
			"Ralph Fiennes",
			"Caroline Goodall",
			"Jonathan Sagall",
			"Embeth Davidtz",
		],
		director: "Steven Spielberg",
		rating: "8.6",
		poster: "https://image.tmdb.org/t/p/w780/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
		backdrop:
			"https://image.tmdb.org/t/p/w1280/zb6fM1CX41D9rF9hdgclu0peUmy.jpg",
	},
	{
		title: "12 Angry Men",
		year: "1957",
		genre: "Drama",
		runtime: "1h 37m",
		description:
			"In a sweltering jury room, eleven men are ready to convict a boy of murder — until one juror's quiet doubt unravels their certainties, forcing each man to confront his own prejudices.",
		cast: [
			"Henry Fonda",
			"Martin Balsam",
			"John Fiedler",
			"Lee J. Cobb",
			"E.G. Marshall",
			"Jack Warden",
		],
		director: "Sidney Lumet",
		rating: "8.5",
		poster: "https://image.tmdb.org/t/p/w780/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
		backdrop:
			"https://image.tmdb.org/t/p/w1280/w4bTBXcqXc2TUyS5Fc4h67uWbPn.jpg",
	},
];

function App() {
	return (
		<div className="min-h-screen w-full h-screen bg-neutral-800 flex items-center justify-center">
			<div className="relative max-w-sm w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center">
				<StackCarousel movies={movies} />
			</div>
		</div>
	);
}

export default App;
