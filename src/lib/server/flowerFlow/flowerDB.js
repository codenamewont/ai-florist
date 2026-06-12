/** @typedef {import('./jobStore.js').MoodAnalysis} MoodAnalysis */

/**
 * @typedef {Object} FlowerRecord
 * @property {number} id
 * @property {string} name
 * @property {string[]} colors
 * @property {string[]} season
 * @property {string} wordOfFlower
 * @property {string[]} meanings
 * @property {'low' | 'medium' | 'high'} priceLevel
 * @property {string[]} mood
 * @property {'main' | 'filler' | 'line' | 'foliage'} role
 * @property {string} [family] Botanical grouping — used to avoid duplicate substitutes in one recipe
 * @property {'common' | 'limited' | 'rare'} [cutAvailability] How often this appears as cut flower in Korean florists
 */

/** Neutral tones that mood analysis palettes rarely name directly. */
const NEUTRAL_COLORS = new Set(['silver', 'beige', 'brown']);

/** @type {Record<string, string[]>} */
const NEUTRAL_COLOR_ALIASES = {
	silver: ['white', 'grey', 'gray', 'muted', 'neutral', 'cool', 'pale', 'soft'],
	beige: ['cream', 'warm', 'neutral', 'natural', 'taupe', 'sand', 'ivory', 'tan', 'earth'],
	brown: ['earth', 'natural', 'rustic', 'warm', 'neutral', 'organic', 'mocha', 'wood', 'tan']
};

/** @type {Record<string, number>} */
const CUT_AVAILABILITY_PENALTY = {
	common: 0,
	limited: 1,
	rare: 2
};

