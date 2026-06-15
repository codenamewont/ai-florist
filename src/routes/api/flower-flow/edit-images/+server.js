import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { loadGeneratedImageBytes } from '$lib/server/flowerFlow/loadGeneratedImage.js';
import { buildAreaEditMask } from '$lib/server/flowerFlow/selectionMask.js';
import { uploadGeneratedImages } from '$lib/server/flowerFlow/imageStorage.js';
import { formatBouquetEditPrompt } from '$lib/flowerFlow/bouquetImageFormat.js';
import { normalizeRecipeLists } from '$lib/flowerFlow/resolveRecipeFlowers.js';
import { editBouquetImage, isImageGenerationConfigured } from '$lib/server/gemini/image.js';
import { applyRecipeEdit } from '$lib/server/gemini/text.js';
import { RATE_LIMITS } from '$lib/server/rateLimit.js';
import { enforceRateLimit, json, readJsonBody, toErrorResponse } from '$lib/server/http.js';

/**
 * @param {unknown} value
 */
function isPointArray(value) {
	return (
		Array.isArray(value) &&
		value.every(
			(point) =>
				point &&
				typeof point === 'object' &&
				typeof point.x === 'number' &&
				typeof point.y === 'number'
		)
	);
}

/**
 * Dedupe concurrent edits for the same job (double-submit / rapid clicks).
 * @type {Map<string, Promise<{ recipe: import('$lib/server/flowerFlow/jobStore.js').BouquetRecipe, imagePrompt: string, images: { primary: import('$lib/server/flowerFlow/jobStore.js').GeneratedImage } }>>}
 */
const inFlight = new Map();

/**
 * @param {string} jobId
 * @param {import('$lib/server/flowerFlow/jobStore.js').FlowerJob} job
 * @param {{ mode: 'area' | 'whole', prompt: string, selection: Array<{ x: number, y: number }> }} instruction
 */
function editForJob(jobId, job, instruction) {
	const existing = inFlight.get(jobId);
	if (existing) return existing;

	const task = (async () => {
		const priorRecipe = normalizeRecipeLists(job.recipe);
		const updatedRecipe = await applyRecipeEdit(job.recipe, instruction.prompt);
		const recipeChanged = JSON.stringify(updatedRecipe) !== JSON.stringify(priorRecipe);

		const sourceImage = await loadGeneratedImageBytes(job.images.primary);
		const editPrompt = formatBouquetEditPrompt({
			userPrompt: instruction.prompt,
			mode: instruction.mode,
			selection: instruction.selection,
			recipe: updatedRecipe,
			recipeChanged
		});

		const mask =
			instruction.mode === 'area' && instruction.selection.length >= 3
				? buildAreaEditMask(sourceImage, instruction.selection)
				: null;

		console.log(
			`[flower-flow] edit-images job=${jobId.slice(0, 8)} mode=${instruction.mode}${mask ? ' (masked)' : ''} → editing...`
		);
		const generatedImage = await editBouquetImage(sourceImage, editPrompt, { mask });
		const images = await uploadGeneratedImages(
			jobId,
			generatedImage,
			`edit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
		);
		await updateJob(jobId, {
			recipe: updatedRecipe,
			imagePrompt: editPrompt,
			images,
			floristNote: null
		});
		console.log(
			`[flower-flow] edit-images job=${jobId.slice(0, 8)} OK (mock=${!isImageGenerationConfigured()})`
		);

		return { recipe: updatedRecipe, imagePrompt: editPrompt, images };
	})().finally(() => {
		inFlight.delete(jobId);
	});

	inFlight.set(jobId, task);
	return task;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, getClientAddress }) {
	try {
		const limited = enforceRateLimit(getClientAddress(), RATE_LIMITS.imageEdit, 'edit-images');
		if (limited) return limited;

		const body = await readJsonBody(request);
		const jobId = typeof body.jobId === 'string' ? body.jobId : '';
		const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
		const mode = body.mode === 'area' ? 'area' : 'whole';
		const selection = isPointArray(body.selection) ? body.selection : [];

		if (!jobId) {
			return json({ error: 'jobId is required', code: 'bad_request' }, 400);
		}

		if (!prompt) {
			return json({ error: 'prompt is required', code: 'bad_request' }, 400);
		}

		if (mode === 'area' && selection.length < 3) {
			return json({ error: 'selection is required for area edits', code: 'bad_request' }, 400);
		}

		const job = await requireJob(jobId);

		if (!job.recipe) {
			return json({ error: 'recipe is missing. Run recipe first.', code: 'bad_request' }, 400);
		}

		if (!job.images?.primary) {
			return json(
				{ error: 'bouquet image is missing. Generate images first.', code: 'bad_request' },
				400
			);
		}

		const { recipe, imagePrompt, images } = await editForJob(jobId, job, {
			mode,
			prompt,
			selection
		});

		return json({
			jobId,
			recipe,
			imagePrompt,
			images,
			mock: !isImageGenerationConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
