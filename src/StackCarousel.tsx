import { useDialKit } from "dialkit";
import {
	AnimatePresence,
	animate,
	motion,
	type PanInfo,
	useMotionValue,
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

	const d = useDialKit("Resistance", {
		maxStretch: [0.06, 0, 0.2],
		stretchRange: [200, 50, 400],
		dragRotateMax: [8, 0, 20],
		dragRotateRange: [200, 50, 400],
		dragElastic: [0.7, 0, 1],
		releaseBounce: {
			visualDuration: [0.35, 0.1, 0.8],
			bounce: [0.6, 0, 1],
		},
		smoothing: {
			_collapsed: true,
			visualDuration: [0.05, 0.01, 0.3],
			bounce: [0, 0, 1],
		},
		swipe: {
			_collapsed: true,
			velocityThreshold: [300, 50, 800],
			distanceThreshold: [60, 10, 200],
		},
	});

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
	const dragOffset = useMotionValue(0);
	const zeroOffset = useMotionValue(0);
	const smoothOffset = useSpring(dragOffset, {
		visualDuration: d.smoothing.visualDuration,
		bounce: d.smoothing.bounce,
	});

	const dragRotate = useTransform(smoothOffset, (offset) => {
		const atStart = activeIndex === 0 && offset > 0;
		const atEnd = activeIndex === movies.length - 1 && offset < 0;
		if (atStart || atEnd) return 0;
		const clamped = Math.max(
			-d.dragRotateRange,
			Math.min(d.dragRotateRange, offset),
		);
		return (clamped / d.dragRotateRange) * d.dragRotateMax;
	});

	// Boundary resistance: stretch scaleX when dragging in a blocked direction,
	// then bounce back on release proportional to drag distance.
	const stretchX = useMotionValue(1);

	// Always pass a MotionValue (never switch between MotionValue and number).
	const zeroRotate = useTransform(zeroOffset, (v) => v);
	const [lastDraggedIndex, setLastDraggedIndex] = useState(activeIndex);
	const [isDragging, setIsDragging] = useState(false);

	function isAtBoundary(offsetX: number) {
		return (
			(activeIndex === 0 && offsetX > 0) ||
			(activeIndex === movies.length - 1 && offsetX < 0)
		);
	}

	function handleDragStart() {
		setLastDraggedIndex(activeIndex);
		setIsDragging(true);
	}

	function handleDrag(
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) {
		dragOffset.set(info.offset.x);

		if (isAtBoundary(info.offset.x)) {
			const t = Math.min(Math.abs(info.offset.x) / d.stretchRange, 1);
			stretchX.set(1 + t * d.maxStretch);
		} else {
			stretchX.set(1);
		}
	}

	function handleDragEnd(
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	) {
		const swipedLeft =
			info.velocity.x < -d.swipe.velocityThreshold ||
			info.offset.x < -d.swipe.distanceThreshold;
		const swipedRight =
			info.velocity.x > d.swipe.velocityThreshold ||
			info.offset.x > d.swipe.distanceThreshold;

		dragOffset.set(0);
		setIsDragging(false);

		if (isAtBoundary(info.offset.x)) {
			const t = Math.min(Math.abs(info.offset.x) / d.stretchRange, 1);
			animate(stretchX, 1, {
				type: "spring",
				visualDuration: d.releaseBounce.visualDuration,
				bounce: d.releaseBounce.bounce * t,
			});
		} else {
			stretchX.set(1);
			if (swipedLeft && activeIndex < movies.length - 1) {
				setActiveIndex((i) => i + 1);
			} else if (swipedRight && activeIndex > 0) {
				setActiveIndex((i) => i - 1);
			}
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
		<div className="relative flex items-center justify-center w-full h-screen bg-[#050505]">
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
							className={`aspect-2/3 absolute w-8/12 ${isActive ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "pointer-events-none"}`}
							style={{
								zIndex: level.zIndex,
								transformStyle: "preserve-3d",
								willChange: "transform",
								rotate:
									cardIndex === lastDraggedIndex ? dragRotate : zeroRotate,
								scaleX: isActive ? stretchX : 1,
							}}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={{
								left: activeIndex < movies.length - 1 ? d.dragElastic : 0.05,
								right: activeIndex > 0 ? d.dragElastic : 0.05,
							}}
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
							transition={
								reduceMotion
									? { duration: 0 }
									: cardIndex === lastDraggedIndex
										? cardSpring
										: { ...cardSpring, delay: 0.1 }
							}
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
