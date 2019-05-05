<template>
<div ref="container" class="picture-player">
  <div ref="picture-wrapper" class="picture-wrapper">
    <div class="loading-background" v-if="isLoading" >
      <spinner class="spinner" />
    </div>
    <canvas
      :style="{
        display: 'block'
      }"
      id="annotation-canvas"
      ref="annotation-canvas"
      class="canvas"
    >
    </canvas>
  </div>

  <div class="buttons flexrow pull-bottom" ref="button-bar">
    <div class="left flexrow">
      <button
        @click="onPreviousClicked"
        class="button flexrow-item"
      >
        <chevron-left-icon class="icon" />
      </button>

      <span
        class="flexrow-item bar-element"
      >
        {{ currentIndex }} / {{ preview.previews.length }}
      </span>

      <button
        class="button flexrow-item"
        @click="onNextClicked"
      >
        <chevron-right-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onAddPreviewClicked"
      >
        <plus-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onRemovePreviewClicked"
        v-if="currentIndex > 1 && !light"
      >
        <trash-icon class="icon" />
      </button>
    </div>

    <div class="right flexrow">
      <button
        class="button flexrow-item"
        @click="onDeleteClicked"
        v-if="isFullScreenEnabled"
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
        v-if="isFullScreenEnabled"
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
  CircleIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  PlusIcon,
  TrashIcon,
  SquareIcon,
  XIcon
} from 'vue-feather-icons'
import Spinner from '../widgets/Spinner'

export default {
  name: 'picture-viewer',

  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    CircleIcon,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    PlusIcon,
    SquareIcon,
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
      this.mountPicture()

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
      return `/api/pictures/originals/preview-files/${previewId}.png`
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
      this.isResizing = true
      this.isLoading = true
      this.clearCanvas(() => {
        this.setupFabricPicture((fabricCanvas) => {
          this.isLoading = false
          this.fabricCanvas = fabricCanvas
          this.loadAnnotation(0)
          this.isResizing = false
          this.fixCanvasSize()
          if (this.fabricCanvas) this.fabricCanvas.calcOffset()
        })
      })
    },

    clearCanvas (callback) {
      if (this.fabricCanvas) {
        this.fabricCanvas.getObjects().forEach((obj) => {
          this.fabricCanvas.remove(obj)
        })
      }
      if (this.$refs['annotation-canvas']) {
        this.$refs['annotation-canvas'].innerHTML = ''
        this.$refs['annotation-canvas'].innerText = ''
        this.$refs['annotation-canvas'].html = ''
      }

      setTimeout(() => {
        if (this.fabricCanvas) {
          try {
            this.fabricCanvas.clear()
          } catch (err) {
            console.log(err)
          }

          try {
            this.fabricCanvas.dispose()
          } catch (err) {
            console.log(err)
          }
        }
        this.fabricCanvas = null
        if (callback) callback()
      }, 0)
    },

    getDefaultHeight () {
      if (this.isFullScreen()) {
        return screen.height
      } else {
        return screen.width > 1300 && !this.light ? 500 : 200
      }
    },

    getDimensions (picture) {
      const ratio = picture.height / picture.width
      let width = this.container.offsetWidth - 1
      let height = Math.floor(width * ratio)
      if (height > this.getDefaultHeight()) {
        height = this.getDefaultHeight()
      }
      height = height - 32
      width = Math.floor(height / ratio)

      return { width, height }
    },

    setupFabricPicture (callback) {
      fabric.Image.fromURL(this.picturePath, (fabricPicture) => {
        const dimensions = this.getDimensions(fabricPicture)
        const width = dimensions.width
        const height = dimensions.height
        const fabricCanvas = new fabric.Canvas('annotation-canvas')

        this.container.style.height = this.getDefaultHeight() + 'px'
        fabricCanvas.setDimensions({
          width: width,
          height: height
        })
        this.pictureWrapper.style.width = width + 'px'
        this.pictureWrapper.style.height = height + 'px'

        fabricPicture = fabricPicture.set({
          left: 0,
          top: 0,
          objectCaching: false,
          selectable: false
        })

        fabricCanvas.add(fabricPicture)
        fabricPicture.sendToBack()
        this.fabricPicture = fabricPicture
        this.fabricPicture.scaleToWidth(width)
        this.fabricPicture.scaleToHeight(height)

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
        callback(fabricCanvas)
      })
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

    onRectAnnotateClicked () {
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false

      const rect = new fabric.Rect({
        left: Math.floor(this.fabricCanvas.width / 2) - 25,
        top: Math.floor(this.fabricCanvas.height / 2) - 25,
        fill: 'transparent',
        strokeWidth: 4,
        stroke: '#ff3860',
        width: 50,
        height: 50
      })

      this.fabricCanvas.add(rect)
      this.fabricCanvas.setActiveObject(rect)
      this.saveAnnotations()
    },

    onCircleAnnotateClicked () {
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false

      const circle = new fabric.Circle({
        left: this.fabricCanvas.width / 2 - 25,
        top: this.fabricCanvas.height / 2 - 25,
        radius: 20,
        fill: 'transparent',
        strokeWidth: 4,
        stroke: '#ff3860',
        width: 50,
        height: 50
      })

      this.fabricCanvas.add(circle)
      this.fabricCanvas.setActiveObject(circle)
      circle.bringToFront()
      this.saveAnnotations()
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
          this.mountPicture()
          this.reloadAnnotations()
        }, 0)
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
        if (annotation.drawing && annotation.drawing.objects.length === 1) {
          this.annotations.splice(0, 1)
        }
      } else {
        this.annotations = []
        const annotation = {
          time: 0,
          width: this.fabricCanvas.width,
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

      let scaleMultiplier = 1
      if (annotation) {
        if (annotation.width) {
          scaleMultiplier = this.fabricCanvas.width / annotation.width
        }

        annotation.drawing.objects.forEach((obj) => {
          const base = {
            left: obj.left * scaleMultiplier,
            top: obj.top * scaleMultiplier,
            fill: 'transparent',
            stroke: '#ff3860',
            radius: obj.radius * scaleMultiplier,
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX * scaleMultiplier,
            scaleY: obj.scaleY * scaleMultiplier
          }
          if (obj.type === 'rect') {
            const rect = new fabric.Rect({
              ...base
            })
            this.fabricCanvas.add(rect)
            rect.set({ strokeWidth: 8 / (obj.scaleX + obj.scaleY) })
          } else if (obj.type === 'circle') {
            const circle = new fabric.Circle({
              ...base
            })
            this.fabricCanvas.add(circle)
            circle.set({ strokeWidth: 8 / (obj.scaleX + obj.scaleY) })
          } else if (obj.type === 'path') {
            let strokeMultiplier = 1
            if (obj.canvasWidth) {
              strokeMultiplier = obj.canvasWidth / this.fabricCanvas.width
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
      if (this.fabricPicture) {
        const dimensions = this.getDimensions(this.fabricPicture)
        const width = dimensions.width
        const height = dimensions.height
        let elements = document.getElementsByClassName('canvas-container')
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i]
          element.style.width = width + 'px'
          element.style.height = height + 'px'
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
          if (this.fabricCanvas) this.fabricCanvas.calcOffset()
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
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
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
</style>
