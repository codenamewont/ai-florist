<script>
	import UploadTile from './UploadTile.svelte';

	let { primaryFile = $bindable(null) } = $props();

	let firstFile = $state(null);
	let secondFile = $state(null);

	$effect(() => {
		primaryFile = firstFile ?? secondFile ?? null;
	});
</script>

<div class="feed min-h-0 w-full flex-1">
	<UploadTile
		bind:file={firstFile}
		class="tile-one aspect-4/5 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
	<UploadTile
		bind:file={secondFile}
		class="tile-two aspect-4/5 h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto"
	/>
</div>

<style>
	.feed {
		display: grid;
		gap: 0;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		width: 100%;
		flex: 1;
		min-height: 0;
	}

	@media (min-width: 1024px) {
		.feed {
			grid-template-rows: repeat(5, 1fr);
			grid-template-areas:
				'.   two'
				'one two'
				'one two'
				'one two'
				'one .';
			min-height: 34rem;
		}

		:global(.tile-one) {
			grid-area: one;
		}

		:global(.tile-two) {
			grid-area: two;
		}
	}
</style>
