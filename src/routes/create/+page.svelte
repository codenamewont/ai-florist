<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/ui/Header.svelte';
	import { saveFlow, loadFlow } from '$lib/flowerFlow/session.js';

	const stored = loadFlow();
	const userInput = stored.userInput ?? {};

	let relationship = $state(userInput.relationship ?? 'Friend');
	let occasion = $state(userInput.occasion ?? 'Birthday');
	let budget = $state(userInput.budget ?? 50000);
	let season = $state(userInput.season ?? 'Spring');
	let notes = $state(userInput.notes ?? '');

	function handleSubmit(event) {
		event.preventDefault();
		saveFlow({
			userInput: {
				relationship,
				occasion,
				budget: Number(budget),
				season,
				notes
			}
		});
		goto(resolve('/upload'));
	}
</script>

<div class="min-h-dvh bg-surface text-ink">
	<Header step={1} total={7} />

	<main class="mx-auto max-w-xl px-6 py-10">
		<h1 class="mb-2 text-2xl">Create bouquet</h1>
		<p class="mb-8 text-sm text-muted">Tell us who this bouquet is for.</p>

		<form onsubmit={handleSubmit} class="space-y-5">
			<label class="block space-y-2">
				<span class="text-sm">Relationship</span>
				<select bind:value={relationship} class="w-full border border-line bg-surface px-3 py-2">
					<option>Friend</option>
					<option>Partner</option>
					<option>Family</option>
					<option>Colleague</option>
				</select>
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Occasion</span>
				<input bind:value={occasion} class="w-full border border-line bg-surface px-3 py-2" />
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Budget (KRW)</span>
				<input
					type="number"
					min="10000"
					step="1000"
					bind:value={budget}
					class="w-full border border-line bg-surface px-3 py-2"
				/>
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Season</span>
				<select bind:value={season} class="w-full border border-line bg-surface px-3 py-2">
					<option>Spring</option>
					<option>Summer</option>
					<option>Autumn</option>
					<option>Winter</option>
				</select>
			</label>

			<label class="block space-y-2">
				<span class="text-sm">Notes (optional)</span>
				<textarea bind:value={notes} rows="4" class="w-full border border-line bg-surface px-3 py-2"
				></textarea>
			</label>

			<button type="submit" class="bg-pill px-6 py-3 text-sm text-surface"
				>Continue to upload</button
			>
		</form>
	</main>
</div>
