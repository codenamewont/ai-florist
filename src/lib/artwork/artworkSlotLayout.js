/**
 * 2분할 좌측 액자 슬롯 — 페이지 전환 시 동일 위치·크기 유지.
 * DescriptionCard가 커져도 액자 슬롯(flex-none)은 위치·크기 고정, 카드만 아래로 늘어남.
 */

/**
 * 액자 전용 슬롯 — 프레임 높이만큼만 차지 (데스크톱에서 불필요한 빈 높이 제거)
 * 모바일 row 레이아웃용 최소 높이만 유지
 */
export const ARTWORK_SLOT_FLOWER =
	'flex h-[11rem] w-full shrink-0 flex-none items-start justify-center sm:h-[13rem] lg:h-auto lg:min-h-0';

/**
 * 액자 + DescriptionCard 래퍼
 * lg:pt-16 — 우측 ContextForm 헤더(lg:py-16)와 상단 정렬 (레퍼런스 기준)
 * 세로 중앙 배치(calc(50%...)) 없음 → 카드 길이와 무관하게 액자 Y 고정
 */
export const ARTWORK_SLOT_WRAPPER =
	'mx-auto flex min-h-0 w-full max-w-100 flex-1 flex-row items-start gap-8 px-6 pt-6 pb-8 lg:flex-col lg:items-center lg:justify-start lg:gap-5 lg:px-10 lg:pt-20 lg:pb-10';

/** 액자 외곽 최대 너비 */
export const ARTWORK_FRAME_MAX_W = 'w-full max-w-24 sm:max-w-28 lg:max-w-75';

/** DescriptionCard — 액자 바로 아래, flex-none으로 카드만 세로 확장 */
export const ARTWORK_SLOT_CARD = 'w-full min-w-0 shrink-0 flex-none lg:flex lg:justify-center';
