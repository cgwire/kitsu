/*
 * Composable for the collaborative "preview room" — the multi-user
 * review session that synchronises playback, frame position, comparison
 * settings, panzoom, and remote annotation events across participants
 * of the same playlist.
 *
 * Scope: everything from the legacy `previewRoomMixin` except the three
 * annotation broadcasters (postAnnotationAddition / Deletion / Update)
 * which now live in `useAnnotationBroadcast`. The two `onPreviousFrame-
 * Clicked` / `onNextFrameClicked` methods that duplicated the player
 * mixin are intentionally dropped — the player handles those.
 *
 * Inputs are passed as a flat options object (same shape as
 * `useAnnotationBroadcast`). Refs and plain values both work: every
 * read goes through `unref()`. The broadcast-side player/comparison
 * state refs default to a sensible value so the composable can be
 * instantiated in tests without wiring every callback.
 *
 * Socket handlers are auto-registered on mount and removed on unmount.
 * Bound handler references are kept locally so `socket.off()` always
 * targets the correct function instance.
 *
 * Room-updated events carry a sequence number (see lib/players/roomSync)
 * so stale in-flight updates are dropped, broadcasts are muted while a
 * remote state is applied, and outgoing bursts are throttled — guards
 * against the event feedback storm of issue #1574.
 */
import { computed, onBeforeUnmount, onMounted, ref, unref } from 'vue'

import { isValidRoomId, PREVIEW_ROOM_EVENTS } from '@/lib/players/events'
import {
  nextRoomSeq,
  roomSeqOf,
  shouldApplyRoomUpdate,
  withRoomSeq
} from '@/lib/players/roomSync'

// Collapse bursts of status updates (rapid shot changes) into a leading
// and a trailing emit instead of one event per change (#1574).
const ROOM_UPDATE_THROTTLE_MS = 200
// How long broadcasts stay muted after applying a remote update: the
// component watchers on the applied refs fire on later ticks (some via
// nextTick or the next video time-update) and would echo the state back.
const REMOTE_APPLY_MUTE_MS = 500

const noop = () => {}

