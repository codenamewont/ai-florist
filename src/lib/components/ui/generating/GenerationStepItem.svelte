<script>
	/** @type {'completed' | 'active' | 'pending'} */
	let { label, status = 'pending' } = $props();
</script>

<li
	class={[
		'flex items-start gap-3 text-lg tracking-wide transition-all duration-500 md:text-xs',
		status === 'completed' && 'step-completed text-ink opacity-100',
		status === 'active' && 'text-ink',
		status === 'pending' && 'text-muted/50'
	]}
>
	<span class="mt-0.5 w-5 shrink-0 text-center leading-none" aria-hidden="true">
		{#if status === 'completed'}
			<span class="inline-block">✓</span>
		{:else if status === 'active'}
			<span class="inline-block animate-pulse">●</span>
		{:else}
			<span class="inline-block">○</span>
		{/if}
	</span>
	<span class="leading-snug">{label}</span>
</li>

<style>
	.step-completed {
		animation: stepFadeIn 0.5s ease-out;
	}

	@keyframes stepFadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
