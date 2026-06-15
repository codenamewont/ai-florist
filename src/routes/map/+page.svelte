<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import FlowNav from '$lib/components/ui/FlowNav.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MapPanel from '$lib/components/ui/map/MapPanel.svelte';
	import { fetchJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { buildFloristOrderMessage } from '$lib/flowerFlow/buildFloristOrderMessage.js';
	import { buildMapOrderDescription } from '$lib/flowerFlow/resolveRecipeFlowers.js';
	import { getFlowObject, getFlowString } from '$lib/flowerFlow/session.js';
	import { ARTWORK_CARD_DEFAULTS } from '$lib/flowerFlow/artworkCardCopy.js';
	import { getUserMapCenter } from '$lib/map/userLocation.js';

	const jobId = getFlowString('jobId');

	let shops = $state([]);
	let loading = $state(true);
	let error = $state('');
	let mock = $state(false);
	let selectedShopId = $state(null);
	let recipe = $state(null);
	let moodAnalysis = $state(null);
	let userInput = $state(null);
	let fitMapBounds = $state(true);
	let orderPlainText = $state('');
	let orderKoPlainText = $state('');
	let selectedImage = $state(null);
	let locationReady = $state(false);
	let searchLat = $state(37.5665);
	let searchLng = $state(126.978);
	let locationNotice = $state('');

	const sessionUserInput = getFlowObject('userInput') ?? {};

	const artworkTitle = $derived(
		selectedShopId ? 'Ready to order' : ARTWORK_CARD_DEFAULTS.map.title
	);

	const artworkDescription = $derived(
		selectedShopId
			? buildMapOrderDescription(recipe, {
					moodAnalysis,
					userInput: { ...sessionUserInput, ...userInput }
				})
			: ARTWORK_CARD_DEFAULTS.map.description
	);

	const artworkCardMode = $derived(selectedShopId ? 'summary' : 'instruction');

	const bouquetImageSrc = $derived(selectedImage ? toDataUrl(selectedImage) : null);

	/**
	 * @param {number} lat
	 * @param {number} lng
	 * @param {{ fitBounds?: boolean }} [options]
	 */
	async function loadShops(lat, lng, options = {}) {
		const { fitBounds = false } = options;
		loading = true;
		error = '';
		fitMapBounds = fitBounds;

		try {
			const params = new URLSearchParams({
				lat: String(lat),
				lng: String(lng)
			});
			const response = await fetch(`/api/map/shops?${params}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(typeof data.error === 'string' ? data.error : 'Shop search failed');
			}

			shops = data.shops ?? [];
			mock = Boolean(data.mock);
			selectedShopId = shops.length > 0 ? shops[0].id : null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load shops';
		} finally {
			loading = false;
		}
	}

	function hydrateOrderFromFlow() {
		recipe = getFlowObject('recipe');
		moodAnalysis = getFlowObject('moodAnalysis');
		userInput = getFlowObject('userInput');

		const order = buildFloristOrderMessage({
			userInput: { ...sessionUserInput, ...(userInput ?? {}) },
			moodAnalysis,
			recipe
		});
		orderPlainText = order.plainText;
		orderKoPlainText = order.ko.plainText;
	}

	onMount(async () => {
		if (!jobId) {
			if (!dev) {
				await goto(resolve('/create'));
				return;
			}
			hydrateOrderFromFlow();
		} else {
			try {
				const job = await fetchJob(jobId);
				recipe = job.recipe ?? null;
				moodAnalysis = job.moodAnalysis ?? null;
				userInput = job.userInput ?? null;
				selectedImage = job.images?.primary ?? null;

				const order = buildFloristOrderMessage({
					userInput: { ...sessionUserInput, ...job.userInput },
					moodAnalysis: job.moodAnalysis,
					recipe: job.recipe
				});
				orderPlainText = order.plainText;
				orderKoPlainText = order.ko.plainText;
			} catch {
				if (dev) hydrateOrderFromFlow();
			}
		}

		const center = await getUserMapCenter();
		searchLat = center.lat;
		searchLng = center.lng;
		if (!center.fromDevice) {
			locationNotice =
				'Location access unavailable. Showing flower shops near Seoul City Hall instead.';
		}
		locationReady = true;

		await loadShops(searchLat, searchLng, { fitBounds: true });
	});
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={7} total={7} />
	<FlowNav backHref="/result" showContinue={false} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork
			title={artworkTitle}
			description={artworkDescription}
			imageSrc={bouquetImageSrc}
			downloadImage={selectedImage}
			cardMode={artworkCardMode}
		/>

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			{#if locationReady}
				<MapPanel
					bind:selectedShopId
					initialLat={searchLat}
					initialLng={searchLng}
					{locationNotice}
					{shops}
					{loading}
					{error}
					{mock}
					{orderPlainText}
					{orderKoPlainText}
					fitBounds={fitMapBounds}
					onrefresh={(lat, lng) => loadShops(lat, lng, { fitBounds: false })}
				/>
			{:else}
				<div class="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted">
					Getting your location...
				</div>
			{/if}
		</section>
	</main>
</div>
