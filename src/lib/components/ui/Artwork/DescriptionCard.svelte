<script>
	let { title = 'Title', description = 'Description Description Description' } = $props();
</script>

<div class="min-w-0 border border-line-strong px-4 py-3 lg:px-6 lg:py-5">
	<h3 class="text-sm">{title}</h3>
	<p class="mt-2 text-xs leading-snug">{description}</p>
</div>
