/** Bouquet preview framing shared by Artwork, edit chat, and image generation prompts. */

export const BOUQUET_IMAGE_ASPECT = '3:4';

export const BOUQUET_IMAGE_ASPECT_PROMPT =
	'Vertical portrait composition with a 3:4 aspect ratio (width:height). Frame the full bouquet without cropping stems or wrapping.';

/**
 * Deterministic image prompt — recipe is the sole source of truth for flower species.
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[], colors?: string[], wrapping?: string, shape?: string }} recipe
 * @returns {string}
 */
export function formatStrictBouquetImagePrompt(recipe) {
	const mains = (recipe.mainFlowers ?? []).filter(Boolean);
	const subs = (recipe.subFlowers ?? []).filter(Boolean);
	const greenery = (recipe.greenery ?? []).filter(Boolean);
	const allFlowers = [...mains, ...subs, ...greenery];

	return [
		'Generate a realistic Korean florist bouquet product photo.',
		'',
		'STRICT RECIPE — the bouquet must contain ONLY these flowers and NO other flower species:',
		allFlowers.length > 0 ? allFlowers.map((flower) => `- ${flower}`).join('\n') : '- (none listed)',
		'',
		`Main focal blooms (each must be clearly visible): ${mains.join(', ') || 'none'}`,
		`Supporting filler/line flowers (each must appear): ${subs.join(', ') || 'none'}`,
		`Greenery (must appear): ${greenery.join(', ') || 'none'}`,
		`Colors: ${(recipe.colors ?? []).join(', ') || 'natural harmony'}`,
		`Wrapping: ${recipe.wrapping || 'neutral florist wrap'}`,
		`Shape: ${recipe.shape || 'balanced hand-tied bouquet'}`,
		'',
		'Hard constraints:',
		'- Do NOT add any flower, filler, or foliage species not listed above',
		'- EVERY species listed above MUST appear in the final image',
		'- Real cut flowers only; no fantasy colors or impossible hybrids',
		`- ${BOUQUET_IMAGE_ASPECT_PROMPT}`,
		'- White background, soft natural lighting, front-facing, orderable from a real Korean florist'
	].join('\n');
}

/**
 * Prompt for editing an existing bouquet photo (reference image passed separately).
 * @param {{
 *   userPrompt: string,
 *   mode?: string,
 *   selection?: Array<{ x: number, y: number }>,
 *   recipe?: { mainFlowers?: string[], subFlowers?: string[], greenery?: string[] },
 *   recipeChanged?: boolean
 * }} options
 * @returns {string}
 */
export function formatBouquetEditPrompt(options) {
	const { userPrompt, mode, selection, recipe, recipeChanged = false } = options;

	const lines = [
		'You are editing the attached florist bouquet photograph.',
		'This is an image edit — modify the provided photo in place. Do not generate an unrelated new bouquet from scratch.',
		'',
		`Edit request: ${userPrompt}`,
		'',
		'Preserve unless the edit request explicitly requires a change:',
		'- Camera angle, white background, soft lighting, and overall framing',
		'- Wrapping paper, ribbon, and bouquet shape',
		'- Every flower species and greenery not involved in the edit request'
	];

	if (recipeChanged && recipe) {
		lines.push(
			'',
			'This edit changes the flower list. Update only the affected blooms; keep the rest of the arrangement intact:',
			`Main blooms: ${(recipe.mainFlowers ?? []).join(', ') || 'none'}`,
			`Filler/line: ${(recipe.subFlowers ?? []).join(', ') || 'none'}`,
			`Greenery: ${(recipe.greenery ?? []).join(', ') || 'none'}`
		);
	}

	if (mode === 'area' && selection && selection.length >= 3) {
		lines.push(
			'',
			'Apply the edit ONLY inside the marked region shown in the attached mask image.',
			'White area in the mask = edit zone. Black area = do not change.',
			'Leave everything outside the marked region pixel-accurate to the original photo.'
		);
	}

	lines.push(
		'',
		`Output exactly one edited bouquet photo. ${BOUQUET_IMAGE_ASPECT_PROMPT}`,
		'No side-by-side, before/after, or duplicate bouquets.'
	);

	return lines.join('\n');
}
