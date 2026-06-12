<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import MapPanel from '$lib/components/ui/map/MapPanel.svelte';
	import { fetchJob, toDataUrl } from '$lib/flowerFlow/api.js';
	import { buildFloristOrderMessage } from '$lib/flowerFlow/buildFloristOrderMessage.js';
	import { getFlowObject, getFlowString } from '$lib/flowerFlow/session.js';

	const jobId = getFlowString('jobId');

	const DEFAULT_LAT = 37.5665;
	const DEFAULT_LNG = 126.978;

	let shops = $state([]);
	let loading = $state(true);
	let error = $state('');
	let mock = $state(false);
	let selectedShopId = $state(null);
	let floristNote = $state('');
	let fitMapBounds = $state(true);
	let orderPlainText = $state('');
	let orderSegments = $state([]);
	let selectedImage = $state(null);

	const sessionUserInput = getFlowObject('userInput') ?? {};

	const artworkTitle = $derived(selectedShopId ? 'Ready to order' : 'Your bouquet');

	const artworkDescription = $derived(floristNote || 'Your selected bouquet design.');

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

	onMount(async () => {
		if (!jobId) {
			await goto(resolve('/create'));
			return;
		}

		try {
			const job = await fetchJob(jobId);
			floristNote = job.floristNote ?? '';
			selectedImage = job.images?.primary ?? null;

			const order = buildFloristOrderMessage({
				userInput: { ...sessionUserInput, ...job.userInput },
				moodAnalysis: job.moodAnalysis,
				recipe: job.recipe
			});
			orderPlainText = order.plainText;
			orderSegments = order.segments;
		} catch {
			// job 없어도 지도·꽃집 검색은 계속
		}

		await loadShops(DEFAULT_LAT, DEFAULT_LNG, { fitBounds: true });
	});
</script>

<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={7} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} imageSrc={bouquetImageSrc} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<MapPanel
				bind:selectedShopId
				{shops}
				{loading}
				{error}
				{mock}
				{orderPlainText}
				{orderSegments}
				fitBounds={fitMapBounds}
				onrefresh={(lat, lng) => loadShops(lat, lng, { fitBounds: false })}
			/>
		</section>
	</main>
</div>
