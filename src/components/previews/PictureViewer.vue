<template>
<div ref="container" class="picture-player">
  <div ref="picture-wrapper" class="picture-wrapper">
    <div ref="canvas-wrapper" class="canvas-wrapper">
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
    <img ref="picture" :src="pictureGifPath" v-if="isGif" />
    <img ref="picture" :src="pictureDlPath" v-else-if="isFullScreen()" />
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
        v-if="preview.extension !== 'gif'"
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
      <div class="flexrow flexrow-item" v-if="fullScreen">
        <span
          :class="{
            'previous-preview-file': true,
            'current-preview-file': previewFile.revision === preview.revision
          }"
          :key="`last-preview-${previewFile.id}`"
          @click="changeCurrentPreview(previewFile)"
          v-for="previewFile in lastPreviewFiles"
        >
          {{ previewFile.revision }}
        </span>
      </div>

      <button-simple
        class="playlist-button flexrow-item"
        icon="undo"
        @click="undoLastAction"
        v-if="fullScreen && !readOnly"
      />

      <button-simple
        class="playlist-button flexrow-item"
        icon="redo"
        @click="redoLastAction"
        v-if="fullScreen && !readOnly"
      />

      <button
        class="button flexrow-item"
        @click="onDeleteClicked"
        v-if="fullScreen && !readOnly"
      >
        <x-icon class="icon" />
      </button>

      <transition name="slide">
        <div
          class="annotation-tools"
          v-show="isTyping"
        >
          <color-picker
            :isOpen="isShowingPalette"
            :color="this.textColor"
            :palette="this.palette"
            @TogglePalette="onPickColor"
            @change="onChangeTextColor"
          />
        </div>
      </transition>
      <button
        :class="{
          button: true,
          'flexrow-item': true,
          active: isTyping
        }"
        :title="$t('playlists.actions.annotation_text')"
        @click="onTypeClicked"
        v-if="!readOnly && fullScreen"
      >
        <type-icon class="icon" />
      </button>

      <transition name="slide">
        <div
          class="annotation-tools"
          v-show="isDrawing"
        >
          <pencil-picker
            :isOpen="isShowingPencilPalette"
            :pencil="pencil"
            :sizes="this.pencilPalette"
            @toggle-palette="onPickPencil"
            @change="onChangePencil"
          />

          <color-picker
            :isOpen="isShowingPalette"
            :color="this.color"
            :palette="this.palette"
            @TogglePalette="onPickColor"
            @change="onChangeColor"
          />
        </div>
      </transition>

      <button
        :class="{
          button: true,
          'flexrow-item': true,
          active: isDrawing
        }"
        @click="onPencilAnnotateClicked"
        v-if="fullScreen && !readOnly"
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
        :href="pictureOriginalPath"
        target="blank"
        v-if="!readOnly"
      >
        <arrow-up-right-icon class="icon" />
      </a>
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
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  PlusIcon,
  TrashIcon,
  TypeIcon,
  XIcon
} from 'vue-feather-icons'
import { fullScreenMixin } from '../mixins/fullscreen'
import { annotationMixin } from '../previews/annotation_mixin'
import ButtonSimple from '../widgets/ButtonSimple'
import ColorPicker from '../widgets/ColorPicker'
import PencilPicker from '../widgets/PencilPicker'
import Spinner from '../widgets/Spinner'