/** @type {FlowerRecord[]} */
export const flowerDB = [
	// ── Focal blooms ────────────────────────────────────────────
	{ id: 1, name: 'Daffodil', colors: ['yellow', 'white'], season: ['spring'], wordOfFlower: 'self-love', meanings: ['self-love', 'pride', 'vanity'], priceLevel: 'low', mood: ['bright', 'fresh', 'cheerful'], role: 'main' },
	{ id: 2, name: 'Stock', colors: ['purple', 'pink', 'white'], season: ['spring'], wordOfFlower: 'lasting beauty', meanings: ['lasting beauty', 'bonds of love'], priceLevel: 'medium', mood: ['soft', 'romantic', 'fragrant'], role: 'main' },
	{ id: 3, name: 'Amaryllis', colors: ['red', 'white', 'pink'], season: ['winter'], wordOfFlower: 'dazzling beauty', meanings: ['dazzling beauty', 'talkativeness'], priceLevel: 'medium', mood: ['bold', 'dramatic', 'festive'], role: 'main' },
	{ id: 4, name: 'Sweet Pea', colors: ['pink', 'purple', 'white'], season: ['spring'], wordOfFlower: 'delicate pleasures', meanings: ['joy', 'daintiness'], priceLevel: 'medium', mood: ['soft', 'romantic', 'fragrant'], role: 'main' },
	{ id: 5, name: 'Anthurium', colors: ['red', 'pink', 'white'], season: ['summer'], wordOfFlower: 'hospitality', meanings: ['hospitality', 'passion'], priceLevel: 'medium', mood: ['exotic', 'bold', 'tropical'], role: 'main' },
	{ id: 6, name: 'Freesia', colors: ['yellow', 'white', 'purple'], season: ['spring'], wordOfFlower: 'purity', meanings: ['purity', 'innocent heart'], priceLevel: 'medium', mood: ['fresh', 'fragrant', 'cheerful'], role: 'main' },
	{ id: 7, name: 'Tulip', colors: ['red', 'yellow', 'pink', 'white', 'purple'], season: ['spring'], wordOfFlower: 'benevolence', meanings: ['benevolence', 'fame', 'honor'], priceLevel: 'medium', mood: ['soft', 'romantic', 'clean'], role: 'main' },
	{ id: 8, name: 'Hyacinth', colors: ['purple', 'pink', 'blue', 'white'], season: ['spring'], wordOfFlower: 'joy of the heart', meanings: ['joy', 'victory'], priceLevel: 'medium', mood: ['fragrant', 'soft', 'romantic'], role: 'main' },
	{ id: 9, name: 'Ranunculus', colors: ['pink', 'yellow', 'orange', 'white'], season: ['spring'], wordOfFlower: 'radiant charm', meanings: ['radiant charm', 'reproach'], priceLevel: 'medium', mood: ['soft', 'romantic', 'cheerful'], role: 'main' },
	{ id: 10, name: 'Lilac', colors: ['purple', 'white'], season: ['spring'], wordOfFlower: 'memories of youth', meanings: ['young love', 'memories'], priceLevel: 'medium', mood: ['fragrant', 'romantic', 'soft'], role: 'main' },
	{ id: 11, name: 'Iris', colors: ['purple', 'blue', 'white'], season: ['spring'], wordOfFlower: 'good news', meanings: ['good news', 'capriciousness'], priceLevel: 'medium', mood: ['elegant', 'fresh', 'noble'], role: 'main' },
	{ id: 12, name: 'Tree Peony', colors: ['red', 'pink', 'white', 'purple'], season: ['spring'], wordOfFlower: 'wealth and honor', meanings: ['wealth', 'glory', 'sincerity'], priceLevel: 'high', mood: ['luxurious', 'romantic', 'elegant'], role: 'main' },
	{ id: 13, name: 'Peony', colors: ['pink', 'white', 'red'], season: ['spring', 'summer'], wordOfFlower: 'shyness', meanings: ['shyness', 'bashfulness'], priceLevel: 'high', mood: ['romantic', 'soft', 'luxurious'], role: 'main' },
	{ id: 14, name: 'Rose', colors: ['red', 'pink', 'white', 'yellow'], season: ['spring', 'summer'], wordOfFlower: 'passionate love', meanings: ['passionate love', 'jealousy', 'purity'], priceLevel: 'medium', mood: ['romantic', 'elegant', 'bold'], role: 'main' },
	{ id: 15, name: 'Snowball Viburnum', colors: ['white', 'green'], season: ['spring'], wordOfFlower: 'grace', meanings: ['grace', 'giving'], priceLevel: 'medium', mood: ['soft', 'fresh', 'elegant'], role: 'main', cutAvailability: 'limited' },
	{ id: 16, name: 'Carnation', colors: ['pink', 'red', 'white'], season: ['spring', 'summer'], wordOfFlower: "a woman's affection", meanings: ['affection', "mother's love"], priceLevel: 'low', mood: ['warm', 'soft', 'romantic'], role: 'main' },
	{ id: 17, name: 'Clematis', colors: ['purple', 'white', 'pink'], season: ['summer'], wordOfFlower: 'nobility', meanings: ['nobility', 'beautiful heart'], priceLevel: 'medium', mood: ['elegant', 'soft', 'romantic'], role: 'main' },
	{ id: 18, name: 'Lily', colors: ['white', 'pink', 'orange'], season: ['summer'], wordOfFlower: 'purity', meanings: ['purity', 'pure heart'], priceLevel: 'medium', mood: ['elegant', 'fragrant', 'clean'], role: 'main' },
	{ id: 19, name: 'Hydrangea', colors: ['blue', 'pink', 'purple', 'white'], season: ['summer'], wordOfFlower: 'heartlessness', meanings: ['coldness', 'heartlessness', 'pride'], priceLevel: 'medium', mood: ['soft', 'elegant', 'lush'], role: 'main' },
	{ id: 20, name: 'Agapanthus', colors: ['blue', 'purple', 'white'], season: ['summer'], wordOfFlower: 'love letter', meanings: ['love letter', 'news of love'], priceLevel: 'medium', mood: ['elegant', 'fresh', 'serene'], role: 'main' },
	{ id: 21, name: 'Allium', colors: ['purple'], season: ['spring', 'summer'], wordOfFlower: 'endless sorrow', meanings: ['endless sorrow', 'prosperity'], priceLevel: 'medium', mood: ['bold', 'elegant', 'dramatic'], role: 'main' },
	{ id: 22, name: 'Bellflower (Campanula)', colors: ['blue', 'purple', 'white'], season: ['summer'], wordOfFlower: 'a coquettish look', meanings: ['gratitude', 'charm'], priceLevel: 'low', mood: ['soft', 'delicate', 'serene'], role: 'main' },
	{ id: 23, name: 'China Aster (Callistephus)', colors: ['purple', 'pink', 'white', 'red'], season: ['summer', 'autumn'], wordOfFlower: 'trusting love', meanings: ['trusting love', 'memories'], priceLevel: 'low', mood: ['soft', 'cheerful', 'vintage'], role: 'main' },
	{ id: 24, name: 'Poppy (Papaver)', colors: ['red', 'pink', 'orange', 'white'], season: ['spring', 'summer'], wordOfFlower: 'consolation', meanings: ['consolation', 'comfort'], priceLevel: 'medium', mood: ['soft', 'delicate', 'whimsical'], role: 'main' },
	{ id: 25, name: 'Dahlia', colors: ['red', 'pink', 'orange', 'white', 'purple'], season: ['summer', 'autumn'], wordOfFlower: 'gratitude', meanings: ['gratitude', 'elegance'], priceLevel: 'medium', mood: ['bold', 'elegant', 'luxurious'], role: 'main' },
	{ id: 26, name: 'Lotus', colors: ['pink', 'white'], season: ['summer'], wordOfFlower: 'purity', meanings: ['purity', 'divinity', 'detachment'], priceLevel: 'medium', mood: ['serene', 'elegant', 'clean'], role: 'main', cutAvailability: 'rare' },
	{ id: 27, name: 'Gentian', colors: ['blue', 'purple'], season: ['autumn'], wordOfFlower: "I love you when you're sad", meanings: ['love in sadness', 'sincerity'], priceLevel: 'medium', mood: ['serene', 'elegant', 'calm'], role: 'main' },
	{ id: 28, name: 'Sunflower', colors: ['yellow', 'orange'], season: ['summer'], wordOfFlower: 'adoration', meanings: ['longing', 'adoration'], priceLevel: 'low', mood: ['bright', 'cheerful', 'warm'], role: 'main' },
	{ id: 29, name: 'Chrysanthemum', colors: ['white', 'yellow', 'pink', 'purple'], season: ['autumn'], wordOfFlower: 'purity', meanings: ['purity', 'chastity', 'innocence'], priceLevel: 'low', mood: ['elegant', 'calm', 'vintage'], role: 'main' },
	{ id: 30, name: 'Cockscomb (Celosia)', colors: ['red', 'orange', 'pink', 'yellow'], season: ['summer', 'autumn'], wordOfFlower: 'ardent love', meanings: ['ardent love', 'vain ornament'], priceLevel: 'low', mood: ['bold', 'warm', 'vintage'], role: 'main' },
	{ id: 31, name: 'Anemone', colors: ['red', 'purple', 'white', 'pink'], season: ['spring'], wordOfFlower: 'sincerity', meanings: ['solitude', 'chastity', 'sincerity'], priceLevel: 'medium', mood: ['soft', 'elegant', 'romantic'], role: 'main' },
	{ id: 32, name: 'Cosmos', colors: ['pink', 'white', 'purple'], season: ['autumn'], wordOfFlower: "a girl's pure heart", meanings: ['pure heart', 'innocence'], priceLevel: 'low', mood: ['soft', 'delicate', 'wild'], role: 'main' },
	{ id: 33, name: 'Red Spider Lily (Lycoris radiata)', colors: ['red'], season: ['autumn'], wordOfFlower: 'true love', meanings: ['true love', 'longing'], priceLevel: 'medium', mood: ['dramatic', 'bold', 'elegant'], role: 'main' },
	{ id: 34, name: 'Gerbera', colors: ['white', 'pink', 'yellow', 'orange', 'red'], season: ['spring', 'summer'], wordOfFlower: 'mystery', meanings: ['mystery', 'cheerfulness'], priceLevel: 'low', mood: ['bright', 'playful', 'cheerful'], role: 'main' },
	{ id: 35, name: 'Calla Lily', colors: ['white', 'yellow', 'pink', 'purple'], season: ['spring', 'summer'], wordOfFlower: 'joy', meanings: ['joy', 'passion'], priceLevel: 'medium', mood: ['elegant', 'clean', 'refined'], role: 'main' },
	{ id: 36, name: 'Bird of Paradise (Strelitzia)', colors: ['orange', 'blue'], season: ['winter'], wordOfFlower: 'mystery', meanings: ['mystery', 'magnificence'], priceLevel: 'high', mood: ['exotic', 'bold', 'dramatic'], role: 'main' },
	{ id: 37, name: 'Hellebore', colors: ['white', 'green', 'purple', 'pink'], season: ['winter'], wordOfFlower: 'reason for being', meanings: ['serenity', 'reason for being'], priceLevel: 'medium', mood: ['elegant', 'serene', 'soft'], role: 'main' },

	// ── Florist staples (common in shops; not on the NIHHS list) ─
	{ id: 38, name: 'Lisianthus (Eustoma)', colors: ['white', 'pink', 'purple', 'green'], season: ['summer'], wordOfFlower: 'appreciation', meanings: ['appreciation', 'calm', 'gratitude'], priceLevel: 'medium', mood: ['soft', 'elegant', 'romantic'], role: 'main' },
	{ id: 39, name: 'Scabiosa', colors: ['purple', 'pink', 'white', 'blue'], season: ['summer'], wordOfFlower: 'I have lost all', meanings: ['admiration', 'unlucky love', 'purity'], priceLevel: 'low', mood: ['delicate', 'soft', 'whimsical'], role: 'filler' },
	{ id: 40, name: 'Wax Flower (Chamelaucium)', colors: ['pink', 'white', 'purple'], season: ['spring', 'winter'], wordOfFlower: 'lasting love', meanings: ['lasting love', 'patience'], priceLevel: 'low', mood: ['delicate', 'fresh', 'rustic'], role: 'filler' },
	{ id: 41, name: 'Caspia (Limonium)', colors: ['purple', 'blue'], season: ['summer'], wordOfFlower: 'remembrance', meanings: ['remembrance', 'success'], priceLevel: 'low', mood: ['airy', 'delicate', 'rustic'], role: 'filler', family: 'limonium' },
	{ id: 42, name: 'Ruscus', colors: ['green'], season: ['spring', 'summer', 'autumn', 'winter'], wordOfFlower: 'endurance', meanings: ['protection', 'endurance'], priceLevel: 'low', mood: ['fresh', 'lush', 'evergreen'], role: 'foliage' },
	{ id: 43, name: 'Veronica (Speedwell)', colors: ['purple', 'blue', 'white', 'pink'], season: ['summer'], wordOfFlower: 'fidelity', meanings: ['fidelity', 'loyalty'], priceLevel: 'low', mood: ['fresh', 'soft', 'serene'], role: 'line' },
	{ id: 44, name: 'Solidago (Goldenrod)', colors: ['yellow'], season: ['summer', 'autumn'], wordOfFlower: 'encouragement', meanings: ['encouragement', 'good fortune'], priceLevel: 'low', mood: ['bright', 'cheerful', 'rustic'], role: 'filler' },
	{ id: 45, name: 'Bouvardia', colors: ['red', 'pink', 'white'], season: ['summer', 'autumn'], wordOfFlower: 'enthusiasm', meanings: ['enthusiasm', 'zest'], priceLevel: 'medium', mood: ['soft', 'elegant', 'delicate'], role: 'filler' },
	{ id: 46, name: 'Tweedia (Oxypetalum)', colors: ['blue'], season: ['summer'], wordOfFlower: 'believe in me', meanings: ['trust', 'mutual love'], priceLevel: 'medium', mood: ['soft', 'serene', 'delicate'], role: 'filler' },
	{ id: 47, name: 'Craspedia (Billy Balls)', colors: ['yellow'], season: ['summer'], wordOfFlower: 'good health', meanings: ['good health', 'individuality'], priceLevel: 'medium', mood: ['playful', 'cheerful', 'modern'], role: 'filler' },
	{ id: 48, name: 'Amaranthus', colors: ['red', 'green'], season: ['summer', 'autumn'], wordOfFlower: 'immortality', meanings: ['immortality', 'hopeless love'], priceLevel: 'medium', mood: ['bold', 'dramatic', 'lush'], role: 'line' },
	{ id: 49, name: "Queen Anne's Lace (Ammi)", colors: ['white'], season: ['summer'], wordOfFlower: 'sanctuary', meanings: ['delicacy', 'sanctuary'], priceLevel: 'low', mood: ['airy', 'delicate', 'soft'], role: 'filler' },
	{ id: 50, name: 'Nigella (Love-in-a-mist)', colors: ['blue', 'white', 'purple'], season: ['summer'], wordOfFlower: 'perplexity', meanings: ['delicate ties', 'perplexity'], priceLevel: 'low', mood: ['delicate', 'dreamy', 'soft'], role: 'filler' },
	{ id: 51, name: 'Brunia', colors: ['green', 'silver'], season: ['winter'], wordOfFlower: 'unity', meanings: ['protection', 'unity'], priceLevel: 'medium', mood: ['modern', 'textured', 'rustic'], role: 'filler' },

	// ── Line / spike flowers ────────────────────────────────────
	{ id: 52, name: 'Snapdragon', colors: ['pink', 'yellow', 'red', 'white'], season: ['spring', 'summer'], wordOfFlower: 'desire', meanings: ['desire', 'presumption'], priceLevel: 'medium', mood: ['bright', 'playful', 'bold'], role: 'line' },
	{ id: 53, name: 'Lupine', colors: ['purple', 'pink', 'blue'], season: ['spring', 'summer'], wordOfFlower: 'lust for life', meanings: ['lust for life', 'imagination'], priceLevel: 'medium', mood: ['bold', 'fresh', 'wild'], role: 'line' },
	{ id: 54, name: 'Gladiolus', colors: ['red', 'pink', 'white', 'yellow'], season: ['summer'], wordOfFlower: 'secret meeting', meanings: ['secret meeting', 'caution'], priceLevel: 'medium', mood: ['bold', 'dramatic', 'elegant'], role: 'line' },
	{ id: 55, name: 'Foxglove (Digitalis)', colors: ['purple', 'pink', 'white'], season: ['summer'], wordOfFlower: 'ardent love', meanings: ['ardent love', 'insincerity', 'splendor'], priceLevel: 'medium', mood: ['dramatic', 'elegant', 'bold'], role: 'line' },
	{ id: 56, name: 'Delphinium', colors: ['blue', 'purple', 'white'], season: ['summer'], wordOfFlower: 'understand my heart', meanings: ['lightness', 'rashness', 'understanding'], priceLevel: 'medium', mood: ['fresh', 'elegant', 'serene'], role: 'line' },
	{ id: 57, name: 'Salvia (Scarlet Sage)', colors: ['red', 'purple'], season: ['summer', 'autumn'], wordOfFlower: 'burning heart', meanings: ['burning heart', 'passion'], priceLevel: 'low', mood: ['bold', 'warm', 'vibrant'], role: 'line' },

	// ── Filler & accent ─────────────────────────────────────────
	{ id: 58, name: 'Grape Hyacinth (Muscari)', colors: ['blue', 'purple'], season: ['spring'], wordOfFlower: 'disappointment', meanings: ['disappointment', 'despair'], priceLevel: 'low', mood: ['delicate', 'soft', 'fresh'], role: 'filler' },
	{ id: 59, name: 'Forget-me-not', colors: ['blue'], season: ['spring'], wordOfFlower: 'true love', meanings: ['true love', 'forget me not'], priceLevel: 'low', mood: ['delicate', 'soft', 'romantic'], role: 'filler' },
	{ id: 60, name: 'Statice (Limonium)', colors: ['purple', 'pink', 'white', 'yellow'], season: ['summer'], wordOfFlower: 'eternal love', meanings: ['eternal love', 'remembrance'], priceLevel: 'low', mood: ['delicate', 'rustic', 'vintage'], role: 'filler', family: 'limonium' },
	{ id: 61, name: 'Astilbe', colors: ['pink', 'white', 'red'], season: ['summer'], wordOfFlower: 'bashfulness', meanings: ['bashfulness', 'I will be waiting'], priceLevel: 'medium', mood: ['soft', 'delicate', 'romantic'], role: 'filler' },
	{ id: 62, name: 'Strawflower (Helichrysum)', colors: ['yellow', 'orange', 'pink', 'red'], season: ['summer'], wordOfFlower: 'always remember', meanings: ['remembrance', 'immortality'], priceLevel: 'low', mood: ['warm', 'vintage', 'rustic'], role: 'filler' },
	{ id: 63, name: 'Cornflower (Centaurea)', colors: ['blue', 'purple', 'pink'], season: ['summer'], wordOfFlower: 'happiness', meanings: ['happiness', 'delicacy', 'cheer'], priceLevel: 'low', mood: ['fresh', 'cheerful', 'soft'], role: 'filler' },
	{ id: 64, name: 'Chinese Lantern (Physalis)', colors: ['orange'], season: ['autumn'], wordOfFlower: 'falsehood', meanings: ['falsehood', 'deception'], priceLevel: 'low', mood: ['warm', 'rustic', 'vintage'], role: 'filler' },
	{ id: 65, name: 'Globe Amaranth (Gomphrena)', colors: ['purple', 'pink', 'white'], season: ['summer', 'autumn'], wordOfFlower: 'immortality', meanings: ['immortality', 'constancy'], priceLevel: 'low', mood: ['vintage', 'cheerful', 'rustic'], role: 'filler' },
	{ id: 66, name: 'Showy Stonecrop (Sedum)', colors: ['pink', 'red'], season: ['autumn'], wordOfFlower: 'hope', meanings: ['hope', 'life'], priceLevel: 'low', mood: ['soft', 'rustic', 'calm'], role: 'filler' },
	{ id: 67, name: "Baby's Breath (Gypsophila)", colors: ['white', 'pink'], season: ['summer'], wordOfFlower: 'earnest joy', meanings: ['earnest joy', 'pure heart'], priceLevel: 'low', mood: ['soft', 'clean', 'delicate'], role: 'filler' },

	// ── Orchids (cut) ───────────────────────────────────────────
	{ id: 68, name: 'Cattleya', colors: ['purple', 'pink', 'white'], season: ['autumn'], wordOfFlower: 'you are a beauty', meanings: ['beauty', 'elegance'], priceLevel: 'high', mood: ['elegant', 'exotic', 'luxurious'], role: 'main' },
	{ id: 69, name: 'Oncidium', colors: ['yellow'], season: ['autumn'], wordOfFlower: 'innocent heart', meanings: ['innocence', 'simplicity'], priceLevel: 'medium', mood: ['playful', 'bright', 'delicate'], role: 'filler' },
	{ id: 70, name: 'Dendrobium', colors: ['white', 'purple', 'pink'], season: ['winter'], wordOfFlower: 'a beauty', meanings: ['tomboy', 'beauty'], priceLevel: 'medium', mood: ['elegant', 'exotic', 'refined'], role: 'main' },
	{ id: 71, name: 'Vanda Orchid', colors: ['purple', 'blue', 'pink'], season: ['summer'], wordOfFlower: 'a token of affection', meanings: ['affection', 'elegance'], priceLevel: 'high', mood: ['exotic', 'luxurious', 'elegant'], role: 'main' },

	// ── Foliage, grasses & berries ──────────────────────────────
	{ id: 72, name: 'Holly', colors: ['green', 'red'], season: ['winter'], wordOfFlower: 'protection', meanings: ['protection', 'defense'], priceLevel: 'low', mood: ['festive', 'evergreen', 'fresh'], role: 'foliage' },
	{ id: 73, name: 'Nandina (Heavenly Bamboo)', colors: ['red', 'green'], season: ['winter'], wordOfFlower: 'enduring love', meanings: ['enduring love', 'devotion'], priceLevel: 'low', mood: ['festive', 'evergreen', 'warm'], role: 'foliage' },
	{ id: 74, name: 'Pussy Willow (Salix gracilistyla)', colors: ['silver', 'green'], season: ['spring'], wordOfFlower: 'freedom', meanings: ['freedom', 'kindness'], priceLevel: 'low', mood: ['soft', 'fresh', 'rustic'], role: 'line' },
	{ id: 75, name: 'Maidenhair Fern (Adiantum)', colors: ['green'], season: ['summer'], wordOfFlower: 'charm', meanings: ['charm', 'grace'], priceLevel: 'low', mood: ['delicate', 'fresh', 'soft'], role: 'foliage' },
	{ id: 76, name: 'Cotton', colors: ['white'], season: ['autumn'], wordOfFlower: "mother's love", meanings: ["mother's love", 'nobility'], priceLevel: 'low', mood: ['soft', 'cozy', 'rustic'], role: 'filler' },
	{ id: 77, name: 'Hosta (Plantain Lily)', colors: ['white', 'purple', 'green'], season: ['summer'], wordOfFlower: 'composure', meanings: ['composure', 'quietness'], priceLevel: 'low', mood: ['calm', 'lush', 'serene'], role: 'foliage' },
	{ id: 78, name: 'Beautyberry (Callicarpa)', colors: ['purple'], season: ['autumn'], wordOfFlower: 'intelligence', meanings: ['intelligence', 'wit'], priceLevel: 'low', mood: ['vibrant', 'rustic', 'elegant'], role: 'foliage' },
	{ id: 79, name: 'Reed', colors: ['brown', 'green', 'beige'], season: ['autumn'], wordOfFlower: 'faith', meanings: ['faith', 'trust', 'wisdom'], priceLevel: 'low', mood: ['rustic', 'calm', 'wild'], role: 'line' },
	{ id: 80, name: 'Foxtail Millet', colors: ['yellow', 'green'], season: ['autumn'], wordOfFlower: 'equality', meanings: ['equality', 'abundance'], priceLevel: 'low', mood: ['rustic', 'warm', 'wild'], role: 'line' },
	{ id: 81, name: 'Mint', colors: ['purple', 'white', 'green'], season: ['summer'], wordOfFlower: 'virtue', meanings: ['virtue', 'warmth'], priceLevel: 'low', mood: ['fresh', 'fragrant', 'wild'], role: 'foliage' },
	{ id: 82, name: 'Asparagus Fern', colors: ['green'], season: ['summer'], wordOfFlower: 'constancy', meanings: ['constancy', 'devotion'], priceLevel: 'low', mood: ['fresh', 'delicate', 'lush'], role: 'foliage' },
	{ id: 83, name: 'Silver Grass (Miscanthus)', colors: ['silver', 'beige'], season: ['autumn'], wordOfFlower: 'retirement', meanings: ['retreat', 'serenity'], priceLevel: 'low', mood: ['rustic', 'calm', 'wild'], role: 'line' },
	{ id: 84, name: 'Eucalyptus', colors: ['green', 'silver'], season: ['winter'], wordOfFlower: 'memories', meanings: ['memories', 'protection'], priceLevel: 'low', mood: ['fresh', 'fragrant', 'calm'], role: 'foliage' },
	{ id: 85, name: 'Ivy (Hedera)', colors: ['green'], season: ['autumn'], wordOfFlower: 'a steadfast heart', meanings: ['steadfastness', 'fidelity'], priceLevel: 'low', mood: ['fresh', 'lush', 'calm'], role: 'foliage' },
	{ id: 86, name: 'Olive', colors: ['green', 'silver'], season: ['autumn'], wordOfFlower: 'peace', meanings: ['peace', 'victory'], priceLevel: 'low', mood: ['fresh', 'calm', 'evergreen'], role: 'foliage' },
	{ id: 87, name: 'Mock Orange (Pittosporum tobira)', colors: ['white', 'green'], season: ['spring'], wordOfFlower: 'embrace', meanings: ['embrace', 'steadfast attention'], priceLevel: 'low', mood: ['fragrant', 'evergreen', 'fresh'], role: 'foliage' },

	// ── Flowering branches ──────────────────────────────────────
	{ id: 88, name: 'Cherry Blossom', colors: ['pink', 'white'], season: ['spring'], wordOfFlower: 'spiritual beauty', meanings: ['spiritual beauty', 'grace'], priceLevel: 'medium', mood: ['soft', 'romantic', 'delicate'], role: 'line' },
	{ id: 89, name: 'Forsythia', colors: ['yellow'], season: ['spring'], wordOfFlower: 'hope', meanings: ['hope', 'anticipation'], priceLevel: 'low', mood: ['bright', 'cheerful', 'fresh'], role: 'line' },
	{ id: 90, name: 'Plum Blossom (Prunus mume)', colors: ['white', 'pink'], season: ['winter', 'spring'], wordOfFlower: 'pure heart', meanings: ['pure heart', 'innocence'], priceLevel: 'medium', mood: ['fragrant', 'elegant', 'delicate'], role: 'line' },
	{ id: 91, name: 'Magnolia', colors: ['white', 'pink'], season: ['spring'], wordOfFlower: 'love of nature', meanings: ['love of nature', 'nobility'], priceLevel: 'medium', mood: ['elegant', 'soft', 'fragrant'], role: 'line' },
	{ id: 92, name: 'Redbud (Cercis chinensis)', colors: ['purple', 'pink'], season: ['spring'], wordOfFlower: 'friendship', meanings: ['friendship', 'awakening'], priceLevel: 'low', mood: ['cheerful', 'soft', 'fresh'], role: 'line' },
	{ id: 93, name: 'Flowering Quince (Chaenomeles)', colors: ['red', 'pink', 'orange'], season: ['spring'], wordOfFlower: 'trust', meanings: ['trust', 'shyness'], priceLevel: 'low', mood: ['cheerful', 'warm', 'rustic'], role: 'line' }
];

