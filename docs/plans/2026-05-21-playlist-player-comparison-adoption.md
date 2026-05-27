# PlaylistPlayer Comparison Adoption — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `PlaylistPlayer.vue` adopt the existing `PlayerComparisonBar` template and introduce a new `usePlaylistComparison` composable that absorbs PlaylistPlayer's inline comparison logic, reusing the shared bits of `useComparison`.

**Architecture:** A new `src/composables/playlistComparison.js` owns the playlist-specific comparison state (`revisionToCompare`, `entityListToCompare`, `comparisonEntityMissing`, `currentComparisonPreviewIndex`) and computeds (`taskTypeOptions`, `revisionOptions`, `currentRevisionToCompare`, `currentPreviewToCompare`, `currentComparisonPreviewLength`, `comparisonAnnotations`). It internally instantiates `useComparison` from `@/composables/comparison` — feeding it `entityPreviewFiles = computed(() => currentEntity.value?.preview_files || {})` — to reuse `comparisonModeOptions`, `comparisonMode`, `isComparing`, `taskTypeId`, `isComparisonOverlay`, `overlayOpacity`, and `toggleFullOverlay`. `PlayerComparisonBar.vue` gains a `#missing` slot (rendered after the comboboxes) so the playlist can show its "⚠️ comparing_missing_plan" warning without polluting the bar's API. PlaylistPlayer.vue's inline functions (`getComparisonTaskTypeOptions`, `rebuildComparisonOptions`, `rebuildRevisionOptions`, `rebuildEntityListToCompare`, `resetComparison`, `onCompareClicked`, `onPreviousComparisonPictureClicked`, `onNextComparisonPictureClicked`, `onTaskTypeToCompareChanged`, `onRevisionToCompareChanged`, `saveUserComparisonChoice`, `toggleFullOverlayComparison`) and their associated refs are removed in favor of the composable.

**Tech Stack:** Vue 3 (`<script setup>`), Vuex 4, Vitest + jsdom (`tests/unit/composables/`).

**Out of scope:** Steps 2 (PlayerPlaybackBar) and 3 (PlayerAnnotationBar) of the design doc. The backlog items "show annotations while playing" and "handle-in/out" in PreviewPlayer.

---

## Pre-flight

Before starting, confirm:

```bash
cd /home/frankrousseau/projets/products/kitsu
git status
```

Expected: working tree clean for `src/components/pages/playlists/PlaylistPlayer.vue` and `src/components/previews/PlayerComparisonBar.vue` (the People-related files and untracked items may remain).

Run the existing test suite once to know the baseline:

```bash
npm run test:unit
```

Expected: all tests pass.

---

## Task 1 — Add `#missing` slot to `PlayerComparisonBar`

**Files:**
- Modify: `src/components/previews/PlayerComparisonBar.vue`

**Step 1: Decide placement.** The slot renders inside the outer `<div class="flexrow flexrow-item" v-if="!isConcept">`, after the navigation buttons (lines 36-58 of the current file), so the warning sits next to the index counter.

**Step 2: Add the slot.** Insert these lines just before the closing `</div>` at line 59:

```vue
    <slot name="missing" />
```

**Step 3: Verify no test/snapshot regression.**

Run: `npm run test:unit -- previews 2>/dev/null || npm run test:unit`
Expected: PASS.

**Step 4: Commit.**

```bash
git add src/components/previews/PlayerComparisonBar.vue
git commit -m "[previews] Add #missing slot to PlayerComparisonBar"
```

---

## Task 2 — Stub `usePlaylistComparison` + first failing test (TDD red)

**Files:**
- Create: `src/composables/playlistComparison.js`
- Create: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write the first failing test.** Initialization should expose the expected refs/computeds.

```js
// tests/unit/composables/playlistComparison.spec.js
import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { usePlaylistComparison } from '@/composables/playlistComparison'

const makeInputs = ({
  entityList = [],
  playingEntityIndex = 0,
  taskTypeMap = new Map()
} = {}) => {
  const entityListRef = ref(entityList)
  const playingEntityIndexRef = ref(playingEntityIndex)
  const currentEntity = computed(
    () => entityListRef.value[playingEntityIndexRef.value] || null
  )
  return {
    entityList: entityListRef,
    playingEntityIndex: playingEntityIndexRef,
    currentEntity,
    taskTypeMap: ref(taskTypeMap),
    t: key => key
  }
}

describe('composables/playlistComparison', () => {
  describe('initial state', () => {
    it('starts not comparing, with empty option lists', () => {
      const c = usePlaylistComparison(makeInputs())
      expect(c.isComparing.value).toBe(false)
      expect(c.taskTypeOptions.value).toEqual([])
      expect(c.revisionOptions.value).toEqual([])
      expect(c.entityListToCompare.value).toEqual([])
      expect(c.comparisonEntityMissing.value).toBe(false)
      expect(c.revisionToCompare.value).toBe(null)
      expect(c.taskTypeId.value).toBe('')
      expect(c.comparisonMode.value).toBe('sidebyside')
    })
  })
})
```

