<script>
	import { onMount } from 'svelte';
	import FloristOrderMessage from './FloristOrderMessage.svelte';
	import KakaoMap from './KakaoMap.svelte';
	import ShopList from './ShopList.svelte';
	import { DEFAULT_MAP_CENTER } from '$lib/map/userLocation.js';

	let {
		shops = [],
		loading = false,
		error = '',
		selectedShopId = $bindable(null),
		mock = false,
		fitBounds = false,
		orderPlainText = '',
		orderKoPlainText = '',
		initialLat = DEFAULT_MAP_CENTER.lat,
		initialLng = DEFAULT_MAP_CENTER.lng,
		locationNotice = '',
		onrefresh
	} = $props();

	let mapCenterLat = $state(DEFAULT_MAP_CENTER.lat);
	let mapCenterLng = $state(DEFAULT_MAP_CENTER.lng);
	let panTarget = $state(null);

	onMount(() => {
		mapCenterLat = initialLat;
		mapCenterLng = initialLng;
	});

	function handleCenterChange(lat, lng) {
		mapCenterLat = lat;
		mapCenterLng = lng;
	}

	function handleShopSelect(id) {
		selectedShopId = id;
		const shop = shops.find((s) => s.id === id);
		if (shop?.lat != null && shop?.lng != null) {
			panTarget = { lat: shop.lat, lng: shop.lng };
		}
	}

	function handleRefresh() {
		onrefresh?.(mapCenterLat, mapCenterLng);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<header class="shrink-0 px-6 py-8 md:px-10 lg:px-12 lg:py-10">
		<h1 class="text-3xl leading-relaxed font-light text-muted md:text-4xl lg:text-[2.75rem]">
			Find a nearby florist
		</h1>
		<p class="mt-3 text-sm text-muted">Move the map, then refresh to search this area.</p>
		{#if locationNotice}
			<p class="mt-2 text-xs text-muted">{locationNotice}</p>
		{/if}
		{#if mock}
			<p class="mt-2 text-xs text-muted">Showing sample shops (no Kakao API key).</p>
		{/if}
		<div class="mt-6 border-b border-pill lg:mt-8"></div>
	</header>

	<div class="shrink-0 px-6 pb-4 md:px-10 lg:px-12">
		<FloristOrderMessage enPlainText={orderPlainText} koPlainText={orderKoPlainText} />
	</div>

	{#if error}
		<p class="px-6 text-sm text-red-600 md:px-10 lg:px-12">{error}</p>
	{/if}

	<div class="flex min-h-0 flex-1 flex-col gap-6 px-6 pb-8 md:px-10 lg:flex-row lg:px-12 lg:pb-10">
		<div class="relative flex min-h-64 flex-1 flex-col overflow-hidden border border-line lg:min-h-0">
			<KakaoMap
				initialLat={initialLat}
				initialLng={initialLng}
				{shops}
				selectedId={selectedShopId}
				{fitBounds}
				panTo={panTarget}
				oncenterchange={handleCenterChange}
				onselect={handleShopSelect}
			/>
			<button
				type="button"
				disabled={loading}
				onclick={handleRefresh}
				class="absolute top-3 right-3 z-10 rounded bg-surface/95 px-3 py-2 text-xs text-ink shadow-md ring-1 ring-black/10 backdrop-blur hover:bg-surface disabled:opacity-50"
			>
				{loading ? 'Searching...' : 'Refresh'}
			</button>
		</div>

		<div class="w-full shrink-0 lg:w-72 lg:overflow-y-auto">
			{#if loading && shops.length === 0}
				<p class="text-sm text-muted">Searching for flower shops...</p>
			{:else}
				<ShopList shops={shops} bind:selectedId={selectedShopId} onselect={handleShopSelect} />
			{/if}
		</div>
	</div>
</div>
