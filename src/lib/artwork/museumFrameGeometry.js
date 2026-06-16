/**
 * white frame.svg 비율을 768×1024 내부 개구부에 맞춘 논리 좌표.
 * SVG 외곽 206×280, 내부 179.29×253.17, mat ~13.3px.
 */

/** 꽃다발 이미지 출력 크기 (3:4) */
export const INNER_W = 768;
export const INNER_H = 1024;

/** inner 대비 mat 두께 (SVG 비율 환산) */
export const MAT_X = Math.round((13.3574 / 179.2866) * INNER_W);
export const MAT_Y = Math.round((13.2979 / 253.1691) * INNER_H);

export const OUTER_W = INNER_W + MAT_X * 2;
export const OUTER_H = INNER_H + MAT_Y * 2;

export const FRAME_STROKE = '#D5D5D5';
export const FRAME_FILL = '#FFFFFF';

/** ref/frame ref.png 시각 기준 — 개구부 안 아트워크 너비 비율 (액자 크기는 그대로) */
export const ARTWORK_INNER_SCALE = 0.85;

/** CSS % 배치용 (0–100) */
export const APERTURE_LEFT_PCT = (MAT_X / OUTER_W) * 100;
export const APERTURE_TOP_PCT = (MAT_Y / OUTER_H) * 100;
export const APERTURE_WIDTH_PCT = (INNER_W / OUTER_W) * 100;
export const APERTURE_HEIGHT_PCT = (INNER_H / OUTER_H) * 100;

export const OUTER_ASPECT_RATIO = `${OUTER_W} / ${OUTER_H}`;