/**
 * @param {Object} options
 *
 * --- Required identity / transport ---
 * @param {import('vue').Ref<Object>|Object} options.room - reactive
 *   ref or plain reactive object holding the preview room. The
 *   composable reads `id`, `localId`, `people` and `newComer` from it.
 * @param {import('vue').Ref<string>|string} options.userId - the
 *   current user id.
 * @param {Object} options.socket - the socket.io client instance.
 *
 * --- Player state (read at broadcast time) ---
 *   All default to refs holding a neutral value so the composable can
 *   be instantiated without wiring every input.
 * @param {import('vue').Ref<boolean>} [options.isPlaying]
 * @param {import('vue').Ref<number>} [options.playingEntityIndex]
 * @param {import('vue').Ref<Object>} [options.currentEntity]
 * @param {import('vue').Ref<Object>} [options.currentPreview]
 * @param {import('vue').Ref<number>} [options.currentPreviewIndex]
 * @param {import('vue').Ref<number>} [options.currentFrame] - frame
 *   number for movie or picture (the mixin's `currentFrameMovieOrPicture`).
 * @param {import('vue').Ref<boolean>} [options.isRepeating]
 * @param {import('vue').Ref<boolean>} [options.isLaserModeOn]
 * @param {import('vue').Ref<boolean>} [options.isAnnotationsDisplayed]
 * @param {import('vue').Ref<boolean>} [options.isWaveformDisplayed]
 * @param {import('vue').Ref<boolean>} [options.isZoomEnabled]
 * @param {import('vue').Ref<number>} [options.handleIn]
 * @param {import('vue').Ref<number>} [options.handleOut]
 * @param {import('vue').Ref<number>} [options.speed]
 * @param {import('vue').Ref<boolean>} [options.isComparing]
 * @param {import('vue').Ref<string>} [options.taskTypeToCompare]
 * @param {import('vue').Ref<Object>} [options.revisionToCompare]
 * @param {import('vue').Ref<string>} [options.comparisonMode]
 * @param {import('vue').Ref<number>} [options.currentComparisonPreviewIndex]
 *
 * --- Player callbacks (invoked when applying remote state) ---
 * @param {Function} [options.playEntity]
 * @param {Function} [options.pause]
 * @param {Function} [options.play]
 * @param {Function} [options.setPlayerSpeed]
 * @param {Function} [options.syncComparisonPlayer]
 * @param {Function} [options.updateProgressBar]
 * @param {Function} [options.onWindowResize]
 * @param {Function} [options.findEntity]
 * @param {Function} [options.changePreviewFile]
 * @param {Function} [options.setRawPlayerFrame] - replaces direct
 *   `this.rawPlayer.setCurrentFrame()` call from the mixin.
 * @param {Function} [options.setCurrentTimeRaw]
 * @param {Function} [options.exists] - existence helper from player
 *   mixin (`v => v !== undefined && v !== null`).
 * @param {import('vue').Ref<number>|number} [options.frameDuration]
 * @param {import('vue').Ref<Object>} [options.taskMap] - Vuex
 *   taskMap getter (Map of taskId → task).
 * @param {import('vue').Ref<boolean>} [options.isCurrentPreviewPicture]
 * @param {import('vue').Ref<number>} [options.framesSeenOfPicture] -
 *   writable ref that loadRoomCurrentFrame may bump on pictures.
 *
 * --- Annotation callbacks ---
 * @param {Function} [options.getAnnotation]
 * @param {Function} [options.getObjectById]
 * @param {Function} [options.loadAnnotation]
 * @param {Function} [options.addObjectToCanvas]
 * @param {Function} [options.removeObjectFromCanvas]
 * @param {Function} [options.updateObjectInCanvas]
 * @param {Function} [options.fadeObject]
 * @param {Function} [options.clearCanvas]
 *
 * --- Panzoom callbacks ---
 * @param {Function} [options.setPanZoom]
 * @param {Function} [options.setComparisonPanZoom]
 *
 * @returns {{
 *   joinedRoom: import('vue').ComputedRef<string|undefined>,
 *   openRoom: Function,
 *   closeRoom: Function,
 *   joinRoom: Function,
 *   leaveRoom: Function,
 *   updateRoomStatus: Function,
 *   postPanZoomChanged: Function,
 *   postComparisonPanZoomChanged: Function,
 *   loadRoomCurrentState: Function,
 *   loadRoomCurrentFrame: Function
 * }}
 */