/**
 * @param {string} color
 * @param {string[]} palette
 */
function colorMatchesPalette(color, palette) {
	const terms = [color, ...(NEUTRAL_COLOR_ALIASES[color] ?? [])];
	return palette.some((p) => terms.some((term) => p.includes(term) || term.includes(p)));
}

/**
 * Flowers with silver/beige/brown lean on mood tags when palettes name hue, not tone.
 * @param {FlowerRecord} flower
 */
function moodMatchWeight(flower) {
	return flower.colors.some((color) => NEUTRAL_COLORS.has(color)) ? 3 : 2;
}

/**
 * @typedef {Object} FlowerCandidate
 * @property {string} name
 * @property {'main' | 'filler' | 'line' | 'foliage'} role
 * @property {'low' | 'medium' | 'high'} priceLevel
 * @property {'common' | 'limited' | 'rare'} cutAvailability
 * @property {string} wordOfFlower
 * @property {string[]} colors
 * @property {string[]} mood
 * @property {string} [family]
 * @property {number} matchScore
 */

/**
 * @typedef {Object} MoodFlowerCandidates
 * @property {string[]} colors
 * @property {FlowerCandidate[]} main
 * @property {FlowerCandidate[]} filler
 * @property {FlowerCandidate[]} line
 * @property {FlowerCandidate[]} foliage
 */

