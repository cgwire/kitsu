<template>
  <div
    ref="container"
    class="preview-viewer dark"
    :style="{
      maxHeight: isFullScreen ? `calc(100vh - ${marginBottom}px)` : null
    }"
  >
    <div
      class="center status-message"
      :style="{ height: defaultHeight + 'px' }"
      v-if="isBroken"
    >
      <p>{{ $t('preview.broken') }}</p>
    </div>

    <div
      class="center status-message"
      :style="{ height: defaultHeight + 'px' }"
      :title="$t('preview.processing')"
      v-if="isProcessing"
    >
      <spinner :is-processing="true" />
    </div>

    <video-viewer
      ref="videoViewer"
      class="video-viewer"
      :fps="fps"
      :name="name"
      :big="isBig"
      :default-height="defaultHeight"
      :full-screen="isFullScreen"
      :is-comparing="isComparing"
      :is-comparison-overlay="isComparisonOverlay"
      :is-hd="isHd"
      :is-muted="isMuted"
      :is-repeating="isRepeating"
      :light="isLight"
      :current-frame="currentFrame"
      :nb-frames="nbFrames"
      :panzoom="true"
      :preview="preview"
      @duration-changed="duration => $emit('duration-changed', duration)"
      @frame-update="frameNumber => $emit('frame-update', frameNumber)"
      @panzoom-changed="onVideoPanzoomChanged"
      @panzoom-ready="$emit('panzoom-ready')"
      @play-ended="$emit('play-ended')"
      @size-changed="onVideoSizeChanged"
      @video-end="$emit('video-end')"
      @video-loaded="$emit('video-loaded')"
      v-show="isMovie"
    />

    <picture-viewer
      ref="pictureViewer"
      :big="isBig"
      :default-height="defaultHeight"
      :full-screen="isFullScreen"
      :is-comparing="isComparing"
      :light="isLight"
      :margin-bottom="marginBottom"
      :panzoom="true"
      :preview="preview"
      @loaded="$emit('picture-loaded')"
      @panzoom-changed="onPicturePanzoomChanged"
      @panzoom-ready="$emit('panzoom-ready')"
      @size-changed="onPictureSizeChanged"
      v-show="isPicture"
    />

    <object-viewer
      ref="objectViewer"
      class="model-viewer"
      :background-url="backgroundUrl"
      :default-height="defaultHeight"
      :empty="!is3DModel"
      :full-screen="isFullScreen"
      :is-environment-skybox="isEnvironmentSkybox"
      :is-wireframe="isWireframe"
      :light="isLight"
      :preview-url="originalPath"
      @model-loaded="$emit('model-loaded')"
      v-if="is3DModel"
    />

    <sound-viewer
      ref="soundViewer"
      class="sound-viewer"
      :file-name="fileTitle"
      :preview-url="isSound ? originalPath : ''"
      @play-ended="$emit('play-ended')"
      v-show="isSound"
    />

    <pdf-viewer
      :preview="preview"
      :default-height="defaultHeight"
      v-if="isPdf"
    />

    <markdown-viewer
      :preview="preview"
      :default-height="defaultHeight"
      v-if="isMarkdown"
    />

    <diff-viewer
      :preview="preview"
      :default-height="defaultHeight"
      v-if="isDiff"
    />

    <div class="center" :style="{ height: defaultHeight + 'px' }" v-if="isFile">
      <a class="button mt2" :href="originalDlPath" :title="fileTitle">
        <download-icon class="icon" />
        <span class="text" :title="fileTitle">
          {{ $t('tasks.download_pdf_file', { extension }) }}
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DownloadIcon } from 'lucide-vue-next'

import {
  isDiffPreview,
  isMarkdownPreview,
  isModelPreview,
  isMoviePreview,
  isPdfPreview,
  isPicturePreview,
  isSoundPreview
} from '@/lib/preview'

/* eslint-disable no-unused-vars */
import DiffViewer from '@/components/players/viewers/DiffViewer.vue'
import MarkdownViewer from '@/components/players/viewers/MarkdownViewer.vue'
import ObjectViewer from '@/components/players/viewers/ObjectViewer.vue'
import PdfViewer from '@/components/players/viewers/PdfViewer.vue'
import PictureViewer from '@/components/players/viewers/PictureViewer.vue'
import SoundViewer from '@/components/players/viewers/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import VideoViewer from '@/components/players/viewers/VideoViewer.vue'
/* eslint-enable no-unused-vars */

