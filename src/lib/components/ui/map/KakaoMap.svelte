<script>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	let {
		initialLat = 37.5665,
		initialLng = 126.978,
		shops = [],
		selectedId = null,
		fitBounds = false,
		panTo = null,
		oncenterchange,
		onselect
	} = $props();

	let container = $state(null);
	let mapReady = $state(false);
	let mapError = $state('');

	const mapKey = env.PUBLIC_KAKAO_MAP_KEY;

	/** @type {ReturnType<typeof window.kakao.maps.Map> | null} */
	let mapInstance = $state(null);
	/** @type {ReturnType<typeof window.kakao.maps.InfoWindow> | null} */
	let infoWindow = null;
	// 마커↔가게 내부 장부. 템플릿에서 반응형으로 읽지 않으므로 일반 Map 사용.
	// SvelteMap이면 markers $effect가 같은 맵을 읽고/쓰며 무한 루프(effect_update_depth_exceeded)가 남.
	/** @type {Map<string, { marker: ReturnType<typeof window.kakao.maps.Marker>; shop: (typeof shops)[number] }>} */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- 의도적 비반응형: 위 설명 참고
	let shopMarkerMap = new Map();

	function relayoutMap() {
		mapInstance?.relayout?.();
	}

	/**
	 * @param {string} value
	 */
	function escapeHtml(value) {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;');
	}

	/**
	 * @param {(typeof shops)[number]} shop
	 */
	function buildInfoContent(shop) {
		const distance = shop.distance
			? `<p style="margin:4px 0 0;font-size:12px;color:#666">${escapeHtml(shop.distance)}</p>`
			: '';
		const phone = shop.phone
			? `<p style="display:block;margin:4px 0 0;font-size:12px;color:#666;word-break:break-all;overflow-wrap:anywhere">${escapeHtml(shop.phone)}</p>`
			: '';

		return `<div style="display:block;padding:12px;min-width:0;width:min(260px,72vw);max-width:72vw;box-sizing:border-box;font-family:system-ui,sans-serif;line-height:1.45;overflow:visible;word-wrap:break-word;overflow-wrap:anywhere;white-space:normal">
			<p style="display:block;margin:0;font-size:15px;font-weight:600;color:#38322f;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(shop.name)}</p>
			<p style="display:block;margin:4px 0 0;font-size:13px;color:#555;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(shop.address)}</p>
			${distance}
			${phone}
		</div>`;
	}

	/**
	 * @param {string | null} shopId
	 */
	function showInfoForShop(shopId) {
		const map = mapInstance;
		if (!map || !mapReady || !window.kakao?.maps || !infoWindow) return;

		for (const [id, { marker }] of shopMarkerMap) {
			marker.setZIndex(id === shopId ? 2 : 0);
		}

		if (!shopId) {
			infoWindow.close();
			return;
		}

		const entry = shopMarkerMap.get(shopId);
		if (!entry) {
			infoWindow.close();
			return;
		}

		infoWindow.setContent(buildInfoContent(entry.shop));
		infoWindow.open(map, entry.marker);
	}

	onMount(() => {
		let cancelled = false;

		(async () => {
			if (!mapKey) {
				mapError = 'Set PUBLIC_KAKAO_MAP_KEY in .env to show the map.';
				return;
			}

			try {
				await loadKakaoScript(mapKey);
				if (cancelled || !container || !window.kakao?.maps) return;

				const center = new window.kakao.maps.LatLng(initialLat, initialLng);
				const map = new window.kakao.maps.Map(container, { center, level: 5 });
				mapInstance = map;
				infoWindow = new window.kakao.maps.InfoWindow({ removable: true });
				mapReady = true;

				window.kakao.maps.event.addListener(map, 'idle', () => {
					const c = map.getCenter();
					oncenterchange?.(c.getLat(), c.getLng());
				});

				requestAnimationFrame(() => relayoutMap());
			} catch (err) {
				if (!cancelled) {
					mapError = err instanceof Error ? err.message : 'Failed to load map';
				}
			}
		})();

		return () => {
			cancelled = true;
			infoWindow?.close();
			infoWindow = null;
			for (const { marker } of shopMarkerMap.values()) {
				marker.setMap(null);
			}
			shopMarkerMap.clear();
			mapInstance = null;
			mapReady = false;
		};
	});

	$effect(() => {
		const map = mapInstance;
		if (!map || !mapReady || !window.kakao?.maps) return;

		const shopList = shops;
		const shouldFit = fitBounds;

		infoWindow?.close();

		for (const { marker } of shopMarkerMap.values()) {
			marker.setMap(null);
		}
		shopMarkerMap.clear();

		const bounds = new window.kakao.maps.LatLngBounds();
		let hasMarker = false;

		for (const shop of shopList) {
			const shopLat = Number(shop.lat);
			const shopLng = Number(shop.lng);
			if (!Number.isFinite(shopLat) || !Number.isFinite(shopLng)) continue;

			const position = new window.kakao.maps.LatLng(shopLat, shopLng);
			const marker = new window.kakao.maps.Marker({
				position,
				map
			});

			window.kakao.maps.event.addListener(marker, 'click', () => {
				onselect?.(shop.id);
			});

			shopMarkerMap.set(shop.id, { marker, shop });
			bounds.extend(position);
			hasMarker = true;
		}

		if (hasMarker && shouldFit) {
			map.setBounds(bounds);
		}

		requestAnimationFrame(() => relayoutMap());
	});

	// 마커·리스트 선택 시 정보창 표시
	$effect(() => {
		const id = selectedId;
		const shopList = shops;
		if (!mapReady || shopList.length === 0) return;

		showInfoForShop(id);
	});

	// 리스트에서 가게 선택 시에만 이동 (panTo가 바뀔 때)
	const SELECTED_MAP_LEVEL = 4;
	$effect(() => {
		const map = mapInstance;
		const target = panTo;
		if (!map || !mapReady || !window.kakao?.maps || !target) return;

		const centerLat = Number(target.lat);
		const centerLng = Number(target.lng);
		if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return;

		const position = new window.kakao.maps.LatLng(centerLat, centerLng);

		// 고른 가게를 또렷하게 보여주려고, 너무 멀리 있을 때만 가까이 확대한 뒤 이동
		if (map.getLevel() > SELECTED_MAP_LEVEL) {
			map.setLevel(SELECTED_MAP_LEVEL, { anchor: position, animate: true });
		}
		map.panTo(position);
	});

	/**
	 * @param {string} key
	 */
	function loadKakaoScript(key) {
		return new Promise((resolve, reject) => {
			if (window.kakao?.maps) {
				window.kakao.maps.load(resolve);
				return;
			}

			const script = document.createElement('script');
			script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
			script.onload = () => window.kakao.maps.load(resolve);
			script.onerror = () => reject(new Error('Kakao Maps script failed to load'));
			document.head.appendChild(script);
		});
	}
</script>

<div class="relative min-h-64 flex-1 overflow-hidden bg-track lg:min-h-0">
	<div bind:this={container} class="absolute inset-0"></div>

	{#if mapError}
		<div
			class="absolute inset-0 flex items-center justify-center bg-track px-6 text-center text-sm text-muted"
		>
			{mapError}
		</div>
	{:else if !mapReady}
		<div class="absolute inset-0 flex items-center justify-center bg-track text-sm text-muted">
			Loading map...
		</div>
	{/if}
</div>
