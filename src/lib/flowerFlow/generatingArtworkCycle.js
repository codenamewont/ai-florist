import { GENERATING_ARTWORK_CYCLE } from '$lib/components/ui/Artwork/artworkVariants.js';

const FRAME_MS = 700;

/**
 * generating 페이지 artwork 순환 (create2 → … → generated)
 * @param {(variant: import('$lib/components/ui/Artwork/artworkVariants.js').ArtworkVariant) => void} onVariantChange
 */
export function createGeneratingArtworkCycle(onVariantChange) {
	let frameIndex = 0;
	/** @type {ReturnType<typeof setInterval> | null} */
	let timer = null;
	let disposed = false;

	function emitCurrent() {
		onVariantChange(GENERATING_ARTWORK_CYCLE[frameIndex]);
	}

	function start() {
		stop();
		disposed = false;
		frameIndex = 0;
		emitCurrent();
		timer = setInterval(() => {
			if (disposed) return;
			frameIndex = (frameIndex + 1) % GENERATING_ARTWORK_CYCLE.length;
			emitCurrent();
		}, FRAME_MS);
	}

	function stop() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	function dispose() {
		disposed = true;
		stop();
	}

	return { start, stop, dispose };
}
