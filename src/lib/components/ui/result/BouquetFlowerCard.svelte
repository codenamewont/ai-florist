<script>
	import flowerIconUrl from '$lib/assets/flower.svg';

	let { name, wordOfFlower, imageSrc, role = 'main' } = $props();

	const roleLabel = $derived(role === 'main' ? 'Main' : 'Sub');
</script>

<article
	class="flex w-40 shrink-0 snap-start flex-col rounded-2xl border border-line-strong bg-white shadow-sm"
>
	<div class="flex items-center gap-1.5 px-3 pt-3">
		<img src={flowerIconUrl} alt="" class="size-3.5 shrink-0" aria-hidden="true" />
		<span class="text-xs leading-none text-ink">{roleLabel}</span>
	</div>

	<div class="relative mt-2 aspect-[3/4] w-full px-2">
		<img
			src={imageSrc}
			alt={name}
			class="h-full w-full object-contain object-bottom"
			loading="lazy"
		/>
	</div>

	<h3 class="px-3 pt-2 text-center text-base leading-none tracking-wide text-ink">{name}</h3>

	<div class="px-3 py-2">
		<p class="text-center text-[0.6875rem] leading-snug text-ink">{wordOfFlower}</p>
	</div>
</article>
