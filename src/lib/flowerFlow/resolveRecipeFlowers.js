import { flowerCatalogLite } from './flowerCatalogLite.js';
import { getFlowerKo } from './flowerCatalogKo.js';

/**
 * @typedef {{ id: number, name: string, nameKo: string, wordOfFlower: string, wordOfFlowerKo: string, imageSrc: string, label: string, role: 'main' | 'sub' | 'greenery' }} RecipeFlowerCard
 */

/** @param {string} name */
function normalizeName(name) {
	return name
		.toLowerCase()
		.replace(/[()'".]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** @param {string} name */
function primaryName(name) {
	return normalizeName(name.split('(')[0]);
}

/**
 * Match a recipe flower string (e.g. "Pink tulip") to one catalog entry.
 * Exact / primary-name matches first; modifier + species only as a last resort.
 * @param {string} label
 * @returns {(typeof flowerCatalogLite)[number] | null}
 */
export function matchCatalogFlower(label) {
	if (!label?.trim()) return null;

	const normalized = normalizeName(label);

	for (const flower of flowerCatalogLite) {
		if (normalized === normalizeName(flower.name)) {
			return flower;
		}
	}

	const labelPrimary = primaryName(label);
	/** @type {typeof flowerCatalogLite} */
	const primaryMatches = [];

	for (const flower of flowerCatalogLite) {
		if (primaryName(flower.name) === labelPrimary) {
			primaryMatches.push(flower);
		}
	}

	if (primaryMatches.length === 1) {
		return primaryMatches[0];
	}

	if (primaryMatches.length > 1) {
		const exact = primaryMatches.find((flower) => normalizeName(flower.name) === normalized);
		if (exact) return exact;
		return primaryMatches.sort((a, b) => b.name.length - a.name.length)[0];
	}

	const bySpecificity = [...flowerCatalogLite].sort((a, b) => b.name.length - a.name.length);

	for (const flower of bySpecificity) {
		const catalogPrimary = primaryName(flower.name);
		if (normalized === catalogPrimary) return flower;
		if (normalized.endsWith(` ${catalogPrimary}`)) return flower;
	}

	return null;
}

/**
 * Cap recipe flower lists to florist-realistic counts and demote extra mains to sub.
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[] }} recipe
 */
export function normalizeRecipeLists(recipe) {
	if (!recipe) return recipe;

	/** @type {string[]} */
	const main = [...(recipe.mainFlowers ?? [])].filter(Boolean);
	/** @type {string[]} */
	let sub = [...(recipe.subFlowers ?? [])].filter(Boolean);
	/** @type {string[]} */
	const greenery = [...(recipe.greenery ?? [])].filter(Boolean);

	/** @param {string} label */
	const catalogId = (label) => matchCatalogFlower(label)?.id ?? null;

	/** @param {string} label @param {string[]} list */
	const listHasLabel = (label, list) => {
		const id = catalogId(label);
		if (id == null) {
			const normalized = normalizeName(label);
			return list.some((entry) => normalizeName(entry) === normalized);
		}

		return list.some((entry) => catalogId(entry) === id);
	};

	while (main.length > 2) {
		const extra = main.pop();
		if (!extra || listHasLabel(extra, sub) || listHasLabel(extra, greenery)) continue;

		if (sub.length < 4) {
			sub.unshift(extra);
		}
	}

	return {
		...recipe,
		mainFlowers: main,
		subFlowers: sub.slice(0, 4),
		greenery: greenery.slice(0, 2)
	};
}

/**
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[] } | null | undefined} recipe
 * @param {(id: number) => string} getImageSrc
 * @returns {RecipeFlowerCard[]}
 */
export function resolveRecipeFlowers(recipe, getImageSrc) {
	const normalized = normalizeRecipeLists(recipe ?? {});
	if (!recipe) return [];

	/** @type {RecipeFlowerCard[]} */
	const cards = [];
	/** @type {Set<number>} */
	const seenIds = new Set();

	/** @param {string[] | undefined} labels @param {'main' | 'sub' | 'greenery'} role */
	const addFlowers = (labels, role) => {
		for (const label of labels ?? []) {
			if (!label) continue;

			const match = matchCatalogFlower(label);
			if (!match || seenIds.has(match.id)) continue;

			seenIds.add(match.id);
			const ko = getFlowerKo(match.id, match.name, match.wordOfFlower);
			cards.push({
				id: match.id,
				name: match.name,
				nameKo: ko.nameKo,
				wordOfFlower: match.wordOfFlower,
				wordOfFlowerKo: ko.wordOfFlowerKo,
				label,
				role,
				imageSrc: getImageSrc(match.id)
			});
		}
	};

	addFlowers(normalized.mainFlowers, 'main');
	addFlowers(normalized.subFlowers, 'sub');
	addFlowers(normalized.greenery, 'greenery');

	return cards;
}

/**
 * @param {string | null | undefined} text
 * @param {number} [maxLength=140]
 */
export function truncateDescription(text, maxLength = 140) {
	if (!text?.trim()) return '';

	const trimmed = text.trim();
	if (trimmed.length <= maxLength) return trimmed;

	return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

/**
 * One-line context for the map order card (mood, recipient, or recipe concept).
 * @param {{ moodKeywords?: string[], styleImpression?: string[] } | null | undefined} moodAnalysis
 * @param {{ relationship?: string, notes?: string } | null | undefined} userInput
 * @param {{ concept?: string } | null | undefined} recipe
 */
function buildMapOrderIntro(moodAnalysis, userInput, recipe) {
	const recipient = userInput?.relationship?.trim();
	const mood = pickKeywords(
		[...(moodAnalysis?.moodKeywords ?? []), ...(moodAnalysis?.styleImpression ?? [])],
		2
	);
	const hasCardMessage = Boolean(extractCardMessage(userInput));

	if (hasCardMessage && recipient) {
		return `A bouquet for ${recipient}, shaped around your card message`;
	}
	if (hasCardMessage) {
		return 'A bouquet shaped around your card message';
	}
	if (mood && recipient) {
		return `A ${mood} bouquet for ${recipient}`;
	}
	if (mood) {
		return `A ${mood} bouquet from your moodboard`;
	}
	if (recipe?.concept?.trim()) {
		return recipe.concept.trim();
	}
	if (recipient) {
		return `A custom bouquet for ${recipient}`;
	}
	return 'Your custom bouquet design';
}

/**
 * Map order card — short intro plus flower species (main → sub → greenery, capped).
 * @param {{ mainFlowers?: string[], subFlowers?: string[], greenery?: string[], concept?: string } | null | undefined} recipe
 * @param {{
 *   moodAnalysis?: { moodKeywords?: string[], styleImpression?: string[] } | null,
 *   userInput?: { relationship?: string, notes?: string } | null,
 *   maxFlowers?: number
 * }} [options]
 */
export function buildMapOrderDescription(recipe, options = {}) {
	const { moodAnalysis = null, userInput = null, maxFlowers = 4 } = options;
	const flowers = resolveRecipeFlowers(recipe, () => '').slice(0, maxFlowers);
	if (flowers.length === 0) {
		return 'Your selected bouquet design.';
	}

	const intro = buildMapOrderIntro(moodAnalysis, userInput, recipe);
	const flowerList = flowers.map((flower) => flower.name).join(', ');

	return `${intro}: ${flowerList}.`;
}

/**
 * @param {string[]} [items]
 * @param {number} [limit=2]
 */
function pickKeywords(items, limit = 2) {
	if (!items?.length) return '';
	return items.filter(Boolean).slice(0, limit).join(', ');
}

/** @param {string} value */
function isHexColor(value) {
	return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.trim());
}

/** @param {string[] | undefined} colorPalette @param {number} [limit=2] */
function pickMoodColors(colorPalette, limit = 2) {
	const names = (colorPalette ?? []).filter((color) => color && !isHexColor(color));
	return pickKeywords(names, limit);
}

/**
 * Short mood-led title for the result description card.
 * @param {{ moodKeywords?: string[], styleImpression?: string[] } | null | undefined} moodAnalysis
 */
export function buildBriefBouquetTitle(moodAnalysis) {
	if (!moodAnalysis) return 'Your bouquet';

	const keywords = [
		...(moodAnalysis.styleImpression ?? []),
		...(moodAnalysis.moodKeywords ?? [])
	].filter(Boolean);

	if (keywords.length === 0) return 'Your bouquet';

	return keywords
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' & ');
}

/**
 * @param {{ notes?: string } | null | undefined} userInput
 */
export function extractCardMessage(userInput) {
	const notes = userInput?.notes?.trim();
	if (!notes) return '';

	const prefix = 'Card message: ';
	return notes.startsWith(prefix) ? notes.slice(prefix.length).trim() : notes;
}

/**
 * @param {{ mainFlowers?: string[] } | null | undefined} recipe
 */
function getPrimaryFlowerFromRecipe(recipe) {
	const label = recipe?.mainFlowers?.[0];
	if (!label) return null;
	return matchCatalogFlower(label);
}

/**
 * Why this bouquet fits — mood from images, message, and main flower language.
 * @param {{ moodKeywords?: string[], styleImpression?: string[], colorPalette?: string[] } | null | undefined} moodAnalysis
 * @param {{ relationship?: string, notes?: string } | null | undefined} userInput
 * @param {{ mainFlowers?: string[] } | null | undefined} recipe
 */
export function buildBouquetRationale(moodAnalysis, userInput, recipe) {
	const normalized = normalizeRecipeLists(recipe ?? {});
	const recipient = userInput?.relationship?.trim();
	const subject = recipient ? `${recipient}'s` : 'The';
	const cardMessage = extractCardMessage(userInput);
	const mainFlower = getPrimaryFlowerFromRecipe(normalized);

	const mood = pickKeywords(
		[...(moodAnalysis?.moodKeywords ?? []), ...(moodAnalysis?.styleImpression ?? [])],
		2
	);
	const colors = pickMoodColors(moodAnalysis?.colorPalette, 2);

	/** @type {string[]} */
	const parts = [];

	if (mood && colors) {
		parts.push(`${subject} ${mood} mood and ${colors} tones came through in the moodboard.`);
	} else if (mood) {
		parts.push(`${subject} ${mood} mood came through in the moodboard.`);
	} else if (colors) {
		parts.push(`${subject} ${colors} tones came through in the moodboard.`);
	} else if (!moodAnalysis) {
		parts.push('We shaped this bouquet from the feeling in the images.');
	}

	if (cardMessage && mainFlower) {
		const messageRef = cardMessage.length <= 40 ? `your message, "${cardMessage}"` : 'your message';
		parts.push(
			`For ${messageRef}, ${mainFlower.name} (${mainFlower.wordOfFlower}) felt like the right fit.`
		);
	} else if (cardMessage) {
		parts.push('Your message helped guide the flowers we chose.');
	} else if (mainFlower) {
		parts.push(`${mainFlower.name} (${mainFlower.wordOfFlower}) anchors the bouquet.`);
	}

	if (parts.length === 0) {
		return recipient
			? `This bouquet reflects the feeling in ${recipient}'s images.`
			: 'This bouquet reflects the feeling in the images.';
	}

	return parts.join(' ');
}

/**
 * @param {{ concept?: string, shape?: string, mainFlowers?: string[], wrapping?: string } | null | undefined} recipe
 * @param {number} [maxLength=140]
 */
export function buildBriefBouquetDescription(recipe, maxLength = 140) {
	if (!recipe) return 'A bouquet shaped from their mood.';

	const mains = recipe.mainFlowers?.slice(0, 2).join(' and ');
	const parts = [];

	if (recipe.shape) parts.push(recipe.shape);
	if (mains) parts.push(`featuring ${mains}`);
	if (recipe.wrapping) {
		const wrap = recipe.wrapping.split(' with ')[0];
		parts.push(`wrapped in ${wrap}`);
	}

	const text = parts.join(', ');
	if (!text) return truncateDescription(recipe.concept, maxLength);

	return truncateDescription(text.charAt(0).toUpperCase() + text.slice(1), maxLength);
}
