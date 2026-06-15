<script>
	import { getArtworkSrc } from './artworkVariants.js';

	/** @type {import('./artworkVariants.js').ArtworkVariant} */
	let { variant = 'create1' } = $props();

	const src = $derived(getArtworkSrc(variant));
</script>

<!-- MuseumFrame artwork 모드에서 크기·위치 제어. 단독 사용 시 fallback. -->
<img
	{src}
	alt=""
	class="mx-auto h-auto w-full object-contain object-center"
	width="328"
	height="443"
/>
