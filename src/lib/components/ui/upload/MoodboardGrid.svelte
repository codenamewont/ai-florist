<script>
	import UploadTile from './UploadTile.svelte';

	let { primaryFile = $bindable(null) } = $props();

	let colorFile = $state(null);
	let seasonFile = $state(null);
	let characterFile = $state(null);
	let locationFile = $state(null);

	$effect(() => {
		primaryFile = colorFile ?? seasonFile ?? characterFile ?? locationFile ?? null;
	});

	const tiles = [
		{
			key: 'color',
			label: 'Color',
			aspect: 'aspect-4/5',
			bindFile: () => colorFile,
			setFile: (v) => (colorFile = v)
		},
		{
			key: 'season',
			label: 'Season',
			aspect: 'aspect-4/3',
			bindFile: () => seasonFile,
			setFile: (v) => (seasonFile = v)
		},
		{
			key: 'character',
			label: 'Character',
			aspect: 'aspect-4/3',
			bindFile: () => characterFile,
			setFile: (v) => (characterFile = v)
		},
		{
			key: 'location',
			label: 'Location',
			aspect: 'aspect-4/5',
			bindFile: () => locationFile,
			setFile: (v) => (locationFile = v)
		}
	];
</script>

<div class="moodboard min-h-0 w-full flex-1">
	<UploadTile
		label="Color"
		bind:file={colorFile}
		class="tile tile-color aspect-4/5 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
	<UploadTile
		label="Season"
		bind:file={seasonFile}
		class="tile tile-season aspect-4/3 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
	<UploadTile
		label="Character"
		bind:file={characterFile}
		class="tile tile-character aspect-4/3 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
	<UploadTile
		label="Location"
		bind:file={locationFile}
		class="tile tile-location aspect-4/5 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
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
