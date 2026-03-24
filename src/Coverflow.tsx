import { useEffect, useRef, useState } from "react";

interface Album {
	position?: number;
	image_url: string;
	title: string;
	artists: string;
}

interface CoverflowProps {
	dataUrl?: string;
}

// Synthesize a short percussive tick using Web Audio API
function playTick(audioCtx: AudioContext) {
	const now = audioCtx.currentTime;

	// Short noise burst shaped by a bandpass filter
	const bufferSize = audioCtx.sampleRate * 0.012; // 12ms
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

function Coverflow({ dataUrl = "/albums.json" }: CoverflowProps) {
	const [albums, setAlbums] = useState<Album[]>([]);
	const [error, setError] = useState<string | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const activeIndexRef = useRef(-1);
	const audioCtxRef = useRef<AudioContext | null>(null);

	useEffect(() => {
		fetch(dataUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data: Album[]) => {
				setAlbums(data);

				for (const album of data) {
					if (album.image_url) {
						fetch(album.image_url, { mode: "no-cors" }).catch(
							(prefetchError) => {
								console.warn(
									`Error prefetching image ${album.image_url}:`,
									prefetchError,
								);
							},
						);
					}
				}
			})
			.catch((err: Error) => {
				console.error("Error fetching albums:", err);
				setError(err.message);
			});
	}, [dataUrl]);

	// Detect active cover changes on scroll and play tick
	function handleScroll() {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const items = wrapper.querySelectorAll<HTMLLIElement>(".cards li");
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

		if (closestIndex !== activeIndexRef.current) {
			activeIndexRef.current = closestIndex;

			// Lazily create AudioContext on first interaction (browser policy)
			if (!audioCtxRef.current) {
				audioCtxRef.current = new AudioContext();
			}
			const ctx = audioCtxRef.current;
			if (ctx.state === "suspended") {
				ctx.resume();
			}
			playTick(ctx);
		}
	}

	if (error) {
		return <div className="error-message">Error loading albums: {error}</div>;
	}

	if (albums.length === 0) {
		return <div className="loading-message">Loading albums...</div>;
	}

	return (
		<div className="cards-wrapper" ref={wrapperRef} onScroll={handleScroll}>
			<ul className="cards">
				{albums.map((album, index) => (
					<li key={album.position ?? index} className="card">
						<img
							draggable={false}
							src={album.image_url}
							alt={`${album.title} by ${album.artists}`}
							width={600}
							height={600}
						/>
						<img
							className="cover-reflection"
							draggable={false}
							src={album.image_url}
							alt=""
							aria-hidden="true"
							width={600}
							height={600}
						/>
						<div className="cover-info">
							<span className="cover-title">{album.title}</span>
							<span className="cover-artist">{album.artists}</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Coverflow;
