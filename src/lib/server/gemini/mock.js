/** @typedef {import('../flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('../flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */

import { formatStrictBouquetImagePrompt } from '../../flowerFlow/bouquetImageFormat.js';

/** @returns {MoodAnalysis} */
export function mockMoodAnalysis() {
	return {
		colorPalette: ['pale pink', 'ivory', 'light green'],
		moodKeywords: ['soft', 'warm', 'natural'],
		styleImpression: ['minimal', 'romantic'],
		textureKeywords: ['airy', 'delicate'],
		energyLevel: 'medium'
	};
}

/**
 * @param {Partial<import('../flowerFlow/jobStore.js').UserInput>} userInput
 * @returns {BouquetRecipe}
 */
export function mockRecipe(userInput = {}) {
	const budget = userInput.budget
		? `around ₩${userInput.budget.toLocaleString('en-US')}`
		: 'around ₩50,000';

	const notes = userInput.notes?.toLowerCase() ?? '';

	/** @type {string[]} */
	let mainFlowers = ['Pink tulip'];
	/** @type {string} */
	let concept = 'Soft Romantic Tulip Bouquet';

	if (/love|사랑/.test(notes)) {
		mainFlowers = ['Red rose'];
		concept = 'Romantic Rose Bouquet';
	} else if (/thank|grateful|감사/.test(notes)) {
		mainFlowers = ['Dahlia'];
		concept = 'Grateful Dahlia Bouquet';
	} else if (/proud|congratul/.test(notes)) {
		mainFlowers = ['Sunflower'];
		concept = 'Celebratory Sunflower Bouquet';
	} else if (/birthday|happy/.test(notes)) {
		mainFlowers = ['Gerbera'];
		concept = 'Cheerful Gerbera Bouquet';
	}

	return {
		concept,
		mainFlowers,
		subFlowers: ["Baby's breath", 'Seasonal white flowers'],
		greenery: ['Eucalyptus'],
		colors: ['pale pink', 'ivory', 'soft green'],
		wrapping: 'ivory paper with pale pink ribbon',
		shape: 'loose round bouquet',
		budget
	};
}

/** @param {BouquetRecipe} recipe */
export function mockImagePrompt(recipe) {
	return formatStrictBouquetImagePrompt(recipe);
}

/** @param {string} [label] */
export function mockGeneratedImage(label = 'Bouquet') {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
		<rect width="768" height="1024" fill="#f7f3ef"/>
		<text x="50%" y="48%" text-anchor="middle" font-size="42" fill="#6b5b53" font-family="Arial">Mock ${label}</text>
		<text x="50%" y="54%" text-anchor="middle" font-size="22" fill="#9a8d84" font-family="Arial">Set GEMINI_API_KEY for real images</text>
	</svg>`;

	return {
		mimeType: 'image/svg+xml',
		base64: Buffer.from(svg).toString('base64')
	};
}

/** @param {BouquetRecipe} recipe */
export function mockFloristNote(recipe) {
	return `A ${recipe.shape} built around ${recipe.mainFlowers.join(' and ')}, softened with ${recipe.subFlowers.join(', ')} and ${recipe.greenery.join(', ')}. The palette stays ${recipe.colors.join(', ')} with ${recipe.wrapping}. Budget target: ${recipe.budget}.`;
}

/**
 * Apply a simple swap edit to the recipe in mock mode (e.g. "change tulip to rose").
 * @param {BouquetRecipe} recipe
 * @param {string} editPrompt
 * @returns {BouquetRecipe}
 */
export function mockApplyRecipeEdit(recipe, editPrompt) {
	/** @type {BouquetRecipe} */
	const updated = structuredClone(recipe);
	const lower = editPrompt.toLowerCase();

	const swapMatch =
		lower.match(/(?:change|replace|swap)\s+(.+?)\s+(?:to|with|into)\s+(.+)/) ??
		lower.match(/(.+?)\s+(?:to|into)\s+(.+)/);

	if (!swapMatch) return updated;

	const fromToken = swapMatch[1].trim().replace(/[.!?]$/, '');
	const toToken = swapMatch[2].trim().replace(/[.!?]$/, '');
	if (!fromToken || !toToken) return updated;

	/** @param {string[]} labels */
	const replaceInList = (labels) =>
		labels.map((label) => {
			if (!label.toLowerCase().includes(fromToken)) return label;

			const colorPrefix = label.match(/^(\w+)\s+/i)?.[1];
			const capitalizedTo =
				toToken.charAt(0).toUpperCase() + toToken.slice(1).toLowerCase();

			if (colorPrefix && !fromToken.includes(' ')) {
				return `${colorPrefix} ${capitalizedTo}`;
			}

			return label.replace(new RegExp(fromToken, 'i'), capitalizedTo);
		});

	updated.mainFlowers = replaceInList(updated.mainFlowers);
	updated.subFlowers = replaceInList(updated.subFlowers);
	updated.greenery = replaceInList(updated.greenery);

	return updated;
}
