<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import BouquetFlowerCarousel from '$lib/components/ui/result/BouquetFlowerCarousel.svelte';
	import FlowContinueBar, {
		FLOW_CONTINUE_BUTTON
	} from '$lib/components/ui/FlowContinueBar.svelte';
	import { fetchJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { getFlowerImageSrc } from '$lib/flowerFlow/flowerImagePaths.js';
	import { resolveRecipeFlowers, buildBriefBouquetDescription } from '$lib/flowerFlow/resolveRecipeFlowers.js';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	let loading = $state(true);
	let error = $state('');
	let selectedImage = $state(null);
	let recipe = $state(null);
	let mock = $state(false);

	const artworkTitle = $derived(recipe?.concept?.trim() || 'Your bouquet');
	const artworkDescription = $derived(buildBriefBouquetDescription(recipe));
	const bouquetImageSrc = $derived(selectedImage ? toDataUrl(selectedImage) : null);
	const bouquetFlowers = $derived(resolveRecipeFlowers(recipe, getFlowerImageSrc));

	onMount(async () => {
		const jobId = getFlowString('jobId');

		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			selectedImage = job.images?.primary ?? null;
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
			<div class="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
				{#if loading}
					<p class="text-sm text-muted">Loading result...</p>
				{:else if error}
					<p class="text-sm text-red-600">{error}</p>
				{:else}
					{#if mock}
						<p class="mb-6 text-sm text-muted">Running in mock mode (no Gemini API key).</p>
					{/if}

					<BouquetFlowerCarousel flowers={bouquetFlowers} />
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
