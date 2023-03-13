<template>
  <div ref="container" class="preview-viewer dark">
    <div
      class="center status-message"
      :style="{ height: defaultHeight + 'px' }"
      v-show="isBroken"
    >
      <p>This preview is broken.</p>
    </div>

    <div
      class="center status-message"
      :style="{ height: defaultHeight + 'px' }"
      title="Video processing in progress..."
      v-show="isProcessing"
    >
      <spinner :is-processing="true" />
    </div>

    <video-viewer
      ref="video-viewer"
      class="video-viewer"
      :name="name"
      :big="big"
      :default-height="defaultHeight"
      :is-comparing="isComparing"
      :is-hd="isHd"
      :is-muted="isMuted"
      :is-repeating="isRepeating"
      :light="light"
      :preview="preview"
      :full-screen="fullScreen"
      @size-changed="dimensions => $emit('size-changed', dimensions)"
      @video-loaded="$emit('video-loaded')"
      @duration-changed="duration => $emit('duration-changed', duration)"
      @frame-update="frameNumber => $emit('frame-update', frameNumber)"
      @play-ended="$emit('play-ended')"
      @video-end="$emit('video-end')"
      v-show="isMovie"
    />

    <picture-viewer
      ref="picture-viewer"
      :big="big"
      :default-height="defaultHeight"
      :full-screen="fullScreen"
      :is-comparing="isComparing"
      :light="light"
      :preview="preview"
      @size-changed="dimensions => $emit('size-changed', dimensions)"
      v-show="isPicture"
    />

    <object-viewer
      class="model-viewer"
      :default-height="defaultHeight"
      :preview-url="originalPath"
      :light="light"
      :empty="!is3DModel"
      :full-screen="fullScreen"
      v-if="is3DModel"
    />

    <sound-viewer
      ref="sound-viewer"
      class="sound-viewer"
      :preview-url="isSound ? originalPath : ''"
      :file-name="fileTitle"
      @play-ended="$emit('play-ended')"
      v-show="isSound"
    />

    <!--pdf
      class="pdf-viewer"
      :height="defaultHeight"
      :src="originalPath"
      v-if="isPdf"
    /-->

    <div
      class="center"
      :style="{ height: defaultHeight + 'px' }"
      v-show="isFile"
    >
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
// import pdf from 'vue-pdf'
import { mapGetters, mapActions } from 'vuex'
import { formatFrame, formatTime } from '@/lib/video'

import { domMixin } from '@/components/mixins/dom'

import { DownloadIcon } from 'vue-feather-icons'
import ObjectViewer from '@/components/previews/ObjectViewer'
import PictureViewer from '@/components/previews/PictureViewer'
import SoundViewer from '@/components/previews/SoundViewer'
import Spinner from '@/components/widgets/Spinner'
import VideoViewer from '@/components/previews/VideoViewer'

export default {
  name: 'preview-viewer',
  mixins: [domMixin],

  components: {
    ObjectViewer,
    // pdf,
    DownloadIcon,
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
    big: {
      type: Boolean,
      default: false
    },
    defaultHeight: {
      type: Number,
      default: 0
    },
    isComparing: {
      type: Boolean,
      default: false
    },
    isHd: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isRepeating: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    preview: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {}
  },

  mounted() {},

  beforeDestroy() {},

  computed: {
    ...mapGetters(['currentProduction']),

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

    //  Utils

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
        return (
          `/api/${type}/originals/preview-files/` +
          `${this.preview.id}/download`
        )
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions(['updateRevisionPreviewPosition']),
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

    // Sizing

    getDimensions() {
      const dimensions = { width: 0, height: 0 }
      if (this.container) {
        dimensions.width = this.container.offsetWidth
        dimensions.height = this.container.offsetHeight
      }
      return dimensions
    },

    resetPicture() {
      if (this.pictureViewer) this.pictureViewer.resetPicture()
    },

    resize() {
      if (this.videoViewer) this.videoViewer.onWindowResize()
      if (this.isSound) this.soundViewer.redraw()
    },

    getPreviewDimensions() {
      const dimensions = { width: 0, height: 0 }
      if (this.isMovie) {
        return this.videoViewer.getDimensions()
      } else if (this.isPicture) {
        return this.pictureViewer.getDimensions()
      }
      return dimensions
    },

    setCurrentFrame(frameNumber) {
      this.videoViewer.setCurrentFrame(frameNumber)
    },

    // To use when you don't want to handle back pressure and rounding
    setCurrentTimeRaw(time) {
      this.videoViewer.setCurrentTimeRaw(time)
    },

    getCurrentTimeRaw(time) {
      if (this.isMovie) return this.videoViewer.currentTimeRaw
      else return 0
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
      this.pictureViewer.resetPanZoom()
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
          this.pictureViewer.resetPicture()
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
