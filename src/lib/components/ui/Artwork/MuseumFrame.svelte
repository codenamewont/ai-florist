<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { createMuseumFrameSketch } from '$lib/artwork/drawMuseumFrame.js';
	import {
		APERTURE_HEIGHT_PCT,
		APERTURE_LEFT_PCT,
		APERTURE_TOP_PCT,
		APERTURE_WIDTH_PCT,
		ARTWORK_INNER_SCALE,
		OUTER_ASPECT_RATIO
	} from '$lib/artwork/museumFrameGeometry.js';
	import { ARTWORK_FRAME_MAX_W } from '$lib/artwork/artworkSlotLayout.js';
	import { getArtworkSrc } from './artworkVariants.js';

	let {
		/** @type {'bouquet' | 'artwork'} */
		mode = 'artwork',
		/** @type {import('./artworkVariants.js').ArtworkVariant} */
		variant = 'create1',
		imageSrc = null,
		imageAlt = 'Selected bouquet',
		/** bouquet 로딩 플레이스홀더 */
		loading = false
	} = $props();

	const artworkSrc = $derived(getArtworkSrc(variant));

	/** @type {HTMLElement | null} */
	let frameHost = $state(null);
	/** @type {import('p5') | null} */
	let p5Instance = $state(null);

	onMount(() => {
		if (!browser || !frameHost) return;

		let cancelled = false;

		createMuseumFrameSketch(frameHost).then((instance) => {
			if (cancelled) {
				instance.remove();
				return;
			}
			p5Instance = instance;
		});

		return () => {
			cancelled = true;
			p5Instance?.remove();
			p5Instance = null;
		};
	});
</script>

<div class="mx-auto shrink-0 {ARTWORK_FRAME_MAX_W}">
	<div class="relative w-full" style:aspect-ratio={OUTER_ASPECT_RATIO}>
		<!-- 개구부: 꽃다발 또는 아트워크 -->
		<div
			class="absolute z-0 flex items-center justify-center overflow-hidden bg-surface"
			style:left="{APERTURE_LEFT_PCT}%"
			style:top="{APERTURE_TOP_PCT}%"
			style:width="{APERTURE_WIDTH_PCT}%"
			style:height="{APERTURE_HEIGHT_PCT}%"
		>
			{#if mode === 'bouquet'}
				{#if loading}
					<div class="h-full w-full animate-pulse bg-placeholder"></div>
				{:else if imageSrc}
					<img
						src={imageSrc}
						alt={imageAlt}
						class="h-full w-full object-cover object-center"
						draggable="false"
					/>
				{:else}
					<div class="h-full w-full bg-placeholder"></div>
				{/if}
			{:else}
				{#key variant}
					<img
						src={artworkSrc}
						alt=""
						class="h-auto max-h-full w-auto object-contain object-center"
						style:width="{ARTWORK_INNER_SCALE * 100}%"
						draggable="false"
					/>
				{/key}
			{/if}
		</div>

		<!-- p5 액자 링 (고정, 내용과 무관) -->
		<div bind:this={frameHost} class="absolute inset-0 z-10" aria-hidden="true"></div>
	</div>
</div>
