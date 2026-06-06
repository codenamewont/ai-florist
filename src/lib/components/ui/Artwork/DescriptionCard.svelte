<script>
	let { title = 'Title', description = 'Description Description Description' } = $props();
</script>

<div class="w-54 max-w-full border border-line-strong px-6 py-5">
	<h3 class="text-sm">{title}</h3>
	<p class="mt-2 text-xs leading-snug">{description}</p>
</div>
