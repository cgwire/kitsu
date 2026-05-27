# PlaylistPlayer Mixin Audit: Composition API Migration

**Date:** 2026-05-18  
**Scope:** PlaylistPlayer.vue is the sole remaining live consumer of three mixins: `annotation.js`, `player.js`, and `previewRoom.js`.  
**Objective:** Classify every public method, computed, watch, data property, and socket event into extraction buckets for Composition API migration.

---

## Mixin 1: `annotation.js` (1570 lines)

Fabric.js canvas wiring, drawing tools, undo/redo, and annotation persistence.

| Name | Kind | Verdict | Notes |
|------|------|---------|-------|
| `fabricCanvas` | data | REUSE | `useAnnotation` composable (1335 L) already exports `fabricCanvas` ref |
| `fabricCanvasComparison` | data | REUSE | `useAnnotation` composable exports this |
| `lastAnnotationTime` | data | REUSE | `useAnnotation` already has |
| `additions` | data | REUSE | `useAnnotation` already has |
| `deletions` | data | REUSE | `useAnnotation` already has |
| `updates` | data | REUSE | `useAnnotation` already has |
| `isShowingPalette` | data | REUSE | `useAnnotation` already has |
| `isShowingPencilPalette` | data | REUSE | `useAnnotation` already has |
| `notSaved` | data | REUSE | `useAnnotation` already has |
| `pencilColor` | data | REUSE | `useAnnotation` already has |
| `pencilWidth` | data | REUSE | `useAnnotation` already has |
| `textColor` | data | REUSE | `useAnnotation` already has |
| `mouseIsDrawing` | data | REUSE | `useAnnotation` already has (mouse pressure simulation state) |
| `mouseDrawingPressureMode` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingStartTime` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingMinPressure` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingMaxPressure` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingFadeTime` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingDistanceFalloff` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingMaxChangeRate` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingPrevPoint` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingPrevPressure` | data | REUSE | `useAnnotation` already has |
| `mouseDrawingDynamicDistanceMult` | data | REUSE | `useAnnotation` already has |
| `annotationCanvas` | computed | REUSE | `useAnnotation` accesses DOM ref internally |
| `resetUndoStacks()` | method | REUSE | `useAnnotation` already exports this |
| `findAnnotation()` | method | REUSE | `useAnnotation` already exports |
| `getObjectById()` | method | REUSE | `useAnnotation` already exports |
| `addSerialization()` | method | REUSE | `useAnnotation` already exports |
| `setObjectData()` | method | REUSE | `useAnnotation` already exports |
| `addObject()` | method | REUSE | `useAnnotation` already exports |
| `addText()` | method | REUSE | `useAnnotation` already exports |
| `addTypeArea()` | method | REUSE | `useAnnotation` already exports |
| `removeTypeArea()` | method | REUSE | `useAnnotation` already exports |
| `deleteSelection()` | method | REUSE | `useAnnotation` already exports |
| `deleteObject()` | method | REUSE | `useAnnotation` already exports |
| `removeObjectFromCanvas()` | method | REUSE | `useAnnotation` already exports |
| `updateObjectInCanvas()` | method | REUSE | `useAnnotation` already exports |
| `addToAdditions()` | method | REUSE | `useAnnotation` already exports |
| `postAnnotationAddition()` | method | EXTRACT-`useAnnotationBroadcast` | Socket event relay hook (called by composable, overridden in previewRoom) |
| `removeFromAdditions()` | method | REUSE | `useAnnotation` already exports |
| `addToDeletions()` | method | REUSE | `useAnnotation` already exports |
| `postAnnotationDeletion()` | method | EXTRACT-`useAnnotationBroadcast` | Socket event relay hook |
| `removeFromDeletions()` | method | REUSE | `useAnnotation` already exports |
| `addToUpdates()` | method | REUSE | `useAnnotation` already exports |
| `addToUpdatesSerializedObject()` | method | REUSE | `useAnnotation` already exports |
| `postAnnotationUpdate()` | method | EXTRACT-`useAnnotationBroadcast` | Socket event relay hook |
| `clearModifications()` | method | REUSE | `useAnnotation` already exports |
| `printModificationStats()` | method | REUSE | `useAnnotation` already exports (debug helper) |
| `isWriting()` | method | REUSE | `useAnnotation` already exports |
| `getNewAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `updateAnnotationsInStore()` | method | INLINE | PlaylistPlayer needs to handle this (currentPreview getter passed to composable) |
| `loadSingleAnnotation()` | method | REUSE | `useAnnotation` already exports |
| `loadSingleAnnotationComparison()` | method | REUSE | `useAnnotation` already exports |
| `addObjectToCanvas()` | method | REUSE | `useAnnotation` already exports (async) |
| `deserializePSBrush()` | method | REUSE | `useAnnotation` already exports |
| `onPickPencilWidth()` | method | REUSE | `useAnnotation` already exports |
| `onPickPencilColor()` | method | REUSE | `useAnnotation` already exports |
| `onPickTextColor()` | method | REUSE | `useAnnotation` already exports |
| `onChangePencilColor()` | method | REUSE | `useAnnotation` already exports |
| `onChangePencilWidth()` | method | REUSE | `useAnnotation` already exports |
| `onChangeTextColor()` | method | REUSE | `useAnnotation` already exports |
| `_resetColor()` | method | REUSE | `useAnnotation` already exports (private) |
| `_resetPencil()` | method | REUSE | `useAnnotation` already exports (private) |
| `resetPencilConfiguration()` | method | REUSE | `useAnnotation` already exports |
| `onAnnotateClicked()` | method | INLINE | Needs `isDrawing` ref from PlayerMixin; wiring in PlaylistPlayer |
| `onEraseClicked()` | method | INLINE | Same, plus eraser brush setup |
| `onTypeClicked()` | method | INLINE | Needs `isTyping` ref from PlayerMixin; event listener wiring |
| `onWindowsClosed()` | method | INLINE | Unload warning; can stay in component or wrapper |
| `onObjectAdded()` | method | REUSE | `useAnnotation` already exports; but depends on `isLaserModeOn` state |
| `onObjectModified()` | method | REUSE | `useAnnotation` already exports |
| `stackAddAction()` | method | REUSE | `useAnnotation` already exports |
| `undoLastAction()` | method | REUSE | `useAnnotation` already exports |
| `redoLastAction()` | method | REUSE | `useAnnotation` already exports |
| `clearUndoneStack()` | method | REUSE | `useAnnotation` already exports |
| `deleteAllAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `clearAnnotationSelection()` | method | REUSE | `useAnnotation` already exports |
| `resizeAnnotations()` | method | INLINE | Calls `resetCanvas()` (player mixin) then annotation reloads; orchestration |
| `resetCanvas()` | method | REUSE | `useAnnotation` already exports (in `clearCanvas`) |
| `resetCanvasVisibility()` | method | INLINE | DOM manipulation; needs `isAnnotationsDisplayed` state |
| `isAnnotationCanvas()` | method | REUSE | `useAnnotation` already exports |
| `setAnnotationCanvasDimensions()` | method | REUSE | `useAnnotation` already exports |
| `setAnnotationDrawingMode()` | method | REUSE | `useAnnotation` already exports |
| `reloadAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `setupFabricCanvas()` | method | REUSE | `useAnnotation` already exports; but refactored in composable |
| `configureCanvas()` | method | REUSE | `useAnnotation` already exports |
| `initalizeMouseDrawing()` | method | REUSE | `useAnnotation` already exports |
| `getCanvasRelativePointDrawingDifference()` | method | REUSE | `useAnnotation` already exports |
| `updateMousePressure()` | method | REUSE | `useAnnotation` already exports |
| `endDrawing()` | method | REUSE | `useAnnotation` already exports; calls `saveAnnotations()` (player) |
| `isEmptyCanvas()` | method | REUSE | `useAnnotation` already exports |
| `clearCanvas()` | method | REUSE | `useAnnotation` already exports |
| `copyAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `pasteAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `applyGroupChanges()` | method | REUSE | `useAnnotation` already exports |
| `fadeObject()` | method | REUSE | `useAnnotation` already exports |
| `markLastAnnotationTime()` | method | REUSE | `useAnnotation` already exports |
| `startAnnotationSaving()` | method | REUSE | `useAnnotation` already exports |
| `endAnnotationSaving()` | method | REUSE | `useAnnotation` already exports; emits event to parent |
| `confirmAnnotationsSaved()` | method | REUSE | `useAnnotation` already exports |
| `restoreFailedAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `copyAnnotationCanvas()` | method | REUSE | `useAnnotation` already exports |

