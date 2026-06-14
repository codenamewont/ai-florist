<script>
	import {
		LANDING_GROWTH_STAGES,
		LANDING_STAGE_REVEAL_MS
	} from '$lib/landing/landingGrowthStages.js';
</script>

<div class="growth-metaphor w-full" aria-hidden="true">
	<div class="flex w-full items-end justify-between gap-2 sm:gap-4">
		{#each LANDING_GROWTH_STAGES as stage (stage.id)}
			<img
				src={stage.src}
				alt=""
				class={[
					'stage-reveal w-auto shrink-0 object-contain object-bottom',
					stage.heightClass
				]}
				style={`--stage-delay: ${stage.delayMs}ms; --stage-duration: ${LANDING_STAGE_REVEAL_MS}ms;`}
			/>
		{/each}
	</div>

	<div class="h-px w-full bg-ink" aria-hidden="true"></div>
</div>

<style>
	.stage-reveal {
		opacity: 0;
		transform: translateY(0.5rem);
		animation: stage-reveal var(--stage-duration, 680ms) ease-out forwards;
		animation-delay: var(--stage-delay, 0ms);
	}

	@keyframes stage-reveal {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stage-reveal {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
