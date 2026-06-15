/** @typedef {'moodboard' | 'sns'} UploadMode */

/** @type {UploadMode} */
let mode = 'moodboard';

/** @type {{ color: File | null, season: File | null, character: File | null, location: File | null }} */
let moodboard = {
	color: null,
	season: null,
	character: null,
	location: null
};

/** @type {File | null} */
let sns = null;

/** @returns {UploadMode} */
export function readUploadDraftMode() {
	return mode;
}

/** @param {UploadMode} next */
export function writeUploadDraftMode(next) {
	mode = next;
}

/** @returns {{ color: File | null, season: File | null, character: File | null, location: File | null }} */
export function readMoodboardFiles() {
	return {
		color: moodboard.color,
		season: moodboard.season,
		character: moodboard.character,
		location: moodboard.location
	};
}

/** @param {Record<string, File | null | undefined>} files */
export function writeMoodboardFiles(files) {
	moodboard = {
		color: files.color ?? null,
		season: files.season ?? null,
		character: files.character ?? null,
		location: files.location ?? null
	};
}

/** @returns {File | null} */
export function readSnsFile() {
	return sns;
}

/** @param {File | null | undefined} file */
export function writeSnsFile(file) {
	sns = file ?? null;
}

/** @returns {File | null} */
export function readPrimaryUploadFile() {
	if (mode === 'sns') return sns;
	return moodboard.color ?? moodboard.season ?? moodboard.character ?? moodboard.location ?? null;
}

export function clearUploadDraftCache() {
	mode = 'moodboard';
	moodboard = { color: null, season: null, character: null, location: null };
	sns = null;
}
