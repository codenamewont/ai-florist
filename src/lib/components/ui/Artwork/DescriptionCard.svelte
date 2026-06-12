<script>
	let { title = 'Title', description = 'Description Description Description' } = $props();
</script>

<div class="w-64 max-w-full flex-none border border-line-strong bg-[#fafaf8] px-4 py-3 shadow-sm lg:px-6 lg:py-5">
	<h3 class="text-sm font-semibold">{title}</h3>
	<p class="mt-2 text-xs leading-snug">{description}</p>
</div>
