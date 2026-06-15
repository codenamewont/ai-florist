<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import Vase from './Vase.svelte';
	import DescriptionCard from './DescriptionCard.svelte';
	import ComingSoonTape from './ComingSoonTape.svelte';

	let {
		title = 'Title',
		description = 'Description Description Description',
		/** @type {'instruction' | 'summary'} */
		cardMode = 'summary',
		/** @type {import('./artworkVariants.js').ArtworkVariant} */
		variant = 'create1',
		/** edit Continue 이후 확정된 꽃다발만 전달 (그 전에는 null → Vase) */
		imageSrc = null,
		/** generating 단계: 작품 중앙 Coming Soon 밴드 */
		comingSoon = false
	} = $props();
</script>

<section
	class="relative flex w-full shrink-0 flex-col border-b border-line lg:min-h-0 lg:h-full lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!--
		mobile: row · desktop: 꽃 슬롯 높이 고정 → 설명 카드 길이와 무관하게 Y·크기 유지
	-->
	<div
		class="mx-auto flex min-h-0 w-full max-w-100 flex-1 flex-row items-start gap-8 px-6 pt-6 pb-8 lg:flex-col lg:items-center lg:justify-start lg:gap-4 lg:px-6 lg:pb-12 lg:pt-[calc(50%-5rem)]"
	>
		<div
			class="flex h-[11rem] shrink-0 items-end justify-center sm:h-[13rem] lg:h-[min(24rem,36vh)] lg:w-full"
		>
			{#if imageSrc}
				<div class="mx-auto w-full max-w-24 shrink-0 overflow-hidden sm:max-w-28 lg:max-w-75">
					<img
						src={imageSrc}
						alt="Selected bouquet"
						class="aspect-[3/4] h-auto w-full object-contain object-center"
					/>
				</div>
			{:else}
				<Vase {variant} />
			{/if}
		</div>

		<div class="min-w-0 shrink-0 lg:w-full lg:flex lg:justify-center">
			<DescriptionCard {title} {description} mode={cardMode} />
		</div>
	</div>
	{#if comingSoon}
		<ComingSoonTape />
	{/if}
</section>
