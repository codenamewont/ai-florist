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
export function deleteFlowKey(key) {
	const next = loadFlow();
	delete next[key];
	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	return next;
}

/** @param {string} key */
export function getFlowObject(key) {
	const value = loadFlow()[key];
	return value && typeof value === 'object' ? value : null;
}

/** Dev Fill로 채워진 세션인지 */
export function isDevSeeded() {
	return loadFlow().devSeeded === true;
}

/**
 * create/upload/message에서 쓰는 userInput (relationship, occasion 등).
 * notes는 message Continue 이후에만 붙으므로 여기서는 제외합니다.
 * @returns {Record<string, unknown>}
 */
export function getFlowUserInput() {
	const input = getFlowObject('userInput');
	if (!input) return {};

	const createOnly = { ...input };
	delete createOnly.notes;
	return createOnly;
}

/**
 * @returns {{ who: string | null, whatFor: string | null, style: string | null, budget: number }}
 */
export function readCreateFormFromFlow() {
	const input = getFlowUserInput();

	return {
		who: typeof input.relationship === 'string' ? input.relationship : null,
		whatFor: typeof input.occasion === 'string' ? input.occasion : null,
		style: typeof input.style === 'string' ? input.style : null,
		budget: typeof input.budget === 'number' ? input.budget : 50_000
	};
}

/**
 * @param {{ who: string | null, whatFor: string | null, style: string | null, budget: number }} form
 */
export function saveCreateFormToFlow(form) {
	const existing = getFlowObject('userInput') ?? {};

	saveFlow({
		userInput: {
			...existing,
			relationship: form.who ?? undefined,
			occasion: form.whatFor ?? undefined,
			style: form.style ?? undefined,
			budget: Number(form.budget)
		}
	});
}

/**
 * Dev Fill 직후 create에 1회만 더미 폼 적용. 없으면 null 반환.
 * @returns {{ who: string | null, whatFor: string | null, style: string | null, budget: number } | null}
 */
export function consumeDevCreateSnapshot() {
	const snap = getFlowObject('devCreateSnapshot');
	deleteFlowKey('devCreateSnapshot');
	if (!snap) return null;

	return {
		who: typeof snap.relationship === 'string' ? snap.relationship : null,
		whatFor: typeof snap.occasion === 'string' ? snap.occasion : null,
		style: typeof snap.style === 'string' ? snap.style : null,
		budget: typeof snap.budget === 'number' ? snap.budget : 50_000
	};
}

/**
 * Dev Fill 직후 message에 1회만 더미 카드 메시지 적용. 없으면 null.
 * @returns {string | null}
 */
export function consumeDevMessageSnapshot() {
	const snap = getFlowObject('devMessageSnapshot');
	deleteFlowKey('devMessageSnapshot');
	if (!snap || typeof snap.text !== 'string') return null;
	return snap.text;
}
