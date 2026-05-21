# Player Shape Tool — Design

**Date:** 2026-05-21
**Branch:** `refactoring-review`
**Scope:** Add a shape-drawing tool (rectangle / circle / arrow) to the studio annotation flow used by `PreviewPlayer.vue` and `PlaylistPlayer.vue`, with the same UX as the existing pencil / type tools in `PlayerAnnotationBar`.

## Context

Shape drawing already exists for the guest / shared-playlist view: `SharedAnnotationOverlay.vue` exposes 3 shape buttons that drive `useSharedAnnotationCanvas`, which calls `attachShapeDrawing()` from `src/lib/annotation.js`. The studio-side composable `useAnnotation` does NOT wire `attachShapeDrawing()` — only `path:created` (pencil) is handled.

The user wants the same capability in the studio players, with the bar UX matching the existing tools (single toggle button + transition with options).

## Goal

In the annotation bar of `PreviewPlayer` and `PlaylistPlayer`:

- One toggle button "shape mode" (icon: `ShapesIcon` from lucide-vue-next, between pencil and laser).
- When active, a transition slides in containing:
  - `ShapePicker.vue` (new) — 3 icon buttons for rectangle / circle / arrow.
  - `ColorPicker` (existing) — shape color, shared with pencil.
  - `PencilPicker` (existing) — shape stroke width, shared with pencil.
- Shapes drawn on the canvas land in the existing `additions` flow, so undo/redo, preview-room broadcast, and persistence all work out of the box.
- `SharedPlaylistPlayer` / `SharedAnnotationOverlay` are unchanged.

## Architecture

### `useAnnotation` composable extension

Add to `src/composables/players/annotation.js`:

```js
// Refs
const isShapeMode = ref(false)
const currentShape = ref('rectangle')   // 'rectangle' | 'circle' | 'arrow'

// Actions
const toggleShapeMode = () => {
  if (isShapeMode.value) {
    isShapeMode.value = false
    return
  }
  isShapeMode.value = true
  // Mutex with other modes (existing pattern for isDrawing / isTyping)
  isDrawing.value = false
  isTyping.value = false
  // Apply the canvas state — same path as setAnnotationDrawingMode
  applyShapeMode()
}

const setShapeTool = shape => {
  currentShape.value = shape
  // No mode toggling — just records the choice.
}
```

`isDrawing` and `isTyping` setters already exclude each other; extend them to also clear `isShapeMode` (and vice versa). When `isShapeMode` is active, the fabric canvas must be in pointer-listening mode but **not** `isDrawingMode` (which is the pencil mode flag).

In the canvas setup (around `setupFabricCanvas` / `configureCanvas`), after the existing `path:created` wiring, attach the shape drawing handler:

```js
const detachShapeDrawing = attachShapeDrawing(fabricCanvas, {
  getTool: () => (isShapeMode.value ? currentShape.value : null),
  getColor: () => pencilColor.value,
  getWidth: () => SHAPE_WIDTHS[pencilWidth.value],
  onShapeAdded: shape => {
    setObjectData(shape, fabricCanvas, userId)
    shape.set('selectable', false)
    shape.set('evented', false)
    addToAdditions({
      time: getCurrentTime(),
      frame: getCurrentFrame(),
      canvasWidth: ...,
      canvasHeight: ...,
      object: shape
    })
    postAnnotationAddition?.(shape)  // existing broadcast hook
  }
})
```

Store `detachShapeDrawing` and call it from the existing cleanup path.

Add to `src/lib/annotation.js`:

```js
// Shapes look heavy at pencil widths because they don't get pressure
// modulation. Halve the pencil values to keep them readable.
export const SHAPE_WIDTHS = {
  big: 5,
  medium: 3,
  small: 2
}
```

Export from `useAnnotation`: `isShapeMode`, `currentShape`, `toggleShapeMode`, `setShapeTool`.

### `PlayerAnnotationBar` extension

Add to `src/components/players/bars/PlayerAnnotationBar.vue`:

- Two new `defineModel` calls with `{ default: undefined }`:
  - `isShapeMode`
  - `currentShape`
- Two new events: `shape-mode-clicked`, `change-shape`.
- A new prop `pencilPalette` is already there — reuse it.
- New button + transition group inserted between the pencil block and the laser button:

```vue
<transition name="slide">
  <div class="annotation-tools" v-show="isShapeMode && (!light || fullScreen)">
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
    isShapeMode !== undefined && !readOnly && (!light || fullScreen) && !isConcept
  "
/>
```

