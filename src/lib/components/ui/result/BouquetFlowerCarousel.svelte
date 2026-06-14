<script>
	import BouquetFlowerCard from './BouquetFlowerCard.svelte';

	/** @type {{ id: number, name: string, nameKo: string, wordOfFlower: string, wordOfFlowerKo: string, imageSrc: string, role?: 'main' | 'sub' }[]} */
	let { flowers = [] } = $props();
</script>

{#if flowers.length === 0}
	<p class="text-sm text-muted">Flower details will appear once the bouquet recipe is ready.</p>
{:else}
	<div class="min-h-0 w-full">
		<p class="mb-4 text-xs tracking-[0.2em] text-muted uppercase">Flowers in your bouquet</p>

		<div
			class="flex snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{#each flowers as flower (flower.id)}
				<BouquetFlowerCard
					name={flower.name}
					nameKo={flower.nameKo}
					wordOfFlower={flower.wordOfFlower}
					wordOfFlowerKo={flower.wordOfFlowerKo}
					imageSrc={flower.imageSrc}
					role={flower.role ?? 'main'}
				/>
			{/each}
		</div>
	</div>
{/if}