---

## Mixin 2: `player.js` (1612 lines)

Playback, frame navigation, comparison mode, handle in/out, panzoom forwarding, and state management.

| Name | Kind | Verdict | Notes |
|------|------|---------|-------|
| `annotations` | data | INLINE | PlaylistPlayer owns this; already in component data |
| `color` | data | DEAD | Never used in PlaylistPlayer; remove |
| `currentPreviewIndex` | data | INLINE | PlaylistPlayer owns; essential player state |
| `currentTime` | data | INLINE | PlaylistPlayer owns; UI display |
| `currentTimeRaw` | data | INLINE | PlaylistPlayer owns; playback state |
| `entityList` | data | INLINE | PlaylistPlayer owns; the playlist entity array |
| `entityListToCompare` | data | INLINE | PlaylistPlayer owns; comparison entity array |
| `framesPerImage` | data | INLINE | PlaylistPlayer owns; picture frame mapping |
| `framesSeenOfPicture` | data | INLINE | PlaylistPlayer owns; picture carousel state |
| `fullScreen` | data | INLINE | Should use `useFullScreen` composable |
| `isCommentsHidden` | data | INLINE | PlaylistPlayer UI state |
| `isComparing` | data | INLINE | PlaylistPlayer owns (will move to `useComparison`) |
| `isDrawing` | data | INLINE | Annotation UI state; already in PlaylistPlayer data |
| `isEntitiesHidden` | data | INLINE | UI toggle state; already in component |
| `isHd` | data | INLINE | Video quality toggle; already in component |
| `isMuted` | data | INLINE | Audio state; already in component |
| `isPlaying` | data | INLINE | Essential playback state; already in component |
| `isRepeating` | data | INLINE | Playback option; already in component |
| `isTyping` | data | INLINE | Annotation UI state; already in component |
| `maxDuration` | data | INLINE | Computed/derived from video; already in component |
| `maxDurationRaw` | data | INLINE | Playback metadata; already in component |
| `pencil` | data | DEAD | Annotation state now in `useAnnotation` as `pencilWidth` |
| `pencilPalette` | data | INLINE | Static config; can be imported constant |
| `playingEntityIndex` | data | INLINE | Essential state; already in component |
| `playingPreviewFileId` | data | DEAD | Never read in PlaylistPlayer; can remove |
| `speed` | data | INLINE | Playback setting; already in component |
| `task` | data | INLINE | Task context; already in component |
| `textColor` | data | REUSE | `useAnnotation` already has |
| `volume` | data | INLINE | Audio state; already in component |
| `onNextTimeUpdateActions` | data | INLINE | Event queue for frame updates; orchestration |
| `container()` | computed | REUSE | Ref from template |
| `rawPlayer()` | computed | REUSE | Ref from template |
| `rawPlayerComparison()` | computed | REUSE | Ref from template |
| `picturePlayer()` | computed | REUSE | Ref from template |
| `picturePlayerComparison()` | computed | REUSE | Ref from template |
| `soundPlayer()` | computed | REUSE | Ref from template |
| `modelPlayer()` | computed | REUSE | Ref from template |
| `canvas()` | computed | REUSE | Ref from template |
| `progress()` | computed | REUSE | Ref from template |
| `video()` | computed | REUSE | Ref from template |
| `extension` | computed | INLINE | Derive from `currentPreview.extension` |
| `isCurrentPreviewMovie()` | computed | INLINE | Utility; use inline helper |
| `isCurrentPreviewPicture()` | computed | INLINE | Utility; use inline helper |
| `isCurrentPreviewModel()` | computed | INLINE | Utility; use inline helper |
| `isCurrentPreviewSound()` | computed | INLINE | Utility; use inline helper |
| `isCurrentPreviewPdf()` | computed | INLINE | Utility; use inline helper |
| `isCurrentPreviewFile()` | computed | INLINE | Utility; use inline helper |
| `isComparisonOverlay()` | computed | REUSE | `useComparison` composable (L219) already has |
| `overlayOpacity()` | computed | REUSE | `useComparison` composable already has |
| `currentPreviewPath` | computed | INLINE | Derive from `currentPreview` |
| `currentComparisonPreviewPath` | computed | INLINE | Derive from comparison state |
| `currentPreviewDlPath` | computed | INLINE | Utility path builder |
| `currentEntity` | computed | INLINE | `entityList[playingEntityIndex]` |
| `currentPreview` | computed | INLINE | Complex getter from entity; keep in component |
| `currentEntityPreviewLength` | computed | INLINE | Derived from `currentEntity.preview_file_previews` |
| `frameDuration` | computed | REUSE | Player/Vuex state; likely mapGetter |
| `fps` | computed | REUSE | Production metadata; likely mapGetter |
| `frameNumber` | computed | INLINE | Derive from `currentTimeRaw / frameDuration` |
| `currentFrame` | computed | INLINE | Formatted frame string |
| `currentFrameMovieOrPicture` | computed | INLINE | Branch on preview type |
| `nbFrames` | computed | INLINE | Derive from duration and fps |
| `isMovie()` | method | INLINE | Extension check utility |
| `isPicture()` | method | INLINE | Extension check utility |
| `isModel()` | method | INLINE | Extension check utility |
| `isSound()` | method | INLINE | Extension check utility |
| `isPdf()` | method | INLINE | Extension check utility |
| `exists()` | method | INLINE | Existence check; trivial |
| `configureEvents()` | method | INLINE | Register global keydown, resize, fullscreen listeners |
| `removeEvents()` | method | INLINE | Cleanup listeners |
| `formatTime` | method | REUSE | Imported utility from `@/lib/video` |
| `displayBars()` | method | INLINE | UI show/hide; element manipulation |
| `hideBars()` | method | INLINE | UI show/hide |
| `updateTaskPanel()` | method | INLINE | Update `task` from entity and store |
| `updateProgressBar()` | method | INLINE | Call progress component method |
| `playClicked()` | method | INLINE | UI button handler; calls `play()` |
| `pauseClicked()` | method | INLINE | UI button handler; calls `pause()` |
| `play()` | method | INLINE | Complex playback orchestration; branching logic |
| `playFullBuild()` | method | INLINE | Full player wiring; calls `fullPlayer.play()` |
| `_setCurrentTimeOnHandleIn()` | method | INLINE | Handle in logic wiring |
| `_runPlaylistProgressUpdateLoop()` | method | INLINE | Full mode progress loop |
| `_stopPlaylistProgressUpdateLoop()` | method | INLINE | Cleanup loop |
| `pause()` | method | INLINE | Complex pause logic; multiple player types |
| `playEntity()` | method | INLINE | Critical state-change method; core player logic |
| `syncComparisonPlayer()` | method | INLINE | Frame sync between main and comparison players |
| `goPreviousFrame()` | method | INLINE | Navigation; calls rawPlayer methods |
| `goNextFrame()` | method | INLINE | Navigation |
| `goPreviousDrawing()` | method | INLINE | Annotation navigation |
| `goNextDrawing()` | method | INLINE | Annotation navigation |
| `setFullPlayerTime()` | method | INLINE | Full mode time control |
| `setFullScreen()` | method | EXTRACT-`useFullScreen` | Already `useFullScreen` composable in codebase; use it |
| `exitFullScreen()` | method | EXTRACT-`useFullScreen` | Already exists in composable |
| `onScrubStart()` | method | INLINE | Scrub UI state |
| `onScrubEnd()` | method | INLINE | Scrub UI state |
| `onProgressChanged()` | method | INLINE | Frame scrubber handler; orchestration |
| `onHandleInChanged()` | method | INLINE | Handle marker handler; calls `_saveHandles()` |
| `onHandleOutChanged()` | method | INLINE | Handle marker handler |
| `_saveHandles()` | method | INLINE | Vuex action dispatch for shot handles |
| `onPreviousFrameClicked()` | method | INLINE | Keyboard/button handler |
| `onNextFrameClicked()` | method | INLINE | Keyboard/button handler |
| `onPreviousDrawingClicked()` | method | INLINE | Keyboard/button handler |
| `onNextDrawingClicked()` | method | INLINE | Keyboard/button handler |
| `onPlayPauseClicked()` | method | INLINE | Play/pause toggle |
| `onVideoRepeated()` | method | INLINE | Video ended event; repeat logic |
| `onRepeatClicked()` | method | INLINE | Toggle repeat mode |
| `onToggleSoundClicked()` | method | INLINE | Mute toggle |
| `onFullScreenChange()` | method | EXTRACT-`useFullScreen` | Use composable callback |
| `onFullscreenClicked()` | method | EXTRACT-`useFullScreen` | Use composable toggle |
| `onKeyDown()` | method | EXTRACT-`usePreviewShortcuts` | Keyboard handler already extracted to composable |
| `onWindowResize()` | method | INLINE | Debounced resize handler; canvas reset |
| `toggleFullOverlayComparison()` | method | REUSE | `useComparison.toggleFullOverlay()` already exists |
| `reloadAnnotations()` | method | REUSE | `useAnnotation` already exports |
| `onFilmClicked()` | method | INLINE | Entity list visibility toggle |
| `getCurrentTime()` | method | INLINE | Frame to time conversion |
| `getCurrentFrame()` | method | INLINE | Time to frame conversion |
| `setCurrentTimeRaw()` | method | INLINE | Set playback position; calls rawPlayer |
| `reloadCurrentAnnotation()` | method | INLINE | Annotation reloading |
| `getSortedAnnotations()` | method | INLINE | Sort annotations by time |
| `getNextAnnotationTime()` | method | INLINE | Find next annotation frame |
| `getPreviousAnnotationTime()` | method | INLINE | Find previous annotation frame |
| `onCommentClicked()` | method | INLINE | Task info panel toggle |
| `onCompareClicked()` | method | REUSE | `useComparison.toggleComparison()` already exists |
| `setPlayerSpeed()` | method | INLINE | Set playback rate on both players |
| `onFrameUpdate()` | method | INLINE | Frame timer callback; complex orchestration |
| `onMaxDurationUpdate()` | method | INLINE | Video metadata handler |
| `onMouseMove()` | method | INLINE | Auto-hide UI in fullscreen |
| `playPicture()` | method | INLINE | Picture animation loop |
| `playSound()` | method | INLINE | Sound player start |
| `playModel()` | method | INLINE | Model player animation |
| `resetCanvasSize()` | method | INLINE | Canvas dimensions for pics/movies; complex math |
| `showCanvas()` | method | INLINE | DOM visibility |
| `hideCanvas()` | method | INLINE | DOM visibility |
| `loadAnnotation()` | method | INLINE | Load and pause at annotation |
| `saveAnnotations()` | method | INLINE | Complex save orchestration; Vuex and local state |
| `onDeleteClicked()` | method | REUSE | `useAnnotation.deleteSelection()` |
| `getAnnotation()` | method | INLINE | Find annotation by time |
| `onMetadataLoaded()` | method | INLINE | Video metadata handler |
| `clearPlayer()` | method | INLINE | Player reset |
| `resetPictureCanvas()` | method | INLINE | Picture-specific reset |
| `onCanvasMouseMoved()` | method | INLINE | Scrub handler; checks `this.$options.scrubbing` |
| `onCanvasClicked()` | method | INLINE | Scrub start; sets `this.$options.scrubbing` |
| `onCanvasReleased()` | method | INLINE | Scrub end |
| `onTimeCodeClicked()` | method | INLINE | Time code navigation |
| `extractFrame()` | method | INLINE | Annotation snapshot extraction |
| `extractVideoFrame()` | method | INLINE | Annotation snapshot extraction |
| `extractAnnotationSnapshots()` | method | INLINE | Batch annotation export |
| `getFileFromCanvas()` | method | INLINE | Canvas to file blob |
| `triggerResize()` | method | INLINE | Dispatch resize event |
| `watch.speed` | watch | INLINE | Playback speed change |
| `watch.isCommentsHidden` | watch | INLINE | Sound player redraw |
| `beforeUnmount()` | hook | INLINE | Cleanup calls to mixin methods |
| `socket.events['preview-file:annotation-update']` | socket event | EXTRACT-`usePreviewRoom` | Socket handler for annotation updates |

