# PlaylistPlayer Annotation Bar Adoption — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `PlaylistPlayer.vue` adopt the existing `PlayerAnnotationBar` to replace both its inline annotation buttons block (lines ~633-733) and its 3D-model background section (lines ~588-620).

**Architecture:** Extend `PlayerAnnotationBar.vue` with one optional v-model (`isLaserModeOn`, default `undefined` so the button stays hidden in PreviewPlayer where it isn't bound). Reorder the existing buttons inside the first flexrow to match PlaylistPlayer's prior layout (`pen → loupe → type → pencil → laser → delete`) so the user sees the same order they had inline — PreviewPlayer picks up the same order as a positive side effect. PlaylistPlayer then wires `<player-annotation-bar>` with the same set of bindings PreviewPlayer uses, plus `:is-laser-mode-on` and a `v-if="!isFullMode"` wrapper guard. The 3D background/skybox/wireframe controls become the bar's `is3DModel` section. PlaylistPlayer's outside comment button (after a separator) is removed; the bar's internal comment button takes its place. Film/build/fullscreen stay inline after the bar.

**Tech Stack:** Vue 3 (`<script setup>`), Vite/Vitest. No new composables, no new tests.

**Out of scope:** Step 4 (which would be the playlist-specific composables: `useBuildExport`, `useEntityNavigation`, `useSoundWaveform`, `usePicturePlayback`). The two backlog items in `project_preview_player_followups.md` remain a separate session.

---

## Pre-flight

```bash
cd /home/frankrousseau/projets/products/kitsu
git status
```

Tree should be clean on `PlaylistPlayer.vue` and `PlayerAnnotationBar.vue`. People/untracked items can remain.

Baseline:

```bash
npm run test:unit
wc -l src/components/pages/playlists/PlaylistPlayer.vue \
      src/components/previews/PlayerAnnotationBar.vue
```

Expected: 634 passed / 1 skipped. PlaylistPlayer ≈ 4660 lines, PlayerAnnotationBar ≈ 280 lines.

---

## Task 1 — Add `isLaserModeOn` optional v-model and laser button

PlaylistPlayer has a "laser mode" toggle for managers/supervisors that broadcasts a mouse-laser to other preview-room participants. PreviewPlayer doesn't have it. Add an opt-in v-model so PlaylistPlayer can bind it; the button stays hidden in PreviewPlayer (no binding → `undefined`).

**Files:**
- Modify: `src/components/previews/PlayerAnnotationBar.vue`

**Step 1: Declare the v-model.** In `<script setup>`, alongside the other `defineModel` calls (after `isWireframe`):

```js
const isLaserModeOn = defineModel('isLaserModeOn', { default: undefined })
```

**Step 2: Render the laser button.** Insert it inside the first `<div class="flexrow" v-if="isMovie || isPicture">` block, immediately **after** the pencil-draw button (just after the `<button-simple icon="pencil">` element and its preceding `<transition>` block, but before the `<button-simple icon="pen">` annotations-displayed toggle):

```vue
<button-simple
  class="flexrow-item"
  icon="laser"
  :active="isLaserModeOn"
  :title="$t('playlists.actions.toggle_laser')"
  @click="isLaserModeOn = !isLaserModeOn"
  v-if="
    isLaserModeOn !== undefined &&
    !readOnly &&
    (!light || fullScreen) &&
    !isConcept
  "
/>
```

The guard follows the same pattern as the other annotation buttons (`!readOnly && (!light || fullScreen) && !isConcept`) with the additional `isLaserModeOn !== undefined` check so PreviewPlayer (which doesn't bind it) doesn't render the button.

**Step 3: Build + lint + tests.**

```bash
npx eslint src/components/previews/PlayerAnnotationBar.vue
npm run test:unit
npm run build
```

Expected: all clean. PreviewPlayer is unaffected (no v-model binding).

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerAnnotationBar.vue
git commit -m "[previews] PlayerAnnotationBar exposes optional isLaserModeOn v-model"
```

---

## Task 2 — Reorder annotation buttons in `PlayerAnnotationBar` to match PlaylistPlayer's prior layout

PlaylistPlayer's inline annotation block used the order: **pen → loupe → type → pencil → laser → delete**. The bar currently uses: **undo → redo → delete → type → pencil → pen → loupe → comment**. The undo/redo and comment positions are fine — they only show in `fullScreen` for PreviewPlayer. The middle order is what differs.

Reorder the bar's first flexrow so the visible order in PlaylistPlayer is: `(undo) (redo) pen → loupe → type → pencil → laser → delete → comment`. PreviewPlayer's visible buttons (undo, redo, delete, type, pencil, pen, loupe, comment) move to: `(undo) (redo) pen → loupe → type → pencil → delete → comment` — same set, just a different order.

**Files:**
- Modify: `src/components/previews/PlayerAnnotationBar.vue`

**Step 1: Reorder the first flexrow.** The target order inside the `<div class="flexrow" v-if="isMovie || isPicture">` is:

1. `<button-simple icon="undo" ...>` (unchanged, keeps its `fullScreen` guard)
2. `<button-simple icon="redo" ...>` (unchanged, keeps its `fullScreen` guard)
3. **`<button-simple icon="pen" ...>` (annotation-displayed)** — moved from current position 6 to position 3
4. **`<button-simple icon="loupe" ...>` (zoom-pan)** — moved from current position 7 to position 4
5. `<transition>` typing tools + `<button-simple icon="type" ...>` — unchanged structurally, position 5
6. `<transition>` pencil tools + `<button-simple icon="pencil" ...>` — unchanged structurally, position 6
7. **`<button-simple icon="laser" ...>` (added in Task 1)** — position 7
8. **`<button-simple icon="delete" ...>` (delete)** — moved from position 3 to the end, position 8
9. `<button-simple icon="comment" ...>` (comment) — unchanged, position 9

Apply the reordering by cutting/pasting the elements within the same `<div>`. The guards and bindings on each element stay exactly as they are now — only their position changes.

**Step 2: Build + lint + tests.**

```bash
npx eslint src/components/previews/PlayerAnnotationBar.vue
npm run test:unit
npm run build
```

**Step 3: Commit.**

```bash
git add src/components/previews/PlayerAnnotationBar.vue
git commit -m "[previews] Reorder PlayerAnnotationBar buttons to match PlaylistPlayer's prior layout"
```

---

## Task 3 — Adopt `<player-annotation-bar>` in `PlaylistPlayer.vue`

The big task. Replace three pieces of `PlaylistPlayer.vue`'s template with a single `<player-annotation-bar>` invocation:
1. The 3D-model background section (lines ~588-620).
2. The inline annotation buttons block (lines ~633-733).
3. The outside comment button after a separator (lines ~734-741).

Film, build dropdown, and fullscreen buttons stay where they are (after the new bar).

**Files:**
- Modify: `src/components/pages/playlists/PlaylistPlayer.vue`

**Step 1: Add the import** alphabetically in the components import block (after `PlayerComparisonBar`):

```js
import PlayerAnnotationBar from '@/components/previews/PlayerAnnotationBar.vue'
```

(It should land between `PlayerComparisonBar` and `PlayerPlaybackBar`, or `PlayerPlaybackBar` and `PlaylistProgress` — alphabetically among the existing imports.)

**Step 2: Locate the three blocks to replace.** They're contiguous in document order. Search for `class="background-combo"` (line ~590) and `@click="onCommentClicked"` (line ~739) — the replacement spans from the opening `<div class="flexrow" v-if="isCurrentPreviewModel">` (3D section) through to the closing `/>` of the comment `<button-simple>`. **Do not** touch the `<template v-if="(isCurrentUserManager || isCurrentUserSupervisor) && tempMode">` block at lines ~622-632 (the save button); keep it intact between the 3D section and the annotation section.

Looking at the current template, the precise blocks to delete are:

- `<div class="flexrow" v-if="isCurrentPreviewModel">` ... `</div>` (lines 588-620): 3D background/skybox/wireframe
- `<div class="flexrow" v-if="!isCurrentUserArtist && (isCurrentPreviewMovie || isCurrentPreviewPicture) && !isFullMode">` ... `</div>` (lines 633-733): annotation buttons block
- `<div class="separator"></div>` (line 734) and the `<button-simple icon="comment" />` element (lines 735-741): outside comment button

Keep the save-button `<template>` block between them (lines 622-632) as-is, exactly where it is.

**Step 3: Insert `<player-annotation-bar>` in place of those three blocks.** It must sit AFTER the save-button template (around what was line 632) and BEFORE the film button (line ~742). The structure becomes:

```vue
<!-- save button (unchanged) -->
<template v-if="(isCurrentUserManager || isCurrentUserSupervisor) && tempMode">
  <div class="separator"></div>
  <button-simple
    @click="$emit('save-clicked')"
    class="playlist-button flexrow-item"
    :title="$t('playlists.actions.save_playlist')"
    icon="save"
  />
</template>

<player-annotation-bar
  v-if="!isFullMode"
  :background-options="backgroundOptions"
  :full-screen="fullScreen"
  :is-3-d-model="isCurrentPreviewModel"
  :is-annotations-displayed="isAnnotationsDisplayed"
  :is-comments-hidden="isCommentsHidden"
  :is-concept="false"
  :is-drawing="isDrawing"
  :is-movie="isCurrentPreviewMovie"
  :is-object-background="isObjectBackground"
  :is-picture="isCurrentPreviewPicture"
  :is-typing="isTyping"
  :is-zoom-pan="isZoomEnabled"
  :object-background-url="objectBackgroundUrl"
  :pencil-color="pencilColor"
  :pencil-palette="pencilPalette"
  :pencil-width="pencilWidth"
  :production-backgrounds="productionBackgrounds"
  :read-only="isCurrentUserArtist"
  :show-comments-button="true"
  :text-color="textColor"
  v-model:current-background="currentBackground"
  v-model:is-environment-skybox="isEnvironmentSkybox"
  v-model:is-laser-mode-on="isLaserModeOn"
  v-model:is-wireframe="isWireframe"
  @annotation-displayed-clicked="isAnnotationsDisplayed = !isAnnotationsDisplayed"
  @change-pencil-color="onChangePencilColor"
  @change-pencil-width="onChangePencilWidth"
  @change-text-color="onChangeTextColor"
  @comment-clicked="onCommentClicked"
  @delete-clicked="onDeleteClicked"
  @object-background-selected="onObjectBackgroundSelected"
  @pencil-annotate-clicked="onAnnotateClicked"
  @redo="redoLastAction"
  @type-clicked="onTypeClicked"
  @undo="undoLastAction"
  @zoom-pan-clicked="onPanZoomClicked"
/>

<!-- film, build, fullscreen (unchanged from current) -->
<button-simple class="playlist-button flexrow-item" ... icon="film" />
...
```

**Step 4: Verify referenced bindings.** All of these must exist in PlaylistPlayer's `<script setup>` (do a `grep` to verify):

- State refs: `backgroundOptions` (computed), `currentBackground`, `fullScreen` (from useFullScreen), `isAnnotationsDisplayed`, `isCommentsHidden`, `isCurrentPreviewModel`, `isDrawing`, `isCurrentPreviewMovie`, `isObjectBackground`, `isCurrentPreviewPicture`, `isTyping`, `isZoomEnabled`, `objectBackgroundUrl`, `pencilColor`, `pencilPalette`, `pencilWidth`, `productionBackgrounds`, `isCurrentUserArtist`, `textColor`, `isEnvironmentSkybox`, `isLaserModeOn`, `isWireframe`
- Handlers: `onChangePencilColor`, `onChangePencilWidth`, `onChangeTextColor`, `onCommentClicked`, `onDeleteClicked`, `onObjectBackgroundSelected`, `onAnnotateClicked`, `redoLastAction`, `onTypeClicked`, `undoLastAction`, `onPanZoomClicked`

If any binding is missing, **stop and ask** — don't invent. Pay special attention to:
- `onPanZoomClicked` — PlaylistPlayer has `onPanZoomClicked()` (see line 660 of pre-task state). Verify it still exists post-Step-1/2.
- `redoLastAction` / `undoLastAction` — these come from the annotation composable (`useAnnotation`).
- `onAnnotateClicked` is PlaylistPlayer's name for what the bar calls `pencil-annotate-clicked`.

**Step 5: Run the full pipeline.**

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
npm run test:unit
npm run build
```

Expected: all clean.

**Step 6: Self-review.** Search the file for any leftover references to the deleted markup (`background-combo` class, `globe-icon` import that may no longer be needed, etc.). Run `npx eslint` again — it will flag unused imports. Note them for Task 4.

**Step 7: Commit.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Adopt PlayerAnnotationBar in the template"
```

---

## Task 4 — Final cleanup

**Files:**
- Modify (likely): `src/components/pages/playlists/PlaylistPlayer.vue`

**Step 1: Remove unused imports.** Run eslint:

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
```

Likely candidates that the previous tasks may have orphaned:
- `GlobeIcon` (from `lucide-vue-next`) — used only by the deleted 3D background combo.
- `ComboboxStyled` — was used by the 3D background combo; verify it's still used elsewhere in PlaylistPlayer (most likely yes, in the playback area or elsewhere — keep if so).
- `ColorPicker`, `PencilPicker` — were used by the deleted annotation tools; verify they're not used elsewhere.

Remove only what eslint confirms is unused.

**Step 2: Search for dead scoped CSS** that might have been styling the deleted markup. Candidates to check (each only removed if the class no longer appears anywhere in the template):

- `.background-combo` styles (e.g., line ~4311 `.playlist-footer .background-combo`) — verify with `grep -nE "background-combo" src/components/pages/playlists/PlaylistPlayer.vue`. The class might still be passed via the bar to the inner component; if the bar's scoped style handles it, the parent rule is dead.
- `.annotation-tools` styles — search the file; the bar has its own version.
- Any `.dl-button`, `.build-list` rules — these belong to the build dropdown which still exists; keep.

**Step 3: Verify line drop.**

```bash
wc -l src/components/pages/playlists/PlaylistPlayer.vue
```

Expected: down by ~120-180 lines from the post-Step-2 baseline (~4660 → ~4480-4540).

**Step 4: Final pipeline.**

```bash
npm run test:unit
npx eslint src/components/pages/playlists/PlaylistPlayer.vue src/components/previews/PlayerAnnotationBar.vue
npm run build
```

Expected: all clean.

**Step 5: Commit only if cleanup edits were made.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Clean up after annotation bar adoption"
```

If no edits were needed, skip.

---

## Acceptance

Step 3 of the design is done when:

- `PlayerAnnotationBar.vue` has one new opt-in: `isLaserModeOn` v-model (default `undefined`), and its buttons inside the first flexrow are in the order `(undo) (redo) pen → loupe → type → pencil → laser → delete → comment`.
- `PlaylistPlayer.vue` no longer contains the inline 3D background section, the inline annotation buttons block, or the outside comment button. The `<player-annotation-bar>` element renders all of those.
- The film, build, and fullscreen buttons stay where they were (after the new bar).
- `npm run test:unit` green.
- `npx eslint` clean on both files.
- `npm run build` clean.
- Manual smoke (user-side): laser mode toggles in PlaylistPlayer for managers/supervisors; comment toggle still opens the comments panel (now via bar); 3D model background, skybox, wireframe still work for model previews; annotation drawing/typing/delete still works on movie/picture previews; nothing renders in `isFullMode`.

After Step 3, the three-step bars adoption design is fully delivered.
