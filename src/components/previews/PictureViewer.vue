<template>
<div ref="container" class="picture-player">
  <div ref="picture-wrapper" class="picture-wrapper" oncontextmenu="return false;">
    <div v-show="!isLoading" class="picture-subwrapper" ref="picture-subwrapper">
      <div
        ref="loupe"
        class="loupe"
        id="loupe"
        :style="{
          background: 'url(' + pictureDlPath + ')'
        }"
      >
      </div>
      <div v-show="isGif">
        <img ref="picture-gif" :src="pictureGifPath" />
      </div>
      <div v-show="!isGif">
        <img
          ref="picture-big"
          id="picture-big"
          :src="pictureDlPath"
          v-show="fullScreen"
        />
        <img
          ref="picture"
          id="picture"
          :src="picturePath"
          v-show="!fullScreen"
        />
      </div>
    </div>
    <spinner v-if="isLoading"/>
  </div>
</div>
</template>

<script>
import { fullScreenMixin } from '@/components/mixins/fullscreen'
import { domMixin } from '@/components/mixins/dom'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'picture-viewer',

  components: {
    Spinner
  },
  mixins: [domMixin, fullScreenMixin],

  props: {
    big: {
      type: Boolean,
      default: false
    },
    defaultHeight: {
      type: Number,
      default: 0
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    isComparing: {
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
    return {
      isLoading: true,
      picturePath: '',
      pictureDlPath: '',
      pictureGifPath: ''
    }
  },

  mounted () {
    this.container.style.height = this.defaultHeight + 'px'
    this.isLoading = true
    if (this.picture.complete) {
      this.isLoading = false
      this.onWindowResize()
    }
    this.picture.addEventListener('load', this.endLoading)
    this.pictureBig.addEventListener('load', this.endLoading)
    this.pictureGif.addEventListener('load', this.endLoading)
    window.addEventListener('resize', this.onWindowResize)
    this.setPicturePath()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onWindowResize)
  },

  computed: {

    // Elements

    container () {
      return this.$refs.container
    },

    picture () {
      return this.$refs.picture
    },

    pictureBig () {
      return this.$refs['picture-big']
    },

    pictureGif () {
      return this.$refs['picture-gif']
    },

    pictureWrapper () {
      return this.$refs['picture-wrapper']
    },

    pictureSubWrapper () {
      return this.$refs['picture-subwrapper']
    },

    // Utils

    extension () {
      return this.preview ? this.preview.extension : ''
    },

    isGif () {
      return this.extension === 'gif'
    },

    isMovie () {
      return this.extension === 'mp4'
    },

    pictureOriginalPath () {
      if (this.preview) {
        const previewId = this.preview.id
        return `/api/pictures/originals/preview-files/${previewId}.png`
      } else {
        return ''
      }
    }
  },

  methods: {
    // Sizing

    getNaturalDimensions () {
      let picture = { naturalWidth: 0, naturalHeight: 0 }
      if (!this.fullScreen && this.picture.naturalWidth && !this.isGif) {
        picture = this.picture
      } else if (
        this.fullScreen && this.pictureBig.naturalWidth && !this.isGif
      ) {
        picture = this.pictureBig
      } else if (this.pictureGif.naturalWidth && this.isGif) {
        picture = this.pictureGif
      }
      return {
        height: picture.naturalHeight,
        width: picture.naturalWidth
      }
    },

    getDimensions () {
      let ratio = 1
      const dimensions = this.getNaturalDimensions()
      if (dimensions.width > 0) ratio = dimensions.height / dimensions.width
      let width = dimensions.width
      if (width > this.container.offsetWidth) {
        width = this.container.offsetWidth
      }
      let height = Math.floor(width * ratio)
      if (height > this.defaultHeight) {
        height = this.defaultHeight
      }
      width = Math.floor(height / ratio)
      return { width, height }
    },

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.$nextTick(() => {
          this.resetPicture()
        })
      }
    },

    // Configuration

    endLoading () {
      this.isLoading = false
      this.$nextTick(this.resetPicture)
    },

    resetPicture () {
      const heightValue = this.defaultHeight + 'px'
      this.container.style.height = heightValue
      if (this.pictureWrapper) this.pictureWrapper.style.height = heightValue
      if (this.pictureSubWrapper) {
        this.pictureWrapper.style['max-height'] = heightValue
        this.pictureSubWrapper.style['max-height'] = heightValue
      }
      const dimensions = this.getDimensions()
      const width = dimensions.width
      const height = dimensions.height
      this.picture.style.width = width + 'px'
      this.picture.style.height = height + 'px'
      this.pictureBig.style.width = width + 'px'
      this.pictureBig.style.height = height + 'px'
      this.pictureGif.style.width = width + 'px'
      this.pictureGif.style.height = height + 'px'
      this.picture.width = width
      this.picture.height = height
      this.pictureBig.width = width
      this.pictureBig.height = height
      this.pictureGif.width = width
      this.pictureGif.height = height
      if (!this.isMovie) this.$emit('size-changed', dimensions)
    },

    setPicturePath () {
      if (this.isGif) {
        const previewId = this.preview.id
        this.pictureGifPath =
          `/api/pictures/originals/preview-files/${previewId}.gif`
      } else if (this.preview) {
        const previewId = this.preview.id
        this.picturePath =
          `/api/pictures/previews/preview-files/${previewId}.png`
      }
      this.setPictureDlPath()
    },

    setPictureDlPath () {
      if (this.preview) {
        const previewId = this.preview.id
        this.pictureDlPath =
          `/api/pictures/originals/preview-files/${previewId}/download`
      } else {
        this.pictureDlPath = ''
      }
    },

    // Loupe

    showLoupe () {
      this.$refs.loupe.style.display = 'block'
    },

    hideLoupe () {
      this.$refs.loupe.style.display = 'none'
    },

    updateLoupePosition (event, canvasDimensions) {
      const w = canvasDimensions.width
      const h = canvasDimensions.height
      const maxWidth = parseInt(w.substring(0, w.length - 2))
      const maxHeight = parseInt(h.substring(0, h.length - 2))
      let x = Math.max(event.pointer.x - 150, 0)
      let y = Math.max(event.pointer.y - 150, 0)
      x = Math.min(x, maxWidth - 300)
      y = Math.min(y, maxHeight - 300)
      this.$refs.loupe.style.left = x + 'px'
      this.$refs.loupe.style.top = y + 'px'

      let zx = Math.max(event.pointer.x, 0)
      let zy = Math.max(event.pointer.y, 0)
      zx = Math.min(zx, maxWidth)
      zy = Math.min(zy, maxHeight)
      const naturalDimensions = this.getNaturalDimensions()
      const ratioW = naturalDimensions.width / maxWidth
      const bgX = Math.min((ratioW * zx) - 150, naturalDimensions.width - 300)
      const bgY = Math.min((ratioW * zy) - 150, naturalDimensions.height - 300)
      this.$refs.loupe.style['background-position'] = `-${bgX}px -${bgY}px`
    }
  },

  watch: {
    fullScreen () {
      if (this.fullScreen) {
        this.isLoading = true
        this.setPictureDlPath()
        if (this.pictureBig.complete) this.isLoading = false
      } else {
        this.setPicturePath()
      }
    },

    isLoading () {
      if (!this.isLoading) {
        setTimeout(this.resetPicture, 100)
      }
    },

    light () {
      this.onWindowResize()
    },

    isComparing () {
      setTimeout(() => {
        this.resetPicture()
      }, 20)
    },

    preview () {
      this.isLoading = true
      this.setPicturePath()
      this.setPictureDlPath()
      if (this.currentIndex > 1) {
        this.currentIndex = 1
      }
      if (this.fullScreen) {
        if (this.pictureBig.complete) {
          this.resetPicture()
          this.isLoading = false
        }
      } else {
        if (this.picture.complete) {
          this.isLoading = false
        }
        this.$nextTick(this.resetPicture)
      }
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
  background: black;
  align-items: center;
  justify-content: center;
}

.picture-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  border-radius: 5px;
  height: 100%;
}

.spinner {
  margin-top: 1em;
  margin-bottom: 1em;
}

.picture-wrapper {
  flex: 1;
  border-radius: 5px;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  z-index: 300;
  margin: auto;
}

.picture-subwrapper {
  position: relative;
}

.picture-player {
  width: 100%;
  text-align: center;
  background: #36393F;
}

.loupe {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  height: 300px;
  width: 300px;
  background: white;
  z-index: 3000;
  border-radius: 5px;
  box-shadow: 0 0 8px 4px rgba(0, 0, 0, 0.2);

  img {
    position: relative;
    width: 800px;
  }
}
</style>
