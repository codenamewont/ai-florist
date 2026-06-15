<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import DescriptionCard from './DescriptionCard.svelte';
	import ComingSoonTape from './ComingSoonTape.svelte';
	import MuseumFrame from './MuseumFrame.svelte';
	import { downloadGeneratedImage } from '$lib/flowerFlow/downloadGeneratedImage.js';
	import {
		ARTWORK_SLOT_FLOWER,
		ARTWORK_SLOT_WRAPPER,
		ARTWORK_SLOT_CARD
	} from '$lib/artwork/artworkSlotLayout.js';

	let {
		title = 'Title',
		description = 'Description Description Description',
		/** @type {'instruction' | 'summary'} */
		cardMode = 'summary',
		/** @type {import('./artworkVariants.js').ArtworkVariant} */
		variant = 'create1',
		/** edit Continue 이후 확정된 꽃다발만 전달 (그 전에는 null → Vase) */
		imageSrc = null,
		/** result/map: raw image payload for download */
		downloadImage = null,
		/** generating 단계: 작품 중앙 Coming Soon 밴드 */
		comingSoon = false
	} = $props();

	let downloading = $state(false);
	let downloadError = $state('');

	const frameMode = $derived(imageSrc ? 'bouquet' : 'artwork');

	async function handleDownload() {
		if (!downloadImage || downloading) return;

		downloading = true;
		downloadError = '';

		try {
			await downloadGeneratedImage(downloadImage, title);
		} catch (err) {
			downloadError = err instanceof Error ? err.message : 'Download failed';
		} finally {
			downloading = false;
		}
	}
</script>

<section
	class="relative flex w-full shrink-0 flex-col border-b border-line lg:h-full lg:min-h-0 lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!--
		mobile: row · desktop: 꽃 슬롯 높이 고정 → 설명 카드 길이와 무관하게 Y·크기 유지
	-->
	<div class={ARTWORK_SLOT_WRAPPER}>
		<div class={ARTWORK_SLOT_FLOWER}>
			<div class="mx-auto flex w-full flex-col items-center">
				<MuseumFrame mode={frameMode} {variant} {imageSrc} imageAlt="Selected bouquet" />
				{#if imageSrc && downloadImage}
					<button
						type="button"
						disabled={downloading}
						onclick={handleDownload}
						class="mt-2 text-xs text-muted underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
					>
						{downloading ? 'Downloading...' : 'Download image'}
					</button>
					{#if downloadError}
						<p class="mt-1 text-center text-[0.65rem] text-red-600">{downloadError}</p>
					{/if}
				{/if}
			</div>
		</div>

		<div class={ARTWORK_SLOT_CARD}>
			<DescriptionCard {title} {description} mode={cardMode} />
		</div>
	</div>
	{#if comingSoon}
		<ComingSoonTape />
	{/if}
</section>
