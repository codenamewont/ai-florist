<script>
	import UploadTile from './UploadTile.svelte';

	// One reference image per category, laid out as an interlocking collage
	// (offset seams, varied heights) instead of equal quarters.
	const tiles = [
		{ key: 'color', label: 'Color', aspect: 'aspect-4/5' },
		{ key: 'season', label: 'Season', aspect: 'aspect-4/3' },
		{ key: 'character', label: 'Character', aspect: 'aspect-4/3' },
		{ key: 'location', label: 'Location', aspect: 'aspect-4/5' }
	];
</script>

<div class="moodboard w-full lg:flex-1">
	{#each tiles as tile (tile.key)}
		<UploadTile
			label={tile.label}
			class="{tile.aspect} lg:aspect-auto"
			style="grid-area: {tile.key}"
		/>
	{/each}
</div>

<style>
	.moodboard {
		display: grid;
		gap: 0;
		grid-template-columns: 1fr;
	}

	@media (min-width: 640px) {
		.moodboard {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 1024px) {
		.moodboard {
			grid-template-rows: repeat(5, 1fr);
			grid-template-areas:
				'color     season'
				'color     season'
				'color     location'
				'character location'
				'character location';
			min-height: 34rem;
		}
	}
</style>
