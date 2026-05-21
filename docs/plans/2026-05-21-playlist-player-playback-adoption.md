# PlaylistPlayer Playback Bar Adoption — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `PlaylistPlayer.vue` adopt the existing `PlayerPlaybackBar` instead of reimplementing the play/pause + movie controls inline, by extending the bar with the few optional v-models/slots that PlaylistPlayer needs.

**Architecture:** Extend `PlayerPlaybackBar.vue` with four backwards-compatible additions: an `isPicture` prop (so the bar shows play/pause for image sequences), two optional v-models (`isWaveformDisplayed`, `isShowAnnotationsWhilePlaying`) that render conditional toggle buttons, a `compact` prop that hides the secondary movie controls, and an `#extra-controls` slot for playlist-specific buttons (picture-frame counter, multi-preview-file navigation, change-task-type button). PreviewPlayer's existing usage is unaffected because every addition defaults to a falsy value or an empty slot. PlaylistPlayer then wires the bar in place of the inline block at lines 461-628, with `:compact="isFullMode"` so full-playlist mode hides the secondary controls just like before.

**Tech Stack:** Vue 3 (`<script setup>`), Vite/Vitest. No new composables, no new tests in `tests/unit/` (the bar is structural and exercised via PreviewPlayer + manual smoke).

**Out of scope:** Step 3 of the design (PlayerAnnotationBar). The backlog items "show annotations while playing" and "handle-in/out markers" in PreviewPlayer — though the v-model added in Task 3 makes the first one trivially activatable later.

---

## Pre-flight

```bash
cd /home/frankrousseau/projets/products/kitsu
git status
```

Expected: tree clean for `PlaylistPlayer.vue` and `PlayerPlaybackBar.vue`. People-related files and untracked items can remain.

Run the baseline:

```bash
npm run test:unit
```

Expected: 634 passing, 1 skipped (the post-Step-1 baseline).

Quick read to confirm starting line counts:

```bash
wc -l src/components/pages/playlists/PlaylistPlayer.vue \
      src/components/previews/PlayerPlaybackBar.vue
```

Expected (post-Step-1): `PlaylistPlayer.vue` ≈ 4633, `PlayerPlaybackBar.vue` ≈ 162.

---

## Task 1 — Extend `PlayerPlaybackBar` with `isPicture` for the play guard

PlaylistPlayer shows play/pause for image sequences (image-per-frame playback). PreviewPlayer doesn't currently use this case, but the bar should support it so PlaylistPlayer can adopt it.

**Files:**
- Modify: `src/components/previews/PlayerPlaybackBar.vue`

**Step 1: Add `isPicture` to the props.** Insert the prop alphabetically in the `defineProps` block. After `isMovie`:

```js
  isPicture: {
    type: Boolean,
    default: false
  },
```

**Step 2: Extend the play/pause block's `v-if`.** Find the first wrapping `<div class="left flexrow" v-if="...">` and add `|| isPicture`:

```vue
<div
  class="left flexrow"
  v-if="isMovie || isSound || (is3DModel && is3DAnimation) || isPicture"
>
```

**Step 3: Build + lint + tests.**

```bash
npx eslint src/components/previews/PlayerPlaybackBar.vue
npm run test:unit
npm run build
```

Expected: all clean. PreviewPlayer is unaffected because it never passes `is-picture`.

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerPlaybackBar.vue
git commit -m "[previews] PlayerPlaybackBar accepts isPicture for image sequences"
```

---

## Task 2 — Add `isWaveformDisplayed` v-model and its toggle button

**Files:**
- Modify: `src/components/previews/PlayerPlaybackBar.vue`

**Step 1: Declare the v-model.** In the `<script setup>` block, after the existing `defineModel` calls (around `volume`), append:

```js
const isWaveformDisplayed = defineModel('isWaveformDisplayed', {
  default: false
})
```

**Step 2: Render the toggle button.** Inside the second `<div class="left flexrow" v-if="isMovie">` (the one with repeat/HD/sound/speed), insert a new button just after the `<speed-button>` element and before the time-indicator span. It uses the project's `waveform` icon:

```vue
<button-simple
  class="flexrow-item"
  :active="isWaveformDisplayed"
  :title="$t('playlists.actions.toggle_waveform')"
  icon="waveform"
  @click="isWaveformDisplayed = !isWaveformDisplayed"
  v-if="isWaveformDisplayed !== undefined && (!light || fullScreen)"
