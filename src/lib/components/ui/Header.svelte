<script>
	// `step` is 1-based; the matching dot is highlighted as the current step.
	let { step = 1, total = 6 } = $props();

	const dots = $derived(Array.from({ length: total }, (_, i) => i));
</script>

<header class="flex items-center justify-between border-b border-line px-6 py-5 md:px-10">
	<div class="flex items-center gap-3">
		<span class="size-4 shrink-0 bg-placeholder"></span>
		<span class="text-lg tracking-wide">AI Florist</span>
	</div>

	<div class="flex items-center gap-3 sm:gap-4">
		{#each dots as dot (dot)}
			<span
				class={['rounded-[1px]', dot === step - 1 ? 'size-2.5 bg-subtle' : 'size-2 bg-placeholder']}
			></span>
		{/each}
	</div>
</header>
