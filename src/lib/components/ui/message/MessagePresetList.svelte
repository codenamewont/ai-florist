<script>
	// OptionGroup과 같은 선택 버튼 스타일 — message는 세로 목록
	let { options, selected, onchange } = $props();
</script>

<div class="flex max-w-md flex-col gap-y-8">
	{#each options as option (option)}
		<button
			type="button"
			onclick={() => onchange(option)}
			class={[
				'text-left text-xl tracking-wide transition-colors',
				selected === option ? 'text-ink' : 'text-muted hover:text-ink'
			]}
		>
			{option}
		</button>
	{/each}
</div>