/>
```

Wait — `defineModel` always yields a defined ref. The `v-if` guard should hide the button when PreviewPlayer never sets the v-model: but with `default: false`, PreviewPlayer will always see `isWaveformDisplayed.value === false` and the button will render. That's not what we want — PreviewPlayer has no waveform feature.

Replace with a simpler approach: only render when the consumer **opts in** with a separate prop. Skip the v-model-conditional and use a dedicated prop the parent sets to opt in:

Remove the `defineModel` line above and use this pattern instead:

```js
const isWaveformDisplayed = defineModel('isWaveformDisplayed', {
  default: undefined
})
```

Then guard the button on `isWaveformDisplayed !== undefined`:

```vue
<button-simple
  class="flexrow-item"
  :active="isWaveformDisplayed"
  :title="$t('playlists.actions.toggle_waveform')"
  icon="waveform"
  @click="isWaveformDisplayed = !isWaveformDisplayed"
  v-if="isWaveformDisplayed !== undefined && (!light || fullScreen)"
/>
```

PreviewPlayer doesn't bind `v-model:is-waveform-displayed` → the ref is `undefined` → button hidden. PlaylistPlayer binds it → the ref is a boolean → button shown.

**Step 3: Build + lint + tests.**

```bash
npx eslint src/components/previews/PlayerPlaybackBar.vue
npm run test:unit
npm run build
```

Expected: all clean. PreviewPlayer's rendering of the bar should look unchanged in dev (verify mentally from the diff — the button only renders when the v-model is bound).

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerPlaybackBar.vue
git commit -m "[previews] PlayerPlaybackBar exposes optional isWaveformDisplayed v-model"
```

---

## Task 3 — Add `isShowAnnotationsWhilePlaying` v-model and its toggle button

Same pattern as Task 2.

**Files:**
- Modify: `src/components/previews/PlayerPlaybackBar.vue`

