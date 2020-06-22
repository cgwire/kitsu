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
    <div v-show="!isLoading" ref="picture-subwrapper">
      <div v-show="isGif">
        <img ref="picture-gif" :src="pictureGifPath" />
      </div>
      <div v-show="!isGif">
        <img id="picture-big" ref="picture-big" :src="pictureDlPath" v-show="fullScreen" />
        <img id="picture" ref="picture" :src="picturePath" v-show="!fullScreen" />
      </div>
    </div>
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
        v-if="!readOnly && preview.extension !== 'gif'"
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
      pencilPalette: ['big', 'medium', 'small'],
      picturePath: '',
      pictureDlPath: '',
      pictureGifPath: ''
    }
  },

  mounted () {
    this.container.style.height = this.getDefaultHeight() + 'px'
    this.isLoading = true
    if (this.picture.complete) {
      this.isLoading = false
      this.onWindowResize()
    }
    this.picture.addEventListener('load', () => {
      this.isLoading = false
      this.resetPicture()
    })
    this.pictureBig.addEventListener('load', () => {
      this.isLoading = false
      this.resetPicture()
    })
    this.pictureGif.addEventListener('load', () => {
      this.isLoading = false
      this.resetPicture()
    })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('resize', this.onWindowResize)
    const events = [
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'fullscreenchange',
      'msfullscreenchange'
    ]
    events.forEach(eventName => window.addEventListener(eventName, this.exitHandler))
    this.setPicturePath()
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

    pictureOriginalPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      return `/api/pictures/originals/preview-files/${previewId}.png`
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
      this.pictureWrapper.style.height = this.getDefaultHeight() - 32 + 'px'
      this.pictureSubWrapper.style['max-height'] = this.getDefaultHeight() - 32 + 'px'
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
      if (this.fullScreen) {
        return screen.height
      } else {
        return screen.width > 1300 && (!this.light || this.readOnly) ? 500 : 200
      }
    },

    getDimensions () {
      let ratio = 1
      if (!this.fullScreen && this.picture.naturalWidth && !this.isGif) {
        ratio = this.picture.naturalHeight / this.picture.naturalWidth
      } else if (
        this.fullScreen && this.pictureBig.naturalWidth && !this.isGif
      ) {
        ratio = this.pictureBig.naturalHeight / this.pictureBig.naturalWidth
      } else if (this.pictureGif.naturalWidth && this.isGif) {
        ratio = this.pictureGif.naturalHeight / this.pictureGif.naturalWidth
      }
      let width = this.container.offsetWidth - 1
      let height = Math.floor(width * ratio)
      if (height > this.getDefaultHeight() - 32) {
        height = this.getDefaultHeight() - 32
      }
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

    resetPicture () {
      this.mountPicture()
      this.reloadAnnotations()
      this.resetUndoStacks()
      this.fixCanvasSize()
    },

    onWindowResize () {
      const now = (new Date().getTime())
      this.lastCall = this.lastCall || 0
      if (now - this.lastCall > 600) {
        this.lastCall = now
        this.clearCanvas()
        this.$nextTick(() => {
          this.mountPicture()
          this.reloadAnnotations()
          this.$nextTick(this.fixCanvasSize)
        })
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

      console.log(annotation.drawing)
      this.fabricCanvas.getObjects().forEach((obj) => {
        if (obj.type === 'path' || obj.type === 'text') {
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
      annotation.drawing.objects = this.removeDuplicatedTexts(annotation.drawing)
      this.annotations = []
      this.annotations.push(annotation)

      this.$emit('annotation-changed', {
        preview: this.currentPreview,
        annotations: [...this.annotations]
      })
    },

    removeDuplicatedTexts (drawing) {
      const map = {}
      return drawing.objects.filter((obj) => {
        if (['text', 'i-text'].includes(obj.type)) {
          const key = obj.left + '-' + obj.top + '-' + obj.text
          if (!map[key]) {
            map[key] = true
            return true
          } else {
            return false
          }
        }
      })
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

    getAnnotation (time) {
      return [...this.annotations][time]
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
      }
    },

    displayLast () {
      this.currentIndex = this.preview.previews.length
    },

    reset () {
      this.mountPicture()
      this.clearAnnotations()
      this.annotations = []
      this.reloadAnnotations()
      this.isDrawing = false
      if (this.fabricCanvas) this.fabricCanvas.isDrawingMode = false
    },

    fixCanvasSize () {
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

      if (this.fabricCanvas) {
        this.fabricCanvas.setDimensions({ width, height })
        const containerWidth = this.container.offsetWidth
        const margin = Math.round((containerWidth - width) / 2)
        this.canvasWrapper.style.left = margin + 'px'
        this.canvasWrapper.style.width = width + 'px'
        this.canvasWrapper.style.height = height + 'px'
        setTimeout(() => {
          this.fabricCanvas.calcOffset()
        }, 10)
      }
    },

    changeCurrentPreview (previewFile) {
      this.$emit('change-current-preview', previewFile)
    },

    setPicturePath () {
      if (this.isGif) {
        const previewId = this.preview.previews[this.currentIndex - 1].id
        this.pictureGifPath = `/api/pictures/originals/preview-files/${previewId}.gif`
      } else {
        const previewId = this.preview.previews[this.currentIndex - 1].id
        this.picturePath = `/api/pictures/previews/preview-files/${previewId}.png`
      }
    },

    setPictureDlPath () {
      const previewId = this.preview.previews[this.currentIndex - 1].id
      this.pictureDlPath = `/api/pictures/originals/preview-files/${previewId}/download`
    }
  },

  watch: {
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
          this.resetPicture()
          this.isLoading = false
        }
      }
    },

    currentIndex () {
      this.isLoading = true
      if (this.fullScreen) {
        this.setPictureDlPath()
        if (this.pictureBig.complete) {
          this.resetPicture()
        }
      } else {
        this.setPicturePath()
        if (this.picture.complete) {
          this.resetPicture()
        }
      }
    },

    light () {
      this.onWindowResize()
    },

    fullScreen () {
      if (this.fullScreen) {
        this.isLoading = true
        this.setPictureDlPath()
        if (this.pictureBig.complete) this.isLoading = false
      } else {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
        this.setPicturePath()
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