**Step 2: Run to verify it fails.**

```bash
npx vitest run tests/unit/composables/playlistComparison.spec.js
```

Expected: FAIL — `Cannot find module '@/composables/playlistComparison'`.

**Step 3: Create the minimal composable to make it pass.**

```js
// src/composables/playlistComparison.js
/*
 * Composable for the PlaylistPlayer's comparison mode.
 *
 * Owns the playlist-specific comparison state (revision selection
 * per-entity, entity-list-to-compare, comparison-entity-missing flag,
 * picture-index inside the compared revision) and reuses the generic
 * primitives from useComparison (mode options, overlay math, the
 * shared `isComparing` / `taskTypeId` / `comparisonMode` refs and the
 * toggle-full-overlay helper).
 */
import { computed, ref } from 'vue'

import { useComparison } from '@/composables/comparison'

export const usePlaylistComparison = ({
  currentEntity,
  entityList,
  taskTypeMap,
  t
}) => {
  // Shared base — feed useComparison the current entity's preview files
  // so its taskTypeOptions logic (which we don't use) sees something
  // coherent, and so its comparisonModeOptions/overlay computeds stay
  // accurate.
  const entityPreviewFiles = computed(
    () => currentEntity.value?.preview_files || {}
  )
  const currentPreview = ref(null) // unused by playlist mode, satisfies useComparison shape
  const base = useComparison({
    entityPreviewFiles,
    currentPreview,
    taskTypeMap,
    t
  })

  // Playlist-specific state
  const revisionToCompare = ref(null)
  const entityListToCompare = ref([])
  const comparisonEntityMissing = ref(false)
  const currentComparisonPreviewIndex = ref(0)
  const savedTaskTypeToCompare = ref(null)

  // Playlist-specific computeds (placeholders, filled in subsequent tasks)
  const taskTypeOptions = ref([])
  const revisionOptions = ref([])

  return {
    // Shared from useComparison
    isComparing: base.isComparing,
    taskTypeId: base.taskTypeId,
    comparisonMode: base.comparisonMode,
    comparisonModeOptions: base.comparisonModeOptions,
    isComparisonOverlay: base.isComparisonOverlay,
    overlayOpacity: base.overlayOpacity,
    toggleFullOverlay: base.toggleFullOverlay,

    // Playlist-specific state
    revisionToCompare,
    entityListToCompare,
    comparisonEntityMissing,
    currentComparisonPreviewIndex,
    savedTaskTypeToCompare,

    // Playlist-specific computeds (filled in next tasks)
    taskTypeOptions,
    revisionOptions
  }
}
```

**Step 4: Run to verify the test passes.**

```bash
npx vitest run tests/unit/composables/playlistComparison.spec.js
```