**Step 1: Declare the v-model** (same place as Task 2's):

```js
const isShowAnnotationsWhilePlaying = defineModel(
  'isShowAnnotationsWhilePlaying',
  { default: undefined }
)
```

**Step 2: Render the toggle button.** Insert it inside the same `v-if="isMovie"` block, right after the waveform button from Task 2:

```vue
<button-simple
  class="flexrow-item"
  :active="isShowAnnotationsWhilePlaying"
  :title="$t('playlists.actions.toggle_playing_annotations')"
  icon="triangle"
  @click="
    isShowAnnotationsWhilePlaying = !isShowAnnotationsWhilePlaying
  "
  v-if="
    isShowAnnotationsWhilePlaying !== undefined && (!light || fullScreen)
  "
/>
```

(Place it before the sound button if you prefer the order to follow PlaylistPlayer's old layout — the original sequence was `repeat, HD, speed, show-annotations, sound, waveform`. Keep the new order consistent.)

**Step 3: Build + lint + tests.** Same commands as Task 2. Expected clean.

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerPlaybackBar.vue
git commit -m "[previews] PlayerPlaybackBar exposes optional isShowAnnotationsWhilePlaying v-model"
```

---

## Task 4 — Add `compact` prop to suppress the secondary movie controls

PlaylistPlayer's `isFullMode` (the full-playlist timeline view) hides the entire `repeat / HD / speed / sound / waveform / annotations / time / frame` block. Add a `compact` prop that does the same, so PlaylistPlayer can pass `:compact="isFullMode"`.

**Files:**
- Modify: `src/components/previews/PlayerPlaybackBar.vue`

**Step 1: Add the prop** alphabetically in `defineProps`. After `available3DAnimations`:

```js
  compact: {
    type: Boolean,
    default: false
  },
```

**Step 2: Tighten the secondary `v-if`.** The current line is:

```vue
<div class="left flexrow" v-if="isMovie">
```

Change to:

```vue
<div class="left flexrow" v-if="isMovie && !compact">
```

The play/pause block (first wrapper) stays intact — PlaylistPlayer needs play/pause to keep working in full mode.

**Step 3: Build + lint + tests.** Same commands. Expected: clean. PreviewPlayer doesn't pass `compact`, so default `false` keeps current behavior.

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerPlaybackBar.vue
git commit -m "[previews] PlayerPlaybackBar gains compact prop to hide secondary controls"
```

---

## Task 5 — Add `#extra-controls` slot for playlist-specific buttons

PlaylistPlayer needs to inject: a picture-frame counter, a multi-preview-file navigation block, and a "change task type" button. These are playlist-specific — they don't belong in the bar's API but should render in the same horizontal row.

**Files:**
- Modify: `src/components/previews/PlayerPlaybackBar.vue`

**Step 1: Insert the slot** at the end of the bar's template (just before the closing `</template>` of the SFC's template block, OR as the last child inside the outer wrapper if the bar has one — look at the current structure first to decide).

The current template renders two sibling `<div>` blocks at top level. The slot should sit as a third sibling so it appears at the end of the bar in document order:

```vue
<slot name="extra-controls" />
```

**Step 2: Build + lint + tests.** Same commands. Expected clean. An unfilled slot renders nothing, so PreviewPlayer is unaffected.

**Step 3: Commit.**

```bash
git add src/components/previews/PlayerPlaybackBar.vue
git commit -m "[previews] PlayerPlaybackBar exposes #extra-controls slot"
```

---

## Task 6 — Adopt `<player-playback-bar>` in `PlaylistPlayer.vue`

The big task. Replace the entire inline playback block (lines ~461-628) with `<player-playback-bar>` + the `#extra-controls` slot, and remove the now-unused inline state (none — all bindings already exist as refs/computeds for the bar).

**Files:**
- Modify: `src/components/pages/playlists/PlaylistPlayer.vue`

**Step 1: Verify `PlayerPlaybackBar` is already imported.** From Step 1 of the bars adoption, the import block of PlaylistPlayer should not yet have `PlayerPlaybackBar`. Add the import alphabetically in the components block:

```js
import PlayerPlaybackBar from '@/components/previews/PlayerPlaybackBar.vue'
```

(It should land right after `PlayerComparisonBar` and before `PlaylistProgress`.)

**Step 2: Locate the inline playback block.** It's the block whose first child is the play/pause `<button-simple>` (currently around line 470, search for `playClicked`). It's a sibling of the `<player-comparison-bar>` block that came from Step 1.

The block to replace consists of these sub-blocks (in order):

1. The play/pause + 3D animation combo wrapper (`v-if="isCurrentPreviewMovie || isCurrentPreviewPicture || isCurrentPreviewSound || isCurrentPreviewModel"`). Lines ~461-494.
2. The time/frame indicator wrapper (`v-if="isCurrentPreviewMovie && !isFullMode"`). Lines ~496-526.
3. The `<div class="separator"></div>` at line ~528.
4. The picture-frame counter (`v-if="isCurrentPreviewPicture"`). Lines ~530-541.
5. The multi-preview-file navigation block (`v-if="currentEntityPreviewLength > 1"`). Lines ~543-577.
6. The movie controls (repeat / HD / speed / show-annotations / sound / waveform). Lines ~579-620.
7. The trailing `<div class="separator" v-if="!isFullMode"></div>` at line ~622.
8. The "change task type" button (`v-if="!tempMode && !isFullMode"`). Lines ~623-628.

**Step 3: Replace blocks 1, 2, 6 with `<player-playback-bar>`** and move blocks 3, 4, 5, 7, 8 into the bar's `#extra-controls` slot. The final markup looks like:

```vue
<player-playback-bar
  :available-3-d-animations="objectModel.availableAnimations"
  :compact="isFullMode"
  :current-frame-label="currentFrame"
  :current-time="currentTime"
  :full-screen="fullScreen"
  :is-3-d-animation="objectModel.isAnimation"
  :is-3-d-model="isCurrentPreviewModel"
  :is-movie="isCurrentPreviewMovie"
  :is-picture="isCurrentPreviewPicture"
  :is-playing="isPlaying"
  :is-repeating="isRepeating"
  :is-sound="isCurrentPreviewSound"
  :max-duration="maxDuration"
  :nb-frames="nbFrames"
  v-model:current-3-d-animation="objectModel.currentAnimation"
  v-model:is-hd="isHd"
  v-model:is-muted="isMuted"
  v-model:is-show-annotations-while-playing="isShowAnnotationsWhilePlaying"
  v-model:is-waveform-displayed="isWaveformDisplayed"
  v-model:speed="speed"
  v-model:volume="volume"
  @play-pause-clicked="onPlayPauseClicked"
  @repeat-clicked="onRepeatClicked"
  @toggle-sound-clicked="onToggleSoundClicked"
>
  <template #extra-controls>
    <div class="separator"></div>

    <div
      class="flexrow-item"
      :title="$t('playlists.actions.frame_number')"
      v-if="isCurrentPreviewPicture"
    >
      {{ (framesSeenOfPicture + '').padStart(2, '0') }} /
      {{
        currentEntity.preview_nb_frames
          ? currentEntity.preview_nb_frames
          : Math.round(2 * fps)
      }}
    </div>

    <div
      class="flexrow flexrow-item"
      :class="{ mr0: isCurrentPreviewPicture }"
      v-if="currentEntityPreviewLength > 1"
    >
      <button-simple
        class="button playlist-button flexrow-item"
        icon="left"
        :title="$t('playlists.actions.files_previous')"
        :disabled="isPlaying"
        @click="onPreviousPreviewClicked"
      />
      <span
        class="ml05 mr05 nowrap"
        :title="$t('playlists.actions.files_position')"
      >
        {{ currentPreviewIndex + 1 }} / {{ currentEntityPreviewLength }}
      </span>
      <button-simple
        class="button playlist-button flexrow-item"
        icon="right"
        :title="$t('playlists.actions.files_next')"
        :disabled="isPlaying"
        @click="onNextPreviewClicked"
      />
      <a
        class="button playlist-button flexrow-item"
        :href="currentPreviewPath"
        :title="$t('playlists.actions.see_original_file')"
        target="blank"
      >
        <arrow-up-right-icon class="icon is-small" />
      </a>
      <div class="separator" v-if="!isCurrentPreviewPicture"></div>
    </div>

    <div class="separator" v-if="!isFullMode"></div>
    <button-simple
      class="playlist-button flexrow-item"
      :title="$t('playlists.actions.change_task_type')"
      icon="check"
      @click="showTaskTypeModal"
      v-if="!tempMode && !isFullMode"
    />
  </template>
</player-playback-bar>
```

**Step 4: Confirm referenced bindings still exist** in PlaylistPlayer's `<script setup>`. All of these should already be present (do a `grep` to verify):

- `objectModel`, `isFullMode`, `currentFrame`, `currentTime`, `fullScreen`, `isCurrentPreviewModel`, `isCurrentPreviewMovie`, `isCurrentPreviewPicture`, `isCurrentPreviewSound`, `isPlaying`, `isRepeating`, `maxDuration`, `nbFrames`
- `isHd`, `isMuted`, `isShowAnnotationsWhilePlaying`, `isWaveformDisplayed`, `speed`, `volume`
- `onPlayPauseClicked`, `onRepeatClicked`, `onToggleSoundClicked`
- `framesSeenOfPicture`, `currentEntity`, `currentPreviewIndex`, `currentEntityPreviewLength`, `currentPreviewPath`
- `onPreviousPreviewClicked`, `onNextPreviewClicked`, `showTaskTypeModal`, `tempMode`, `fps`

If any binding is missing, **stop and ask** — don't invent.

**Step 5: Run the full pipeline.**

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
npm run test:unit
npm run build
```

Expected: all clean.

**Step 6: Self-review the diff.** Specifically check:
- The visibility guards align: in `isFullMode`, only play/pause + 3D anim combo should render (the bar's first `v-if` block is unguarded by `compact`, the second is guarded).
- The slot content's guards remain intact: picture counter shows only for pictures, multi-preview nav only when `currentEntityPreviewLength > 1`, change-task-type only when `!tempMode && !isFullMode`.
- The `<arrow-up-right-icon>` import (`lucide-vue-next`) is still imported in the script — the slot references it.

**Step 7: Commit only if lint + tests + build are green.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Adopt PlayerPlaybackBar in the template"
```

---

## Task 7 — Final cleanup

After Task 6, the template is much smaller and several inline-block CSS rules in PlaylistPlayer's scoped styles may no longer match anything. Audit and remove.

**Files:**
- Modify (likely): `src/components/pages/playlists/PlaylistPlayer.vue`

**Step 1: Search for now-dead CSS classes** that the inline playback block used. Candidates to verify (search the template for each name; remove the CSS rule only if the class is no longer rendered):

- `.time-indicator` — verify it's still emitted somewhere else in the template (it's a generic widget class — likely still used by other widgets).
- `.playlist-button` — broadly used elsewhere, almost certainly stays.
- `.nowrap`, `.flexrow`, `.flexrow-item`, `.filler`, `.mr0`, `.mr05`, `.ml05` — utility classes used across the file, keep.

