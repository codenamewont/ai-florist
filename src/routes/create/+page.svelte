<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import Artwork from '$lib/components/ui/Artwork/Artwork.svelte';
	import ContextForm from '$lib/components/ui/create/ContextForm.svelte';
	import FlowNav from '$lib/components/ui/FlowNav.svelte';
	import {
		consumeDevCreateSnapshot,
		deleteFlowKey,
		getFlowObject,
		isDevSeeded,
		readCreateFormFromFlow,
		saveCreateFormToFlow,
		saveFlow
	} from '$lib/flowerFlow/session.js';
	import { ARTWORK_CARD_DEFAULTS } from '$lib/flowerFlow/artworkCardCopy.js';

	// sessionStorage에 저장된 값으로 시작 — Dev Fill은 onMount에서 1회 덮어씀
	const initialForm = readCreateFormFromFlow();
	let who = $state(initialForm.who);
	let whatFor = $state(initialForm.whatFor);
	let style = $state(initialForm.style);
	let budget = $state(initialForm.budget);

	const hasAnySelection = $derived(who !== null || whatFor !== null || style !== null);

	const artworkTitle = $derived.by(() => {
		if (!hasAnySelection) return ARTWORK_CARD_DEFAULTS.create.title;
		const occasion = whatFor ? `A ${whatFor} bouquet for` : 'A bouquet for';
		return `${occasion} ${who ?? '...'}`;
	});

	const artworkVariant = $derived(hasAnySelection ? 'create2' : 'create1');

	const artworkDescription = $derived(
		hasAnySelection
			? `${style ?? '—'} style · ₩${budget.toLocaleString('ko-KR')} budget`
			: ARTWORK_CARD_DEFAULTS.create.description
	);

	const artworkCardMode = $derived(hasAnySelection ? 'summary' : 'instruction');

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

	$effect(() => {
		saveCreateFormToFlow({ who, whatFor, style, budget });
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
	<FlowNav backHref="/" onContinue={handleContinue} />

	<main class="flex min-h-0 flex-1 flex-col lg:flex-row">
		<Artwork
			variant={artworkVariant}
			title={artworkTitle}
			description={artworkDescription}
			cardMode={artworkCardMode}
		/>

		<section class="relative flex min-h-0 flex-1 flex-col lg:overflow-hidden lg:pb-8">
			<div class="min-h-0 flex-1 overflow-y-auto">
				<ContextForm bind:who bind:whatFor bind:style bind:budget />
			</div>
		</section>
	</main>
</div>
