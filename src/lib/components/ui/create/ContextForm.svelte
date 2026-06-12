<script>
	import OptionGroup from './OptionGroup.svelte';
	import BudgetSlider from './BudgetSlider.svelte';

	let {
		who = $bindable(null),
		whatFor = $bindable(null),
		style = $bindable(null),
		budget = $bindable(50000)
	} = $props();

	const hasAnySelection = $derived(who !== null || whatFor !== null || style !== null);

	const whoOptions = ['Friend', 'Family', 'Partner', 'Teacher', 'Others'];
	const whatForOptions = ['Birthday', 'Anniversary', 'Thanks', 'Daily'];
	const styleOptions = ['Feminine', 'Masculine', 'Neutral'];
</script>

<div class="flex flex-1 flex-col justify-center px-6 py-10 md:px-12 lg:px-16 lg:py-16">
	<header class="mb-10 space-y-3 lg:mb-14">
		{#if !hasAnySelection}
			<h1 class="text-3xl leading-relaxed font-light text-muted md:text-4xl lg:text-[2.75rem]">
				Who are we making flowers for?
			</h1>
			<p class="text-sm text-muted">Pick a few details below</p>
		{:else}
			<h1 class="text-3xl leading-tight font-light text-muted md:text-4xl lg:text-[2.75rem]">
				{#if whatFor}
					A <span class="font-semibold text-ink underline decoration-ink/30 underline-offset-4"
						>{whatFor}</span
					>
					bouquet for
				{:else}
					A bouquet for
				{/if}
				{#if who}
					<span class="font-semibold text-ink underline decoration-ink/30 underline-offset-4"
						>{who}</span
					>
				{:else}
					<span class="text-muted">...</span>
				{/if}
			</h1>
			<p class="text-sm text-muted">
				{style ?? '—'} | ₩{budget.toLocaleString('ko-KR')}
			</p>
		{/if}
	</header>

	<div class="space-y-8 lg:space-y-10">
		<OptionGroup label="Who" options={whoOptions} selected={who} onchange={(v) => (who = v)} />
		<OptionGroup
			label="What for"
			options={whatForOptions}
			selected={whatFor}
			onchange={(v) => (whatFor = v)}
		/>
		<OptionGroup
			label="Style"
			options={styleOptions}
			selected={style}
			onchange={(v) => (style = v)}
		/>
		<BudgetSlider bind:budget />
	</div>
</div>
