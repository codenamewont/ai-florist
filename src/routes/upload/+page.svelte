<script>
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';

	// segmented control — "Build Moodboard" is selected by default in the design
	let mode = $state('moodboard');
</script>

<div class="flex min-h-screen flex-col bg-surface text-ink">
	<Header step={3} total={6} />

	<main class="flex flex-1 flex-col lg:flex-row">
		<Artwork />

		<!-- Right panel: heading + mode toggle -->
		<section class="flex flex-1 flex-col items-center px-6 py-10 lg:py-12">
			<h1 class="w-full text-center text-[clamp(2rem,5vw,3.125rem)] leading-tight">
				Define her Style
			</h1>

			<div class="mt-8 flex max-w-full items-center rounded-full bg-track p-1.5">
				<button
					type="button"
					onclick={() => (mode = 'sns')}
					class={[
						'rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition-colors sm:px-7 sm:py-3 sm:text-lg',
						mode === 'sns' ? 'bg-pill text-surface' : 'text-muted'
					]}
				>
					Upload SNS Feed
				</button>
				<button
					type="button"
					onclick={() => (mode = 'moodboard')}
					class={[
						'rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition-colors sm:px-7 sm:py-3 sm:text-lg',
						mode === 'moodboard' ? 'bg-pill text-surface' : 'text-muted'
					]}
				>
					Build Moodboard
				</button>
			</div>
		</section>
	</main>
</div>
