import {
	FRAME_FILL,
	FRAME_STROKE,
	INNER_H,
	INNER_W,
	MAT_X,
	MAT_Y,
	OUTER_H,
	OUTER_W
} from './museumFrameGeometry.js';

/**
 * p5 캔버스에 미술관 화이트 액자 링을 그립니다.
 * 중앙 개구부는 투명 — 아래 HTML 슬롯이 보입니다.
 * @param {import('p5')} p
 * @param {number} canvasW
 * @param {number} canvasH
 */
export function drawMuseumFrame(p, canvasW, canvasH) {
	p.clear();

	const scale = Math.min(canvasW / OUTER_W, canvasH / OUTER_H);
	const drawW = OUTER_W * scale;
	const drawH = OUTER_H * scale;
	const offsetX = (canvasW - drawW) / 2;
	const offsetY = (canvasH - drawH) / 2;

	const matX = MAT_X * scale;
	const matY = MAT_Y * scale;
	const innerW = INNER_W * scale;
	const innerH = INNER_H * scale;
	const innerX = offsetX + matX;
	const innerY = offsetY + matY;
	const strokeW = Math.max(1, scale);

	p.push();
	p.fill(FRAME_FILL);
	p.noStroke();

	// mat 링 (상·하·좌·우 4조각)
	p.rect(offsetX, offsetY, drawW, matY);
	p.rect(offsetX, offsetY + matY + innerH, drawW, matY);
	p.rect(offsetX, offsetY + matY, matX, innerH);
	p.rect(offsetX + matX + innerW, offsetY + matY, matX, innerH);

	// 외곽·내곽 테두리
	p.noFill();
	p.stroke(FRAME_STROKE);
	p.strokeWeight(strokeW);
	p.rect(offsetX, offsetY, drawW, drawH);
	p.rect(innerX, innerY, innerW, innerH);

	p.pop();
}

/**
 * p5 instance mode 스케치 팩토리.
 * @param {HTMLElement} container
 * @returns {Promise<import('p5')>}
 */
export function createMuseumFrameSketch(container) {
	return new Promise((resolve) => {
		import('p5').then(({ default: p5 }) => {
			const sketch = (/** @type {import('p5')} */ p) => {
				p.setup = () => {
					const w = container.clientWidth || 1;
					const h = container.clientHeight || 1;
					const canvas = p.createCanvas(w, h);
					canvas.parent(container);
					canvas.elt.style.pointerEvents = 'none';
					p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
					drawMuseumFrame(p, w, h);
				};

				p.windowResized = () => {
					const w = container.clientWidth || 1;
					const h = container.clientHeight || 1;
					p.resizeCanvas(w, h);
					drawMuseumFrame(p, w, h);
				};
			};

			resolve(new p5(sketch, container));
		});
	});
}
