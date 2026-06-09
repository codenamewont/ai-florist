<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import ContextForm from '$lib/components/ui/create/ContextForm.svelte';
	import {
		consumeDevCreateSnapshot,
		deleteFlowKey,
		getFlowObject,
		isDevSeeded,
		saveFlow
	} from '$lib/flowerFlow/session.js';

	// 항상 빈 폼으로 시작 — Dev Fill은 onMount에서 1회만 스냅샷 적용
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

	onMount(() => {
		const hadSnapshot = !!getFlowObject('devCreateSnapshot');
		const snap = consumeDevCreateSnapshot();

		if (snap) {
			who = snap.who;
			whatFor = snap.whatFor;
			style = snap.style;
			budget = snap.budget;
			return;
		}

		// 예전 세션에 devSeeded만 남은 경우 — 더미 폼 복원 차단
		if (isDevSeeded() && !hadSnapshot) {
			deleteFlowKey('devSeeded');
			deleteFlowKey('devUpload');
			deleteFlowKey('devMessageSnapshot');
			deleteFlowKey('cardMessage');
		}
	});

	function handleContinue() {
		deleteFlowKey('devUpload');
		deleteFlowKey('devSeeded');
		deleteFlowKey('devCreateSnapshot');
		deleteFlowKey('devMessageSnapshot');
		deleteFlowKey('cardMessage');
		saveFlow({
			userInput: {
				relationship: who ?? undefined,
				occasion: whatFor ?? undefined,
				style: style ?? undefined,
				budget: Number(budget)
			}
		});
		goto(resolve('/upload'));
	}
</script>

<!--
	upload와 같은 2열 레이아웃: 좌측 Artwork 고정, 우측 ContextForm.
	선택값이 바뀌면 create1 → create2 헤드라인·요약이 반응형으로 전환됩니다.
-->
<div
	class="flex h-dvh flex-col overflow-x-hidden bg-surface text-ink lg:h-screen lg:overflow-hidden"
>
	<Header step={1} total={7} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork title={artworkTitle} description={artworkDescription} />

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
			<ContextForm bind:who bind:whatFor bind:style bind:budget />

			<div
				class="fixed right-0 bottom-0 left-0 z-20 px-4 pb-5 lg:absolute lg:right-8 lg:bottom-8 lg:left-auto lg:w-72 lg:px-0"
			>
				<button
					type="button"
					onclick={handleContinue}
					class="w-full bg-pill px-4 py-3 text-sm text-surface"
				>
					Continue to upload
				</button>
			</div>
		</section>
	</main>
</div>
