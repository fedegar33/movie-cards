import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Movie } from "./services/tmdbService";

export type { Movie };

const FACE =
	"absolute inset-0 rounded-[14px] overflow-hidden bg-[#0F0F0F] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.08)]";

const OVERLAY_BG = [
	"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
].join(", ");

function CardOverlay() {
	return (
		<div
			className="absolute inset-0 rounded-[14px] pointer-events-none z-30 opacity-70"
			style={{ backgroundImage: OVERLAY_BG }}
		/>
	);
}

export function CardFrame({ opacity }: { opacity: number }) {
	const border = `1px solid rgba(255,255,255,${opacity})`;
	return (
		<div className="absolute pointer-events-none z-10 inset-2.5">
			<div className="absolute inset-0 rounded-6px" style={{ border }} />
			<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
			<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
		</div>
	);
}

export function MovieCard({
	movie,
	isActive = true,
}: {
	movie: Movie;
	isActive?: boolean;
}) {
	const [flipped, setFlipped] = useState(false);
	const reduceMotion = useReducedMotion();

	// Reset flip when card becomes non-active
	if (!isActive && flipped) {
		setFlipped(false);
	}

	const flip = { perspective: 800, duration: 0.5, bounce: 0.25, scale: 1.55 };

	const flipTransition = reduceMotion
		? ({ duration: 0 } as const)
		: ({
				type: "spring",
				duration: flip.duration,
				bounce: flip.bounce,
			} as const);

	const front = (
		<div
			className={`${FACE} flex items-center justify-center`}
			style={{ backfaceVisibility: "hidden" }}
		>
			<CardOverlay />
			<CardFrame opacity={0.25} />
			<img
				src={movie.poster}
				alt={movie.title}
				className="w-full h-full object-cover"
				draggable={false}
			/>
		</div>
	);

	const back = (
		<div
			className={`${FACE} flex flex-col`}
			style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
		>
			{/* Rating badge */}
			{/*
			<div className="absolute top-6 right-6 w-9 h-9 rounded-full border border-[#E6DDD0] flex items-center justify-center font-body font-semibold text-[10px] text-[#E6DDD0] bg-black/50 backdrop-blur-sm z-35">
				{movie.rating}
			</div>
			*/}

			<CardOverlay />
			<CardFrame opacity={0.2} />

			{/* Header image */}
			<div className="w-full h-[30%] shrink-0 relative">
				<img
					src={movie.backdrop}
					alt="Scene still"
					loading="lazy"
					className="w-full h-full object-cover opacity-75 filter-[sepia(0.15)_contrast(1.05)]"
					style={{
						maskImage:
							"linear-gradient(to bottom, black 50%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to bottom, black 50%, transparent 100%)",
					}}
				/>
			</div>

			{/* Body */}
			<div className="flex-1 flex flex-col gap-2 px-5 relative -top-2">
				{/* Title lockup */}
				<div className="border-b border-white/10 pb-2.5 flex flex-col gap-y-2 items-center text-center">
					<h2 className="font-serif text-[18px] text-white leading-none mb-1 text-balance">
						{movie.title}
					</h2>
					<div className="self-center text-[10px] uppercase text-white/60 font-normal tracking-[0.12em]">
						{movie.genre}
					</div>
					<div className="flex gap-2 justify-center font-body text-[10px] uppercase text-white/60 font-normal">
						<span>{movie.year}</span>
						<span>•</span>
						<span>{movie.rating}</span>
						<span>•</span>
						<span>{movie.runtime || "2h 20m"}</span>
					</div>
				</div>

				{/* Description */}
				<p className="font-body font-light italic text-base leading-normal text-center text-[10px] text-white/75 min-h-18">
					{movie.description}
				</p>

				{/*
					<div>
						<span className="font-body font-medium text-[10px] uppercase tracking-[0.12em] text-white/35">
							Cast
						</span>
						<p className="font-body font-light text-[10px] text-[#E6DDD0]">
							{movie.cast.join(", ")}
						</p>
					</div>

					<div className="flex justify-start items-baseline gap-1.5">
						<span className="font-body font-medium text-[0.55rem] uppercase tracking-[0.12em] text-white/35">
							Director
						</span>
						<span className="font-serif italic text-[0.8rem] text-[#E6DDD0]">
							{movie.director}
						</span>
					</div>
				*/}
			</div>
		</div>
	);

	return (
		<motion.div
			className="w-full h-full"
			style={{
				perspective: flip.perspective,
				transformStyle: "preserve-3d",
			}}
			animate={{
				rotateY: flipped ? 180 : 0,
				scale: flipped ? flip.scale : 1,
			}}
			transition={{
				rotateY: flipTransition,
				scale: flipTransition,
			}}
			onClick={isActive ? () => setFlipped((f) => !f) : undefined}
		>
			<div className="w-full h-full" style={{ transformStyle: "preserve-3d" }}>
				{front}
				{back}
			</div>
		</motion.div>
	);
}

export default MovieCard;
