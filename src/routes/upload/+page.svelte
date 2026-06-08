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
<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={2} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork />

		<!-- Right panel: full-bleed workspace + floating tab switch -->
		<section
			class="relative flex min-h-0 flex-1 flex-col pb-[4.75rem] lg:overflow-hidden lg:pb-0"
		>
			{#if mode === 'moodboard'}
				<MoodboardGrid />
			{:else}
				<SnsFeedUpload />
			{/if}

			<!-- full-width on mobile; centered pill on desktop -->
			<div
				class="fixed right-0 bottom-0 left-0 z-20 px-4 pb-5 lg:absolute lg:right-auto lg:bottom-8 lg:left-1/2 lg:w-auto lg:-translate-x-1/2 lg:px-0 lg:pb-0"
			>
				<div
					class="flex w-full items-center rounded-full bg-surface/95 p-1.5 shadow-xl ring-1 ring-black/5 backdrop-blur lg:w-auto"
				>
					<button
						type="button"
						onclick={() => (mode = 'sns')}
						class={[
							'flex-1 rounded-full px-4 py-2.5 text-center text-sm whitespace-nowrap transition-colors lg:flex-none lg:px-5',
							mode === 'sns' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Upload SNS Feed
					</button>
					<button
						type="button"
						onclick={() => (mode = 'moodboard')}
						class={[
							'flex-1 rounded-full px-4 py-2.5 text-center text-sm whitespace-nowrap transition-colors lg:flex-none lg:px-5',
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
