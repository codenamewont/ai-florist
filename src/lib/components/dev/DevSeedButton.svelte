<script>
	import { dev } from '$app/environment';
	import { seedDevFlow } from '$lib/flowerFlow/devSeed.js';

	/** 나중에 mute 하려면 true 로 변경 */
	const DEV_SEED_MUTED = false;

	let loading = $state(false);
	let message = $state('');

	async function fillDevData() {
		loading = true;
		message = '';

		const result = await seedDevFlow('result');

		if (!result.ok) {
			message = result.error;
			loading = false;
			return;
		}

		message = 'Filled';
		loading = false;
		// 페이지 상단 const jobId = getFlowString(...) 갱신을 위해 새로고침
		location.reload();
	}
</script>

{#if dev && !DEV_SEED_MUTED}
	<div class="dev-seed fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1">
		<button
			type="button"
			disabled={loading}
			onclick={fillDevData}
			class="rounded border border-dashed border-subtle/60 bg-surface/95 px-3 py-1.5 text-xs text-muted shadow-sm backdrop-blur hover:border-subtle hover:text-ink disabled:opacity-50"
			title="AI 없이 더미 job + sessionStorage 채우기 (개발용)"
		>
			{loading ? 'Seeding…' : 'Dev: Fill data'}
		</button>
		{#if message && message !== 'Filled'}
			<p class="max-w-48 rounded bg-surface/95 px-2 py-1 text-xs text-red-600 shadow-sm">
				{message}
			</p>
		{/if}
	</div>
{/if}
