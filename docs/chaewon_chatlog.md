# AI Development Chat Log — AI Florist

> Course submission: Cursor **My chat** log  

**Tool:** Cursor

---

## 1. Project setup & upload page UI

### My chat

> Implement the upload page from Figma (Moodboard and SNS Feed variants). Reuse existing tokens and components; keep it responsive, not hard-coded pixels.

> Center the description card and vase horizontally. Display the vase SVG as a plain image.

### Outcome

- Initial SvelteKit scaffold, upload route shell, `MoodboardGrid.svelte`, `SnsFeedUpload.svelte`

---

## 2. Page flow scaffold

### My chat

> Add the full page flow: create → upload → message → generating → options → result → map. Match the existing dummy-page pattern for any missing routes.

> Shared header with step nav; commit message should mention header scaffolding.

### Outcome

- Routes for message, generating, options, map; shared layout header

---

## 3. Backend flower-flow pipeline

### My chat

> Build the backend (not UI) for the flower-flow pipeline. Plan first, don't do everything at once. Stack: Gemini for images, Kakao Places as recommended. Options page = three bouquet size choices; result page will support edit/refine.

> Wire create and message inputs to the API so we can test the full flow end-to-end.

> Image generation keeps failing on Gemini (quota, 404, 503). Switch image generation to OpenAI. Don't fall back to mock — wait until a real image is ready before showing results. Fix generating page being skipped.

### Outcome

- `/api/flower-flow/*` routes, Gemini text + OpenAI image providers, mock fallback removed from happy path, generating page polling

---

## 4. Supabase job storage

### My chat

> Replace in-memory pipeline storage with Supabase. Store images in Supabase Storage; keep only URLs in the DB.

> Add an edit page after generating: generated image on the left, reprompting chat on the right, pencil-style area selection for partial edits.

> Remove the options page — flow goes edit → result. Single image size only (no S/M/L variations). Chat-style edit history: image → chat → image → chat, alternating.

### Outcome

- `jobStore.js` → Supabase, `supabase/schema.sql`, edit page scaffold, options page removed

---

## 5. Visual branding & layout

### My chat

> Replace the header square with `flower.svg`; animate the icon for the current step. Swap in `logo.svg`, match nav color, add as favicon.

> Custom cursor — pixel style, logo color, white border. Fix hotspot so the click point matches the graphic tip.

> Unify description card width across pages; white/off-white background with subtle shadow. Header matches card color.

> Page background: canvas/paper texture from asset, cover fill (not tile repeat).

> Upload page: redesign moodboard layout per reference — his/her labels from create gender, uniform 4:3 / 3:4 tile ratios, text-only "continue" with hover underline.

### Outcome

- `logo.svg`, custom cursor SVG, `DescriptionCard.svelte`, canvas background, upload layout redesign

---

## 6. Flower database & recipe prompts

### My chat

> Expand `flowerDB.js` with additional catalog entries. Apply notes: keep Caspia and Statice separate; silver/beige/brown flowers lean on mood tags; Snowball Viburnum and Lotus OK as recipe candidates.

> Improve matching logic and sync prompts so recipe generation uses the same catalog rules.

> Card message should pick flowers whose meaning matches the message sentiment. No em-dash (—) in any user-facing copy across the app.

### Outcome

- Expanded `flowerDB.js`, `resolveRecipeFlowers.js`, synced Gemini recipe prompts in `text.js`

---

## 7. Result page & flower cards

### My chat

> Result page: artwork on the left (final bouquet photo), scrollable flower cards on the right. Remove floristNote; move a short summary into the description card.

> Flower cards: square crop showing the top of each stem, flip animation on click for Kor/Eng meaning. Fixed card size, no selection border. Hide filler/greenery cards.

> Description should explain why this bouquet fits the person — mood, colors, message — not generic filler. Use "their" for the recipient, not "your". Don't truncate with ellipsis; keep copy short instead.

