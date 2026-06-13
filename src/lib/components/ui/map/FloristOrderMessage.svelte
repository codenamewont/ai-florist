<script>
	let {
		enPlainText = '',
		koPlainText = ''
	} = $props();

	/** @type {'ko' | 'en'} */
	let activeLang = $state('ko');
	let textEn = $state('');
	let textKo = $state('');
	let seeded = $state(false);
	let copied = $state(false);

	$effect(() => {
		if (!seeded && (enPlainText || koPlainText)) {
			textEn = enPlainText;
			textKo = koPlainText;
			seeded = true;
		}
	});

	const activeText = $derived(activeLang === 'ko' ? textKo : textEn);
	const hasMessage = $derived(Boolean(activeText?.trim()) || Boolean(textEn?.trim()) || Boolean(textKo?.trim()));

	/** @param {Event & { currentTarget: HTMLTextAreaElement }} event */
	function handleInput(event) {
		const value = event.currentTarget.value;
		if (activeLang === 'ko') {
			textKo = value;
		} else {
			textEn = value;
		}
	}

	/** @param {'ko' | 'en'} lang */
	function setLanguage(lang) {
		activeLang = lang;
	}

	async function handleCopy() {
		if (!activeText.trim()) return;

		try {
			await navigator.clipboard.writeText(activeText);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// 클립보드 API 미지원 환경
		}
	}
</script>

<div class="flex items-start gap-3">
	{#if hasMessage}
		<textarea
			class="min-h-[5.5rem] min-w-0 flex-1 resize-y rounded border border-line bg-transparent px-3 py-2 text-sm leading-relaxed text-muted focus:border-line-strong focus:outline-none"
			rows={4}
			value={activeText}
			oninput={handleInput}
			aria-label={activeLang === 'ko' ? '꽃집 주문 멘트 (한국어)' : 'Florist order message (English)'}
		></textarea>
	{:else}
		<p class="min-w-0 flex-1 text-sm text-muted">Complete the flow to generate your order message.</p>
	{/if}

	<div class="flex shrink-0 flex-col items-stretch gap-2">
		<button
			type="button"
			disabled={!hasMessage}
			onclick={handleCopy}
			class="rounded bg-pill px-3 py-1.5 text-xs text-surface disabled:opacity-40"
		>
			{copied ? 'Copied!' : 'Copy'}
		</button>

		<div class="flex gap-1">
			<button
				type="button"
				disabled={!hasMessage}
				onclick={() => setLanguage('ko')}
				class="flex-1 rounded border px-2 py-1.5 text-xs disabled:opacity-40 {activeLang === 'ko'
					? 'border-pill bg-pill text-surface'
					: 'border-line text-muted hover:border-line-strong'}"
			>
				Kor
			</button>
			<button
				type="button"
				disabled={!hasMessage}
				onclick={() => setLanguage('en')}
				class="flex-1 rounded border px-2 py-1.5 text-xs disabled:opacity-40 {activeLang === 'en'
					? 'border-pill bg-pill text-surface'
					: 'border-line text-muted hover:border-line-strong'}"
			>
				Eng
			</button>
		</div>
	</div>
</div>
