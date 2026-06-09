/** @typedef {import('$lib/server/flowerFlow/jobStore.js').UserInput} UserInput */
/** @typedef {import('$lib/server/flowerFlow/jobStore.js').MoodAnalysis} MoodAnalysis */
/** @typedef {import('$lib/server/flowerFlow/jobStore.js').BouquetRecipe} BouquetRecipe */

/** @typedef {{ text: string, highlight: boolean }} OrderMessageSegment */

/** @typedef {{ plainText: string, segments: OrderMessageSegment[] }} FloristOrderMessageResult */

/**
 * @param {string[]} [items]
 * @param {string} fallback
 */
function joinKeywords(items, fallback) {
	return items?.length ? items.slice(0, 4).join(', ') : fallback;
}

/**
 * @param {{
 *   userInput?: Partial<UserInput> | null;
 *   moodAnalysis?: MoodAnalysis | null;
 *   recipe?: BouquetRecipe | null;
 * }} input
 * @returns {FloristOrderMessageResult}
 */
export function buildFloristOrderMessage(input) {
	const { userInput, moodAnalysis, recipe } = input;

	if (!recipe && !userInput?.relationship && !userInput?.occasion) {
		return { plainText: '', segments: [] };
	}

	const relationship = userInput?.relationship ?? 'someone special';
	const occasion = userInput?.occasion ?? 'a special occasion';
	const budget = userInput?.budget
		? `₩${Number(userInput.budget).toLocaleString('en-US')}`
		: 'a flexible range';

	const moodFeel = joinKeywords(
		[
			...(moodAnalysis?.moodKeywords ?? []),
			...(moodAnalysis?.styleImpression ?? []),
			...(moodAnalysis?.textureKeywords ?? [])
		],
		'gentle and warm'
	);

	const colorTone = joinKeywords(
		[...(moodAnalysis?.colorPalette ?? []), ...(recipe?.colors ?? [])],
		'soft natural'
	);

	const plainText =
		`Hello, I'd like to inquire about a flower order. ` +
		`It's a bouquet for ${relationship} for ${occasion}, with a budget around ${budget}. ` +
		`I'd like to gift something with a ${moodFeel} feel, using ${colorTone} tones. ` +
		`Would a reservation be possible?`;

	const segments = [
		{ text: "Hello, I'd like to inquire about a flower order. It's a bouquet for ", highlight: false },
		{ text: relationship, highlight: true },
		{ text: ' for ', highlight: false },
		{ text: occasion, highlight: true },
		{ text: ', with a budget around ', highlight: false },
		{ text: budget, highlight: true },
		{ text: ". I'd like to gift something with a ", highlight: false },
		{ text: moodFeel, highlight: true },
		{ text: ' feel, using ', highlight: false },
		{ text: colorTone, highlight: true },
		{ text: ' tones. Would a reservation be possible?', highlight: false }
	];

	return { plainText, segments };
}
