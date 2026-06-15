<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlowContinueBar, { FLOW_CONTINUE_BUTTON } from '$lib/components/ui/FlowContinueBar.svelte';
	import GrowthMetaphorIllustration from '$lib/components/ui/landing/GrowthMetaphorIllustration.svelte';

	function handleStart() {
		goto(resolve('/create'));
	}
</script>

<section
	class="relative flex min-h-dvh flex-col bg-surface px-6 py-8 pb-[3.75rem] font-sans text-ink sm:px-10 sm:py-10 lg:px-14 lg:pb-8"
	aria-label="Every bouquet starts with a muse — seed to bouquet growth metaphor"
>
	<div class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center">
		<GrowthMetaphorIllustration />

		<p class="mt-3 text-left text-sm tracking-[0.18em] text-muted sm:mt-4 sm:text-base">
			Every Bouquet Starts with a Muse
		</p>
	</div>

	<div class="mx-auto w-full max-w-6xl pt-10 pb-2">
		<p class="text-lg leading-none tracking-wide text-ink">AI Florist</p>
		<h1 class="mt-2 text-4xl leading-none font-bold tracking-wide sm:text-5xl lg:text-6xl">
			Fleumuse
		</h1>
	</div>

	<!--
		create 등 플로우 페이지 FlowContinueBar와 동일 위치:
		mobile — 하단 고정 / desktop — 우측 56% 패널 하단 오른쪽
	-->
	<FlowContinueBar class="lg:!fixed lg:top-auto lg:right-0 lg:bottom-8 lg:left-[44%]">
		<button type="button" onclick={handleStart} class={FLOW_CONTINUE_BUTTON}>
			Start Creating ->
		</button>
	</FlowContinueBar>
</section>
