<template>
  <div class="unselectable">
    <div class="frame-number-rail">
      <span
        class="frame-number"
        :style="frameNumberStyle"
        v-show="
          isFrameNumberVisible &&
          hoverFrame > 0 &&
          !progressDragging &&
          !playlistProgressDragging
        "
      >
        {{ hoverFrame }}
        <span
          class="frame-tile"
          :style="getFrameBackgroundStyle(hoverFrame)"
          v-if="!isTileLoading"
        ></span>
        <spinner class="mt2" v-else />
      </span>
    </div>
    <div
      ref="playlistProgressWidget"
      class="playlist-progress"
      @click="onPlaylistProgressClicked"
      @mouseenter="isFrameNumberVisible = true"
      @mouseleave="isFrameNumberVisible = false"
      @touchend="isFrameNumberVisible = false"
      @touchcancel="isFrameNumberVisible = false"
      @mousedown="startPlaylistProgressDrag"
      @touchstart="
        () => {
          startPlaylistProgressDrag()
          isFrameNumberVisible = true
        }
      "
      v-show="entityList.length > 1 && playlistDuration > 0"
    >
      <!-- Hover visibility is owned by the wrapper: per-child enter/leave
           handlers flicker the thumbnail when the cursor crosses segment
           boundaries while still inside the bar. -->
      <div
        class="entity-status"
        :class="{ current: index === currentEntityIndex }"
        :key="`progress-entity-${entity.id}-${entity.preview_file_id}`"
        :style="{
          left: getEntityPosition(entity) + '%',
          width: getEntityWidth(entity) + '%',
          'background-color': getEntityColor(entity)
        }"
        @mousedown="startPlaylistProgressDrag"
        @touchstart="startPlaylistProgressDrag"
        v-for="(entity, index) in entityList"
      >
        <span>
          {{ getFullEntityName(entity) }}
        </span>
      </div>
      <span
        class="playlist-progress-elapsed"
        :style="{
          width: (100 * playlistProgress) / playlistDuration + '%'
        }"
      >
      </span>
      <span
        class="playlist-progress-position"
        :style="{
          left:
            'calc(' + (100 * playlistProgress) / playlistDuration + '% - 1px)'
        }"
      >
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import {
  getTileCellIndex,
  getTileGeometry,
  TILE_CELL_HEIGHT,
  TILE_COLUMNS
} from '@/lib/players/tiles'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  entityList: {
    default: () => [],
    type: Array
  },
  fps: {
    default: 0,
    type: Number
  },
  frameDuration: {
    default: 0,
    type: Number
  },
  isFullMode: {
    default: false,
    type: Boolean
  },
  isFullScreen: {
    default: false,
    type: Boolean
  },
  movieDimensions: {
    default: () => ({}),
    type: Object
  },
  nbFrames: {
    default: 0,
    type: Number
  },
  playlistDuration: {
    default: 0,
    type: Number
  },
  playlistProgress: {
    default: 0,
    type: Number
  },
  playlistShotPosition: {
    default: () => ({}),
    type: Object
  },
  previewId: {
    default: '',
    type: String
  },
  urlPrefix: {
    default: null,
    type: String
  }
})

const emit = defineEmits([
  'end-scrub',
  'progress-playlist-changed',
  'start-scrub'
])

const frameNumberLeftPosition = ref(0)
const hoverFrame = ref(0)
const isFrameNumberVisible = ref(false)
const playlistProgressDragging = ref(false)
const playlistProgressWidget = ref(null)
const progressDragging = ref(false)
const width = ref(0)

let playlistResizeObserver = null

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

const frameNumberStyle = computed(() => {
  const frameHeight = TILE_CELL_HEIGHT
  const height = frameHeight + 30
  let frameWidth = 150
  const preview = props.playlistShotPosition[hoverFrame.value]
  if (!preview) return {}
  if (preview.extension === 'mp4') {
    frameWidth =
      tileGeometries.value.get(preview.id)?.cellWidth ??
      Math.ceil(frameHeight * (preview.width / preview.height))
  } else if (preview.extension === 'png') {
    frameWidth = 150
  }
  const w = frameWidth + 10
  const left = Math.min(
    Math.max(frameNumberLeftPosition.value - frameWidth / 2, 0),
    width.value - frameWidth - 10
  )
  const top = props.isFullScreen ? `-${height + 2}px` : '16px'
  return {
    height: `${height}px`,
    width: `${w}px`,
    top,
    left: `${left}px`
  }
})

const resetWidth = () => {
  if (playlistProgressWidget.value) {
    const coords = playlistProgressWidget.value.getBoundingClientRect()
    width.value = coords.width
    setTimeout(() => {
      width.value = coords.width
    })
  }
}

const startPlaylistProgressDrag = () => {
  playlistProgressDragging.value = true
  emit('start-scrub')
}

