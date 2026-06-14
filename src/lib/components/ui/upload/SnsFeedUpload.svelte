<script>
	import { onMount } from 'svelte';
	import UploadTile from './UploadTile.svelte';
	import { hydrateDevUpload } from '$lib/dev/hydrateUpload.js';
	import { getFlowObject, isDevSeeded } from '$lib/flowerFlow/session.js';

	let { primaryFile = $bindable(null), hasImage = $bindable() } = $props();

	let firstFile = $state(null);

	$effect(() => {
		const next = firstFile ?? null;
		if (primaryFile !== next) primaryFile = next;
	});

	$effect(() => {
		const next = !!firstFile;
		if (hasImage !== next) hasImage = next;
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
			// dev seed 실패 시 빈 타일 유지
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
		padding: 0.75rem 1.5rem 1rem;
		overflow-y: auto;
	}

	.feed :global(.sns-tile) {
		width: 100%;
		max-width: 20rem;
		aspect-ratio: 4 / 5;
	}
</style>
