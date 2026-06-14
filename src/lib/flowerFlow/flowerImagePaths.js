/** flowerDB id → result 꽃 카드용 정적 이미지 경로 (런타임 AI 생성 없음) */

export const FLOWER_IMAGE_BASE = '/flowers';
export const FLOWER_IMAGE_PLACEHOLDER = `${FLOWER_IMAGE_BASE}/placeholder.svg`;

/** @param {number} id flowerDB id (1–93) */
export function getFlowerImageSrc(id) {
	if (!Number.isFinite(id) || id < 1) {
		return FLOWER_IMAGE_PLACEHOLDER;
	}

	return `${FLOWER_IMAGE_BASE}/${id}.png`;
}