---

## Mixin 3: `previewRoom.js` (448 lines)

Collaborative review: presence tracking, leader sync, and socket event handlers.

| Name | Kind | Verdict | Notes |
|------|------|---------|-------|
| `joinedRoom()` | computed | INLINE | `this.room.people.find(id => id === this.user.id)` |
| `isValidRoomId()` | method | INLINE | Room existence check |
| `openRoom()` | method | EXTRACT-`usePreviewRoom` | Socket emit for playlist open |
| `closeRoom()` | method | EXTRACT-`usePreviewRoom` | Socket emit for playlist close |
| `joinRoom()` | method | EXTRACT-`usePreviewRoom` | Socket emit to join collaborative session |
| `leaveRoom()` | method | EXTRACT-`usePreviewRoom` | Socket emit to leave |
| `sendUpdatePlayingStatus()` | method | INLINE | Wrapper around `updateRoomStatus()`; queues action |
| `updateRoomStatus()` | method | EXTRACT-`usePreviewRoom` | Socket emit with full player state (playback, frame, comparing, speed, handles) |
| `postPanZoomChanged()` | method | EXTRACT-`usePreviewRoom` | Socket emit for panzoom sync |
| `postComparisonPanZoomChanged()` | method | EXTRACT-`usePreviewRoom` | Socket emit for comparison panzoom |
| `postAnnotationAddition()` | method | EXTRACT-`useAnnotationBroadcast` | Socket emit for new annotation object |
| `postAnnotationDeletion()` | method | EXTRACT-`useAnnotationBroadcast` | Socket emit for removed annotation |
| `postAnnotationUpdate()` | method | EXTRACT-`useAnnotationBroadcast` | Socket emit for updated annotation |
| `getPreviewFileFromEntity()` | method | INLINE | Entity lookup utility; used by `loadRoomCurrentState()` |
| `loadRoomCurrentState()` | method | INLINE | Apply remote state changes; complex branching logic |
| `loadRoomCurrentFrame()` | method | INLINE | Apply frame change from remote peer |
| `onPreviousFrameClicked()` | method | DEAD | Duplicate of player.js; should call player version |
| `onNextFrameClicked()` | method | DEAD | Duplicate of player.js; should call player version |
| `socket.events['preview-room:room-people-updated']` | socket event | EXTRACT-`usePreviewRoom` | Track who's in the room |
| `socket.events['preview-room:room-updated']` | socket event | EXTRACT-`usePreviewRoom` | Leader sync handler; calls `loadRoomCurrentState()` |
| `socket.events['preview-room:panzoom-changed']` | socket event | EXTRACT-`usePreviewRoom` | Sync panzoom from peer; calls `setPanZoom()` (player mixin) |
| `socket.events['preview-room:comparison-panzoom-changed']` | socket event | EXTRACT-`usePreviewRoom` | Sync comparison panzoom; calls `setComparisonPanZoom()` (expected) |
| `socket.events['preview-room:add-annotation']` | socket event | EXTRACT-`usePreviewRoom` | Render peer annotation; calls `addObjectToCanvas()` (annotation) |
| `socket.events['preview-room:remove-annotation']` | socket event | EXTRACT-`usePreviewRoom` | Remove peer annotation; calls `removeObjectFromCanvas()` (annotation) |
| `socket.events['preview-room:update-annotation']` | socket event | EXTRACT-`usePreviewRoom` | Update peer annotation; calls `updateObjectInCanvas()` (annotation) |

