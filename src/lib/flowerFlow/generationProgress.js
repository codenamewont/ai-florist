import { GENERATION_STEP_COUNT } from '$lib/components/ui/generating/generationSteps.js';

/** 실제 API 기준 예상 총 소요 시간 (ms) — 7단계 균등 분배 */
export const DEFAULT_ESTIMATED_MS = 40_000;

/** mock/dev: 7단계가 눈에 보이도록 짧게 */
export const MOCK_ESTIMATED_MS = 6_000;

/** stepInterval 하한 */
export const MIN_STEP_MS = 500;

/** API 조기 완료 시 남은 단계 catch-up 간격 */
export const CATCHUP_STEP_MS = 250;

/** @param {number} ms */
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * generating UI 7단계 시간 기반 진행 컨트롤러.
 * activeStepIndex: 0–6 = 해당 단계 active, GENERATION_STEP_COUNT = 전부 완료.
 *
 * @param {(index: number) => void} onStepChange
 */
export function createGenerationProgress(onStepChange) {
	/** @type {ReturnType<typeof setTimeout> | null} */
	let stepTimer = null;
	let disposed = false;
	let currentIndex = 0;
	let capped = false;

	function emit(index) {
		currentIndex = index;
		onStepChange(index);
	}

	function clearStepTimer() {
		if (stepTimer) {
			clearTimeout(stepTimer);
			stepTimer = null;
		}
	}

	function dispose() {
		disposed = true;
		clearStepTimer();
	}

	function reset() {
		clearStepTimer();
		disposed = false;
		capped = false;
		currentIndex = 0;
		emit(0);
	}

	/**
	 * @param {number} estimatedMs
	 * @returns {number}
	 */
	function stepIntervalMs(estimatedMs) {
		return Math.max(MIN_STEP_MS, Math.floor(estimatedMs / GENERATION_STEP_COUNT));
	}

	/**
	 * @param {number} estimatedMs
	 */
	function scheduleNextStep(estimatedMs) {
		clearStepTimer();
		if (disposed || capped) return;

		stepTimer = setTimeout(() => {
			if (disposed || capped) return;

			if (currentIndex < GENERATION_STEP_COUNT - 1) {
				emit(currentIndex + 1);

				if (currentIndex >= GENERATION_STEP_COUNT - 1) {
					capped = true;
					return;
				}

				scheduleNextStep(estimatedMs);
			}
		}, stepIntervalMs(estimatedMs));
	}

	/**
	 * @param {{ estimatedMs?: number }} [options]
	 */
	function begin(options = {}) {
		const estimatedMs = options.estimatedMs ?? DEFAULT_ESTIMATED_MS;
		reset();
		emit(0);
		scheduleNextStep(estimatedMs);
	}

	/** 전 단계 완료 */
	function completeAll() {
		clearStepTimer();
		capped = true;
		emit(GENERATION_STEP_COUNT);
	}

	/** API 완료 시 — 남은 단계 catch-up 후 completeAll */
	async function finishWhenReady() {
		clearStepTimer();

		while (!disposed && currentIndex < GENERATION_STEP_COUNT - 1) {
			emit(currentIndex + 1);
			await wait(CATCHUP_STEP_MS);
		}

		if (!disposed) {
			completeAll();
		}
	}

	return {
		begin,
		completeAll,
		finishWhenReady,
		reset,
		dispose
	};
}
