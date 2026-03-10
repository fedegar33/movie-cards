import { useDialKit } from "dialkit";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useState } from "react";

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
}

const FACE =
	"absolute inset-0 rounded-[14px] overflow-hidden bg-[#0F0F0F] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]";

export function CardFrame({ opacity }: { opacity: number }) {
	const border = `1px solid rgba(255,255,255,${opacity})`;
	return (
		<div className="absolute inset-3.5 pointer-events-none z-10">
			<div className="absolute inset-0 rounded-md" style={{ border }} />
			<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
			<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
		</div>
	);
}

function Card({ front, back }: { front?: ReactNode; back?: ReactNode }) {
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

	const entranceTransition = {
		default: {
			type: "spring",
			duration: params.duration,
			bounce: params.bounce,
		},
	} as const;

	return (
		<motion.div
			className="cursor-pointer"
			style={{
				width: 338,
				height: 506,
				perspective: params.flip.perspective,
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
					reduceMotion
						? false
						: { y: params.y, opacity: 0, rotateX: params.rotateX }
				}
				animate={{ y: 0, opacity: 1, rotateX: 0 }}
				transition={entranceTransition}
			>
				{/* ── FRONT FACE ── */}
				<div className={FACE} style={{ backfaceVisibility: "hidden" }}>
					{front}
				</div>

				{/* ── BACK FACE ── */}
				<div
					className={`${FACE} flex flex-col`}
					style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
				>
					{back}
				</div>
			</motion.div>
		</motion.div>
	);
}

export default Card;
