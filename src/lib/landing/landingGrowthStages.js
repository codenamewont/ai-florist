import { ARTWORK_SRC } from '$lib/components/ui/Artwork/artworkVariants.js';

/** 랜딩 growth metaphor — artwork 2 → 3 → 5 → 6 순서 */
export const LANDING_GROWTH_STAGES = [
	{
		id: 'create2',
		src: ARTWORK_SRC.create2,
		heightClass: 'h-16 sm:h-20',
		delayMs: 0
	},
	{
		id: 'upload1',
		src: ARTWORK_SRC.upload1,
		heightClass: 'h-24 sm:h-28',
		delayMs: 520
	},
	{
		id: 'message1',
		src: ARTWORK_SRC.message1,
		heightClass: 'h-32 sm:h-36 lg:h-40',
		delayMs: 1040
	},
	{
		id: 'generated',
		src: ARTWORK_SRC.generated,
		heightClass: 'h-36 sm:h-44 lg:h-52',
		delayMs: 1560
	}
];

export const LANDING_STAGE_GAP_MS = 520;
export const LANDING_STAGE_REVEAL_MS = 680;
export const LANDING_CYCLE_HOLD_MS = 3000;

const lastStage = LANDING_GROWTH_STAGES[LANDING_GROWTH_STAGES.length - 1];

/** 4단계 reveal 완료 + hold 후 다음 사이클까지 */
export const LANDING_CYCLE_MS =
	lastStage.delayMs + LANDING_STAGE_REVEAL_MS + LANDING_CYCLE_HOLD_MS;