const stopPlaylistProgressDrag = () => {
  playlistProgressDragging.value = false
  emit('end-scrub')
}

const stopProgressDrag = () => {
  progressDragging.value = false
  emit('end-scrub')
}

const getPlaylistMouseFrame = event => {
  if (width.value === 0) resetWidth()
  const left = playlistProgressWidget.value.getBoundingClientRect().left
  let position = getClientX(event) - left
  if (position > width.value) position = width.value - 1
  const ratio = position / width.value
  let duration = props.playlistDuration * ratio
  if (duration < 0) duration = 0
  const frameNumber = Math.floor(duration / props.frameDuration)
  return { frameNumber, position }
}

const doProgressDrag = event => {
  if (
    playlistProgressDragging.value ||
    isFrameNumberVisible.value ||
    (!progressDragging.value &&
      event.target.classList &&
      (event.target.classList.contains('playlist-progress') ||
        event.target.classList.contains('entity-status') ||
        event.target.classList.contains('playlist-progress-position')))
  ) {
    const { frameNumber } = getPlaylistMouseFrame(event)
    hoverFrame.value = frameNumber + 1
    // Kick the sprite load for the hovered preview even while the
    // spinner is shown (the tile span itself is v-if'd out then).
    const preview = props.playlistShotPosition[hoverFrame.value]
    if (preview?.extension === 'mp4') {
      const base = props.urlPrefix || '/api'
      ensureTileGeometry(
        preview.id,
        `${base}/movies/tiles/preview-files/${preview.id}.png`
      )
    }
    const allDuration = Math.round(props.playlistDuration * props.fps)
    frameNumberLeftPosition.value = (width.value / allDuration) * frameNumber
    if (playlistProgressDragging.value) {
      emit('progress-playlist-changed', frameNumber)
    }
  }
}

const onPlaylistProgressClicked = event => {
  const { frameNumber } = getPlaylistMouseFrame(event)
  emit('progress-playlist-changed', frameNumber)
}

// Measured sprite geometries per preview id — recomputing the cell width
// from stored dimensions drifts from the file the sprite was built from
// (source ratio ≠ production ratio, renormalisations).
const tileGeometries = ref(new Map())

const ensureTileGeometry = (id, tilePathUrl) => {
  if (tileGeometries.value.has(id)) return tileGeometries.value.get(id)
  tileGeometries.value.set(id, null)
  getTileGeometry(tilePathUrl).then(geometry => {
    if (!geometry) return
    const next = new Map(tileGeometries.value)
    next.set(id, geometry)
    tileGeometries.value = next
  })
  return null
}

// The hovered preview's sprite is still loading/measuring: show the
// spinner instead of a black not-yet-loaded background.
const isTileLoading = computed(() => {
  const preview = props.playlistShotPosition[hoverFrame.value]
  if (!preview || preview.extension !== 'mp4') return false
  return !tileGeometries.value.get(preview.id)
})

const getFrameBackgroundStyle = frame => {
  if (!frame || !props.playlistShotPosition[frame]) return {}
  const {
    id,
    extension,
    width: pw,
    height: ph
  } = props.playlistShotPosition[frame]

  frame = frame - props.playlistShotPosition[frame].start * props.fps
  const base = props.urlPrefix || '/api'

  if (extension === 'png') {
    const tp = `${base}/pictures/thumbnails/preview-files/${id}.png`
    return {
      background: `url(${tp})`,
      'background-position': '0 0',
      width: '150px'
    }
  } else if (extension === 'mp4') {
    const tp = `${base}/movies/tiles/preview-files/${id}.png`
    const geometry = ensureTileGeometry(id, tp)
    const frameWidth =
      geometry?.cellWidth ?? Math.ceil(TILE_CELL_HEIGHT * (pw / ph))
    const cellCount = geometry?.cellCount ?? 3840
    const cell = getTileCellIndex(frame, props.nbFrames, cellCount)
    const frameX = cell % TILE_COLUMNS
    const frameY = Math.floor(cell / TILE_COLUMNS)
    return {
      background: `url(${tp})`,
      'background-position': `-${frameX * frameWidth}px -${
        frameY * TILE_CELL_HEIGHT
      }px`,
      width: `${frameWidth}px`
    }
  } else {
    return { background: 'transparent' }
  }
}

const getEntityPosition = entity => {
  const ratio =
    (entity.start_duration - props.frameDuration) / props.playlistDuration
  return ratio * 100
}

const getEntityWidth = entity => {
  let ratio
  if (entity.preview_file_extension === 'mp4') {
    ratio = entity.preview_file_duration / props.playlistDuration
  } else if (entity.preview_nb_frames) {
    const duration = entity.preview_nb_frames * props.frameDuration
    ratio = duration / props.playlistDuration
  } else {
    ratio = (2 * props.fps * props.frameDuration) / props.playlistDuration
  }
  return ratio * 100
}

