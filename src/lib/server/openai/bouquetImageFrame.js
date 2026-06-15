import sharp from 'sharp';

/** Product bouquet output — 3:4 portrait (matches UI aspect-[3/4] and mock SVG). */
export const BOUQUET_OUTPUT_WIDTH = 768;
export const BOUQUET_OUTPUT_HEIGHT = 1024;
export const BOUQUET_OUTPUT_SIZE = `${BOUQUET_OUTPUT_WIDTH}x${BOUQUET_OUTPUT_HEIGHT}`;

/** Closest portrait size supported by gpt-image-1 (2:3). Cropped to 3:4 after generation. */
export const OPENAI_REQUEST_WIDTH = 1024;
export const OPENAI_REQUEST_HEIGHT = 1536;
export const OPENAI_REQUEST_SIZE = `${OPENAI_REQUEST_WIDTH}x${OPENAI_REQUEST_HEIGHT}`;

const PAD_LEFT = (OPENAI_REQUEST_WIDTH - BOUQUET_OUTPUT_WIDTH) / 2;
const PAD_TOP = (OPENAI_REQUEST_HEIGHT - BOUQUET_OUTPUT_HEIGHT) / 2;

/**
 * Center-crop (and resize if needed) to exact 3:4 bouquet output.
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function frameToBouquetOutput(buffer) {
	const meta = await sharp(buffer).metadata();
	const width = meta.width ?? OPENAI_REQUEST_WIDTH;
	const height = meta.height ?? OPENAI_REQUEST_HEIGHT;

	if (width === BOUQUET_OUTPUT_WIDTH && height === BOUQUET_OUTPUT_HEIGHT) {
		return buffer;
	}

	const targetRatio = BOUQUET_OUTPUT_WIDTH / BOUQUET_OUTPUT_HEIGHT;
	let cropWidth = width;
	let cropHeight = height;

	if (width / height > targetRatio) {
		cropWidth = Math.round(height * targetRatio);
	} else {
		cropHeight = Math.round(width / targetRatio);
	}

	const left = Math.max(0, Math.round((width - cropWidth) / 2));
	const top = Math.max(0, Math.round((height - cropHeight) / 2));

	return sharp(buffer)
		.extract({ left, top, width: cropWidth, height: cropHeight })
		.resize(BOUQUET_OUTPUT_WIDTH, BOUQUET_OUTPUT_HEIGHT)
		.png()
		.toBuffer();
}

/**
 * Pad a 3:4 bouquet image to OpenAI's 2:3 request size (white letterbox).
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
export async function padToOpenAIRequestSize(buffer) {
	const meta = await sharp(buffer).metadata();
	if (meta.width === OPENAI_REQUEST_WIDTH && meta.height === OPENAI_REQUEST_HEIGHT) {
		return buffer;
	}

	return sharp(buffer)
		.resize(BOUQUET_OUTPUT_WIDTH, BOUQUET_OUTPUT_HEIGHT, { fit: 'fill' })
		.extend({
			top: PAD_TOP,
			bottom: PAD_TOP,
			left: PAD_LEFT,
			right: PAD_LEFT,
			background: { r: 255, g: 255, b: 255, alpha: 1 }
		})
		.png()
		.toBuffer();
}

/**
 * Pad an OpenAI edit mask (transparent=edit, opaque=preserve) to the request canvas.
 * @param {Buffer} maskBuffer
 * @returns {Promise<Buffer>}
 */
export async function padMaskToOpenAIRequestSize(maskBuffer) {
	const meta = await sharp(maskBuffer).metadata();
	if (meta.width === OPENAI_REQUEST_WIDTH && meta.height === OPENAI_REQUEST_HEIGHT) {
		return maskBuffer;
	}

	return sharp(maskBuffer)
		.extend({
			top: PAD_TOP,
			bottom: PAD_TOP,
			left: PAD_LEFT,
			right: PAD_LEFT,
			background: { r: 255, g: 255, b: 255, alpha: 255 }
		})
		.png()
		.toBuffer();
}
