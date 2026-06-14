import { flowerCatalogLite } from './flowerCatalogLite.js';
import { getFlowerKo } from './flowerCatalogKo.js';

/**
 * @typedef {{ id: number, name: string, nameKo: string, wordOfFlower: string, wordOfFlowerKo: string, imageSrc: string, label: string, role: 'main' | 'sub' }} RecipeFlowerCard
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
 * Match a recipe flower string (e.g. "Pink tulip") to a catalog entry.
 * @param {string} label
 * @returns {(typeof flowerCatalogLite)[number] | null}
 */
function matchCatalogFlower(label) {
	const normalized = normalizeName(label);

	for (const flower of flowerCatalogLite) {
		const catalogPrimary = primaryName(flower.name);
		if (
			normalized === catalogPrimary ||
			normalized.includes(catalogPrimary) ||
			catalogPrimary.includes(normalized)
		) {
			return flower;
		}
	}

	return null;
}

/**
 * @param {{ mainFlowers?: string[], subFlowers?: string[] } | null | undefined} recipe
 * @param {(id: number) => string} getImageSrc
 * @returns {RecipeFlowerCard[]}
 */
export function resolveRecipeFlowers(recipe, getImageSrc) {
	if (!recipe) return [];

	/** @type {RecipeFlowerCard[]} */
	const cards = [];
	/** @type {Set<number>} */
	const seenIds = new Set();

	/** @param {string[] | undefined} labels @param {'main' | 'sub'} role */
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

	addFlowers(recipe.mainFlowers, 'main');
	addFlowers(recipe.subFlowers, 'sub');

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
