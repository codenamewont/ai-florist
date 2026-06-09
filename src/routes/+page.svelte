<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<main class="flex min-h-dvh items-center justify-center bg-surface px-6">
	<Button onclick={() => goto(resolve('/create'))}>start creating</Button>
</main>
