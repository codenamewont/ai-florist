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

<div class="moodboard w-full min-h-0 flex-1">
	{#each tiles as tile (tile.key)}
		<UploadTile
			label={tile.label}
			class="tile tile-{tile.key} h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto {tile.aspect}"
		/>
	{/each}
</div>

<style>
	.moodboard {
		display: grid;
		gap: 0;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		width: 100%;
		flex: 1;
		min-height: 0;
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

		:global(.tile-color) {
			grid-area: color;
		}

		:global(.tile-season) {
			grid-area: season;
		}

		:global(.tile-character) {
			grid-area: character;
		}

		:global(.tile-location) {
			grid-area: location;
		}
	}
</style>