In short: the previous task's template removal probably leaves no dead CSS in this file because the playback block reused only utility classes. But verify with one grep:

```bash
grep -nE "\.(time-indicator|playlist-button)" \
  src/components/pages/playlists/PlaylistPlayer.vue
```

If a rule is defined in `<style>` but the class is no longer in `<template>`, remove the rule.

**Step 2: Run eslint** to catch any unused imports:

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
```

If `ButtonSimple`, `ButtonSound`, `ComboboxStyled`, `SpeedButton`, or `ArrowUpRightIcon` are flagged as unused, remove them — but check first that they're not used elsewhere in the template (most of them are reused in the comparison bar wrapper, the header, etc.).

**Step 3: Verify the line-count drop.**

```bash
wc -l src/components/pages/playlists/PlaylistPlayer.vue
```

Expected: ~4500 lines or fewer (down from ~4633 post-Step-1). The inline playback block was ~165 lines of template; the slot content reintroduces ~60 lines, so net ~-100 to -150.

**Step 4: Final pipeline.**

```bash
npm run test:unit
npx eslint src/components/pages/playlists/PlaylistPlayer.vue src/components/previews/PlayerPlaybackBar.vue
npm run build
```

Expected: all clean.

**Step 5: Commit only if cleanup edits were made.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Clean up after playback bar adoption"
```

