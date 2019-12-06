<template>
<div ref="container" class="picture-player">
  <div ref="picture-wrapper" class="picture-wrapper">
    <div class="canvas-wrapper">
      <canvas
        :style="{
          display: 'block'
        }"
        id="annotation-canvas"
        ref="annotation-canvas"
        class="canvas"
        v-if="!readOnly"
      >
      </canvas>
    </div>
    <img ref="picture" :src="pictureDlPath" v-if="isFullScreen" />
    <img ref="picture" :src="picturePath" v-else />
    <spinner v-if="isLoading"/>
  </div>

  <div class="buttons flexrow pull-bottom" ref="button-bar">
    <div class="left flexrow">
      <button
        class="button flexrow-item"
        @click="onPreviousClicked"
        v-if="!readOnly"
      >
        <chevron-left-icon class="icon" />
      </button>

      <span
        class="flexrow-item bar-element"
        v-if="!readOnly"
      >
        {{ currentIndex }} / {{ preview.previews.length }}
      </span>

      <button
        class="button flexrow-item"
        @click="onNextClicked"
        v-if="!readOnly"
      >
        <chevron-right-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onAddPreviewClicked"
        v-if="!readOnly"
      >
        <plus-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onRemovePreviewClicked"
        v-if="currentIndex > 1 && !light && !readOnly"
      >
        <trash-icon class="icon" />
      </button>
    </div>

    <div class="right flexrow">
      <button
        class="button flexrow-item"
        @click="onDeleteClicked"
        v-if="isFullScreenEnabled && !readOnly"
      >
        <x-icon class="icon" />
      </button>

      <button
        :class="{
          button: true,
          'flexrow-item': true,
          active: isDrawing
        }"
        @click="onPencilAnnotateClicked"
        v-if="isFullScreenEnabled && !readOnly"
      >
        <edit-2-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onFullscreenClicked"
        v-if="isFullScreenEnabled"
      >
        <maximize-icon class="icon" />
      </button>

      <a
        class="button flexrow-item"
        :href="pictureDlPath"
        v-if="!readOnly"
      >
        <download-icon class="icon" />
      </a>
    </div>
  </div>
</div>
</template>

<script>
import { fabric } from 'fabric'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  PlusIcon,
  TrashIcon,
  XIcon
} from 'vue-feather-icons'
import Spinner from '../widgets/Spinner'

