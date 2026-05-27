# `usePanzoomSync` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract panzoom transform tracking into a shared composable, adopt it in `SharedPlaylistPlayer`, and fix the `comparisonViewer` zoom-pan bug in `PreviewPlayer` — preparing the ground for phase 3 (live annotation overlay in `PreviewPlayer`).

**Architecture:** Minimal composable exposing `{ transform, onPanzoomChanged, reset, applyTo }`. Agnostic of the viewer. No coupling with the imperative `resumeZoom`/`pauseZoom`/`resetZoom` API of `PreviewViewer`. See `docs/plans/2026-05-14-usePanzoomSync-design.md` (commit `45587e356`) for the full design rationale.

**Tech Stack:** Vue 3.5 Composition API, vitest (jsdom), `<script setup>`. Existing patterns: `tests/unit/composables/modal.spec.js`.

---

## Phase 1 — Extract composable + adopt in `SharedPlaylistPlayer`

### Task 1: Implement `usePanzoomSync` composable (TDD)

**Files:**
- Create: `tests/unit/composables/panzoom.spec.js`
- Create: `src/composables/panzoom.js`

**Step 1: Write the failing spec**

Create `tests/unit/composables/panzoom.spec.js`:

```js
import { usePanzoomSync } from '@/composables/panzoom'

describe('composables/panzoom', () => {
  describe('initial state', () => {
    it('starts with identity transform', () => {
      const { transform } = usePanzoomSync()
      expect(transform.value).toEqual({ x: 0, y: 0, scale: 1 })
    })
  })

  describe('onPanzoomChanged', () => {
    it('updates the transform ref', () => {
      const { transform, onPanzoomChanged } = usePanzoomSync()
      onPanzoomChanged({ x: 10, y: 20, scale: 2 })
      expect(transform.value).toEqual({ x: 10, y: 20, scale: 2 })
    })

    it('replaces the previous transform on each call', () => {
      const { transform, onPanzoomChanged } = usePanzoomSync()
      onPanzoomChanged({ x: 5, y: 5, scale: 1.5 })
      onPanzoomChanged({ x: -3, y: 7, scale: 0.8 })
      expect(transform.value).toEqual({ x: -3, y: 7, scale: 0.8 })
    })
  })

  describe('reset', () => {
    it('restores the identity transform', () => {
      const { transform, onPanzoomChanged, reset } = usePanzoomSync()
      onPanzoomChanged({ x: 42, y: -17, scale: 3 })
      reset()
      expect(transform.value).toEqual({ x: 0, y: 0, scale: 1 })
    })
  })

  describe('applyTo', () => {
    it('is a no-op when target is null', () => {
      const { applyTo } = usePanzoomSync()
      expect(() => applyTo(null)).not.toThrow()
    })

    it('is a no-op when target is undefined', () => {
      const { applyTo } = usePanzoomSync()
      expect(() => applyTo(undefined)).not.toThrow()
    })

    it('applies the current transform to a fabric-like canvas', () => {
      const { onPanzoomChanged, applyTo } = usePanzoomSync()
      const fakeCanvas = {
        setViewportTransform: vi.fn(),
        requestRenderAll: vi.fn()
      }
      onPanzoomChanged({ x: 12, y: 34, scale: 2.5 })
      applyTo(fakeCanvas)
      expect(fakeCanvas.setViewportTransform).toHaveBeenCalledWith([
        2.5, 0, 0, 2.5, 12, 34
      ])
      expect(fakeCanvas.requestRenderAll).toHaveBeenCalledOnce()
    })

    it('applies the identity transform when state is fresh', () => {
      const { applyTo } = usePanzoomSync()
      const fakeCanvas = {
        setViewportTransform: vi.fn(),
        requestRenderAll: vi.fn()
      }
      applyTo(fakeCanvas)
      expect(fakeCanvas.setViewportTransform).toHaveBeenCalledWith([
        1, 0, 0, 1, 0, 0
      ])
    })
  })
})
```

