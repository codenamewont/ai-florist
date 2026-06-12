<script>
	let { budget = $bindable(50000) } = $props();

	const min = 10_000;
	const max = 150_000;
	const step = 5_000;

	const fillPercent = $derived(((budget - min) / (max - min)) * 100);
</script>

<div class="space-y-4">
	<div>
		<p class="text-xs tracking-[0.2em] text-muted uppercase">Budget</p>
		<p class="mt-2 text-3xl font-semibold tracking-tight">
			₩{budget.toLocaleString('ko-KR')}
		</p>
	</div>

	<div class="space-y-2">
		<div class="relative h-6">
			<div class="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-placeholder"></div>
			<div
				class="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-subtle"
				style="width: {fillPercent}%"
			></div>
			<input
				type="range"
				{min}
				{max}
				{step}
				bind:value={budget}
				aria-label="Budget"
				class="budget-slider absolute inset-0 w-full cursor-pointer appearance-none bg-transparent"
			/>
		</div>
		<div class="flex justify-between text-xs text-muted">
			<span>₩10,000</span>
			<span>₩150,000+</span>
		</div>
	</div>
</div>

<style>
	.budget-slider::-webkit-slider-thumb {
		appearance: none;
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		background: var(--color-pill);
		border: none;
		margin-top: -0.4375rem;
	}

	.budget-slider::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		background: var(--color-pill);
		border: none;
	}

	.budget-slider::-webkit-slider-runnable-track {
		height: 1px;
		background: transparent;
	}

	.budget-slider::-moz-range-track {
		height: 1px;
		background: transparent;
	}
</style>
