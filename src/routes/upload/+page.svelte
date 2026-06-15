<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MoodboardGrid from '$lib/components/ui/upload/MoodboardGrid.svelte';
	import SnsFeedUpload from '$lib/components/ui/upload/SnsFeedUpload.svelte';
	import FlowNav from '$lib/components/ui/FlowNav.svelte';
	import { analyzeMood } from '$lib/flowerFlow/api.js';
	import {
		deleteFlowKey,
		getFlowUserInput,
		isDevSeeded,
		loadFlow,
		saveFlow
	} from '$lib/flowerFlow/session.js';
	import {
		readMoodboardFiles,
		readPrimaryUploadFile,
		readSnsFile,
		readUploadDraftMode,
		writeUploadDraftMode
	} from '$lib/flowerFlow/uploadDraft.js';

	const savedFlow = loadFlow();
	const userInput = getFlowUserInput();

	const devUpload = savedFlow.devUpload;
	const cachedMoodboard = readMoodboardFiles();
	const savedUploadMode = readUploadDraftMode();
	let mode = $state(
		isDevSeeded() && devUpload?.active && typeof devUpload.mode === 'string'
			? devUpload.mode
			: savedUploadMode
	);
	let primaryFile = $state(readPrimaryUploadFile());
	let moodboardTiles = $state({
		color: !!cachedMoodboard.color,
		season: !!cachedMoodboard.season,
		character: !!cachedMoodboard.character,
		location: !!cachedMoodboard.location
	});
	let snsHasImage = $state(!!readSnsFile());
	let submitting = $state(false);
	let error = $state('');

	const recipientLabel = $derived.by(() => {
		const who = typeof userInput.relationship === 'string' ? userInput.relationship : '';
		return who ? who.toLowerCase() : 'them';
	});

	const recipientPronoun = $derived.by(() => {
		const style = typeof userInput.style === 'string' ? userInput.style.toLowerCase() : '';
		if (style === 'masculine') return 'his';
		if (style === 'feminine') return 'her';
		return 'their';
	});

	const MOODBOARD_TILE_COPY = {
		color: {
			title: 'A hint of color',
			description:
				'The first thread pulled. Warm or cool, bold or shy. Their palette begins to speak.'
		},
		season: {
			title: 'Season in the air',
			description: 'Spring lightness or winter hush. Time of year will breathe through the bouquet.'
		},
		character: {
			title: 'Their character',
			description:
				'A face, a gesture, a presence. Something in them is starting to take floral form.'
		},
		location: {
			title: 'A sense of place',
			description: 'City grit or quiet coast. Where they belong roots the arrangement in memory.'
		}
	};

	const artworkCopy = $derived.by(() => {
		if (mode === 'sns') {
			if (snsHasImage) {
				return {
					title: 'Feed captured',
					description:
						'We will look at the photos and colors in their feed to sense what kind of bouquet fits them.'
				};
			}

			return {
				title: 'Their social world',
				description: `Upload a screenshot of ${recipientPronoun} feed. One glance is often enough to sense the mood.`
			};
		}

		const uploaded = /** @type {const} */ (['color', 'season', 'character', 'location']).filter(
			(key) => moodboardTiles[key]
		);
		const count = uploaded.length;

		if (count === 0) {
			return {
				title: 'Gather their mood',
				description: `Four small glimpses of color, season, character, and place. Together they become the palette for a bouquet made for ${recipientLabel}.`
			};
		}

		if (count === 1) {
			return MOODBOARD_TILE_COPY[uploaded[0]];
		}

		if (count === 4) {
			return {
				title: 'A moodboard whole',
				description:
					'Color, season, character, and place. The collage is complete, and their bouquet is ready to take shape.'
			};
		}

		if (count === 2) {
			return {
				title: 'Taking shape',
				description:
					'The moodboard is finding its rhythm. Keep adding. Each image is another note in their story.'
			};
		}

		return {
			title: 'Almost there',
			description: 'One last glimpse and their world will be fully gathered on the page.'
		};
	});

	const artworkTitle = $derived(artworkCopy.title);
	const artworkDescription = $derived(artworkCopy.description);

	const artworkCardMode = $derived.by(() => {
		if (mode === 'sns') return snsHasImage ? 'summary' : 'instruction';

		const count = ['color', 'season', 'character', 'location'].filter(
			(key) => moodboardTiles[key]
		).length;
		return count === 0 ? 'instruction' : 'summary';
	});

	/** create2(시작) → upload1(1장+) → upload2(전체 채움) */
	const artworkVariant = $derived.by(() => {
		if (mode === 'sns') {
			if (snsHasImage) return 'upload2';
			return 'create2';
		}

		const count = ['color', 'season', 'character', 'location'].filter(
			(key) => moodboardTiles[key]
		).length;
		if (count === 4) return 'upload2';
		if (count > 0) return 'upload1';
		return 'create2';
	});

	$effect(() => {
		writeUploadDraftMode(mode);
	});

	async function continueToMessage() {
		error = '';

		const flow = loadFlow();
		if (flow.jobId) {
			// Dev Fill 후 바로 message로 넘어갈 때 더미 플래그가 남지 않도록 정리
			deleteFlowKey('devUpload');
			deleteFlowKey('devSeeded');
			deleteFlowKey('cardMessage');
			await goto(resolve('/message'));
			return;
		}

		if (!primaryFile) {
			primaryFile = readPrimaryUploadFile();
		}

		if (!primaryFile) {
			error = 'Upload at least one image to continue.';
			return;
		}

		submitting = true;

		try {
			const result = await analyzeMood(primaryFile, userInput);
			deleteFlowKey('devUpload');
			deleteFlowKey('devSeeded');
			deleteFlowKey('devMessageSnapshot');
			deleteFlowKey('cardMessage');
			saveFlow({
				jobId: result.jobId,
				moodAnalysis: result.moodAnalysis ?? null,
				recipe: null,
				imagePrompt: null,
				images: null,
				imagesJobId: null,
				mock: result.mock
			});
			await goto(resolve('/message'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			submitting = false;
		}
	}
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={2} total={7} />
	<FlowNav
		backHref="/create"
		onContinue={continueToMessage}
		continueDisabled={submitting}
	/>

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork
			variant={artworkVariant}
			title={artworkTitle}
			description={artworkDescription}
			cardMode={artworkCardMode}
		/>

		<section
			class="relative flex min-h-0 flex-1 flex-col pt-4 lg:grid lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden lg:pt-6 lg:pb-8"
		>
			{#if error}
				<p class="mx-4 mb-3 rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5 lg:mx-6">
					{error}
				</p>
			{/if}

			<div class="mb-3 flex shrink-0 justify-center px-4 lg:mb-4 lg:px-6">
				<div
					class="relative grid w-full max-w-[15rem] grid-cols-2 items-center rounded-full bg-white p-1 shadow-md ring-1 ring-black/5"
					role="tablist"
					aria-label="Upload mode"
				>
					<span
						class="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-pill transition-transform duration-300 ease-out motion-reduce:transition-none"
						style:transform={mode === 'moodboard' ? 'translateX(100%)' : 'translateX(0)'}
						aria-hidden="true"
					></span>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'sns'}
						onclick={() => (mode = 'sns')}
						class={[
							'relative z-10 w-full rounded-full px-2 py-1.5 text-center text-xs whitespace-nowrap transition-colors',
							mode === 'sns' ? 'text-surface' : 'text-muted hover:text-ink'
						]}
					>
						SNS Feed
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'moodboard'}
						onclick={() => (mode = 'moodboard')}
						class={[
							'relative z-10 w-full rounded-full px-2 py-1.5 text-center text-xs whitespace-nowrap transition-colors',
							mode === 'moodboard' ? 'text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Moodboard
					</button>
				</div>
			</div>

			{#if mode === 'moodboard'}
				<MoodboardGrid bind:primaryFile bind:uploadedTiles={moodboardTiles} />
			{:else}
				<SnsFeedUpload bind:primaryFile bind:hasImage={snsHasImage} />
			{/if}
		</section>
	</main>
</div>
