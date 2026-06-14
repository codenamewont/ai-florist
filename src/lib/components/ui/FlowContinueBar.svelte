<script module>
	export const FLOW_CONTINUE_BUTTON =
		'w-full px-2 py-3 text-sm whitespace-nowrap text-ink underline-offset-4 hover:underline disabled:opacity-50 lg:w-auto';
</script>

<script>
	/**
	 * Fixed bottom on mobile, bottom-right of the right panel on desktop.
	 * Pair with a section using `pb-[3.75rem] lg:pb-8` (taller pb on edit if the bar has extra controls).
	 */
	let { class: klass = '', children } = $props();
</script>

<div
	class={[
		'fixed right-0 bottom-0 left-0 z-20 space-y-2 bg-placeholder/30 px-4 pb-5 lg:static lg:flex lg:shrink-0 lg:flex-col lg:items-end lg:bg-transparent lg:px-6 lg:pb-0',
		klass
	]}
>
	{@render children()}
</div>
