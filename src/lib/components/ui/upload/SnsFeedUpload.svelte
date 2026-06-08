<script>
	import UploadTile from './UploadTile.svelte';

	// Two SNS feed screenshots. On desktop they fill the panel edge-to-edge in
	// a staggered composition (one raised on the right, one dropped on the
	// left); below that they fall back to a simple side-by-side / stacked grid.
</script>

<div class="feed w-full min-h-0 flex-1">
	<UploadTile class="tile-one h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto aspect-4/5" />
	<UploadTile class="tile-two h-full min-h-0 w-full max-lg:aspect-auto lg:aspect-auto aspect-4/5" />
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
