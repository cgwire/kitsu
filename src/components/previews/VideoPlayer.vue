<template>
<div ref="container" class="video-player">
  <div ref="video-wrapper" class="video-wrapper">
    <div class="loading-background" v-if="isLoading" >
      <spinner class="spinner" />
    </div>
    <video
      id="annotation-movie"
      ref="movie"
      class="annotation-movie"
      preload="auto"
      :style="{
        display: isLoading ? 'none' : 'block'
      }"
      :src="moviePath"
      :poster="posterPath"
    >
    </video>
    <video
      id="comparison-movie"
      ref="comparison-movie"
      class="annotation-movie"
      preload="auto"
      :src="comparisonMoviePath"
      :poster="comparisonPosterPath"
      v-if="isComparing && previewToCompareId"
    >
    </video>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

import { formatFrame, formatTime, roundToFrame } from '../../lib/video'
import Spinner from '../widgets/Spinner'

import { domMixin } from '@/components/mixins/dom'

export default {
  name: 'video-player',
  mixins: [domMixin],

  components: {
    Spinner
  },

  props: {
    big: {
      type: Boolean,
      default: () => {}
    },
    isComparing: {
      type: Boolean,
      default: () => {}
    },
    isDrawing: {
      type: Boolean,
      default: () => {}
    },
    isTyping: {
      type: Boolean,
      default: () => {}
    },
    isMuted: {
      type: Boolean,
      default: () => {}
    },
    isRepeating: {
      type: Boolean,
      default: () => {}
    },
    light: {
      type: Boolean,
      default: () => {}
    },
    preview: {
      type: Object,
      default: () => {}
    },
    previewToCompareId: {
      type: String,
      default: ''
    },
    defaultHeight: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      annotations: [],
      currentTime: '00:00.000',
      currentTimeRaw: 0,
      isLoading: false,
      maxDuration: '00:00.000',
      videoDuration: 0
    }
  },

  mounted () {
    if (!this.container) return
    this.container.style.height = this.defaultHeight + 'px'
    this.isLoading = true
    this.isMuted = false
    this.isRepeating = false
    setTimeout(() => {
      if (this.video) {
        this.video.addEventListener(
          'focus', function () { this.blur() }, false
        )
        this.video.addEventListener('loadedmetadata', () => {
          this.configureVideo()
          this.onWindowResize()
          this.isLoading = false
        })

        this.video.addEventListener('ended', () => {
          this.isLoading = false
        })

        this.video.addEventListener('error', () => {
          this.$refs.movie.style.height = this.defaultHeight + 'px'
          this.isLoading = false
        })

        window.addEventListener('resize', this.onWindowResize)
        this.video.addEventListener('timeupdate', this.onTimeUpdate)
      }
    }, 0)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    currentFrame () {
      return formatFrame(this.currentTimeRaw, this.fps)
    },

    container () {
      return this.$refs.container
    },

    fps () {
      return this.currentProduction.fps || 24
    },

    isVideo () {
      return this.$refs.movie && this.videoDuration && this.videoDuration > 0
    },

    moviePath () {
      if (this.preview.extension === 'mp4') {
        return `/api/movies/originals/preview-files/${this.preview.id}.mp4`
      } else {
        return null
      }
    },

    movieDlPath () {
      return `/api/movies/originals/preview-files/${this.preview.id}/download`
    },

    posterPath () {
      if (this.preview.extension === 'mp4') {
        return `/api/pictures/previews/preview-files/${this.preview.id}.png`
      } else {
        return null
      }
    },

    comparisonMoviePath () {
      return `/api/movies/originals/preview-files/${this.previewToCompareId}.mp4`
    },

    comparisonPosterPath () {
      return `/api/pictures/originals/preview-files/${this.previewToCompareId}.png`
    },

    video () {
      return this.$refs.movie
    },

    comparisonVideo () {
      return this.$refs['comparison-movie']
    },

    videoWrapper () {
      return this.$refs['video-wrapper']
    },

    isMovie () {
      return this.preview.extension === 'mp4'
    }
  },

  methods: {
    formatFrame,

    formatTime,

    getNaturalDimensions () {
      return {
        height: this.video.videoHeight,
        width: this.video.videoWidth
      }
    },

    getDimensions () {
      const dimensions = this.getNaturalDimensions()
      const ratio = dimensions.height / dimensions.width
      let width = Math.min(dimensions.width, this.container.offsetWidth)
      let height = Math.floor(width * ratio)
      height = Math.min(height, this.defaultHeight)
      width = Math.floor(height / ratio)
      return { width, height }
    },

    setCurrentTime (currentTime) {
      currentTime = roundToFrame(currentTime, this.fps)
      this.video.currentTime = currentTime
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.currentTime = currentTime
      }
    },

    configureVideo () {
      this.video.addEventListener('timeupdate', this.onTimeUpdate)
      this.video.onended = this.onVideoEnd
      if (this.video.currentTime === 0) {
        this.mountVideo()
      }
    },

    mountVideo () {
      if (!this.isMovie) return
      this.video.mute = true
      this.videoDuration = this.video.duration
      this.isLoading = false
      // this.progress.setAttribute('max', this.videoDuration)
      this.$emit('duration-changed', this.videoDuration)

      if (this.container) {
        const dimensions = this.getDimensions()
        let width = dimensions.width
        let height = dimensions.height

        if (height > 0) {
          this.container.style.height = this.defaultHeight + 'px'
          this.videoWrapper.style.width = width + 'px'
          this.videoWrapper.style.height = height + 'px'
          if (this.isComparing) {
            width = Math.round(width / 2)
            height = Math.round(height / 2)
            const comparisonVideo = document.getElementById('comparison-movie')
            if (comparisonVideo) {
              comparisonVideo.style.width = width + 'px'
              comparisonVideo.style.height = height + 'px'
            }
          }
          this.video.style.width = width + 'px'
          this.video.style.height = height + 'px'
          this.$emit('size-changed', { width, height })
        }
      }
    },

    onTimeUpdate (time) {
      if (this.video) {
        this.currentTimeRaw = this.video.currentTime
      } else {
        this.currentTimeRaw = 0
      }
      this.$emit('time-update', this.currentTimeRaw)
    },

    play () {
      this.video.play()
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.play()
      }
    },

    pause () {
      this.video.pause()
      if (this.isComparing) {
        const comparisonVideo = document.getElementById('comparison-movie')
        if (comparisonVideo) comparisonVideo.pause()
      }
    },

    toggleMute () {
      this.video.muted = !this.video.muted
      this.isMuted = this.video.muted
    },

    goPreviousFrame () {
      const newTime = this.video.currentTime - 1 / this.fps
      if (newTime < 0) {
        this.setCurrentTime(0)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    goNextFrame () {
      const newTime = this.video.currentTime + 1 / this.fps
      if (newTime > this.video.duration) {
        this.setCurrentTime(this.video.duration)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    onVideoEnd () {
      this.isPlaying = false
      if (this.isRepeating) {
        this.video.currentTime = 0
        if (this.isComparing) {
          const comparisonVideo = document.getElementById('comparison-movie')
          if (comparisonVideo) comparisonVideo.currentTime = 0
        }
        this.play()
      } else {
        this.$emit('play-ended')
      }
    },

    onWindowResize (callback) {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(() => {
          this.mountVideo()
          if (callback && typeof callback === 'function') callback()
        })
      }
    },

    setDefaultComparisonPreview () {
      let previewFiles = this.entityPreviewFiles[this.taskTypeId]
      if (previewFiles) {
        previewFiles = previewFiles.filter(p => p.id !== this.preview.id)
        if (previewFiles.length > 0) {
          this.previewToCompareId = previewFiles[0].id
        } else {
          this.previewToCompareId = null
        }
      } else {
        this.previewToCompareId = null
      }
    }
  },

  watch: {
    preview () {
      this.maxDuration = '00:00.000'
      if (this.isComparing) {
        this.mountVideo()
      }
    },

    previewToCompareId () {
      if (this.isComparing) {
        this.pause()
        const currentTime = this.video.currentTime
        this.$nextTick(() => {
          const comparisonVideo = document.getElementById('comparison-movie')
          if (comparisonVideo) comparisonVideo.currentTime = currentTime
        })
      }
    },

    taskTypeId () {
      this.setDefaultComparisonPreview()
    },

    light () {
      this.onWindowResize()
    },

    isComparing () {
      if (this.isComparing) {
        this.mountVideo()
      } else {
        this.$nextTick(() => {
          this.mountVideo()
        })
      }
    },

    isMuted () {
      this.video.muted = !this.video.muted
      this.isMuted = this.video.muted
    },

    fullScreen () {
      this.mountVideo()
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  margin: auto;
}

.video-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  height: 100%;
}

.video-wrapper {
  flex: 1;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  width: 100%;
  position: relative;
}

.video-player {
  width: 100%;
  text-align: center;
  background: #36393F;
}
</style>
