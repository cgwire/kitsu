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
      <div
        class="entity-status"
        :key="`progress-entity-${entity.id}`"
        :style="{
          left: getEntityPosition(entity) + '%',
          width: getEntityWidth(entity) + '%',
          'background-color': getEntityColor(entity)
        }"
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
        v-for="entity in entityList"
      >
        <span>
          {{ getFullEntityName(entity) }}
        </span>
      </div>
      <span
        class="playlist-progress-position"
        :style="{
          left:
            'calc(' + (100 * playlistProgress) / playlistDuration + '% - 3px)'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
      >
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

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
const isTileLoading = ref(false)
const playlistProgressDragging = ref(false)
const playlistProgressWidget = ref(null)
const progressDragging = ref(false)
const width = ref(0)

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

const tilePath = computed(
  () =>
    `${props.urlPrefix || '/api'}/movies/tiles/preview-files/${props.previewId}.png`
)

const frameNumberStyle = computed(() => {
  const frameHeight = 100
  const height = frameHeight + 30
  let frameWidth = 150
  const preview = props.playlistShotPosition[hoverFrame.value]
  if (!preview) return {}
  if (preview.extension === 'mp4') {
    const ratio = preview.width / preview.height
    frameWidth = Math.ceil(frameHeight * ratio)
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

const getFrameBackgroundStyle = frame => {
  if (!frame || !props.playlistShotPosition[frame]) return {}
  const {
    id,
    extension,
    width: pw,
    height: ph
  } = props.playlistShotPosition[frame]

  frame = frame - props.playlistShotPosition[frame].start * props.fps
  if (props.nbFrames >= 3840) {
    frame = Math.ceil(frame / Math.ceil(props.nbFrames / 3840))
  }
  const frameX = frame % 8
  const frameY = Math.floor(frame / 8)
  const frameHeight = 100
  const base = props.urlPrefix || '/api'

  if (extension === 'png') {
    const tp = `${base}/pictures/thumbnails/preview-files/${id}.png`
    return {
      background: `url(${tp})`,
      'background-position': '0 0',
      width: '150px'
    }
  } else if (extension === 'mp4') {
    const ratio = pw / ph
    const frameWidth = Math.ceil(frameHeight * ratio)
    const tp = `${base}/movies/tiles/preview-files/${id}.png`
    return {
      background: `url(${tp})`,
      'background-position': `-${frameX * frameWidth}px -${
        frameY * frameHeight
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
  () => props.previewId,
  () => {
    if (props.previewId) {
      const preview = props.playlistShotPosition[hoverFrame.value]
      if (preview.extension === 'mp4') {
        isTileLoading.value = true
        const img = new Image()
        img.src = tilePath.value
        img.onload = () => {
          isTileLoading.value = false
        }
      }
    }
  },
  { immediate: true }
)

watch(
  () => props.entityList,
  () => resetWidth()
)

onMounted(() => {
  domEvents.forEach(([type, listener]) =>
    document.addEventListener(type, listener)
  )
  new ResizeObserver(resetWidth).observe(playlistProgressWidget.value)
  resetWidth()
})

onBeforeUnmount(() => {
  domEvents.forEach(([type, listener]) =>
    document.removeEventListener(type, listener)
  )
})
</script>

<style lang="scss" scoped>
.frame-number {
  background: $black;
  border-radius: 5px;
  color: $white;
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

.playlist-progress-position {
  border-left: 5px solid $green;
  position: absolute;
  height: 6px;
  border-radius: 50%;
  z-index: 3;
  top: -2px;
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
  border-right: 3px solid $dark-grey;
  position: absolute;
  bottom: 0;
  transition: height 0.3s ease-in-out;
  height: 16px;
  z-index: 2;
  opacity: 0.4;

  span {
    background: $dark-grey;
    border-radius: 5px;
    color: $white;
    display: none;
    padding: 0.2em 0.5em;
    position: absolute;
    top: -30px;
  }

  &:hover {
    opacity: 1;
    span {
      display: block;
    }
  }
}
</style>
