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
      ref="video-viewer"
      class="video-viewer"
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
      @play-ended="$emit('play-ended')"
      @size-changed="onVideoSizeChanged"
      @video-end="$emit('video-end')"
      @video-loaded="$emit('video-loaded')"
      v-show="isMovie"
    />

    <picture-viewer
      ref="picture-viewer"
      :big="isBig"
      :default-height="defaultHeight"
      :full-screen="isFullScreen"
      :is-comparing="isComparing"
      :light="isLight"
      :margin-bottom="marginBottom"
      :panzoom="true"
      :preview="preview"
      @size-changed="onPictureSizeChanged"
      v-show="isPicture"
    />

    <object-viewer
      ref="object-viewer"
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
      ref="sound-viewer"
      class="sound-viewer"
      :file-name="fileTitle"
      :preview-url="isSound ? originalPath : ''"
      @play-ended="$emit('play-ended')"
      v-show="isSound"
    />

    <div class="center" :style="{ height: defaultHeight + 'px' }" v-if="isFile">
      <a
        class="button mt2"
        ref="preview-file"
        :href="originalDlPath"
        :title="fileTitle"
      >
        <download-icon class="icon" />
        <span class="text" :title="fileTitle">
          {{ $t('tasks.download_pdf_file', { extension }) }}
        </span>
      </a>
    </div>
  </div>
</template>

<script>
import { DownloadIcon } from 'lucide-vue-next'

import { formatFrame, formatTime } from '@/lib/video'
import { domMixin } from '@/components/mixins/dom'

import ObjectViewer from '@/components/previews/ObjectViewer.vue'
import PictureViewer from '@/components/previews/PictureViewer.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import VideoViewer from '@/components/previews/VideoViewer.vue'

