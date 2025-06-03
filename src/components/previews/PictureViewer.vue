<template>
  <div ref="container" class="picture-player">
    <div
      ref="picture-wrapper"
      class="picture-wrapper"
      oncontextmenu="return false;"
    >
      <div
        v-show="!isLoading"
        class="picture-subwrapper"
        ref="picture-subwrapper"
      >
        <div
          ref="loupe"
          class="loupe"
          id="loupe"
          :style="{
            background: 'url(' + pictureDlPath + ')'
          }"
        ></div>
        <div v-show="isGif">
          <img ref="picture-gif" :src="pictureGifPath" />
        </div>
        <div v-show="!isGif">
          <img
            ref="picture-big"
            :src="pictureDlPath"
            v-show="fullScreen || big"
          />
          <img ref="picture" :src="picturePath" v-show="!fullScreen && !big" />
        </div>
      </div>
      <spinner v-if="isLoading" />
    </div>
  </div>
</template>

<script>
import panzoom from 'panzoom'

import { fullScreenMixin } from '@/components/mixins/fullscreen'
import { domMixin } from '@/components/mixins/dom'

import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'picture-viewer',

  mixins: [domMixin, fullScreenMixin],

  components: {
    Spinner
  },

  props: {
    big: {
      type: Boolean,
      default: false
    },
    defaultHeight: {
      type: Number,
      default: 0
    },
    marginBottom: {
      type: Number,
      default: 0
    },
    fullScreen: {
      type: Boolean,
      default: false
    },
    highQuality: {
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
    },
    panzoom: {
      type: Boolean,
      default: false
    }
  },

  emits: ['loaded', 'panzoom-changed', 'size-changed'],

  data() {
    return {
      isLoading: true,
      picturePath: '',
      pictureDlPath: '',
      pictureGifPath: '',
      panzoomInstances: []
    }
  },

  mounted() {
    this.container = this.$refs.container
    this.picture = this.$refs.picture
    this.pictureBig = this.$refs['picture-big']
    this.pictureGif = this.$refs['picture-gif']
    this.pictureWrapper = this.$refs['picture-wrapper']
    this.pictureSubWrapper = this.$refs['picture-subwrapper']

    this.container.style.height = this.defaultHeight + 'px'
    this.isLoading = true

    this.setPictureEmptyPath()
    if (this.picture.complete) {
      this.onWindowResize()
    }
    this.picture.addEventListener('load', this.endLoading)
    this.pictureBig.addEventListener('load', this.endLoading)
    this.pictureGif.addEventListener('load', this.endLoading)
    window.addEventListener('resize', this.onWindowResize)
    this.setPicturePath()
    this.setupPanZoom()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
    this.panzoomInstances.forEach(panzoom => panzoom.dispose())
  },

  computed: {
    // Elements

    status() {
      return this.preview && this.preview.status ? this.preview.status : 'ready'
    },

    isAvailable() {
      return !['broken', 'processing'].includes(this.status)
    },

    // Utils

    extension() {
      return this.preview ? this.preview.extension : ''
    },

    isGif() {
      return this.extension === 'gif'
    },

    isMovie() {
      return this.extension === 'mp4'
    },

    isPicture() {
      return ['gif', 'png', 'jpg', 'jpeg'].includes(this.extension)
    },

    pictureOriginalPath() {
      if (this.preview && this.isAvailable && this.isPicture) {
        const previewId = this.preview.id
        return `/api/pictures/originals/preview-files/${previewId}.png`
      } else {
        return null
      }
    }
  },

  methods: {
    // Sizing
    getNaturalDimensions() {
      let picture = { naturalWidth: 0, naturalHeight: 0 }
      if (!this.fullScreen && this.picture.naturalWidth && !this.isGif) {
        picture = this.picture
      } else if (
        this.fullScreen &&
        this.pictureBig.naturalWidth &&
        !this.isGif
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

    getDimensions() {
      let ratio = 1
      const dimensions = this.getNaturalDimensions()
      if (dimensions.width > 0) ratio = dimensions.height / dimensions.width
      let width = dimensions.width
      if (
        width > this.container.offsetWidth &&
        this.container.offsetWidth > 0
      ) {
        width = this.container.offsetWidth
      }
      let height = Math.floor(width * ratio)
      if (height > this.defaultHeight) {
        height = this.defaultHeight
      }
      width = Math.floor(height / ratio)
      return { width, height }
    },

    onWindowResize() {
      this.resetPicture()
    },

    // Configuration

    endLoading() {
      if (!this.picture) {
        this.picture = this.$refs.picture
      }
      if (
        this.fullScreen &&
        (this.pictureBig.complete || this.pictureGif.complete)
      ) {
        this.isLoading = false
      } else if (!this.fullScreen && this.picture.complete) {
        this.isLoading = false
      }
      this.$emit('loaded')
      this.$nextTick(this.resetPicture)
    },

    resetPicture() {
      const heightValue = this.defaultHeight + 'px'
      this.container.style.height = heightValue
      if (this.pictureWrapper) this.pictureWrapper.style.height = heightValue
      if (this.pictureSubWrapper) {
        this.pictureWrapper.style['max-height'] = heightValue
        this.pictureSubWrapper.style['max-height'] = heightValue
        this.pictureSubWrapper.style['height'] = heightValue
      }
      let { width, height } = this.getDimensions()
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

      if (this.fullScreen) {
        this.pictureBig.style.maxHeight = `calc(100vh - ${this.marginBottom}px)`
      }

      if (this.isPicture) {
        const pictureElement = this.isGif
          ? this.pictureGif
          : this.fullScreen
            ? this.pictureBig
            : this.picture
        const picturePosition = pictureElement.getBoundingClientRect()
        const containerPosition = this.container.getBoundingClientRect()
        const top = picturePosition.top - containerPosition.top
        const left = picturePosition.left - containerPosition.left
        width = picturePosition.width
        height = picturePosition.height

        this.resetPanZoom()

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
      }
    },

    setPictureEmptyPath() {
      if (this.isGif && this.isPicture) {
        this.pictureGifPath = null
      } else if (this.preview && this.isPicture) {
        this.picturePath = null
        this.pictureDlPath = null
      }
    },

    setPicturePath() {
      if (this.isGif && this.isAvailable && this.isPicture) {
        const previewId = this.preview.id
        this.pictureGifPath = `/api/pictures/originals/preview-files/${previewId}.gif`
      } else if (this.preview && this.isAvailable && this.isPicture) {
        const previewId = this.preview.id
        if (this.highQuality) {
          this.picturePath = `/api/pictures/originals/preview-files/${previewId}.png`
        } else {
          this.picturePath = `/api/pictures/previews/preview-files/${previewId}.png`
        }
      }
      this.setPictureDlPath()
    },

    setPictureDlPath() {
      if (this.preview && this.isAvailable && this.isPicture) {
        const previewId = this.preview.id
        this.pictureDlPath = `/api/pictures/originals/preview-files/${previewId}/download`
      } else {
        this.pictureDlPath = null
      }
    },

    // Loupe

    showLoupe() {
      this.$refs.loupe.style.display = 'block'
    },

    hideLoupe() {
      this.$refs.loupe.style.display = 'none'
    },

    updateLoupePosition(event, canvasDimensions) {
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
      const bgX = Math.min(ratioW * zx - 150, naturalDimensions.width - 300)
      const bgY = Math.min(ratioW * zy - 150, naturalDimensions.height - 300)
      this.$refs.loupe.style['background-position'] = `-${bgX}px -${bgY}px`
    },

    // Pan and Zoom

    setupPanZoom() {
      const pictures = [this.picture, this.pictureBig, this.pictureGif]
      this.panzoomInstances = pictures.map(picture =>
        panzoom(picture, {
          bounds: true,
          boundsPadding: 0.2,
          maxZoom: 5,
          minZoom: 1
        })
      )
      this.panzoomBig = this.panzoomInstances[1]
      this.panzoomGif = this.panzoomInstances[2]
      this.panzoomBig.on('zoom', () => {
        if (!this.big) return
        this.emitPanZoom(this.panzoomBig)
      })
      this.panzoomBig.on('panend', () => {
        if (!this.big) return
        this.emitPanZoom(this.panzoomBig)
      })
      this.panzoomGif.on('zoom', () => {
        if (!this.isGif) return
        this.emitPanZoom(this.panzoomBig)
      })
      this.panzoomGif.on('panend', () => {
        if (!this.isGif) return
        this.emitPanZoom(this.panzoomBig)
      })
    },

    emitPanZoom(panzoom) {
      if (this.$options.silent) return
      const { x, y, scale } = panzoom.getTransform()
      this.$emit('panzoom-changed', { x, y, scale })
    },

    resetPanZoom() {
      this.setPanZoom(0, 0, 1)
    },

    pausePanZoom() {
      this.panzoomInstances.forEach(panzoom => panzoom.pause())
    },

    resumePanZoom() {
      this.panzoomInstances.forEach(panzoom => panzoom.resume())
    },

    setPanZoom(x, y, scale) {
      this.$options.silent = true
      if (this.panzoomInstances.length === 0) return
      let panzoom = this.panzoomInstances[1]
      if (this.isGif) {
        panzoom = this.panzoomInstances[2]
      } else if (!this.big && !this.fullScreen) {
        panzoom = this.panzoomInstances[0]
      }
      const actualScale = panzoom.getTransform().scale
      const zoomFactor = scale / actualScale
      panzoom.moveTo(x, y)
      panzoom.setTransformOrigin({ x, y })
      panzoom.zoomTo(x, y, zoomFactor)
      panzoom.setTransformOrigin({ x: 0, y: 0 })
      this.$nextTick(() => {
        this.$options.silent = false
      })
    }
  },

  watch: {
    fullScreen() {
      this.resetPanZoom()
      if (this.fullScreen) {
        this.isLoading = true
        this.setPictureDlPath()
        if (this.pictureBig.complete) this.isLoading = false
      } else {
        this.setPicturePath()
      }
    },

    isLoading() {
      if (!this.isLoading) {
        setTimeout(this.resetPicture, 100)
      }
    },

    light() {
      this.resetPanZoom()
      this.onWindowResize()
    },

    isComparing() {
      this.resetPanZoom()
      setTimeout(() => {
        this.resetPicture()
      }, 20)
    },

    preview() {
      if (this.preview && this.preview.id !== this.lastPreviewId) {
        this.lastPreviewId = this.preview.id
        this.resetPanZoom()
        this.isLoading = true
        this.setPictureEmptyPath()
        this.$nextTick(() => {
          this.resetPicture()
          this.setPicturePath()
          this.setPictureDlPath()
          if (this.currentIndex > 1) {
            this.currentIndex = 1
          }
          if (this.fullScreen) {
            if (this.pictureBig.complete) {
              this.resetPicture()
            }
          } else {
            this.$nextTick(this.resetPicture)
          }
        })
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
  overflow: hidden;
}

.picture-subwrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.picture-player {
  width: 100%;
  text-align: center;
  background: #36393f;
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
