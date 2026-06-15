/** Bouquet preview framing shared by Artwork, edit chat, and image generation prompts. */

export const BOUQUET_IMAGE_ASPECT = '3:4';

export const BOUQUET_IMAGE_ASPECT_PROMPT =
	'Vertical portrait composition with a 3:4 aspect ratio (width:height). Frame the full bouquet without cropping stems or wrapping.';

/**
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[] }} recipe
 */
export function getRecipeFlowerLists(recipe) {
	const mains = (recipe.mainFlowers ?? []).filter(Boolean);
	const subs = (recipe.subFlowers ?? []).filter(Boolean);
	const greenery = (recipe.greenery ?? []).filter(Boolean);

	return {
		mains,
		subs,
		greenery,
		allFlowers: [...mains, ...subs, ...greenery]
	};
}

/**
 * Strict flower list + hard constraints shared by generation and edit prompts.
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[], colors?: string[], wrapping?: string, shape?: string }} recipe
 * @returns {string}
 */
export function formatStrictRecipeConstraints(recipe) {
	const { mains, subs, greenery, allFlowers } = getRecipeFlowerLists(recipe);

	return [
		'STRICT RECIPE — the bouquet must contain ONLY these flowers and NO other flower species:',
		allFlowers.length > 0
			? allFlowers.map((flower) => `- ${flower}`).join('\n')
			: '- (none listed)',
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
		'- Include EVERY listed flower without omission — each must be clearly visible; none may be missing, hidden, or left out',
		'- Do not swap or substitute any listed species unless the edit request explicitly requires that change',
		'- Real cut flowers only; no fantasy colors or impossible hybrids',
		`- ${BOUQUET_IMAGE_ASPECT_PROMPT}`,
		'- White background, soft natural lighting, front-facing, orderable from a real Korean florist'
	].join('\n');
}

/**
 * Deterministic image prompt — recipe is the sole source of truth for flower species.
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[], colors?: string[], wrapping?: string, shape?: string }} recipe
 * @returns {string}
 */
export function formatStrictBouquetImagePrompt(recipe) {
	return [
		'Generate a realistic Korean florist bouquet product photo.',
		'',
		formatStrictRecipeConstraints(recipe)
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
	const isAreaEdit = mode === 'area' && selection && selection.length >= 3;

	if (isAreaEdit) {
		return [
			'You are editing the attached florist bouquet photograph with a binary mask.',
			'This is a localized inpainting edit — NOT a full bouquet redesign or re-render.',
			'',
			`Edit request (masked region only): ${userPrompt}`,
			'',
			'How to edit inside the mask:',
			'- Apply the edit request only to whatever is inside the transparent mask region (flowers, ribbon, wrapping, foliage, etc.)',
			'- The request may be a color/style tweak OR a content swap — e.g. replace blooms in this area with roses, change ribbon color, adjust wrapping',
			'- When swapping flowers inside the mask, render the requested species naturally in that region; blend stems, lighting, and edges with the surrounding bouquet',
			'- Keep realistic material detail — petal texture, fabric folds, paper creases, shadows, and lighting — seamless with the rest of the photo',
			'- Do not paste a flat color block; the edited area should look naturally photographed',
			'- Do not use solid black unless the user explicitly asked for black',
			'',
			'Mask rules (mandatory):',
			'- Transparent pixels in the attached mask = the ONLY area you may change',
			'- Opaque pixels in the mask = leave completely unchanged',
			'- Do NOT recolor, restyle, brighten, blur, regenerate, or swap species outside the mask',
			'- Do NOT apply the edit request to the whole image',
			'',
			'Preserve everywhere outside the mask:',
			'- All flowers, foliage, wrapping, ribbon, background, lighting, and framing exactly as in the input photo',
			'',
			'Output exactly one edited photo. No before/after collage.'
		].join('\n');
	}

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

	if (recipeChanged) {
		lines.push(
			'',
			'This edit changes the flower list. Update only the affected blooms in the photo; keep every other listed species exactly as before.'
		);
	}

	if (recipe) {
		lines.push('', formatStrictRecipeConstraints(recipe));
	}

	lines.push(
		'',
		`Output exactly one edited bouquet photo. ${BOUQUET_IMAGE_ASPECT_PROMPT}`,
		'No side-by-side, before/after, or duplicate bouquets.'
	);

	return lines.join('\n');
}
