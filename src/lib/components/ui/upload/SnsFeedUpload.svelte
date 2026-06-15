<script>
	import { onMount } from 'svelte';
	import UploadTile from './UploadTile.svelte';
	import { hydrateDevUpload } from '$lib/dev/hydrateUpload.js';
	import { getFlowObject, isDevSeeded } from '$lib/flowerFlow/session.js';
	import { readSnsFile, writeSnsFile } from '$lib/flowerFlow/uploadDraft.js';

	let { primaryFile = $bindable(null), hasImage = $bindable() } = $props();

	let firstFile = $state(readSnsFile());

	$effect(() => {
		const next = firstFile ?? null;
		if (primaryFile !== next) primaryFile = next;
	});

	$effect(() => {
		const next = !!firstFile;
		if (hasImage !== next) hasImage = next;
	});

	$effect(() => {
		writeSnsFile(firstFile);
	});

	onMount(async () => {
		const devUpload = getFlowObject('devUpload');
		if (!isDevSeeded() || !devUpload?.active) return;

		const tiles = devUpload.sns;
		if (!tiles || typeof tiles !== 'object') return;

		try {
			const files = await hydrateDevUpload(/** @type {Record<string, string>} */ (tiles));
			if (files.first) firstFile = files.first;
		} catch {
			// dev seed 실패 시 캐시/빈 타일 유지
		}
	});
</script>

<div class="feed min-h-0 w-full flex-1">
	<UploadTile bind:file={firstFile} class="sns-tile" />
</div>

<style>
	.feed {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0.75rem 1.5rem 0;
	}

	.feed :global(.sns-tile) {
		height: 100%;
		max-height: 100%;
		width: auto;
		max-width: min(20rem, 100%);
		aspect-ratio: 4 / 5;
	}
</style>
