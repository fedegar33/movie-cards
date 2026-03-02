import { useDialKit } from "dialkit";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import Card, { type Movie } from "./Card";

const MOVIES: Movie[] = [
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
		techDecor: "REF: US-1994 // IMDB TOP 1",
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
		techDecor: "REF: US-1972 // 3 OSCARS",
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
		techDecor: "REF: US-1974 // 6 OSCARS",
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
		techDecor: "REF: US-1993 // 7 OSCARS",
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
		techDecor: "REF: US-1957 // BERLIN BEAR",
	},
];

// ease-out-cubic: fast start, gradual settle — ideal for entering/exiting elements
const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const;

function App() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const reduceMotion = useReducedMotion();

	const nav = useDialKit("Navigation", {
		x: [220, 0, 500],
		rotateY: [30, 0, 90],
		enterDuration: [0.3, 0.05, 1.5],
		exitDuration: [0.22, 0.05, 1.5],
	});

	const slideVariants = {
		enter: (dir: number) => ({
			x: dir > 0 ? nav.x : -nav.x,
			opacity: 0,
			rotateY: dir > 0 ? -nav.rotateY : nav.rotateY,
		}),
		center: {
			x: 0,
			opacity: 1,
			rotateY: 0,
			transition: {
				x: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.enterDuration,
				},
				opacity: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.enterDuration,
				},
				rotateY: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.enterDuration,
				},
			},
		},
		exit: (dir: number) => ({
			x: dir > 0 ? -nav.x : nav.x,
			opacity: 0,
			rotateY: dir > 0 ? nav.rotateY : -nav.rotateY,
			transition: {
				// exit is ~20% faster than entrance for snappier feel
				x: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.exitDuration,
				},
				opacity: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.exitDuration,
				},
				rotateY: {
					type: "tween" as const,
					ease: EASE_OUT_CUBIC,
					duration: nav.exitDuration,
				},
			},
		}),
	};

	function goNext() {
		setDirection(1);
		setCurrentIndex((i) => (i + 1) % MOVIES.length);
	}

	function goPrev() {
		setDirection(-1);
		setCurrentIndex((i) => (i - 1 + MOVIES.length) % MOVIES.length);
	}

	return (
		<div className="min-h-screen w-full bg-[#050505] flex items-center justify-center gap-x-4">
			<button
				type="button"
				onClick={goPrev}
				className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/25 transition-all cursor-pointer"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<title>Previous</title>
					<path
						d="M10 12L6 8l4-4"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			<AnimatePresence custom={direction}>
				<motion.div
					key={currentIndex}
					custom={direction}
					variants={reduceMotion ? undefined : slideVariants}
					initial={reduceMotion ? false : "enter"}
					animate="center"
					exit={
						reduceMotion
							? { opacity: 0, transition: { duration: 0.15 } }
							: "exit"
					}
					style={{
						transformPerspective: 1000,
						willChange: "transform, opacity",
					}}
				>
					<Card
						movie={MOVIES[currentIndex]}
						// Skip the drop entrance during navigation — the slide handles
						// the visual entrance; drop is reserved for the initial page load
						skipEntrance={direction !== 0}
					/>
				</motion.div>
			</AnimatePresence>

			{/* Next button */}
			<button
				type="button"
				onClick={goNext}
				className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/25 transition-all cursor-pointer"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<title>Next</title>
					<path
						d="M6 4l4 4-4 4"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
	);
}

export default App;
