<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import FlowContinueBar, {
		FLOW_CONTINUE_BUTTON
	} from '$lib/components/ui/FlowContinueBar.svelte';
	import { fetchJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	let loading = $state(true);
	let error = $state('');
	let selectedImage = $state(null);
	let floristNote = $state('');
	let recipe = $state(null);
	let mock = $state(false);

	const artworkTitle = $derived('Your bouquet');
	const artworkDescription = $derived(floristNote || 'Your selected bouquet and florist note.');
	const bouquetImageSrc = $derived(selectedImage ? toDataUrl(selectedImage) : null);

	onMount(async () => {
		const jobId = getFlowString('jobId');

		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			selectedImage = job.images?.primary ?? null;
			floristNote = job.floristNote ?? '';
			recipe = job.recipe ?? null;
			mock = Boolean(job.mock);
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load result';
			loading = false;
		}
	});
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={6} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork
			variant="generated"
			title={artworkTitle}
			description={artworkDescription}
			imageSrc={bouquetImageSrc}
		/>

		<section class="relative flex min-h-0 flex-1 flex-col pb-[3.75rem] lg:overflow-hidden lg:pb-8">
			<div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
				{#if loading}
					<p class="text-sm text-muted">Loading result...</p>
				{:else if error}
					<p class="text-sm text-red-600">{error}</p>
				{:else}
					{#if mock}
						<p class="mb-6 text-sm text-muted">Running in mock mode (no Gemini API key).</p>
					{/if}

					<div class="mx-auto w-full max-w-lg space-y-8">
						<div>
							<h2 class="mb-2 text-lg">Florist note</h2>
							<p class="text-sm leading-relaxed text-muted">{floristNote}</p>
						</div>

						{#if recipe}
							<div>
								<h2 class="mb-2 text-lg">Recipe</h2>
								<ul class="space-y-1 text-sm text-muted">
									<li><strong>Concept:</strong> {recipe.concept}</li>
									<li><strong>Main:</strong> {recipe.mainFlowers?.join(', ')}</li>
									<li><strong>Sub:</strong> {recipe.subFlowers?.join(', ')}</li>
									<li><strong>Greenery:</strong> {recipe.greenery?.join(', ')}</li>
									<li><strong>Wrapping:</strong> {recipe.wrapping}</li>
								</ul>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			{#if !loading && !error}
				<FlowContinueBar>
					<button type="button" onclick={() => goto(resolve('/map'))} class={FLOW_CONTINUE_BUTTON}>
						Continue to map ->
					</button>
				</FlowContinueBar>
			{/if}
		</section>
	</main>
</div>
