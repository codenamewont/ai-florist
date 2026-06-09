<script>
	import Header from '$lib/components/ui/Header.svelte';
	import { getFlowString } from '$lib/flowerFlow/session.js';

	const jobId = getFlowString('jobId');
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={7} total={7} />

	<main class="mx-auto max-w-xl px-6 py-10">
		<h1 class="mb-2 text-2xl">Map</h1>
		<p class="mb-4 text-sm text-muted">Nearby flower shops will appear here in the next step.</p>
		<p class="text-sm text-muted">Current job: {jobId || 'none'}</p>
	</main>
</div>
