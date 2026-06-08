<script>
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MoodboardGrid from '$lib/components/ui/upload/MoodboardGrid.svelte';
	import SnsFeedUpload from '$lib/components/ui/upload/SnsFeedUpload.svelte';

	// "Build Moodboard" is selected by default in the design
	let mode = $state('moodboard');
</script>

<!--
	On desktop the split layout is locked to the viewport height so the left
	artwork stays put while switching modes. The right panel is a full-bleed
	upload canvas with the mode toggle floating over it.
-->
<div class="flex min-h-screen flex-col bg-surface text-ink lg:h-screen lg:overflow-hidden">
	<Header step={3} total={6} />

	<main class="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
		<Artwork />

		<!-- Right panel: full-bleed workspace + floating tab switch -->
		<section class="relative flex flex-1 flex-col pb-24 lg:min-h-0 lg:overflow-hidden lg:pb-0">
			{#if mode === 'moodboard'}
				<MoodboardGrid />
			{:else}
				<SnsFeedUpload />
			{/if}

			<!-- floating tab switch: pinned to the viewport on mobile, floating over the panel on desktop -->
			<div class="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 lg:absolute lg:bottom-8">
				<div
					class="flex items-center rounded-full bg-surface/95 p-1.5 shadow-xl ring-1 ring-black/5 backdrop-blur"
				>
					<button
						type="button"
						onclick={() => (mode = 'sns')}
						class={[
							'rounded-full px-5 py-2.5 text-sm whitespace-nowrap transition-colors',
							mode === 'sns' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Upload SNS Feed
					</button>
					<button
						type="button"
						onclick={() => (mode = 'moodboard')}
						class={[
							'rounded-full px-5 py-2.5 text-sm whitespace-nowrap transition-colors',
							mode === 'moodboard' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Build Moodboard
					</button>
				</div>
			</div>
		</section>
	</main>
</div>
