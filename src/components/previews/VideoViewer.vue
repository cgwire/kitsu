<template>
  <div
    ref="container"
    class="video-player"
    :style="{
      'border-top-left-radius': isRoundedTopBorder ? '10px' : '',
      'border-top-right-radius': isRoundedTopBorder ? '10px' : ''
    }"
    @click="$emit('click')"
  >
    <div
      class="video-wrapper"
      :style="{
        'border-top-left-radius': isRoundedTopBorder ? '10px' : '',
        'border-top-right-radius': isRoundedTopBorder ? '10px' : ''
      }"
    >
      <div class="loading-background" v-if="isLoading">
        <spinner class="spinner" />
      </div>
      <video
        ref="movie"
        class="annotation-movie"
        :src="moviePath"
        :poster="posterPath"
        preload="auto"
        type="video/mp4"
        v-show="!isLoading"
      ></video>
    </div>
  </div>
</template>

<script>
import panzoom from 'panzoom'
import { mapGetters } from 'vuex'

import { formatFrame } from '@/lib/video'

import { domMixin } from '@/components/mixins/dom'

import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'video-viewer',

  mixins: [domMixin],

  components: {
    Spinner
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
    isComparing: {
      type: Boolean,
      default: false
    },
    isComparisonOverlay: {
      type: Boolean,
      default: false
    },
    isHd: {
      type: Boolean,
      default: false
    },
    isDrawing: {
      type: Boolean,
      default: false
    },
    isTyping: {
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
    currentFrame: {
      type: Number,
      default: 0
    },
    nbFrames: {
      type: Number,
      default: 0
    },
    preview: {
      type: Object,
      default: () => {}
    },
    defaultHeight: {
      type: Number,
      default: 0
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    isRoundedTopBorder: {
      type: Boolean,
      default: false
    },
    panzoom: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'click',
    'duration-changed',
    'frame-update',
    'play-ended',
    'size-changed',
    'video-end',
    'video-loaded'
  ],

  data() {
    return {
      annotations: [],
      currentTimeRaw: 0,
      isLoading: false,
      maxDuration: '00:00.000',
      videoDuration: 0
    }
  },

  mounted() {
    this.$options.currentTimeCalls = []

    this.container.style.height = this.defaultHeight + 'px'
    this.isLoading = true
    if (this.isMuted) {
      this.video.muted = this.isMuted
    }
    setTimeout(() => {
      if (this.video) {
        if (this.video.readyState === 4) {
          this.configureVideo()
          this.onWindowResize()
          this.isLoading = false
          this.setCurrentTime(0)
          this.setCurrentTimeRaw(0)
          this.$nextTick(() => {
            this.video.currentTime = 0
          })
          this.$emit('video-loaded')
        }
        this.video.addEventListener(
          'focus',
          function () {
            this.blur()
          },
          false
        )
        this.video.addEventListener('resize', this.resetSize)

        this.video.addEventListener('loadedmetadata', () => {
          this.configureVideo()
          this.onWindowResize()
          this.setCurrentTime(0)
          this.setCurrentTimeRaw(0)
          this.$emit('video-loaded')
        })

        this.video.addEventListener('canplay', () => {
          this.isLoading = false
        })

        this.video.addEventListener('ended', () => {
          this.isLoading = false
        })

        this.video.addEventListener('error', err => {
          console.error('An error occurred while loading a video', err)
          if (this.$refs.movie) {
            this.$refs.movie.style.height = this.defaultHeight + 'px'
          }
          this.isLoading = false
        })

        this.video.addEventListener('loadstart', () => {
          this.isLoading = true
        })

        this.video.addEventListener('stalled', () => {
          this.isLoading = true
        })

        this.video.addEventListener('waiting', () => {
          if (this.name.indexOf('comparison') < 0) {
            this.isLoading = true
          }
        })

        window.addEventListener('resize', this.onWindowResize)
      }
    }, 0)

    if (this.panzoom) {
      this.panzoomInstance = panzoom(this.container, {
        bounds: true,
        boundsPadding: 0.2,
        maxZoom: 5,
        minZoom: 1
      })
      this.pausePanZoom()
    }
  },

  beforeUnmount() {
    this.pause()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
    this.panzoomInstance?.dispose()
  },

  computed: {
    ...mapGetters(['currentProduction']),

    container() {
      return this.$refs.container
    },

    extension() {
      return this.preview ? this.preview.extension : ''
    },

    fps() {
      return parseFloat(this.currentProduction?.fps) || 25
    },

    frameDuration() {
      return Math.round((1 / this.fps) * 10000) / 10000
    },

    isAvailable() {
      return !['broken', 'processing'].includes(this.status)
    },

    isMovie() {
      return this.extension === 'mp4'
    },

    isVideo() {
      return this.$refs.movie && this.videoDuration && this.videoDuration > 0
    },

    status() {
      return this.preview && this.preview.status ? this.preview.status : 'ready'
    },

    video() {
      return this.$refs.movie
    },

    moviePath() {
      if (this.extension === 'mp4' && this.isAvailable && !this.isHd) {
        return `/api/movies/low/preview-files/${this.preview.id}.mp4`
      } else if (this.extension === 'mp4' && this.isAvailable) {
        return `/api/movies/originals/preview-files/${this.preview.id}.mp4`
      } else {
        return null
      }
    },

    movieDlPath() {
      if (this.preview && this.isAvailable) {
        return `/api/movies/originals/preview-files/${this.preview.id}/download`
      } else {
        return ''
      }
    },

    posterPath() {
      if (this.extension === 'mp4' && this.isAvailable) {
        return `/api/pictures/previews/preview-files/${this.preview.id}.png`
      } else {
        return null
      }
    }
  },

  methods: {
    formatFrame,

    getNaturalDimensions() {
      return {
        height: this.video ? this.video.videoHeight : 0,
        width: this.video ? this.video.videoWidth : 0
      }
    },

    getDimensions() {
      const dimensions = this.getNaturalDimensions()
      const ratio = dimensions.height / dimensions.width || 1
      const fullWidth = this.container ? this.container.offsetWidth : 0
      const fullHeight = this.container ? this.container.offsetHeight : 0
      let width = fullWidth
      let height = Math.floor(width * ratio)
      if (height > fullHeight) {
        height = fullHeight
        width = height / ratio
      }
      return { width, height }
    },

    getLastPushedCurrentTime() {
      const length = this.$options.currentTimeCalls.length
      if (length > 0) {
        return this.$options.currentTimeCalls[length - 1]
      } else {
        return this.currentTimeRaw
      }
    },

    setCurrentFrame(frame) {
      this.setCurrentTime(frame * this.frameDuration)
    },

    setCurrentTimeRaw(currentTime) {
      if (currentTime < this.frameDuration) currentTime = 0
      this.video.currentTime = currentTime
    },

    setCurrentTime(currentTime) {
      if (!this.$options.currentTimeCalls) {
        this.$options.currentTimeCalls = []
      }
      this.$options.currentTimeCalls.push(currentTime)
      if (!this.$options.running) this.runSetCurrentTime()
    },

    runSetCurrentTime() {
      if (this.$options.currentTimeCalls.length === 0) {
        this.$options.running = false
      } else {
        this.$options.running = true
        const currentTime = this.$options.currentTimeCalls.shift()
        if (this.video.currentTime !== currentTime) {
          this.video.currentTime = Number(currentTime.toPrecision(4)) + 0.001
        }
        setTimeout(() => {
          this.runSetCurrentTime()
        }, 10)
      }
    },

    configureVideo() {
      this.video.onended = this.onVideoEnd
      if (this.video.currentTime === 0) {
        this.mountVideo()
      }
    },

    mountVideo() {
      if (!this.isMovie) return
      this.video.mute = this.isMuted
      this.videoDuration = this.video.duration
      this.isLoading = false
      this.$emit('duration-changed', this.videoDuration)
      this.resetSize()
      setTimeout(() => {
        this.resetSize()
      }, 500)
    },

    resetSize() {
      let { width, height } = this.getDimensions()
      if (height > 0) {
        this.container.style.height = this.defaultHeight + 'px'
        this.video.style.height = height + 'px'
        const videoPosition = this.video.getBoundingClientRect()
        const containerPosition = this.container.getBoundingClientRect()
        const top = videoPosition.top - containerPosition.top
        const left = videoPosition.left - containerPosition.left
        width = videoPosition.width
        height = videoPosition.height

        if (
          !this.previousDimensions ||
          this.previousDimensions.width !== width ||
          this.previousDimensions.height !== height ||
          this.previousDimensions.left !== left ||
          this.previousDimensions.top !== top
        ) {
          this.$emit('size-changed', { width, height, top, left })
        }
        this.previousDimensions = { width, height, top, left }
      } else {
        this.$emit('size-changed', { width: 0, height: 0, top: 0, left: 0 })
      }
    },

    getFrameFromPlayer() {
      let currentTimeRaw = 0
      if (this.video) {
        currentTimeRaw = this.video.currentTime
      } else {
        currentTimeRaw = 0
      }
      if (currentTimeRaw === 0) {
        return 0
      }
      let frame = Math.ceil(currentTimeRaw / this.frameDuration) + 1
      frame = Number(frame.toPrecision(4))
      frame = Math.min(frame, this.nbFrames)
      return frame
    },

    play() {
      if (
        !this.isPlaying &&
        this.videoDuration === this.video.currentTime &&
        this.name.indexOf('comparison') < 0
      ) {
        this.setCurrentTime(0)
      }
      this.video.play()
      if (this.name.indexOf('comparison') < 0) {
        this.runEmitTimeUpdateLoop()
      }
    },

    runEmitTimeUpdateLoop() {
      clearInterval(this.$options.playLoop)
      this.$options.playLoop = setInterval(
        this.emitFrameChange,
        this.frameDuration
      )
    },

    emitFrameChange() {
      const frame = this.getFrameFromPlayer()
      this.$emit('frame-update', frame)
    },

    pause() {
      this.video.pause()
      clearInterval(this.$options.playLoop)
      this.video.currentTime = this.currentFrame * this.frameDuration
      this.$emit('frame-update', this.currentFrame)
    },

    toggleMute() {
      this.video.muted = !this.video.muted
    },

    goPreviousFrame() {
      const nextFrame = this.currentFrame - 1
      if (nextFrame < 0) return
      this.video.currentTime = nextFrame * this.frameDuration + 0.001
      this.$emit('frame-update', nextFrame)
      return nextFrame
    },

    goNextFrame() {
      const nextFrame = this.currentFrame + 1
      if (nextFrame >= this.nbFrames) return
      this.video.currentTime = nextFrame * this.frameDuration + 0.001
      this.$emit('frame-update', nextFrame)
      return nextFrame
    },

    onVideoEnd() {
      this.isPlaying = false
      clearInterval(this.$options.playLoop)
      if (this.isRepeating) {
        this.$emit('video-end')
        this.video.currentTime = 0
        this.play()
      } else {
        this.$emit('play-ended')
      }
    },

    onWindowResize() {
      this.mountVideo()
    },

    resetPanZoom() {
      if (this.panzoomInstance) {
        this.panzoomInstance.moveTo(0, 0)
        this.panzoomInstance.zoomAbs(0, 0, 1)
      }
    },

    pausePanZoom() {
      if (this.panzoomInstance) {
        this.panzoomInstance.pause()
      }
    },

    resumePanZoom() {
      if (this.panzoomInstance) {
        this.panzoomInstance.resume()
      }
    }
  },

  watch: {
    preview() {
      this.resetPanZoom()
      this.maxDuration = '00:00.000'
      this.pause()
    },

    light() {
      this.resetPanZoom()
      this.mountVideo()
    },

    isComparing() {
      this.resetPanZoom()
      this.mountVideo()
    },

    isComparingOverlay() {
      this.resetPanZoom()
      this.mountVideo()
    },

    isMuted() {
      this.video.muted = this.isMuted
    },

    fullScreen() {
      this.resetPanZoom()
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-background {
  background: #00000088;
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  width: 100%;
  text-align: center;
  background: #36393f;
  overflow: hidden;
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
  height: 100%;
  position: relative;
}

video {
  object-fit: inherit;
}

.video-time {
  position: absolute;
  font-size: 2em;
}
</style>
