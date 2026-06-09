<script>
	import { toDataUrl } from '$lib/flowerFlow/api.js';

	let {
		size,
		image = null,
		selectedSize = $bindable(null)
	} = $props();

	const selected = $derived(selectedSize === size);
	const dimmed = $derived(selectedSize !== null && selectedSize !== size);

	function handleClick() {
		selectedSize = size;
	}
</script>

<!-- 세로(4:5) 꽃다발 미리보기 — 클릭 시 해당 사이즈 선택 -->
<button
	type="button"
	onclick={handleClick}
	aria-pressed={selected}
	aria-label="Select size {size}"
	class={[
		'relative min-h-0 w-full cursor-pointer overflow-hidden bg-track text-left transition-all duration-300',
		selected ? 'scale-[1.02] opacity-100 ring-2 ring-pill ring-inset' : '',
		dimmed ? 'opacity-25' : 'opacity-100',
		!dimmed && !selected ? 'hover:opacity-90' : ''
	]}
>
	<div class="aspect-4/5 w-full">
		{#if image}
			<img
				src={toDataUrl(image)}
				alt="Bouquet option {size}"
				class="pointer-events-none h-full w-full object-cover"
			/>
		{/if}
	</div>
</button>
