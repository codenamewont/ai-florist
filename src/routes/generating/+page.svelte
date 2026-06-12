<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { buildRecipe, generateImages } from '$lib/flowerFlow/api.js';
	import { clearFlow, getFlowObject, loadFlow, saveFlow } from '$lib/flowerFlow/session.js';

	const MAX_RETRIES = 5;

	let status = $state('Preparing bouquet recipe...');
	let error = $state('');
	let canRetry = $state(false);

	let active = true;

	/** @param {number} ms */
	function wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Read the structured fields the server now sends. Falls back to message
	 * sniffing only if an older/unstructured error slips through.
	 * @param {any} err
	 */
	function classify(err) {
		if (err && (typeof err.retryable === 'boolean' || typeof err.permanent === 'boolean')) {
			return {
				retryable: Boolean(err.retryable),
				permanent: Boolean(err.permanent),
				retryAfterMs:
					typeof err.retryAfterMs === 'number' && err.retryAfterMs > 0 ? err.retryAfterMs : 15_000
			};
		}
		const message = err instanceof Error ? err.message : String(err);
		const retryable =
			/rate limit|too many requests|overloaded|unavailable|high demand|quota|exhausted/i.test(
				message
			);
		return { retryable, permanent: false, retryAfterMs: 15_000 };
	}

	/**
	 * Run a task with a finite, classified retry policy: permanent errors stop
	 * immediately, transient ones retry up to MAX_RETRIES respecting the
	 * server-provided delay, and the real error is surfaced either way.
	 * @template T
	 * @param {string} label
	 * @param {() => Promise<T>} task
	 * @returns {Promise<T>}
	 */
	async function runWithRetry(label, task) {
		let attempt = 0;

		while (active) {
			try {
				status =
					attempt === 0 ? label : `Retrying ${label.toLowerCase()} (${attempt}/${MAX_RETRIES})...`;
				error = '';
				return await task();
			} catch (err) {
				const { retryable, permanent, retryAfterMs } = classify(err);

				if (permanent || !retryable || attempt >= MAX_RETRIES) {
					throw err;
				}

				attempt += 1;
				const seconds = Math.round(retryAfterMs / 1000);
				status = `AI provider is busy. Retrying in ${seconds}s (${attempt}/${MAX_RETRIES})...`;
				await wait(retryAfterMs);
			}
		}

		throw new Error('Generation was cancelled.');
	}

	async function runGeneration() {
		canRetry = false;
		const flow = loadFlow();
		const jobId = typeof flow.jobId === 'string' ? flow.jobId : '';
		const userInput = getFlowObject('userInput') ?? {};

		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const existingRecipe = getFlowObject('recipe');
			if (!existingRecipe) {
				const recipeResult = await runWithRetry('Building bouquet recipe...', () =>
					buildRecipe(jobId, userInput)
				);
				saveFlow({ recipe: recipeResult.recipe });
			}

			const imageResult = await runWithRetry('Generating bouquet image...', () =>
				generateImages(jobId)
			);
			// Do NOT persist the multi-MB base64 images in sessionStorage — Safari caps
			// it at ~5MB and throws "QuotaExceededError: The quota has been exceeded."
			// The images already live in Supabase Storage via the job; the options
			// and result pages fetch them by jobId. We only keep lightweight metadata here.
			saveFlow({
				imagesJobId: jobId,
				imagePrompt: imageResult.imagePrompt,
				mock: imageResult.mock
			});

			await goto(resolve('/options'));
		} catch (err) {
			if (!active) return;

			// The stored jobId no longer resolves, so retrying is pointless — clear
			// the stale flow and send the user back to re-upload.
			const code = err && typeof err === 'object' && 'code' in err ? err.code : '';
			const stale =
				code === 'job_not_found' || (err && typeof err === 'object' && err.status === 404);
			if (stale) {
				// Keep the user's entered context (relationship/occasion/etc.), drop the
				// dead job, and re-upload to mint a fresh one.
				const userInput = getFlowObject('userInput');
				clearFlow();
				if (userInput) saveFlow({ userInput });
				error = '';
				status = 'This session expired. Starting over...';
				await goto(resolve('/upload'));
				return;
			}

			const { permanent } = classify(err);
			error = err instanceof Error ? err.message : 'Generation failed';
			status = permanent ? 'Generation is blocked.' : 'Still failing after several retries.';
			canRetry = true;
		}
	}

	function retry() {
		if (!active) return;
		runGeneration();
	}

	onMount(() => {
		active = true;
		runGeneration();
		return () => {
			active = false;
		};
	});
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={4} total={7} />

	<main class="mx-auto flex max-w-xl flex-col items-start px-6 py-16">
		<h1 class="mb-3 text-2xl">Generating</h1>
		<p class="text-sm text-muted">{status}</p>

		{#if error}
			<p class="mt-6 text-sm text-red-600">{error}</p>
			<div class="mt-4 flex gap-3">
				{#if canRetry}
					<button type="button" class="bg-pill px-4 py-2 text-sm text-surface" onclick={retry}>
						Try again
					</button>
				{/if}
				<button
					type="button"
					class="border border-pill px-4 py-2 text-sm text-ink"
					onclick={() => goto(resolve('/message'))}
				>
					Back to message
				</button>
			</div>
		{/if}
	</main>
</div>
