import { useDialKit } from "dialkit";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

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
	techDecor: string;
}

// Vignette + film-grain noise overlay — mimics the CSS ::after on .card-face
const OVERLAY_BG = [
	"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
].join(", ");

// Shared face base classes — backfaceVisibility applied via inline style, not Tailwind,
// because arbitrary CSS properties can be unreliable for 3D-critical properties.
const FACE =
	"absolute inset-0 rounded-[14px] overflow-hidden bg-[#0F0F0F] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]";

function CardOverlay() {
	return (
		<div
			className="absolute inset-0 rounded-[14px] pointer-events-none z-30 mix-blend-multiply opacity-70"
			style={{ backgroundImage: OVERLAY_BG }}
		/>
	);
}

function CardFrame({ opacity }: { opacity: number }) {
	const border = `1px solid rgba(255,255,255,${opacity})`;
	return (
		<div className="absolute pointer-events-none z-10" style={{ inset: 14 }}>
			{/* full-perimeter border */}
			<div className="absolute inset-0 rounded-[6px]" style={{ border }} />
			{/* top-left corner accent */}
			<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
			{/* bottom-right corner accent */}
			<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
		</div>
	);
}

function Card({
	movie,
	skipEntrance = false,
}: {
	movie: Movie;
	skipEntrance?: boolean;
}) {
	const [animKey, setAnimKey] = useState(0);
	const [flipped, setFlipped] = useState(false);
	const reduceMotion = useReducedMotion();

	const params = useDialKit(
		"Card",
		{
			transformPerspective: [280, 200, 2000],
			rotateX: [-18, -30, 30],
			y: [160, -200, 200],
			bounce: [0.28, 0, 0.6],
			duration: [1, 0.1, 5],
			replay: { type: "action" },
			flip: {
				perspective: [800, 0, 2000],
				duration: [0.5, 0.1, 3],
				bounce: [0.18, 0, 0.6],
				scale: [1.1, 1, 1.5],
			},
		},
		{
			onAction: (action) => {
				if (action === "replay") {
					setFlipped(false);
					setAnimKey((k) => k + 1);
				}
			},
		},
	);

	const flipTransition = {
		type: "spring",
		duration: params.flip.duration,
		bounce: params.flip.bounce,
	} as const;

	return (
		<motion.div
			style={{
				width: 338,
				height: 506,
				perspective: params.flip.perspective,
				cursor: "pointer",
				transformStyle: "preserve-3d",
			}}
			animate={{
				rotateY: flipped ? 180 : 0,
				scale: flipped ? params.flip.scale : 1,
			}}
			transition={{
				rotateY: flipTransition,
				scale: flipTransition,
			}}
			onClick={() => setFlipped((f) => !f)}
		>
			<motion.div
				key={animKey}
				className="w-full h-full"
				style={{
					transformPerspective: params.transformPerspective,
					transformStyle: "preserve-3d",
				}}
				initial={
					reduceMotion || skipEntrance
						? false
						: {
								y: params.y,
								opacity: 0,
								rotateX: params.rotateX,
							}
				}
				animate={{ y: 0, opacity: 1, rotateX: 0 }}
				transition={{
					default: {
						type: "spring",
						duration: params.duration,
						bounce: params.bounce,
					},
				}}
			>
				{/* ── FRONT FACE ── */}
				<div className={FACE} style={{ backfaceVisibility: "hidden" }}>
					<CardOverlay />
					<CardFrame opacity={0.25} />
					<img
						src={movie.poster}
						alt={movie.title}
						className="w-full h-full object-cover [filter:contrast(1.05)_saturate(0.85)_sepia(0.12)]"
					/>
				</div>

				{/* ── BACK FACE ── */}
				<div
					className={`${FACE} flex flex-col`}
					style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
				>
					{/* Rating badge */}
					<div className="absolute top-6 right-6 w-9 h-9 rounded-full border border-[#E6DDD0] flex items-center justify-center font-body font-semibold text-[0.75rem] text-[#E6DDD0] bg-black/50 backdrop-blur-sm z-[35]">
						{movie.rating}
					</div>

					<CardOverlay />
					<CardFrame opacity={0.2} />

					{/* Header image — 35% */}
					<div className="w-full h-[35%] flex-shrink-0 relative">
						<img
							src={movie.backdrop}
							alt="Scene still"
							loading="lazy"
							className="w-full h-full object-cover opacity-75 [filter:sepia(0.15)_contrast(1.05)]"
							style={{
								maskImage:
									"linear-gradient(to bottom, black 50%, transparent 100%)",
								WebkitMaskImage:
									"linear-gradient(to bottom, black 50%, transparent 100%)",
							}}
						/>
					</div>

					{/* Body */}
					<div className="flex-1 flex flex-col gap-3 px-5 pb-6 relative -top-2">
						{/* Title lockup */}
						<div className="border-b border-white/10 pb-2.5 flex flex-col items-center text-center">
							<h2 className="font-serif text-[1.6rem] text-white leading-none mb-1 text-balance">
								{movie.title}
							</h2>
							<div className="flex gap-2 justify-center font-body text-[0.65rem] uppercase tracking-[0.1em] text-white/60 font-normal">
								<span>{movie.year}</span>
								<span>•</span>
								<span>{movie.genre}</span>
								<span>•</span>
								<span>{movie.runtime}</span>
							</div>
						</div>

						{/* Description */}
						<p className="font-body font-light italic text-[0.75rem] leading-[1.5] text-white/75 flex-2">
							{movie.description}
						</p>

						{/* Cast */}
						<div className="grid grid-cols-2 gap-x-2.5 gap-y-1">
							<div className="col-span-2 font-body font-medium text-[0.55rem] uppercase tracking-[0.12em] text-white/35 mb-px">
								Cast
							</div>
							{movie.cast.map((name) => (
								<div
									key={name}
									className="font-body font-light text-[0.68rem] text-[#E6DDD0] border-b border-dashed border-white/10 pb-0.5"
								>
									{name}
								</div>
							))}
						</div>

						{/* Director */}
						<div className="flex justify-start items-baseline gap-1.5">
							<span className="font-body font-medium text-[0.55rem] uppercase tracking-[0.12em] text-white/35">
								Director
							</span>
							<span className="font-serif italic text-[0.8rem] text-[#E6DDD0]">
								{movie.director}
							</span>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

export default Card;
