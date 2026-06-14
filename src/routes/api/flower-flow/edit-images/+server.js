import { requireJob, updateJob } from '$lib/server/flowerFlow/jobStore.js';
import { uploadGeneratedImages } from '$lib/server/flowerFlow/imageStorage.js';
import {
	generateBouquetImage,
	getImageProvider,
	isImageGenerationConfigured
} from '$lib/server/gemini/image.js';
import { buildImagePrompt, applyRecipeEdit } from '$lib/server/gemini/text.js';
import { json, readJsonBody, toErrorResponse } from '$lib/server/http.js';

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
 * @param {{ mode: string, prompt: string, selection: unknown }} instruction
 */
function describeEditInstruction(instruction) {
	const lines = [
		'EDIT REQUEST:',
		instruction.prompt,
		'',
		'This is a refinement of one existing bouquet photo, not a new collage.',
		'Preserve the same bouquet concept, camera angle, background, wrapping style, and realistic florist photography unless the edit request explicitly says otherwise.',
		'Output exactly one bouquet in a single composition. Never show two bouquets, side-by-side views, comparison panels, or duplicated arrangements.'
	];

	if (instruction.mode === 'area') {
		lines.push(
			'The user drew a target area on the image. Apply the edit only to that visual region as much as possible, while keeping the rest of the bouquet unchanged.',
			`Selection points are normalized image coordinates: ${JSON.stringify(instruction.selection)}`
		);
	}

	return lines.join('\n');
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
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

		const updatedRecipe = await applyRecipeEdit(job.recipe, prompt);
		const basePrompt = job.imagePrompt ?? (await buildImagePrompt(updatedRecipe));
		const editPrompt = `${basePrompt}\n\n${describeEditInstruction({ mode, prompt, selection })}`;

		console.log(
			`[flower-flow] edit-images job=${jobId.slice(0, 8)} provider=${getImageProvider()} mode=${mode} → generating...`
		);
		const generatedImage = await generateBouquetImage(editPrompt, { edit: true });
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

		return json({
			jobId,
			recipe: updatedRecipe,
			imagePrompt: editPrompt,
			images,
			mock: !isImageGenerationConfigured()
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
