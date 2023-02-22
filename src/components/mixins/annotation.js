/*
 * Set of helpers to deal with annotation canvas. It's aimed at preview
 * widgets.
 */
import { mapGetters } from 'vuex'
import { fabric } from 'fabric'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

import clipboard from '@/lib/clipboard'
import { formatFullDate } from '@/lib/time'

/* Monkey patch needed to have text background including the padding. */
if (fabric) {
  fabric.Text.prototype.set({
    _getNonTransformedDimensions () { // Object dimensions
      return new fabric.Point(this.width, this.height).scalarAdd(this.padding)
    },
    _calculateCurrentDimensions () { // Controls dimensions
      return fabric.util.transformPoint(
        this._getTransformedDimensions(), this.getViewportTransform(), true
      )
    }
  })
}

export const annotationMixin = {

  data () {
    return {
      lastAnnotationTime: '',
      additions: [],
      deletions: [],
      updates: [],
      objIndex: new Map(),
      isShowingPalette: false,
      isShowingPencilPalette: false,
      notSave: false
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
    // Objects
    getObjectById (objectId) {
      return this.fabricCanvas.getObjects().find(obj => obj.id === objectId)
    },

    setObjectData (object) {
      if (!object.id) object.id = uuidv4()
      object.canvasWidth = this.fabricCanvas.width
      object.canvasHeight = this.fabricCanvas.height
      object.serialize =
        () => object.toJSON(
          ['id', 'canvasWidth', 'canvasHeight', 'angle', 'scale'])
      return object
    },

    addObject (activeObject, persist = true) {
      if (activeObject._objects) {
        activeObject._objects.forEach((obj) => {
          this.fabricCanvas.add(obj)
          this.$options.doneActionStack.pop()
        })
      } else {
        this.fabricCanvas.add(activeObject)
      }
      if (persist) {
        this.$options.doneActionStack.push({ type: 'add', obj: activeObject })
        this.saveAnnotations()
      }
    },

    addText () {
      if (this.fabricCanvas.getActiveObject()) return
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
        fontSize: fontSize,
        backgroundColor: 'rgba(255,255,255, 0.8)',
        padding: 10
      })

      this.fabricCanvas.add(fabricText)
      this.fabricCanvas.setActiveObject(fabricText)
      fabricText.enterEditing()
      fabricText.selectAll()
      fabricText.hiddenTextarea.onblur = () => {
        this.saveAnnotations()
      }
    },

    addTypeArea () {
      /** @lends fabric.IText.prototype */
      // fix for : IText not editable when canvas is in a fullscreen
      // element on chrome
      // https://github.com/fabricjs/fabric.js/issues/5126
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      fabric.util.object.extend(fabric.IText.prototype, {
        initHiddenTextarea: function () {
          originalInitHiddenTextarea.call(this)
          this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
        }
      })
    },

    removeTypeArea () {
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      fabric.util.object.extend(fabric.IText.prototype, {
        initHiddenTextarea: function () {
          originalInitHiddenTextarea.call(this)
          fabric.document.body.appendChild(this.hiddenTextarea)
        }
      })
    },

    deleteSelection () {
      const activeObject = this.fabricCanvas.getActiveObject()
      this.deleteObject(activeObject)
    },

    deleteObject (activeObject) {
      if (activeObject && activeObject._objects) {
        activeObject._objects.forEach(obj => {
          this.fabricCanvas.remove(obj)
          this.addToDeletions(obj)
          this.$options.doneActionStack.push({
            type: 'remove', obj
          })
        })
      } else if (activeObject) {
        this.fabricCanvas.remove(activeObject)
        this.addToDeletions(activeObject)
        this.$options.doneActionStack.push({
          type: 'remove', obj: activeObject
        })
      }
      this.saveAnnotations()
    },

    removeObjectFromCanvas (deletedObject) {
      const obj = this.getObjectById(deletedObject.id)
      if (obj) {
        if (obj._objects) {
          obj._objects.forEach(this.fabricCanvas.remove)
          this.fabricCanvas.remove(obj)
        } else {
          this.fabricCanvas.remove(obj)
        }
      }
      this.objIndex.delete(deletedObject.id)
    },

    updateObjectInCanvas (annotation, updatedObject) {
      const obj = this.getObjectById(updatedObject.id)
      if (obj) {
        this.removeObjectFromCanvas(obj)
        this.objIndex.set(updatedObject.id, updatedObject)
        this.addObjectToCanvas(annotation, updatedObject)
      }
    },

    addToAdditions (obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const additions = this.additions.find(a => a.time === currentTime)
      if (additions) {
        additions.drawing.objects.push(obj.serialize())
      } else {
        this.additions.push({
          time: currentTime,
          drawing: { objects: [obj.serialize()] }
        })
      }
      this.postAnnotationAddition(currentTime, obj.serialize())
    },

    postAnnotationAddition (currentTime, obj) {
      // Aimed at being supercharged
    },

    removeFromAdditions (obj) {
      const currentTime = this.getCurrentTime()
      const additions = this.additions.find(a => a.time === currentTime)
      if (additions) {
        additions.drawing.objects = additions.drawing.objects.filter(
          o => o.id !== obj.id
        )
      }
    },

    addToDeletions (obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const deletion = this.deletions.find(d => d.time === currentTime)
      if (deletion) {
        deletion.objects.push(obj.id)
      } else {
        this.deletions.push({
          time: currentTime,
          objects: [obj.id]
        })
      }
      this.postAnnotationDeletion(
        currentTime,
        obj.toJSON(['id', 'canvasWidth', 'canvasHeight', 'angle', 'scale'])
      )
    },

    postAnnotationDeletion (currentTime, obj) {
      // Aimed at being supercharged
    },

    removeFromDeletions (obj) {
      const currentTime = this.getCurrentTime()
      const deletions = this.deletions.find(a => a.time === currentTime)
      if (deletions) {
        deletions.objects = deletions.objects.filter(
          oId => oId !== obj.id
        )
      }
    },

    addToUpdates (obj) {
      this.setObjectData(obj)
      this.addToUpdatesSerializedObject(obj.serialize())
    },

    addToUpdatesSerializedObject (obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const updates = this.updates.find(a => a.time === currentTime)
      if (updates) {
        updates.drawing.objects = updates.drawing.objects.filter(
          o => o.id !== obj.id
        )
        updates.drawing.objects.push(obj)
      } else {
        this.updates.push({
          time: currentTime,
          drawing: { objects: [obj] }
        })
      }
      this.postAnnotationUpdate(currentTime, obj)
    },

    postAnnotationUpdate (currentTime, obj) {
      // Aimed at being supercharged
    },

    clearModifications () {
      this.additions = []
      this.updates = []
      this.deletions = []
    },

    printModificationStats (prefix) {
      console.log(
        prefix,
        this.additions.length > 0
          ? this.additions[0].drawing.objects.length
          : 0,
        this.updates.length > 0 ? this.updates[0].drawing.objects.length : 0,
        this.deletions.length > 0 ? this.deletions[0].objects.length : 0
      )
    },

    isWriting (date) {
      return this.lastAnnotationTime >= date
    },

    // Annotations

    getNewAnnotations (currentTime, annotation) {
      this.fabricCanvas.getObjects().forEach(obj => {
        this.setObjectData(obj)
        if (obj.type === 'path') {
          if (!obj.canvasWidth) obj.canvasWidth = this.fabricCanvas.width
          if (!obj.canvasHeight) obj.canvasHeight = this.fabricCanvas.height
          obj.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: true,
            tl: false,
            tr: false,
            mtr: true
          })
        }
      })

      if (annotation) {
        annotation.drawing = this.fabricCanvas.toJSON(
          ['id', 'canvasWidth', 'canvasHeight']
        )
        annotation.time = currentTime
        if (annotation.drawing && annotation.drawing.objects.length < 1) {
          const index = this.annotations.findIndex(
            (annotation) => annotation.time === currentTime
          )
          this.annotations.splice(index, 1)
        }
      } else {
        if (!this.annotations || !this.annotations.push) this.annotations = []
        this.annotations.push({
          time: currentTime,
          drawing: this.fabricCanvas.toJSON(
            ['id', 'canvasHeight', 'canvasWidth']
          )
        })
        this.annotations = this.annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      }
      const annotations = []
      this.annotations.forEach(a => annotations.push({ ...a }))
      return annotations
    },

    loadSingleAnnotation (annotation) {
      annotation.drawing.objects.forEach(obj => {
        this.addObjectToCanvas(annotation, obj)
      })
    },

    addObjectToCanvas (
      annotation,
      obj
    ) {
      if (!obj) return
      if (this.getObjectById(obj.id)) return
      let path, text
      this.objIndex.set(obj.id, obj)
      let scaleMultiplierX = 1
      let scaleMultiplierY = 1
      if (annotation && annotation.width) {
        scaleMultiplierX = this.fabricCanvas.width / annotation.width
        scaleMultiplierY = this.fabricCanvas.width / annotation.width
      }
      if (annotation && annotation.height) {
        scaleMultiplierY = this.fabricCanvas.height / annotation.height
      }
      const canvasWidth = obj.canvasWidth || annotation.width
      const canvasHeight = obj.canvasHeight

      if (canvasWidth) {
        scaleMultiplierX = this.fabricCanvas.width / canvasWidth
        scaleMultiplierY = this.fabricCanvas.width / canvasWidth
      }
      if (canvasHeight) {
        scaleMultiplierY = this.fabricCanvas.height / canvasHeight
      }

      const base = {
        id: obj.id,
        left: obj.left * scaleMultiplierX,
        top: obj.top * scaleMultiplierY,
        fill: 'transparent',
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        radius: obj.radius,
        width: obj.width,
        height: obj.height,
        scaleX: obj.scaleX * scaleMultiplierX,
        scaleY: obj.scaleY * scaleMultiplierY,
        angle: obj.angle,
        scale: obj.scale,
        editable: !this.isCurrentUserArtist,
        selectable: !this.isCurrentUserArtist
      }
      if (obj.type === 'path') {
        let strokeMultiplier = 1
        if (obj.canvasWidth) {
          strokeMultiplier = canvasWidth / this.fabricCanvas.width
        }
        if (this.fabricCanvas.width < 420) strokeMultiplier /= 2
        path = new fabric.Path(
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
          br: !this.isCurrentUserArtist,
          tl: false,
          tr: false,
          mtr: !this.isCurrentUserArtist
        })
        this.$options.silentAnnnotation = true
        this.fabricCanvas.add(path)
        this.$options.silentAnnnotation = false
      } else if ((obj.type === 'i-text') || (obj.type === 'text')) {
        text = new fabric.IText(
          obj.text,
          {
            ...base,
            fill: obj.fill,
            left: obj.left * scaleMultiplierX,
            top: obj.top * scaleMultiplierY,
            fontFamily: obj.fontFamily,
            fontSize: obj.fontSize,
            backgroundColor: 'rgba(255,255,255, 0.8)',
            padding: 10
          }
        )
        text.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: !this.isCurrentUserArtist,
          tl: false,
          tr: false,
          mtr: !this.isCurrentUserArtist
        })
        this.$options.silentAnnnotation = true
        this.fabricCanvas.add(text)
        this.$options.silentAnnnotation = false
      }
      return path || text
    },

    // Events

    onPickPencil () {
      this.isShowingPencilPalette = !this.isShowingPencilPalette
    },

    onPickColor () {
      this.isShowingPalette = !this.isShowingPalette
    },

    onChangeColor (color) {
      this.color = color
      this._resetColor()
      this.isShowingPalette = false
    },

    onChangeTextColor (color) {
      this.textColor = color
      this.isShowingPalette = false
    },

    onChangePencil (pencil) {
      this.pencil = pencil
      this._resetPencil()
      this.isShowingPalette = false
    },

    _resetColor () {
      this.fabricCanvas.freeDrawingBrush.color = this.color
    },

    _resetPencil () {
      const converter = {
        big: 4,
        medium: 2,
        small: 1
      }
      const strokeWidth = converter[this.pencil]
      this.fabricCanvas.freeDrawingBrush.width = strokeWidth
    },

    onAnnotateClicked () {
      this.showCanvas()
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        if (this.fabricCanvas) {
          this.fabricCanvas.isDrawingMode = true
        }
        this.fabricCanvas.freeDrawingBrush =
          new fabric.PencilBrush(this.fabricCanvas)
        this._resetColor()
        this._resetPencil()
        this.isDrawing = true
      }
    },

    onEraseClicked () {
      this.showCanvas()
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        if (this.fabricCanvas) {
          this.fabricCanvas.isDrawingMode = true
        }
        this.isDrawing = true
        this.previousStrokeWidth = this.fabricCanvas.freeDrawingBrush.width
        this.fabricCanvas.freeDrawingBrush =
          new fabric.EraserBrush(this.fabricCanvas)
        this.fabricCanvas.freeDrawingBrush.width = 10
      }
    },

    onTypeClicked () {
      const clickarea = this.canvas.getElementsByClassName('upper-canvas')[0]
      this.showCanvas()
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

    onWindowsClosed (event) {
      if (this.notSaved) {
        const confirmationMessage = 'Your annotations are not saved yet.'
        event.returnValue = confirmationMessage
        return confirmationMessage
      }
    },

    onObjectAdded (obj) {
      if (this.$options.silentAnnnotation) return
      let o = obj
      if (obj.target) o = obj.target
      else o = obj.targets[0]
      o = this.setObjectData(o)
      // if (this.fabricCanvas.width < 420) o.strokeWidth *= 2
      if (this.isLaserModeOn) {
        const currentTime = this.getCurrentTime()
        this.fadeObject(o)
        this.postAnnotationAddition(currentTime, o.serialize())
      } else {
        this.addToAdditions(o)
        this.stackAddAction(obj)
      }
    },

    onObjectMoved (obj) {
      if (!obj.target._objects) {
        this.addToUpdates(obj.target)
        this.saveAnnotations()
      } else {
        obj.target._objects.forEach(o => {
          const oo = this.getObjectById(o.id)
          this.setObjectData(oo)
          const targetObj = oo.serialize()
          targetObj.left =
            obj.target.left + Math.round(obj.target.width / 2) + o.left
          targetObj.top =
            obj.target.top + Math.round(obj.target.height / 2) + o.top
          this.setObjectData(targetObj)
          this.addToUpdatesSerializedObject(targetObj)
        })
        this.saveAnnotations()
      }
    },

    fadeObject (obj) {
      if (!obj) return
      obj.animate('opacity', '0', {
        duration: 1500,
        onChange: this.fabricCanvas.renderAll.bind(this.fabricCanvas),
        onComplete: () => {
          this.fabricCanvas.remove(obj)
        }
      })
    },

    // Undo / Redo

    resetUndoStacks () {
      this.$options.doneActionStack = []
      this.$options.undoneActionStack = []
    },

    stackAddAction ({ target }) {
      this.$options.doneActionStack.push({ type: 'add', obj: target })
      target.lockScalingX = true
      target.lockScalingY = true
      target.rotation = true
    },

    undoLastAction () {
      const action = this.$options.doneActionStack.pop()
      if (action && action.obj) {
        if (action.type === 'add') {
          this.deleteObject(action.obj)
          this.addToDeletions(action.obj)
          this.removeFromAdditions(action.obj)
        } else if (action.type === 'remove') {
          this.addObject(action.obj)
          this.addToAdditions(action.obj)
          this.removeFromDeletions(action.obj)
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

    clearUndoneStack () {
      this.$options.undoneActionStack = []
    },

    // Canvas

    reloadAnnotations () {
      this.annotations = []
      if (this.preview.annotations) {
        const annotations = []
        this.preview.annotations.forEach(a => annotations.push({ ...a }))
        this.annotations = annotations.sort((a, b) => {
          return a.time < b.time
        }) || []
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    setupFabricCanvas () {
      if (!this.annotationCanvas) return

      const canvasId = this.annotationCanvas.id
      this.fabricCanvas = new fabric.Canvas(canvasId, {
        fireRightClick: true
      })
      this.fabricCanvas.setDimensions({
        width: 100,
        height: 100
      })
      this.configureCanvas()
      return this.fabricCanvas
    },

    configureCanvas () {
      this.fabricCanvas.off('object:moved', this.onObjectMoved)
      this.fabricCanvas.off('text:changed', this.onObjectMoved)
      this.fabricCanvas.off('object:modified', this.onObjectMoved)
      this.fabricCanvas.off('object:added', this.onObjectAdded)
      this.fabricCanvas.off('mouse:up', this.endDrawing)
      this.fabricCanvas.off('mouse:up', this.onCanvasReleased)
      this.fabricCanvas.off('mouse:move', this.onCanvasMouseMoved)
      this.fabricCanvas.off('mouse:down', this.onCanvasClicked)
      this.fabricCanvas.on('object:moved', this.onObjectMoved)
      this.fabricCanvas.on('object:modified', this.onObjectMoved)
      this.fabricCanvas.on('text:changed', this.onObjectMoved)
      this.fabricCanvas.on('object:added', this.onObjectAdded)
      this.fabricCanvas.on('erasing:end', this.onObjectAdded)
      this.fabricCanvas.on('mouse:up', this.endDrawing)
      this.fabricCanvas.on('mouse:move', this.onCanvasMouseMoved)
      this.fabricCanvas.on('mouse:down', this.onCanvasClicked)
      this.fabricCanvas.on('mouse:up', this.onCanvasReleased)
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.fabricCanvas.freeDrawingBrush.width = 4
      return this.fabricCanvas
    },

    endDrawing () {
      if (this.isDrawing) {
        this.clearUndoneStack()
        this.saveAnnotations()
      }
    },

    isEmptyCanvas () {
      if (this.fabricCanvas) {
        return this.fabricCanvas.getObjects().length > 0
      } else {
        return true
      }
    },

    clearCanvas () {
      if (this.fabricCanvas) {
        this.fabricCanvas.clear()
        this.objIndex.clear()
      }
    },

    copyAnnotations () {
      const activeObject = this.fabricCanvas.getActiveObject()
      if (activeObject) {
        activeObject.clone()
          .then(cloned => {
            clipboard.copyAnnotations(cloned)
          })
      }
      return activeObject
    },

    pasteAnnotations () {
      this.fabricCanvas.discardActiveObject()
      const clonedObj = clipboard.pasteAnnotations()
      if (clonedObj._objects) {
        clonedObj._objects.forEach(obj => this.addObject(obj))
        this.fabricCanvas.requestRenderAll()
      } else if (clonedObj._set) {
        this.addObject(clonedObj)
        this.fabricCanvas.setActiveObject(clonedObj)
        this.fabricCanvas.requestRenderAll()
      }
    },

    // Saving

    markLastAnnotationTime () {
      const time = moment().add(2, 'hour').add(6, 'seconds')
      this.lastAnnotationTime = formatFullDate(time).replace(' ', 'T')
    },

    startAnnotationSaving (preview, annotations) {
      this.notSaved = true
      this.$options.annotatedPreview = preview
      this.$options.annotationToSave =
        setTimeout(this.endAnnotationSaving, 3000)
    },

    endAnnotationSaving () {
      if (this.notSaved) {
        const preview = this.$options.annotatedPreview
        this.$options.changesToSave = {
          preview,
          additions: [...this.additions],
          updates: [...this.updates],
          deletions: [...this.deletions]
        }
        this.clearModifications()
        clearTimeout(this.$options.annotationToSave)
        this.notSaved = false
        this.$emit('annotation-changed', this.$options.changesToSave)
      }
    }
  }
}
