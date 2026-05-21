# Player Shape Tool — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a rectangle / circle / arrow shape-drawing mode to the studio annotation flow used by `PreviewPlayer` and `PlaylistPlayer`, behind a single bar button with the same UX as the pencil tool.

**Architecture:** Extend `useAnnotation` with `isShapeMode` + `currentShape` refs (mutually exclusive with `isDrawing` / `isTyping`). Wire `attachShapeDrawing()` from `src/lib/annotation.js` inside `configureCanvas`; the existing `addToAdditions` flow handles undo/redo, broadcast, and persistence — we just need to suppress the early `object:added` event fired by `canvas.add()` of the in-progress shape (via `silentAnnotation`) and call `addToAdditions` manually in `onShapeAdded`. `PlayerAnnotationBar` exposes two opt-in v-models so PreviewPlayer / PlaylistPlayer enable the feature while consumers that don't bind them stay unchanged.

**Tech Stack:** Vue 3 (`<script setup>`), fabric.js v5 (cgwire fork), Vitest + jsdom.

**Out of scope:** Making shapes selectable / scalable / rotatable (follow-up session). Persistence of the last-selected shape between sessions.

---

## Pre-flight

```bash
cd /home/frankrousseau/projets/products/kitsu
git status
```

Tree should be clean for the files this plan touches. Untracked items (`.agents/`, `.claude/`, screenshots, etc.) can remain.

```bash
npm run test:unit
```

Expected: 634 passed, 1 skipped — the baseline.

---

## Task 1 — Add `SHAPE_WIDTHS` constant and `onShapeStart` hook to `attachShapeDrawing`

**Files:**
- Modify: `src/lib/annotation.js`

**Step 1: Add the new constant** next to `SHAPE_STROKE_WIDTH` (around line 60):

```js
// Halved pencil widths — shapes don't get pressure modulation and would
// look heavy at the pencil's 10/5/2 values.
export const SHAPE_WIDTHS = {
  big: 5,
  medium: 3,
  small: 2
}
```

**Step 2: Extend `attachShapeDrawing` to accept an optional `onShapeStart` callback** fired right BEFORE `canvas.add()`. This lets the studio consumer toggle its `silentAnnotation` flag to suppress the `object:added` listener firing for the in-progress 1×1 shape.

In `src/lib/annotation.js` around line 225:

```js
export const attachShapeDrawing = (
  canvas,
  { getTool, getColor, getWidth, onShapeAdded, onShapeStart }
) => {
```

In `onMouseDown` (around line 233) after the `if (!drawing) return` line, before `canvas.add(drawing)`:

```js
    drawing.set({ selectable: false, evented: false })
    onShapeStart?.()
    canvas.add(drawing)
```

(The existing `drawing.set({ selectable: false, evented: false })` line stays where it is — just insert `onShapeStart?.()` right after it.)

**Step 3: Run lint, prettier, tests, build.**

```bash
npx eslint src/lib/annotation.js
npx prettier --check src/lib/annotation.js
npm run test:unit
npm run build
```

All must pass. Existing callers (shared playlist overlay) don't pass `onShapeStart`, so behavior is unchanged for them.

**Step 4: Commit.**

```bash
git add src/lib/annotation.js
git commit -m "[lib] Add SHAPE_WIDTHS and onShapeStart hook to attachShapeDrawing"
```

---

## Task 2 — Create `ShapePicker.vue` widget

**Files:**
- Create: `src/components/widgets/ShapePicker.vue`

**Step 1: Write the file.** Mirror `PencilPicker.vue`'s structure but with three icon buttons for the three shapes.

```vue
<template>
  <div class="shape-wrapper">
    <button
      type="button"
      class="shape-picker"
      :title="$t('playlists.actions.annotation_shape')"
      @click="togglePalette"
    >
      <rectangle-horizontal-icon class="icon" v-if="shape === 'rectangle'" />
      <circle-icon class="icon" v-else-if="shape === 'circle'" />
      <arrow-up-right-icon class="icon" v-else-if="shape === 'arrow'" />
      <shapes-icon class="icon" v-else />
    </button>
    <div v-show="isOpen" class="shape-palette">
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'rectangle' }"
        title="Rectangle"
        @click="onShapePicked('rectangle')"
      >
        <rectangle-horizontal-icon class="icon" />
      </button>
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'circle' }"
        title="Circle"
        @click="onShapePicked('circle')"
      >
        <circle-icon class="icon" />
      </button>
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'arrow' }"
        title="Arrow"
        @click="onShapePicked('arrow')"
      >
        <arrow-up-right-icon class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpRightIcon,
  CircleIcon,
  RectangleHorizontalIcon,
  ShapesIcon
} from 'lucide-vue-next'
import { ref } from 'vue'

defineProps({
  shape: {
    type: String,
    default: 'rectangle'
  }
})

const emit = defineEmits(['change'])

const isOpen = ref(false)

const togglePalette = () => {
  isOpen.value = !isOpen.value
}

const onShapePicked = newShape => {
  emit('change', newShape)
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.shape-wrapper {
  position: relative;
  display: inline-flex;
}

.shape-picker {
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  align-items: center;
}

.shape-picker .icon,
.shape-option .icon {
  width: 1rem;
  height: 1rem;
}

.shape-palette {
  position: absolute;
  z-index: 900;
  left: 0;
  bottom: calc(100% - 0.25rem);
  background-color: $dark-grey-light;
  border-radius: 5px;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview .shape-palette {
  background-color: $dark-grey;
}

.shape-option {
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  color: $light-grey;
}

.shape-option:hover,
.shape-option.active {
  background-color: $dark-grey-strong;
  color: $white;
}
</style>
```

