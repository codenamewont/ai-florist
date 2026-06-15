<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlowNav from '$lib/components/ui/FlowNav.svelte';
	import GrowthMetaphorIllustration from '$lib/components/ui/landing/GrowthMetaphorIllustration.svelte';

	function handleStart() {
		goto(resolve('/create'));
	}
</script>

<section
	class="relative flex min-h-dvh flex-col bg-surface font-sans text-ink"
	aria-label="Every bouquet starts with a muse — seed to bouquet growth metaphor"
>
	<FlowNav showBack={false} continueLabel="Start Creating ->" onContinue={handleStart} />

	<div class="flex flex-1 flex-col px-6 pt-8 pb-8 sm:px-10 sm:pt-10 sm:pb-10 lg:px-14">
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
	</div>
</section>