If no cleanup edits were needed (no dead CSS, no unused imports), skip this commit — Step 2 ends at Task 6.

---

## Acceptance

Step 2 is done when:

- `PlayerPlaybackBar.vue` has 4 new optional surface points: `isPicture` prop, `isWaveformDisplayed` v-model (default `undefined`), `isShowAnnotationsWhilePlaying` v-model (default `undefined`), `compact` prop, and an `#extra-controls` slot. All are backwards compatible with `PreviewPlayer.vue`.
- `PlaylistPlayer.vue` no longer contains the inline play/pause + movie-controls block. The `<player-playback-bar>` element is the only path to those controls in the template.
- `npm run test:unit` green.
- `npx eslint` clean on both files.
- `npm run build` clean.
- Manual smoke (user-side): in PlaylistPlayer, play/pause works for movie / picture / sound / model previews; in `isFullMode`, only play/pause remains; multi-preview-file navigation, picture-frame counter, and change-task-type button still appear under the bar via the slot; toggle waveform and show-annotations-while-playing still wire to the same state.

Once accepted, Step 3 of the design (PlayerAnnotationBar) can be planned in a follow-up writing-plans invocation. The two backlog items in `project_preview_player_followups.md` (show annotations while playing, handle-in/out markers) become trivially activatable in PreviewPlayer at that point because the v-model is already in the shared bar.
