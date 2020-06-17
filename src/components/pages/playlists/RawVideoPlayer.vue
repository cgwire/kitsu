<template>
<div ref="container" class="video-wrapper filler flexrow-item">
  <video
    ref="player1"
    preload="auto"
    :muted="muted"
    @ended="playNext"
  />
  <video
    ref="player2"
    preload="auto"
    :muted="muted"
    @ended="playNext"
  />
</div>
</template>

<script>
/*
 * To play several videos, to avoid blinking effects, it's required to use
 * two video players. When switching from a entity to another, we hide and show
 * players so the blink does not occur.
 */
import { mapGetters } from 'vuex'
import { roundToFrame } from '../../../lib/video'

export default {
  name: 'raw-video-player',

  components: {
  },

  props: {
    entities: {
      type: Array,
      default: () => []
    },
    muted: {
      type: Boolean,
      default: false
    },
    isRepeating: {
      type: Boolean,
      default: false
    },
    name: { // Debug purpose
      type: String,
      default: 'main'
    }
  },

  data () {
    return {
      currentPlayer: this.player1,
      isPlaying: false,
      nextPlayer: this.player2,
      playingIndex: 0
    }
  },

  // Video need to be resized after each window size change. It's due
  // to a HTML5 limitation related to video height.
  mounted () {
    this.resetHeight()
    this.player1.addEventListener('loadedmetadata', this.emitLoadedEvent)
    window.addEventListener('resize', this.resetHeight)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resetHeight)
    this.player1.removeEventListener('loadedmetadata', this.emitLoadedEvent)
  },

  computed: {
    ...mapGetters([
      'currentProduction'
    ]),

    container () {
      return this.$refs.container
    },

    fps () {
      return this.currentProduction.fps || 24
    },

    player1 () {
      return this.$refs.player1
    },

    player2 () {
      return this.$refs.player2
    }
  },

  methods: {

    // Helpers

    emitLoadedEvent (event) {
      this.$emit('metadata-loaded', event)
    },

    getMoviePath (entity) {
      if (entity.preview_file_extension === 'mp4') {
        const previewId = entity.preview_file_id
        return `/api/movies/originals/preview-files/${previewId}.mp4`
      } else {
        return ''
      }
    },

    getWidth () {
      return this.currentPlayer ? this.currentPlayer.offsetWidth : 0
    },

    getHeight () {
      return this.currentPlayer ? this.currentPlayer.offsetHeight : 0
    },

    getVideoRatio () {
      const height = this.getVideoHeight()
      return height ? this.getVideoWidth() / height : 0
    },

    getVideoWidth () {
      return this.currentPlayer ? this.currentPlayer.videoWidth : 0
    },

    getVideoHeight () {
      return this.currentPlayer ? this.currentPlayer.videoHeight : 0
    },

    clear () {
      if (this.currentPlayer) {
        this.currentPlayer.src = ''
        this.currentPlayer.removeAttribute('src')
        this.currentPlayer.load()
      }
    },

    resetHeight (height) {
      this.$nextTick(() => {
        if (this.currentPlayer) this.currentPlayer.style.height = '0px'
        if (this.nextPlayer) this.nextPlayer.style.height = '0px'
        height = height || this.container.offsetHeight
        if (this.currentPlayer) this.currentPlayer.style.height = `${height}px`
        if (this.nextPlayer) this.nextPlayer.style.height = `${height}px`
      })
    },

    // Navigation

    getNextIndex (index) {
      let i = index + 1 >= this.entities.length ? 0 : index + 1
      // While we don't come back to initial entity and we have video previews
      while (
        i !== index &&
        this.entities[i] &&
        this.entities[i].preview_file_extension !== 'mp4'
      ) {
        i++
        if (i >= this.entities.length) i = 0
      }
      return i
    },

    getPreviousIndex (index) {
      let i = index - 1 >= 0 ? index - 1 : this.entities.length - 1
      // While we don't come back to initial entity and we have video previews
      while (i !== index && this.entities[i] && this.entities[i].preview_file_extension !== 'mp4') {
        i--
        if (i < 0) i = this.entities.length
      }
      return i
    },

    goPreviousFrame () {
      const newTime = this.currentPlayer.currentTime - 1 / this.fps
      if (newTime < 0) {
        this.setCurrentTime(0)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    goNextFrame () {
      if (this.currentPlayer) {
        const newTime = this.currentPlayer.currentTime + 1 / this.fps
        if (newTime > this.currentPlayer.duration) {
          this.setCurrentTime(this.video.duration)
        } else {
          this.setCurrentTime(newTime)
        }
      }
    },

    loadPreviousEntity () {
      this.loadEntity(this.getPreviousIndex(this.currentIndex))
      this.$emit('entity-change', this.currentIndex)
    },

    loadNextEntity () {
      const newIndex = this.getNextIndex(this.currentIndex)
      this.loadEntity(newIndex)
      this.$emit('entity-change', this.currentIndex)
    },

    reloadCurrentEntity () {
      this.loadEntity(this.currentIndex)
    },

    loadEntity (index = 0) {
      if (index < this.entities.length) {
        const nextIndex = this.getNextIndex(index)
        const entity = this.entities[index]
        const nextEntity = this.entities[nextIndex]

        this.currentIndex = index
        this.currentPlayer = this.player1
        this.nextPlayer = this.player2
        this.currentPlayer.removeEventListener(
          'loadedmetadata',
          this.updateMaxDuration
        )
        this.currentPlayer.addEventListener(
          'loadedmetadata',
          this.updateMaxDuration
        )

        this.currentPlayer.src = this.getMoviePath(entity)
        this.nextPlayer.src = this.getMoviePath(nextEntity)
        this.currentPlayer.style.display = 'block'
        this.nextPlayer.style.display = 'none'
        this.resetHeight()

        this.currentPlayer.removeEventListener('timeupdate', this.updateTime)
        this.currentPlayer.addEventListener('timeupdate', this.updateTime)

        this.$emit('entity-change', this.currentIndex)
      }
    },

    // Playing

    pause () {
      if (this.currentPlayer) this.currentPlayer.pause()
      this.isPlaying = false
    },

    play () {
      let entity = this.entities[this.currentIndex]
      if (entity) {
        if (!entity.preview_file_id) this.loadNextEntitn()
        entity = this.entities[this.currentIndex]
        if (entity.preview_file_id) {
          if (this.currentPlayer) this.currentPlayer.play()
          this.isPlaying = true
        }
      }
    },

    playNext () {
      if (this.isRepeating) {
        this.currentPlayer.currentTime = 0
        this.currentPlayer.play()
        this.$emit('repeat')
      } else {
        const nextIndex = this.getNextIndex(this.currentIndex)
        this.currentIndex = nextIndex
        this.$emit('entity-change', this.currentIndex)

        if (this.currentPlayer) this.currentPlayer.style.display = 'none'
        if (this.nextPlayer) {
          this.nextPlayer.style.display = 'block'
          this.nextPlayer.play()
        }

        this.switchPlayers()
        this.updateMaxDuration()
      }
    },

    getCurrentTime () {
      return this.currentPlayer.currentTime
    },

    setCurrentTime (currentTime) {
      currentTime = roundToFrame(currentTime, this.fps)
      if (this.currentPlayer) this.currentPlayer.currentTime = currentTime
    },

    switchPlayers () {
      const nextIndex = this.getNextIndex(this.currentIndex)
      const nextEntity = this.entities[nextIndex]
      this.tmpPlayer = this.currentPlayer
      this.currentPlayer = this.nextPlayer
      this.nextPlayer = this.tmpPlayer
      if (nextEntity) {
        this.nextPlayer.src = this.getMoviePath(nextEntity)
      }
      this.resetHeight()

      if (this.currentPlayer) {
        this.currentPlayer.removeEventListener('timeupdate', this.updateTime)
        this.currentPlayer.addEventListener('timeupdate', this.updateTime)
      }
      if (this.nextPlayer) {
        this.nextPlayer.removeEventListener('timeupdate', this.updateTime)
      }
    },

    updateTime (time) {
      this.$emit('time-update', time)
    },

    updateMaxDuration () {
      if (this.currentPlayer) {
        this.$emit('max-duration-update', this.currentPlayer.duration)
      }
    }
  },

  watch: {
    entities () {
      if (this.entities.length > 0) {
        this.loadEntity(0)
        this.pause()
        this.setCurrentTime(0)

        const entity = this.entities[this.currentIndex]
        if (entity && !entity.preview_file_id) this.loadNextEntity()
      }
      setTimeout(this.resetHeight, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper {
  height: 100%;

  video {
    margin: auto;
  }
}

.container {
  max-height: 100%;
}

</style>
