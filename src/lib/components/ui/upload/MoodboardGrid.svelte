<script>
	import { onMount } from 'svelte';
	import UploadTile from './UploadTile.svelte';
	import { hydrateDevUpload } from '$lib/dev/hydrateUpload.js';
	import { getFlowObject, isDevSeeded } from '$lib/flowerFlow/session.js';

	let {
		primaryFile = $bindable(null),
		uploadedTiles = $bindable(),
		caption = 'build their moodboard!'
	} = $props();

	let colorFile = $state(null);
	let seasonFile = $state(null);
	let characterFile = $state(null);
	let locationFile = $state(null);

	$effect(() => {
		const next = colorFile ?? seasonFile ?? characterFile ?? locationFile ?? null;
		if (primaryFile !== next) primaryFile = next;
	});

	$effect(() => {
		const next = {
			color: !!colorFile,
			season: !!seasonFile,
			character: !!characterFile,
			location: !!locationFile
		};

		if (
			uploadedTiles?.color !== next.color ||
			uploadedTiles?.season !== next.season ||
			uploadedTiles?.character !== next.character ||
			uploadedTiles?.location !== next.location
		) {
			uploadedTiles = next;
		}
	});

	onMount(async () => {
		const devUpload = getFlowObject('devUpload');
		if (!isDevSeeded() || !devUpload?.active) return;

		const tiles = devUpload.moodboard;
		if (!tiles || typeof tiles !== 'object') return;

		try {
			const files = await hydrateDevUpload(/** @type {Record<string, string>} */ (tiles));
			if (files.color) colorFile = files.color;
			if (files.season) seasonFile = files.season;
			if (files.character) characterFile = files.character;
			if (files.location) locationFile = files.location;
		} catch {
			// dev seed 실패 시 빈 타일 유지
		}
	});
</script>

<div class="moodboard min-h-0 w-full flex-1">
	<div class="collage">
		<span class="mood-number number-color">(01)</span>
		<span class="mood-number number-season">(02)</span>
		<span class="mood-number number-character">(03)</span>
		<span class="mood-number number-location">(04)</span>
		<span class="mood-caption">{caption}</span>

		<UploadTile
			label="Color"
			bind:file={colorFile}
			class="moodboard-tile tile-color"
		/>
		<UploadTile
			label="Season"
			bind:file={seasonFile}
			class="moodboard-tile tile-season"
		/>
		<UploadTile
			label="Character"
			bind:file={characterFile}
			class="moodboard-tile tile-character"
		/>
		<UploadTile
			label="Location"
			bind:file={locationFile}
			class="moodboard-tile tile-location"
		/>
	</div>
</div>

<style>
	.moodboard {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 0.5rem 1.5rem 1rem;
	}

	.collage {
		position: relative;
		width: min(100%, 34rem);
		height: 100%;
		aspect-ratio: 4 / 5.2;
		max-height: 44rem;
	}

	.moodboard :global(.moodboard-tile) {
		position: absolute;
		background: #fff;
		box-shadow: 0 10px 24px rgb(56 50 47 / 0.08);
	}

	/* 01 — top-left portrait */
	:global(.tile-color) {
		top: 8%;
		left: 4%;
		width: 30%;
		aspect-ratio: 3 / 4;
	}

	/* 02 — right portrait, dips below the top of 01 */
	:global(.tile-season) {
		top: 13%;
		right: 3%;
		width: 29%;
		aspect-ratio: 3 / 4;
	}

	/* 03 — landscape, lower-left */
	:global(.tile-character) {
		top: 49%;
		left: 10%;
		width: 36%;
		aspect-ratio: 4 / 3;
	}

	/* 04 — bottom-right portrait */
	:global(.tile-location) {
		top: 62%;
		right: 4%;
		width: 29%;
		aspect-ratio: 3 / 4;
	}

	.mood-number,
	.mood-caption {
		position: absolute;
		z-index: 2;
		pointer-events: none;
		color: var(--color-ink);
	}

	.mood-number {
		font-size: clamp(1rem, 2.2vw, 1.5rem);
		line-height: 1;
	}

	.number-color {
		top: 13%;
		left: 35%;
	}

	.number-season {
		top: 38%;
		left: 60%;
	}

	.number-character {
		top: 73%;
		left: 9%;
	}

	.number-location {
		top: 58%;
		right: 11%;
	}

	.mood-caption {
		left: 50%;
		top: 84%;
		font-size: clamp(0.85rem, 1.7vw, 1.1rem);
		transform: translateX(-50%);
		white-space: nowrap;
	}

	@media (max-width: 767px) {
		.moodboard {
			align-items: flex-start;
			padding: 0.75rem 1rem 5.5rem;
		}

		.collage {
			display: grid;
			width: 100%;
			aspect-ratio: auto;
			min-height: 0;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1.25rem;
		}

		.moodboard :global(.moodboard-tile) {
			position: relative;
			inset: auto;
			width: 100%;
			height: auto;
		}

		:global(.tile-color),
		:global(.tile-season),
		:global(.tile-location) {
			aspect-ratio: 3 / 4;
		}

		:global(.tile-character) {
			aspect-ratio: 4 / 3;
		}

		.mood-number,
		.mood-caption {
			display: none;
		}
	}
</style>
