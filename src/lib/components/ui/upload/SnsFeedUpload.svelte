<script>
	import UploadTile from './UploadTile.svelte';

	// Two SNS feed screenshots. On desktop they fill the panel edge-to-edge in
	// a staggered composition (one raised on the right, one dropped on the
	// left); below that they fall back to a simple side-by-side / stacked grid.
</script>

<div class="feed w-full lg:flex-1">
	<UploadTile class="aspect-4/5 lg:aspect-auto" style="grid-area: one" />
	<UploadTile class="aspect-4/5 lg:aspect-auto" style="grid-area: two" />
</div>

<style>
	.feed {
		display: grid;
		gap: 0;
		grid-template-columns: 1fr;
	}

	@media (min-width: 640px) {
		.feed {
			grid-template-columns: 1fr 1fr;
		}
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
	}
</style>
