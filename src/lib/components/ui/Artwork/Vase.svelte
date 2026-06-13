<script>
	import { getArtworkSrc } from './artworkVariants.js';

	/** @type {import('./artworkVariants.js').ArtworkVariant} */
	let { variant = 'create1' } = $props();

	const src = $derived(getArtworkSrc(variant));
</script>

<img
	{src}
	alt=""
	class="mx-auto h-auto w-full max-w-24 shrink-0 sm:max-w-28 lg:max-w-75"
	width="328"
	height="443"
/>
