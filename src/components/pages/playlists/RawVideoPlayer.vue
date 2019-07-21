<template>
<div ref="container" class="video-wrapper filler flexrow-item">
  <video
    ref="player1"
    preload="auto"
    @ended="playNext"
  />
  <video
    ref="player2"
    preload="auto"
    @ended="playNext"
  />
</div>
</template>

<script>
/*
 * To play several videos, to avoid blinking effects, it's required to use
 * two video players. When switching from a shot to another, we hide and show
 * players so the blink does not occur.
 */
import { mapGetters } from 'vuex'

export default {
  name: 'raw-video-player',

  components: {
  },

  props: {
    shots: {
      type: Array,
      default: () => []
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
    window.addEventListener('resize', this.resetHeight)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resetHeight)
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
    getMoviePath (previewId) {
      return `/api/movies/originals/preview-files/${previewId}.mp4`
    },

    getNextIndex (index) {
      let i = index + 1 >= this.shots.length ? 0 : index + 1
      // While we don't come back to initial shot and we have video previews
      while (i !== index && this.shots[i].preview_file_extension !== 'mp4') {
        i++
        if (i >= this.shots.length) i = 0
      }
      return i
    },

    getPreviousIndex (index) {
      let i = index - 1 >= 0 ? index - 1 : this.shots.length - 1
      // While we don't come back to initial shot and we have video previews
      while (i !== index && this.shots[i].preview_file_extension !== 'mp4') {
        i--
        if (i < 0) i = this.shots.length
      }
      return i
    },

    clear () {
      if (this.currentPlayer) {
        this.currentPlayer.src = ''
        this.currentPlayer.removeAttribute('src')
        this.currentPlayer.load()
      }
    },

    goPreviousFrame () {
      let newTime = this.currentPlayer.currentTime - 1 / this.fps
      if (newTime < 0) {
        this.setCurrentTime(0)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    goNextFrame () {
      let newTime = this.currentPlayer.currentTime + 1 / this.fps
      if (newTime > this.currentPlayer.duration) {
        this.setCurrentTime(this.video.duration)
      } else {
        this.setCurrentTime(newTime)
      }
    },

    loadPreviousShot () {
      this.loadShot(this.getPreviousIndex(this.currentIndex))
      this.$emit('shot-change', this.currentIndex)
    },

    loadNextShot () {
      this.loadShot(this.getNextIndex(this.currentIndex))
      this.$emit('shot-change', this.currentIndex)
    },

    loadShot (index = 0) {
      if (index < this.shots.length) {
        const nextIndex = this.getNextIndex(index)
        const shot = this.shots[index]
        const nextShot = this.shots[nextIndex]

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

        this.currentPlayer.src = this.getMoviePath(shot.preview_file_id)
        this.nextPlayer.src = this.getMoviePath(nextShot.preview_file_id)
        this.currentPlayer.style.display = 'block'
        this.nextPlayer.style.display = 'none'
        this.resetHeight()

        this.currentPlayer.removeEventListener('timeupdate', this.updateTime)
        this.currentPlayer.addEventListener('timeupdate', this.updateTime)

        this.$emit('shot-change', this.currentIndex)
      }
    },

    pause () {
      if (this.currentPlayer) this.currentPlayer.pause()
      this.isPlaying = false
    },

    play () {
      let shot = this.shots[this.currentIndex]
      if (shot) {
        if (!shot.preview_file_id) this.loadNextShot()
        shot = this.shots[this.currentIndex]
        if (shot.preview_file_id) {
          if (this.currentPlayer) this.currentPlayer.play()
          this.isPlaying = true
        }
      }
    },

    playNext () {
      let nextIndex = this.getNextIndex(this.currentIndex)
      this.currentIndex = nextIndex
      this.$emit('shot-change', this.currentIndex)

      this.currentPlayer.style.display = 'none'
      this.nextPlayer.style.display = 'block'
      this.nextPlayer.play()

      this.switchPlayers()
      this.updateMaxDuration()
    },

    resetHeight () {
      this.$nextTick(() => {
        if (this.currentPlayer) this.currentPlayer.style.height = `0px`
        if (this.nextPlayer) this.nextPlayer.style.height = `0px`
        let height = this.container.offsetHeight
        if (this.currentPlayer) this.currentPlayer.style.height = `${height}px`
        if (this.nextPlayer) this.nextPlayer.style.height = `${height}px`
      })
    },

    setCurrentTime (currentTime) {
      if (this.currentPlayer) this.currentPlayer.currentTime = currentTime
    },

    switchPlayers () {
      const nextIndex = this.getNextIndex(this.currentIndex)
      const nextShot = this.shots[nextIndex]
      this.tmpPlayer = this.currentPlayer
      this.currentPlayer = this.nextPlayer
      this.nextPlayer = this.tmpPlayer
      this.nextPlayer.src = this.getMoviePath(nextShot.preview_file_id)
      this.resetHeight()

      this.currentPlayer.removeEventListener('timeupdate', this.updateTime)
      this.nextPlayer.removeEventListener('timeupdate', this.updateTime)
      this.currentPlayer.addEventListener('timeupdate', this.updateTime)
    },

    updateTime (time) {
      this.$emit('time-update', time)
    },

    updateMaxDuration () {
      this.$emit('max-duration-update', this.currentPlayer.duration)
    }
  },

  watch: {
    shots () {
      if (this.shots.length > 0) {
        this.loadShot(0)
        this.pause()
        this.setCurrentTime(0)

        const shot = this.shots[this.currentIndex]
        if (shot && !shot.preview_file_id) this.loadNextShot()
      }
      setTimeout(this.resetHeight, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper {
  height: 100%;
}

.container {
  max-height: 100%;
}
</style>
