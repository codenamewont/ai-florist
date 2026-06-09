<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import Vase from './Vase.svelte';
	import DescriptionCard from './DescriptionCard.svelte';

	let {
		title = 'Title',
		description = 'Description Description Description',
		/** options Continue 이후 확정된 꽃다발만 전달 (그 전에는 null → Vase) */
		imageSrc = null
	} = $props();
</script>

<section
	class="flex w-full shrink-0 flex-col border-b border-line lg:min-h-0 lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!-- mobile: compact row · desktop: centered column -->
	<div
		class="mx-auto flex w-full max-w-100 flex-row items-center gap-12 px-6 py-5 lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:gap-10 lg:px-6 lg:py-12"
	>
		{#if imageSrc}
			<div class="mx-auto w-full max-w-24 shrink-0 overflow-hidden sm:max-w-28 lg:max-w-75">
				<img
					src={imageSrc}
					alt="Selected bouquet"
					class="aspect-[3/4] h-auto w-full object-cover"
				/>
			</div>
		{:else}
			<Vase />
		{/if}
		<DescriptionCard {title} {description} />
	</div>
</section>
