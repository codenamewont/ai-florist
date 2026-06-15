import zlib from 'node:zlib';

/** @param {Array<{ x: number, y: number }>} polygon */
function closePolygon(polygon) {
	if (polygon.length < 3) return polygon;
	const first = polygon[0];
	const last = polygon[polygon.length - 1];
	if (first.x === last.x && first.y === last.y) return polygon;
	return [...polygon, first];
}

/**
 * @param {number} x
 * @param {number} y
 * @param {Array<{ x: number, y: number }>} polygon
 */
function pointInPolygon(x, y, polygon) {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x;
		const yi = polygon[i].y;
		const xj = polygon[j].x;
		const yj = polygon[j].y;
		const intersects =
			yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
		if (intersects) inside = !inside;
	}
	return inside;
}

/** @param {Buffer} buffer */
function readPngDimensions(buffer) {
	if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
		throw new Error('Invalid PNG image');
	}

	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	};
}

/** @param {Buffer} buffer */
function readJpegDimensions(buffer) {
	let offset = 2;
	while (offset < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}

		const marker = buffer[offset + 1];
		if (marker === 0xc0 || marker === 0xc2 || marker === 0xc1) {
			return {
				height: buffer.readUInt16BE(offset + 5),
				width: buffer.readUInt16BE(offset + 7)
			};
		}

		const segmentLength = buffer.readUInt16BE(offset + 2);
		offset += 2 + segmentLength;
	}

	throw new Error('Could not read JPEG dimensions');
}

/**
 * @param {Buffer} buffer
 * @param {string} mimeType
 */
export function readImageDimensions(buffer, mimeType) {
	if (
		mimeType.includes('png') ||
		(buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG')
	) {
		return readPngDimensions(buffer);
	}

	if (
		mimeType.includes('jpeg') ||
		mimeType.includes('jpg') ||
		(buffer[0] === 0xff && buffer[1] === 0xd8)
	) {
		return readJpegDimensions(buffer);
	}

	throw new Error(`Unsupported image type for mask: ${mimeType}`);
}

/** @param {number} width @param {number} height @param {Uint8Array} rgba */
function encodePng(width, height, rgba) {
	/** @type {number[]} */
	const rows = [];
	let stride = 0;
	for (let y = 0; y < height; y += 1) {
		rows.push(0);
		for (let x = 0; x < width; x += 1) {
			const index = stride + x * 4;
			rows.push(rgba[index], rgba[index + 1], rgba[index + 2], rgba[index + 3]);
		}
		stride += width * 4;
	}

	const compressed = zlib.deflateSync(Buffer.from(rows));

	/** @type {Buffer[]} */
	const chunks = [];
	const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

	/** @param {string} type @param {Buffer} data */
	const pushChunk = (type, data) => {
		const typeBuffer = Buffer.from(type, 'ascii');
		const length = Buffer.alloc(4);
		length.writeUInt32BE(data.length);
		const crcInput = Buffer.concat([typeBuffer, data]);
		const crc = Buffer.alloc(4);
		crc.writeUInt32BE(crc32(crcInput));
		chunks.push(length, typeBuffer, data, crc);
	};

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	pushChunk('IHDR', ihdr);
	pushChunk('IDAT', compressed);
	pushChunk('IEND', Buffer.alloc(0));

	return Buffer.concat([signature, ...chunks]);
}

/** @param {Buffer} data */
function crc32(data) {
	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i += 1) {
		crc ^= data[i];
		for (let bit = 0; bit < 8; bit += 1) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

/**
 * OpenAI mask: transparent pixels = edit region, opaque = preserve.
 * @param {number} width
 * @param {number} height
 * @param {Array<{ x: number, y: number }>} selection
 */
export function buildOpenAIEditMask(width, height, selection) {
	const polygon = closePolygon(
		selection.map((point) => ({
			x: (point.x / 100) * width,
			y: (point.y / 100) * height
		}))
	);

	const rgba = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const index = (y * width + x) * 4;
			const inside = pointInPolygon(x + 0.5, y + 0.5, polygon);
			if (inside) {
				rgba[index] = 0;
				rgba[index + 1] = 0;
				rgba[index + 2] = 0;
				rgba[index + 3] = 0;
			} else {
				rgba[index] = 255;
				rgba[index + 1] = 255;
				rgba[index + 2] = 255;
				rgba[index + 3] = 255;
			}
		}
	}

	return encodePng(width, height, rgba);
}

/**
 * @param {{ base64: string, mimeType: string }} sourceImage
 * @param {Array<{ x: number, y: number }>} selection
 */
export function buildAreaEditMask(sourceImage, selection) {
	const buffer = Buffer.from(sourceImage.base64, 'base64');
	const { width, height } = readImageDimensions(buffer, sourceImage.mimeType);
	const maskBuffer = buildOpenAIEditMask(width, height, selection);

	return {
		base64: maskBuffer.toString('base64'),
		mimeType: 'image/png',
		width,
		height
	};
}