export default {
  name: 'picture-viewer',

  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    PlusIcon,
    Spinner,
    TrashIcon,
    XIcon
  },

  props: {
    preview: {
      type: Object,
      default: () => {}
    },
    light: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      currentIndex: 1,
      isLoading: true,
      isDrawing: false,
      annotations:
        this.preview.annotations ? [...this.preview.annotations] : [],
      fabricCanvas: null
    }
  },

  mounted () {
    this.container.style.height = this.getDefaultHeight() + 'px'
    setTimeout(() => {
      if (this.picture.complete) {
        this.isLoading = false
        this.mountPicture()
      } else {
        this.picture.addEventListener('load', () => {
          this.isLoading = false
          this.mountPicture()
        })
      }
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('resize', this.onWindowResize)
    }, 0)
  },

  computed: {
    container () {
      return this.$refs.container
    },

    canvas () {
      return this.$refs.canvas
    },

    picture () {
      return this.$refs.picture
    },

    pictureWrapper () {
      return this.$refs['picture-wrapper']
    },

    picturePath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/previews/preview-files/${previewId}.png`
    },

    pictureDlPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    isFullScreenEnabled () {
      return !!(
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled ||
        document.webkitSupportsFullscreen ||
        document.webkitFullscreenEnabled ||
        document.createElement('picture').webkitRequestFullScreen
      )
    },

    currentPreview () {
      return this.preview.previews[this.currentIndex - 1]
    }
  },

  beforeDestroy () {
    this.clearCanvas()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  methods: {

    isFullScreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    },

    mountPicture () {
      if (!this.fabricCanvas) this.setupFabricCanvas()
      this.container.style.height = this.getDefaultHeight() + 'px'
      this.loadAnnotation(0)
      this.$nextTick(this.fixCanvasSize)
    },

    clearCanvas () {
      if (this.fabricCanvas) {
        this.fabricCanvas.getObjects().forEach((obj) => {
          this.fabricCanvas.remove(obj)
        })
      }
    },

    getDefaultHeight () {
      if (this.isFullScreen()) {
        return screen.height
      } else {
        return screen.width > 1300 && (!this.light || this.readOnly) ? 500 : 200
      }
    },

    getDimensions () {
      let ratio = 1
      if (this.picture.naturalWidth) {
        ratio = this.picture.naturalHeight / this.picture.naturalWidth
      }
      let width = this.container.offsetWidth - 1
      let height = Math.floor(width * ratio)
      if (height > this.getDefaultHeight()) {
        height = this.getDefaultHeight()
      }
      height = height - 32
      width = Math.floor(height / ratio)

      return { width, height }
    },

    setupFabricCanvas () {
      if (!this.readOnly) {
        const dimensions = this.getDimensions()
        const width = dimensions.width
        const height = dimensions.height
        const fabricCanvas = new fabric.Canvas('annotation-canvas')

        this.container.style.height = this.getDefaultHeight() + 'px'
        fabricCanvas.setDimensions({
          width: width,
          height: height
        })

        fabricCanvas.freeDrawingBrush.color = '#ff3860'
        fabricCanvas.freeDrawingBrush.width = 4

        fabricCanvas.off('object:scaling', this.onScaled)
        fabricCanvas.on('object:scaling', this.onScaled)
        fabricCanvas.off('object:scaled', this.onScaled)
        fabricCanvas.on('object:scaled', this.onScaled)
        fabricCanvas.off('object:moved', this.saveAnnotations)
        fabricCanvas.off('object:moved', this.saveAnnotations)
        fabricCanvas.on('object:moved', this.saveAnnotations)
        fabricCanvas.off('object:scaled', this.saveAnnotations)
        fabricCanvas.on('object:scaled', this.saveAnnotations)
        fabricCanvas.off('mouse:up', this.onMouseUp)
        fabricCanvas.on('mouse:up', this.onMouseUp)
        this.fabricCanvas = fabricCanvas
      }
    },

    onAddPreviewClicked () {
      this.$emit('add-preview')
    },

    onRemovePreviewClicked () {
      this.$emit('remove-extra-preview', this.currentPreview)
    },

    onFullscreenClicked () {
      if (this.isFullScreen()) {
        this.exitFullScreen()
      } else {
        this.setFullScreen()
      }
    },

    exitFullScreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      this.container.setAttribute('data-fullscreen', !!false)
    },

    setFullScreen () {
      if (this.container.requestFullscreen) {
        this.container.requestFullscreen()
      } else if (this.container.mozRequestFullScreen) {
        this.container.mozRequestFullScreen()
      } else if (this.container.webkitRequestFullScreen) {
        this.container.webkitRequestFullScreen()
      } else if (this.container.msRequestFullscreen) {
        this.container.msRequestFullscreen()
      }
      this.container.setAttribute('data-fullscreen', !!true)
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    onPencilAnnotateClicked () {
      if (this.fabricCanvas.isDrawingMode) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.fabricCanvas.isDrawingMode = true
        this.isDrawing = true
      }
    },

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        setTimeout(() => {
          this.clearCanvas()
          this.mountPicture()
          this.reloadAnnotations()
          this.$nextTick(this.fixCanvasSize)
        }, 10)
      }
    },

    onKeyDown (event) {
      if (event.keyCode === 46 && this.fabricCanvas) {
        this.deleteSelection()
      }
    },

    onMouseUp () {
      if (this.isDrawing) this.saveAnnotations()
    },

    onScaled (event) {
      const obj = event.target
      if (obj) obj.set({ strokeWidth: 8 / (obj.scaleX + obj.scaleY) })
    },

    saveAnnotations () {
      // Annotation are aimed to be used mainly by videos. That's why
      // annotations are stored in a list.
      const annotation = this.getAnnotation(0)

      this.fabricCanvas.getObjects().forEach((obj) => {
        if (obj.type === 'path') {
          if (!obj.canvasWidth) obj.canvasWidth = this.fabricCanvas.width
          obj.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: false
          })
        }
      })

      if (annotation) {
        annotation.drawing = this.fabricCanvas.toJSON(['canvasWidth'])
        annotation.width = this.fabricCanvas.width
        annotation.height = this.fabricCanvas.height
      } else {
        this.annotations = []
        const dimensions = this.getDimensions()
        const annotation = {
          time: 0,
          width: dimensions.width,
          height: dimensions.height,
          drawing: this.fabricCanvas.toJSON(['canvasWidth'])
        }
        this.annotations.push(annotation)
      }

      this.$emit('annotation-changed', {
        preview: this.currentPreview,
        annotations: [...this.annotations]
      })
    },

    getAnnotation (time) {
      return [...this.annotations][time]
    },

    clearAnnotations () {
      if (this.fabricCanvas) {
        this.fabricCanvas.getObjects().forEach((obj) => {
          if (['rect', 'circle', 'path'].includes(obj.type)) {
            this.fabricCanvas.remove(obj)
          }
        })
      }
    },

    loadAnnotation (time) {
      const annotation = this.getAnnotation(time)
      this.clearAnnotations()

      if (annotation) {
        const dimensions = this.getDimensions()
        let scaleMultiplierX = 1
        let scaleMultiplierY = 1
        if (annotation.width) {
          scaleMultiplierX = dimensions.width / annotation.width
          scaleMultiplierY = dimensions.width / annotation.width
        }
        if (annotation.height) {
          scaleMultiplierY = dimensions.height / annotation.height
        }

        annotation.drawing.objects.forEach((obj) => {
          const base = {
            left: obj.left * scaleMultiplierX,
            top: obj.top * scaleMultiplierY,
            fill: 'transparent',
            stroke: '#ff3860',
            radius: obj.radius * scaleMultiplierX,
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX * scaleMultiplierX,
            scaleY: obj.scaleY * scaleMultiplierY
          }
          if (obj.type === 'path') {
            let strokeMultiplier = 1
            if (obj.canvasWidth) {
              strokeMultiplier = obj.canvasWidth / dimensions.width
            }
            const path = new fabric.Path(
              obj.path,
              {
                ...base,
                strokeWidth: 3 * strokeMultiplier,
                canvasWidth: obj.canvasWidth
              }
            )
            path.setControlsVisibility({
              mt: false,
              mb: false,
              ml: false,
              mr: false,
              bl: false,
              br: false,
              tl: false,
              tr: false,
              mtr: false
            })
            this.fabricCanvas.add(path)
          }
        })
      }
    },

    deleteSelection () {
      this.fabricCanvas.remove(this.fabricCanvas.getActiveObject())
      this.saveAnnotations()
    },

    reloadAnnotations () {
      if (this.currentPreview.annotations) {
        this.annotations = this.currentPreview.annotations
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    onPreviousClicked () {
      if (this.currentIndex > 1) {
        this.currentIndex--
      } else {
        this.currentIndex = this.preview.previews.length
      }
    },

    onNextClicked () {
      if (this.currentIndex < this.preview.previews.length) {
        this.currentIndex++
      } else {
        this.currentIndex = 1
      }
    },

    displayFirst () {
      if (this.currentIndex > 1) {
        this.currentIndex = 1
      } else {
        this.reset()
      }
    },

    displayLast () {
      this.currentIndex = this.preview.previews.length
    },

    reset () {
      this.clearAnnotations()
      this.annotations = []
      this.reloadAnnotations()
      this.mountPicture()
      this.isDrawing = false
      if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = false
    },

    fixCanvasSize () {
      const dimensions = this.getDimensions()
      const width = dimensions.width
      const height = dimensions.height
      this.picture.width = width
      this.picture.height = height
      if (this.fabricCanvas) {
        this.fabricCanvas.setDimensions({ width, height })
        let elements = document.getElementsByClassName('canvas-container')
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]
          element.style.width = width + 'px'
          element.style.height = height + 'px'
          element.style.margin = 'auto'
        }
        elements = document.getElementsByClassName('upper-canvas')
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]
          element.style.width = width + 'px'
          element.style.height = height + 'px'
          element.setAttribute('width', width)
          element.setAttribute('height', height)
        }
        setTimeout(() => {
          this.fabricCanvas.calcOffset()
        }, 10)
      }
    }
  },

  watch: {
    preview () {
      if (this.currentIndex > 1) {
        this.currentIndex = 1
      } else {
        this.reset()
      }
    },

    currentIndex () {
      this.reset()
    },

    light () {
      this.onWindowResize()
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

.icon {
  margin-top: -4px;
  height: 20px;
}

.smaller {
  height: 16px;
}

.right {
  margin-left: auto;
}

.picture-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  height: 100%;
}

.spinner {
  margin-top: 1em;
  margin-bottom: 1em;
}

.picture-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;

  z-index: 300;
}

.annotation-picture {
  margin: auto;
}

.pull-bottom {
}

.bar-element {
  color: $light-grey;
  padding-left: 1em;
}

#annotation-canvas {
  display: block;
  width: 0;
}

#annotation-picture {
  width: 100%;
}

.picture-player {
  width: 100%;
  text-align: center;
  background: #36393F;
}

.picture-wrapper {
  text-align: center;
  margin: auto;
}

.picture-annotation {
  background: #26292F;
  height: 12px;
  text-align: left;
  margin-top: 0px;
  padding: 0;
}

.buttons .button {
  background: #26292F;
  border-radius: 0;
  color: #BBB;
  border: 0;
  margin: 0;
}

.buttons .button.active,
.buttons .button:hover {
  color: #43B581;
}

.canvas-wrapper {
  width: 100%;
  position: absolute;
  left: 0;
  z-index: 300;

  div {
    margin: auto;
  }
}
</style>
