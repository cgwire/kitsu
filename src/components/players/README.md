# Players

All Kitsu's preview and playlist players, their bars, viewers and annotation surfaces. Three top-level players share a deliberate architecture: every reusable control lives in a shared **bar**, every reusable behavior lives in a **composable** under `src/composables/players/`, and the players themselves are thin assemblers wiring props and events.

**Before adding a button, a state, or a viewer here, read `.agents/skills/players-add-feature/SKILL.md`.** The skill captures the decision tree and the extension patterns. This README is the directory map.

## Directory layout

| Folder | Contains |
|---|---|
| `annotations/` | `AnnotationCanvas.vue`, `SharedAnnotationOverlay.vue` — fabric.js wrapper + the read-only overlay used in shared playlists |
| `bars/` | The three shared button bars (`PlayerPlaybackBar`, `PlayerAnnotationBar`, `PlayerComparisonBar`) and three more (`BrowsingBar`, `PreviewsPerTaskType`, `SharedPlaylistButtonBar`) |
| `headers/` | `RevisionPreview`, `SharedPlaylistHeader` — top-of-player metadata strips |
| `players/` | The three top-level players (`PreviewPlayer`, `PlaylistPlayer`, `SharedPlaylistPlayer`) and `PlaylistedEntity` |
| `progress/` | `VideoProgress` (per-clip seek bar with annotation marks), `PlaylistProgress` (cross-entity timeline) |
| `sides/` | `SharedCommentsPanel` — guest comments side panel for shared playlists |
| `viewers/` | One per media type: `PictureViewer`, `VideoViewer`, `ObjectViewer` (3D model), `SoundViewer`, `PdfViewer`, `MarkdownViewer`, `DiffViewer`, plus `MultiPictureViewer`/`MultiVideoViewer` (playlist sequences) and the dispatcher `PreviewViewer` |

## The three players

| File | Used by | Notes |
|---|---|---|
| `PreviewPlayer.vue` | The task page (`pages/Task.vue`) and entity preview widget | Single-entity playback. Owns annotation save + comparison single-entity logic via `useComparison`. |
| `PlaylistPlayer.vue` | The playlist page (`pages/Playlist.vue`) | Multi-entity playlist playback. Adds build/export, share links, sound waveform. Uses `usePlaylistComparison` for multi-entity comparison. |
| `SharedPlaylistPlayer.vue` | Shared playlist guest view (`pages/SharedPlaylist.vue`) | Anonymous guest access with token. Subset of PlaylistPlayer functionality. |

## The three shared bars

All three live in `bars/` and follow the **opt-in v-model + named slot** extension pattern (see the skill).

| Bar | Owns | Consumers |
|---|---|---|
| `PlayerPlaybackBar` | play/pause, time/frame counter, repeat, HD/LD, speed, sound, 3D animation combo; optional `isWaveformDisplayed`, `isShowAnnotationsWhilePlaying`, `compact`, `isPicture`, `#extra-controls` slot | All three players |
| `PlayerComparisonBar` | compare toggle, task-type / revision / mode combos, prev/next preview navigation; `#missing` slot | PreviewPlayer + PlaylistPlayer |
| `PlayerAnnotationBar` | undo/redo, delete, type, pencil, annotation-displayed (pen), zoom-pan (loupe), comment + 3D model controls; optional `isLaserModeOn` | PreviewPlayer + PlaylistPlayer |

`BrowsingBar` (revision navigation), `PreviewsPerTaskType` (task-type browsing), `SharedPlaylistButtonBar` (guest controls) are used in narrower contexts — see each file's `defineProps` for usage.

## The composables

Under `src/composables/players/`:

| Composable | Owns | Used by |
|---|---|---|
| `annotation.js` | Fabric canvas, drawing tools, undo/redo stacks, annotation persistence | All three players |
| `annotationBroadcast.js` | Socket relay of annotation events into a preview room | PreviewPlayer + PlaylistPlayer |
| `comparison.js` | Single-entity comparison state (task-type selection, mode, overlay opacity) | PreviewPlayer |
| `playlistComparison.js` | Multi-entity playlist comparison; composes `useComparison` for shared primitives | PlaylistPlayer |
| `previewShortcuts.js` | Keyboard shortcuts (Alt-pan, undo, delete, next/prev annotation, etc.) | PreviewPlayer + PlaylistPlayer |
| `sharedAnnotation.js` | Lightweight annotation state for the guest overlay | SharedPlaylistPlayer / SharedAnnotationOverlay |

Other composables under `src/composables/` (not under `players/`) that the players also use: `panzoom.js`, `previewRoom.js`, `fullScreen.js`, `entity.js`. They're more generic.

## Conventions

The skill at `.agents/skills/players-add-feature/SKILL.md` spells out the full checklist. Quick summary:

- `<script setup>` only — no Options API for new code.
- Imports grouped (third-party / project libs / components), alphabetical within each.
- Section order: Composables → Props/Emits → State → Computed → Functions → Watchers → Lifecycle → Head.
- Alphabetical: props, emits, defineModel, state refs, computed.
- Typed `defineProps` with defaults. No `props: ['x']`.
- No direct `fetch()` — all HTTP through `src/store/api/<entity>.js`.
- Arrow functions over `function` declarations.

## History

The current shared-bars architecture was established in May 2026 (commits `33e5c48a8` → `85ff3c277`) by adopting `PlayerComparisonBar`, `PlayerPlaybackBar`, and `PlayerAnnotationBar` across `PlaylistPlayer.vue` to replace ~470 lines of inline duplicated controls. The design doc lives at `docs/plans/2026-05-21-playlist-player-bars-adoption-design.md` and the per-step implementation plans are in the same folder.