**Step 2: Lint + prettier.**

```bash
npx eslint src/components/widgets/ShapePicker.vue
npx prettier --check src/components/widgets/ShapePicker.vue
```

Clean.

**Step 3: Commit.**

```bash
git add src/components/widgets/ShapePicker.vue
git commit -m "[widgets] Add ShapePicker for rectangle/circle/arrow selection"
```

---

## Task 3 — Register the `shapes` icon in `ButtonSimple`

**Files:**
- Modify: `src/components/widgets/ButtonSimple.vue`

**Step 1: Read** the icon-resolver section of `ButtonSimple.vue` (search for `icon === 'pencil'` — there's a big chain of `v-if` / `v-else-if`). Note the import block at the top.

**Step 2: Import** the lucide icon. Add `ShapesIcon` to the existing import from `lucide-vue-next` (alphabetically placed inside the destructuring).

**Step 3: Add the resolver branch.** Find the `pencil` branch (around line 40) and add — alphabetically — a `'shapes'` branch:

```vue
<shapes-icon class="icon" v-else-if="icon === 'shapes'" />
```

(Place it according to the existing alphabetical order of the `v-else-if` chain — likely between the existing entries that surround `s` like `save` / `square` / `share`.)

**Step 4: Lint, prettier, tests, build.**

```bash
npx eslint src/components/widgets/ButtonSimple.vue
npx prettier --check src/components/widgets/ButtonSimple.vue
npm run test:unit
npm run build
```

**Step 5: Commit.**

```bash
git add src/components/widgets/ButtonSimple.vue
git commit -m "[widgets] ButtonSimple accepts the shapes icon"
```

---

## Task 4 — Add i18n key for the shape button title

**Files:**
- Modify: `src/locales/en.js`

**Step 1: Locate the key** `playlists.actions.annotation_draw` (or `annotation_text`) and add a sibling `annotation_shape` in alphabetical position.

```js
// Inside playlists.actions:
annotation_shape: 'Shape',
```

(Use the `i18n-add-key` skill conventions: alphabetical placement inside the `actions` sub-object.)

**Step 2: Verify the file still parses.**

```bash
node -e "import('./src/locales/en.js').then(m => console.log('OK:', Object.keys(m.default).length, 'sections'))"
```

**Step 3: Commit.**

```bash
git add src/locales/en.js
git commit -m "[locales] Add playlists.actions.annotation_shape key"
```

---

## Task 5 — Extend `useAnnotation` with shape mode

The meat of the feature. `useAnnotation` already exposes `pencilColor`, `pencilWidth`, `addToAdditions`, `stackAddAction`, `silentAnnotation`. We add shape-mode state, a `configureCanvas` extension that calls `attachShapeDrawing`, and mutual-exclusion wiring with the other modes.

**Files:**
- Modify: `src/composables/players/annotation.js`

**Step 1: Add the new imports** at the top of the file. Add `SHAPE_WIDTHS` and `attachShapeDrawing` to the existing destructured import from `@/lib/annotation`:

```js
import {
  // ... existing imports ...
  SHAPE_WIDTHS,
  attachShapeDrawing,
  // ... rest ...
} from '@/lib/annotation'
```

(Alphabetical order in the destructure.)

**Step 2: Add the new refs.** Find where `isDrawing`, `isTyping` are declared (search `const isDrawing = ref`). Add right after:

```js
const isShapeMode = ref(false)
const currentShape = ref('rectangle')
```

**Step 3: Add the toggle/setter actions.** Find `setAnnotationDrawingMode` (around line 849) and add right after:

```js
const toggleShapeMode = () => {
  if (isShapeMode.value) {
    isShapeMode.value = false
    return
  }
  isShapeMode.value = true
  // Mutex with the other annotation modes.
  isDrawing.value = false
  isTyping.value = false
  if (fabricCanvas.value) {
    fabricCanvas.value.isDrawingMode = false
  }
}

const setShapeTool = shape => {
  currentShape.value = shape
}
```

**Step 4: Make the other modes clear shape mode.** Find `setAnnotationDrawingMode` (around line 849):

```js
const setAnnotationDrawingMode = isDrawingMode => {
  if (isDrawingMode) isShapeMode.value = false
  fabricCanvas.value.isDrawingMode = isDrawingMode
}
```

Also find the typing mode setter (search for `isTyping.value = true` — likely in `onTypeClicked` or similar). Add `isShapeMode.value = false` right before it.

(If `isTyping` is set in multiple places, only modify the spots where the USER explicitly activates type mode — not lifecycle/cleanup paths.)

**Step 5: Wire `attachShapeDrawing` inside `configureCanvas`.** Find `configureCanvas` (around line 853). Add a `detachShapeDrawing` closure-scoped variable near the top of the composable (alongside other `let` declarations like `silentAnnotation`):

```js
let detachShapeDrawing = null
```

Inside `configureCanvas`, after the existing `fabricCanvas.value.on(...)` block (around line 876), add:

```js
if (detachShapeDrawing) {
  detachShapeDrawing()
  detachShapeDrawing = null
}
detachShapeDrawing = attachShapeDrawing(fabricCanvas.value, {
  getTool: () => (isShapeMode.value ? currentShape.value : null),
  getColor: () => pencilColor.value,
  getWidth: () => SHAPE_WIDTHS[pencilWidth.value],
  onShapeStart: () => {
    // Suppress the object:added listener for the in-progress 1×1 shape;
    // we'll add it to additions manually in onShapeAdded.
    silentAnnotation = true
  },
  onShapeAdded: shape => {
    silentAnnotation = false
    setObjectData(shape)
    shape.set({ selectable: false, evented: false })
    addToAdditions(shape)
    stackAddAction({ target: shape })
  }
})
```

**Step 6: Cleanup on unmount.** Find the existing teardown (search for `dispose` or `onBeforeUnmount` references — `useAnnotation` returns a cleanup or relies on `fabricCanvas.value?.dispose()`). Add a `detachShapeDrawing?.()` call there if such a path exists. If `useAnnotation` doesn't have an explicit teardown function but relies on `dispose()`, no extra wiring is needed — fabric disposes its listeners.

**Step 7: Export the new symbols.** In the return object at the bottom of the composable, add (alphabetically):

```js
return {
  // ... existing ...
  currentShape,
  isShapeMode,
  setShapeTool,
  toggleShapeMode,
  // ...
}
```

**Step 8: Verify.**

```bash
npx eslint src/composables/players/annotation.js
npx prettier --check src/composables/players/annotation.js
npm run test:unit
npm run build
```

All must pass. The existing 634 tests should not regress — shape mode is dormant until a consumer binds the v-models.

**Step 9: Commit.**

```bash
git add src/composables/players/annotation.js
git commit -m "[composables] useAnnotation gains shape mode"
```

---

## Task 6 — Extend `PlayerAnnotationBar` with the shape button

**Files:**
- Modify: `src/components/players/bars/PlayerAnnotationBar.vue`

**Step 1: Add the imports.** In the script-setup imports, add `ShapePicker` to the components block (alphabetically — after `PencilPicker` and before `ButtonSimple`-related entries, or wherever fits alphabetical order):

```js
import ShapePicker from '@/components/widgets/ShapePicker.vue'
```

**Step 2: Declare the v-models.** Alongside the existing `isLaserModeOn` v-model (added in step 3 of the bars adoption), append:

```js
const isShapeMode = defineModel('isShapeMode', { default: undefined })
const currentShape = defineModel('currentShape', { default: undefined })
```

**Step 3: Add the events.** Extend the existing `defineEmits([...])` array with `'shape-mode-clicked'` and `'change-shape'`, keeping alphabetical order in the array.

**Step 4: Add the shape button + its transition.** Locate the pencil-tool transition block (search for `v-show="isDrawing"`). The new block goes immediately AFTER the pencil button (which itself sits in the order `pen, loupe, type, pencil, laser, delete, comment`). The order becomes `pen, loupe, type, pencil, shape, laser, delete, comment`.

```vue
<transition name="slide">
  <div
    class="annotation-tools"
    v-show="isShapeMode && (!light || fullScreen)"
  >
    <shape-picker
      :shape="currentShape"
      @change="$emit('change-shape', $event)"
    />
    <pencil-picker
      :pencil="pencilWidth"
      :sizes="pencilPalette"
      @change="$emit('change-pencil-width', $event)"
    />
    <color-picker
      :color="pencilColor"
      @change="$emit('change-pencil-color', $event)"
    />
  </div>
</transition>

<button-simple
  class="flexrow-item"
  icon="shapes"
  :active="isShapeMode"
  :title="$t('playlists.actions.annotation_shape')"
  @click="$emit('shape-mode-clicked')"
  v-if="
    isShapeMode !== undefined &&
    !readOnly &&
    (!light || fullScreen) &&
    !isConcept
  "
/>
```

**Step 5: Verify.**

```bash
npx eslint src/components/players/bars/PlayerAnnotationBar.vue
npx prettier --check src/components/players/bars/PlayerAnnotationBar.vue
npm run test:unit
npm run build
```

All clean. PreviewPlayer (which doesn't bind the v-models yet) sees `undefined` → button and transition are hidden.

**Step 6: Commit.**

```bash
git add src/components/players/bars/PlayerAnnotationBar.vue
git commit -m "[players] PlayerAnnotationBar exposes optional shape-mode v-models and button"
```

---

## Task 7 — Wire `PreviewPlayer.vue` to the shape mode

**Files:**
- Modify: `src/components/players/players/PreviewPlayer.vue`

**Step 1: Destructure** the new symbols from `useAnnotation`. Find the existing `useAnnotation({ ... })` call in PreviewPlayer (search for `useAnnotation(`). Add to the destructure:

```js
const {
  // ... existing ...
  currentShape,
  isShapeMode,
  setShapeTool,
  toggleShapeMode,
  // ...
} = useAnnotation({ ... })
```

Keep the destructure alphabetical.

**Step 2: Pass to `<player-annotation-bar>`.** Find the `<player-annotation-bar ... />` element. Add:

```vue
v-model:current-shape="currentShape"
v-model:is-shape-mode="isShapeMode"
@change-shape="setShapeTool"
@shape-mode-clicked="toggleShapeMode"
```

Keep the v-models alphabetical inside the element and the events alphabetical too.

**Step 3: Verify.**

```bash
npx eslint src/components/players/players/PreviewPlayer.vue
npx prettier --check src/components/players/players/PreviewPlayer.vue
npm run test:unit
npm run build
```

**Step 4: Commit.**

```bash
git add src/components/players/players/PreviewPlayer.vue
git commit -m "[players] Wire shape mode into PreviewPlayer"
```

---

## Task 8 — Wire `PlaylistPlayer.vue` to the shape mode

Same shape as Task 7 but on `PlaylistPlayer.vue`.

**Files:**
- Modify: `src/components/players/players/PlaylistPlayer.vue`

**Step 1: Destructure** the four new symbols from the existing `useAnnotation` call.

**Step 2: Pass to `<player-annotation-bar>`** with the same four v-models / events as in Task 7.

**Step 3: Lint, prettier, tests, build.**

```bash
npx eslint src/components/players/players/PlaylistPlayer.vue
npx prettier --check src/components/players/players/PlaylistPlayer.vue
npm run test:unit
npm run build
```

**Step 4: Commit.**

```bash
git add src/components/players/players/PlaylistPlayer.vue
git commit -m "[players] Wire shape mode into PlaylistPlayer"
```

---

## Task 9 — Manual smoke test

Not a commit-producing task — the engineer (or the user, post-PR) runs the dev server and exercises the feature.

```bash
npm run dev
```

Open the **task page** for any shot/asset with a movie/picture preview:
- Annotation bar shows a new "shapes" icon button between pencil and the next button.
- Click it → button becomes active, transition slides in with ShapePicker + PencilPicker + ColorPicker.
- Default shape is rectangle. Pick circle, then drag on the canvas — a circle outline appears.
- Change color via ColorPicker — next shape uses the new color.
- Change width via PencilPicker (big/medium/small) — next shape uses the new stroke width (5/3/2 px).
- Pick arrow, drag — arrow appears.
- Click pencil — shape mode deactivates, draw a path. Click shape again — switches back, pencil deactivates.
- Click undo (or ctrl-Z) — last shape is removed.
- In a preview room with two browser sessions → shapes broadcast.
- Save annotations → shapes persist in the next page load.

Open the **playlist page**: same checks.

Open the **shared playlist** (guest view) → no change, its 3 shape buttons still work as before.

If anything fails, report which step and at which task it likely broke.

---

## Acceptance

- 8 commits added to the branch.
- `npm run test:unit` still green.
- `npm run lint` clean.
- `npm run build` clean.
- Manual smoke covers: button visible, transition opens, all 3 shapes draw, color + width pickers affect next shape, undo works, broadcast works, save/reload persists shapes, mode mutex works with pencil/type, SharedPlaylistPlayer behavior unchanged.
- PreviewPlayer and PlaylistPlayer now expose the shape mode; no other consumer of `PlayerAnnotationBar` is affected.

Once accepted, the follow-up session can make shapes selectable / scalable / rotatable by flipping the `selectable: false; evented: false` line in `onShapeAdded` to `true` and wiring `object:modified` into `addToUpdates`.