const getEntityColor = entity => {
  return entity.task_status_color
}

const getFullEntityName = entity => {
  return `${entity.parent_name} / ${entity.name}`.replaceAll(' ', ' ')
}

const currentEntityIndex = computed(() => {
  const time = props.playlistProgress
  return props.entityList.findIndex((entity, index) => {
    const start = entity.start_duration - props.frameDuration
    const next = props.entityList[index + 1]
    const end = next ? next.start_duration - props.frameDuration : Infinity
    return time >= start && time < end
  })
})

const domEvents = [
  ['mousemove', doProgressDrag],
  ['touchmove', doProgressDrag],
  ['mouseup', stopProgressDrag],
  ['mouseleave', stopProgressDrag],
  ['touchend', stopProgressDrag],
  ['touchcancel', stopProgressDrag],
  ['mouseup', stopPlaylistProgressDrag],
  ['mouseleave', stopPlaylistProgressDrag],
  ['touchend', stopPlaylistProgressDrag],
  ['touchcancel', stopPlaylistProgressDrag]
]

watch(
  () => props.entityList,
  () => resetWidth()
)

onMounted(() => {
  domEvents.forEach(([type, listener]) =>
    document.addEventListener(type, listener)
  )
  playlistResizeObserver = new ResizeObserver(resetWidth)
  playlistResizeObserver.observe(playlistProgressWidget.value)
  resetWidth()
})

onBeforeUnmount(() => {
  domEvents.forEach(([type, listener]) =>
    document.removeEventListener(type, listener)
  )
  playlistResizeObserver?.disconnect()
  playlistResizeObserver = null
})
</script>

<style lang="scss" scoped>
.frame-number {
  background: $black;
  border-radius: 5px;
  color: $white;
  // The thumbnail can overlap the bar (top: 16px when not fullscreen);
  // without this the cursor "enters" it, fires the bar's mouseleave and
  // the thumbnail flickers in a show/hide loop.
  pointer-events: none;
  position: absolute;
  padding: 0.3em;
  text-align: center;
  top: -300px;
  width: 110px;
  z-index: 800;
  display: flex;
  flex-direction: column;
  font-variant-numeric: tabular-nums;

  .frame-tile {
    display: inline-block;
    background-repeat: no-repeat;
    height: 100px;
  }
}

.playlist-progress {
  background: $dark-grey;
  border-bottom: 1px solid $dark-grey-light;
  border-top: 1px solid $dark-grey-light;
  cursor: pointer;
  height: 18px;
  width: 100%;
  position: relative;
  overflow: visible;
  transition: height 0.2s ease-in-out;
  // A horizontal pen / touch drag along the timeline would otherwise
  // trigger Chrome's two-finger swipe gesture and navigate back / forward,
  // dropping any unsaved comment text — issue #1700.
  overscroll-behavior-x: contain;
  touch-action: pan-y;
}

// Translucent veil over the already-played part of the strip, so the
// position reads at a glance without hiding the status colors.
.playlist-progress-elapsed {
  background: rgba(255, 255, 255, 0.16);
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  z-index: 3;
}

.playlist-progress-position {
  background: $white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
  // Flush with the bar bottom: overflowing below made the hover
  // thumbnail flicker on the bar's last pixel row.
  height: 22px;
  pointer-events: none;
  position: absolute;
  top: -4px;
  width: 2px;
  z-index: 4;

  // Small grab handle on top of the playhead line.
  &::before {
    background: $white;
    border-radius: 2px;
    content: '';
    height: 5px;
    left: -2px;
    position: absolute;
    top: 0;
    width: 6px;
  }
}

.frame-number-rail {
  position: relative;
  font-variant-numeric: tabular-nums;
}

// Touch devices fire `touchstart` on the progress bar but never a clean
// hover-leave, so the frame thumbnail would otherwise stick on screen.
// Hide it entirely on hoverless / coarse pointers.
@media (hover: none), (pointer: coarse) {
  .frame-number {
    display: none !important;
  }
}

.entity-status {
  border-left: 0;
  border-right: 2px solid $dark-grey;
  position: absolute;
  bottom: 0;
  transition:
    height 0.3s ease-in-out,
    opacity 0.2s ease-in-out;
  height: 14px;
  z-index: 2;
  opacity: 0.55;

  span {
    background: $dark-grey;
    border-radius: 5px;
    // The segment constrains the tooltip's width: without nowrap a long
    // name wraps inside a narrow segment and spills over the timeline.
    white-space: nowrap;
    bottom: calc(100% + 6px);
    color: $white;
    display: none;
    padding: 0.2em 0.5em;
    position: absolute;
    z-index: 5;
  }

  // The currently-playing entity stands out: full status color, full
  // strip height.
  &.current {
    height: 18px;
    opacity: 1;
  }

  &:hover {
    opacity: 1;
    span {
      display: block;
    }
  }
}
</style>
