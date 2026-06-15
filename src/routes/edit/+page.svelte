<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import DescriptionCard from '$lib/components/ui/Artwork/DescriptionCard.svelte';
	import FlowContinueBar, {
		FLOW_CONTINUE_BUTTON
	} from '$lib/components/ui/FlowContinueBar.svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { editImages, fetchJob, finalizeJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { buildBriefBouquetTitle } from '$lib/flowerFlow/resolveRecipeFlowers.js';
	import { getFlowString, saveFlow } from '$lib/flowerFlow/session.js';

	const jobId = getFlowString('jobId');
	const QUICK_PROMPTS = [
		'Make it more romantic',
		'Use warmer colors',
		'Add more volume',
		'Keep the same flowers'
	];

	let loading = $state(true);
	let error = $state('');
	let prompt = $state('');
	let areaSelectionActive = $state(false);
	let drawing = $state(false);
	let selectionPoints = $state([]);
	let initialImage = $state(null);
	let generatedImage = $state(null);
	let moodAnalysis = $state(null);
	let editing = $state(false);
	let continuing = $state(false);
	/** @type {Array<{ id: string, role: 'user' | 'assistant', prompt?: string, mode?: string, status?: 'pending' | 'done' | 'error', afterImage?: { mimeType: string, base64: string } | null, error?: string }>} */
	let chatMessages = $state([]);
	/** @type {HTMLDivElement | null} */
	let chatScrollEl = $state(null);

	const imageSrc = $derived(toDataUrl(generatedImage));
	const hasAreaSelection = $derived(selectionPoints.length > 2);
	const title = $derived(buildBriefBouquetTitle(moodAnalysis));
	const description = $derived.by(() => {
		if (hasAreaSelection) {
			return 'Your prompt will apply to the marked area only.';
		}

		if (areaSelectionActive) {
			return 'Use the pencil to draw a red outline, then describe that area.';
		}

		return 'Tap the pencil on the image to mark an area, or edit the whole bouquet.';
	});
	const selectionPolyline = $derived(
		selectionPoints.map((point) => `${point.x},${point.y}`).join(' ')
	);
	const latestAssistantId = $derived.by(() => {
		for (let index = chatMessages.length - 1; index >= 0; index -= 1) {
			const message = chatMessages[index];
			if (message.role === 'assistant' && message.status === 'done') {
				return message.id;
			}
		}

		return '';
	});

	async function scrollChatToBottom() {
		await tick();
		if (!chatScrollEl) return;
		chatScrollEl.scrollTop = chatScrollEl.scrollHeight;
	}

	$effect(() => {
		chatMessages.length;
		editing;
		scrollChatToBottom();
	});

	/**
	 * @param {PointerEvent} event
	 */
	function getPoint(event) {
		const rect = /** @type {SVGElement} */ (event.currentTarget).getBoundingClientRect();
		return {
			x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
			y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
		};
	}

	/** @param {PointerEvent} event */
	function startDrawing(event) {
		if (!areaSelectionActive) return;
		event.preventDefault();
		/** @type {SVGElement} */ (event.currentTarget).setPointerCapture(event.pointerId);
		drawing = true;
		selectionPoints = [getPoint(event)];
	}

	/** @param {PointerEvent} event */
	function draw(event) {
		if (!drawing || !areaSelectionActive) return;
		event.preventDefault();
		selectionPoints = [...selectionPoints, getPoint(event)];
	}

	function stopDrawing() {
		drawing = false;
	}

	function startAreaSelection() {
		areaSelectionActive = true;
	}

	function cancelAreaSelection() {
		areaSelectionActive = false;
		drawing = false;
		selectionPoints = [];
	}

	function toggleAreaTool() {
		if (areaSelectionActive) {
			cancelAreaSelection();
			return;
		}

		startAreaSelection();
	}

	/** @param {string} text */
	function addQuickPrompt(text) {
		prompt = prompt ? `${prompt}, ${text.toLowerCase()}` : text;
	}

	/** @param {KeyboardEvent} event */
	function handlePromptKeydown(event) {
		if (event.key !== 'Enter' || event.shiftKey) return;
		event.preventDefault();
		applyEdit();
	}

	function getEditInstruction() {
		if (!prompt.trim()) {
			error = 'Tell us what to change first.';
			return null;
		}

		if (selectionPoints.length > 0 && !hasAreaSelection) {
			error = 'Finish drawing the area you want to change, or cancel with X.';
			return null;
		}

		return {
			mode: hasAreaSelection ? 'area' : 'whole',
			prompt: prompt.trim(),
			selection: hasAreaSelection ? selectionPoints : []
		};
	}

	async function applyEdit() {
		const instruction = getEditInstruction();
		if (!instruction || !jobId) return;

		const assistantMessageId = `assistant-${Date.now()}`;

		chatMessages = [
			...chatMessages,
			{
				id: `user-${Date.now()}`,
				role: 'user',
				prompt: instruction.prompt,
				mode: instruction.mode
			},
			{
				id: assistantMessageId,
				role: 'assistant',
				status: 'pending'
			}
		];
		prompt = '';
		cancelAreaSelection();
		error = '';
		editing = true;

		try {
			const result = await editImages(jobId, instruction);
			const afterImage = result.images?.primary ?? null;
			generatedImage = afterImage;
			chatMessages = chatMessages.map((message) =>
				message.id === assistantMessageId
					? { ...message, status: 'done', afterImage }
					: message
			);
			saveFlow({
				editInstruction: instruction,
				imagePrompt: result.imagePrompt,
				mock: result.mock
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Edit failed';
			chatMessages = chatMessages.map((entry) =>
				entry.id === assistantMessageId ? { ...entry, status: 'error', error: message } : entry
			);
			error = message;
		} finally {
			editing = false;
		}
	}

	async function continueToResult() {
		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		continuing = true;
		error = '';

		try {
			await finalizeJob(jobId);
			await goto(resolve('/result'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to continue to result';
			continuing = false;
		}
	}

	onMount(async () => {
		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			if (!job.images?.primary) {
				await goto(resolve('/generating'));
				return;
			}

			initialImage = job.images.primary;
			generatedImage = job.images.primary;
			moodAnalysis = job.moodAnalysis ?? null;
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load generated bouquet';
			loading = false;
		}
	});
</script>

{#snippet editableImageFrame(image, editable = false)}
	<div class="relative w-full max-w-44 sm:max-w-52 overflow-hidden bg-track ring-1 ring-black/5">
		{#if image}
			<img
				src={toDataUrl(image)}
				alt="Generated bouquet"
				class={[
					'aspect-[3/4] w-full object-contain object-center',
					editable && areaSelectionActive ? 'opacity-90' : ''
				]}
				draggable="false"
			/>
		{:else}
			<div class="aspect-[3/4] w-full bg-placeholder"></div>
		{/if}

		{#if editable && image}
			<button
				type="button"
				class="absolute top-2 right-2 z-20 flex size-8 items-center justify-center rounded-full bg-white/95 text-ink shadow-md ring-1 ring-black/10 transition-colors hover:bg-white"
				aria-label={areaSelectionActive ? 'Cancel area selection' : 'Select area to edit'}
				onclick={toggleAreaTool}
			>
				{#if areaSelectionActive}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						class="size-4"
						aria-hidden="true"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-4"
						aria-hidden="true"
					>
						<path d="M12 20h9" />
						<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
					</svg>
				{/if}
			</button>

			{#if areaSelectionActive}
				<svg
					class="absolute inset-0 z-10 h-full w-full touch-none"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					role="application"
					aria-label="Draw an area to edit"
					onpointerdown={startDrawing}
					onpointermove={draw}
					onpointerup={stopDrawing}
					onpointercancel={stopDrawing}
					onpointerleave={stopDrawing}
				>
					{#if selectionPoints.length > 1}
						<polyline
							points={selectionPolyline}
							fill="rgba(239,68,68,0.12)"
							stroke="#ef4444"
							stroke-width="1.2"
							vector-effect="non-scaling-stroke"
						/>
					{/if}
				</svg>
			{/if}
		{/if}
	</div>
{/snippet}

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={5} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<section
			class="flex min-h-0 w-full shrink-0 flex-col border-b border-line px-6 py-6 lg:w-[44%] lg:border-r lg:border-b-0 lg:px-10 lg:py-8 lg:pb-12"
		>
			<div class="mx-auto flex min-h-0 w-full max-w-100 flex-1 flex-col items-center justify-center gap-6">
				<div class="w-full max-w-24 overflow-hidden bg-track shadow-sm ring-1 ring-black/5 sm:max-w-28 lg:max-w-75">
					{#if loading}
						<div class="aspect-[3/4] w-full animate-pulse bg-placeholder"></div>
					{:else if imageSrc}
						<img
							src={imageSrc}
							alt="Generated bouquet"
							class="aspect-[3/4] w-full object-contain object-center"
						/>
					{:else}
						<div class="aspect-[3/4] w-full bg-placeholder"></div>
					{/if}
				</div>

				<DescriptionCard {title} {description} />
			</div>
		</section>

		<section class="relative flex min-h-0 flex-1 flex-col overflow-hidden pb-44 lg:pb-8">
			<div
				class="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-5 lg:py-6"
			>
				<div class="shrink-0">
					<p class="text-xs tracking-[0.2em] text-muted uppercase">Edit bouquet</p>
					<h2 class="mt-1 text-lg">Tell us how you want to refine it.</h2>
				</div>

				<div bind:this={chatScrollEl} class="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
					<div class="space-y-2">
						<p class="text-xs text-muted">Generated image</p>
						{@render editableImageFrame(initialImage ?? generatedImage, chatMessages.length === 0)}
					</div>

					{#each chatMessages as message (message.id)}
						{#if message.role === 'user'}
							<div class="flex justify-end">
								<div
									class="max-w-[46%] rounded-3xl bg-pill px-4 py-3 text-sm leading-relaxed text-surface"
								>
									<p>{message.prompt}</p>
									{#if message.mode === 'area'}
										<p class="mt-2 text-xs opacity-70">Selected area only</p>
									{/if}
								</div>
							</div>
						{:else if message.status === 'pending'}
							<div class="flex justify-start">
								<div
									class="max-w-[46%] rounded-3xl bg-track px-4 py-3 text-sm leading-relaxed text-muted ring-1 ring-black/5"
								>
									Editing bouquet image...
								</div>
							</div>
						{:else if message.status === 'error'}
							<div class="flex justify-start">
								<div
									class="max-w-[46%] rounded-3xl bg-surface px-4 py-3 text-sm leading-relaxed text-red-600 ring-1 ring-red-200"
								>
									{message.error}
								</div>
							</div>
						{:else}
							<div class="space-y-2">
								{@render editableImageFrame(message.afterImage, message.id === latestAssistantId)}
								<p class="text-xs text-muted">Result</p>
							</div>
						{/if}
					{/each}
				</div>

				<div class="flex shrink-0 flex-wrap gap-2">
					{#each QUICK_PROMPTS as quickPrompt (quickPrompt)}
						<button
							type="button"
							onclick={() => addQuickPrompt(quickPrompt)}
							class="rounded-full bg-placeholder px-3 py-1 text-xs text-ink hover:bg-line-strong"
						>
							{quickPrompt}
						</button>
					{/each}
				</div>
			</div>

			<FlowContinueBar class="lg:mx-auto lg:w-full lg:max-w-2xl">
				{#if error}
					<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
						{error}
					</p>
				{/if}

				<div class="flex w-full items-center gap-2 rounded-full border border-pill bg-surface py-1.5 pr-1.5 pl-5">
					<textarea
						bind:value={prompt}
						rows="1"
						placeholder={hasAreaSelection
							? 'Tell me how to change the selected area...'
							: areaSelectionActive
								? 'Draw on the image, then describe the area...'
								: 'Tell me how you would like to change your bouquet...'}
						onkeydown={handlePromptKeydown}
						class="max-h-24 min-h-6 flex-1 resize-none border-none bg-transparent py-1 text-sm leading-normal outline-none placeholder:text-muted"
					></textarea>

					<button
						type="button"
						aria-label={editing ? 'Applying edit' : 'Send edit'}
						disabled={!prompt.trim() || editing || continuing}
						onclick={applyEdit}
						class="flex size-9 shrink-0 items-center justify-center rounded-full bg-pill text-surface transition-opacity disabled:opacity-40"
					>
						{#if editing}
							<span
								class="size-4 animate-spin rounded-full border-2 border-surface/30 border-t-surface"
								aria-hidden="true"
							></span>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="size-4"
								aria-hidden="true"
							>
								<path d="M12 19V5" />
								<path d="m5 12 7-7 7 7" />
							</svg>
						{/if}
					</button>
				</div>

				<button
					type="button"
					disabled={editing || continuing}
					onclick={continueToResult}
					class={FLOW_CONTINUE_BUTTON}
				>
					{continuing ? 'Preparing result...' : 'Continue to result ->'}
				</button>
			</FlowContinueBar>
		</section>
	</main>
</div>
