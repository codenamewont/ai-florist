<script>
	let { label, options, selected, onchange } = $props();
</script>

<div class="space-y-3">
	<p class="text-sm tracking-[0.2em] text-muted uppercase">{label}</p>
	<div class="flex flex-wrap gap-x-5 gap-y-2">
		{#each options as option (option)}
			<button
				type="button"
				onclick={() => onchange(option)}
				class={[
					'text-xl tracking-wide transition-colors',
					selected === option ? 'text-ink' : 'text-muted hover:text-ink'
				]}
			>
				{option}
			</button>
		{/each}
	</div>
</div>
