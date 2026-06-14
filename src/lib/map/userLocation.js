/** 서울시청 — 위치 권한 거부·미지원 시 fallback */
export const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 };

/**
 * @typedef {{ lat: number, lng: number, fromDevice: boolean }} UserMapCenter
 */

/**
 * 브라우저 Geolocation API로 현재 위치를 가져옵니다.
 * 실패 시 DEFAULT_MAP_CENTER를 반환합니다.
 *
 * @returns {Promise<UserMapCenter>}
 */
export function getUserMapCenter() {
	return new Promise((resolve) => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) {
			resolve({ ...DEFAULT_MAP_CENTER, fromDevice: false });
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					fromDevice: true
				});
			},
			() => {
				resolve({ ...DEFAULT_MAP_CENTER, fromDevice: false });
			},
			{
				enableHighAccuracy: true,
				timeout: 10_000,
				maximumAge: 60_000
			}
		);
	});
}
