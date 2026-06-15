<script module>
	export const FLOW_NAV_LINK =
		'text-sm whitespace-nowrap text-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let {
		backHref = '',
		onBack = undefined,
		backLabel = '<- Back',
		continueLabel = 'Continue ->',
		onContinue = undefined,
		continueDisabled = false,
		showBack = true,
		showContinue = true
	} = $props();

	function handleBack() {
		if (onBack) {
			onBack();
			return;
		}

		if (backHref) {
			goto(resolve(backHref));
		}
	}
</script>

<nav
	class="flex shrink-0 items-center justify-between border-b border-line px-6 py-2.5 md:px-10"
	aria-label="Flow navigation"
>
	{#if showBack && (backHref || onBack)}
		<button type="button" class={FLOW_NAV_LINK} onclick={handleBack}>
			{backLabel}
		</button>
	{:else}
		<span aria-hidden="true"></span>
	{/if}

	{#if showContinue && onContinue}
		<button
			type="button"
			class={FLOW_NAV_LINK}
			disabled={continueDisabled}
			onclick={onContinue}
		>
			{continueLabel}
		</button>
	{:else}
		<span aria-hidden="true"></span>
	{/if}
</nav>
