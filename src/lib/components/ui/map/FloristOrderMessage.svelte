<script>
	/** @typedef {{ text: string, highlight: boolean }} OrderMessageSegment */

	let {
		plainText = '',
		segments = /** @type {OrderMessageSegment[]} */ ([])
	} = $props();

	let copied = $state(false);

	const hasMessage = $derived(Boolean(plainText?.trim()));

	async function handleCopy() {
		if (!hasMessage) return;

		try {
			await navigator.clipboard.writeText(plainText);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// 클립보드 API 미지원 환경
		}
	}
</script>

<div class="flex items-start justify-between gap-3">
	{#if hasMessage}
		<p class="min-w-0 flex-1 text-sm leading-relaxed text-muted">
			{#each segments as segment, index (index)}
				{#if segment.highlight}
					<span class="text-pill">{'{'}</span><span class="font-medium text-ink"
						>{segment.text}</span
					><span class="text-pill">{'}'}</span>
				{:else}
					{segment.text}
				{/if}
			{/each}
		</p>
	{:else}
		<p class="text-sm text-muted">Complete the flow to generate your order message.</p>
	{/if}

	<button
		type="button"
		disabled={!hasMessage}
		onclick={handleCopy}
		class="shrink-0 rounded bg-pill px-3 py-1.5 text-xs text-surface disabled:opacity-40"
	>
		{copied ? 'Copied!' : 'Copy'}
	</button>
</div>