export default {
  name: 'preview-viewer',

  mixins: [domMixin],

  components: {
    DownloadIcon,
    ObjectViewer,
    PictureViewer,
    SoundViewer,
    Spinner,
    VideoViewer
  },

  props: {
    name: {
      type: String,
      default: ''
    },
    defaultHeight: {
      type: Number,
      default: 0
    },
    currentFrame: {
      type: Number,
      default: 0
    },
    marginBottom: {
      type: Number,
      default: 0
    },
    nbFrames: {
      type: Number,
      default: 0
    },
    isBig: {
      type: Boolean,
      default: false
    },
    isComparing: {
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
    isComparisonOverlay: {
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
    objectBackgroundUrl: {
      type: String,
      default: ''
    },
    preview: {
      type: Object,
      default: () => {}
    }
  },

  emits: [
    'duration-changed',
    'frame-update',
    'model-loaded',
    'play-ended',
    'size-changed',
    'video-end',
    'video-loaded'
  ],

  computed: {
    // Elements

    container() {
      return this.$refs.container
    },

    videoViewer() {
      return this.$refs['video-viewer']
    },

    pictureViewer() {
      return this.$refs['picture-viewer']
    },

    soundViewer() {
      return this.$refs['sound-viewer']
    },

    objectViewer() {
      return this.$refs['object-viewer']
    },

    //  Utils

    backgroundUrl() {
      return this.isObjectBackground ? this.objectBackgroundUrl : undefined
    },

    fileTitle() {
      return this.preview
        ? this.preview.original_name + '.' + this.preview.extension
        : ''
    },

    extension() {
      return this.preview ? this.preview.extension : ''
    },

    status() {
      return this.preview && this.preview.status ? this.preview.status : 'ready'
    },

    isBroken() {
      return this.status === 'broken'
    },

    isProcessing() {
      return this.status === 'processing'
    },

    isReady() {
      return this.status === 'ready'
    },

    isMovie() {
      return this.isReady && this.extension === 'mp4'
    },

    isPdf() {
      return this.isReady && this.extension === 'pdf'
    },

    isPicture() {
      return (
        this.isReady && ['gif', 'png', 'jpg', 'jpeg'].includes(this.extension)
      )
    },

    is3DModel() {
      return this.isReady && ['glb', 'gltf'].includes(this.extension)
    },

    isSound() {
      return this.isReady && ['wav', 'mp3'].includes(this.extension)
    },

    isFile() {
      return (
        this.isReady &&
        !this.isPicture &&
        !this.isMovie &&
        !this.is3DModel &&
        !this.isSound
      ) // && !this.isPdf
    },

    originalPath() {
      if (this.preview) {
        const previewId = this.preview.id
        const extension = this.extension ? this.extension : 'png'
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/${previewId}.${extension}`
      } else {
        return ''
      }
    },

    originalDlPath() {
      if (this.preview) {
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/${this.preview.id}/download`
      } else {
        return ''
      }
    }
  },

  methods: {
    formatFrame,
    formatTime,

    // Video

    resetVideo() {
      if (this.videoViewer) this.videoViewer.mountVideo()
    },

    updateTime(time) {
      this.currentTimeRaw = time
      this.currentTime = this.formatTime(this.currentTimeRaw)
    },

    changeMaxDuration(duration) {
      if (duration) {
        this.maxDuration = this.formatTime(duration)
        this.videoDuration = duration
      } else {
        this.maxDuration = '00:00.000'
        this.videoDuration = 0
      }
    },

    play() {
      this.isPlaying = true
      this.isDrawing = false
      if (this.videoViewer) {
        this.videoViewer.play()
      }
      if (this.isSound) {
        this.soundViewer.play()
      }
    },

    pause() {
      this.isPlaying = false
      if (this.videoViewer) this.videoViewer.pause()
      if (this.isSound) {
        this.soundViewer.pause()
      }
    },

    playModelAnimation(animationName) {
      this.objectViewer.play(animationName)
    },

    pauseModelAnimation() {
      this.objectViewer.pause()
    },

    goPreviousFrame() {
      return this.videoViewer.goPreviousFrame()
    },

    goNextFrame() {
      return this.videoViewer.goNextFrame()
    },

    onPlayPauseClicked() {
      if (!this.isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    },

    get3DAnimations() {
      return this.$refs['object-viewer'].getAnimations()
    },

    // Sizing

    getNaturalDimensions() {
      if (this.isMovie) {
        return this.videoViewer.getNaturalDimensions()
      } else {
        return this.pictureViewer.getNaturalDimensions()
      }
    },

    getDimensions() {
      const dimensions = { width: 0, height: 0 }
      if (this.container) {
        dimensions.width = this.container.offsetWidth
        dimensions.height = this.container.offsetHeight
      }
      return dimensions
    },

    resize() {
      if (this.isPicture) this.pictureViewer?.resetPicture()
      else if (this.isMovie) this.videoViewer?.mountVideo()
      else if (this.isSound) this.soundViewer?.redraw()
    },

    setCurrentFrame(frameNumber) {
      this.videoViewer.setCurrentFrame(frameNumber)
    },

    onPictureSizeChanged(dimensions) {
      dimensions.source = 'picture'
      this.$emit('size-changed', dimensions)
    },

    onVideoSizeChanged(dimensions) {
      dimensions.source = 'movie'
      this.$emit('size-changed', dimensions)
    },

    // To use when you don't want to handle back pressure and rounding
    setCurrentTimeRaw(time) {
      this.videoViewer.setCurrentTimeRaw(time)
    },

    getCurrentTimeRaw() {
      return this.isMovie ? this.videoViewer.currentTimeRaw : 0
    },

    // Loupe

    showLoupe() {
      this.pictureViewer.showLoupe()
    },

    hideLoupe() {
      this.pictureViewer.hideLoupe()
    },

    updateLoupePosition(event, canvasDimensions) {
      this.pictureViewer.updateLoupePosition(event, canvasDimensions)
    },

    extractFrame(canvas, frame) {
      this.videoViewer.setCurrentFrame(frame)
      const video = this.videoViewer.video
      const context = canvas.getContext('2d')
      const dimensions = this.videoViewer.getNaturalDimensions()
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
    },

    resetZoom() {
      if (this.pictureViewer) {
        this.pictureViewer.resetPanZoom()
      }
      if (this.videoViewer) {
        this.videoViewer.resetPanZoom()
      }
    },

    pauseZoom() {
      if (this.pictureViewer) {
        this.pictureViewer.pausePanZoom()
      }
      if (this.videoViewer) {
        this.videoViewer.pausePanZoom()
      }
    },

    resumeZoom() {
      if (this.pictureViewer) {
        this.pictureViewer.resumePanZoom()
      }
      if (this.videoViewer) {
        this.videoViewer.resumePanZoom()
      }
    },

    setSpeed(rate) {
      if (this.videoViewer) {
        this.videoViewer.setSpeed(rate)
      }
    }
  },

  watch: {
    preview() {
      if (this.isMovie) {
        this.pause()
        this.maxDuration = '00:00.000'
      } else if (this.isPicture) {
        this.pause()
        setTimeout(() => {
          if (this.pictureViewer) this.pictureViewer.resetPicture()
        }, 10)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.annotation-movie {
  margin: auto;
  width: 100%;
}

.time-indicator {
  color: $light-grey;
  padding-left: 0.8em;
  margin-right: 0;
}

.video-viewer {
  width: 100%;
  text-align: center;
  background: #36393f;
}

.buttons {
  background: #36393f;
  height: 32px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.buttons .button:first-child {
  border-bottom-left-radius: 5px;
}
.buttons .button:last-child {
  border-bottom-right-radius: 5px;
}

.buttons .button {
  background: transparent;
  border-radius: 0;
  color: #bbb;
  border: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.buttons .button.active,
.buttons .button:hover {
  color: #43b581;
}

.buttons .button:hover {
  border-radius: 5px;
  transform: scale(1.2);
}

.comparison-combobox {
  margin-bottom: 0;
}

.buttons .comparison-button {
  margin-left: 1em;
}

.previous-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  color: $grey;
}

.current-preview-file {
  padding: 1px 8px;
  margin-right: 0.4em;
  border: 1px solid $grey;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  background: $purple-strong;
  transition: 0.3s background ease;
}

.annotation-tools {
  align-items: stretch;
  display: flex;
  height: 33px;
  background: $dark-grey;
}

.slide-enter-active {
  transition: all 0.3s ease;
}

.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
}

.buttons .button.ml1 {
  margin-left: 1em;
}

.video-viewer {
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

  .preview {
    position: relative;
    align-items: center;
    background: black;
    // box-shadow: inset 4px 2px 20px 4px #000A;
    display: flex;
    flex: 1;
    justify-content: center;

    .button {
      padding: 1.5em;
      transition: background 0.3s ease;

      &:hover {
        background: $dark-grey-lightest;
      }
    }
  }
}
</style>