const props = defineProps({
  currentFrame: {
    type: Number,
    default: 0
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  fps: {
    type: Number,
    default: null
  },
  isBig: {
    type: Boolean,
    default: false
  },
  isComparing: {
    type: Boolean,
    default: false
  },
  isComparisonOverlay: {
    type: Boolean,
    default: false
  },
  isEnvironmentSkybox: {
    type: Boolean,
    default: false
  },
  isFullScreen: {
    type: Boolean,
    default: false
  },
  isHd: {
    type: Boolean,
    default: false
  },
  isLight: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isObjectBackground: {
    type: Boolean,
    default: false
  },
  isRepeating: {
    type: Boolean,
    default: false
  },
  isWireframe: {
    type: Boolean,
    default: false
  },
  marginBottom: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
  },
  nbFrames: {
    type: Number,
    default: 0
  },
  objectBackgroundUrl: {
    type: String,
    default: ''
  },
  preview: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'duration-changed',
  'frame-update',
  'model-loaded',
  'panzoom-changed',
  'panzoom-ready',
  'picture-loaded',
  'play-ended',
  'size-changed',
  'video-end',
  'video-loaded'
])

const container = ref(null)
const videoViewer = ref(null)
const pictureViewer = ref(null)
const soundViewer = ref(null)
const objectViewer = ref(null)

let isPlaying = false

const backgroundUrl = computed(() =>
  props.isObjectBackground ? props.objectBackgroundUrl : undefined
)

const fileTitle = computed(() =>
  props.preview
    ? props.preview.original_name + '.' + props.preview.extension
    : ''
)

const extension = computed(() => (props.preview ? props.preview.extension : ''))

const status = computed(() =>
  props.preview && props.preview.status ? props.preview.status : 'ready'
)

const isBroken = computed(() => status.value === 'broken')
const isProcessing = computed(() => status.value === 'processing')
const isReady = computed(() => status.value === 'ready')
const isDiff = computed(() => isReady.value && isDiffPreview(extension.value))
const isMarkdown = computed(
  () => isReady.value && isMarkdownPreview(extension.value)
)
const isMovie = computed(() => isReady.value && isMoviePreview(extension.value))
const isPdf = computed(() => isReady.value && isPdfPreview(extension.value))
const isPicture = computed(
  () => isReady.value && isPicturePreview(extension.value)
)
const is3DModel = computed(
  () => isReady.value && isModelPreview(extension.value)
)
const isSound = computed(() => isReady.value && isSoundPreview(extension.value))

const isFile = computed(
  () =>
    isReady.value &&
    !isPicture.value &&
    !isMovie.value &&
    !is3DModel.value &&
    !isSound.value &&
    !isPdf.value &&
    !isMarkdown.value &&
    !isDiff.value
)

const originalPath = computed(() => {
  if (props.preview) {
    const previewId = props.preview.id
    const ext = extension.value ? extension.value : 'png'
    const type = isMovie.value ? 'movies' : 'pictures'
    return `/api/${type}/originals/preview-files/${previewId}.${ext}`
  } else {
    return ''
  }
})

const originalDlPath = computed(() => {
  if (props.preview) {
    const type = isMovie.value ? 'movies' : 'pictures'
    return `/api/${type}/originals/preview-files/${props.preview.id}/download`
  } else {
    return ''
  }
})

const resetVideo = () => {
  if (videoViewer.value) videoViewer.value.mountVideo()
}

const play = () => {
  isPlaying = true
  if (isMovie.value) videoViewer.value.play()
  if (isSound.value) soundViewer.value.play()
}

const pause = () => {
  isPlaying = false
  if (isMovie.value) videoViewer.value.pause()
  if (isSound.value) soundViewer.value.pause()
}

const playModelAnimation = animationName => {
  objectViewer.value.play(animationName)
}

const pauseModelAnimation = () => {
  objectViewer.value.pause()
}

const goPreviousFrame = () => {
  return videoViewer.value.goPreviousFrame()
}

const goNextFrame = () => {
  return videoViewer.value.goNextFrame()
}

const onPlayPauseClicked = () => {
  if (!isPlaying) {
    play()
  } else {
    pause()
  }
}

const get3DAnimations = () => {
  return objectViewer.value.getAnimations()
}

