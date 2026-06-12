/** @typedef {import('../flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('../flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */

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

	return {
		concept: 'Soft Romantic Tulip Bouquet',
		mainFlowers: ['Pink tulip'],
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
	return [
		'Generate a realistic florist-style bouquet image.',
		'Use real flowers only.',
		`Use ${recipe.mainFlowers.join(', ')} as the main flower, mixed with ${recipe.subFlowers.join(', ')}, and ${recipe.greenery.join(', ')}.`,
		`Use a ${recipe.colors.join(', ')} color palette.`,
		`Wrap it with ${recipe.wrapping}.`,
		'White background, soft natural lighting, Korean florist style.'
	].join(' ');
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
