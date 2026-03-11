import {
	AnimatePresence,
	motion,
	type PanInfo,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { type Movie, MovieCard } from "./MovieCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StackCarouselProps {
	movies: Movie[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const adjacent = { scale: 0.8, translateX: 25, opacity: 1, zIndex: 2 };
const far = { scale: 0.6, translateX: 50, opacity: 1, zIndex: 1 };
const enter = { scale: 0.5, translateX: 20, opacity: 0 };
const exit = { translateX: 20, opacity: 0 };

const spring = { visualDuration: 0.4, bounce: 0.25 };
const enterExitSpringConfig = { visualDuration: 0.3, bounce: 0.1 };

// ─── Component ────────────────────────────────────────────────────────────────

export function StackCarousel({ movies }: StackCarouselProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const reduceMotion = useReducedMotion();

	const cardSpring = {
		type: "spring",
		visualDuration: spring.visualDuration,
		bounce: spring.bounce,
	} as const;

	const enterExitSpring = reduceMotion
		? ({ duration: 0 } as const)
		: ({
				type: "spring",
				visualDuration: enterExitSpringConfig.visualDuration,
				bounce: enterExitSpringConfig.bounce,
			} as const);

	// ── Swipe gesture ────────────────────────────────────────────────────────
	// Track drag offset separately — only used to derive rotation tilt.
	// We do NOT pass this as style.x because that would override animate.x
	// and prevent Framer Motion from positioning cards correctly.
	const dragOffset = useMotionValue(0);
	const zeroOffset = useMotionValue(0);
	const smoothOffset = useSpring(dragOffset, {
		visualDuration: 0.05,
		bounce: 0,
	});

	const dragRotate = useTransform(smoothOffset, [-200, 0, 200], [-8, 0, 8]);
	// Always pass a MotionValue (never switch between MotionValue and number).
	const zeroRotate = useTransform(zeroOffset, (v) => v);
	// Track which card was last dragged so it keeps dragRotate while the spring settles,
	// even after activeIndex changes and it's no longer the active card.
	const [lastDraggedIndex, setLastDraggedIndex] = useState(activeIndex);
	const [isDragging, setIsDragging] = useState(false);

	const VELOCITY_THRESHOLD = 300; // px/s
	const DISTANCE_THRESHOLD = 60; // px

	function handleDragStart() {
		setLastDraggedIndex(activeIndex);
		setIsDragging(true);
	}

	function handleDrag(
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) {
		dragOffset.set(info.offset.x);
	}

	function handleDragEnd(
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) {
		const swipedLeft =
			info.velocity.x < -VELOCITY_THRESHOLD ||
			info.offset.x < -DISTANCE_THRESHOLD;
		const swipedRight =
			info.velocity.x > VELOCITY_THRESHOLD ||
			info.offset.x > DISTANCE_THRESHOLD;

		dragOffset.set(0);
		setIsDragging(false);

		if (swipedLeft && activeIndex < movies.length - 1) {
			setActiveIndex((i) => i + 1);
		} else if (swipedRight && activeIndex > 0) {
			setActiveIndex((i) => i - 1);
		}
	}

	// Active card is always centered at full size — no dials needed.
	const activeLevel = { scale: 1, translateX: 0, opacity: 1, zIndex: 3 };

	// translateX is the magnitude — sign is applied based on position direction.
	const distanceLevels = [activeLevel, adjacent, far];
	const MAX_DISTANCE = distanceLevels.length - 1;

	const cardVariants = {
		initial: ({ direction, restX }: { direction: number; restX: number }) => ({
			scale: enter.scale,
			x: `${restX + direction * enter.translateX}%`,
			opacity: enter.opacity,
			transition: enterExitSpring,
		}),
		exit: ({ direction, restX }: { direction: number; restX: number }) => ({
			x: `${restX + direction * exit.translateX}%`,
			opacity: exit.opacity,
			zIndex: 0,
			transition: enterExitSpring,
		}),
	};

	// Track which cards were visible last render to avoid re-entrance animations
	// on cards that are just repositioning after a remount.
	const prevVisibleIds = useRef<Set<string>>(new Set());
	const visibleIds = new Set<string>();

	const content = (
		<div className="relative flex items-center justify-center w-full h-screen bg-neutral-950">
			<AnimatePresence>
				{movies.map((movie, cardIndex) => {
					const position = cardIndex - activeIndex;
					const distance = Math.abs(position);

					if (distance > MAX_DISTANCE) return null;

					visibleIds.add(movie.poster);

					const level = distanceLevels[distance];
					const translateX =
						position >= 0 ? level.translateX : -level.translateX;
					const translateXPct = `${translateX}%`;
					const exitDirection = position >= 0 ? 1 : -1;
					const isNew = !prevVisibleIds.current.has(movie.poster);
					const isActive = distance === 0;

					return (
						<motion.div
							key={movie.poster}
							custom={{ direction: exitDirection, restX: translateX }}
							variants={cardVariants}
							className={`aspect-2/3 absolute w-3/5 ${isActive ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "pointer-events-none"}`}
							style={{
								zIndex: level.zIndex,
								transformStyle: "preserve-3d",
								rotate:
									cardIndex === lastDraggedIndex ? dragRotate : zeroRotate,
							}}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={0.7}
							onDragStart={isActive ? handleDragStart : undefined}
							onDrag={isActive ? handleDrag : undefined}
							onDragEnd={isActive ? handleDragEnd : undefined}
							initial={isNew ? "initial" : false}
							animate={{
								scale: level.scale,
								x: translateXPct,
								opacity: level.opacity,
							}}
							exit="exit"
							transition={reduceMotion ? { duration: 0 } : cardSpring}
						>
							<MovieCard movie={movie} isActive={isActive} />
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);

	prevVisibleIds.current = visibleIds;

	return content;
}
