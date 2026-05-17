# Edit page player refactor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `src/components/pages/Edit.vue`'s custom inline player with the refactored `<preview-player>`, migrate Edit.vue from Options-API + mixins to Composition API, and drop preview-room from the page. The follow-up workstream "playlists of edits" is out of scope.

**Architecture:** Edit.vue becomes a thin wrapper that loads the edit + its preview files and hands them to `<preview-player>`. The page-level layout (header with `previews-per-task-type` + entity nav, sections for infos/schedule/preview-files/activity/time-logs) is kept. All player-related mixins (`annotationMixin`, `playerMixin`, `previewRoomMixin`) and the preview-room widget are removed.

**Tech Stack:** Vue 3, `<script setup>`, Vuex, vue-i18n, existing composables (`useAnnotation`, `useComparison`, `useFullScreen`, `usePanzoomSync`, `usePreviewShortcuts`) embedded in `PreviewPlayer`. ESLint + Prettier. Reference design doc: `docs/plans/2026-05-18-edit-page-player-refactor-design.md`.

**Verification approach:** No unit tests exist for `Edit.vue` or `PreviewPlayer`. Each task ends with a manual smoke step via `npm run dev` on an Edit page. Always run `npx eslint <changed files>` and `npm run test:unit` (the project's existing test suite must keep passing) before committing.

**Reference skills:**
- @composition-api-migration — universal transforms for Options → `<script setup>` conversion in this repo
- @superpowers:executing-plans — execution loop

---

## Pre-flight (do this once)

**Step P1: Ensure the dev server runs and the Edit page loads with the current code**

Run:
```bash
cd /home/frankrousseau/projets/products/kitsu
npm run dev
```

Open an Edit page in the browser. Verify the page loads, the custom player shows a preview, you can play/pause, draw an annotation. This is the baseline — every task after this must keep the same observable behaviour (minus preview-room, which we explicitly remove).

Kill the dev server with `Ctrl+C` after the baseline check; restart it ad hoc during the implementation.

**Step P2: Snapshot current Edit.vue size for later comparison**

```bash
wc -l src/components/pages/Edit.vue
```

Note the number (~1445). Target after refactor: roughly 250-350 lines.

---

## Task 1: Identify the integration points in Edit.vue

**Files:**
- Read-only: `src/components/pages/Edit.vue`
- Read-only: `src/components/previews/PreviewPlayer.vue`
- Read-only: `src/components/mixins/player.js`
- Read-only: `src/components/mixins/annotation.js`
- Read-only: `src/components/mixins/previewRoom.js`

**Step 1.1: Write down the key state and methods Edit.vue currently uses from its mixins**

Open Edit.vue and scan for any `this.xxx` reference that isn't defined in Edit.vue's own `data()` / `computed` / `methods`. List them. These come from one of:
- `annotationMixin` (drawing state, save callbacks)
- `playerMixin` (play / pause, frame nav, comparison, isPlaying, currentFrame*, speed)
- `previewRoomMixin` (room, joinRoom, leaveRoom, openRoom, isValidRoomId, post* methods)
- `domMixin`, `entityMixin`, `formatListMixin`, `fullScreenMixin` (page-level utilities)

After the refactor, anything from the first three mixins should be unreachable from Edit.vue. The last four are page-level; they may stay.

**Step 1.2: Verify PreviewPlayer's contract**

Confirm via `grep` that PreviewPlayer exposes what we need to feed it:

```bash
grep -n "defineProps\|defineEmits\|defineExpose" src/components/previews/PreviewPlayer.vue
```

Expected props we'll pass: `previews`, `task`, `entityPreviewFiles`, `taskTypeMap`, `entityType`, `lastPreviewFiles`. Expected emits we'll consume: `annotation-changed`, `change-current-preview`, `comment-added`. Anything missing means the integration won't work as-is — surface the gap to the controller before proceeding.

**Step 1.3: Identify the bridge to derive `currentTask`**

In Edit.vue, search for how the current task is identified today. Often it's via `previewFile.task_id` and the `taskMap` store getter. We will derive it the same way.

```bash
grep -n "task_id\|taskMap\|currentTask" src/components/pages/Edit.vue
```

**Step 1.4: Commit a working-notes file (optional but recommended)**

If notes are non-trivial, save to `docs/plans/2026-05-18-edit-page-player-refactor-notes.md` and commit it. Otherwise skip.

```bash
git add docs/plans/
git commit -m "[docs] Notes for Edit.vue refactor integration points"
```

---

## Task 2: Replace the custom player template with `<preview-player>`

This is the most invasive single step. It is a behaviour-change commit, kept in Options API so the surrounding script changes minimally.

**Files:**
- Modify: `src/components/pages/Edit.vue`

**Step 2.1: Add the bridge computeds in Edit.vue's `computed`**

In the `computed` block, add:

```javascript
currentTaskTypeId() {
  return this.currentPreview?.task_type_id || null
},

currentTask() {
  const taskTypeId = this.currentTaskTypeId
  if (!taskTypeId || !this.currentEdit) return null
  return Object.values(this.taskMap).find(
    t => t.entity_id === this.currentEdit.id && t.task_type_id === taskTypeId
  ) || null
},

currentRevisions() {
  return this.previewFiles[this.currentTaskTypeId] || []
},
```

These are pure derivations — they don't touch anything that wasn't already in Edit.vue.

**Step 2.2: Add `<preview-player>` to the template, *after* the existing player block**

In `src/components/pages/Edit.vue` find the `<div ref="container" class="edit player block">` block (around line 65). At the end of it, just before `</div>`, insert:

```html
<preview-player
  ref="preview-player"
  v-if="!isLoading && currentEdit && currentRevisions.length > 0"
  :canvas-id="'edit-annotation-canvas'"
  :previews="currentRevisions"
  :task="currentTask"
  :entity-preview-files="previewFiles"
  :task-type-map="taskTypeMap"
  :entity-type="'Edit'"
  :last-preview-files="currentRevisions"
  @annotation-changed="onAnnotationChanged"
  @change-current-preview="onChangeCurrentPreview"
/>
```

**Step 2.3: Register the new component import**

In the `<script>` section's `import` block, add:

```javascript
import PreviewPlayer from '@/components/previews/PreviewPlayer.vue'
```

And add `PreviewPlayer` to the `components: {}` block (alphabetical order).

**Step 2.4: Add the `onChangeCurrentPreview` handler in `methods`**

In the `methods` block, add:

```javascript
onChangeCurrentPreview(previewFile) {
  // Mirror previews-per-task-type's flow: update the selection so
  // currentTaskTypeId and currentRevisions recompute and stay in sync.
  if (previewFile) this.onPreviewChanged(this.currentEntity, previewFile)
}
```

`onAnnotationChanged` already exists in Edit.vue and forwards to the store — keep it as-is.

**Step 2.5: Run lint and dev smoke**

```bash
npx eslint src/components/pages/Edit.vue
npm run dev
```

Open the Edit page. You should now see TWO players stacked vertically: the old custom one and the new `<preview-player>` below. Confirm `<preview-player>` renders the preview and lets you draw + zoom + pan. The old player still runs on top — ignore it.

**Step 2.6: Remove the entire custom player markup**

Inside `<div ref="container" class="edit player block">`, delete:
- The `<div class="flexrow filler" v-show="!isLoading">` block containing `<raw-video-player>`, `<object-viewer>`, `<sound-viewer>`, the picture wrapper, the loading-wrapper, the canvas-wrapper, and the `<task-info>` (line ~66 to ~181).
- The `<video-progress>` block (line ~183 to ~197).
- The whole `<div class="player-footer flexrow" ref="button-bar">` block (line ~199 to ~441).
- The `<canvas id="annotation-snapshot">` and `<canvas id="resize-annotation-canvas">` if they live inside this container.

Keep only `<preview-player>` inside `<div ref="container" class="edit player block">`.

Note: `<task-info>` becomes a child of the player container removed above — PreviewPlayer renders its own `<task-info>` internally, so this is intended.

Also, remove the `v-if="!isLoading && currentEdit && currentRevisions.length > 0"` and replace it by a more lenient `v-if="!isLoading && currentEdit"` so the player can show an empty state when there are no previews yet.

**Step 2.7: Run lint and dev smoke again**

```bash
npx eslint src/components/pages/Edit.vue
npm run dev
```

The Edit page should now show just `<preview-player>`. Walk the smoke path:
- Switch task type via `previews-per-task-type`.
- Change revision via PreviewPlayer's prev/next.
- Play/pause a movie.
- Draw and save an annotation.
- Toggle fullscreen, zoom, comparison.
- Navigate to previous/next entity (page header).

If anything is broken, **stop and investigate** before committing.

**Step 2.8: Commit**

```bash
git add src/components/pages/Edit.vue
git commit -m "[pages] Swap Edit.vue's inline player for PreviewPlayer

Edit.vue now delegates the whole player surface (annotation,
zoom-pan, comparison, fullscreen, frame navigation, shortcuts) to
PreviewPlayer. Adds currentTaskTypeId / currentTask /
currentRevisions computeds to bridge the data shape.

Mixins, custom button bar, raw-video-player, object-viewer and
sound-viewer direct usage, video-progress, the inline canvas
wrapper, and the helper canvases are all removed from the template.
Surrounding script (mixins, data, lifecycle, helpers) is still in
Options API and gets stripped in the next commits."
```

---

## Task 3: Drop preview-room from Edit.vue

**Files:**
- Modify: `src/components/pages/Edit.vue`

**Step 3.1: Remove the `<preview-room>` element from the template**

Delete the `<div class="flexrow-item block mt0">` wrapper around `<preview-room ...>` (around line 39 in the original file — find by searching `<preview-room`).

**Step 3.2: Drop the `previewRoomMixin` from the `mixins` array**

In the `mixins: [...]` block, remove `previewRoomMixin`. Also remove its `import` near the top:

```javascript
// Remove this line:
import { previewRoomMixin } from '@/components/mixins/previewRoom'
```

**Step 3.3: Remove the `PreviewRoom` component registration**

In `components: { ... }`, remove `PreviewRoom`. Remove its import:

```javascript
// Remove this line:
import PreviewRoom from '@/components/widgets/PreviewRoom.vue'
```

**Step 3.4: Strip room-related state from `data()`**

In the `data()` return, remove:
- `previewRoomRef: 'edits-preview-room'`
- `room: { id: null, people: [], newComer: true }`

**Step 3.5: Remove the room socket events**

Find the component's `sockets` or `socket: { events: { ... } }` block. Remove the merge of `previewRoomMixin.socket.events` (the spread `...previewRoomMixin.socket.events`).

**Step 3.6: Remove the `room.id` assignments**

Search for `this.room.id =` in Edit.vue. Each should be deleted (and the surrounding `nextTick` or other wrapper kept if it does other work).

```bash
grep -n "this\.room" src/components/pages/Edit.vue
```

Expected output after the cleanup: 0 lines.

**Step 3.7: Remove any `sendUpdatePlayingStatus`, `joinRoom`, `leaveRoom`, `openRoom`, `isValidRoomId` calls**

These came from the mixin. Search:

```bash
grep -nE "sendUpdatePlayingStatus|joinRoom|leaveRoom|openRoom|isValidRoomId" src/components/pages/Edit.vue
```

Each match: remove the entire line (or surrounding `if` block) carefully — they don't apply now that preview-room is gone.

**Step 3.8: Lint + dev smoke**

```bash
npx eslint src/components/pages/Edit.vue
npm run dev
```

Reopen the Edit page. Same smoke check as 2.7, minus preview-room (which is no longer there).

**Step 3.9: Commit**

```bash
git add src/components/pages/Edit.vue
git commit -m "[pages] Remove preview-room from Edit.vue

Collaborative review for edits will later be reached through
playlists that contain edits (separate workstream). Removes the
PreviewRoom widget, the previewRoomMixin and its socket events,
the room state object, and every joinRoom / leaveRoom /
sendUpdatePlayingStatus / isValidRoomId call site."
```

---

## Task 4: Drop the player-related mixins (annotation + player) and their leftover state

After Task 2 the `<raw-video-player>` and friends are gone, but `annotationMixin` and `playerMixin` are still attached. Their state is unreachable from the template — strip them.

**Files:**
- Modify: `src/components/pages/Edit.vue`

**Step 4.1: Drop `annotationMixin` and `playerMixin` from the `mixins` array**

In the `mixins: [...]` block, remove them. Also remove their imports.

**Step 4.2: Strip leftover state from `data()` that came from those mixins**

Search Edit.vue for fields that were leftover support for the custom player:

- `framesPerImage`
- `playingEntityIndex`
- `currentPreviewIndex`
- `playingPreviewFileId`
- `movieDimensions`
- `isAnnotationsDisplayed` (PreviewPlayer manages internally; remove from Edit.vue's `data`)
- `previewFileMap` (only used by deleted player; keep if still referenced elsewhere — check first)

Verify each is no longer referenced before deleting:

```bash
grep -n "framesPerImage\|playingEntityIndex\|currentPreviewIndex\|playingPreviewFileId\|movieDimensions" src/components/pages/Edit.vue
```

Anything still referenced means a method/handler missed in Task 2.

**Step 4.3: Strip leftover methods**

These methods are now unreachable from the template:

- `initPlayer`, `setupFabricCanvas` (came from `annotationMixin`/`playerMixin`)
- `onVideoLoaded`, `onMaxDurationUpdate`, `onFrameUpdate`, `onMetadataLoaded`, `onVideoRepeated`, `onProgressChanged`, `onScrubStart`, `onScrubEnd`
- `playClicked`, `pauseClicked`, `setPreviewFile`, `clearCanvas`, `resetCanvas`, `resetPictureCanvas`, `updateProgressBar`, `updateTaskPanel`
- `setPlayerSpeed`, `resetHeight`

Drop them. Keep:
- `init`, `resetData`, `onPreviewFilesUpdate` (page-level wiring)
- `onPreviewChanged` (still used by `previews-per-task-type`)
- `onAnnotationChanged` (forwards to store)
- `onChangeCurrentPreview` (added in Task 2)
- Whatever supports the sections below the player

Also search for any orphaned method:

```bash
grep -n "this\.\w\+(" src/components/pages/Edit.vue | sort -u
```

For each, verify it resolves to something defined in the file or a remaining mixin. Drop the unresolved ones.

**Step 4.4: Strip leftover socket events**

In `sockets: { events: { ... } }` (or however it's spelled in this file), remove the spreads `...playerMixin.socket.events` and `...annotationMixin.socket.events` if present. Keep:

- `'preview-file:add-file'` → `onPreviewFilesUpdate`
- `'comment:delete'` → likewise reload

**Step 4.5: Remove now-orphaned imports**

Delete the `import` lines for any component that was used only by the deleted custom player (`RawVideoPlayer`, `VideoProgress`, `ObjectViewer`, `SoundViewer`, `SpeedButton`, `PencilPicker`, `ColorPicker`, `ButtonSimple` — verify each is not used by remaining sections!).

Run:

```bash
grep -nE "RawVideoPlayer|VideoProgress|ObjectViewer|SoundViewer|SpeedButton|PencilPicker|ColorPicker|ButtonSimple" src/components/pages/Edit.vue
```

Drop imports where there are no template references.

**Step 4.6: Lint + dev smoke**

```bash
npx eslint src/components/pages/Edit.vue
npm run test:unit
npm run dev
```

Same smoke check as before. The dev server should boot without console errors related to undefined methods / refs.

**Step 4.7: Commit**

```bash
git add src/components/pages/Edit.vue
git commit -m "[pages] Drop annotation + player mixins from Edit.vue

PreviewPlayer encapsulates everything those mixins used to provide.
Remove the mixin imports, every piece of state they injected
(framesPerImage, playingEntityIndex, currentPreviewIndex,
playingPreviewFileId, movieDimensions, isAnnotationsDisplayed,
previewFileMap), every method now unreachable from the template
(initPlayer, onVideoLoaded, onProgressChanged, playClicked,
pauseClicked, etc.) and the corresponding component imports."
```

---

## Task 5: Migrate Edit.vue to Composition API

This task does NOT change behaviour. Reference @composition-api-migration for the universal transforms used in this codebase (script-setup conversion, mapGetters → computed, mapActions → store.dispatch, mixin removal patterns, useHead, useI18n, useStore, useRoute).

**Files:**
- Modify: `src/components/pages/Edit.vue`

**Step 5.1: Convert the `<script>` block to `<script setup>`**

Replace the Options-API `export default { ... }` with a `<script setup>` block. Apply the universal transforms:

- `mapGetters([...])` → individual `computed(() => store.getters.xxx)` calls.
- `mapActions([...])` → call `store.dispatch('xxx', ...)` directly.
- `data() { return { x: false } }` → `const x = ref(false)`.
- `computed: { foo() { ... } }` → `const foo = computed(() => { ... })`.
- `methods: { bar() { ... } }` → `const bar = () => { ... }`.
- `mounted() { ... }` → `onMounted(() => { ... })`.
- `watch: { foo() { ... } }` → `watch(foo, () => { ... })`.
- `head: { ... }` → `useHead({ title: computed(...) })`.
- `this.$t(...)` → `t(...)` after `const { t } = useI18n()`.
- `this.$route` → `useRoute()` once at the top.
- `this.$refs.xxx` → `useTemplateRef('xxx')`.
- Template `ref="x-y"` stays as-is; the `useTemplateRef('x-y')` const matches by string.

Order of code inside `<script setup>` (per project convention):
1. Imports (alphabetical within each group, blank lines between third-party / project libs / components).
2. Composables (`useI18n`, `useRoute`, `useStore`).
3. Props/Emits (none for this page).
4. State (`ref` declarations).
5. Computed (Vuex getters + derived state).
6. Functions (handlers and helpers).
7. Watchers.
8. Lifecycle hooks.
9. `useHead` if any.

Sub-step 5.1.a: skeleton

Write the imports block + composables block + empty placeholders for state / computed / functions / lifecycle, save, run eslint to catch syntax. Iterate.

Sub-step 5.1.b: state and Vuex getters

Move every `data()` field and every `mapGetters` entry. Verify imports match.

Sub-step 5.1.c: methods and watchers

Convert each method. Convert each watcher. The `mixins`-injected handlers no longer exist (we already dropped them), so this should be a small list.

Sub-step 5.1.d: lifecycle

`mounted()` → `onMounted()`. Confirm `init()` still wires socket listeners, calls `resetData()`, etc.

**Step 5.2: Migrate the remaining mixin usages in-place or via composables**

After Task 4, only `domMixin`, `entityMixin`, `formatListMixin`, `fullScreenMixin` remain. Each one's contribution:

- `domMixin` → likely small DOM helpers. Search usage with `grep "this\.\(getClientX\|pauseEvent\|clearFocus\|...\)"`. If a method is used, copy the small helper inline as a `const`.
- `entityMixin` → entity navigation (`previousEntityPath`, `nextEntityPath`, `currentEntity`, `entityList`). For the scope of this task, **keep the mixin** in the `mixins:` array — but mixins don't combine with `<script setup>` directly. Instead, expose the mixin's contributions through a separate `<script>` block that defines them in Composition API form. Pragma: use a temporary `defineOptions({ mixins: [entityMixin, formatListMixin] })` if Vue 3 supports it for this project's version (it does since 3.3). Verify:

  ```bash
  grep version package.json | head -1
  ```

  If `defineOptions` is available, use it:

  ```javascript
  defineOptions({
    mixins: [entityMixin, formatListMixin, fullScreenMixin, domMixin]
  })
  ```

  In `<script setup>`, mixin-injected refs / methods can be accessed via the component instance, which is awkward. The cleanest temporary path is to keep this script using `defineOptions` for mixins, accept the limitation, and follow up later with composable conversions (out of scope here).

  Alternative: if the mixins inject < 5 things each, inline them directly into Edit.vue as `const` / `computed`. Audit which is shorter.

- `fullScreenMixin` → likely now unused at page level. Confirm with grep; if 0 hits, drop the import. Otherwise, keep via `defineOptions`.

**Step 5.3: Lint + dev smoke**

```bash
npx eslint src/components/pages/Edit.vue
npm run test:unit
npm run dev
```

Same smoke path. Special attention to:
- Page header (back link, entity-thumbnail, title, previews-per-task-type, prev/next entity).
- Sections (info / schedule / preview-files / activity / time-logs).
- Modal triggers (`EditEditModal`) still open.
- Vuex actions (`editEdit`, `loadEdits`, `loadTaskEntityPreviewFiles`, `updatePreviewAnnotation`) still fire.

**Step 5.4: Commit**

```bash
git add src/components/pages/Edit.vue
git commit -m "[pages] Migrate Edit.vue to <script setup>

No observable behaviour change. mapGetters becomes computed
references to store.getters, mapActions becomes direct
store.dispatch calls, data/methods/computed/watch sections fold
into composition primitives, lifecycle uses onMounted. Remaining
page-level mixins (entityMixin, formatListMixin, fullScreenMixin,
domMixin) are kept temporarily through defineOptions; converting
them to composables is a follow-up."
```

---

## Task 6: Audit and clean the remaining mixins (optional follow-up if time permits)

This task is **optional** for the PR. If left, file a note in the commit body listing what's still on `defineOptions({ mixins: [...] })` so the next contributor can pick it up.

**Files:**
- Modify: `src/components/pages/Edit.vue`
- Possibly create: `src/composables/entityNavigation.js` (or similar)

**Step 6.1: For each mixin still attached, identify what Edit.vue actually uses**

For each of `entityMixin`, `formatListMixin`, `fullScreenMixin`, `domMixin`:

```bash
grep -nE "(this\.|^\s*)(previousEntityPath|nextEntityPath|currentEntity|entityList|...)" src/components/pages/Edit.vue
```

(Replace the right-hand alternation with the methods/computeds the mixin actually defines.)

Anything unused → just remove the mixin from `defineOptions`.

**Step 6.2: For each remaining mixin, decide: inline, composable, or keep**

- < 3 small contributions still in use → **inline** the relevant bits as `const` / `computed` and drop the mixin.
- Larger contributions still in use → convert to a **composable** under `src/composables/<name>.js` and import it. Keep the API minimal: only export what Edit.vue needs.
- Mixin used by many other pages we don't want to touch right now → **keep** it via `defineOptions`. Add a TODO comment with the name and the date.

**Step 6.3: Lint + dev smoke + commit (one commit per mixin processed)**

```bash
npx eslint src/components/pages/Edit.vue
npm run test:unit
npm run dev
```

Smoke check. Commit, e.g.:

```bash
git add src/components/pages/Edit.vue src/composables/entityNavigation.js
git commit -m "[composables] Extract entity navigation from Edit.vue's entityMixin"
```

---

## Task 7: Final cleanup and smoke

**Files:**
- Modify: `src/components/pages/Edit.vue`

**Step 7.1: Verify the file size dropped substantially**

```bash
wc -l src/components/pages/Edit.vue
```

Expected: ~250-350 lines. If still > 500, scan for dead code or leftover state.

**Step 7.2: Verify no orphan imports**

```bash
npx eslint src/components/pages/Edit.vue
```

ESLint should report no unused imports (the project's config catches this).

**Step 7.3: Run the full smoke test path from the design doc**

(From `docs/plans/2026-05-18-edit-page-player-refactor-design.md` §Testing — 10 steps.)

For each step, document the result (✅ / ❌ + observation). If any ❌, fix before merging.

**Step 7.4: Run unit tests**

```bash
npm run test:unit
```

Expected: 544 passed, 1 skipped (matching the baseline before the refactor). Any new failure → investigate before committing.

**Step 7.5: Final commit if anything moved**

```bash
git add src/components/pages/Edit.vue
git commit -m "[pages] Final cleanup of Edit.vue after refactor"
```

If nothing moved in Task 7, skip the commit.

**Step 7.6: Summarize the diff**

```bash
git log --oneline master..HEAD -- src/components/pages/Edit.vue
git diff --stat master..HEAD -- src/components/pages/Edit.vue
```

Expected: a clean chain of `[pages]`-prefixed commits, single-file diff with negative net lines, no test count regression.

---

## Risk register

- **`entityMixin` + `<script setup>` interaction**: Vue 3.3+ supports `defineOptions({ mixins })` but the script-setup body can't access mixin-injected state directly. If this becomes painful, the right answer is Task 6 (convert to composable). Don't fight `defineOptions` for too long.
- **Mixin removal cascade**: removing `playerMixin` may unhook methods that other code (other pages, modals) still calls — but those pages aren't using Edit.vue's mixin instance, so this risk is local. Grep `playerMixin` across the codebase if in doubt.
- **Preview-room regression**: users currently relying on preview-room on the Edit page lose it. The follow-up workstream "playlists of edits" will give them back collaborative review. Mention in the PR description.
- **Reverts**: each task ends in a committable state. If something goes sideways, `git revert` the offending commit; later tasks build cleanly on top.

## Out of scope reminders

- Tests for Edit.vue / PreviewPlayer — none exist, none added here.
- Removing `RawVideoPlayer` from the codebase — still used by `PlaylistPlayer`.
- "Playlists of edits" workstream — separate brainstorm, separate PR.
- Converting `entityMixin` / `formatListMixin` / `domMixin` to composables across the whole codebase.
