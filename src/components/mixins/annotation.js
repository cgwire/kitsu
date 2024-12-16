/*
 * Set of helpers to deal with annotation canvas. It's aimed at preview
 * widgets.
 */
import { fabric } from 'fabric'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { markRaw } from 'vue'

import clipboard from '@/lib/clipboard'
import { formatFullDate } from '@/lib/time'

/* Monkey patch needed to have text background including the padding. */
if (fabric) {
  fabric.Text.prototype.set({
    _getNonTransformedDimensions() {
      // Object dimensions
      return new fabric.Point(this.width, this.height).scalarAdd(this.padding)
    },
    _calculateCurrentDimensions() {
      // Controls dimensions
      return fabric.util.transformPoint(
        this._getTransformedDimensions(),
        this.getViewportTransform(),
        true
      )
    }
  })
}

export const annotationMixin = {
  emits: ['annotation-changed'],

  data() {
    return {
      fabricCanvas: null,
      fabricCanvasComparison: null,
      lastAnnotationTime: '',
      additions: [],
      deletions: [],
      updates: [],
      isShowingPalette: false,
      isShowingPencilPalette: false,
      notSave: false
    }
  },

  created() {
    this.resetUndoStacks()
  },

  computed: {
    annotationCanvas() {
      return this.$refs['annotation-canvas'] // Canvas used by fabric
    }
  },

  methods: {
    findAnnotation(list, time) {
      return list.find(a => a.time < time + 0.0001 && a.time > time - 0.0001)
    },

    // Objects

    /*
     * Get object from the canvas, find it via its unique id.
     */
    getObjectById(objectId) {
      return this.fabricCanvas.getObjects().find(obj => obj.id === objectId)
    },

    /*
     * Make an object serializable (with its extra data).
     */
    addSerialization(object) {
      object.serialize = function () {
        const result = object.toJSON()
        result.id = this.id
        result.canvasWidth = this.canvasWidth
        result.canvasHeight = this.canvasHeight
        result.angle = this.angle
        result.scale = this.scale
        result.createdBy = this.createdBy
        return result
      }
      return object
    },

    /*
     * Set extra data needed to manage the object representation and saving.
     * It adds an unique id and canvas size. This context is needed when
     * drawing annotations.
     * Saving requires to be done partially to avoid collisions.
     */
    setObjectData(object) {
      if (object.set) {
        if (!object.id) object.set('id', uuidv4())
        object.set('canvasWidth', this.fabricCanvas.width)
        object.set('canvasHeight', this.fabricCanvas.height)
      } else {
        if (!object.id) object.id = uuidv4()
        object.canvasWidth = this.fabricCanvas.width
        object.canvasHeight = this.fabricCanvas.height
      }
      if (!object.createdBy) object.set('createdBy', this.userId)
      this.addSerialization(object)
      return object
    },

    /*
     * Add an object to the canvas and to the action stack (undo/redo).
     *
     * Handle groups as a series of objects.
     */
    addObject(activeObject, persist = true) {
      if (activeObject._objects) {
        activeObject._objects.forEach(obj => {
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

    /*
     * Add a text object to the canvas and focus on it right after to allow its
     * edition instantly.
     */
    addText(event) {
      if (this.fabricCanvas.getActiveObject()) return
      const canvas = this.canvas || this.canvasWrapper
      const offsetCanvas = canvas.getBoundingClientRect()
      const posX = this.getClientX(event) - offsetCanvas.x
      const posY = this.getClientY(event) - offsetCanvas.y
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

    /** @lends fabric.IText.prototype */
    // fix for : IText not editable when canvas is in a fullscreen
    // element on chrome
    // https://github.com/fabricjs/fabric.js/issues/5126
    addTypeArea() {
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      fabric.util.object.extend(fabric.IText.prototype, {
        initHiddenTextarea: function () {
          originalInitHiddenTextarea.call(this)
          this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
        }
      })
    },

    /*
     * Hack needed to make text objects working properly outside of full screen
     * mode.
     */
    removeTypeArea() {
      const originalInitHiddenTextarea =
        fabric.IText.prototype.initHiddenTextarea
      fabric.util.object.extend(fabric.IText.prototype, {
        initHiddenTextarea: function () {
          originalInitHiddenTextarea.call(this)
          if (fabric.document) {
            fabric.document.body.appendChild(this.hiddenTextarea)
          }
        }
      })
    },

    /*
     * Remove selected objects from the canvas and persist deletions.
     */
    deleteSelection() {
      const activeObject = this.fabricCanvas.getActiveObject()
      this.deleteObject(activeObject)
    },

    /*
     * Remove given object from the canvas, add an operation to the action
     * stack and persist the deletion.
     */
    deleteObject(activeObject) {
      if (activeObject && activeObject._objects) {
        activeObject._objects.forEach(obj => {
          this.fabricCanvas.remove(obj)
          this.addToDeletions(obj)
          this.$options.doneActionStack.push({
            type: 'remove',
            obj
          })
        })
      } else if (activeObject) {
        this.fabricCanvas.remove(activeObject)
        this.addToDeletions(activeObject)
        this.$options.doneActionStack.push({
          type: 'remove',
          obj: activeObject
        })
      }
      this.saveAnnotations()
    },

    /*
     * Remove given object or group from the canvas.
     */
    removeObjectFromCanvas(deletedObject) {
      const obj = this.getObjectById(deletedObject.id)
      if (obj) {
        if (obj._objects) {
          obj._objects.forEach(this.fabricCanvas.remove)
          this.fabricCanvas.remove(obj)
        } else {
          this.fabricCanvas.remove(obj)
        }
      }
    },

    /*
     * Remove given object or group from the canvas and add its updated
     * version.
     */
    updateObjectInCanvas(annotation, updatedObject) {
      const obj = this.getObjectById(updatedObject.id)
      if (obj) {
        this.removeObjectFromCanvas(obj)
        this.addObjectToCanvas(annotation, updatedObject)
      }
    },

    /*
     * Add the given object to the element to persist.
     */
    addToAdditions(obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const currentFrame = this.getCurrentFrame()
      const additions = this.findAnnotation(this.additions, currentTime)
      if (additions) {
        additions.drawing.objects.push(obj.serialize())
      } else {
        this.additions.push({
          time: currentTime,
          frame: currentFrame,
          drawing: { objects: [obj.serialize()] }
        })
      }
      this.postAnnotationAddition(currentTime, obj.serialize())
    },

    /*
     * Hook occuring after an addition.
     */
    postAnnotationAddition(currentTime, obj) {
      // Aimed at being supercharged
    },

    /*
     * Remove given object from the additions to persist (undo action).
     */
    removeFromAdditions(obj) {
      const currentTime = this.getCurrentTime()
      const additions = this.findAnnotation(this.additions, currentTime)
      if (additions) {
        additions.drawing.objects = additions.drawing.objects.filter(
          o => o.id !== obj.id
        )
      }
    },

    /*
     * Add given object to the deletions to persist (undo action).
     */
    addToDeletions(obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const currentFrame = this.getCurrentFrame()
      const deletion = this.findAnnotation(this.deletions, currentTime)
      if (deletion) {
        deletion.objects.push(obj.id)
      } else {
        this.deletions.push({
          time: currentTime,
          frame: currentFrame,
          objects: [obj.id]
        })
      }
      if (!obj.serialize) {
        this.addSerialization(obj)
      }
      this.postAnnotationDeletion(currentTime, obj.serialize())
    },

    /*
     * Hook occuring after a removal.
     */
    postAnnotationDeletion(currentTime, obj) {
      // Aimed at being supercharged
    },

    /*
     * Remove given object from the deletions to persist (undo action).
     */
    removeFromDeletions(obj) {
      const currentTime = this.getCurrentTime()
      const deletions = this.findAnnotation(this.deletions, currentTime)
      if (deletions) {
        deletions.objects = deletions.objects.filter(oId => oId !== obj.id)
      }
    },

    /*
     * Add given object to updates to persist.
     */
    addToUpdates(obj) {
      this.setObjectData(obj)
      this.addToUpdatesSerializedObject(obj.serialize())
    },

    /*
     * Add non fabric object to updates to persist.
     */
    addToUpdatesSerializedObject(obj) {
      this.markLastAnnotationTime()
      const currentTime = this.getCurrentTime()
      const currentFrame = this.getCurrentFrame()
      const updates = this.findAnnotation(this.updates, currentTime)
      if (updates) {
        updates.drawing.objects = updates.drawing.objects.filter(
          o => o.id !== obj.id
        )
        updates.drawing.objects.push(obj)
      } else {
        this.updates.push({
          time: currentTime,
          frame: currentFrame,
          drawing: { objects: [obj] }
        })
      }
      this.postAnnotationUpdate(currentTime, obj)
    },

    /*
     * Hook run after annotation updates occurred.
     */
    postAnnotationUpdate(currentTime, obj) {
      // Aimed at being supercharged
    },

    /*
     * Clear all running modifications
     */
    clearModifications() {
      this.additions = []
      this.updates = []
      this.deletions = []
    },

    /*
     * Debug helper.
     */
    printModificationStats(prefix) {
      // eslint-disable-next-line no-console
      console.log(
        prefix,
        this.additions.length > 0
          ? this.additions[0].drawing.objects.length
          : 0,
        this.updates.length > 0 ? this.updates[0].drawing.objects.length : 0,
        this.deletions.length > 0 ? this.deletions[0].objects.length : 0
      )
    },

    /*
     * True if the last annotation is superior to given date. It's a way to
     * avoid collisions.
     */
    isWriting(date) {
      return this.lastAnnotationTime >= date
    },

    /*
     * Build an annotation object to be persisted and used in the Vue store.
     * All annotations are a serialized fabric objects. Add a current time
     * indicator in the result object to tie the annotation to a given frame.
     *
     * Later it will be interesting to represent time in as a frame number.
     */
    getNewAnnotations(currentTime, currentFrame, annotation) {
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
            br: !this.isCurrentUserArtist,
            tl: false,
            tr: false,
            mtr: !this.isCurrentUserArtist
          })
        }
      })

      if (annotation) {
        annotation.drawing = {
          objects: this.fabricCanvas._objects.map(obj => {
            const result = obj.serialize()
            // We need to clean the coordinate modifications due to selection
            // grouping.
            if (obj.group) {
              const group = obj.group
              result.left = group.left + Math.round(group.width / 2) + obj.left
              result.top = group.top + Math.round(group.height / 2) + obj.top
              result.group = null
            }
            return result
          })
        }
        annotation.time = currentTime
        if (annotation.drawing && annotation.drawing.objects.length < 1) {
          const index = this.annotations.findIndex(
            annotation => annotation.time === currentTime
          )
          this.annotations.splice(index, 1)
        }
      } else {
        if (!this.annotations || !this.annotations.push) this.annotations = []
        this.$store.commit('ADD_ANNOTATION', {
          annotations: this.annotations,
          annotation: {
            time: Math.max(currentTime, 0),
            frame: Math.max(currentFrame, 0),
            drawing: {
              objects: this.fabricCanvas._objects.map(obj => obj.serialize())
            }
          }
        })
      }
      const annotations = []
      this.annotations.forEach(a => annotations.push({ ...a }))
      return annotations
    },

    /*
     * Load an annotation directly to the canvas by adding all its object
     * one by one to the canvas.
     */
    loadSingleAnnotation(annotation, canvas = null) {
      annotation.drawing.objects.forEach(obj => {
        this.addObjectToCanvas(annotation, obj, canvas)
      })
    },

    loadSingleAnnotationComparison(annotation) {
      annotation.drawing.objects.forEach(obj => {
        this.addObjectToCanvas(annotation, obj, this.fabricCanvasComparison)
      })
    },

    /*
     * Add an object to the canvas if it is not already there.
     *
     * To add an object it computes the modifiers needed to render it properly:
     * x-axis scale multiplier, y-axis scale multiplier and stroke multiplier.
     * They are computed from the current canvas size and the canvas size when
     * the annotation was saved.
     *
     * It creates a base object description and sets the writing permissions on
     * it. Then it configures it as text or a path depending on the object
     * type. Position and proportion are
     *
     * Finally it adds the built object to the canvas.
     *
     * @returns: the build object.
     */
    addObjectToCanvas(annotation, obj, canvas = null) {
      if (!obj) return
      if (this.getObjectById(obj.id) && !canvas) return
      if (!canvas) canvas = this.fabricCanvas
      let path, text
      let scaleMultiplierX = 1
      let scaleMultiplierY = 1
      if (annotation?.width) {
        scaleMultiplierX = canvas.width / annotation.width
        scaleMultiplierY = canvas.width / annotation.width
      }
      if (annotation?.height) {
        scaleMultiplierY = canvas.height / annotation.height
      }
      const canvasWidth = obj.canvasWidth || annotation.width
      const canvasHeight = obj.canvasHeight

      if (canvasWidth) {
        scaleMultiplierX = canvas.width / canvasWidth
        scaleMultiplierY = canvas.width / canvasWidth
      }
      if (canvasHeight) {
        scaleMultiplierY = canvas.height / canvasHeight
      }

      const base = {
        id: obj.id,
        fill: 'transparent',
        left: obj.left * scaleMultiplierX,
        top: obj.top * scaleMultiplierY,
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
          strokeMultiplier = canvasWidth / canvas.width
        }
        if (canvas.width < 420) strokeMultiplier /= 2
        path = new fabric.Path(obj.path, {
          ...base
        })
        path.set('id', obj.id)
        path.set('strokeWidth', obj.strokeWidth * strokeMultiplier)
        path.set('canvasWidth', canvasWidth)
        path.set('canvasHeight', canvasHeight)
        this.addSerialization(path)
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
        canvas.add(path)
        this.$options.silentAnnnotation = false
      } else if (obj.type === 'i-text' || obj.type === 'text') {
        text = new fabric.IText(obj.text, {
          ...base,
          fill: obj.fill,
          left: obj.left * scaleMultiplierX,
          top: obj.top * scaleMultiplierY,
          fontFamily: obj.fontFamily,
          fontSize: obj.fontSize,
          backgroundColor: 'rgba(255,255,255, 0.8)',
          padding: 10
        })
        text.set('id', obj.id)
        text.set('canvasWidth', canvasWidth)
        text.set('canvasHeight', canvasHeight)
        this.addSerialization(text)
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
        this.$options.silentAnnnotation = true
        canvas.add(text)
        this.$options.silentAnnnotation = false
      }
      return path || text
    },

    // Events

    /*
     * Enable / disabl showing pencil palette flag.
     */
    onPickPencil() {
      this.isShowingPencilPalette = !this.isShowingPencilPalette
    },

    /*
     * Enable / disabl showing color palette flag.
     */
    onPickColor() {
      this.isShowingPalette = !this.isShowingPalette
    },

    /*
     * When a drawing color is changed, store it in local state.
     */
    onChangeColor(color) {
      this.color = color
      this._resetColor()
      this.isShowingPalette = false
    },

    /*
     * When a text color is changed, store it in local state.
     */
    onChangeTextColor(color) {
      this.textColor = color
      this.isShowingPalette = false
    },

    /*
     * When a pencil is changed, store it in local state.
     */
    onChangePencil(pencil) {
      this.pencil = pencil
      this._resetPencil()
      this.isShowingPalette = false
    },

    _resetColor() {
      this.fabricCanvas.freeDrawingBrush.color = this.color
    },

    _resetPencil() {
      const converter = {
        big: 4,
        medium: 2,
        small: 1
      }
      const strokeWidth = converter[this.pencil]
      this.fabricCanvas.freeDrawingBrush.width = strokeWidth
    },

    /*
     * Enable / disable the drawing mode. Differentiate text from path drawing.
     */
    onAnnotateClicked() {
      this.showCanvas()
      if (this.isDrawing) {
        this.fabricCanvas.isDrawingMode = false
        this.isDrawing = false
      } else {
        this.isTyping = false
        if (this.fabricCanvas) {
          this.fabricCanvas.isDrawingMode = true
        }
        this.fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(
          this.fabricCanvas
        )
        this._resetColor()
        this._resetPencil()
        this.isDrawing = true
      }
    },

    /*
     * Enable / disable eraser mode.
     */
    onEraseClicked() {
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
        this.fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(
          this.fabricCanvas
        )
        this.fabricCanvas.freeDrawingBrush.width = 10
      }
    },

    /*
     * Enable / disable the text mode. Tetxs are added via a double click.
     */
    onTypeClicked() {
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

    /*
     * When the windows is closed, display an alert if the current annotations
     * are not saved.
     */
    onWindowsClosed(event) {
      if (this.notSaved) {
        const confirmationMessage = 'Your annotations are not saved yet.'
        event.returnValue = confirmationMessage
        return confirmationMessage
      }
    },

    /*
     * When an object is added, set its context data, add it to the canvas,
     * add it to the additions to save and store an add action in the action
     * stacks.
     */
    onObjectAdded(obj) {
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

    /*
     * When object is modified, it saves the changes to the database by saving
     * the new position, angle and size of the object.
     * For that it manages differet cases:
     * * It's an object: it saves the new position, angle and size of the
     *   object.
     * * It's a group: it saves group element one by one. Prior to that, it
     *   has to calculate the new position in the main reference system.
     *   Because FabricJS provides the position of the object in the group
     *   reference.
     */
    onObjectModified(event) {
      const movedObject = event.target
      if (!movedObject._objects) {
        this.addToUpdates(movedObject)
        this.saveAnnotations()
        this.addSerialization(movedObject)
      } else {
        const group = movedObject
        group._objects.forEach(groupObj => {
          const canvasObj = this.getObjectById(groupObj.id)
          this.setObjectData(canvasObj)
          const targetObj = canvasObj.serialize()
          const point = new fabric.Point(groupObj.left, groupObj.top)
          const transformedPoint = fabric.util.transformPoint(
            point,
            group.calcTransformMatrix()
          )
          targetObj.left = transformedPoint.x
          targetObj.top = transformedPoint.y
          targetObj.angle += group.angle
          targetObj.scaleX *= group.scaleX
          targetObj.scaleY *= group.scaleY
          this.addToUpdatesSerializedObject(targetObj)
        })
        this.saveAnnotations()
      }
    },

    // Undo / Redo

    /*
     * Clear all action stacks.
     */
    resetUndoStacks() {
      this.$options.doneActionStack = []
      this.$options.undoneActionStack = []
    },

    /*
     * Add a add action to the stack.
     */
    stackAddAction({ target }) {
      this.$options.doneActionStack.push({ type: 'add', obj: target })
      target.lockScalingX = true
      target.lockScalingY = true
      target.rotation = true
    },

    /*
     * Undo last action, update actions stack.
     */
    undoLastAction() {
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

    /*
     * Apply last undone action, update actions stack.
     */
    redoLastAction() {
      const action = this.$options.undoneActionStack.pop()
      if (action) {
        if (action.type === 'add') {
          this.addObject(action.obj)
        } else if (action.type === 'remove') {
          this.deleteObject(action.obj)
        }
      }
    },

    /*
     * Clear all actions in the undone stack.
     */
    clearUndoneStack() {
      this.$options.undoneActionStack = []
    },

    // Canvas

    /*
     * Delete all annotations from the canvas and persist the deletion.
     */
    deleteAllAnnotations() {
      this.fabricCanvas._objects.forEach(this.deleteObject)
    },

    /*
     * Cancel current selection.
     */
    clearAnnotationSelection() {
      const canvas = this.fabricCanvas
      if (canvas.activeObject) {
        canvas.discardActiveObject()
        canvas.renderAll()
      }
    },

    /*
     * Clear everything and reload annotations.
     */
    resizeAnnotations() {
      this.resetCanvas().then(() => {
        this.reloadAnnotations()
        this.loadAnnotation()
      })
    },

    /*
     * Remove all annotation from the canvas and reset its size.
     */
    resetCanvas() {
      this.clearCanvas()
      return this.resetCanvasSize().then(() => {
        if (this.fabricCanvas) this.fabricCanvas.renderAll()
        return Promise.resolve(this.fabricCanvas)
      })
    },

    /*
     * Return true if the canvas object is configured.
     */
    isAnnotationCanvas() {
      return !!this.fabricCanvas
    },

    /*
     * Set canvas width and height.
     */
    setAnnotationCanvasDimensions(width, height) {
      this.fabricCanvas.setDimensions({ width, height })
    },

    /*
     * Enable/disable drawing mode.
     */
    setAnnotationDrawingMode(isDrawingMode) {
      this.fabricCanvas.isDrawingMode = isDrawingMode
    },

    /*
     * Reset annotations data at the widget level by grabbing data from the
     * store.
     */
    reloadAnnotations() {
      this.annotations = []
      if (this.preview.annotations) {
        const annotations = []
        this.preview.annotations.forEach(a => annotations.push({ ...a }))
        this.annotations =
          annotations.sort((a, b) => {
            return a.time < b.time
          }) || []
      } else {
        this.annotations = []
      }
      return this.annotations
    },

    /*
     * Setup the fabric, events and default configuration
     */
    setupFabricCanvas() {
      if (!this.annotationCanvas) return

      const canvasId = this.annotationCanvas.id
      // Use markRaw() to avoid reactivity on Fabric Canvas
      this.fabricCanvas = markRaw(
        new fabric.Canvas(canvasId, {
          fireRightClick: true
        })
      )
      this.fabricCanvas.setDimensions({
        width: 100,
        height: 100
      })
      if (!this.fabricCanvas.freeDrawingBrush) {
        this.fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(
          this.fabricCanvas
        )
      }
      this.configureCanvas()
      return this.fabricCanvas
    },

    /*
     * Set all events listener, the default brush parameters and the group
     * controls visibility.
     */
    configureCanvas() {
      this.fabricCanvas.off('object:moved', this.onObjectModified)
      this.fabricCanvas.off('text:changed', this.onObjectModified)
      this.fabricCanvas.off('object:modified', this.onObjectModified)
      this.fabricCanvas.off('object:added', this.onObjectAdded)
      this.fabricCanvas.off('mouse:up', this.endDrawing)
      this.fabricCanvas.off('mouse:up', this.onCanvasReleased)
      this.fabricCanvas.off('mouse:move', this.onCanvasMouseMoved)
      this.fabricCanvas.off('mouse:down', this.onCanvasClicked)
      this.fabricCanvas.on('object:moved', this.onObjectModified)
      this.fabricCanvas.on('object:modified', this.onObjectModified)
      this.fabricCanvas.on('text:changed', this.onObjectModified)
      this.fabricCanvas.on('object:added', this.onObjectAdded)
      this.fabricCanvas.on('erasing:end', this.onObjectAdded)
      this.fabricCanvas.on('mouse:up', this.endDrawing)
      this.fabricCanvas.on('mouse:move', this.onCanvasMouseMoved)
      this.fabricCanvas.on('mouse:down', this.onCanvasClicked)
      this.fabricCanvas.on('mouse:up', this.onCanvasReleased)
      this.fabricCanvas.freeDrawingBrush.color = this.color
      this.fabricCanvas.freeDrawingBrush.width = 4

      fabric.Group.prototype._controlsVisibility = {
        tl: false,
        tr: false,
        br: !this.isCurrentUserArtist,
        bl: false,
        ml: false,
        mr: false,
        mb: false,
        mt: false
      }
      fabric.Group.prototype.hasControls = true
      return this.fabricCanvas
    },

    /*
     * When drawing is finished, the undone stack is emptied and the saving
     * procedure is started.
     */
    endDrawing() {
      if (this.isDrawing) {
        this.clearUndoneStack()
        this.saveAnnotations()
      }
    },

    /*
     * Returns true if the canvas has no object inside it.
     */
    isEmptyCanvas() {
      if (this.fabricCanvas) {
        return this.fabricCanvas.getObjects().length > 0
      } else {
        return true
      }
    },

    /*
     * Remove all drawing objects from the fabric canvas
     */
    clearCanvas() {
      if (this.fabricCanvas) {
        this.fabricCanvas.clear()
      }
      if (this.fabricCanvasComparison) {
        this.fabricCanvasComparison.clear()
      }
    },

    /*
     * Store selected annotations into the clipboard.
     */
    copyAnnotations() {
      if (!this.fabricCanvas) return
      const activeObject = this.fabricCanvas.getActiveObject()
      if (activeObject) {
        activeObject.clone().then(cloned => {
          clipboard.copyAnnotations(cloned)
        })
      }
      return activeObject
    },

    /*
     * Paste annotations stored in the clipboard.
     */
    pasteAnnotations() {
      if (!this.fabricCanvas) return
      this.fabricCanvas.discardActiveObject()
      const clonedObj = clipboard.pasteAnnotations()
      if (clonedObj._objects) {
        clonedObj._objects.forEach(obj => {
          obj = this.applyGroupChanges(clonedObj, obj)
          obj.group = null
          this.addObject(obj)
        })
        this.fabricCanvas.requestRenderAll()
      } else if (clonedObj._set) {
        this.addObject(clonedObj)
        this.fabricCanvas.setActiveObject(clonedObj)
        this.fabricCanvas.requestRenderAll()
      }
    },

    applyGroupChanges(group, obj) {
      if (obj.group) {
        const point = new fabric.Point(obj.left, obj.top)
        const transformedPoint = fabric.util.transformPoint(
          point,
          group.calcTransformMatrix()
        )
        obj.left = transformedPoint.x
        obj.top = transformedPoint.y
        obj.angle += group.angle
        obj.scaleX *= group.scaleX
        obj.scaleY *= group.scaleY
      }
      return obj
    },

    /*
     * Slowly remove an object. It's used for the laser mode.
     */
    fadeObject(obj) {
      if (!obj) return
      obj.animate('opacity', '0', {
        duration: 1500,
        onChange: this.fabricCanvas.renderAll.bind(this.fabricCanvas),
        onComplete: () => {
          this.fabricCanvas.remove(obj)
        }
      })
    },

    // Saving

    /*
     * Store the last time when an annotation was drawn. It will be useful to
     * lock the canvas when real time applies.
     */
    markLastAnnotationTime() {
      const time = moment().add(2, 'hour').add(6, 'seconds')
      this.lastAnnotationTime = formatFullDate(time).replace(' ', 'T')
    },

    /*
     * Run the saving procedure, prepare the data and set a 3s timer before
     * persisting data to the server.
     */
    startAnnotationSaving(preview, annotations) {
      this.notSaved = true
      this.$options.annotatedPreview = preview
      this.$options.annotationToSave = setTimeout(() => {
        this.endAnnotationSaving()
      }, 3000)
    },

    /*
     * Prepare the data to send to the server for persistance. Emit an event
     * suggesting that annotations should be saved.
     */
    endAnnotationSaving() {
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
        if (this.onAnnotationChanged) {
          this.onAnnotationChanged(this.$options.changesToSave)
        }
      }
    },

    /*
     * Copy all information from the annotation into the target canvas to be
     * able to apply operations on it, without modifiying the annotation.
     */
    copyAnnotationCanvas(canvas, annotation) {
      return new Promise(resolve => {
        this.clearCanvas()
        this.loadSingleAnnotation(annotation)
        setTimeout(() => {
          const context = canvas.getContext('2d')
          const scaleRatio = canvas.width / this.fabricCanvas.width
          const tmpSource = document.getElementById('resize-annotation-canvas')
          const tmpCanvas = new fabric.Canvas('resize-annotation-canvas', {
            width: canvas.width,
            height: canvas.height
          })
          this.fabricCanvas.getObjects().find(obj => {
            if (obj._objects) {
              obj._objects.forEach(obj => {
                tmpCanvas.add(obj)
                obj.strokeWidth = 8 / scaleRatio
              })
            } else {
              tmpCanvas.add(obj)
              obj.strokeWidth = 8 / scaleRatio
            }
          })
          tmpCanvas.setZoom(scaleRatio)
          setTimeout(() => {
            context.drawImage(tmpSource, 0, 0, canvas.width, canvas.height)
            setTimeout(() => {
              tmpCanvas.dispose()
            }, 100)
            return resolve()
          }, 100)
        }, 100)
      })
    }
  }
}