Expected: PASS — 1 test.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] Add usePlaylistComparison scaffold"
```

---

## Task 3 — Build `taskTypeOptions` from `currentEntity.preview_files`

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write a failing test.** The options come from the current entity's `preview_files` keys, sorted descending by task-type name (matches PlaylistPlayer:3352-3353).

```js
  describe('taskTypeOptions', () => {
    it('lists task types from currentEntity.preview_files sorted by name desc', () => {
      const ttMap = new Map([
        ['tt-anim', { id: 'tt-anim', name: 'Animation' }],
        ['tt-lay', { id: 'tt-lay', name: 'Layout' }],
        ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
      ])
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }],
          'tt-lay': [{ id: 'p2', revision: 1, extension: 'mp4' }],
          'tt-comp': [{ id: 'p3', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({ entityList: [entity], taskTypeMap: ttMap })
      )
      expect(c.taskTypeOptions.value).toEqual([
        { label: 'Layout', value: 'tt-lay' },
        { label: 'Compositing', value: 'tt-comp' },
        { label: 'Animation', value: 'tt-anim' }
      ])
    })

    it('returns [] when currentEntity is null', () => {
      const c = usePlaylistComparison(makeInputs())
      expect(c.taskTypeOptions.value).toEqual([])
    })

    it('skips task types absent from taskTypeMap', () => {
      const entity = {
        preview_files: {
          'tt-known': [{ id: 'p1', revision: 1, extension: 'mp4' }],
          'tt-unknown': [{ id: 'p2', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-known', { id: 'tt-known', name: 'Anim' }]])
        })
      )
      expect(c.taskTypeOptions.value).toEqual([
        { label: 'Anim', value: 'tt-known' }
      ])
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL on `taskTypeOptions` length / content.

**Step 3: Replace the placeholder `taskTypeOptions` ref with a computed.** In `src/composables/playlistComparison.js`, replace `const taskTypeOptions = ref([])` with:

```js
  const taskTypeOptions = computed(() => {
    const entity = currentEntity.value
    if (!entity?.preview_files) return []
    const map = taskTypeMap.value
    return Object.keys(entity.preview_files)
      .filter(id => entity.preview_files[id] && map.get(id))
      .map(id => ({ label: map.get(id).name, value: id }))
      .sort(
        (a, b) => -a.label.localeCompare(b.label, undefined, { numeric: true })
      )
  })
```

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 4 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison taskTypeOptions"
```

---

## Task 4 — Build `revisionOptions` for the selected task-type

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write a failing test.** Revisions come from the current entity's preview files for the selected `taskTypeId`, prepended with `{ label: 'Last', value: null }` (matches PlaylistPlayer:3392-3397).

```js
  describe('revisionOptions', () => {
    it('lists revisions for the selected task type, descending, with Last prepended', () => {
      const entity = {
        preview_files: {
          'tt-anim': [
            { id: 'p1', revision: 1, extension: 'mp4' },
            { id: 'p3', revision: 3, extension: 'mp4' },
            { id: 'p2', revision: 2, extension: 'mp4' }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.revisionOptions.value).toEqual([
        { label: 'Last', value: null },
        { label: 'v3', value: '3' },
        { label: 'v2', value: '2' },
        { label: 'v1', value: '1' }
      ])
    })

    it('returns [] when the selected task type has no preview files for the current entity', () => {
      const entity = { preview_files: {} }
      const c = usePlaylistComparison(
        makeInputs({ entityList: [entity], taskTypeMap: new Map() })
      )
      c.taskTypeId.value = 'tt-missing'
      expect(c.revisionOptions.value).toEqual([])
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL on `revisionOptions`.

**Step 3: Replace the placeholder `revisionOptions` ref with a computed.** In `src/composables/playlistComparison.js`, replace `const revisionOptions = ref([])` with:

```js
  const revisionOptions = computed(() => {
    const entity = currentEntity.value
    const files = entity?.preview_files?.[base.taskTypeId.value]
    if (!files) return []
    const revisions = files.map(p => p.revision).sort((a, b) => b - a)
    return [
      { label: 'Last', value: null },
      ...revisions.map(r => ({ label: `v${r}`, value: `${r}` }))
    ]
  })
```

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 6 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison revisionOptions"
```

---

## Task 5 — Build `entityListToCompare`

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write a failing test.** The mapping is one-per-entity-in-the-playlist, resolves to the preview matching `revisionToCompare` for the selected task-type, falling back to the first preview if the revision doesn't exist on that entity, and returns `{ preview_file_id: '', preview_file_extension: 'none' }` for entities without any preview files (matches PlaylistPlayer:3406-3437).

```js
  describe('entityListToCompare', () => {
    it('maps each playlist entity to its matching preview for the selected revision', () => {
      const entityA = {
        preview_files: {
          'tt-anim': [
            { id: 'a1', revision: 1, extension: 'mp4' },
            { id: 'a2', revision: 2, extension: 'mp4' }
          ]
        }
      }
      const entityB = {
        preview_files: {
          'tt-anim': [{ id: 'b1', revision: 1, extension: 'png' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entityA, entityB],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      c.revisionToCompare.value = '2'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: 'a2', preview_file_extension: 'mp4' },
        // entity B has no revision 2 → fall back to its first preview
        { preview_file_id: 'b1', preview_file_extension: 'png' }
      ])
    })

    it('returns a "none" placeholder for entities without any preview files', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [{ preview_files: {} }],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: '', preview_file_extension: 'none' }
      ])
    })

    it('falls back to the first task-type when the selected one is missing on that entity', () => {
      const entity = {
        preview_files: {
          'tt-other': [{ id: 'o1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      expect(c.entityListToCompare.value).toEqual([
        { preview_file_id: 'o1', preview_file_extension: 'mp4' }
      ])
    })

    it('returns [] when no task type is selected', () => {
      const c = usePlaylistComparison(makeInputs({ entityList: [{}, {}] }))
      expect(c.entityListToCompare.value).toEqual([])
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL on `entityListToCompare`.

**Step 3: Replace the placeholder `entityListToCompare` ref with a computed.**

```js
  const entityListToCompare = computed(() => {
    if (!base.taskTypeId.value) return []
    return entityList.value.map(entity => {
      const previewFiles = entity?.preview_files
      if (!previewFiles || Object.keys(previewFiles).length === 0) {
        return { preview_file_id: '', preview_file_extension: 'none' }
      }
      let key = base.taskTypeId.value
      let files = previewFiles[key]
      if (!files) {
        key = Object.keys(previewFiles)[0]
        files = previewFiles[key]
      }
      if (!files) return null
      let preview = files.find(p => `${p.revision}` === revisionToCompare.value)
      if (!preview) preview = files[0]
      return {
        preview_file_id: preview.id,
        preview_file_extension: preview.extension
      }
    })
  })
```

(Remove the previous `const entityListToCompare = ref([])` line.)

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 10 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison entityListToCompare"
```

---

## Task 6 — `comparisonEntityMissing` derived flag

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write a failing test.** Flag becomes true when the saved task-type doesn't appear in the current entity's available task-types (PlaylistPlayer:3357-3374).

```js
  describe('comparisonEntityMissing', () => {
    it('is true when the saved task-type is not available on the current entity', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-comp' // not available
      expect(c.comparisonEntityMissing.value).toBe(true)
    })

    it('is false when the saved task-type is available', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-anim'
      expect(c.comparisonEntityMissing.value).toBe(false)
    })

    it('is false when no saved task-type has been set yet', () => {
      const entity = {
        preview_files: {
          'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      expect(c.comparisonEntityMissing.value).toBe(false)
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL (the flag is still a ref).

**Step 3: Replace `const comparisonEntityMissing = ref(false)` with a computed.**

```js
  const comparisonEntityMissing = computed(() => {
    if (!savedTaskTypeToCompare.value) return false
    if (taskTypeOptions.value.length === 0) return false
    return !taskTypeOptions.value.some(
      o => o.value === savedTaskTypeToCompare.value
    )
  })
```

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 13 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison comparisonEntityMissing"
```

---

## Task 7 — `currentRevisionToCompare`, `currentPreviewToCompare`, `currentComparisonPreviewLength`, `comparisonAnnotations`

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write failing tests.** These mirror PlaylistPlayer:1536-1576.

```js
  describe('current revision / preview / length / annotations', () => {
    const setup = ({ revision = null, index = 0 } = {}) => {
      const entity = {
        preview_files: {
          'tt-anim': [
            {
              id: 'p1',
              revision: 1,
              extension: 'mp4',
              annotations: [{ id: 'ann-1' }],
              previews: [{ id: 'p1-prev' }]
            },
            { id: 'p2', revision: 2, extension: 'mp4', annotations: [] }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      c.revisionToCompare.value = revision
      c.currentComparisonPreviewIndex.value = index
      return c
    }

    it('resolves currentRevisionToCompare to the matching preview', () => {
      const c = setup({ revision: '2' })
      expect(c.currentRevisionToCompare.value.id).toBe('p2')
    })

    it('falls back to the first preview when the revision is not found', () => {
      const c = setup({ revision: '99' })
      expect(c.currentRevisionToCompare.value.id).toBe('p1')
    })

    it('currentPreviewToCompare returns the indexed sub-preview when index > 0', () => {
      const c = setup({ revision: '1', index: 1 })
      expect(c.currentPreviewToCompare.value.id).toBe('p1-prev')
    })

    it('currentPreviewToCompare returns the revision itself when index = 0', () => {
      const c = setup({ revision: '1', index: 0 })
      expect(c.currentPreviewToCompare.value.id).toBe('p1')
    })

    it('currentComparisonPreviewLength counts sub-previews + 1', () => {
      const c = setup({ revision: '1' })
      expect(c.currentComparisonPreviewLength.value).toBe(2)
    })

    it('currentComparisonPreviewLength is 0 when there are no sub-previews', () => {
      const c = setup({ revision: '2' })
      expect(c.currentComparisonPreviewLength.value).toBe(0)
    })

    it('comparisonAnnotations is [] when not comparing', () => {
      const c = setup({ revision: '1' })
      expect(c.comparisonAnnotations.value).toEqual([])
    })

    it('comparisonAnnotations returns the revision annotations when comparing', () => {
      const c = setup({ revision: '1' })
      c.isComparing.value = true
      expect(c.comparisonAnnotations.value).toEqual([{ id: 'ann-1' }])
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL (computeds don't exist yet).

**Step 3: Add the computeds in `src/composables/playlistComparison.js`.** Insert before the `return` block:

```js
  const currentRevisionToCompare = computed(() => {
    const entity = currentEntity.value
    const files = entity?.preview_files?.[base.taskTypeId.value]
    if (!files || files.length === 0) return null
    const match = files.find(p => `${p.revision}` === revisionToCompare.value)
    return match || files[0]
  })

  const currentPreviewToCompare = computed(() => {
    const revision = currentRevisionToCompare.value
    if (!revision) return null
    if (currentComparisonPreviewIndex.value > 0) {
      return revision.previews?.[currentComparisonPreviewIndex.value - 1] || null
    }
    return revision
  })

  const currentComparisonPreviewLength = computed(() => {
    const revision = currentRevisionToCompare.value
    if (!revision) return 0
    const previews = revision.previews
    return previews ? previews.length + 1 : 0
  })

  const comparisonAnnotations = computed(() =>
    base.isComparing.value && currentRevisionToCompare.value
      ? currentRevisionToCompare.value.annotations || []
      : []
  )
```

Add them to the `return` object:

```js
    currentRevisionToCompare,
    currentPreviewToCompare,
    currentComparisonPreviewLength,
    comparisonAnnotations
```

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 21 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison current preview helpers"
```

---

## Task 8 — `toggleComparison` and saved-choice persistence

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write failing tests.** Toggling on selects the first available task type, restores `savedTaskTypeToCompare` if available (else flips `comparisonEntityMissing`), and selects "Last" (`null`) revision. Toggling off clears the flag (PlaylistPlayer:2584-2591 + 3365-3382).

```js
  describe('toggleComparison', () => {
    const entity = {
      preview_files: {
        'tt-anim': [{ id: 'p1', revision: 1, extension: 'mp4' }],
        'tt-comp': [{ id: 'p2', revision: 1, extension: 'mp4' }]
      }
    }

    it('turns comparison on and picks the saved task-type when available', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }],
            ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
          ])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-anim'
      c.toggleComparison()
      expect(c.isComparing.value).toBe(true)
      expect(c.taskTypeId.value).toBe('tt-anim')
      expect(c.revisionToCompare.value).toBe(null)
    })

    it('falls back to the first option and flags missing when saved is unavailable', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }],
            ['tt-comp', { id: 'tt-comp', name: 'Compositing' }]
          ])
        })
      )
      c.savedTaskTypeToCompare.value = 'tt-lay' // not available
      c.toggleComparison()
      expect(c.isComparing.value).toBe(true)
      // Sort is descending, so first option is "Compositing"
      expect(c.taskTypeId.value).toBe('tt-comp')
      expect(c.comparisonEntityMissing.value).toBe(true)
    })

    it('turns comparison off and clears the missing flag', () => {
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([
            ['tt-anim', { id: 'tt-anim', name: 'Anim' }]
          ])
        })
      )
      c.toggleComparison()
      c.toggleComparison()
      expect(c.isComparing.value).toBe(false)
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL — `c.toggleComparison is not a function`.

**Step 3: Implement `toggleComparison` in `src/composables/playlistComparison.js`.** Insert before the `return` block:

```js
  const toggleComparison = () => {
    if (base.isComparing.value) {
      base.isComparing.value = false
      return
    }
    if (taskTypeOptions.value.length === 0) {
      base.isComparing.value = true
      return
    }
    base.isComparing.value = true
    const saved = savedTaskTypeToCompare.value
    const isAvailable = taskTypeOptions.value.some(o => o.value === saved)
    base.taskTypeId.value = isAvailable
      ? saved
      : taskTypeOptions.value[0].value
    revisionToCompare.value = null
  }
```

Add `toggleComparison` to the `return` object.

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 24 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison toggleComparison"
```

---

## Task 9 — `goToPreviousComparisonPicture` / `goToNextComparisonPicture`

**Files:**
- Modify: `src/composables/playlistComparison.js`
- Modify: `tests/unit/composables/playlistComparison.spec.js`

**Step 1: Write failing tests.** They wrap around `currentComparisonPreviewLength` (PlaylistPlayer:3552-3564).

```js
  describe('comparison picture navigation', () => {
    const setup = () => {
      const entity = {
        preview_files: {
          'tt-anim': [
            {
              id: 'p1',
              revision: 1,
              extension: 'png',
              previews: [{ id: 'sub-1' }, { id: 'sub-2' }]
            }
          ]
        }
      }
      const c = usePlaylistComparison(
        makeInputs({
          entityList: [entity],
          taskTypeMap: new Map([['tt-anim', { id: 'tt-anim', name: 'Anim' }]])
        })
      )
      c.taskTypeId.value = 'tt-anim'
      return c
    }

    it('next: 0 -> 1 -> 2 -> 0', () => {
      const c = setup()
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(1)
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(2)
      c.goToNextComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(0)
    })

    it('previous: 0 -> 2 -> 1 -> 0', () => {
      const c = setup()
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(2)
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(1)
      c.goToPreviousComparisonPicture()
      expect(c.currentComparisonPreviewIndex.value).toBe(0)
    })
  })
```

**Step 2: Run to verify it fails.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: FAIL — functions undefined.

**Step 3: Implement and export.**

```js
  const goToPreviousComparisonPicture = () => {
    const index = currentComparisonPreviewIndex.value - 1
    currentComparisonPreviewIndex.value =
      index < 0 ? currentComparisonPreviewLength.value - 1 : index
  }

  const goToNextComparisonPicture = () => {
    const index = currentComparisonPreviewIndex.value + 1
    currentComparisonPreviewIndex.value =
      index > currentComparisonPreviewLength.value - 1 ? 0 : index
  }
```

Add both to the `return` object.

**Step 4: Run to verify passing.**

Run: `npx vitest run tests/unit/composables/playlistComparison.spec.js`
Expected: PASS — 26 tests.

**Step 5: Commit.**

```bash
git add src/composables/playlistComparison.js tests/unit/composables/playlistComparison.spec.js
git commit -m "[composables] usePlaylistComparison picture navigation"
```

---

## Task 10 — Wire `usePlaylistComparison` into `PlaylistPlayer.vue` script

**Files:**
- Modify: `src/components/pages/playlists/PlaylistPlayer.vue`

This task swaps the script-side state and helpers. The template still uses the inline button bar (next task handles the template). Expect a ~150-200-line reduction.

**Step 1: Add the import** at the top of `<script setup>`, alphabetically inside the composables block:

```js
import { usePlaylistComparison } from '@/composables/playlistComparison'
```

**Step 2: Replace the comparison refs and inline helpers.**

Delete these refs (around lines 1251-1254, 1297-1298, 1303, 1306-1307):

```js
const comparisonEntityMissing = ref(false)
const comparisonMode = ref('sidebyside')
const currentComparisonPreviewIndex = ref(0)
const revisionOptions = ref([])
const revisionToCompare = ref(null)
const savedTaskTypeToCompare = ref(null)
const taskTypeOptions = ref([])
const taskTypeToCompare = ref(null)
```

Delete these computeds (around lines 1514-1576, 1611-1618):

```js
const isComparisonOverlay = computed(...)
const overlayOpacity = computed(...)
const currentRevisionToCompare = computed(...)
const currentPreviewToCompare = computed(...)
const currentComparisonPreviewLength = computed(...)
const comparisonAnnotations = computed(...)
const comparisonModeOptions = computed(...)
const isComparing = ref(false)  // if present near top
```

Delete these functions:
- `getComparisonTaskTypeOptions` (lines 3342-3355)
- `isComparisonTaskTypeAvailable` (3357-3363)
- `rebuildComparisonOptions` (3365-3382)
- `rebuildRevisionOptions` (3384-3404)
- `rebuildEntityListToCompare` (3406-3437)
- `resetComparison` (3439-3448)
- `onCompareClicked` (2584-2591)
- `onPreviousComparisonPictureClicked` (3552-3557)
- `onNextComparisonPictureClicked` (3559-3564)
- `onTaskTypeToCompareChanged` (3566-3570)
- `onRevisionToCompareChanged` (3572-3584)
- `saveUserComparisonChoice` (3620-3623)
- `toggleFullOverlayComparison` (2484-2495)

Also delete `entityListToCompare` ref (line 1247) and `isComparing` ref where it lives.

**Step 3: Instantiate the composable** just before the annotation composable block (around line 1706, before `useAnnotationBroadcast`):

```js
// Comparison composable

const {
  isComparing,
  taskTypeId: taskTypeToCompare,
  comparisonMode,
  comparisonModeOptions,
  isComparisonOverlay,
  overlayOpacity,
  toggleFullOverlay: toggleFullOverlayComparison,
  revisionToCompare,
  entityListToCompare,
  comparisonEntityMissing,
  currentComparisonPreviewIndex,
  savedTaskTypeToCompare,
  taskTypeOptions,
  revisionOptions,
  currentRevisionToCompare,
  currentPreviewToCompare,
  currentComparisonPreviewLength,
  comparisonAnnotations,
  toggleComparison,
  goToPreviousComparisonPicture,
  goToNextComparisonPicture
} = usePlaylistComparison({
  currentEntity,
  entityList,
  taskTypeMap,
  t
})
```

**Step 4: Reintroduce the side-effect wrappers that PlaylistPlayer still needs** (the composable is pure — broadcasts and player re-loads stay in the component):

```js
const onCompareClicked = () => {
  toggleComparison()
  nextTick(() => {
    if (isComparing.value) saveUserComparisonChoice()
  })
  updateRoomStatus()
}

const saveUserComparisonChoice = () => {
  savedTaskTypeToCompare.value = taskTypeToCompare.value
  sendUpdatePlayingStatus()
}

const onTaskTypeToCompareChanged = () => {
  saveUserComparisonChoice()
  updateRoomStatus()
}

const onRevisionToCompareChanged = () => {
  if (isComparing.value) {
    nextTick(() => {
      pause()
      rawPlayerComparison.value?.loadEntity(playingEntityIndex.value)
      rawPlayerComparison.value?.setCurrentTimeRaw(currentTimeRaw.value)
      updateRoomStatus()
    })
  }
}

const onPreviousComparisonPictureClicked = () => {
  goToPreviousComparisonPicture()
  updateRoomStatus()
}

const onNextComparisonPictureClicked = () => {
  goToNextComparisonPicture()
  updateRoomStatus()
}

const resetComparison = () => {
  nextTick(() => {
    rawPlayerComparison.value?.loadEntity(playingEntityIndex.value)
    nextTick(() => {
      setTimeout(() => syncComparisonPlayer(), 100)
      if (isPlaying.value) play()
    })
  })
}
```

These keep the broadcast and player-sync side-effects in the component where they belong.

**Step 5: Run tests + lint.**

```bash
npm run test:unit
```

Expected: PASS (existing tests still green, new composable tests pass).

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue src/composables/playlistComparison.js
```

Expected: PASS.

**Step 6: Start the dev server** (in another shell) and smoke-test:

```bash
npm run dev
```

Open a playlist with at least 2 entities, hit "compare":
- Toggle on → comparison shows; toggle off → hides.
- Switch task-type combobox → entity list rebuilds; comparison viewer reloads with new previews.
- Switch revision combobox ("Last" / "v1" / ...) → comparison viewer reloads at the right revision.
- Switch mode (sidebyside / overlay 0/25/50/75/100) → opacity changes.
- For picture sequences with multiple sub-previews: previous/next picture buttons cycle through them.
- Try a playlist where one entity is missing the saved task-type → the comparing_missing warning should appear (next task hooks it into the template).

If something doesn't work, do **not** add a commit. Diagnose and fix before continuing.

**Step 7: Commit when the smoke test passes.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Adopt usePlaylistComparison composable"
```

---

## Task 11 — Adopt `<PlayerComparisonBar>` in the template

**Files:**
- Modify: `src/components/pages/playlists/PlaylistPlayer.vue`

This task replaces the inline comparison block (lines ~630-694) with `<player-comparison-bar>` + the `#missing` slot. Expect a ~70-line template reduction and a removal of the now-unused `combobox` widget import for that block.

**Step 1: Add the import** in the components import block:

```js
import PlayerComparisonBar from '@/components/previews/PlayerComparisonBar.vue'
```

**Step 2: Locate the inline block.** It starts with `<button-simple ... icon="compare" @click="onCompareClicked"` and ends just before the closing `</div>` of the parent `<div class="flexrow flexrow-item comparison-buttons">`.

**Step 3: Replace it** with:

```vue
<player-comparison-bar
  :comparison-mode-options="comparisonModeOptions"
  :comparison-preview-index="currentComparisonPreviewIndex"
  :comparison-preview-length="currentComparisonPreviewLength"
  :is-comparing="isComparing"
  :is-comparison-enabled="true"
  :is-movie="isCurrentPreviewMovie"
  :is-sound="isCurrentPreviewSound"
  :preview-file-options="revisionOptions"
  :task-type-options="taskTypeOptions"
  v-model:comparison-mode="comparisonMode"
  v-model:preview-to-compare-id="revisionToCompare"
  v-model:task-type-id="taskTypeToCompare"
  @compare-clicked="onCompareClicked"
  @previous-comparison-clicked="onPreviousComparisonPictureClicked"
  @next-comparison-clicked="onNextComparisonPictureClicked"
>
  <template #missing>
    <div
      class="flexrow flexrow-item comparison-missing"
      v-if="isComparing && comparisonEntityMissing"
    >
      ⚠️ {{ $t('playlists.comparing_missing_plan') }}
    </div>
  </template>
</player-comparison-bar>
```

**Step 4: Hook the change-callbacks** that the inline block had on the combos (`@update:model-value="onTaskTypeToCompareChanged"` and `@update:model-value="onRevisionToCompareChanged"`). Since `PlayerComparisonBar` doesn't forward them, use Vue watchers on the v-models — but a less-intrusive option is to **rename the destructured refs in the composable instantiation** so PlaylistPlayer can put a `watch` on them.

Add these watchers in the `<script setup>`, near the other watchers:

```js
watch(taskTypeToCompare, (newVal, oldVal) => {
  if (newVal && oldVal !== null && newVal !== oldVal) {
    onTaskTypeToCompareChanged()
  }
})

watch(revisionToCompare, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    onRevisionToCompareChanged()
  }
})

watch(comparisonMode, () => {
  if (isComparing.value) updateRoomStatus()
})
```

**Step 5: Run lint + tests.**

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
npm run test:unit
```

Expected: PASS.

**Step 6: Dev-server smoke test** (same checklist as Task 10 step 6). Spend an extra minute on:
- The "⚠️ comparing_missing_plan" warning appears when expected (open a playlist with at least one entity missing the saved task-type → switch to that entity).
- Comparison mode change triggers the room broadcast (open the dev console; you should see the same socket call as before).
- Picture sub-preview navigation still works (previous/next inside a multi-preview revision).

**Step 7: Commit when the smoke test passes.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Adopt PlayerComparisonBar in the template"
```

---

## Task 12 — Final cleanup pass

**Files:**
- Modify: `src/components/pages/playlists/PlaylistPlayer.vue` (only if dead code remains)

**Step 1: Search for now-unused imports** in `PlaylistPlayer.vue` (likely `Combobox` if it was only used by the comparison block — check, it may still be used elsewhere). Remove anything no longer referenced.

```bash
npx eslint src/components/pages/playlists/PlaylistPlayer.vue
```

Expected: no warnings about unused imports.

**Step 2: Verify the line count drop.**

```bash
wc -l src/components/pages/playlists/PlaylistPlayer.vue
```

Expected: ~250-400 lines fewer than the starting 4843 (so ~4450-4600). If the reduction is smaller than ~150, something was missed — re-check the deletions in Task 10 step 2.

**Step 3: Run the full test suite.**

```bash
npm run test:unit
```

Expected: PASS.

**Step 4: Final manual smoke pass.** Run through the checklist from Task 10 step 6 once more, with comparison **on** during a real playback (play, pause, scrub, change entity), as a final integrity check. Pay attention to:
- The preview room flows: open the same playlist in two tabs, enter the same room → comparison state should sync between them.
- Toggle "full overlay" (the keyboard shortcut routed through `usePreviewShortcuts`'s `onToggleOverlay`) — it should flip between fully visible and transparent.

**Step 5: Commit only if cleanup edits were made.**

```bash
git add src/components/pages/playlists/PlaylistPlayer.vue
git commit -m "[playlists] Clean up unused imports after comparison adoption"
```

---

## Acceptance

Step 1 of the design doc is complete when:

- `tests/unit/composables/playlistComparison.spec.js` exists with ≥ 24 passing tests.
- `npm run test:unit` is green.
- `npm run lint` is clean.
- `PlaylistPlayer.vue` no longer contains `getComparisonTaskTypeOptions`, `rebuildComparisonOptions`, `rebuildRevisionOptions`, `rebuildEntityListToCompare`, or the `comparisonModeOptions` computed.
- `PlayerComparisonBar` renders the comparison UI in the playlist, including the missing-task-type warning via the `#missing` slot.
- The manual smoke checklist from Task 10 step 6 passes end-to-end.
- Commit count for this step: 11-12 commits on `refactoring-review`.

Once accepted, the next session can invoke writing-plans with the same skill to produce the plan for step 2 (`PlayerPlaybackBar`).
