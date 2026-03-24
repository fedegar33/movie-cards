import { useCallback, useEffect, useRef, useState } from "react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "./services/tmdbService";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 420;

export function CoverFlowCarousel({ movies }: { movies: Movie[] }) {
	const scrollRef = useRef<HTMLUListElement>(null);
	const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	// Active index detection via IntersectionObserver
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		const observer = new IntersectionObserver(
			(entries) => {
				let bestEntry: IntersectionObserverEntry | null = null;
				for (const entry of entries) {
					if (
						entry.isIntersecting &&
						(!bestEntry ||
							entry.intersectionRatio > bestEntry.intersectionRatio)
					) {
						bestEntry = entry;
					}
				}
				if (bestEntry) {
					const idx = itemRefs.current.indexOf(
						bestEntry.target as HTMLLIElement,
					);
					if (idx !== -1) setActiveIndex(idx);
				}
			},
			{ root: container, threshold: 0.6 },
		);

		for (const ref of itemRefs.current) {
			if (ref) observer.observe(ref);
		}

		return () => observer.disconnect();
	}, []);

	// Also try scrollsnapchange for browsers that support it
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		const handler = (e: Event) => {
			const snapEvent = e as Event & { snapTargetInline?: Element };
			if (snapEvent.snapTargetInline) {
				const idx = itemRefs.current.indexOf(
					snapEvent.snapTargetInline as HTMLLIElement,
				);
				if (idx !== -1) setActiveIndex(idx);
			}
		};

		container.addEventListener("scrollsnapchange", handler);
		return () => container.removeEventListener("scrollsnapchange", handler);
	}, []);

	const handleCardClick = useCallback(
		(index: number) => {
			if (index !== activeIndex) {
				itemRefs.current[index]?.scrollIntoView({
					behavior: "smooth",
					inline: "center",
				});
			}
		},
		[activeIndex],
	);

	return (
		<div
			className="relative w-full h-full flex items-center"
			style={{ perspective: "1200px" }}
		>
			<ul
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto snap-x snap-mandatory w-full items-center"
				style={{
					scrollbarWidth: "none",
					paddingInline: `calc(50% - ${CARD_WIDTH / 2}px)`,
					WebkitOverflowScrolling: "touch",
				}}
			>
				{movies.map((movie, i) => (
					<li
						key={movie.poster}
						ref={(el) => {
							itemRefs.current[i] = el;
						}}
						className="snap-center shrink-0"
						style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
						onClick={() => handleCardClick(i)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleCardClick(i);
						}}
					>
						<div
							className="coverflow-inner w-full h-full"
							style={{
								transformStyle: "preserve-3d",
								willChange: "transform",
							}}
						>
							<MovieCard movie={movie} isActive={i === activeIndex} />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
