<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import GenerationActivityFeed from '$lib/components/ui/generating/GenerationActivityFeed.svelte';
	import { buildRecipe, generateImages } from '$lib/flowerFlow/api.js';
	import { createGenerationProgress, DEFAULT_ESTIMATED_MS, MOCK_ESTIMATED_MS } from '$lib/flowerFlow/generationProgress.js';
	import { createGeneratingArtworkCycle } from '$lib/flowerFlow/generatingArtworkCycle.js';
	import {
		clearFlow,
		getFlowObject,
		getFlowString,
		getFlowUserInput,
		loadFlow,
		saveFlow
	} from '$lib/flowerFlow/session.js';

	const MAX_RETRIES = 5;
	const userInput = getFlowUserInput();
	const cardMessage = getFlowString('cardMessage');

	const artworkTitle = $derived.by(() => {
		const who = typeof userInput.relationship === 'string' ? userInput.relationship : null;
		const whatFor = typeof userInput.occasion === 'string' ? userInput.occasion : null;
		if (!who && !whatFor) return 'Your bouquet';
		const occasion = whatFor ? `A ${whatFor} bouquet for` : 'A bouquet for';
		return `${occasion} ${who ?? '...'}`;
	});

	const artworkDescription = $derived(cardMessage || '잠시 관리중 ~');

	/** @type {import('$lib/components/ui/Artwork/artworkVariants.js').ArtworkVariant} */
	let artworkVariant = $state('create2');

	let activeStepIndex = $state(0);
	let retryLabel = $state('');
	let error = $state('');
	let canRetry = $state(false);

	let active = true;
	/** @type {ReturnType<typeof createGenerationProgress> | null} */
	let progress = null;
	/** @type {ReturnType<typeof createGeneratingArtworkCycle> | null} */
	let artworkCycle = null;

	function startArtworkCycle() {
		artworkCycle?.dispose();
		artworkCycle = createGeneratingArtworkCycle((variant) => {
			artworkVariant = variant;
		});
		artworkCycle.start();
	}

	/** @param {number} ms */
	function wait(ms) {
		return new Promise((resolveWait) => setTimeout(resolveWait, ms));
	}

	/**
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
	 * @template T
	 * @param {string} label
	 * @param {() => Promise<T>} task
	 * @returns {Promise<T>}
	 */
	async function runWithRetry(label, task) {
		let attempt = 0;

		while (active) {
			try {
				retryLabel =
					attempt === 0 ? '' : `Retrying ${label.toLowerCase()} (${attempt}/${MAX_RETRIES})…`;
				error = '';
				return await task();
			} catch (err) {
				const { retryable, permanent, retryAfterMs } = classify(err);

				if (permanent || !retryable || attempt >= MAX_RETRIES) {
					throw err;
				}

				attempt += 1;
				const seconds = Math.round(retryAfterMs / 1000);
				retryLabel = `AI provider is busy. Retrying in ${seconds}s (${attempt}/${MAX_RETRIES})…`;
				await wait(retryAfterMs);
			}
		}

		throw new Error('Generation was cancelled.');
	}

	async function runGeneration() {
		if (!progress) return;

		canRetry = false;
		error = '';
		retryLabel = '';

		const flow = loadFlow();
		const jobId = typeof flow.jobId === 'string' ? flow.jobId : '';
		const sessionUserInput = getFlowObject('userInput') ?? {};

		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const estimatedMs = flow.mock ? MOCK_ESTIMATED_MS : DEFAULT_ESTIMATED_MS;
			progress.begin({ estimatedMs });

			const existingRecipe = getFlowObject('recipe');
			if (!existingRecipe) {
				const recipeResult = await runWithRetry('Building bouquet recipe', () =>
					buildRecipe(jobId, sessionUserInput)
				);
				saveFlow({ recipe: recipeResult.recipe });
			}

			const imageResult = await runWithRetry('Generating bouquet image', () =>
				generateImages(jobId)
			);

			await progress.finishWhenReady();

			saveFlow({
				imagesJobId: jobId,
				imagePrompt: imageResult.imagePrompt,
				mock: imageResult.mock
			});

			await goto(resolve('/options'));
		} catch (err) {
			if (!active) return;

			const code = err && typeof err === 'object' && 'code' in err ? err.code : '';
			const stale =
				code === 'job_not_found' || (err && typeof err === 'object' && err.status === 404);
			if (stale) {
				const preservedInput = getFlowObject('userInput');
				clearFlow();
				if (preservedInput) saveFlow({ userInput: preservedInput });
				retryLabel = '';
				await goto(resolve('/upload'));
				return;
			}

			const { permanent } = classify(err);
			error = err instanceof Error ? err.message : 'Generation failed';
			retryLabel = permanent ? 'Generation is blocked.' : 'Still failing after several retries.';
			canRetry = true;
			progress?.reset();
		}
	}

	function retry() {
		if (!active) return;
		startArtworkCycle();
		runGeneration();
	}

	function backToMessage() {
		goto(resolve('/message'));
	}

	onMount(() => {
		active = true;
		progress = createGenerationProgress((index) => {
			activeStepIndex = index;
		});
		startArtworkCycle();
		runGeneration();

		return () => {
			active = false;
			progress?.dispose();
			artworkCycle?.dispose();
		};
	});
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={4} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork comingSoon variant={artworkVariant} title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<GenerationActivityFeed
				{activeStepIndex}
				{error}
				{retryLabel}
				{canRetry}
				onRetry={retry}
				onBack={backToMessage}
			/>
		</section>
	</main>
</div>
