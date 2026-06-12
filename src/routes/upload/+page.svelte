<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MoodboardGrid from '$lib/components/ui/upload/MoodboardGrid.svelte';
	import SnsFeedUpload from '$lib/components/ui/upload/SnsFeedUpload.svelte';
	import { analyzeMood } from '$lib/flowerFlow/api.js';
	import {
		deleteFlowKey,
		getFlowUserInput,
		isDevSeeded,
		loadFlow,
		saveFlow
	} from '$lib/flowerFlow/session.js';

	const savedFlow = loadFlow();
	const userInput = getFlowUserInput();

	const devUpload = savedFlow.devUpload;
	let mode = $state(
		isDevSeeded() && devUpload?.active && typeof devUpload.mode === 'string'
			? devUpload.mode
			: 'moodboard'
	);
	let primaryFile = $state(null);
	let loading = $state(false);
	let error = $state('');

	const recipientPronoun = $derived.by(() => {
		const style = typeof userInput.style === 'string' ? userInput.style.toLowerCase() : '';
		if (style === 'masculine') return 'his';
		if (style === 'feminine') return 'her';
		return 'their';
	});

	async function continueToMessage() {
		error = '';

		const flow = loadFlow();
		if (flow.jobId && flow.moodAnalysis) {
			// Dev Fill 후 바로 message로 넘어갈 때 더미 플래그가 남지 않도록 정리
			deleteFlowKey('devUpload');
			deleteFlowKey('devSeeded');
			deleteFlowKey('cardMessage');
			await goto(resolve('/message'));
			return;
		}

		if (!primaryFile) {
			error = 'Upload at least one image to continue.';
			return;
		}

		loading = true;

		try {
			const result = await analyzeMood(primaryFile, userInput);
			deleteFlowKey('devUpload');
			deleteFlowKey('devSeeded');
			deleteFlowKey('devMessageSnapshot');
			deleteFlowKey('cardMessage');
			saveFlow({
				jobId: result.jobId,
				moodAnalysis: result.moodAnalysis,
				recipe: null,
				imagePrompt: null,
				images: null,
				imagesJobId: null,
				floristNote: null,
				mock: result.mock
			});
			await goto(resolve('/message'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={2} total={7} />

	<main class="flex min-h-0 flex-1 flex-col pt-6 lg:flex-row lg:pt-8">
		<Artwork />

		<section
			class="relative flex min-h-0 flex-1 flex-col pb-[4.75rem] lg:grid lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden lg:pb-8"
		>
			{#if mode === 'moodboard'}
				<MoodboardGrid bind:primaryFile caption={`build ${recipientPronoun} moodboard!`} />
			{:else}
				<SnsFeedUpload bind:primaryFile caption={`upload ${recipientPronoun} feed!`} />
			{/if}

			<div
				class="fixed right-0 bottom-0 left-0 z-20 space-y-2 px-4 pb-5 lg:static lg:mx-auto lg:flex lg:w-full lg:max-w-2xl lg:items-center lg:gap-3 lg:space-y-0 lg:px-6 lg:pb-0"
			>
				{#if error}
					<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
						{error}
					</p>
				{/if}

				<button
					type="button"
					disabled={loading}
					onclick={continueToMessage}
					class="w-full px-2 py-3 text-sm whitespace-nowrap text-ink underline-offset-4 hover:underline disabled:opacity-50 lg:order-2 lg:w-auto"
				>
					{loading ? 'Analyzing mood...' : 'Continue to message ->'}
				</button>

				<div
					class="grid w-full grid-cols-2 items-center rounded-full bg-white p-1.5 shadow-xl ring-1 ring-black/5 lg:order-1 lg:flex-1"
				>
					<button
						type="button"
						onclick={() => (mode = 'sns')}
						class={[
							'w-full rounded-full px-3 py-2.5 text-center text-sm whitespace-nowrap transition-colors',
							mode === 'sns' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Upload SNS Feed
					</button>
					<button
						type="button"
						onclick={() => (mode = 'moodboard')}
						class={[
							'w-full rounded-full px-3 py-2.5 text-center text-sm whitespace-nowrap transition-colors',
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
