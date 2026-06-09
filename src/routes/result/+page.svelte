<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { fetchJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	let loading = $state(true);
	let error = $state('');
	let selectedImage = $state(null);
	let floristNote = $state('');
	let recipe = $state(null);
	let selectedSize = $state('');
	let mock = $state(false);

	onMount(async () => {
		const jobId = getFlowString('jobId');

		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			selectedImage = job.selectedSize ? job.images?.[job.selectedSize] : null;
			floristNote = job.floristNote ?? '';
			recipe = job.recipe ?? null;
			selectedSize = job.selectedSize ?? '';
			mock = Boolean(job.mock);
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load result';
			loading = false;
		}
	});
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={6} total={7} />

	<main class="mx-auto max-w-5xl px-6 py-10">
		<h1 class="mb-2 text-2xl">Result</h1>
		<p class="mb-8 text-sm text-muted">Your selected bouquet and florist note.</p>

		{#if loading}
			<p class="text-sm text-muted">Loading result...</p>
		{:else if error}
			<p class="text-sm text-red-600">{error}</p>
		{:else}
			{#if mock}
				<p class="mb-4 text-sm text-muted">Running in mock mode (no Gemini API key).</p>
			{/if}

			<div class="grid gap-8 lg:grid-cols-2">
				<div class="aspect-[3/4] overflow-hidden bg-track">
					{#if selectedImage}
						<img
							src={toDataUrl(selectedImage)}
							alt="Selected bouquet"
							class="h-full w-full object-cover"
						/>
					{/if}
				</div>

				<div class="space-y-6">
					<div>
						<h2 class="mb-2 text-lg">Selected size</h2>
						<p class="text-sm text-muted">{selectedSize || 'Not selected'}</p>
					</div>

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

					<button
						type="button"
						class="bg-pill px-4 py-2 text-sm text-surface"
						onclick={() => goto(resolve('/map'))}
					>
						Continue to map
					</button>
				</div>
			</div>
		{/if}
	</main>
</div>