/**
 * @param {FlowerRecord} flower
 * @param {number} score
 * @returns {FlowerCandidate}
 */
function toCandidate(flower, score) {
	return {
		name: flower.name,
		role: flower.role,
		priceLevel: flower.priceLevel,
		cutAvailability: flower.cutAvailability ?? 'common',
		wordOfFlower: flower.wordOfFlower,
		colors: flower.colors,
		mood: flower.mood,
		...(flower.family ? { family: flower.family } : {}),
		matchScore: score
	};
}

/**
 * @param {MoodAnalysis} mood
 * @param {string} [season]
 * @returns {MoodFlowerCandidates}
 */
export function matchFlowersFromMood(mood, season) {
	const palette = mood.colorPalette.map((c) => c.toLowerCase());
	const keywords = [...mood.moodKeywords, ...mood.styleImpression, ...mood.textureKeywords].map(
		(k) => k.toLowerCase()
	);

	const scoreFlower = (flower) => {
		let score = 0;

		for (const color of flower.colors) {
			if (colorMatchesPalette(color, palette)) {
				score += 2;
			}
		}

		const moodWeight = moodMatchWeight(flower);
		for (const tag of flower.mood) {
			if (keywords.some((k) => k.includes(tag) || tag.includes(k))) {
				score += moodWeight;
			}
		}

		if (season && flower.season.includes(season.toLowerCase())) {
			score += 1;
		}

		score -= CUT_AVAILABILITY_PENALTY[flower.cutAvailability ?? 'common'];

		return score;
	};

	const ranked = [...flowerDB]
		.map((flower) => ({ flower, score: scoreFlower(flower) }))
		.sort((a, b) => b.score - a.score);

	/**
	 * @param {typeof ranked} list
	 * @param {(flower: FlowerRecord) => boolean} roleFilter
	 * @param {number} limit
	 */
	const pickUnique = (list, roleFilter, limit) => {
		/** @type {typeof ranked} */
		const picked = [];
		/** @type {Set<string>} */
		const usedFamilies = new Set();

		for (const item of list) {
			if (!roleFilter(item.flower)) continue;

			const family = item.flower.family;
			if (family && usedFamilies.has(family)) continue;

			picked.push(item);
			if (family) usedFamilies.add(family);
			if (picked.length >= limit) break;
		}

		return picked;
	};

	const mains = pickUnique(ranked, (flower) => flower.role === 'main', 4);
	const accents = pickUnique(
		ranked,
		(flower) => flower.role === 'filler' || flower.role === 'line',
		5
	);
	const foliage = pickUnique(ranked, (flower) => flower.role === 'foliage', 2);

	return {
		colors: mood.colorPalette.slice(0, 3),
		main: mains.map(({ flower, score }) => toCandidate(flower, score)),
		filler: accents
			.filter(({ flower }) => flower.role === 'filler')
			.map(({ flower, score }) => toCandidate(flower, score)),
		line: accents
			.filter(({ flower }) => flower.role === 'line')
			.map(({ flower, score }) => toCandidate(flower, score)),
		foliage: foliage.map(({ flower, score }) => toCandidate(flower, score))
	};
}
