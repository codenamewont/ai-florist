<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { editImages, fetchJob, finalizeJob, toDataUrl } from '$lib/flowerFlow/api.js';
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
	let mode = $state('whole');
	let drawing = $state(false);
	let selectionPoints = $state([]);
	let initialImage = $state(null);
	let generatedImage = $state(null);
	let recipe = $state(null);
	let editing = $state(false);
	let continuing = $state(false);
	let editHistory = $state([]);

	const imageSrc = $derived(toDataUrl(generatedImage));
	const title = $derived(recipe?.concept ?? 'Generated bouquet');
	const description = $derived(
		recipe?.mainFlowers?.length
			? `${recipe.mainFlowers.join(', ')} · ${recipe.wrapping ?? 'Custom wrap'}`
			: 'Review and refine your bouquet before choosing a size.'
	);
	const selectionPolyline = $derived(
		selectionPoints.map((point) => `${point.x},${point.y}`).join(' ')
	);
	const canSaveAreaPrompt = $derived(mode !== 'area' || selectionPoints.length > 2);
	const latestEditId = $derived(editHistory[editHistory.length - 1]?.id ?? '');

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
		if (mode !== 'area') return;
		event.preventDefault();
		/** @type {SVGElement} */ (event.currentTarget).setPointerCapture(event.pointerId);
		drawing = true;
		selectionPoints = [getPoint(event)];
	}

	/** @param {PointerEvent} event */
	function draw(event) {
		if (!drawing || mode !== 'area') return;
		event.preventDefault();
		selectionPoints = [...selectionPoints, getPoint(event)];
	}

	function stopDrawing() {
		drawing = false;
	}

	function clearSelection() {
		selectionPoints = [];
	}

	/** @param {string} text */
	function addQuickPrompt(text) {
		prompt = prompt ? `${prompt}, ${text.toLowerCase()}` : text;
	}

	function getEditInstruction() {
		if (!prompt.trim()) {
			error = 'Tell us what to change first.';
			return null;
		}

		if (!canSaveAreaPrompt) {
			error = 'Draw the area you want to change first.';
			return null;
		}

		return {
			mode,
			prompt: prompt.trim(),
			selection: mode === 'area' ? selectionPoints : []
		};
	}

	async function applyEdit() {
		const instruction = getEditInstruction();
		if (!instruction || !jobId) return;

		editing = true;
		error = '';

		try {
			const result = await editImages(jobId, instruction);
			const afterImage = result.images?.primary ?? null;
			generatedImage = afterImage;
			editHistory = [
				...editHistory,
				{
					id: `${Date.now()}-${editHistory.length}`,
					instruction,
					afterImage
				}
			];
			prompt = '';
			selectionPoints = [];
			saveFlow({
				editInstruction: instruction,
				imagePrompt: result.imagePrompt,
				mock: result.mock
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Edit failed';
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
			recipe = job.recipe ?? null;
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load generated bouquet';
			loading = false;
		}
	});
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={5} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<section
			class="flex min-h-0 w-full shrink-0 flex-col border-b border-line px-6 py-6 lg:w-[44%] lg:border-r lg:border-b-0 lg:px-10 lg:py-8"
		>
			<div class="mx-auto flex min-h-0 w-full max-w-100 flex-1 flex-col justify-center gap-6">
				<div class="overflow-hidden bg-track shadow-sm ring-1 ring-black/5">
					{#if loading}
						<div class="aspect-[4/5] w-full animate-pulse bg-placeholder"></div>
					{:else if imageSrc}
						<img src={imageSrc} alt="Generated bouquet" class="aspect-[4/5] w-full object-cover" />
					{:else}
						<div class="aspect-[4/5] w-full bg-placeholder"></div>
					{/if}
				</div>

				<div class="border border-line-strong bg-surface px-5 py-4">
					<h1 class="text-sm">{title}</h1>
					<p class="mt-2 text-xs leading-relaxed text-muted">{description}</p>
				</div>
			</div>
		</section>

		<section class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<div class="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-5 lg:py-6">
				<div class="shrink-0">
					<p class="text-xs tracking-[0.2em] text-muted uppercase">Edit bouquet</p>
					<h2 class="mt-1 text-lg">Tell us how you want to refine it.</h2>
				</div>

				<div class="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
					<div class="space-y-2">
						<p class="text-xs text-muted">Generated image</p>
						<div class="relative w-[42%] overflow-hidden bg-track ring-1 ring-black/5">
							{#if initialImage}
								<img
									src={toDataUrl(initialImage)}
									alt="Generated bouquet"
									class={[
										'aspect-[4/5] w-full object-contain',
										mode === 'area' && editHistory.length === 0 ? 'opacity-75' : ''
									]}
									draggable="false"
								/>
							{:else if imageSrc}
								<img
									src={imageSrc}
									alt="Generated bouquet"
									class={[
										'aspect-[4/5] w-full object-contain',
										mode === 'area' && editHistory.length === 0 ? 'opacity-75' : ''
									]}
									draggable="false"
								/>
							{:else}
								<div class="aspect-[4/5] w-full bg-placeholder"></div>
							{/if}

							{#if mode === 'area' && editHistory.length === 0}
								<svg
									class="absolute inset-0 h-full w-full touch-none"
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
											fill="rgba(255,255,255,0.18)"
											stroke="white"
											stroke-width="0.8"
											stroke-dasharray="1.4 1.2"
											vector-effect="non-scaling-stroke"
										/>
										{#each selectionPoints.filter((_, index) => index % 8 === 0) as point, index (index)}
											<circle cx={point.x} cy={point.y} r="0.8" fill="white" />
										{/each}
									{/if}
								</svg>
							{/if}
						</div>
					</div>

					{#each editHistory as edit (edit.id)}
						<div class="space-y-4">
							<div class="flex justify-end">
								<div
									class="max-w-[46%] rounded-3xl bg-pill px-4 py-3 text-sm leading-relaxed text-surface"
								>
									<p>{edit.instruction.prompt}</p>
									{#if edit.instruction.mode === 'area'}
										<p class="mt-2 text-xs opacity-70">Selected area only</p>
									{/if}
								</div>
							</div>

							<div class="space-y-2">
								<div class="relative w-[42%] overflow-hidden bg-track ring-1 ring-black/5">
									{#if edit.afterImage}
										<img
											src={toDataUrl(edit.afterImage)}
											alt="Edited bouquet result"
											class={[
												'aspect-[4/5] w-full object-contain',
												mode === 'area' && edit.id === latestEditId ? 'opacity-75' : ''
											]}
											draggable="false"
										/>
									{/if}

									{#if mode === 'area' && edit.id === latestEditId}
										<svg
											class="absolute inset-0 h-full w-full touch-none"
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
													fill="rgba(255,255,255,0.18)"
													stroke="white"
													stroke-width="0.8"
													stroke-dasharray="1.4 1.2"
													vector-effect="non-scaling-stroke"
												/>
												{#each selectionPoints.filter((_, index) => index % 8 === 0) as point, index (index)}
													<circle cx={point.x} cy={point.y} r="0.8" fill="white" />
												{/each}
											{/if}
										</svg>
									{/if}
								</div>
								<p class="text-xs text-muted">Result</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="flex shrink-0 rounded-full bg-track p-1 ring-1 ring-black/5">
					<button
						type="button"
						onclick={() => (mode = 'whole')}
						class={[
							'flex-1 rounded-full px-4 py-2 text-sm transition-colors',
							mode === 'whole' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Whole image
					</button>
					<button
						type="button"
						onclick={() => (mode = 'area')}
						class={[
							'flex-1 rounded-full px-4 py-2 text-sm transition-colors',
							mode === 'area' ? 'bg-pill text-surface' : 'text-muted hover:text-ink'
						]}
					>
						Select area
					</button>
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

				<div class="shrink-0 space-y-2">
					<textarea
						bind:value={prompt}
						rows="2"
						placeholder={mode === 'area'
							? 'Tell me how to change the selected area...'
							: 'Tell me how you would like to change your bouquet...'}
						class="w-full resize-none rounded-[2rem] border border-pill bg-surface px-6 py-3 text-sm outline-none placeholder:text-muted"
					></textarea>

					<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
						<p>
							{#if mode === 'area'}
								Draw over the bouquet, then describe only that selected area.
							{:else}
								Prompt applies to the whole generated bouquet.
							{/if}
						</p>

						{#if selectionPoints.length > 0}
							<button type="button" class="underline hover:text-ink" onclick={clearSelection}>
								Clear selection
							</button>
						{/if}
					</div>
				</div>

				<div class="shrink-0 space-y-2">
					{#if error}
						<p class="rounded bg-surface/95 px-3 py-2 text-sm text-red-600 ring-1 ring-black/5">
							{error}
						</p>
					{:else if editing}
						<p class="rounded bg-surface/95 px-3 py-2 text-sm text-muted ring-1 ring-black/5">
							Editing bouquet image...
						</p>
					{/if}

					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							class="border border-pill px-4 py-3 text-sm text-ink disabled:opacity-50"
							disabled={!prompt.trim() || editing || continuing}
							onclick={applyEdit}
						>
							{editing ? 'Applying...' : 'Apply edit'}
						</button>
						<button
							type="button"
							class="bg-pill px-4 py-3 text-sm text-surface"
							disabled={editing || continuing}
							onclick={continueToResult}
						>
							{continuing ? 'Preparing result...' : 'Continue to result'}
						</button>
					</div>
				</div>
			</div>
		</section>
	</main>
</div>