> After edit (e.g. swap tulip → rose), recipe and result cards must stay in sync.

### Outcome

- `FlowerCarousel.svelte`, flip cards, `buildResultDescription.js`, recipe sync on edit

---

## 8. Edit page UX

### My chat

> Remove the edit toggle. Always show a pencil icon on the chat image; click to draw a red selection stroke, icon becomes X to cancel. Area selection sends a partial edit request.

> Move "Tell us how you want to refine it" into the description card; remove page title clutter. Apply Edit → send-button style next to chat input. Chat shows user prompt on the right, "editing…" on the left; auto-scroll to bottom.

> Fix duplicate bouquets appearing after edit — investigate prompt/flow. Reduce suggestion chips to three, lighter gray, tighter spacing. Fix left border clipping on chat bubbles. Errors only in chat, not duplicated below.

> Bouquet images should match artwork aspect ratio (768×1024). Chat thumbnails same ratio, scaled down only.

### Outcome

- Pencil overlay area selection, chat UI polish, `bouquetImageFormat.js` aspect ratio, duplicate-image fix

---

## 9. Upload UX & flow navigation

### My chat

> Upload description card: step intro copy (not dummy title/description), updates dynamically on tab switch and each upload.

> Don't block on "Analyzing mood…" — navigate immediately, run mood analysis in the background.

> Replace per-page Continue buttons with mini nav under header: ← Back / Continue → on both ends. Back must restore previous inputs and uploaded images.

> Reduce heading font size on message ("Write something…") and create ("Who are we making flowers for?") and similar prompts on other pages.

### Outcome

- `StepNav.svelte`, background mood analysis, session restore, typography tweaks

---

## 10. QA, providers & recipe alignment

### My chat

> Lock AI providers for production — one provider per task, no dev-only switches. Clean up `.env.example` to required keys only. OpenAI image output 3:4 ratio.

> Verify result cards match the bouquet recipe; bouquet must not show flowers outside the recipe. On edit, constrain recipe changes to flowerDB catalog names only. Cards follow recipe — if a flower isn't in the recipe, don't show it on a card. Bouquet image may include extra flowers not on cards; that's OK.

> Area edit: selecting ribbon and saying "change color" was changing the wrong region or the whole image. Fix mask alignment and prompt so only the selected area changes — prompt-only, no image compositing.

> Map description card: keep "Ready to order" title; body = brief flower theme only, no markdown bold, no truncation ellipsis — generate short copy. Remove floristNote usage project-wide.

### Outcome

- Provider lock in `.env.example`, 3:4 image size, `applyRecipeEdit` catalog constraint, area-edit prompt tuning, floristNote removal

---

## 11. Map, deploy & production hardening

### My chat

> Pre-deploy review: fix lint/format warnings, add API auth & cost protection, upload size limits, duplicate edit-request guard, remove silent Kakao mock fallback.

> Deploy on Railway — set adapter, maxDuration, and tell me what env vars I need to configure externally.

> Kakao Map SDK not loading on Railway domain — what do I register on developers.kakao.com?

> Result and map pages: add download button for the final bouquet image.

### Outcome

- Railway adapter, API hardening, Kakao domain setup docs, image download on result/map

---

## 12. Bouquet image realism

### My chat

> Generated bouquet looks fake, not photorealistic. Can we pass reference images to the generation API?

> White-background catalog shot and no hands/people is good, but the bouquet doesn't feel like a real arrangement. Check if the initial generation API supports reference input and wire it if possible.

> STRICT RECIPE rules ("every species must be clearly visible" + "no other species") make the model prioritize species accuracy over realism — revert recent changes and fix that tradeoff.

### Outcome

- Reference-image support explored, `bouquetImageFormat.js` prompt rebalancing (later iterations)

---

## Teammate scope (outside my chat)

- create/message page UI (initial), dev seed button, museum frame (p5), map shop search & order message, flower catalog batch images (`generate-flower-catalog.js`), area-edit intent docs
