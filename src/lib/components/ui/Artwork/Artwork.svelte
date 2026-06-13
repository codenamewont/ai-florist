<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import Vase from './Vase.svelte';
	import DescriptionCard from './DescriptionCard.svelte';
	import ComingSoonTape from './ComingSoonTape.svelte';

	let {
		title = 'Title',
		description = 'Description Description Description',
		/** @type {import('./artworkVariants.js').ArtworkVariant} */
		variant = 'create1',
		/** options Continue 이후 확정된 꽃다발만 전달 (그 전에는 null → Vase) */
		imageSrc = null,
		/** generating 단계: 작품 중앙 Coming Soon 밴드 */
		comingSoon = false
	} = $props();
</script>

<section
	class="relative flex w-full shrink-0 flex-col border-b border-line lg:min-h-0 lg:h-full lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!--
		lg: pt로 꽃 시작 Y만 고정(카드 길이와 무관). gap 아래에 카드 auto 높이.
		세로 위치 조정: lg:pt-[calc(50%-10rem)] 의 10rem (줄이면 아래로, 늘리면 위로).
	-->
	<div
		class="mx-auto flex min-h-0 w-full max-w-100 flex-1 flex-col items-center gap-4 px-6 py-5 lg:justify-start lg:gap-6 lg:px-6 lg:pb-8 lg:pt-[calc(50%-6rem)]"
	>
		<div class="flex shrink-0 items-center justify-center">
			{#if imageSrc}
				<div class="mx-auto w-full max-w-24 shrink-0 overflow-hidden sm:max-w-28 lg:max-w-75">
					<img
						src={imageSrc}
						alt="Selected bouquet"
						class="aspect-[3/4] h-auto w-full object-cover"
					/>
				</div>
			{:else}
				<Vase {variant} />
			{/if}
		</div>

		<div class="flex w-full shrink-0 justify-center">
			<div class="mx-auto w-full max-w-[13.5rem] lg:w-54">
				<DescriptionCard {title} {description} />
			</div>
		</div>
	</div>
	{#if comingSoon}
		<ComingSoonTape />
	{/if}
</section>
