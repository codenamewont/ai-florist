/** @typedef {import('./jobStore.js').MoodAnalysis} MoodAnalysis */

/**
 * @typedef {Object} FlowerRecord
 * @property {string} name
 * @property {string[]} colors
 * @property {string[]} season
 * @property {string} wordOfFlower
 * @property {string[]} meanings
 * @property {'low' | 'medium' | 'high'} priceLevel
 * @property {string[]} mood
 * @property {'main' | 'sub' | 'greenery'} role
 */

/** @type {FlowerRecord[]} */
export const flowerDB = [
	{
		name: 'Tulip',
		colors: ['white', 'pink', 'yellow', 'purple'],
		season: ['spring'],
		wordOfFlower: 'confession of love',
		meanings: ['love', 'passion', 'devotion'],
		priceLevel: 'medium',
		mood: ['soft', 'romantic', 'clean'],
		role: 'main'
	},
	{
		name: 'Gerbera',
		colors: ['white', 'pink', 'yellow', 'orange', 'red'],
		season: ['spring', 'summer'],
		wordOfFlower: 'cheerfulness',
		meanings: ['joy', 'friendship', 'warmth'],
		priceLevel: 'low',
		mood: ['bright', 'playful', 'cheerful'],
		role: 'main'
	},
	{
		name: "Baby's breath",
		colors: ['white', 'pink'],
		season: ['spring', 'summer', 'autumn'],
		wordOfFlower: 'pure heart',
		meanings: ['innocence', 'everlasting love'],
		priceLevel: 'low',
		mood: ['airy', 'delicate', 'soft'],
		role: 'sub'
	},
	{
		name: 'Rose',
		colors: ['white', 'pink', 'red', 'peach'],
		season: ['spring', 'summer', 'autumn'],
		wordOfFlower: 'love',
		meanings: ['romance', 'gratitude', 'elegance'],
		priceLevel: 'medium',
		mood: ['romantic', 'classic', 'warm'],
		role: 'main'
	},
	{
		name: 'Ranunculus',
		colors: ['white', 'pink', 'peach', 'yellow'],
		season: ['spring'],
		wordOfFlower: 'charm',
		meanings: ['radiance', 'charm', 'attraction'],
		priceLevel: 'medium',
		mood: ['soft', 'layered', 'romantic'],
		role: 'main'
	},
	{
		name: 'Eucalyptus',
		colors: ['green', 'silver green'],
		season: ['spring', 'summer', 'autumn', 'winter'],
		wordOfFlower: 'protection',
		meanings: ['freshness', 'healing'],
		priceLevel: 'low',
		mood: ['natural', 'minimal', 'clean'],
		role: 'greenery'
	},
	{
		name: 'Lisianthus',
		colors: ['white', 'pink', 'purple', 'green'],
		season: ['summer', 'autumn'],
		wordOfFlower: 'gratitude',
		meanings: ['appreciation', 'grace'],
		priceLevel: 'medium',
		mood: ['elegant', 'soft', 'delicate'],
		role: 'sub'
	},
	{
		name: 'Daisy',
		colors: ['white', 'yellow'],
		season: ['spring', 'summer'],
		wordOfFlower: 'innocence',
		meanings: ['purity', 'new beginnings'],
		priceLevel: 'low',
		mood: ['fresh', 'natural', 'cheerful'],
		role: 'sub'
	}
];

/**
 * @param {MoodAnalysis} mood
 * @param {string} [season]
 */
export function matchFlowersFromMood(mood, season) {
	const palette = mood.colorPalette.map((c) => c.toLowerCase());
	const keywords = [...mood.moodKeywords, ...mood.styleImpression, ...mood.textureKeywords].map(
		(k) => k.toLowerCase()
	);

	const scoreFlower = (flower) => {
		let score = 0;

		for (const color of flower.colors) {
			if (palette.some((p) => p.includes(color) || color.includes(p))) {
				score += 2;
			}
		}

		for (const tag of flower.mood) {
			if (keywords.some((k) => k.includes(tag) || tag.includes(k))) {
				score += 2;
			}
		}

		if (season && flower.season.includes(season.toLowerCase())) {
			score += 1;
		}

		return score;
	};

	const ranked = [...flowerDB]
		.map((flower) => ({ flower, score: scoreFlower(flower) }))
		.sort((a, b) => b.score - a.score);

	const mains = ranked.filter(({ flower }) => flower.role === 'main').slice(0, 2);
	const subs = ranked.filter(({ flower }) => flower.role === 'sub').slice(0, 2);
	const greenery = ranked.filter(({ flower }) => flower.role === 'greenery').slice(0, 1);

	return {
		mainFlowers: mains.map(({ flower }) => flower.name),
		subFlowers: subs.map(({ flower }) => flower.name),
		greenery: greenery.map(({ flower }) => flower.name),
		colors: mood.colorPalette.slice(0, 3)
	};
}