`PreviewPlayer` (which doesn't bind the new v-models) sees `undefined` → button and transition are hidden. Zero regression.

Add `ShapesIcon` to the icon resolver in `ButtonSimple.vue` if not already present.

### New `ShapePicker.vue` widget

`src/components/widgets/ShapePicker.vue`. Mirror of `PencilPicker.vue` but with 3 fixed buttons (rectangle / circle / arrow). Props: `shape: String`. Emits: `change`. ~50 lines.

### Player wiring (PreviewPlayer + PlaylistPlayer)

Each player destructures from `useAnnotation`:

```js
const {
  // ... existing ...
  isShapeMode,
  currentShape,
  toggleShapeMode,
  setShapeTool
} = useAnnotation({ ... })
```

Each player's `<player-annotation-bar>` invocation adds:

```vue
v-model:is-shape-mode="isShapeMode"
v-model:current-shape="currentShape"
@shape-mode-clicked="toggleShapeMode"
@change-shape="setShapeTool"
```

`PreviewPlayer.vue` and `PlaylistPlayer.vue` get the same wiring.

### i18n

Add to `src/locales/en.js`:

- `playlists.actions.annotation_shape`: `'Shape'`

(Shape sub-labels — "Rectangle", "Circle", "Arrow" — are kept as title attributes inside `ShapePicker` and don't need i18n keys, matching `SharedAnnotationOverlay`'s current pattern.)

## Out of scope (this round)

- Persisting the user's last selected shape between sessions.
- Pressure-sensitive shape strokes.
- "Double-tap to cycle through last two shapes" UX.
- Touching `SharedPlaylistPlayer` / `SharedAnnotationOverlay` — those already work.

## Planned follow-up (separate session)

- Make shapes **selectable, scalable, and rotatable** like the existing path objects. Today shapes are created with `selectable: false; evented: false` (matching the shared overlay) which means once drawn they're frozen. The follow-up flips them to behave like paths: the user can click a shape, see fabric's transformation handles, resize / rotate it, and the changes propagate through the existing `updates` flow (and broadcast). The architecture chosen here (shapes go through the same `additions` flow as paths) should make this follow-up cheap: only the post-creation flags change, plus wiring the `object:modified` / `object:scaling` events to push into `addToUpdates`.

## Acceptance criteria

- In PreviewPlayer (task page) and PlaylistPlayer (playlist page), the annotation bar has a new "shape" button between pencil and laser/comment.
- Clicking the button activates shape mode; the transition shows ShapePicker + ColorPicker + PencilPicker.
- Switching shape (rect/circle/arrow) updates which shape is drawn on the next pointer-drag.
- Changing color / width while shape mode is active updates pencil state too (shared).
- Drawn shapes appear immediately on the canvas, are part of the undo/redo stack, are broadcast in preview-room sessions, and save with the rest of the annotations.
- Activating shape mode deactivates pencil/type modes (mutex). Activating pencil/type deactivates shape mode.
- PreviewPlayer remains visually identical when shape mode is not enabled by the consumer (default `undefined` → invisible button).
- SharedPlaylistPlayer behavior unchanged.
- `npm run test:unit` green, `npm run lint` clean, `npm run build` clean.

## Risks / open questions

- **`addToAdditions` API**: the existing pencil path uses `useAnnotation`'s internal `addToAdditions` directly via the `path:created` handler. Plugging the shape handler in the same way means re-using the same code path — that should "just work" but a reading of the actual addition logic is needed when implementing.
- **`postAnnotationAddition` broadcast**: shapes need to be broadcast in preview-room. If `addToAdditions` already calls `postAnnotationAddition?.()`, no extra wiring is needed. If not, add it.
- **Icon name in `ButtonSimple`**: `ButtonSimple.vue` has a giant if/else chain for `icon=`. Adding `shapes` needs one new branch importing `ShapesIcon`.
- **Visual layout of the transition**: 3 sub-pickers (`ShapePicker` + `ColorPicker` + `PencilPicker`) may overflow the bar's height when stacked. The shared `.annotation-tools` style is fine for 2 widgets (color + pencil) today — verify it absorbs 3 visually.

## Next step

Once approved, invoke `writing-plans` to produce the step-by-step implementation plan. Expected tasks: ~6 (extend `useAnnotation`, add `SHAPE_WIDTHS`, write `ShapePicker.vue`, extend `PlayerAnnotationBar`, wire `PreviewPlayer`, wire `PlaylistPlayer` + i18n + icon).
