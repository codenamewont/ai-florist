# AI Development Chat Log — AI Florist

> Course submission: Cursor **My chat** log  

**Tool:** Cursor

---



## 1. Dev dummy-data button

### My chat

> I want a dev debug button that fills dummy data (pre-made images, no AI) so I don't re-enter everything when jumping between steps. Will mute it later.

### Outcome

- `DevSeedButton`, `devSeed.js`, `static/dev/` fixtures

---

## 2. Message page UI

### My chat

> Follow message1.png, keep button styles consistent with create/upload. Add a message route folder.

> "Write something from your heart" should be a text input.

> Don't use pills for presets — use the same style as Friend/Family on create.

### Outcome

- `message/+page.svelte`, `MessageForm.svelte`, `MessagePresetList.svelte`

---

## 3. Create selection & title behavior

### My chat

> On create, remove the default pre-selected option — landing should look unselected like message.

> Don't wait for both WHO and WHAT FOR — update the title as soon as any one of the three fields is selected.

### Outcome

- Create landing unselected; title updates on partial selection

---

## 4. Post–main-pull options & map build

### My chat

> Pulled main — what's new on the teammate's side? How is image prompt engineering set up? Is create-step input actually used in the pipeline?

> Start building options and map using the same file structure as create/upload. Add component folders as needed.

### Outcome

- options/map 2-column Artwork layout, `components/ui/options/`, `components/ui/map/`

---

## 5. Kakao Map + order message

### My chat

> I entered Kakao public + REST API keys — does it find nearby florists from my location?

> Markers don't show on the map.

> Add a refresh button after moving the map to reload shops in that area.

> Show shop info when clicking a marker or list item.

> On map top: generate a copyable florist order message from create input, flowers used, and mood keywords.

> Add Kor/Eng toggle below the copy button.

### Outcome

- `api/map/shops`, `MapPanel`, `buildFloristOrderMessage.js`

---

## 6. Artwork & description card layout

### My chat

> Center the description card. Artwork shifts when card is 1 vs 2 lines — fix so artwork stays put when card height changes.

> Upload page artwork position is off — match other pages.

> Too much gap between flower SVG and description — move card up, but never move/resize the artwork above.

### Outcome

- `Artwork.svelte` layout split (fixed illustration + separate description)

---

## 7. flowerDB 93-flower image batch

### My chat

> I'm not building the UI yet — my role is adding images to the flower DB. I made a sample image in OpenAI. The prompt was:  
> `A single [rose] flower stem, isolated object, transparent background, realistic botanical style, front-facing, centered composition, no vase, no bouquet, no hand, no text, soft natural lighting, consistent scale, PNG asset for UI card`

> So it's not generating an image on every request — it gets saved to the DB, right? I don't want to change the frontend; I only want to update the DB, without modifying the existing DB records.

> OK, go ahead and run it. Check the file structure and organize the files to match the teammate's style.

### Outcome

- `scripts/generate-flower-catalog.js`, `static/flowers/{id}.png`, `flowerCatalogPrompt.js`, `flowerImagePaths.js`

---

## 8. Museum frame (p5)

### My chat

> Museum frame on left panel (p5, 768×1024). Frame position fixed across pages; only inner image swaps.

> create: create1.svg when empty, create2.svg as soon as anything is selected.

> Slightly enlarge artwork inside frame only.

> Description card per reference image; artwork must not move when card grows.

### Outcome

- `MuseumFrame.svelte`, `museumFrameGeometry.js`, `artworkVariants.js`

---

## 9. Map & result dev polish

### My chat

> Can't navigate to /map — allow in dev only?

> Map: remove line above order message, move message up, fix shop info overflow, no line breaks in English order text.

> Map description card: 1–2 lines, Ready to order, brief flower theme only.

> Can't go to /result — show dummy in dev. Limit DescriptionCard length.

### Outcome

- Dev access to result/map, `truncateDescription`, map UI fixes

---

## 10. Bouquet image prompt & area edit

### My chat

> Add to suffix without deleting existing prompts: catalog scene + no person/hands.  
> `A professional florist product photograph of a handcrafted bouquet…`  
> `Bouquet only. No person. No hands. No body parts visible`

> (Pasted English spec for area edit — mask as hint only, edit ribbon surface only.)

> Implement it. Write image-pipeline.md and overall-pipeline.md in docs.

### Outcome

- `bouquetImageFormat.js`, `areaEditIntent.js`, `refinedAreaMask.js`, pipeline docs

---

## 11. Git branch push

### My chat

> Push current state to new branch `0615-refinement`.

> Switch to main, then commit and push to new branch `0615-refinement2`.

### Outcome

- `0615-refinement`, `0615-refinement2` pushed

---

## Teammate scope (outside my chat)

- upload, edit core, flower-flow API, `flowerDB.js` original, Gemini server modules
