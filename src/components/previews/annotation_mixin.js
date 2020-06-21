import { mapGetters } from 'vuex'
import { fabric } from 'fabric'

export const annotationMixin = {

  data () {
    return {
      isShowingPalette: false,
      isShowingPencilPalette: false
    }
  },

  created () {
    this.resetUndoStacks()
  },

  mounted () {
  },

  beforeDestroy () {
  },

  computed: {
    ...mapGetters([
    ]),

    annotationCanvas () {
      return this.$refs['annotation-canvas']
    }
  },

  methods: {
    resetUndoStacks () {
      this.$options.doneActionStack = []
      this.$options.undoneActionStack = []
    },

    getNewAnnotations (currentTime, annotation) {
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
        annotation.time = currentTime
        if (annotation.drawing && annotation.drawing.objects.length < 1) {
          const index = this.annotations.findIndex(
            (annotation) => annotation.time === currentTime
          )
          this.annotations.splice(index, 1)
        }
      } else {
        this.annotations.push({
          time: currentTime,
          width: this.fabricCanvas.width,
          height: this.fabricCanvas.height,
          drawing: this.fabricCanvas.toJSON(['canvasWidth'])
        })
        this.annotations = this.annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      }
      const annotations = []
      this.annotations.forEach(a => annotations.push({ ...a }))
      return annotations
    },

    onPickPencil () {
      this.isShowingPencilPalette = !this.isShowingPencilPalette
    },

    onPickColor () {
      this.isShowingPalette = !this.isShowingPalette
    },

    onChangeColor (color) {
      this.color = color
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.isShowingPalette = false
    },

    onChangeTextColor (color) {
      this.textColor = color
      this.isShowingPalette = false
    },

    onChangePencil (pencil) {
      this.pencil = pencil
      const converter = {
        big: 4,
        medium: 2,
        small: 1
      }
      const strokeWidth = converter[pencil]
      this.fabricCanvas.freeDrawingBrush.width = strokeWidth
      this.isShowingPalette = false
    },

    stackAddAction ({ target }) {
      this.$options.doneActionStack.push({ type: 'add', obj: target })
      target.lockScalingX = true
      target.lockScalingY = true
      target.rotation = true
      if (!['text', 'i-text'].includes(target.type)) {
        target.lockMovementX = true
        target.lockMovementY = true
      }
    },

    undoLastAction () {
      const action = this.$options.doneActionStack.pop()
      if (action) {
        if (action.type === 'add') {
          this.deleteObject(action.obj)
        } else if (action.type === 'remove') {
          this.addObject(action.obj)
        }
        this.$options.doneActionStack.pop()
        this.$options.undoneActionStack.push(action)
      }
    },

    redoLastAction () {
      const action = this.$options.undoneActionStack.pop()
      if (action) {
        if (action.type === 'add') {
          this.addObject(action.obj)
        } else if (action.type === 'remove') {
          this.deleteObject(action.obj)
        }
      }
    },

    deleteSelection () {
      const activeObject = this.fabricCanvas.getActiveObject()
      this.deleteObject(activeObject)
    },

    deleteObject (activeObject) {
      if (activeObject && activeObject._objects) {
        activeObject._objects.forEach((obj) => {
          this.fabricCanvas.remove(obj)
        })
      } else {
        this.fabricCanvas.remove(activeObject)
      }
      this.$options.doneActionStack.push({
        type: 'remove', obj: activeObject
      })
      this.saveAnnotations()
    },

    addObject (activeObject) {
      if (activeObject._objects) {
        activeObject._objects.forEach((obj) => {
          this.fabricCanvas.add(obj)
          this.$options.doneActionStack.pop()
        })
      } else {
        this.fabricCanvas.add(activeObject)
      }
      this.$options.doneActionStack.push({ type: 'add', obj: activeObject })
      this.saveAnnotations()
    },

    addText () {
      const canvas = this.canvas || this.canvasWrapper
      const offsetCanvas = canvas.getBoundingClientRect()
      const posX = event.clientX - offsetCanvas.x
      const posY = event.clientY - offsetCanvas.y
      const baseHeight = 320
      let fontSize = 12
      if (this.fabricCanvas.getHeight() > baseHeight) {
        fontSize = fontSize * (this.fabricCanvas.getHeight() / baseHeight)
      }
      const fabricText = new fabric.IText('Type...', {
        left: posX,
        top: posY,
        fontFamily: 'arial',
        fill: this.textColor,
        fontSize: fontSize
      })
      this.fabricCanvas.add(fabricText)
      this.fabricCanvas.setActiveObject(fabricText)
      fabricText.enterEditing()
      fabricText.selectAll()
      fabricText.hiddenTextarea.onblur = () => {
        this.saveAnnotations()
      }
    },

    clearUndoneStack () {
      this.$options.undoneActionStack = []
    },

    setupFabricCanvas () {
      if (this.readOnly) return
      if (!this.annotationCanvas) return

      const canvasId = this.annotationCanvas.id
      this.fabricCanvas = new fabric.Canvas(canvasId)
      this.fabricCanvas.on('object:moved', this.saveAnnotations)
      this.fabricCanvas.on('object:scaled', this.saveAnnotations)
      this.fabricCanvas.on('object:added', this.stackAddAction)
      this.fabricCanvas.on('mouse:up', () => {
        if (this.isDrawing) {
          this.clearUndoneStack()
          this.saveAnnotations()
        }
      })
      this.fabricCanvas.setDimensions({
        width: 100,
        height: 100
      })
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.fabricCanvas.freeDrawingBrush.width = 4
      return this.fabricCanvas
    }
  }
}
