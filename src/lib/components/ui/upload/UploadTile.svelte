<script>
	import { onDestroy } from 'svelte';

	// A single click-to-upload slot: a light bordered placeholder when empty,
	// the chosen image (cover) when filled. Layout (size / grid placement) is
	// supplied by the parent via `class` and `style` so the same tile works in
	// both the moodboard and the SNS feed.
	let { label = null, class: klass = '', style = '' } = $props();

	let preview = $state(null);

	function pick(event) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		if (preview) URL.revokeObjectURL(preview);
		preview = URL.createObjectURL(file);
	}

	onDestroy(() => {
		if (preview) URL.revokeObjectURL(preview);
	});
</script>

<label
	class={[
		'group relative flex cursor-pointer items-center justify-center overflow-hidden bg-track transition-colors',
		!preview && 'border border-line hover:border-line-strong',
		klass
	]}
	{style}
>
	<input
		type="file"
		accept="image/*"
		class="sr-only"
		aria-label={label ? `Add a ${label} image` : 'Add an image'}
		onchange={pick}
	/>

	{#if preview}
		<img src={preview} alt={label ?? ''} class="h-full w-full object-cover" />
		<div class="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>
		{#if label}
			<span class="absolute bottom-3 left-4 text-sm tracking-[0.15em] text-surface uppercase"
				>{label}</span
			>
		{/if}
		<span
			class="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-surface opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
		>
			Change
		</span>
	{:else}
		<div
			class="flex flex-col items-center gap-3 text-subtle transition-transform group-hover:scale-105"
		>
			<span
				class="flex size-10 items-center justify-center rounded-full border border-current text-xl leading-none"
				aria-hidden="true">+</span
			>
			{#if label}
				<span class="text-sm tracking-[0.15em] uppercase">{label}</span>
			{/if}
		</div>
	{/if}
</label>
