const STORAGE_KEY = 'flower-flow';

/** @returns {Record<string, unknown>} */
export function loadFlow() {
	if (typeof sessionStorage === 'undefined') return {};

	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		return {};
	}
}

/** @param {Record<string, unknown>} patch */
export function saveFlow(patch) {
	const next = { ...loadFlow(), ...patch };
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	return next;
}

export function clearFlow() {
	sessionStorage.removeItem(STORAGE_KEY);
}

/** @param {string} key */
export function getFlowString(key) {
	const value = loadFlow()[key];
	return typeof value === 'string' ? value : '';
}

/** @param {string} key */
export function getFlowObject(key) {
	const value = loadFlow()[key];
	return value && typeof value === 'object' ? value : null;
}
