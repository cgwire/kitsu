# Edit page player refactor — design

> Status: approved 2026-05-18, ready for implementation plan.

## Goal

Replace Edit.vue's custom inline player with the refactored
PreviewPlayer (the "classic" player). Migrate Edit.vue itself from
Options-API + mixins to Composition API. Drop preview-room support
from this page in the process — collaborative review for edits will
later be reached through a separate workstream (allow playlists to
contain edits). That workstream is **out of scope** here.

## Background

Edit.vue (1,445 lines, Options API) was contributed by a community
member and never followed the rest of the codebase's evolution. It
duplicates a lot of the player surface:

- A custom inline player built on `<raw-video-player>` (from
  `pages/playlists/`), `<object-viewer>`, `<sound-viewer>`, a raw
  `<img>` for pictures, and a custom button bar.
- Its own annotation canvas, `<video-progress>` wiring, frames-per-
  image input, mute / repeat / speed buttons.
- Three mixins for the player layer: `annotationMixin`,
  `playerMixin`, `previewRoomMixin`.

Meanwhile `PreviewPlayer.vue` was just rewritten in Composition API
with five composables (`useAnnotation`, `useComparison`,
`useFullScreen`, `usePanzoomSync`, `usePreviewShortcuts`). It owns
preview iteration internally via the `previews` prop and emits
`@annotation-changed`, `@change-current-preview`, `@frame-updated`,
`@comment-added`, etc. — enough for the Edit page's needs.

`raw-video-player`'s distinctive feature is continuous playback
across multiple previews (video + pictures with `framesPerImage`).
In Edit.vue it iterates a single entity's revisions. The user has
confirmed it's acceptable to lose this stitching: revisions are
navigated one at a time, like on a regular task page.

## Architecture

```
Edit.vue (~250 lines, Composition API)
 ├── page-header
 │     ├── back link → editsPath
 │     ├── entity-thumbnail
 │     ├── title
 │     ├── previews-per-task-type @preview-changed
 │     └── prev / next entity nav
 ├── <preview-player ref="player">                ← the whole player lives here
 │     handles: annotation, comparison, zoom-pan,
 │              fullscreen, shortcuts, frame nav
 └── sections (infos / schedule / preview-files / activity / time-logs)
       unchanged
```

Edit.vue no longer renders any player widget itself. The page
becomes a data feeder for `PreviewPlayer`.

## Data flow

```
store.loadEdits()                    →  currentEdit
store.loadTaskEntityPreviewFiles()   →  previewFiles   (Map taskTypeId → previewFile[])

UI: previews-per-task-type @preview-changed(entity, previewFile)
  → currentTaskTypeId  = previewFile.task_type_id
  → currentTask        = derive from taskTypeId + currentEdit
  → currentRevisions   = previewFiles[currentTaskTypeId]

PreviewPlayer receives:
  :previews            = currentRevisions
  :task                = currentTask
  :entity-preview-files= previewFiles
  :task-type-map       = store.getters.taskTypeMap
  :entity-type         = 'Edit'
  :last-preview-files  = currentRevisions
  @annotation-changed  → store.updatePreviewAnnotation
  @change-current-preview → updates index, refreshes derived state
```

## What gets removed

**Template / components**

- `<raw-video-player>`, `<object-viewer>` (direct), `<sound-viewer>`
  (direct), `<video-progress>` (direct), the picture `<img>` and its
  wrapper, the canvas wrapper, the custom button bar (play /
  repeat / speed / mute / pencil / type / undo / redo / drawing
  pencil picker / color picker / framesPerImage input), the
  `<preview-room>` widget.

**Mixins**

- `annotationMixin`, `playerMixin`, `previewRoomMixin` — all dropped.

**State and methods**

- `framesPerImage`, `playingEntityIndex`, `currentPreviewIndex`,
  `playingPreviewFileId`, `movieDimensions`, `room` object,
  `previewRoomRef`.
- `setupFabricCanvas`, `initPlayer`, `resetHeight`, `playClicked /
  pauseClicked`, all the annotation / panzoom / scrubbing handlers
  the mixins covered.

**Socket events**

- `...playerMixin.socket.events`, `...previewRoomMixin.socket.events`.
- `'preview-file:add-file'` and `'comment:delete'` handlers are
  kept; they reload the preview file map.

## What stays

- `entityMixin` (prev / next entity nav, `previousEntityPath`,
  `nextEntityPath`) — for now. Conversion to a composable is a
  follow-up if it gets in the way.
- `formatListMixin` — used by sections.
- `domMixin` — audited; keep only if still referenced.
- `fullScreenMixin` at the page level — likely removable since
  PreviewPlayer owns its own fullscreen via `useFullScreen`. Verified
  during implementation.

## Error handling and edge cases

- `isLoading` true until both `loadEdits` and
  `loadTaskEntityPreviewFiles` resolve.
- `errors.edit` keeps the 404 / load-failure surface.
- Empty preview list → pass `previews: []` to PreviewPlayer, let its
  existing empty-state render.
- Preview file added / deleted via socket → reload the file map and
  re-derive `currentRevisions`.

## Testing

No unit tests exist for either Edit.vue or PreviewPlayer. Adding
coverage is out of scope for this refactor.

Smoke test path (manual):
1. Open an Edit → page loads, preview renders in PreviewPlayer.
2. Switch task type via `previews-per-task-type` → preview list
   refreshes, first revision shown.
3. Navigate revisions via PreviewPlayer's prev / next.
4. Play / pause a movie revision.
5. Draw an annotation, save (commit / move frame), confirm it
   persists via `store.updatePreviewAnnotation`.
6. Toggle zoom-pan (wheel / Shift+drag), reset.
7. Toggle comparison mode against another task type.
8. Toggle fullscreen.
9. Switch to next entity via header nav → state resets cleanly.
10. Upload a new preview file → socket-driven reload picks it up.

## Risks

- **`entityMixin` + Composition API** can have `this.$` references
  that break in `<script setup>`. Mitigation: scan its usage,
  convert the small bits inline, defer the full mixin migration.
- **`fullScreen` ambiguity**: page-level vs player-level. Verify
  there is no remaining page-level fullscreen consumer once mixins
  are removed.
- **Preview-room regression**: users currently relying on preview-
  room on Edit pages lose it. Communication is needed in the
  changelog / release notes. The follow-up "playlists of edits"
  workstream will give them back collaborative review, just through
  a different entry point.
- **`raw-video-player` continuous stitching loss**: accepted by user.
  If a user discovers a workflow that depended on it, surface it
  before merging.

## Out of scope

- "Playlists can contain edits" workstream — separate brainstorm,
  separate PR. Touches Zou backend + Kitsu Playlist UI +
  PlaylistPlayer.
- Adding tests for Edit.vue / PreviewPlayer.
- Removing `raw-video-player` itself (still used by PlaylistPlayer).
- Migrating `entityMixin`, `formatListMixin`, `domMixin` to
  composables.