**Step 2: Run the spec, verify it fails**

Run: `npx vitest run tests/unit/composables/panzoom.spec.js`

Expected: `Cannot find module '@/composables/panzoom'` (or similar import resolution error). All test cases fail to load.

**Step 3: Implement the composable**

Create `src/composables/panzoom.js`:

```js
import { ref } from 'vue'

export function usePanzoomSync() {
  const transform = ref({ x: 0, y: 0, scale: 1 })

  const onPanzoomChanged = ({ x, y, scale }) => {
    transform.value = { x, y, scale }
  }

  const reset = () => {
    transform.value = { x: 0, y: 0, scale: 1 }
  }

  const applyTo = fabricCanvas => {
    if (!fabricCanvas) return
    const { x, y, scale } = transform.value
    fabricCanvas.setViewportTransform([scale, 0, 0, scale, x, y])
    fabricCanvas.requestRenderAll()
  }

  return { transform, onPanzoomChanged, reset, applyTo }
}
```

**Step 4: Run the spec, verify it passes**

Run: `npx vitest run tests/unit/composables/panzoom.spec.js`

Expected: 7 tests pass, 0 fail.

**Step 5: Run the full test suite**

Run: `npm run test:unit`

Expected: all tests still pass (no regression).

**Step 6: Commit**

```bash
git add src/composables/panzoom.js tests/unit/composables/panzoom.spec.js
git commit -m "$(cat <<'EOF'
[composables] Add usePanzoomSync composable

Tracks the {x, y, scale} transform emitted by panzoom-enabled viewers,
exposes a reset helper, and an applyTo() helper that pushes the current
transform onto a fabric.js canvas via setViewportTransform.

To be consumed by SharedPlaylistPlayer (replacing duplicated state) and
later by PreviewPlayer when annotations become a live overlay.
EOF
)"
```

---

### Task 2: Adopt `usePanzoomSync` in `SharedPlaylistPlayer`

**Files:**
- Modify: `src/components/previews/SharedPlaylistPlayer.vue` (imports block + state declaration `:265` + handler `:608-610` + reset inside `watch(isZoomEnabled)` `:744`)

**Step 1: Add the composable import**

In the project libs/composables import block (`SharedPlaylistPlayer.vue:222`), add `usePanzoomSync` keeping the alphabetical order:

```js
import darkTimesliderUrl from '@/assets/background/video-timeslider-dark.png'
import { usePanzoomSync } from '@/composables/panzoom'
import { floorToFrame, formatTime } from '@/lib/video'
```

**Step 2: Replace the panzoom state with the composable**

In the `// State` section, replace the standalone `panzoomTransform` ref at `:265` with a composable destructure. The cleanest spot is just after the existing block of refs, before the boolean state group at `:268`.

Before (line 265):

```js
const panzoomTransform = ref({ x: 0, y: 0, scale: 1 })
```

After (replace by):

```js
const {
  transform: panzoomTransform,
  onPanzoomChanged,
  reset: resetPanzoomTransform
} = usePanzoomSync()
```

The alias `transform: panzoomTransform` preserves the template binding at `SharedPlaylistPlayer.vue:84` (`:panzoom-transform="panzoomTransform"`).

**Step 3: Remove the now-duplicate `onPanzoomChanged` handler**

Delete lines 608-610 entirely:

```js
const onPanzoomChanged = ({ x, y, scale }) => {
  panzoomTransform.value = { x, y, scale }
}
```

The composable's `onPanzoomChanged` (destructured in step 2) takes over — same name, same signature, same behavior. The template's `@panzoom-changed="onPanzoomChanged"` at `:32` keeps working unchanged.

**Step 4: Replace the inline reset inside `watch(isZoomEnabled)`**

At `SharedPlaylistPlayer.vue:744`, inside the `else` branch:

Before:

```js
target?.pausePanZoom?.()
target?.resetPanZoom?.()
panzoomTransform.value = { x: 0, y: 0, scale: 1 }
```

After:

