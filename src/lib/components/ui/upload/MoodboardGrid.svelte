<script>
	import { onMount } from 'svelte';
	import UploadTile from './UploadTile.svelte';
	import { hydrateDevUpload } from '$lib/dev/hydrateUpload.js';
	import { getFlowObject, isDevSeeded } from '$lib/flowerFlow/session.js';
	import { readMoodboardFiles, writeMoodboardFiles } from '$lib/flowerFlow/uploadDraft.js';

	let { primaryFile = $bindable(null), uploadedTiles = $bindable() } = $props();

	const cached = readMoodboardFiles();
	let colorFile = $state(cached.color);
	let seasonFile = $state(cached.season);
	let characterFile = $state(cached.character);
	let locationFile = $state(cached.location);

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

	$effect(() => {
		writeMoodboardFiles({
			color: colorFile,
			season: seasonFile,
			character: characterFile,
			location: locationFile
		});
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
			// dev seed 실패 시 캐시/빈 타일 유지
		}
	});
</script>

<div class="moodboard min-h-0 w-full flex-1">
	<UploadTile label="Color" bind:file={colorFile} class="tile tile-color" />
	<UploadTile label="Season" bind:file={seasonFile} class="tile tile-season" />
	<UploadTile label="Character" bind:file={characterFile} class="tile tile-character" />
	<UploadTile label="Location" bind:file={locationFile} class="tile tile-location" />
</div>

<style>
	.moodboard {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
		width: 100%;
		max-width: 32rem;
		height: 100%;
		margin: 0 auto;
		padding: 0.75rem 1.5rem 0;
	}

	.moodboard :global(.tile) {
		min-height: 0;
		height: 100%;
		width: 100%;
	}
</style>
