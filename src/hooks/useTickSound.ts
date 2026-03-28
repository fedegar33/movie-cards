import { useRef } from "react";

function playTick(audioCtx: AudioContext) {
	const now = audioCtx.currentTime;

	const bufferSize = audioCtx.sampleRate * 0.012;
	const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < bufferSize; i++) {
		data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
	}

	const source = audioCtx.createBufferSource();
	source.buffer = buffer;

	const filter = audioCtx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = 4000;
	filter.Q.value = 3;

	const gain = audioCtx.createGain();
	gain.gain.setValueAtTime(0.25, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

	source.connect(filter).connect(gain).connect(audioCtx.destination);
	source.start(now);
	source.stop(now + 0.015);
}

export function useTickSound() {
	const audioCtxRef = useRef<AudioContext | null>(null);

	return function tick() {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext();
		}
		const ctx = audioCtxRef.current;
		if (ctx.state === "suspended") {
			ctx.resume();
		}
		playTick(ctx);
	};
}
