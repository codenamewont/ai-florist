/** OpenAI flower card batch — 프롬프트 이름·템플릿 (flowerDB 레코드는 수정하지 않음) */

/** @type {Record<number, string>} id → 프롬프트에 넣을 영문 꽃 이름 */
export const PROMPT_NAME_OVERRIDES = {
	33: 'red spider lily',
	36: 'bird of paradise flower',
	40: 'wax flower',
	41: 'caspia statice',
	47: 'craspedia billy balls',
	49: "queen anne's lace",
	50: 'nigella love-in-a-mist',
	60: 'statice limonium',
	62: 'strawflower helichrysum',
	64: 'chinese lantern physalis',
	65: 'globe amaranth gomphrena',
	74: 'pussy willow branch',
	80: 'foxtail millet stem',
	83: 'silver grass miscanthus'
};

/**
 * DB display name → 프롬프트용 이름 (괄호 앞, lowercase)
 * @param {string} name
 */
export function normalizeFlowerPromptName(name) {
	const primary = name.split('(')[0].trim();
	return primary.toLowerCase();
}

/**
 * @param {{ id: number, name: string }} flower
 */
export function getPromptNameForFlower(flower) {
	return PROMPT_NAME_OVERRIDES[flower.id] ?? normalizeFlowerPromptName(flower.name);
}

/**
 * @param {string} flowerName — getPromptNameForFlower 결과
 */
export function buildFlowerCardPrompt(flowerName) {
	return (
		`A single ${flowerName} flower stem, isolated object, transparent background, ` +
		`realistic botanical style, front-facing, centered composition, ` +
		`full stem visible from base to bloom, flower head in upper third of frame, ` +
		`stem centered vertically, consistent catalog framing for all species, ` +
		`no vase, no bouquet, no hand, no text, soft natural lighting, consistent scale, ` +
		`PNG asset for UI card`
	);
}