---

## Synthesis

### 1. New Composables Proposed

#### `usePreviewRoom` (extract from previewRoom.js, ~300 LOC)
**Scope:** Collaborative review session management.  
**Mixin sections:** Entire previewRoom.js except socket event registration (which belongs in setup).  
**Features:**
- Room join/leave logic
- State broadcast (updateRoomStatus, postPanZoom*, postAnnotation*)
- Socket handlers wiring (room-people-updated, room-updated, panzoom-changed, annotation-add/remove/update)
- loadRoomCurrentState/Frame orchestration
- joinedRoom computed

**Critical dependencies:**
- Reads: `user`, `room.people`, `room.id`, `room.localId`, `isValidRoomId`
- Reads player state: `isPlaying`, `playingEntityIndex`, `currentPreviewIndex`, `currentFrame`, `isRepeating`, `speed`, `handleIn`, `handleOut`, `isComparing`, `taskTypeToCompare`, `revisionToCompare`, `comparisonMode`, `currentComparisonPreviewIndex`, `isAnnotationsDisplayed`, `isWaveformDisplayed`, `isZoomEnabled`
- Calls player methods: `playEntity()`, `pause()`, `play()`, `setPlayerSpeed()`, `syncComparisonPlayer()`, `updateProgressBar()`, `clearCanvas()`, `loadAnnotation()`, `getAnnotation()`
- Calls annotation methods: `addObjectToCanvas()`, `removeObjectFromCanvas()`, `updateObjectInCanvas()`
- Calls panzoom methods: `setPanZoom()`, `setComparisonPanZoom()` (player-owned, must be passed in)
- Emits socket events: preview-room:*, expects `$socket` instance

