<script>
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import ContextForm from '$lib/components/ui/create/ContextForm.svelte';

	let who = $state(null);
	let whatFor = $state(null);
	let style = $state(null);
	let budget = $state(50_000);

	const hasAnySelection = $derived(who !== null || whatFor !== null || style !== null);

	const artworkTitle = $derived.by(() => {
		if (!hasAnySelection) return 'Title';
		const occasion = whatFor ? `A ${whatFor} bouquet for` : 'A bouquet for';
		return `${occasion} ${who ?? '...'}`;
	});

	const artworkDescription = $derived(
		hasAnySelection
			? `${style ?? '—'} style · ₩${budget.toLocaleString('ko-KR')} budget`
			: 'Description Description Description'
	);
</script>

<!--
	upload와 같은 2열 레이아웃: 좌측 Artwork 고정, 우측 ContextForm.
	선택값이 바뀌면 create1 → create2 헤드라인·요약이 반응형으로 전환됩니다.
-->
<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={1} total={6} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<ContextForm bind:who bind:whatFor bind:style bind:budget />
		</section>
	</main>
</div>
