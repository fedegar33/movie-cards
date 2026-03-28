import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTickSound } from "./hooks/useTickSound";
import type { Movie } from "./services/tmdbService";

function CoverBack() {
	return (
		<div className="w-[var(--cover-w)] h-[var(--cover-h)] scale-[var(--cover-scale)] rounded-[5px] bg-linear-to-b from-[#1a1a2e] to-[#0a0a0f] shadow-[0_4px_15px_rgba(0,0,0,0.3)]" />
	);
}

function CoverFront({
	poster,
	title,
	className = "",
}: {
	poster: string;
	title: string;
	className?: string;
}) {
	return (
		<img
			className={`relative select-none block w-full h-full rounded-[5px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] will-change-transform object-cover ${className}`}
			draggable={false}
			src={poster}
			alt={title}
		/>
	);
}

function CoverItem({ movie, isActive }: { movie: Movie; isActive: boolean }) {
	const [flipped, setFlipped] = useState(false);
	const shouldReduceMotion = useReducedMotion();

	useEffect(() => {
		if (!isActive) setFlipped(false);
	}, [isActive]);

	function handleClick() {
		if (isActive) setFlipped((f) => !f);
	}

	function handleKeyUp(e: React.KeyboardEvent) {
		if (isActive && (e.key === "Enter" || e.key === " ")) {
			setFlipped((f) => !f);
		}
	}

	return (
		<li
			className="cover-item transform-3d inline-block snap-center relative"
			onClick={handleClick}
			onKeyUp={handleKeyUp}
		>
			<motion.div
				className="w-full h-full"
				animate={{
					rotateY: flipped ? 180 : 0,
					translateZ: flipped ? 100 : 0,
				}}
				transition={
					shouldReduceMotion
						? { duration: 0 }
						: { type: "spring", duration: 0.3, bounce: 0.15 }
				}
				style={{ transformStyle: "preserve-3d" }}
			>
				<div
					className="absolute inset-0 z-0"
					style={{
						backfaceVisibility: "hidden",
						transformStyle: "preserve-3d",
					}}
				>
					<CoverFront
						poster={movie.poster}
						title={movie.title}
						className="cover"
					/>
				</div>
				{isActive && (
					<div
						className="absolute inset-0 z-10"
						style={{
							backfaceVisibility: "hidden",
							transformStyle: "preserve-3d",
							transform: "rotateY(180deg)",
						}}
					>
						<CoverBack />
					</div>
				)}
			</motion.div>
			<CoverFront
				poster={movie.poster}
				title={movie.title}
				className="cover-reflection absolute -bottom-[130%] left-0 pointer-events-none opacity-25 mask-[linear-gradient(to_top,transparent_0%,black_100%)]"
			/>
		</li>
	);
}

function Coverflow({ movies }: { movies: Movie[] }) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(-1);
	const tick = useTickSound();

	// Detect active cover changes on scroll and play tick
	function handleScroll() {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const items = wrapper.querySelectorAll<HTMLLIElement>("li");
		if (!items.length) return;

		const center =
			wrapper.getBoundingClientRect().left + wrapper.clientWidth / 2;
		let closestIndex = -1;
		let closestDist = Number.POSITIVE_INFINITY;

		for (let i = 0; i < items.length; i++) {
			const rect = items[i].getBoundingClientRect();
			const itemCenter = rect.left + rect.width / 2;
			const dist = Math.abs(itemCenter - center);
			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		if (closestIndex !== activeIndex) {
			setActiveIndex(closestIndex);
			tick();
		}
	}

	return (
		<div
			className="covers-viewport overflow-x-auto overflow-y-hidden snap-x snap-mandatory mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			ref={wrapperRef}
			onScroll={handleScroll}
		>
			<ul className="transform-3d list-none p-0 m-0 whitespace-nowrap relative">
				{movies.map((movie, index) => (
					<CoverItem
						key={movie.title}
						movie={movie}
						isActive={index === activeIndex}
					/>
				))}
			</ul>
		</div>
	);
}

export default Coverflow;