#### `useAnnotationBroadcast` (new, ~80 LOC)
**Scope:** Socket relay hooks for annotation changes.  
**Features:**
- `postAnnotationAddition(time, obj)` — emit 'preview-room:add-annotation'
- `postAnnotationDeletion(time, obj)` — emit 'preview-room:remove-annotation'
- `postAnnotationUpdate(time, obj)` — emit 'preview-update-annotation'
- All three check `isValidRoomId()` and `joinedRoom` before emitting

**Critical dependencies:**
- Reads: `room.id`, `room.localId`, `user.id`, `joinedRoom` (likely from usePreviewRoom or passed in)
- Accesses: `$socket`
- Called by: `useAnnotation` (postAnnotationAddition/Deletion/Update hooks)

### 2. Shared State Between Mixins

**player.js ↔ annotation.js:**
- `currentTimeRaw`, `currentFrame` (player) — read by annotation to timestamp edits
- `annotations` (annotation) — read by player for display/navigation
- `isLaserModeOn` (player, defined in PlaylistPlayer) — read by `onObjectAdded()` in annotation to decide fadeObject vs persist
- `isDrawing`, `isTyping` (player) — co-exist with annotation drawing state
- `saveAnnotations()` (player) — called by annotation's `endDrawing()` to persist

**previewRoom.js ↔ player.js:**
- All playback state: `isPlaying`, `playingEntityIndex`, `currentPreviewIndex`, `currentFrame`, `isRepeating`, `speed`, `handleIn`, `handleOut`
- Comparison state: `isComparing`, `taskTypeToCompare`, `revisionToCompare`, `comparisonMode`, `currentComparisonPreviewIndex`
- Canvas state: `isAnnotationsDisplayed`, `isWaveformDisplayed`, `isZoomEnabled`
- Methods called by room: `playEntity()`, `pause()`, `play()`, `setPlayerSpeed()`, `syncComparisonPlayer()`, `updateProgressBar()`

