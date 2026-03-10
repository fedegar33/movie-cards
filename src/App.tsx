import { type CarouselItem, StackCarousel } from "./StackCarousel";

const items: CarouselItem[] = [
	{
		id: "9cqNxx0GxF0bflZmeSMuL5tnGzr",
		imageUrl: "https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
		title: "Film 1",
	},
	{
		id: "https://picsum.photos/seed/film2/400/600",
		imageUrl: "https://picsum.photos/seed/film2/400/600",
		title: "Film 2",
	},
	{
		id: "d5iIlFn5s0ImszYzBPb8JPIfbXD",
		imageUrl: "https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
		title: "Film 3",
	},
	{
		id: "sF1U4EUQS8YHUYjNl3pMGNIQyr0",
		imageUrl: "https://image.tmdb.org/t/p/w780/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
		title: "Film 4",
	},
	{
		id: "qJ2tW6WMUDux911r6m7haRef0WH",
		imageUrl: "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
		title: "Film 5",
	},
	{
		id: "8Gxv8gSFCU0XGDykEGv7zR1n2ua",
		imageUrl: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
		title: "Film 6",
	},
	{
		id: "AkJQpZp9WoNdj7pLYSj1L0RcMMN",
		imageUrl: "https://image.tmdb.org/t/p/w780/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
		title: "Film 7",
	},
];

function App() {
	return (
		<div className="min-h-screen w-full h-screen bg-neutral-800 flex items-center justify-center">
			<div className="relative max-w-xl w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center">
				<StackCarousel items={items} />
			</div>
		</div>
	);
}

export default App;