export const usePreviewRoom = options => {
  const {
    // identity / transport
    room,
    userId,
    socket,

    // player state
    isPlaying = ref(false),
    playingEntityIndex = ref(null),
    currentEntity = ref(null),
    currentPreview = ref(null),
    currentPreviewIndex = ref(0),
    currentFrame = ref(0),
    isRepeating = ref(false),
    isLaserModeOn = ref(false),
    isAnnotationsDisplayed = ref(true),
    isWaveformDisplayed = ref(false),
    isZoomEnabled = ref(false),
    handleIn = ref(null),
    handleOut = ref(null),
    speed = ref(3),
    isComparing = ref(false),
    taskTypeToCompare = ref(null),
    revisionToCompare = ref(null),
    comparisonMode = ref(null),
    currentComparisonPreviewIndex = ref(0),

    // player callbacks
    playEntity = noop,
    pause = noop,
    play = noop,
    setPlayerSpeed = noop,
    syncComparisonPlayer = null,
    updateProgressBar = noop,
    onWindowResize = noop,
    findEntity = () => null,
    findEntityIndex = () => -1,
    changePreviewFile = noop,
    setRawPlayerFrame = noop,
    setCurrentTimeRaw = noop,
    exists = v => v !== undefined && v !== null,
    frameDuration = ref(1 / 25),
    taskMap = ref(new Map()),
    isCurrentPreviewPicture = ref(false),
    framesSeenOfPicture = ref(0),

    // annotation callbacks
    getAnnotation = () => null,
    getObjectById = () => null,
    loadAnnotation = noop,
    addObjectToCanvas = () => Promise.resolve(null),
    removeObjectFromCanvas = noop,
    updateObjectInCanvas = noop,
    fadeObject = noop,
    clearCanvas = noop,

    // panzoom callbacks
    setPanZoom = noop,
    setComparisonPanZoom = noop
  } = options

  // ---- Event-storm guards (#1574) ----
  // See lib/players/roomSync.js for the sequence scheme.

  let localSeq = 0
  let lastAppliedSeq = 0
  let isApplyingRemoteUpdate = false
  let applyMuteTimer = null
  let pendingEmitTimer = null
  let lastEmitTime = 0
  let pendingPreviousPreviewFileId = null

  // ---- Computed ----

  const joinedRoom = computed(() => {
    const r = unref(room)
    const uid = unref(userId)
    if (!r?.people) return undefined
    return r.people.find(id => id === uid)
  })

  // ---- Room lifecycle ----

  const openRoom = playlistId => {
    const r = unref(room)
    socket.emit(PREVIEW_ROOM_EVENTS.openPlaylist, {
      playlist_id: playlistId || r?.id,
      user_id: unref(userId)
    })
  }

  const closeRoom = playlistId => {
    socket.emit(PREVIEW_ROOM_EVENTS.closePlaylist, {
      playlist_id: playlistId,
      user_id: unref(userId)
    })
  }

  const joinRoom = () => {
    const r = unref(room)
    if (!isValidRoomId(r)) return
    const entity = unref(currentEntity)
    const preview = unref(currentPreview)
    socket.emit(PREVIEW_ROOM_EVENTS.join, {
      user_id: unref(userId),
      playlist_id: r.id,
      is_playing: unref(isPlaying),
      current_entity_id: entity?.id,
      current_entity_index: unref(playingEntityIndex),
      current_preview_file_id: preview ? preview.id : null,
      current_preview_file_index: unref(currentPreviewIndex),
      current_frame: unref(currentFrame),
      is_repeating: unref(isRepeating),
      is_laser_mode: unref(isLaserModeOn),
      is_annotations_displayed: unref(isAnnotationsDisplayed),
      is_waveform_displayed: unref(isWaveformDisplayed),
      is_zoom_enabled: unref(isZoomEnabled),
      handle_in: unref(handleIn),
      handle_out: unref(handleOut),
      speed: unref(speed),
      comparing: {
        enable: unref(isComparing),
        task_type: unref(taskTypeToCompare),
        revision: unref(revisionToCompare),
        mode: unref(comparisonMode),
        comparison_preview_index: unref(currentComparisonPreviewIndex)
      }
    })
  }

  const leaveRoom = playlistId => {
    const uid = unref(userId)
    if (!uid) return
    const r = unref(room)
    socket.emit(PREVIEW_ROOM_EVENTS.leave, {
      user_id: uid,
      playlist_id: playlistId || r?.id
    })
  }

  // ---- Broadcasts ----

  const emitRoomStatus = () => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    const entity = unref(currentEntity)
    const preview = unref(currentPreview)
    const previousPreviewFileId = pendingPreviousPreviewFileId
    pendingPreviousPreviewFileId = null
    socket.emit(PREVIEW_ROOM_EVENTS.roomUpdated, {
      user_id: unref(userId),
      // The sequence rides inside local_id because the Zou relay only
      // passes whitelisted fields through (see lib/players/roomSync.js).
      local_id: withRoomSeq(r.localId, localSeq),
      room_seq: localSeq,
      playlist_id: r.id,
      is_playing: unref(isPlaying),
      current_entity_id: entity?.id,
      current_entity_index: unref(playingEntityIndex),
      current_preview_file_index: unref(currentPreviewIndex),
      current_preview_file_id: preview ? preview.id : null,
      previous_preview_file_id: previousPreviewFileId,
      current_frame: unref(currentFrame),
      is_repeating: unref(isRepeating),
      is_laser_mode: unref(isLaserModeOn),
      is_annotations_displayed: unref(isAnnotationsDisplayed),
      is_waveform_displayed: unref(isWaveformDisplayed),
      is_zoom_enabled: unref(isZoomEnabled),
      handle_in: unref(handleIn),
      handle_out: unref(handleOut),
      speed: unref(speed),
      comparing: {
        enable: unref(isComparing),
        task_type: unref(taskTypeToCompare),
        revision: unref(revisionToCompare),
        mode: unref(comparisonMode),
        comparison_preview_index: unref(currentComparisonPreviewIndex)
      }
    })
  }

  const updateRoomStatus = (previousPreviewFileId = null) => {
    // Never re-broadcast a state just applied from the network: the
    // watchers on the applied refs would echo it back and two clients
    // would replay each other's updates forever (#1574).
    if (isApplyingRemoteUpdate) return
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    // Stamp the action now so queued remote echoes older than the user's
    // latest action are dropped even while the emit is throttled.
    localSeq = nextRoomSeq(localSeq, lastAppliedSeq)
    if (previousPreviewFileId !== null) {
      pendingPreviousPreviewFileId = previousPreviewFileId
    }
    const elapsed = Date.now() - lastEmitTime
    if (elapsed >= ROOM_UPDATE_THROTTLE_MS) {
      lastEmitTime = Date.now()
      emitRoomStatus()
    } else if (!pendingEmitTimer) {
      pendingEmitTimer = setTimeout(() => {
        pendingEmitTimer = null
        lastEmitTime = Date.now()
        emitRoomStatus()
      }, ROOM_UPDATE_THROTTLE_MS - elapsed)
    }
  }

  const postPanZoomChanged = (x, y, zoom) => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    socket.emit(PREVIEW_ROOM_EVENTS.panzoomChanged, {
      playlist_id: r.id,
      data: { local_id: r.localId, user_id: unref(userId), x, y, zoom }
    })
  }

  const postComparisonPanZoomChanged = (x, y, zoom) => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    socket.emit(PREVIEW_ROOM_EVENTS.comparisonPanzoomChanged, {
      playlist_id: r.id,
      data: { local_id: r.localId, user_id: unref(userId), x, y, zoom }
    })
  }

  // ---- Apply remote state ----

  const getPreviewFileFromEntity = (entity, previewFileId) => {
    if (!entity) return null
    const files = Object.values(entity.preview_files || {}).flat()
    return files.find(file => file.id === previewFileId) || null
  }

  const loadRoomCurrentFrame = eventData => {
    const fd = unref(frameDuration)
    if (eventData.current_frame !== unref(currentFrame)) {
      const frameNumber = eventData.current_frame - 1
      setRawPlayerFrame(frameNumber)
      setCurrentTimeRaw(frameNumber * fd + 0.01)
      if (syncComparisonPlayer) syncComparisonPlayer()
      updateProgressBar()

      clearCanvas()
      const annotation = getAnnotation(frameNumber * fd)
      if (annotation) loadAnnotation(annotation)
    } else if (
      unref(isCurrentPreviewPicture) &&
      eventData.current_frame !== unref(framesSeenOfPicture)
    ) {
      // framesSeenOfPicture is expected to be a writable ref owned by
      // the consumer; mutate via .value if so, otherwise no-op.
      if (framesSeenOfPicture && 'value' in framesSeenOfPicture) {
        framesSeenOfPicture.value = eventData.current_frame
      }
    }
  }

  const loadRoomCurrentState = eventData => {
    if (eventData.is_playing !== unref(isPlaying) && !eventData.is_playing) {
      // Pause first to avoid screen flicker.
      pause()
    }

    const preview = unref(currentPreview)
    const currentPreviewFileId = preview ? preview.id : null

    let isEntityChanged = false

    // Resolve the target entity by id, not by the sender's index: a
    // task-type change rebuilds the receiver's playlist from the backend,
    // which can return the shots in a different order than the sender's
    // (the sender mutates in place). A raw index would then point at the
    // wrong entity and the two screens would fight each other. Fall back to
    // the index for older senders or when the entity isn't found locally.
    let targetIndex = -1
    if (exists(eventData.current_entity_id)) {
      targetIndex = findEntityIndex({
        entity_id: eventData.current_entity_id,
        preview_file_id: eventData.current_preview_file_id
      })
    }
    if (targetIndex < 0 && exists(eventData.current_entity_index)) {
      targetIndex = eventData.current_entity_index
    }
    if (targetIndex >= 0 && targetIndex !== unref(playingEntityIndex)) {
      playEntity(targetIndex)
      isEntityChanged = true
    } else if (
      exists(eventData.current_preview_file_id) &&
      eventData.current_preview_file_id !== currentPreviewFileId &&
      eventData.current_preview_file_index === 0
    ) {
      // The server relays room updates without previous_preview_file_id,
      // so fall back to the local playing entity: on this side it still
      // holds the preview file the sender switched away from.
      const previewFileId = eventData.current_preview_file_id
      let entity = findEntity({
        entity_id: eventData.current_entity_id,
        preview_file_id: eventData.previous_preview_file_id
      })
      const localEntity = unref(currentEntity)
      if (!entity && localEntity?.id === eventData.current_entity_id) {
        entity = localEntity
      }
      if (entity && entity.preview_file_id !== previewFileId) {
        const previewFile = getPreviewFileFromEntity(entity, previewFileId)
        const task = previewFile
          ? unref(taskMap)?.get?.(previewFile.task_id)
          : null
        if (task) changePreviewFile(entity, previewFile, task.task_type_id)
      }
    }

    if (
      exists(eventData.current_preview_file_index) &&
      eventData.current_preview_file_index !== unref(currentPreviewIndex) &&
      'value' in currentPreviewIndex
    ) {
      currentPreviewIndex.value = eventData.current_preview_file_index
      isEntityChanged = true
    }

    if (exists(eventData.current_frame)) {
      // Mirror the mixin's double-nextTick to let DOM / player settle.
      Promise.resolve().then(() => {
        loadRoomCurrentFrame(eventData)
        if (isEntityChanged) {
          Promise.resolve().then(() => {
            updateProgressBar()
            onWindowResize()
          })
        }
      })
    }

    const writeIfDifferent = (refObj, value) => {
      if (refObj && 'value' in refObj && refObj.value !== value) {
        refObj.value = value
      }
    }

    if (
      exists(eventData.is_repeating) &&
      eventData.is_repeating !== unref(isRepeating)
    ) {
      writeIfDifferent(isRepeating, eventData.is_repeating)
    }

    if (exists(eventData.speed) && eventData.speed !== unref(speed)) {
      writeIfDifferent(speed, eventData.speed)
      let rate = 1
      if (eventData.speed === 2) rate = 0.5
      if (eventData.speed === 1) rate = 0.25
      setPlayerSpeed(rate)
    }

    if (exists(eventData.comparing)) {
      writeIfDifferent(isComparing, eventData.comparing.enable)
      writeIfDifferent(taskTypeToCompare, eventData.comparing.task_type)
      writeIfDifferent(revisionToCompare, eventData.comparing.revision)
      writeIfDifferent(comparisonMode, eventData.comparing.mode)
      writeIfDifferent(
        currentComparisonPreviewIndex,
        eventData.comparing.comparison_preview_index
      )
    }

    if (eventData.is_playing !== unref(isPlaying)) {
      if (eventData.is_playing) play()
      else pause()
    }

    if (
      exists(eventData.is_waveform_displayed) &&
      eventData.is_waveform_displayed !== unref(isWaveformDisplayed)
    ) {
      writeIfDifferent(isWaveformDisplayed, eventData.is_waveform_displayed)
    }

    if (
      exists(eventData.is_laser_mode) &&
      eventData.is_laser_mode !== unref(isLaserModeOn)
    ) {
      writeIfDifferent(isLaserModeOn, eventData.is_laser_mode)
    }

    if (
      exists(eventData.is_annotations_displayed) &&
      eventData.is_annotations_displayed !== unref(isAnnotationsDisplayed)
    ) {
      writeIfDifferent(
        isAnnotationsDisplayed,
        eventData.is_annotations_displayed
      )
    }

    if (
      exists(eventData.is_zoom_enabled) &&
      eventData.is_zoom_enabled !== unref(isZoomEnabled)
    ) {
      writeIfDifferent(isZoomEnabled, eventData.is_zoom_enabled)
    }

    if (
      exists(eventData.handle_in) &&
      eventData.handle_in !== unref(handleIn)
    ) {
      writeIfDifferent(handleIn, eventData.handle_in)
    }

    if (
      exists(eventData.handle_out) &&
      eventData.handle_out !== unref(handleOut)
    ) {
      writeIfDifferent(handleOut, eventData.handle_out)
    }
  }

  // ---- Socket handlers (auto-registered) ----

  const onRoomPeopleUpdated = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r)) return
    r.people = eventData.people
    if (joinedRoom.value) r.newComer = false
  }

  const onRoomUpdated = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r)) return
    if (!joinedRoom.value) return
    if (eventData.only_newcomer && !r.newComer) return
    const accepted = shouldApplyRoomUpdate({
      localId: r.localId,
      localSeq,
      lastAppliedSeq,
      eventData
    })
    if (!accepted) return
    const seq = roomSeqOf(eventData)
    if (seq !== null) lastAppliedSeq = seq
    // A newer remote state supersedes any throttled outgoing broadcast.
    if (pendingEmitTimer) {
      clearTimeout(pendingEmitTimer)
      pendingEmitTimer = null
    }
    isApplyingRemoteUpdate = true
    clearTimeout(applyMuteTimer)
    try {
      loadRoomCurrentState(eventData)
    } finally {
      applyMuteTimer = setTimeout(() => {
        isApplyingRemoteUpdate = false
      }, REMOTE_APPLY_MUTE_MS)
    }
  }

  const onPanzoomChanged = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    if (r.localId === eventData.local_id) return
    const { x, y, zoom } = eventData.data
    setPanZoom(x, y, zoom)
  }

  const onComparisonPanzoomChanged = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    if (r.localId === eventData.local_id) return
    const { x, y, zoom } = eventData.data
    setComparisonPanZoom(x, y, zoom)
  }

  const onAddAnnotation = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    if (r.localId === eventData.data?.local_id) return
    const annotation = getAnnotation(eventData.data.time)
    const obj = eventData.data.obj
    if (getObjectById(obj.id)) return
    // Fade on the SENDER's laser flag: keying off the receiver's own
    // toggle made presenter laser gestures permanent on every other
    // screen, and faded real notes for a laser-holding viewer.
    if (eventData.data.laser) {
      const result = addObjectToCanvas(annotation, obj)
      if (result && typeof result.then === 'function') {
        result.then(o => fadeObject(o))
      }
    } else {
      addObjectToCanvas(annotation, obj)
    }
  }

  const onRemoveAnnotation = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    if (r.localId === eventData.data?.local_id) return
    const obj = eventData.data.obj
    if (!getObjectById(obj.id)) return
    removeObjectFromCanvas(obj)
  }

  const onUpdateAnnotation = eventData => {
    const r = unref(room)
    if (!isValidRoomId(r) || !joinedRoom.value) return
    if (r.localId === eventData.data?.local_id) return
    const annotation = getAnnotation(eventData.data.time)
    const obj = eventData.data.obj
    updateObjectInCanvas(annotation, obj)
  }

  // Bound (event name, handler) pairs — stored so unmount can pass the
  // exact same function references to socket.off().
  const handlerPairs = [
    [PREVIEW_ROOM_EVENTS.roomPeopleUpdated, onRoomPeopleUpdated],
    [PREVIEW_ROOM_EVENTS.roomUpdated, onRoomUpdated],
    [PREVIEW_ROOM_EVENTS.panzoomChanged, onPanzoomChanged],
    [PREVIEW_ROOM_EVENTS.comparisonPanzoomChanged, onComparisonPanzoomChanged],
    [PREVIEW_ROOM_EVENTS.addAnnotation, onAddAnnotation],
    [PREVIEW_ROOM_EVENTS.removeAnnotation, onRemoveAnnotation],
    [PREVIEW_ROOM_EVENTS.updateAnnotation, onUpdateAnnotation]
  ]

  onMounted(() => {
    handlerPairs.forEach(([event, handler]) => socket.on(event, handler))
  })

  onBeforeUnmount(() => {
    handlerPairs.forEach(([event, handler]) => socket.off(event, handler))
    clearTimeout(pendingEmitTimer)
    clearTimeout(applyMuteTimer)
  })

  return {
    joinedRoom,
    openRoom,
    closeRoom,
    joinRoom,
    leaveRoom,
    updateRoomStatus,
    postPanZoomChanged,
    postComparisonPanZoomChanged,
    loadRoomCurrentState,
    loadRoomCurrentFrame
  }
}
