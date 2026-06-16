<script>
	let { shops = [], selectedId = $bindable(null), onselect } = $props();
</script>

<div class="flex min-w-0 flex-col gap-2">
	{#each shops as shop (shop.id)}
		<button
			type="button"
			onclick={() => onselect(shop.id)}
			class={[
				'box-border h-auto w-full min-w-0 overflow-hidden rounded border px-4 py-3 text-left transition-colors',
				selectedId === shop.id
					? 'border-pill bg-pill text-surface'
					: 'border-line-strong bg-surface text-ink hover:border-ink/30'
			]}
		>
			<p class="text-sm leading-snug font-medium [overflow-wrap:anywhere] break-words">
				{shop.name}
			</p>
			<p class="mt-1 text-xs leading-snug [overflow-wrap:anywhere] break-words opacity-80">
				{shop.address}
			</p>
			{#if shop.distance}
				<p class="mt-1 text-xs leading-snug break-words opacity-70">{shop.distance}</p>
			{/if}
			{#if selectedId === shop.id && shop.phone}
				<p class="mt-1 text-xs leading-snug break-all opacity-70">{shop.phone}</p>
			{/if}
		</button>
	{:else}
		<p class="text-sm text-muted">No flower shops found nearby.</p>
	{/each}
</div>
