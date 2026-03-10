import {
	AnimatePresence,
	motion,
	type PanInfo,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarouselItem {
	id: string;
	imageUrl: string;
	title: string;
}

interface StackCarouselProps {
	items: CarouselItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const adjacent = { scale: 0.8, translateX: 70, opacity: 1, zIndex: 2 };
const far = { scale: 0.6, translateX: 140, opacity: 1, zIndex: 1 };
const enter = { scale: 0.5, translateX: 50, opacity: 0 };
const exit = { translateX: 50, opacity: 0 };

const spring = { visualDuration: 0.4, bounce: 0.25 };
const enterExitSpringConfig = { visualDuration: 0.3, bounce: 0.1 };

// ─── Component ────────────────────────────────────────────────────────────────

export function StackCarousel({ items }: StackCarouselProps) {
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

	const VELOCITY_THRESHOLD = 300; // px/s
	const DISTANCE_THRESHOLD = 60; // px

	function handleDragStart() {
		setLastDraggedIndex(activeIndex);
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

		if (swipedLeft && activeIndex < items.length - 1) {
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
			x: restX + direction * enter.translateX,
			opacity: enter.opacity,
			transition: enterExitSpring,
		}),
		exit: ({ direction, restX }: { direction: number; restX: number }) => ({
			x: restX + direction * exit.translateX,
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
			{/* Accessible fallback nav buttons — primary navigation is swipe */}
			<button
				type="button"
				aria-label="Previous card"
				onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
				className="absolute bottom-8 left-8 z-50 px-4 py-2 rounded-full bg-white/20 text-white text-sm"
			>
				prev
			</button>
			<button
				type="button"
				aria-label="Next card"
				onClick={() => setActiveIndex((i) => Math.min(items.length - 1, i + 1))}
				className="absolute bottom-8 right-8 z-50 px-4 py-2 rounded-full bg-white/20 text-white text-sm"
			>
				next
			</button>
			<AnimatePresence>
				{items.map((item, cardIndex) => {
					const position = cardIndex - activeIndex;
					const distance = Math.abs(position);

					if (distance > MAX_DISTANCE) return null;

					visibleIds.add(item.id);

					const level = distanceLevels[distance];
					const translateX =
						position >= 0 ? level.translateX : -level.translateX;
					const exitDirection = position >= 0 ? 1 : -1;
					const isNew = !prevVisibleIds.current.has(item.id);
					const isActive = distance === 0;

					return (
						<motion.div
							key={item.id}
							custom={{ direction: exitDirection, restX: translateX }}
							variants={cardVariants}
							className="aspect-2/3 absolute w-64 rounded-2xl overflow-hidden shadow-2xl"
							style={{
								zIndex: level.zIndex,
								rotate:
									cardIndex === lastDraggedIndex ? dragRotate : zeroRotate,
							}}
							drag={isActive ? "x" : false}
							dragConstraints={{ left: 0, right: 0 }}
							dragElastic={0.7}
							onDragStart={isActive ? handleDragStart : undefined}
							onDrag={isActive ? handleDrag : undefined}
							onDragEnd={isActive ? handleDragEnd : undefined}
							initial={isNew ? "initial" : false}
							animate={{
								scale: level.scale,
								x: translateX,
								opacity: level.opacity,
							}}
							exit="exit"
							transition={reduceMotion ? { duration: 0 } : cardSpring}
						>
							<img
								src={item.imageUrl}
								alt={item.title}
								className="w-full h-full object-cover"
								draggable={false}
							/>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);

	prevVisibleIds.current = visibleIds;

	return content;
}
