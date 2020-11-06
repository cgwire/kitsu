<template>
<div ref="container" class="preview-viewer dark">

    <video-viewer
      ref="video-viewer"
      class="video-viewer"
      :name="name"
      :big="big"
      :default-height="defaultHeight"
      :is-comparing="isComparing"
      :is-muted="isMuted"
      :is-repeating="isRepeating"
      :light="light"
      :preview="preview"
      @size-changed="dimensions => $emit('size-changed', dimensions)"
      @duration-changed="duration => $emit('duration-changed', duration)"
      @time-update="time => $emit('time-update', time)"
      @play-ended="$emit('play-ended')"
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

    <!--model-viewer
      class="model-viewer"
      :default-height="defaultHeight"
      :preview-url="originalPath"
      :light="light"
      :empty="!is3DModel"
      :full-screen="fullScreen"
      v-show="is3DModel"
    />

    <pdf
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
        v-if="isFile"
      >
        <download-icon class="icon" />
        <span class="text">
          {{ $t('tasks.download_pdf_file', {extension}) }}
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

import {
  DownloadIcon
} from 'vue-feather-icons'
// import ModelViewer from '@/components/previews/ModelViewer'
import PictureViewer from '@/components/previews/PictureViewer'
import VideoViewer from '@/components/previews/VideoViewer'

export default {
  name: 'preview-viewer',
  mixins: [domMixin],

  components: {
    // ModelViewer,
    // pdf,
    DownloadIcon,
    PictureViewer,
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

  data () {
    return {}
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    // Elements

    container () {
      return this.$refs.container
    },

    videoViewer () {
      return this.$refs['video-viewer']
    },

    pictureViewer () {
      return this.$refs['picture-viewer']
    },

    //  Utils

    fileTitle () {
      return (
        this.preview
          ? this.preview.original_name + '.' + this.preview.extension : ''
      )
    },

    extension () {
      return this.preview ? this.preview.extension : ''
    },

    isMovie () {
      return this.extension === 'mp4'
    },

    isPdf () {
      return this.extension === 'pdf'
    },

    isPicture () {
      return ['gif', 'png', 'jpg', 'jpeg'].includes(this.extension)
    },

    is3DModel () {
      return this.extension === 'obj'
    },

    isFile () {
      return !this.isPicture && !this.isMovie // && !this.is3DModel && !this.isPdf
    },

    originalPath () {
      if (this.preview) {
        const previewId = this.preview.id
        const extension = this.extension ? this.extension : 'png'
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/${previewId}.${extension}`
      } else {
        return ''
      }
    },

    originalDlPath () {
      if (this.preview) {
        const type = this.isMovie ? 'movies' : 'pictures'
        return `/api/${type}/originals/preview-files/` +
               `${this.preview.id}/download`
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'updateRevisionPreviewPosition'
    ]),
    formatFrame,
    formatTime,

    // Video

    resetVideo () {
      if (this.videoViewer) this.videoViewer.mountVideo()
    },

    updateTime (time) {
      this.currentTimeRaw = time
      this.currentTime = this.formatTime(this.currentTimeRaw)
    },

    changeMaxDuration (duration) {
      if (duration) {
        this.maxDuration = this.formatTime(duration)
        this.videoDuration = duration
      } else {
        this.maxDuration = '00:00.000'
        this.videoDuration = 0
      }
    },

    play () {
      this.isPlaying = true
      this.isDrawing = false
      if (this.videoViewer) {
        this.videoViewer.play()
      }
    },

    pause () {
      this.isPlaying = false
      if (this.videoViewer) this.videoViewer.pause()
    },

    goPreviousFrame () {
      this.videoViewer.goPreviousFrame()
    },

    goNextFrame () {
      this.videoViewer.goNextFrame()
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.videoViewer.currentTime = 0
        this.play()
      }
    },

    onPlayPauseClicked () {
      if (!this.isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    },

    onRepeatClicked () {
      if (this.isRepeating) {
        this.isRepeating = false
      } else {
        this.isRepeating = true
      }
    },

    // Sizing

    getDimensions () {
      const dimensions = { width: 0, height: 0 }
      if (this.container) {
        dimensions.width = this.container.offsetWidth
        dimensions.height = this.container.offsetHeight
      }
      return dimensions
    },

    resetPicture () {
      if (this.pictureViewer) this.pictureViewer.resetPicture()
    },

    getPreviewDimensions () {
      if (this.isMovie) return this.videoViewer.getDimensions()
      else if (this.isPicture) return this.pictureViewer.getDimensions()
      else return { width: 0, height: 0 }
    },

    setCurrentTime (time) {
      this.videoViewer.setCurrentTime(time)
    },

    getCurrentTimeRaw (time) {
      return this.videoViewer.currentTimeRaw
    },

    // Loupe

    showLoupe () {
      this.pictureViewer.showLoupe()
    },

    hideLoupe () {
      this.pictureViewer.hideLoupe()
    },

    updateLoupePosition (event, canvasDimensions) {
      this.pictureViewer.updateLoupePosition(event, canvasDimensions)
    }
  },

  watch: {
    preview () {
      if (this.isMovie) {
        this.pause()
        this.maxDuration = '00:00.000'
      } else if (this.isPicture) {
        this.pause()
        setTimeout(this.pictureViewer.resetPicture, 10)
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
  background: #36393F;
}

.buttons {
  background: #36393F;
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
  color: #BBB;
  border: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.buttons .button.active,
.buttons .button:hover {
  color: #43B581;
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
  transition: all .3s ease;
}

.slide-leave-active {
  transition: all .3s ease;
}

.slide-enter, .slide-leave-to {
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
