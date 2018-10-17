<template>
<div ref="container" class="picture-player">
  <div ref="picture-wrapper" class="picture-wrapper">
    <canvas
      id="annotation-canvas"
      ref="annotation-canvas"
      class="canvas"
    >
    </canvas>
  </div>

  <div class="buttons flexrow pull-bottom">
    <div class="left flexrow">
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
        class="button flexrow-item"
        @click="onAnnotateClicked"
        v-if="isFullScreenEnabled"
      >
        <square-icon class="icon" />
      </button>

      <button
        class="button flexrow-item"
        @click="onCircleAnnotateClicked"
        v-if="isFullScreenEnabled"
      >
        <circle-icon class="icon" />
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
        target="_blank"
        class="button flexrow-item"
        :href="picturePath"
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
  CircleIcon,
  DownloadIcon,
  Edit2Icon,
  MaximizeIcon,
  SquareIcon,
  XIcon
} from 'vue-feather-icons'

export default {
  name: 'picture-viewer',

  components: {
    CircleIcon,
    DownloadIcon,
    Edit2Icon,
    MaximizeIcon,
    SquareIcon,
    XIcon
  },

  props: {
    preview: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      isDrawing: false,
      annotations:
        this.preview.annotations ? [...this.preview.annotations] : [],
      fabricCanvas: null
    }
  },

  mounted () {
    setTimeout(() => {
      this.mountPicture()

      window.removeEventListener('keydown', this.onKeyDown)
      window.addEventListener('keydown', this.onKeyDown)

      window.removeEventListener('resize', this.onWindowResize)
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
      return `/api/pictures/originals/preview-files/${this.preview.id}.png`
    },

    isFullScreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
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
    }
  },

  beforeDestroy () {
    this.clearCanvas()
  },

  methods: {
    mountPicture () {
      this.isResizing = true
      this.clearCanvas(() => {
        setTimeout(() => {
          if (this.container) {
            this.setupFabricPicture((fabricCanvas) => {
              this.fabricCanvas = fabricCanvas
              this.loadAnnotation(0)
              this.isResizing = false
            })
          }
        }, 0)
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
        try {
          if (this.fabricCanvas) {
            this.fabricCanvas.dispose()
          }
        } catch (err) {
          console.log(err)
        }
        this.fabricCanvas = null
        if (callback) callback()
      }, 10)
    },

    getDimensions (picture) {
      const ratio = picture.height / picture.width
      let width = this.container.offsetWidth - 1
      let height = width * ratio

      const maxHeight = screen.width > 1300 ? 500 : 300
      if (height > maxHeight) {
        height = maxHeight
        width = Math.round(height / ratio)
      }

      const isFullScreen = !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )

      if (isFullScreen) {
        width = screen.width - 1
        height = width * ratio

        if (height + 50 > screen.height) {
          height = screen.height - 50
          width = height / ratio
        }
      }

      return { width, height }
    },

    setupFabricPicture (callback) {
      fabric.Image.fromURL(this.picturePath, (fabricPicture) => {
        const dimensions = this.getDimensions(fabricPicture)
        const width = dimensions.width
        const height = dimensions.height
        const fabricCanvas = new fabric.Canvas('annotation-canvas')

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
        fabricPicture.scaleToWidth(width)
        fabricPicture.scaleToHeight(height)

        fabricCanvas.add(fabricPicture)
        fabricPicture.sendToBack()

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

    onFullscreenClicked () {
      const isFullScreen = !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )

      if (isFullScreen) {
        this.exitFullScreen()
      } else {
        this.setFullScreen()
      }
      setTimeout(() => {
        this.emitResizeEvent()
      }, 1)
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

    emitResizeEvent () {
      const evt = window.document.createEvent('UIEvents')
      evt.initUIEvent('resize', true, false, window, 0)
      window.dispatchEvent(evt)
    },

    onDeleteClicked () {
      this.deleteSelection()
    },

    onAnnotateClicked () {
      this.fabricCanvas.isDrawingMode = false
      this.isDrawing = false

      const rect = new fabric.Rect({
        left: this.fabricCanvas.width / 2 - 25,
        top: this.fabricCanvas.height / 2 - 25,
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
      setTimeout(() => {
        if (!this.isResizing) {
          this.mountPicture()
          this.reloadAnnotations()
        }
      }, 100)
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
      const annotation = this.getAnnotation(0)
      if (annotation) {
        annotation.drawing = this.fabricCanvas.toJSON()
        annotation.width = this.fabricCanvas.width
        if (annotation.drawing && annotation.drawing.objects.length === 1) {
          this.annotations.splice(0, 1)
        }
      } else {
        this.annotations.push({
          time: 0,
          width: this.fabricCanvas.width,
          drawing: this.fabricCanvas.toJSON()
        })
      }
      this.$emit('annotationchanged', {
        preview: this.preview,
        annotations: [...this.annotations]
      })
    },

    getAnnotation (time) {
      return [...this.annotations][time]
    },

    clearAnnotations () {
      this.fabricCanvas.getObjects().forEach((obj) => {
        if (['rect', 'circle', 'path'].includes(obj.type)) {
          this.fabricCanvas.remove(obj)
        }
      })
    },

    loadAnnotation (time) {
      const annotation = this.getAnnotation(time)
      this.clearAnnotations()

      let scaleMultiplier = 1
      if (annotation.width) {
        scaleMultiplier = this.fabricCanvas.width / annotation.width
      }

      annotation.drawing.objects.forEach((obj) => {
        const base = {
          left: obj.left * scaleMultiplier,
          top: obj.top * scaleMultiplier,
          fill: 'transparent',
          stroke: '#ff3860',
          strokeWidth: 4,
          radius: obj.radius,
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
          rect.set({strokeWidth: 4})
        } else if (obj.type === 'circle') {
          const circle = new fabric.Circle({
            ...base
          })
          this.fabricCanvas.add(circle)
          circle.set({strokeWidth: 2})
        } else if (obj.type === 'path') {
          const path = new fabric.Path(
            obj.path,
            {
              ...base
            }
          )
          this.fabricCanvas.add(path)
        }
      })
    },

    deleteSelection () {
      this.fabricCanvas.remove(this.fabricCanvas.getActiveObject())
      this.saveAnnotations()
    },

    reloadAnnotations () {
      if (this.preview.annotations) {
        this.annotations = [...this.preview.annotations].sort((a, b) => {
          return a.time < b.time
        }) || []
      } else {
        return []
      }
    }
  },

  watch: {
    preview () {
      this.reloadAnnotations()
      this.mountPicture()
    }
  }
}
</script>

<style scoped>
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

.picture-wrapper {
  flex: 1;
  display: flex;
  background: black;
}

.annotation-picture {
  margin: auto;
}

.pull-bottom {
}

.time-indicator {
  color: #CCC;
  padding-left: 0.8em;
}

#annotation-canvas {
  width: 100%;
  display: block;
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

.progress {
  padding: 0;
  margin: 0;
  height: 8px;
}

.picture-progress {
  cursor: pointer;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: #999;
  height: 8px;
}

progress::-moz-progress-bar {
  background-color: #43B581;
}

progress::-webkit-progress-value {
  background-color: #43B581;
}

progress {
  width: 100%;
  border-radius: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: #999;
  height: 8px;
  display: block;
}

.progress progress#progress span#progress-bar {
  border-radius: 0;
  margin: 0;
  padding: 0;
  background-color: #43B581;
}

.picture-annotation {
  background: #26292F;
  height: 12px;
  text-align: left;
  margin-top: 0px;
  padding: 0;
}

.annotation-mark {
  display: flex;
  background: #ff3860;
  width: 8px;
  height: 8px;
  display: inline-block;
  top: -6px;
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
