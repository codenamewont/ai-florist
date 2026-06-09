<script>
	import OptionGroup from '$lib/components/ui/create/OptionGroup.svelte';
	import OptionCard from './OptionCard.svelte';

	let { images = {}, loading = false, selectedSize = $bindable(null) } = $props();

	const sizeOptions = ['S', 'M', 'L'];
</script>

<div class="flex min-h-0 flex-1 flex-col justify-center px-6 py-10 md:px-12 lg:px-16 lg:py-12">
	{#if loading}
		<div class="flex flex-1 items-center justify-center">
			<p class="text-sm text-muted">Loading options...</p>
		</div>
	{:else}
		<!-- options-reorganized.png: S/M/L 세로 이미지 가로 3열 -->
		<div class="options-grid mb-10 min-h-0 w-full lg:mb-14">
			{#each sizeOptions as size (size)}
				<OptionCard {size} image={images[size]} bind:selectedSize />
			{/each}
		</div>

		<OptionGroup
			label="Choose the size of the bouquet"
			options={sizeOptions}
			selected={selectedSize}
			onchange={(v) => (selectedSize = v)}
		/>
	{/if}
</div>

<style>
	.options-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		flex: 1;
		min-height: 0;
		align-content: center;
		max-height: min(70vh, 36rem);
	}

	@media (min-width: 1024px) {
		.options-grid {
			gap: 1rem;
			max-height: min(65vh, 40rem);
		}
	}
</style>
