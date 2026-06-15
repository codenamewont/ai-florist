import sharp from 'sharp';
import {
	readImageDimensions,
	buildEditMaskRgba,
	countEditablePixels,
	encodeOpenAIMaskPng,
	erodeEditMask
} from './selectionMask.js';

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
function isBackgroundPixel(r, g, b) {
	return r > 240 && g > 240 && b > 240;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
function isStrongFoliagePixel(r, g, b) {
	return g > r + 18 && g > b + 18 && g > 70;
}

/**
 * @param {number} ar
 * @param {number} ag
 * @param {number} ab
 * @param {number} br
 * @param {number} bg
 * @param {number} bb
 */
function colorDistance(ar, ag, ab, br, bg, bb) {
	return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

/**
 * @param {Uint8Array} sourceRgba
 * @param {Uint8Array} editMaskRgba
 * @param {number} width
 * @param {number} height
 * @param {number} cx
 * @param {number} cy
 */
function medianSeedColor(sourceRgba, editMaskRgba, width, height, cx, cy) {
	/** @type {number[]} */
	const reds = [];
	/** @type {number[]} */
	const greens = [];
	/** @type {number[]} */
	const blues = [];

	const radius = Math.max(4, Math.round(Math.min(width, height) * 0.02));

	for (let y = Math.max(0, cy - radius); y <= Math.min(height - 1, cy + radius); y += 1) {
		for (let x = Math.max(0, cx - radius); x <= Math.min(width - 1, cx + radius); x += 1) {
			const index = (y * width + x) * 4;
			if (editMaskRgba[index + 3] !== 0) continue;

			const r = sourceRgba[index];
			const g = sourceRgba[index + 1];
			const b = sourceRgba[index + 2];
			if (isBackgroundPixel(r, g, b)) continue;

			reds.push(r);
			greens.push(g);
			blues.push(b);
		}
	}

	if (reds.length === 0) return null;

	const mid = Math.floor(reds.length / 2);
	reds.sort((a, b) => a - b);
	greens.sort((a, b) => a - b);
	blues.sort((a, b) => a - b);

	return { r: reds[mid], g: greens[mid], b: blues[mid] };
}

/**
 * @param {Uint8Array} sourceRgba
 * @param {Uint8Array} editMaskRgba
 * @param {number} width
 * @param {number} height
 * @param {{ r: number, g: number, b: number }} seed
 * @param {boolean} excludeFoliage
 * @param {number} threshold
 */
function buildColorAffinityMask(
	sourceRgba,
	editMaskRgba,
	width,
	height,
	seed,
	excludeFoliage,
	threshold
) {
	const refined = new Uint8Array(editMaskRgba.length);
	refined.set(editMaskRgba);

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = (y * width + x) * 4;
			if (editMaskRgba[index + 3] !== 0) {
				refined[index] = 255;
				refined[index + 1] = 255;
				refined[index + 2] = 255;
				refined[index + 3] = 255;
				continue;
			}

			const r = sourceRgba[index];
			const g = sourceRgba[index + 1];
			const b = sourceRgba[index + 2];

			const matches =
				!isBackgroundPixel(r, g, b) &&
				(!excludeFoliage || !isStrongFoliagePixel(r, g, b)) &&
				colorDistance(r, g, b, seed.r, seed.g, seed.b) <= threshold;

			if (!matches) {
				refined[index] = 255;
				refined[index + 1] = 255;
				refined[index + 2] = 255;
				refined[index + 3] = 255;
			}
		}
	}

	return refined;
}

/**
 * 사용자 polygon을 ROI 힌트로만 쓰고, 축소·색상 유사도로 refined OpenAI mask 생성.
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {Array<{ x: number, y: number }>} selection
 * @param {import('$lib/flowerFlow/areaEditIntent.js').AreaEditIntent} editContext
 */
export async function buildRefinedAreaEditMask(sourceImage, selection, editContext) {
	const buffer = Buffer.from(sourceImage.base64, 'base64');
	const { width, height } = readImageDimensions(buffer, sourceImage.mimeType);

	const rawMask = buildEditMaskRgba(width, height, selection);
	const bboxW =
		((editContext.selectionBounds.maxX - editContext.selectionBounds.minX) / 100) * width;
	const bboxH =
		((editContext.selectionBounds.maxY - editContext.selectionBounds.minY) / 100) * height;
	const erodeRadius = Math.max(3, Math.round(Math.min(bboxW, bboxH) * 0.12));

	let refined = erodeEditMask(rawMask, width, height, erodeRadius);
	const erodedCount = countEditablePixels(refined);

	if (editContext.isColorChange && erodedCount > 0) {
		const sourceRgba = await sharp(buffer).ensureAlpha().raw().toBuffer();
		const cx = Math.round((editContext.selectionCentroid.x / 100) * width);
		const cy = Math.round((editContext.selectionCentroid.y / 100) * height);
		const seed = medianSeedColor(sourceRgba, refined, width, height, cx, cy);

		if (seed) {
			const excludeFoliage =
				editContext.targetObject === 'ribbon/bow' ||
				editContext.targetObject === 'wrapping paper';
			const threshold = editContext.targetObject === 'wrapping paper' ? 42 : 55;
			const colorMask = buildColorAffinityMask(
				sourceRgba,
				refined,
				width,
				height,
				seed,
				excludeFoliage,
				threshold
			);
			const colorCount = countEditablePixels(colorMask);

			if (colorCount >= Math.max(24, Math.round(erodedCount * 0.15))) {
				refined = colorMask;
			}
		}
	}

	const maskBuffer = encodeOpenAIMaskPng(width, height, refined);

	return {
		base64: maskBuffer.toString('base64'),
		mimeType: 'image/png',
		width,
		height,
		editPixelCount: countEditablePixels(refined),
		rawPolygonPixelCount: countEditablePixels(rawMask)
	};
}
