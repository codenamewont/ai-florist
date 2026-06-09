<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { fetchJob, selectOption, toDataUrl } from '$lib/flowerFlow/api.js';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	const jobId = getFlowString('jobId');

	// Images are large base64 blobs that don't fit in sessionStorage, so they live
	// server-side. Fetch them by jobId rather than reading them from the flow store.
	let images = $state({});
	let loading = $state(true);
	let loadingSize = $state(null);
	let error = $state('');

	const options = [
		{ size: 'S', label: 'Small', description: 'Simple, delicate, affordable' },
		{ size: 'M', label: 'Medium', description: 'Balanced standard bouquet volume' },
		{ size: 'L', label: 'Large', description: 'Fuller, premium and abundant' }
	];

	onMount(async () => {
		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			if (!job.images?.M) {
				// Not generated yet — (re)run generation.
				await goto(resolve('/generating'));
				return;
			}
			images = job.images;
			loading = false;
		} catch {
			// Job missing on the server (e.g. a dev-server restart wiped it) — restart.
			await goto(resolve('/generating'));
		}
	});

	async function choose(size) {
		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		loadingSize = size;
		error = '';

		try {
			await selectOption(jobId, /** @type {'S'|'M'|'L'} */ (size));
			await goto(resolve('/result'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Selection failed';
			loadingSize = null;
		}
	}
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={5} total={7} />

	<main class="mx-auto max-w-5xl px-6 py-10">
		<h1 class="mb-2 text-2xl">Choose your bouquet size</h1>
		<p class="mb-8 text-sm text-muted">Pick one of the generated options.</p>

		{#if error}
			<p class="mb-4 text-sm text-red-600">{error}</p>
		{/if}

		{#if loading}
			<p class="text-sm text-muted">Loading options...</p>
		{/if}

		<div class="grid gap-6 md:grid-cols-3" class:hidden={loading}>
			{#each options as option (option.size)}
				<button
					type="button"
					disabled={Boolean(loadingSize)}
					onclick={() => choose(option.size)}
					class="border border-line bg-track p-4 text-left transition hover:border-line-strong disabled:opacity-50"
				>
					<div class="mb-4 aspect-[3/4] overflow-hidden bg-surface">
						{#if images[option.size]}
							<img
								src={toDataUrl(images[option.size])}
								alt="{option.label} bouquet option"
								class="h-full w-full object-cover"
							/>
						{:else}
							<div class="flex h-full items-center justify-center text-sm text-muted">No image</div>
						{/if}
					</div>
					<h2 class="text-lg">{option.label}</h2>
					<p class="mt-1 text-sm text-muted">{option.description}</p>
					<p class="mt-4 text-sm">
						{loadingSize === option.size ? 'Selecting...' : 'Select this option'}
					</p>
				</button>
			{/each}
		</div>
	</main>
</div>
