<script>
	let {
		title = 'Title',
		description = 'Description Description Description',
		/** instruction: 입력 전 안내 톤 (muted) */
		mode = 'summary'
	} = $props();
</script>

<div class="w-64 max-w-full flex-none border border-line-strong bg-white px-4 py-3 shadow-sm lg:px-6 lg:py-5">
	<h3
		class={['text-sm leading-snug font-semibold', mode === 'instruction' ? 'text-muted' : 'text-ink']}
	>
		{title}
	</h3>
	<p
		class={[
			'mt-2 text-xs',
			mode === 'instruction' ? 'leading-snug text-muted' : 'leading-relaxed text-ink'
		]}
	>
		{description}
	</p>
</div>