```js
target?.pausePanZoom?.()
target?.resetPanZoom?.()
resetPanzoomTransform()
```

**Step 5: Run the full test suite**

Run: `npm run test:unit`

Expected: all tests pass (no spec for SharedPlaylistPlayer exists, but unrelated tests must not break — this is purely a refactor without behavior change).

**Step 6: Run the lint check**

Run: `npm run lint`

Expected: clean.

**Step 7: Manual smoke test**

Start dev server: `npm run dev`

Open a shared playlist (use a guest link to `/shared/playlists/<token>`). Reproduce:

- Toggle zoom (zoom button in the shared playlist UI) → confirm pan/zoom works.
- Draw an annotation on the picture in pan/zoom mode → annotation should follow the zoom transform when you pan or zoom (this is the existing behavior — refactor must preserve it).
- Toggle zoom off → transform resets to identity, annotation overlay re-aligns.
- Switch to next entity → transform stays at identity, annotation overlay tracks the new entity.

If the annotation does NOT track the zoom after this refactor, suspect the alias in step 2 — the template prop still has to receive the same `Ref`.

**Step 8: Commit**

```bash
git add src/components/previews/SharedPlaylistPlayer.vue
git commit -m "$(cat <<'EOF'
[previews] Adopt usePanzoomSync in SharedPlaylistPlayer

Replace the duplicated panzoomTransform ref + handler + manual reset
with usePanzoomSync. No behavior change.
EOF
)"
```

---

## Phase 2 — Fix bug + adopt in `PreviewPlayer` (modal preserved)

### Task 3: Fix `comparisonViewer.resumeZoom` bug in `PreviewPlayer`

**Why this is a separate commit:** the bug fix changes observable behavior (both viewers now zoom in comparison mode). Worth isolating from the refactor that follows.

**Files:**
- Modify: `src/components/previews/PreviewPlayer.vue:2095-2101` (`watch(isZoomPan)`)

**Step 1: Symmetrize the watcher**

At `PreviewPlayer.vue:2095-2101`:

Before:

```js
watch(isZoomPan, () => {
  if (isZoomPan.value) {
    previewViewer.value.resumeZoom()
  } else {
    previewViewer.value.pauseZoom()
  }
})
```

After:

```js
watch(isZoomPan, enabled => {
  const viewers = [previewViewer.value, comparisonViewer.value]
  if (enabled) {
    viewers.forEach(viewer => viewer?.resumeZoom())
  } else {
    viewers.forEach(viewer => {
      viewer?.pauseZoom()
      viewer?.resetZoom()
    })
  }
})
```

Note:
- The new watcher always pauses **and resets** both viewers when zoom-pan is turned off (the previous code only paused). This aligns with what `onAnnotationDisplayedClicked` already does at `:1454-1455`.
- The `?.` chaining covers the case where `comparisonViewer.value` is not mounted (no comparison preview loaded).

**Step 2: Run the full test suite**

Run: `npm run test:unit`

Expected: all tests pass.

**Step 3: Run the lint check**

Run: `npm run lint`

Expected: clean.

**Step 4: Manual smoke test (regression sensitive)**

Start dev server. Pick a task with a video preview AND a previous revision available (asset/shot with 2+ revisions).

- Enter full-screen OR `extraWide` mode (so `isComparisonEnabled` is true — see `PreviewPlayer.vue:792`).
- Activate comparison mode, pick the previous revision.
- Click the zoom-pan toggle → **both viewers** should accept mouse-wheel zoom and drag-pan (previous behavior: only the main viewer).
- Deactivate zoom-pan → both viewers reset to scale 1, positioned correctly.
- Repeat with a picture preview (jpg/png).
- Reactivate annotation mode (`isAnnotationsDisplayed` ON) → both canvases reappear correctly aligned with the (now reset) viewers.

If the comparison viewer no longer responds to the wheel/drag in zoom-pan mode, check that `PreviewViewer.resumeZoom` propagates to its inner `PictureViewer.resumePanZoom`/`VideoViewer.resumePanZoom` correctly. The fix relies on those methods being symmetric on both viewers — they are (`PreviewViewer.vue:412-415`).

