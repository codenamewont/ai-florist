/** @typedef {'ribbon/bow' | 'wrapping paper' | 'flower' | 'leaf' | 'stem' | 'selected object'} AreaEditTarget */

/** @typedef {{ x: number, y: number }} PercentPoint */

/**
 * @typedef {Object} AreaEditIntent
 * @property {AreaEditTarget} targetObject
 * @property {string} normalizedPrompt
 * @property {boolean} isColorChange
 * @property {PercentPoint} selectionCentroid
 * @property {{ minX: number, maxX: number, minY: number, maxY: number }} selectionBounds
 */

/**
 * @param {PercentPoint[]} selection
 * @returns {{ minX: number, maxX: number, minY: number, maxY: number, centroid: PercentPoint }}
 */
export function analyzeSelectionGeometry(selection) {
	let minX = 100;
	let maxX = 0;
	let minY = 100;
	let maxY = 0;
	let sumX = 0;
	let sumY = 0;

	for (const point of selection) {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
		sumX += point.x;
		sumY += point.y;
	}

	const count = Math.max(selection.length, 1);

	return {
		minX,
		maxX,
		minY,
		maxY,
		centroid: { x: sumX / count, y: sumY / count }
	};
}

/**
 * @param {string} userPrompt
 */
export function isVagueColorChangePrompt(userPrompt) {
	const lower = userPrompt.trim().toLowerCase();

	return (
		/color|colour|색|톤|tone|hue|shade|tint|darken|lighten|black|white|red|blue|green|pink|gold|silver|ivory|navy|beige|brown|gray|grey|다른|변경|바꿔|바꾸|칠|색상/.test(
			lower
		) &&
		!/replace|swap|add|remove|delete|more|less|volume|romantic|warm|bigger|smaller|꽃|flower|rose|tulip|ribbon|bow|wrapping|paper|leaf|stem|리본|포장|줄기|잎/.test(
			lower
		)
	);
}

/**
 * @param {string} userPrompt
 */
export function isColorChangePrompt(userPrompt) {
	const lower = userPrompt.trim().toLowerCase();
	return /color|colour|색|톤|tone|hue|shade|tint|darken|lighten|black|white|red|blue|green|pink|gold|silver|ivory|navy|beige|brown|gray|grey|다른|변경|바꿔|바꾸|칠|색상/.test(
		lower
	);
}

/**
 * @param {string} userPrompt
 * @param {PercentPoint} centroid
 * @returns {AreaEditTarget | null}
 */
function inferTargetFromPromptAndPosition(userPrompt, centroid) {
	const lower = userPrompt.trim().toLowerCase();

	if (/ribbon|bow|리본|보우/.test(lower)) return 'ribbon/bow';
	if (/wrapping|wrap paper|paper wrap|포장|싸개|포장지/.test(lower)) return 'wrapping paper';
	if (/flower|bloom|petal|rose|tulip|꽃|장미|튤립/.test(lower)) return 'flower';
	if (/leaf|foliage|greenery|잎|잎사귀|그린/.test(lower)) return 'leaf';
	if (/stem|줄기|가지/.test(lower)) return 'stem';

	if (centroid.y >= 58 && centroid.x >= 30 && centroid.x <= 70 && isColorChangePrompt(userPrompt)) {
		return 'ribbon/bow';
	}

	if (centroid.y <= 45) return 'flower';
	if (centroid.y >= 70 && centroid.x >= 25 && centroid.x <= 75) return 'wrapping paper';

	return null;
}

/**
 * @param {AreaEditTarget} targetObject
 */
function materialPreserveSuffix(targetObject) {
	if (targetObject === 'ribbon/bow') {
		return ' Preserve the ribbon folds, highlights, shadows, and fabric texture.';
	}

	if (targetObject === 'wrapping paper') {
		return ' Preserve paper creases, shadows, and wrapping shape.';
	}

	if (targetObject === 'flower' || targetObject === 'leaf' || targetObject === 'stem') {
		return ' Preserve natural petal or plant texture, shadows, and edges.';
	}

	return ' Preserve the object shape, texture, shadows, and highlights.';
}

/**
 * @param {string} userPrompt
 * @param {AreaEditTarget} targetObject
 */
export function normalizeAreaEditPrompt(userPrompt, targetObject) {
	const trimmed = userPrompt.trim();
	const lower = trimmed.toLowerCase();
	const label = targetObject === 'selected object' ? 'selected object' : `the ${targetObject}`;

	const blackMatch = lower.match(
		/(?:change|make|turn|set|to|into|색.*?)?\s*(?:color|colour|색)?\s*(?:to|into|as|를|을)?\s*black|검정|검은/
	);
	if (blackMatch) {
		return `Change only ${label} color to black.${materialPreserveSuffix(targetObject)}`;
	}

	if (/use other color|different color|another color|other colour|different colour|다른 색|다른색|색 바꿔|색상 변경/.test(lower)) {
		return `Change only ${label} to a different harmonious color.${materialPreserveSuffix(targetObject)}`;
	}

	if (/^change color$|^change colour$|^change the color$|^change the colour$|^색 변경$|^색 바꿔$/.test(lower)) {
		return `Change only ${label} color.${materialPreserveSuffix(targetObject)}`;
	}

	if (isVagueColorChangePrompt(trimmed)) {
		return `Change only ${label} color.${materialPreserveSuffix(targetObject)}`;
	}

	if (targetObject === 'ribbon/bow' && isColorChangePrompt(trimmed)) {
		return `Change only ${label} color as requested: ${trimmed}.${materialPreserveSuffix(targetObject)}`;
	}

	return trimmed;
}

/**
 * @param {{
 *   userPrompt: string,
 *   selection: PercentPoint[],
 *   imageWidth?: number,
 *   imageHeight?: number
 * }} options
 * @returns {AreaEditIntent}
 */
export function inferAreaEditTarget(options) {
	const { userPrompt, selection } = options;
	const geometry = analyzeSelectionGeometry(selection);
	const inferred = inferTargetFromPromptAndPosition(userPrompt, geometry.centroid);
	const targetObject = inferred ?? 'selected object';
	const normalizedPrompt = normalizeAreaEditPrompt(userPrompt, targetObject);

	return {
		targetObject,
		normalizedPrompt,
		isColorChange: isColorChangePrompt(userPrompt),
		selectionCentroid: geometry.centroid,
		selectionBounds: {
			minX: geometry.minX,
			maxX: geometry.maxX,
			minY: geometry.minY,
			maxY: geometry.maxY
		}
	};
}
