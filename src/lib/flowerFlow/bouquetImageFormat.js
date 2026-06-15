/** Bouquet preview framing shared by Artwork, edit chat, and image generation prompts. */

export const BOUQUET_IMAGE_ASPECT = '3:4';

export const BOUQUET_IMAGE_ASPECT_PROMPT =
	'Vertical portrait composition with a 3:4 aspect ratio (width:height). Frame the full bouquet without cropping stems or wrapping.';

/** 최초 generate prompt opening — catalog 톤·장면 설정 */
export const BOUQUET_CATALOG_SCENE_PROMPT =
	'A professional florist product photograph of a handcrafted bouquet, photographed for a premium flower shop catalog.';

/** generate + whole edit 공통 — 인물/손 노출 방지 */
export const BOUQUET_NO_PERSON_CONSTRAINT =
	'Bouquet only. No person. No hands. No body parts visible.';

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
		`- ${BOUQUET_NO_PERSON_CONSTRAINT}`,
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
		BOUQUET_CATALOG_SCENE_PROMPT,
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
 *   recipeChanged?: boolean,
 *   targetObject?: string,
 *   normalizedPrompt?: string
 * }} options
 * @returns {string}
 */
export function formatBouquetEditPrompt(options) {
	const {
		userPrompt,
		mode,
		selection,
		recipe,
		recipeChanged = false,
		targetObject = 'selected object',
		normalizedPrompt = userPrompt
	} = options;
	const isAreaEdit = mode === 'area' && selection && selection.length >= 3;

	if (isAreaEdit) {
		return [
			'You are editing a realistic bouquet product photo.',
			'The transparent mask is only a rough localization guide.',
			'Do NOT fill the entire masked shape.',
			'Identify the actual object inside the selected area that matches the user request.',
			"Edit only that object's visible surface.",
			"Preserve the object's original shape, folds, shadows, highlights, texture, and boundaries.",
			'Preserve all unselected objects exactly: flowers, leaves, stems, wrapping paper, background, lighting, and composition.',
			'If the request is a color change, recolor only the target object material while keeping realistic shading.',
			'Do not add new flowers, new ribbon, new objects, text, hands, or people.',
			'Do not paint a flat solid color block inside the mask.',
			'',
			`User request: ${userPrompt}`,
			`Inferred target object: ${targetObject}`,
			`Normalized edit instruction: ${normalizedPrompt}`,
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