export default {
  name: 'picture-viewer',

  components: {
    ArrowUpRightIcon,
    ButtonSimple,
    ChevronLeftIcon,
    ChevronRightIcon,
    ColorPicker,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    PencilPicker,
    PlusIcon,
    Spinner,
    TrashIcon,
    TypeIcon,
    XIcon
  },
  mixins: [annotationMixin, fullScreenMixin],

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
    },
    lastPreviewFiles: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      annotations:
        this.preview.annotations ? [...this.preview.annotations] : [],
      currentIndex: 1,
      color: '#ff3860',
      textColor: '#ff3860',
      fabricCanvas: null,
      fullScreen: false,
      isLoading: true,
      isDrawing: false,
      isTyping: false,
      isShowingPalette: false,
      palette: ['#ff3860', '#008732', '#5E60BA', '#f57f17'],
      pencil: 'big',
      pencilPalette: ['big', 'medium', 'small']
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
          this.onWindowResize()
        })
      }
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('resize', this.onWindowResize)
      const events = [
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'fullscreenchange',
        'msfullscreenchange'
      ]
      events.forEach(eventName => window.addEventListener(eventName, this.exitHandler))
    }, 0)
  },

  computed: {
    container () {
      return this.$refs.container
    },

    canvasWrapper () {
      return this.$refs['canvas-wrapper']
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

    pictureOriginalPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/originals/preview-files/${previewId}.png`
    },

    pictureDlPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/originals/preview-files/${previewId}/download`
    },

    pictureGifPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/originals/preview-files/${previewId}.gif`
    },

    currentPreview () {
      return this.preview.previews[this.currentIndex - 1]
    },

    isGif () {
      return this.preview.extension === 'gif'
    }
  },

  beforeDestroy () {
    this.clearCanvas()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('resize', this.onWindowResize)
  },

  methods: {
    exitHandler () {
      if (!this.isFullScreen() && this.fullScreen) this.fullScreen = false
    },

    isWide () {
      const dimensions = this.getDimensions()
      return dimensions.width > 800
    },

    mountPicture () {
      this.container.style.height = this.getDefaultHeight() + 'px'
      if (!this.fabricCanvas) {
        this.setupFabricCanvas()
      }
      this.loadAnnotation(0)
      this.$nextTick(this.fixCanvasSize)
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

        fabricCanvas.freeDrawingBrush.color = this.color
        fabricCanvas.freeDrawingBrush.width = 4

        fabricCanvas.off('object:added', this.stackAddAction)
        fabricCanvas.on('object:added', this.stackAddAction)
        fabricCanvas.off('object:moved', this.saveAnnotations)
        fabricCanvas.on('object:moved', this.saveAnnotations)
        fabricCanvas.on('mouse:up', () => {
          if (this.isDrawing) {
            this.clearUndoneStack()
            this.saveAnnotations()
          }
        })

        this.fabricCanvas = fabricCanvas
      }
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

    onAddPreviewClicked () {
      this.$emit('add-preview')
    },

    onRemovePreviewClicked () {
      this.$emit('remove-extra-preview', this.currentPreview)
    },

    onFullscreenClicked () {
      /** @lends fabric.IText.prototype */
      // fix for : IText not editable when canvas is in a fullscreen
      // element on chrome
      // https://github.com/fabricjs/fabric.js/issues/5126
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      if (this.isFullScreen()) {
        fabric.util.object.extend(fabric.IText.prototype, {
          initHiddenTextarea: function () {
            originalInitHiddenTextarea.call(this)
            fabric.document.body.appendChild(this.hiddenTextarea)
          }
        })
        this.exitFullScreen()
      } else {
        fabric.util.object.extend(fabric.IText.prototype, {
          initHiddenTextarea: function () {
            originalInitHiddenTextarea.call(this)
            this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
          }
        })
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
      this.fullScreen = false
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
      this.fullScreen = true
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    onPickColor () {
      if (this.isShowingPalette) {
        this.isShowingPalette = false
      } else {
        this.isShowingPalette = true
      }
    },

    onChangeColor (newValue) {
      this.color = newValue
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.isShowingPalette = false
    },

    onPencilAnnotateClicked () {
      if (this.fabricCanvas.isDrawingMode) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        this.fabricCanvas.isDrawingMode = true
        this.isDrawing = true
      }
    },

    onTypeClicked () {
      const clickarea =
        this.canvasWrapper.getElementsByClassName('upper-canvas')[0]
      if (this.isTyping) {
        this.isTyping = false
        clickarea.removeEventListener('dblclick', this.addText)
      } else {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        this.isTyping = true
        clickarea.addEventListener('dblclick', this.addText)
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
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.keyCode === 46 && this.fabricCanvas) {
          this.deleteSelection()
        } else if (event.ctrlKey && event.altKey && event.keyCode === 68) {
          this.onAnnotateClicked()
        } else if (event.ctrlKey && event.keyCode === 90) {
          this.undoLastAction()
        } else if (event.altKey && event.keyCode === 82) {
          this.redoLastAction()
        }
      }
    },

    saveAnnotations () {
      // Annotation are aimed to be used mainly by videos. That's why
      // annotations are stored in a list.
      let annotation = { ...this.getAnnotation(0) }

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
          obj.hasControls = false
        }
      })

      if (annotation) {
        annotation.drawing = this.fabricCanvas.toJSON(['canvasWidth'])
        annotation.width = this.fabricCanvas.width
        annotation.height = this.fabricCanvas.height
      } else {
        annotation = {
          time: 0,
          width: this.fabricCanvas.width,
          height: this.fabricCanvas.height,
          drawing: this.fabricCanvas.toJSON(['canvasWidth'])
        }
      }
      this.annotations = []
      this.annotations.push(annotation)

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
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            radius: obj.radius * scaleMultiplierX,
            width: obj.width,
            height: obj.height,
            scaleX: obj.scaleX * scaleMultiplierX,
            scaleY: obj.scaleY * scaleMultiplierY
          }
          if (obj.type === 'path') {
            let strokeMultiplier = 1
            if (obj.canvasWidth) {
              strokeMultiplier = annotation.width / dimensions.width
            }
            const path = new fabric.Path(
              obj.path,
              {
                ...base,
                strokeWidth: obj.strokeWidth * strokeMultiplier,
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
            this.$options.doneActionStack.pop()
          } else if ((obj.type === 'i-text') || (obj.type === 'text')) {
            const text = new fabric.Text(
              obj.text,
              {
                ...base,
                fill: obj.fill,
                left: obj.left * scaleMultiplierX,
                top: obj.top * scaleMultiplierY,
                fontFamily: obj.fontFamily,
                fontSize: obj.fontSize
              }
            )
            text.setControlsVisibility({
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
            this.fabricCanvas.add(text)
          }
        })
      }
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
        const containerWidth = this.container.offsetWidth
        const margin = Math.round((containerWidth - width) / 2)
        this.$refs['canvas-wrapper'].style.left = margin + 'px'
        setTimeout(() => {
          this.fabricCanvas.calcOffset()
        }, 10)
      }
    },

    changeCurrentPreview (previewFile) {
      this.$emit('change-current-preview', previewFile)
    }
  },

  watch: {
    preview () {
      if (this.currentIndex > 1) {
        this.currentIndex = 1
      } else {
        this.reset()
      }
      this.resetUndoStacks()
    },

    currentIndex () {
      this.reset()
      this.resetUndoStacks()
      this.onWindowResize()
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

.annotation-tools {
  align-items: stretch;
  display: flex;
  height: 32px;
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
  background: $purple-strong;
  transition: 0.3s background ease;
  color: white;
}
</style>
