<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import OptionsPanel from '$lib/components/ui/options/OptionsPanel.svelte';
	import { fetchJob, selectOption } from '$lib/flowerFlow/api.js';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	const jobId = getFlowString('jobId');

	let images = $state({});
	let recipe = $state(null);
	let loading = $state(true);
	let loadingSize = $state(null);
	let error = $state('');
	let selectedSize = $state(null);

	const artworkTitle = $derived(recipe?.concept ?? 'Title');

	const artworkDescription = $derived(
		recipe?.mainFlowers?.length
			? `${recipe.mainFlowers.join(', ')} · ${recipe.wrapping ?? 'Custom wrap'}`
			: 'Description Description Description'
	);

	onMount(async () => {
		if (!jobId) {
			// 와이어프레임 확인용: job 없어도 레이아웃은 보여 줌
			loading = false;
			error = 'Start from /create and complete the flow to see generated bouquets.';
			return;
		}

		try {
			const job = await fetchJob(jobId);
			if (!job.images?.M) {
				await goto(resolve('/generating'));
				return;
			}
			images = job.images;
			recipe = job.recipe ?? null;
			loading = false;
		} catch {
			await goto(resolve('/generating'));
		}
	});

	async function handleContinue() {
		if (!selectedSize) {
			error = 'Choose a bouquet size to continue.';
			return;
		}

		if (!jobId) {
			error = 'Complete create → upload → message → generating first.';
			return;
		}

		loadingSize = selectedSize;
		error = '';

		try {
			await selectOption(jobId, /** @type {'S'|'M'|'L'} */ (selectedSize));
			await goto(resolve('/result'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Selection failed';
			loadingSize = null;
		}
	}
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={5} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col pb-[4.75rem] lg:overflow-y-auto lg:pb-0">
			<OptionsPanel {images} {loading} bind:selectedSize />

			<div
				class="fixed right-0 bottom-0 left-0 z-20 space-y-2 px-4 pb-5 lg:absolute lg:right-8 lg:bottom-8 lg:left-auto lg:w-72 lg:px-0"
			>
				{#if error}
					<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
						{error}
					</p>
				{/if}
				<button
					type="button"
					disabled={!selectedSize || Boolean(loadingSize)}
					onclick={handleContinue}
					class="w-full bg-pill px-4 py-3 text-sm text-surface disabled:opacity-50"
				>
					{loadingSize ? 'Selecting...' : 'Continue to result'}
				</button>
			</div>
		</section>
	</main>
</div>
