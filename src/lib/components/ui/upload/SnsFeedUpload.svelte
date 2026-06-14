<script>
	import { onMount } from 'svelte';
	import UploadTile from './UploadTile.svelte';
	import { hydrateDevUpload } from '$lib/dev/hydrateUpload.js';
	import { getFlowObject, isDevSeeded } from '$lib/flowerFlow/session.js';

	let { primaryFile = $bindable(null), hasImage = $bindable(), caption = 'upload their feed!' } =
		$props();

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
	<div class="sns-collage">
		<span class="sns-number">(01)</span>
		<span class="sns-caption">{caption}</span>

		<UploadTile bind:file={firstFile} class="sns-tile" />
	</div>
</div>

<style>
	.feed {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 0.5rem 1.5rem 1rem;
	}

	.sns-collage {
		position: relative;
		width: min(100%, 42rem);
		height: 100%;
		aspect-ratio: 4 / 5;
		max-height: 34rem;
	}

	.feed :global(.sns-tile) {
		position: absolute;
		top: 12%;
		left: 50%;
		width: 58%;
		height: 46%;
		background: #fff;
		box-shadow: 0 10px 24px rgb(56 50 47 / 0.08);
		transform: translateX(-50%);
	}

	.sns-number,
	.sns-caption {
		position: absolute;
		z-index: 2;
		pointer-events: none;
		color: var(--color-ink);
	}

	.sns-number {
		top: 6%;
		left: 23%;
		font-size: clamp(1rem, 2.2vw, 1.5rem);
		line-height: 1;
	}

	.sns-caption {
		left: 50%;
		bottom: 13%;
		font-size: clamp(0.9rem, 1.9vw, 1.25rem);
		transform: translateX(-50%);
		white-space: nowrap;
	}

	@media (max-width: 767px) {
		.feed {
			align-items: flex-start;
			padding: 0.75rem 1rem 5.5rem;
		}

		.sns-collage {
			width: 100%;
			aspect-ratio: auto;
			min-height: 0;
		}

		.feed :global(.sns-tile) {
			position: relative;
			inset: auto;
			width: 100%;
			height: auto;
			aspect-ratio: 4 / 5;
			transform: none;
		}

		.sns-number,
		.sns-caption {
			display: none;
		}
	}
</style>
