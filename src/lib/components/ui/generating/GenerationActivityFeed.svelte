<script>
	import GenerationStepItem from './GenerationStepItem.svelte';
	import { GENERATION_STEPS, GENERATION_STEP_COUNT } from './generationSteps.js';

	let {
		/** 현재 active 단계 (0–6). GENERATION_STEP_COUNT이면 전부 완료 */
		activeStepIndex = 0,
		error = '',
		retryLabel = '',
		canRetry = false,
		onRetry = () => {},
		onBack = () => {}
	} = $props();

	/**
	 * @param {number} index
	 * @returns {'completed' | 'active' | 'pending'}
	 */
	function stepStatus(index) {
		if (activeStepIndex >= GENERATION_STEP_COUNT) return 'completed';
		if (index < activeStepIndex) return 'completed';
		if (index === activeStepIndex) return 'active';
		return 'pending';
	}
</script>

<div class="flex flex-1 flex-col justify-center px-6 py-10 md:px-12 lg:px-16 lg:py-16">
	<header class="mb-10 space-y-3 lg:mb-14">
		<h1 class="text-3xl leading-relaxed font-light text-muted md:text-4xl lg:text-[2.75rem]">
			Creating your bouquet...
		</h1>
		{#if retryLabel}
			<p class="text-sm text-muted">{retryLabel}</p>
		{/if}
	</header>

	<ol class="space-y-4 lg:space-y-5" aria-label="Bouquet creation progress">
		{#each GENERATION_STEPS as label, index (label)}
			<GenerationStepItem {label} status={stepStatus(index)} />
		{/each}
	</ol>

	{#if error}
		<div class="mt-10 space-y-4">
			<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
				{error}
			</p>
			<div class="flex flex-wrap gap-3">
				{#if canRetry}
					<button type="button" class="bg-pill px-4 py-2 text-sm text-surface" onclick={onRetry}>
						Try again
					</button>
				{/if}
				<button
					type="button"
					class="border border-pill px-4 py-2 text-sm text-ink"
					onclick={onBack}
				>
					Back to message
				</button>
			</div>
		</div>
	{/if}
</div>
