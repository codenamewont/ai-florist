import seedSrc from '$lib/assets/landing/seed.svg';
import sproutSrc from '$lib/assets/landing/sprout.svg';
import flowerSrc from '$lib/assets/landing/flower.svg';
import bouquetSrc from '$lib/assets/landing/bouquet.svg';

/** 랜딩 growth metaphor — ref/route illustration SVG 4단계 */
export const LANDING_GROWTH_STAGES = [
	{ id: 'seed', src: seedSrc, heightClass: 'h-[2.125rem] sm:h-9', delayMs: 0 },
	{ id: 'sprout', src: sproutSrc, heightClass: 'h-16 sm:h-20', delayMs: 520 },
	{ id: 'flower', src: flowerSrc, heightClass: 'h-24 sm:h-28', delayMs: 1040 },
	{ id: 'bouquet', src: bouquetSrc, heightClass: 'h-36 sm:h-44 lg:h-52', delayMs: 1560 }
];

export const LANDING_STAGE_REVEAL_MS = 680;