**previewRoom.js ↔ annotation.js:**
- Socket relay: `postAnnotationAddition()`, `postAnnotationDeletion()`, `postAnnotationUpdate()` (defined in previewRoom, overload annotation's hook methods)
- Object management: `addObjectToCanvas()`, `removeObjectFromCanvas()`, `updateObjectInCanvas()` called by room socket handlers

**Player-specific state (not in any mixin):**
- `isFullMode`, `fullPlayer` — full playlist video playback
- `playlistProgress`, `playlistShotPosition`, `playlistDuration` — playlist-level progress tracking
- `wavesurfer` — waveform visualization
- `isWaveformDisplayed`, `isAnnotationsDisplayed`, `isZoomEnabled` — UI toggles
- `isCommentsHidden`, `isEntitiesHidden` — UI toggles
- `pictureDefaultHeight`, `movieDimensions` — layout state
- `currentBackground`, `isEnvironmentSkybox`, `isWireframe`, `isObjectBackground` — 3D model view
- `objectModel` — 3D model animation state
- `hasActiveShareLinks`, `modals`, `loading`, `errors`, `success` — modal/notification UI
- `room` — collaborative session metadata (people, newComer, localId, id)
- `savedTaskTypeToCompare` — comparison UI state
- `comparisonEntityMissing` — comparison validation flag
- All keyboard/UI event handlers, scrub state, auto-hide logic

### 3. PlaylistPlayer-Specific State Not in Any Mixin

- **Full-playlist playback:** `isFullMode`, `fullPlayer`, `playlistProgress`, `playlistShotPosition`, `playlistDuration`, `playlistToEdit`, `configureFullPlayer()`, `_runPlaylistProgressUpdateLoop()`, `setPlaylistProgress()`, `resetPlaylistFrameData()`
- **Waveform visualization:** `wavesurfer`, `isWaveformDisplayed`, `configureWaveForm()`, `loadWaveForm()`, `onWaveformSeeking()`
- **Layout & visuals:** `pictureDefaultHeight`, `movieDimensions`, `isFullScreen`, `currentBackground`, `isEnvironmentSkybox`, `isWireframe`, `isObjectBackground`, `objectBackgroundUrl`, `objectModel` (animation state)
- **UI state:** `isCommentsHidden`, `isEntitiesHidden`, `isDlButtonsHidden`, `isShowAnnotationsWhilePlaying`
- **Collaborative metadata:** `room` (people, localId, newComer)
- **Comparison UI:** `comparisonEntityMissing`, `savedTaskTypeToCompare`
- **Modal/notification state:** `modals`, `loading`, `errors`, `success`, `hasActiveShareLinks`
- **Entity/task context:** `entityList`, `entityListToCompare`, `task`, `currentEntity`, `picturePreviews`, `framesPerImage`
- **Keyboard/mouse handlers:** `onKeyDown()`, `onWindowResize()`, `onMouseMove()`, scrub state (`this.$options.scrubbing`, `scrubStartX`)

### 4. Risks for the Migration

1. **Cross-mixin state coupling:** `isLaserModeOn` is read by `annotation.onObjectAdded()` but defined in PlaylistPlayer. Must pass as ref or callback into composable.

2. **Socket event ordering:** previewRoom socket handlers call annotation methods (`addObjectToCanvas`, etc.). If annotation composable is initialized after previewRoom, listeners may miss events. Order: initialize useAnnotation → usePreviewRoom (which depends on annotation methods).

3. **Player method dependencies in room logic:** `loadRoomCurrentState()` calls `playEntity()`, `pause()`, `play()`, `setPlayerSpeed()`, `syncComparisonPlayer()`, etc. These must stay in PlaylistPlayer component; composable receives them as callbacks or refs.

4. **Non-reactive instance state:** Both annotation and player mixins use `this.$options.xxx` for undo/redo stacks, scrubbing flags, and async state. These must be moved to closure state inside composables or flagged as instance properties (not refs).

5. **Annotation saving debounce:** `startAnnotationSaving()` sets a 3-second timeout stored in `this.$options.annotationToSave`. This timeout must survive unmount if a save is in flight. Use composable's private state, not component data.

6. **Watch dependencies:** player.js watches `speed` and `isCommentsHidden`. previewRoom.js socket handler mutates many properties (`isPlaying`, `isRepeating`, `speed`, etc.) synchronously. Component watchers may fire in unexpected order. Consider explicit callback patterns instead of watchers in composables.

7. **Panzoom sync:** previewRoom socket handler calls `setPanZoom()` and `setComparisonPanZoom()` which are expected player methods but not yet extracted. These should use `usePanzoomSync` composable or be inlined in PlaylistPlayer.

8. **Fabric.js canvas refs:** useAnnotation mirrors canvas instances from AnnotationCanvas child components via watchers. PlaylistPlayer child component refs must be stable; if component mounts late or is recreated, watchers may not fire.

9. **Keyboard shortcuts:** player.js `onKeyDown()` is already extracted to `usePreviewShortcuts` in the codebase, but PlaylistPlayer still defines its own giant onKeyDown that includes annotation commands. Must consolidate or compose both handlers.

10. **Comparison preview index state:** `currentComparisonPreviewIndex` is in PlaylistPlayer data, but `useComparison` also has `comparisonPreviewIndex`. Naming collision and state duplication risk. Consolidate to one source of truth (likely useComparison).

---

## Migration Order Recommendation

1. **Extract player utility methods** (type checks, time/frame conversions) as pure functions or into a utility module.
2. **Migrate to useFullScreen** and **usePreviewShortcuts** composables (already exist in codebase).
3. **Use existing useAnnotation composable** — it's 95% complete; just wire currentPreview getter callback and laser mode flag.
4. **Create useAnnotationBroadcast** — thin wrapper for socket relays (postAnnotationAddition/Deletion/Update).
5. **Create usePreviewRoom** — depends on useAnnotation, useAnnotationBroadcast, and callbacks for playback state.
6. **Refactor PlaylistPlayer** to use all four composables, keep core playback/entity state in `<script setup>`, and expose callbacks to room composable.
7. **Remove playerMixin and previewRoomMixin** — annotationMixin is already superseded by useAnnotation.