**Step 5: Commit**

```bash
git add src/components/previews/PreviewPlayer.vue
git commit -m "$(cat <<'EOF'
[previews] Sync zoom-pan toggle across both viewers in PreviewPlayer

The isZoomPan watcher only resumed the main viewer, leaving the
comparison viewer frozen at scale 1 even when zoom-pan was activated.
Both viewers now resume/pause/reset together, matching the behavior
already enforced by onAnnotationDisplayedClicked.
EOF
)"
```

---

### Task 4: Adopt `usePanzoomSync` in `PreviewPlayer` (reset wiring only)

**Why minimal wiring:** in phase 2, the tracked transform is not yet consumed (the fabric canvas is hidden when zoom-pan is active). We add the composable instance and route the reset call into it, so the discipline is in place for phase 3. `onPanzoomChanged` and `applyTo` are not branched yet — YAGNI.

**Files:**
- Modify: `src/components/previews/PreviewPlayer.vue` (imports block + composable section + `watch(isZoomPan)` from task 3)

**Step 1: Add the composable import**

Locate the project libs/composables block at `PreviewPlayer.vue:382-390`. Add the import in alphabetical order:

```js
import { useAnnotation } from '@/composables/annotation'
import { usePanzoomSync } from '@/composables/panzoom'
import { getEntityPath } from '@/lib/path'
import localPreferences from '@/lib/preferences'
import {
  formatFrame,
  formatTime,
  roundToFrame,
  floorToFrame
} from '@/lib/video'
```

**Step 2: Instantiate the composable**

The composable section in this file is the "Annotation composable" block starting at `PreviewPlayer.vue:557`. Add the panzoom composable instantiation **just before** the `// Annotation composable` block — this keeps composables grouped per the CLAUDE.md section order (Composables → Props/Emits → State → Computed → …).

Insert just after the Vuex getters block (after `:556` `const userId = …` and the blank line that follows), before `// Annotation composable` at `:557`:

```js
// Panzoom transform sync
// Currently used only to reset state alongside viewer resets; the
// onPanzoomChanged / applyTo handles will be wired in phase 3 when
// annotations become a live overlay on top of the zoom transform.

const { reset: resetPanzoomTransform } = usePanzoomSync()
```

**Step 3: Route the reset through the composable**

Update the `watch(isZoomPan)` from task 3 to also reset the tracked transform when zoom-pan is turned off. After task 3 the watcher reads:

```js
watch(isZoomPan, enabled => {
  const viewers = [previewViewer.value, comparisonViewer.value]
  if (enabled) {
    viewers.forEach(viewer => viewer?.resumeZoom())
  } else {
    viewers.forEach(viewer => {
      viewer?.pauseZoom()
      viewer?.resetZoom()
    })
  }
})
```

Replace by:

```js
watch(isZoomPan, enabled => {
  const viewers = [previewViewer.value, comparisonViewer.value]
  if (enabled) {
    viewers.forEach(viewer => viewer?.resumeZoom())
  } else {
    viewers.forEach(viewer => {
      viewer?.pauseZoom()
      viewer?.resetZoom()
    })
    resetPanzoomTransform()
  }
})
```

**Step 4: Route the reset through the other zoom-reset paths**

Two other places explicitly reset the viewers' zoom and should reset the tracked transform too (even if not consumed in phase 2 — keeps the state coherent and phase 3 ready).

At `PreviewPlayer.vue:1450-1456`, `onAnnotationDisplayedClicked`:

Before:

```js
const onAnnotationDisplayedClicked = () => {
  clearFocus()
  isAnnotationsDisplayed.value = !isAnnotationsDisplayed.value
  isZoomPan.value = false
  previewViewer.value.resetZoom()
  comparisonViewer.value.resetZoom()
}
```

After:

