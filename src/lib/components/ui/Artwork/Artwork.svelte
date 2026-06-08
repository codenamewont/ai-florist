<script>
	// The exhibited artwork — always shown on the left, acting like a step indicator.
	import Vase from './Vase.svelte';
	import DescriptionCard from './DescriptionCard.svelte';

	let { title = 'Title', description = 'Description Description Description' } = $props();
</script>

<section
	class="flex w-full flex-col border-b border-line lg:min-h-0 lg:w-[44%] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
>
	<!-- vase + caption grouped in a centered, fluid column -->
	<div
		class="mx-auto flex w-full max-w-100 flex-1 flex-col items-center justify-center gap-10 px-6 py-12"
	>
		<Vase />
		<DescriptionCard {title} {description} />
	</div>
</section>
