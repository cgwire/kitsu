<template>
<div ref="container" class="video-player">
  <div ref="video-wrapper" class="video-wrapper">
    <div class="loading-background" v-if="isLoading" >
      <spinner class="spinner" />
    </div>
    <video
      ref="movie"
      class="annotation-movie"
      :style="{
        display: isLoading ? 'none' : 'block'
      }"
      :src="moviePath"
      :poster="posterPath"
      preload="auto"
      type="video/mp4"
    >
    </video>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

import { formatFrame, formatTime, floorToFrame } from '@/lib/video'
import Spinner from '@/components/widgets/Spinner'

import { domMixin } from '@/components/mixins/dom'

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
    }
  },

  data () {
    return {
      annotations: [],
      currentTimeRaw: 0,
      isLoading: false,
      maxDuration: '00:00.000',
      videoDuration: 0
    }
  },

  mounted () {
    if (!this.container) return
    this.$options.currentTimeCalls = []

    this.container.style.height = this.defaultHeight + 'px'
    this.isLoading = true
    if (this.isMuted) {
      this.video.muted = this.isMuted
    }
    setTimeout(() => {
      if (this.video) {
        this.video.addEventListener(
          'focus', function () { this.blur() }, false
        )
        this.video.addEventListener('loadedmetadata', () => {
          this.configureVideo()
          this.onWindowResize()
          this.isLoading = false
          this.setCurrentTime(0)
          this.$emit('video-loaded')
        })

        this.video.addEventListener('ended', () => {
          this.isLoading = false
        })

        this.video.addEventListener('error', (err) => {
          console.error('An error occured while loading a video', err)
          this.$refs.movie.style.height = this.defaultHeight + 'px'
          this.isLoading = false
        })
        window.addEventListener('resize', this.onWindowResize)
      }
    }, 0)
  },

  beforeDestroy () {
    this.pause()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    container () {
      return this.$refs.container
    },

    extension () {
      return this.preview ? this.preview.extension : ''
    },

    fps () {
      return parseFloat(this.currentProduction.fps || '24')
    },

    frameDuration () {
      return Math.round((1 / this.fps) * 10000) / 10000
    },

    isAvailable () {
      return !['broken', 'processing'].includes(this.status)
    },

    isMovie () {
      return this.extension === 'mp4'
    },

    isVideo () {
      return this.$refs.movie && this.videoDuration && this.videoDuration > 0
    },

    status () {
      return this.preview && this.preview.status
        ? this.preview.status
        : 'ready'
    },

    video () {
      return this.$refs.movie
    },

    videoWrapper () {
      return this.$refs['video-wrapper']
    },

    moviePath () {
      if (this.extension === 'mp4' && this.isAvailable && !this.isHd) {
        return `/api/movies/low/preview-files/${this.preview.id}.mp4`
      } else if (this.extension === 'mp4' && this.isAvailable) {
        return `/api/movies/originals/preview-files/${this.preview.id}.mp4`
      } else {
        return null
      }
    },

    movieDlPath () {
      if (this.preview && this.isAvailable) {
        return `/api/movies/originals/preview-files/${this.preview.id}/download`
      } else {
        return ''
      }
    },

    posterPath () {
      if (this.extension === 'mp4' && this.isAvailable) {
        return `/api/pictures/previews/preview-files/${this.preview.id}.png`
      } else {
        return null
      }
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
      const fullWidth = this.container.offsetWidth
      const fullHeight = this.container.offsetHeight
      let width = fullWidth
      let height = Math.floor(width * ratio)
      if (height > fullHeight) {
        height = fullHeight
        width = height / ratio
      }
      return { width, height }
    },

    getLastPushedCurrentTime () {
      const length = this.$options.currentTimeCalls.length
      if (length > 0) {
        return this.$options.currentTimeCalls[length - 1]
      } else {
        return this.currentTimeRaw
      }
    },

    setCurrentFrame (frameNumber) {
      this.setCurrentTime(frameNumber * this.frameDuration)
    },

    setCurrentTimeRaw (currentTime) {
      if (currentTime < this.frameDuration) currentTime = 0
      this.video.currentTime = currentTime
    },

    setCurrentTime (currentTime) {
      if (!this.$options.currentTimeCalls) {
        this.$options.currentTimeCalls = []
      }
      this.$options.currentTimeCalls.push(currentTime)
      if (!this.$options.running) this.runSetCurrentTime()
    },

    runSetCurrentTime () {
      if (this.$options.currentTimeCalls.length === 0) {
        this.$options.running = false
      } else {
        this.$options.running = true
        const currentTime = this.$options.currentTimeCalls.shift()
        if (this.video.currentTime !== currentTime + this.frameDuration) {
          // tweaks needed because the html video player is messy with frames
          this.video.currentTime = currentTime + this.frameDuration + 0.01
          this.onTimeUpdate()
        }
        setTimeout(() => {
          this.runSetCurrentTime()
        }, 10)
      }
    },

    _setRoundedTime (time) {
      time = floorToFrame(time, this.fps)
      if (time < this.frameDuration) {
        time = 0
      } else if (
        time > (this.video.duration - this.frameDuration)
      ) {
        time = this.video.duration - this.frameDuration
      } else {
      }
      this.setCurrentTime(time)
      return time
    },

    configureVideo () {
      this.video.onended = this.onVideoEnd
      if (this.video.currentTime === 0) {
        this.mountVideo()
      }
    },

    mountVideo () {
      if (!this.isMovie) return
      this.video.mute = this.isMuted
      this.videoDuration = this.video.duration
      this.isLoading = false
      this.$emit('duration-changed', this.videoDuration)
      if (this.container) {
        this.resetSize()
        setTimeout(this.resetSize)
      }
    },

    resetSize () {
      const dimensions = this.getDimensions()
      const width = dimensions.width
      const height = dimensions.height
      if (height > 0) {
        this.container.style.height = this.defaultHeight + 'px'
        // Those two lines are commented out because fixing the width was
        //   breaking the comment section in the preview in full screen
        // this.videoWrapper.style.width = width + 'px'
        // this.video.style.width = width + 'px'
        this.videoWrapper.style.height = height + 'px'
        this.video.style.height = height + 'px'
        this.$emit('size-changed', { width, height })
      }
    },

    onTimeUpdate (time) {
      if (this.video) {
        this.currentTimeRaw = this.video.currentTime - this.frameDuration
      } else {
        this.currentTimeRaw = 0 + this.frameDuration
      }
      this.$emit(
        'frame-update',
        Math.round(this.currentTimeRaw / this.frameDuration)
      )
    },

    runEmitTimeUpdateLoop () {
      clearInterval(this.$options.playLoop)
      this.$options.playLoop = setInterval(
        this.onTimeUpdate,
        1000 / this.fps
      )
    },

    play () {
      if (!this.isPlaying && this.videoDuration === this.video.currentTime) {
        this.setCurrentTime(0)
      }
      this.video.play()
      this.runEmitTimeUpdateLoop()
    },

    pause () {
      this.video.pause()
      this._setRoundedTime(this.currentTimeRaw)
      clearInterval(this.$options.playLoop)
    },

    toggleMute () {
      this.video.muted = !this.video.muted
    },

    goPreviousFrame () {
      const time = this.getLastPushedCurrentTime()
      const newTime = time - this.frameDuration
      return this._setRoundedTime(newTime)
    },

    goNextFrame () {
      const time = this.getLastPushedCurrentTime()
      const newTime = time + this.frameDuration
      return this._setRoundedTime(newTime)
    },

    onVideoEnd () {
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

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(this.mountVideo)
        setTimeout(() => {
          this.mountVideo()
        }, 400)
      }
    }
  },

  watch: {
    preview () {
      this.maxDuration = '00:00.000'
      this.pause()
    },

    light () {
      this.mountVideo()
    },

    isComparing () {
      this.mountVideo()
    },

    isMuted () {
      this.video.muted = this.isMuted
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

video {
  object-fit: inherit;
}
</style>