```js
const onAnnotationDisplayedClicked = () => {
  clearFocus()
  isAnnotationsDisplayed.value = !isAnnotationsDisplayed.value
  isZoomPan.value = false
  previewViewer.value.resetZoom()
  comparisonViewer.value.resetZoom()
  resetPanzoomTransform()
}
```

At `PreviewPlayer.vue:2076-2086`, `watch(isAnnotationsDisplayed)`:

Before:

```js
watch(isAnnotationsDisplayed, () => {
  if (isAnnotationsDisplayed.value) {
    nextTick(() => {
      previewViewer.value.resetZoom()
      comparisonViewer.value.resetZoom()
    })
  }
  if (!isAnnotationsDisplayed.value) {
    isDrawing.value = false
  }
})
```

After:

```js
watch(isAnnotationsDisplayed, () => {
  if (isAnnotationsDisplayed.value) {
    nextTick(() => {
      previewViewer.value.resetZoom()
      comparisonViewer.value.resetZoom()
      resetPanzoomTransform()
    })
  }
  if (!isAnnotationsDisplayed.value) {
    isDrawing.value = false
  }
})
```

Note: setting `isZoomPan.value = false` in `onAnnotationDisplayedClicked` will *also* trigger the `watch(isZoomPan)` from step 3, which already calls `resetPanzoomTransform()`. The explicit call here is redundant in that path but defensive — `watch(isZoomPan)` only fires when the value actually changes, so if `isZoomPan` was already false (user clicked annotation toggle without zoom-pan being active), the explicit call guarantees the transform is at identity.

**Step 5: Run the full test suite**

Run: `npm run test:unit`

Expected: all tests pass.

**Step 6: Run the lint check**

Run: `npm run lint`

Expected: clean.

**Step 7: Manual smoke test**

Same scenarios as task 3 (zoom-pan toggle, comparison mode) — no observable change relative to the end of task 3, since the tracked transform is not yet displayed anywhere. The goal here is just to confirm no regression was introduced.

**Step 8: Commit**

```bash
git add src/components/previews/PreviewPlayer.vue
git commit -m "$(cat <<'EOF'
[previews] Wire usePanzoomSync reset hooks in PreviewPlayer

Instantiate usePanzoomSync and call resetPanzoomTransform alongside the
existing viewer-reset paths (isZoomPan watcher, isAnnotationsDisplayed
watcher, onAnnotationDisplayedClicked). The tracked transform is not yet
consumed by anything visible — onPanzoomChanged and applyTo land in
phase 3 when annotations become a live overlay.
EOF
)"
```

---

## Done criteria

- `tests/unit/composables/panzoom.spec.js` exists and passes (7 tests).
- `src/composables/panzoom.js` exists, exports `usePanzoomSync`.
- `SharedPlaylistPlayer.vue` no longer declares its own `panzoomTransform` ref nor its inline `onPanzoomChanged` handler. The template still binds `:panzoom-transform="panzoomTransform"` and `@panzoom-changed="onPanzoomChanged"`.
- `PreviewPlayer.vue` imports and instantiates `usePanzoomSync`, calls `resetPanzoomTransform()` at the three zoom-reset paths listed in task 4.
- `watch(isZoomPan)` in `PreviewPlayer.vue` resumes and resets **both** viewers, not just the main one.
- `npm run test:unit` and `npm run lint` both green.
- Manual: shared-playlist guest annotations still follow zoom; PreviewPlayer comparison mode now zooms both viewers symmetrically.

## Out of scope (phase 3 — separate plan)

- Branching `onPanzoomChanged` on the main viewer in PreviewPlayer.
- Removing `v-show="!isZoomPan && …"` on `canvas-wrapper` / `canvas-comparison-wrapper`.
- Calling `applyPanzoomToCanvas(transform)` from `useAnnotation` so the fabric canvases follow the live transform.
- Synchronizing the comparison viewer's underlying panzoom on the main viewer (via `PictureViewer.setPanZoom`).
- Recomputing the position of `canvas-comparison-wrapper` so the live transform stays aligned with the comparison viewer's shifted layout.