const getNaturalDimensions = () => {
  if (isMovie.value) {
    return videoViewer.value.getNaturalDimensions()
  } else {
    return pictureViewer.value.getNaturalDimensions()
  }
}

const getDimensions = () => {
  const dimensions = { width: 0, height: 0 }
  if (container.value) {
    dimensions.width = container.value.offsetWidth
    dimensions.height = container.value.offsetHeight
  }
  return dimensions
}

const resize = () => {
  if (isPicture.value) pictureViewer.value?.resetPicture()
  else if (isMovie.value) videoViewer.value?.resetSize()
}

const currentMediaElement = computed(() => {
  if (isMovie.value) return videoViewer.value?.video || null
  if (isPicture.value) return pictureViewer.value?.visibleImage || null
  return null
})

const setCurrentFrame = frameNumber => {
  videoViewer.value.setCurrentFrame(frameNumber)
}

const onPictureSizeChanged = dimensions => {
  dimensions.source = 'picture'
  emit('size-changed', dimensions)
}

const onVideoSizeChanged = dimensions => {
  dimensions.source = 'movie'
  emit('size-changed', dimensions)
}

const onVideoPanzoomChanged = event => {
  if (!isMovie.value) return
  emit('panzoom-changed', event)
}

const onPicturePanzoomChanged = event => {
  if (!isPicture.value) return
  emit('panzoom-changed', event)
}

const setCurrentTimeRawValue = time => {
  videoViewer.value.setCurrentTimeRaw(time)
}

const getCurrentTimeRaw = () => {
  return isMovie.value ? videoViewer.value.currentTimeRaw : 0
}

const extractFrame = (canvas, frame) => {
  videoViewer.value.setCurrentFrame(frame)
  const video = videoViewer.value.video
  const context = canvas.getContext('2d')
  const dimensions = videoViewer.value.getNaturalDimensions()
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
}

const extractPicture = canvas => {
  if (!pictureViewer.value) return
  const image = pictureViewer.value.getPictureElement()
  if (!image) return
  const context = canvas.getContext('2d')
  const { width, height } = pictureViewer.value.getNaturalDimensions()
  canvas.width = width
  canvas.height = height
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
}

const resetZoom = () => {
  if (pictureViewer.value) pictureViewer.value.resetPanZoom()
  if (videoViewer.value) videoViewer.value.resetPanZoom()
}

const setPanZoom = (x, y, scale) => {
  if (pictureViewer.value) pictureViewer.value.setPanZoom(x, y, scale)
  if (videoViewer.value) videoViewer.value.setPanZoom(x, y, scale)
}

const pauseZoom = () => {
  if (pictureViewer.value) pictureViewer.value.pausePanZoom()
  if (videoViewer.value) videoViewer.value.pausePanZoom()
}

const resumeZoom = () => {
  if (pictureViewer.value) pictureViewer.value.resumePanZoom()
  if (videoViewer.value) videoViewer.value.resumePanZoom()
}

const setSpeed = rate => {
  if (videoViewer.value) videoViewer.value.setSpeed(rate)
}

const setVolume = volume => {
  if (videoViewer.value) videoViewer.value.setVolume(volume)
}

watch(
  () => props.preview,
  () => {
    if (isMovie.value) {
      pause()
    } else if (isPicture.value) {
      pause()
      setTimeout(() => {
        if (pictureViewer.value) pictureViewer.value.resetPicture()
      }, 10)
    }
  }
)

defineExpose({
  isBroken,
  container,
  videoViewer,
  pictureViewer,
  currentMediaElement,
  resetVideo,
  play,
  pause,
  playModelAnimation,
  pauseModelAnimation,
  goPreviousFrame,
  goNextFrame,
  onPlayPauseClicked,
  get3DAnimations,
  getNaturalDimensions,
  getDimensions,
  resize,
  setCurrentFrame,
  setCurrentTimeRaw: setCurrentTimeRawValue,
  getCurrentTimeRaw,
  extractFrame,
  extractPicture,
  resetZoom,
  setPanZoom,
  pauseZoom,
  resumeZoom,
  setSpeed,
  setVolume
})
</script>

<style lang="scss" scoped>
.video-viewer {
  width: 100%;
  text-align: center;
  background: $dark-grey-stronger;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-message {
  color: $white;
}

.preview-viewer {
  background: $dark-grey-light;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  min-height: 200px;
}
</style>
