/*
 * Composable for annotation canvas management. It's aimed at preview widgets.
 * Converted from the annotation mixin for use in Composition API components.
 */
import { fabric } from 'fabric'
import { PSStroke, PSBrush } from 'fabricjs-psbrush'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { markRaw, ref, watch } from 'vue'

import {
  SHAPE_WIDTHS,
  attachShapeDrawing,
  buildReadOnlyShape,
  lockBrushToFirstPointer
} from '@/lib/annotation'
import clipboard from '@/lib/clipboard'
import { formatFullDate } from '@/lib/time'
import localPreferences from '@/lib/preferences'

/* Force scaling / rotation handles to show on grouped selections so a
 * marquee around several annotations stays scalable / rotatable. */
if (fabric) {
  fabric.Group.prototype.hasControls = true
}

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

/* Monkey patch _getTransformedDimensions() to return a proper fabric point */
if (PSStroke) {
  PSStroke.prototype._getTransformedDimensions = function () {
    const width = this.width * this.scaleX
    const height = this.height * this.scaleY
    const dimensions = new fabric.Point(width, height)
    return dimensions
  }

  /* Monkey patches needed to make PSStroke work correctly by adding missing
   * expected methods to deal with Fabric and pressure.
   */
  if (!PSStroke.prototype.getAncestors) {
    PSStroke.prototype.getAncestors = function () {
      return []
    }
  }

  if (!PSStroke.prototype.contextTop) {
    PSStroke.prototype.contextTop = function () {
      return {}
    }
  }

  if (!PSStroke.prototype.dispose) {
    PSStroke.prototype.dispose = function () {
      return {}
    }
  }

  if (!PSStroke.prototype.getRelativeCenterPoint) {
    PSStroke.prototype.getRelativeCenterPoint = function () {
      if (this.getCenterPoint) {
        return this.getCenterPoint()
      }
      return new fabric.Point(this.left, this.top)
    }
  }
}

/**
 * Composable for annotation canvas management.
 *
 * @param {Object} options
 * @param {import('vue').Ref} options.canvasWrapper - template ref for the canvas wrapper element
 * @param {import('vue').Ref} options.annotations - reactive ref for annotations array
 * @param {import('vue').ComputedRef} options.isCurrentUserArtist - computed ref for artist check
 * @param {import('vue').ComputedRef} options.userId - computed ref for user id
 * @param {Object} options.store - Vuex store instance
 * @param {Function} options.emit - component emit function
 * @param {Function} options.getCurrentTime - callback to get current time
 * @param {Function} options.getCurrentFrame - callback to get current frame
 * @param {Function} options.saveAnnotationsCb - callback for saving annotations
 * @param {Function} options.onCanvasMouseMovedCb - callback for canvas mouse moved
 * @param {Function} options.onCanvasReleasedCb - callback for canvas mouse released
 * @param {import('vue').Ref<boolean>} [options.isLaserModeOn] - reactive ref;
 *   when true, new objects fade out instead of being persisted and end-of-
 *   stroke does not trigger a save. Defaults to a static `ref(false)`.
 * @param {Function} [options.postAnnotationAddition] - hook fired after a
 *   local addition is recorded. Receives `(currentTime, serializedObject)`.
 *   Used by collaborative review to broadcast over sockets.
 * @param {Function} [options.postAnnotationDeletion] - hook fired after a
 *   local deletion is recorded. Receives `(currentTime, serializedObject)`.
 * @param {Function} [options.postAnnotationUpdate] - hook fired after a
 *   local update is recorded. Receives `(currentTime, serializedObject)`.
 */
export const useAnnotation = ({
  mainCanvasComponent,
  comparisonCanvasComponent,
  canvasWrapper,
  annotations,
  isCurrentUserArtist,
  userId,
  store,
  emit,
  getCurrentTime,
  getCurrentFrame,
  saveAnnotationsCb,
  onCanvasMouseMovedCb,
  onCanvasReleasedCb,
  isLaserModeOn = ref(false),
  postAnnotationAddition = () => {},
  postAnnotationDeletion = () => {},
  postAnnotationUpdate = () => {}
}) => {
  // Canvas instances are owned by AnnotationCanvas components; we
  // mirror them into local refs through watchers so internal code
  // can keep treating fabricCanvas / fabricCanvasComparison as
  // writable refs.
  const fabricCanvas = ref(null)
  const fabricCanvasComparison = ref(null)
  const lastAnnotationTime = ref('')
  const additions = ref([])
  const deletions = ref([])
  const updates = ref([])
  const notSaved = ref(false)
  const pencilColor = ref('#ff3860')
  const pencilWidth = ref('big')
  const textColor = ref('#ff3860')
  const isShapeMode = ref(false)
  const currentShape = ref('rectangle')
  const mouseIsDrawing = ref(false)
  const mouseDrawingPressureMode = ref('distance')
  const mouseDrawingStartTime = ref(null)
  const mouseDrawingMinPressure = ref(0.4)
  const mouseDrawingMaxPressure = ref(0.8)
  const mouseDrawingFadeTime = ref(100)
  const mouseDrawingDistanceFalloff = ref(2)
  const mouseDrawingMaxChangeRate = ref(0.03)
  const mouseDrawingPrevPoint = ref(null)
  const mouseDrawingPrevPressure = ref(null)
  const mouseDrawingDynamicDistanceMult = ref(null)

  // Per-instance non-reactive state (replaces this.$options.xxx)
  const doneActionStack = []
  const undoneActionStack = []
  let silentAnnotation = false
  let annotatedPreview = null
  let annotationToSave = null
  let pendingSave = null
  let detachShapeDrawing = null

  // Init
  const resetUndoStacks = () => {
    doneActionStack.length = 0
    undoneActionStack.length = 0
  }
  resetUndoStacks()

  // Objects

  const findAnnotation = (list, time) => {
    return list.find(a => a.time < time + 0.0001 && a.time > time - 0.0001)
  }

  const getObjectById = objectId => {
    if (!fabricCanvas.value) return null
    return fabricCanvas.value.getObjects().find(obj => obj.id === objectId)
  }

  const addSerialization = object => {
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
  }

  const setObjectData = object => {
    // canvasWidth / canvasHeight are the dimensions the object's left /
    // top were authored against — never refresh them, or a later save
    // will pair the old coords with the new (resized) canvas and the
    // re-loaded annotation will drift on the Y axis.
    if (object.set) {
      if (!object.id) object.set('id', uuidv4())
      if (!object.canvasWidth) {
        object.set('canvasWidth', fabricCanvas.value.width)
      }
      if (!object.canvasHeight) {
        object.set('canvasHeight', fabricCanvas.value.height)
      }
      if (!object.createdBy) object.set('createdBy', userId.value)
    } else {
      if (!object.id) object.id = uuidv4()
      if (!object.canvasWidth) object.canvasWidth = fabricCanvas.value.width
      if (!object.canvasHeight) object.canvasHeight = fabricCanvas.value.height
      if (!object.createdBy) object.createdBy = userId.value
    }
    addSerialization(object)
    return object
  }

  const addObject = (activeObject, persist = true) => {
    if (activeObject._objects) {
      activeObject._objects.forEach(obj => {
        fabricCanvas.value.add(obj)
        doneActionStack.pop()
      })
    } else {
      fabricCanvas.value.add(activeObject)
    }
    if (persist) {
      doneActionStack.push({ type: 'add', obj: activeObject })
      saveAnnotationsCb()
    }
  }

  const addText = event => {
    if (fabricCanvas.value.getActiveObject()) return
    const canvas = canvasWrapper.value
    const offsetCanvas = canvas.getBoundingClientRect()
    const posX = getClientX(event) - offsetCanvas.x
    const posY = getClientY(event) - offsetCanvas.y
    const baseHeight = 320
    let fontSize = 12
    if (fabricCanvas.value.getHeight() > baseHeight) {
      fontSize = fontSize * (fabricCanvas.value.getHeight() / baseHeight)
    }
    const fabricText = new fabric.IText('Type...', {
      left: posX,
      top: posY,
      fontFamily: 'arial',
      fill: textColor.value,
      fontSize: fontSize,
      backgroundColor: 'rgba(255,255,255, 0.8)',
      padding: 10
    })

    fabricCanvas.value.add(fabricText)
    fabricCanvas.value.setActiveObject(fabricText)
    fabricText.enterEditing()
    fabricText.selectAll()
    fabricText.hiddenTextarea.onblur = () => {
      saveAnnotationsCb()
    }
  }

  const addTypeArea = () => {
    const originalInitHiddenTextarea = fabric.IText.prototype.initHiddenTextarea
    fabric.util.object.extend(fabric.IText.prototype, {
      initHiddenTextarea: function () {
        originalInitHiddenTextarea.call(this)
        this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
      }
    })
  }

  const removeTypeArea = () => {
    const originalInitHiddenTextarea = fabric.IText.prototype.initHiddenTextarea
    fabric.util.object.extend(fabric.IText.prototype, {
      initHiddenTextarea: function () {
        originalInitHiddenTextarea.call(this)
        if (fabric.document) {
          fabric.document.body.appendChild(this.hiddenTextarea)
        }
      }
    })
  }

  // Object management

  const deleteSelection = () => {
    const activeObject = fabricCanvas.value.getActiveObject()
    deleteObject(activeObject)
  }

  const deleteObject = activeObject => {
    if (activeObject && activeObject._objects) {
      // ActiveSelection children carry coords relative to the
      // selection's center. discardActiveObject() restores them to
      // absolute first so undo can re-inject them at the right place,
      // and we clone _objects up-front in case fabric clears it on
      // discard.
      const children = [...activeObject._objects]
      fabricCanvas.value.discardActiveObject()
      children.forEach(obj => {
        fabricCanvas.value.remove(obj)
        addToDeletions(obj)
        doneActionStack.push({ type: 'remove', obj })
      })
    } else if (activeObject) {
      fabricCanvas.value.remove(activeObject)
      addToDeletions(activeObject)
      doneActionStack.push({ type: 'remove', obj: activeObject })
    }
    saveAnnotationsCb()
  }

  const removeObjectFromCanvas = deletedObject => {
    const obj = getObjectById(deletedObject.id)
    if (obj) {
      if (obj._objects) {
        obj._objects.forEach(o => fabricCanvas.value.remove(o))
        fabricCanvas.value.remove(obj)
      } else {
        fabricCanvas.value.remove(obj)
      }
    }
  }

  const updateObjectInCanvas = (annotation, updatedObject) => {
    const obj = getObjectById(updatedObject.id)
    if (obj) {
      removeObjectFromCanvas(obj)
      addObjectToCanvas(annotation, updatedObject)
    }
  }

  // Modifications

  const addToAdditions = obj => {
    markLastAnnotationTime()
    const currentTime = getCurrentTime()
    const currentFrame = getCurrentFrame()
    const serialized = obj.serialize()
    const additionsEntry = findAnnotation(additions.value, currentTime)
    if (additionsEntry) {
      additionsEntry.drawing.objects.push(serialized)
    } else {
      additions.value.push({
        time: currentTime,
        frame: currentFrame,
        drawing: { objects: [serialized] }
      })
    }
    postAnnotationAddition(currentTime, serialized)
  }

  const removeFromAdditions = obj => {
    const currentTime = getCurrentTime()
    const additionsEntry = findAnnotation(additions.value, currentTime)
    if (additionsEntry) {
      additionsEntry.drawing.objects = additionsEntry.drawing.objects.filter(
        o => o.id !== obj.id
      )
    }
  }

  const addToDeletions = obj => {
    markLastAnnotationTime()
    const currentTime = getCurrentTime()
    const currentFrame = getCurrentFrame()
    const deletion = findAnnotation(deletions.value, currentTime)
    if (deletion) {
      deletion.objects.push(obj.id)
    } else {
      deletions.value.push({
        time: currentTime,
        frame: currentFrame,
        objects: [obj.id]
      })
    }
    if (!obj.serialize) {
      addSerialization(obj)
    }
    postAnnotationDeletion(currentTime, obj.serialize())
  }

  const removeFromDeletions = obj => {
    const currentTime = getCurrentTime()
    const deletionsEntry = findAnnotation(deletions.value, currentTime)
    if (deletionsEntry) {
      deletionsEntry.objects = deletionsEntry.objects.filter(
        oId => oId !== obj.id
      )
    }
  }

  const addToUpdates = obj => {
    setObjectData(obj)
    addToUpdatesSerializedObject(obj.serialize())
  }

  const addToUpdatesSerializedObject = obj => {
    markLastAnnotationTime()
    const currentTime = getCurrentTime()
    const currentFrame = getCurrentFrame()
    const updatesEntry = findAnnotation(updates.value, currentTime)
    if (updatesEntry) {
      updatesEntry.drawing.objects = updatesEntry.drawing.objects.filter(
        o => o.id !== obj.id
      )
      updatesEntry.drawing.objects.push(obj)
    } else {
      updates.value.push({
        time: currentTime,
        frame: currentFrame,
        drawing: { objects: [obj] }
      })
    }
    postAnnotationUpdate(currentTime, obj)
  }

  const clearModifications = () => {
    additions.value = []
    updates.value = []
    deletions.value = []
  }

  const printModificationStats = prefix => {
    // eslint-disable-next-line no-console
    console.log(
      prefix,
      additions.value.length > 0
        ? additions.value[0].drawing.objects.length
        : 0,
      updates.value.length > 0 ? updates.value[0].drawing.objects.length : 0,
      deletions.value.length > 0 ? deletions.value[0].objects.length : 0
    )
  }

  const isWriting = date => {
    return lastAnnotationTime.value >= date
  }

  // Annotations

  const getNewAnnotations = (currentTime, currentFrame, annotation) => {
    fabricCanvas.value.getObjects().forEach(obj => {
      setObjectData(obj)
      if (obj.type === 'path' || obj.type === 'PSStroke') {
        if (!obj.canvasWidth) obj.canvasWidth = fabricCanvas.value.width
        if (!obj.canvasHeight) obj.canvasHeight = fabricCanvas.value.height
        obj.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: !isCurrentUserArtist.value,
          tl: false,
          tr: false,
          mtr: !isCurrentUserArtist.value
        })
      }
    })

    if (annotation) {
      annotation.drawing = {
        objects: fabricCanvas.value._objects.map(obj => {
          const result = obj.serialize()
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
        const index = annotations.value.findIndex(a => a.time === currentTime)
        annotations.value.splice(index, 1)
      }
    } else {
      if (!annotations.value || !annotations.value.push) annotations.value = []
      store.commit('ADD_ANNOTATION', {
        annotations: annotations.value,
        annotation: {
          time: Math.max(currentTime, 0),
          frame: Math.max(currentFrame, 0),
          drawing: {
            objects: fabricCanvas.value._objects.map(obj => obj.serialize())
          }
        }
      })
    }
    updateAnnotationsInStore()
    const result = []
    annotations.value.forEach(a => result.push({ ...a }))
    return result
  }

  const updateAnnotationsInStore = () => {
    const preview = currentPreview()
    if (preview) {
      store.commit('UPDATE_PREVIEW_ANNOTATION', {
        taskId: preview.task_id,
        preview: preview,
        annotations: annotations.value
      })
    }
  }

  // Loading

  const loadSingleAnnotation = (annotation, canvas = null) => {
    annotation.drawing.objects.forEach(obj => {
      addObjectToCanvas(annotation, obj, canvas)
    })
  }

  const loadSingleAnnotationComparison = annotation => {
    annotation.drawing.objects.forEach(obj => {
      addObjectToCanvas(annotation, obj, fabricCanvasComparison.value)
    })
  }

  const addObjectToCanvas = async (annotation, obj, canvas = null) => {
    if (!obj) return
    if (getObjectById(obj.id) && !canvas) return
    if (!canvas) canvas = fabricCanvas.value
    let path, shape, text, psstroke
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
      editable: !isCurrentUserArtist.value,
      selectable: !isCurrentUserArtist.value
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
      addSerialization(path)
      path.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        bl: false,
        br: !isCurrentUserArtist.value,
        tl: false,
        tr: false,
        mtr: !isCurrentUserArtist.value
      })
      silentAnnotation = true
      canvas.add(path)
      silentAnnotation = false
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
      addSerialization(text)
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
      silentAnnotation = true
      canvas.add(text)
      silentAnnotation = false
    } else if (obj.type === 'PSStroke') {
      if (obj.canvasWidth) {
        let strokeMultiplier = canvasWidth / canvas.width
        if (canvas.width < 420) strokeMultiplier /= 2
        psstroke = await deserializePSBrush(obj)
        psstroke.set('id', obj.id)
        psstroke.set('strokeWidth', obj.strokeWidth * strokeMultiplier)
        psstroke.set('canvasWidth', canvasWidth)
        psstroke.set('canvasHeight', canvasHeight)
        psstroke.set('scaleX', obj.scaleX * scaleMultiplierX)
        psstroke.set('scaleY', obj.scaleY * scaleMultiplierY)
        psstroke.set('left', obj.left * scaleMultiplierX)
        psstroke.set('top', obj.top * scaleMultiplierY)
        psstroke.set('radius', obj.radius)
        psstroke.set('width', obj.width)
        psstroke.set('height', obj.height)
        psstroke.set('scaleX', obj.scaleX * scaleMultiplierX)
        psstroke.set('scaleY', obj.scaleY * scaleMultiplierY)
        psstroke.set('angle', obj.angle)
        psstroke.set('scale', obj.scale)
        psstroke.set('editable', !isCurrentUserArtist.value)
        psstroke.set('selectable', !isCurrentUserArtist.value)
        addSerialization(psstroke)
        psstroke.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: !isCurrentUserArtist.value,
          tl: false,
          tr: false,
          mtr: !isCurrentUserArtist.value
        })
        silentAnnotation = true
        canvas.add(psstroke)
        silentAnnotation = false
      }
    } else if (
      obj.type === 'rect' ||
      obj.type === 'circle' ||
      obj.type === 'arrow'
    ) {
      // Reuse the shared shape rebuilder for rect / circle / arrow. It
      // returns the shape with selectable/evented off (the read-only
      // shape contract), so we flip them back on to match the path
      // flow — studio users can scale and rotate shapes.
      shape = await buildReadOnlyShape(annotation, obj, canvas)
      if (shape) {
        shape.set('id', obj.id)
        shape.set('canvasWidth', canvasWidth)
        shape.set('canvasHeight', canvasHeight)
        shape.set('selectable', !isCurrentUserArtist.value)
        shape.set('evented', true)
        shape.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: !isCurrentUserArtist.value,
          tl: false,
          tr: false,
          mtr: !isCurrentUserArtist.value
        })
        addSerialization(shape)
        silentAnnotation = true
        canvas.add(shape)
        silentAnnotation = false
      }
    }
    return path || text || psstroke || shape
  }

  const deserializePSBrush = obj => {
    return new Promise((resolve, reject) => {
      PSStroke.fromObject(obj, function (psstroke) {
        if (psstroke) {
          resolve(psstroke)
        } else {
          reject(new Error('Failed to deserialize PSStroke'))
        }
      })
    })
  }

  // Events

  const onChangePencilColor = color => {
    pencilColor.value = color
    _resetColor()
    localPreferences.setPreference('player:pencil-color', pencilColor.value)
  }

  const onChangePencilWidth = pencil => {
    pencilWidth.value = pencil
    _resetPencil()
    localPreferences.setPreference('player:pencil-width', pencilWidth.value)
  }

  const onChangeTextColor = newValue => {
    textColor.value = newValue
    localPreferences.setPreference('player:text-color', textColor.value)
  }

  const _resetColor = () => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.freeDrawingBrush.color = pencilColor.value
  }

  const _resetPencil = () => {
    if (!fabricCanvas.value) return
    const converter = {
      huge: 15,
      big: 10,
      medium: 5,
      small: 2,
      tiny: 1
    }
    const strokeWidth = converter[pencilWidth.value]
    fabricCanvas.value.freeDrawingBrush.width = strokeWidth
  }

  const resetPencilConfiguration = () => {
    pencilColor.value =
      localPreferences.getPreference('player:pencil-color') || '#ff3860'
    textColor.value =
      localPreferences.getPreference('player:text-color') || '#ff3860'
    pencilWidth.value =
      localPreferences.getPreference('player:pencil-width') || 'big'

    _resetColor()
    _resetPencil()
  }

  // Drawing config

  const onAnnotateClicked = () => {
    showCanvas()
    if (fabricCanvas.value.isDrawingMode) {
      fabricCanvas.value.isDrawingMode = false
    } else {
      if (fabricCanvas.value) {
        fabricCanvas.value.isDrawingMode = true
      }
      const brush = new PSBrush(fabricCanvas.value)
      brush.pressureManager.fallback = 0.5
      lockBrushToFirstPointer(brush)
      fabricCanvas.value.freeDrawingBrush = brush
      _resetColor()
      _resetPencil()
    }
  }

  const onObjectAdded = obj => {
    if (silentAnnotation) return
    let o = obj.target ? obj.target : obj.targets[0]
    o = setObjectData(o)
    if (isLaserModeOn.value) {
      // Laser strokes fade out locally and are broadcast as ephemeral
      // events; they are intentionally not added to the additions stack.
      fadeObject(o)
      postAnnotationAddition(getCurrentTime(), o.serialize())
    } else {
      addToAdditions(o)
      stackAddAction(obj)
    }
  }

  const onObjectModified = event => {
    const movedObject = event.target
    if (!movedObject._objects) {
      addToUpdates(movedObject)
      saveAnnotationsCb()
      addSerialization(movedObject)
    } else {
      const group = movedObject
      group._objects.forEach(groupObj => {
        const canvasObj = getObjectById(groupObj.id)
        setObjectData(canvasObj)
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
        addToUpdatesSerializedObject(targetObj)
      })
      saveAnnotationsCb()
    }
  }

  const onWindowsClosed = event => {
    if (notSaved.value) {
      const confirmationMessage = 'Your annotations are not saved yet.'
      event.returnValue = confirmationMessage
      return confirmationMessage
    }
  }

  // Undo / Redo

  const stackAddAction = ({ target }) => {
    doneActionStack.push({ type: 'add', obj: target })
  }

  // After a canvas reload (e.g. Esc-exit fullscreen) the stack entry
  // holds a stale fabric.Object that's no longer on the live canvas;
  // look it up by id. Groups (_objects) aren't on the canvas as a
  // whole, fall back to the stored reference.
  const resolveActionObject = action => {
    if (action.obj?._objects) return action.obj
    return getObjectById(action.obj.id) ?? action.obj
  }

  const undoLastAction = () => {
    const action = doneActionStack.pop()
    if (!action?.obj) return
    const obj = resolveActionObject(action)
    // Snapshot length so the side-effect pushes addObject / deleteObject
    // make (object:added → stackAddAction for re-adds, per-child remove
    // for groups) are dropped before we move the action to the undone
    // stack — otherwise undo grows the done stack instead of shrinking it.
    const stackLengthBefore = doneActionStack.length
    if (action.type === 'add') {
      deleteObject(obj)
      removeFromAdditions(obj)
    } else if (action.type === 'remove') {
      // addObject's 'object:added' already fires addToAdditions; no
      // explicit call needed (it would double-record the addition).
      addObject(obj)
      removeFromDeletions(obj)
    }
    doneActionStack.length = stackLengthBefore
    undoneActionStack.push(action)
  }

  const redoLastAction = () => {
    const action = undoneActionStack.pop()
    if (!action?.obj) return
    const obj = resolveActionObject(action)
    const stackLengthBefore = doneActionStack.length
    if (action.type === 'add') {
      addObject(obj)
    } else if (action.type === 'remove') {
      deleteObject(obj)
    }
    doneActionStack.length = stackLengthBefore
    doneActionStack.push(action)
  }

  const clearUndoneStack = () => {
    undoneActionStack.length = 0
  }

  // Canvas management

  const deleteAllAnnotations = () => {
    fabricCanvas.value._objects.forEach(deleteObject)
  }

  const clearAnnotationSelection = () => {
    const canvas = fabricCanvas.value
    if (canvas.activeObject) {
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const isAnnotationCanvas = () => {
    return !!fabricCanvas.value
  }

  const setAnnotationCanvasDimensions = (width, height) => {
    fabricCanvas.value.setDimensions({ width, height })
  }

  const setAnnotationDrawingMode = isDrawingMode => {
    if (isDrawingMode) isShapeMode.value = false
    fabricCanvas.value.isDrawingMode = isDrawingMode
  }

  const toggleShapeMode = () => {
    if (isShapeMode.value) {
      isShapeMode.value = false
      return
    }
    isShapeMode.value = true
    // Mutex with the freehand drawing mode owned by the composable.
    // Consumers (PreviewPlayer / PlaylistPlayer) own `isDrawing` /
    // `isTyping` refs and clear them via a watcher on `isShapeMode`.
    if (fabricCanvas.value) {
      fabricCanvas.value.isDrawingMode = false
    }
  }

  const setShapeTool = shape => {
    currentShape.value = shape
  }

  // Suppress object selection while shape mode is active so a mousedown
  // on an existing annotation starts a new shape instead of picking
  // that object. Restores normal interaction when the mode turns off
  // (including when the consumer flips the ref to enter pencil/type).
  watch(isShapeMode, active => {
    if (!fabricCanvas.value) return
    if (active) {
      fabricCanvas.value.isDrawingMode = false
      fabricCanvas.value.skipTargetFind = true
      fabricCanvas.value.selection = false
      fabricCanvas.value.discardActiveObject()
      fabricCanvas.value.requestRenderAll()
    } else {
      fabricCanvas.value.skipTargetFind = false
      fabricCanvas.value.selection = true
    }
  })

  const configureCanvas = () => {
    fabricCanvas.value.off('object:moved', onObjectModified)
    fabricCanvas.value.off('text:changed', onObjectModified)
    fabricCanvas.value.off('object:modified', onObjectModified)
    fabricCanvas.value.off('object:added', onObjectAdded)
    fabricCanvas.value.off('mouse:down', initializeMouseDrawing)
    fabricCanvas.value.off('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.off('mouse:move', updateMousePressure)
    fabricCanvas.value.off('mouse:up', endDrawing)
    fabricCanvas.value.off('mouse:up', onCanvasReleasedCb)
    fabricCanvas.value.on('object:moved', onObjectModified)
    fabricCanvas.value.on('object:modified', onObjectModified)
    fabricCanvas.value.on('text:changed', onObjectModified)
    fabricCanvas.value.on('object:added', onObjectAdded)
    fabricCanvas.value.on('erasing:end', onObjectAdded)
    fabricCanvas.value.on('mouse:down', initializeMouseDrawing)
    fabricCanvas.value.on('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.on('mouse:move', updateMousePressure)
    fabricCanvas.value.on('mouse:up', endDrawing)
    fabricCanvas.value.on('mouse:up', onCanvasReleasedCb)

    if (detachShapeDrawing) {
      detachShapeDrawing()
      detachShapeDrawing = null
    }
    detachShapeDrawing = attachShapeDrawing(fabricCanvas.value, {
      getTool: () => (isShapeMode.value ? currentShape.value : null),
      getColor: () => pencilColor.value,
      getWidth: () => SHAPE_WIDTHS[pencilWidth.value],
      onShapeStart: () => {
        // Suppress the object:added listener for the in-progress 1×1
        // shape; we'll add it to additions manually in onShapeAdded.
        silentAnnotation = true
      },
      onShapeAdded: shape => {
        silentAnnotation = false
        setObjectData(shape)
        // attachShapeDrawing creates the shape with selectable/evented
        // off so its drag-to-resize doesn't fight fabric's selection.
        // Once the shape is final we flip them back on (matching the
        // path flow) so the user can click to scale / rotate it.
        shape.set({
          selectable: !isCurrentUserArtist.value,
          evented: true
        })
        shape.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: !isCurrentUserArtist.value,
          tl: false,
          tr: false,
          mtr: !isCurrentUserArtist.value
        })
        addToAdditions(shape)
        stackAddAction({ target: shape })
        // Push the shape into annotations.value (and trigger the
        // backend save). The pencil flow gets this from `endDrawing`
        // via the canvas's mouse:up handler, but `endDrawing` only
        // fires when isDrawingMode is on — which it isn't in shape
        // mode. Without this call the shape lives only in `additions`
        // and disappears on the next canvas reload (frame change /
        // fullscreen toggle) because getAnnotation() can't find it.
        saveAnnotationsCb()
      }
    })

    fabricCanvas.value.freeDrawingBrush.color = pencilColor.value
    fabricCanvas.value.freeDrawingBrush.width = 4

    fabric.Group.prototype._controlsVisibility = {
      tl: false,
      tr: false,
      br: !isCurrentUserArtist.value,
      bl: false,
      ml: false,
      mr: false,
      mb: false,
      mt: false
    }
    return fabricCanvas.value
  }

  // Mouse pressure

  const initializeMouseDrawing = () => {
    if (
      mouseIsDrawing.value === false &&
      fabricCanvas.value?.isDrawingMode &&
      fabricCanvas.value.freeDrawingBrush
    ) {
      mouseIsDrawing.value = true
      mouseDrawingStartTime.value = Date.now()
      mouseDrawingPrevPoint.value = fabricCanvas.value.getPointer()
      mouseDrawingPrevPressure.value = fabricCanvas.value.freeDrawingBrush
        ? fabricCanvas.value.freeDrawingBrush.pressureManager.fallback
        : mouseDrawingMaxPressure.value
    }
  }

  const getCanvasRelativePointDrawingDifference = (p1, p2, canvas) => {
    const dimensions = new fabric.Point(canvas.getWidth(), canvas.getHeight())
    const p1_rel = p1.divide(dimensions)
    const p2_rel = p2.divide(dimensions)
    return Math.sqrt(
      Math.pow(Math.abs(p1_rel.x - p2_rel.x), 1) +
        Math.pow(Math.abs(p1_rel.y - p2_rel.y), 1)
    )
  }

  const updateMousePressure = () => {
    if (
      fabricCanvas.value?.isDrawingMode &&
      fabricCanvas.value.freeDrawingBrush &&
      mouseIsDrawing.value
    ) {
      let pressure
      if (mouseDrawingPressureMode.value === 'fade') {
        const delta_time = Date.now() - mouseDrawingStartTime.value
        const t = delta_time / mouseDrawingFadeTime.value
        pressure = Math.max(
          (1 - t) * mouseDrawingMaxPressure.value +
            t * mouseDrawingMinPressure.value,
          mouseDrawingMinPressure.value
        )
      } else if (
        mouseDrawingPressureMode.value === 'distance' &&
        mouseDrawingPrevPoint.value
      ) {
        let delta_dist = getCanvasRelativePointDrawingDifference(
          mouseDrawingPrevPoint.value,
          fabricCanvas.value.getPointer(),
          fabricCanvas.value
        )
        delta_dist *= 50
        if (!mouseDrawingDynamicDistanceMult.value) {
          if (delta_dist < 1.8) {
            mouseDrawingDynamicDistanceMult.value = Math.min(
              delta_dist * delta_dist,
              1.5
            )
          } else {
            mouseDrawingDynamicDistanceMult.value = 1
          }
        }
        delta_dist *= mouseDrawingDynamicDistanceMult.value
        pressure = Math.min(
          mouseDrawingDistanceFalloff.value / delta_dist,
          mouseDrawingMaxPressure.value
        )
      } else {
        pressure = 0.5
      }
      const clamped_pressure = Math.max(
        mouseDrawingPrevPressure.value - mouseDrawingMaxChangeRate.value,
        Math.min(
          pressure,
          mouseDrawingPrevPressure.value + mouseDrawingMaxChangeRate.value
        )
      )
      mouseDrawingPrevPoint.value = fabricCanvas.value.getPointer()
      mouseDrawingPrevPressure.value = clamped_pressure
      fabricCanvas.value.freeDrawingBrush.pressureManager.fallback =
        clamped_pressure
    }
  }

  const endDrawing = () => {
    if (fabricCanvas.value?.isDrawingMode) {
      if (mouseIsDrawing.value) {
        mouseIsDrawing.value = false
        mouseDrawingStartTime.value = null
        mouseDrawingPrevPoint.value = null
        mouseDrawingDynamicDistanceMult.value = null
        fabricCanvas.value.freeDrawingBrush.pressureManager.fallback =
          mouseDrawingMaxPressure.value
      }
      clearUndoneStack()
      if (!isLaserModeOn.value) {
        saveAnnotationsCb()
      }
    }
  }

  const isEmptyCanvas = () => {
    if (fabricCanvas.value) {
      return fabricCanvas.value.getObjects().length === 0
    }
    return true
  }

  // fabric instances created on a canvas DOM element whose 2D context
  // hasn't been initialised yet (mostly under HMR / when the wrapper is
  // hidden at mount) end up with contextContainer === null. Touch them
  // and we crash inside fabric.clearContext.
  const isFabricReady = canvas => Boolean(canvas?.contextContainer)

  const clearCanvas = () => {
    endAnnotationSaving()
    if (isFabricReady(fabricCanvas.value)) {
      fabricCanvas.value.clear()
    }
    clearComparisonCanvas()
  }

  const clearComparisonCanvas = () => {
    if (isFabricReady(fabricCanvasComparison.value)) {
      fabricCanvasComparison.value.clear()
    }
  }

  // Clipboard

  const copyAnnotations = () => {
    if (!fabricCanvas.value) return
    const activeObject = fabricCanvas.value.getActiveObject()
    if (!activeObject) return
    if (activeObject._objects) {
      clipboard.copyAnnotations({
        mainObject: activeObject,
        subObjects: [...activeObject._objects]
      })
    } else {
      clipboard.copyAnnotations({
        mainObject: Object.create(activeObject),
        subObjects: []
      })
    }
    return activeObject
  }

  const pasteAnnotations = () => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.discardActiveObject()
    const { mainObject, subObjects } = clipboard.pasteAnnotations()
    if (subObjects?.length > 0) {
      subObjects.forEach(obj => {
        obj = applyGroupChanges(mainObject, obj)
        obj.group = null
        addObject(obj)
      })
      fabricCanvas.value.requestRenderAll()
    } else if (mainObject) {
      addObject(mainObject)
      fabricCanvas.value.setActiveObject(mainObject)
      fabricCanvas.value.requestRenderAll()
    }
  }

  const applyGroupChanges = (group, obj) => {
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
  }

  const fadeObject = obj => {
    if (!obj) return
    obj.animate('opacity', '0', {
      duration: 1500,
      onChange: fabricCanvas.value.renderAll.bind(fabricCanvas.value),
      onComplete: () => {
        fabricCanvas.value.remove(obj)
      }
    })
  }

  // Saving

  const markLastAnnotationTime = () => {
    const time = moment().add(2, 'hour').add(6, 'seconds')
    lastAnnotationTime.value = formatFullDate(time).replace(' ', 'T')
  }

  const startAnnotationSaving = (preview, _annotations) => {
    notSaved.value = true
    // markRaw skips Vue's deep proxy on the preview / fabric.Object
    // refs the payload eventually carries — the parent emits this
    // straight to a Vuex action that doesn't need reactivity.
    annotatedPreview = markRaw(preview)
    annotationToSave = setTimeout(() => {
      endAnnotationSaving()
    }, 3000)
  }

  const endAnnotationSaving = () => {
    if (notSaved.value) {
      const preview = annotatedPreview
      pendingSave = markRaw({
        preview,
        additions: [...additions.value],
        updates: [...updates.value],
        deletions: [...deletions.value]
      })
      clearModifications()
      clearTimeout(annotationToSave)
      notSaved.value = false
      emit('annotation-changed', pendingSave)
    }
  }

  // Called by the parent component once the Vuex save action has resolved
  // successfully. Drops the in-flight buffer; if drawings accumulated in
  // the active arrays during the round-trip, flush them immediately rather
  // than wait for another debounce cycle.
  const confirmAnnotationsSaved = () => {
    pendingSave = null
    if (
      additions.value.length > 0 ||
      updates.value.length > 0 ||
      deletions.value.length > 0
    ) {
      notSaved.value = true
      endAnnotationSaving()
    }
  }

  // Called by the parent component when the Vuex save action rejects.
  // Pre-pends the in-flight items back to the head of the active arrays
  // (so they take priority over anything drawn since), flips notSaved back
  // on and schedules a retry with a longer backoff.
  const restoreFailedAnnotations = () => {
    if (!pendingSave) return
    additions.value = [...pendingSave.additions, ...additions.value]
    updates.value = [...pendingSave.updates, ...updates.value]
    deletions.value = [...pendingSave.deletions, ...deletions.value]
    pendingSave = null
    notSaved.value = true
    clearTimeout(annotationToSave)
    annotationToSave = setTimeout(() => {
      endAnnotationSaving()
    }, 5000)
  }

  // Render whatever is currently on the live fabric canvas onto the
  // target canvas, scaling strokes to match the target dimensions.
  // Destructive: the objects are moved out of the live canvas (callers
  // who need the live canvas restored afterwards should reload it).
  const compositeLiveAnnotationsOntoCanvas = canvas => {
    return new Promise(resolve => {
      const context = canvas.getContext('2d')
      const scaleRatio = canvas.width / fabricCanvas.value.width
      const tmpSource = document.getElementById('resize-annotation-canvas')
      const tmpCanvas = new fabric.Canvas('resize-annotation-canvas', {
        width: canvas.width,
        height: canvas.height
      })
      fabricCanvas.value.getObjects().forEach(obj => {
        if (obj._objects) {
          obj._objects.forEach(obj => {
            tmpCanvas.add(obj)
            obj.strokeWidth = obj.strokeWidth / scaleRatio
          })
        } else {
          tmpCanvas.add(obj)
          obj.strokeWidth = obj.strokeWidth / scaleRatio
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
    })
  }

  // Per-annotation composite for video: clear and reload only the
  // requested annotation onto the live canvas before compositing, so a
  // caller iterating frame-by-frame gets one PNG per annotation.
  const copyAnnotationCanvas = (canvas, annotation) => {
    return new Promise(resolve => {
      clearCanvas()
      loadSingleAnnotation(annotation)
      setTimeout(() => {
        compositeLiveAnnotationsOntoCanvas(canvas).then(resolve)
      }, 100)
    })
  }

  // Helpers (were from domMixin, used internally by addText)
  const getClientX = event =>
    event.touches?.[0]?.clientX ??
    event.changedTouches?.[0]?.clientX ??
    event.clientX

  const getClientY = event =>
    event.touches?.[0]?.clientY ??
    event.changedTouches?.[0]?.clientY ??
    event.clientY

  const showCanvas = () => {
    if (canvasWrapper.value) {
      canvasWrapper.value.style.display = 'block'
    }
  }

  // Helper to get the current preview (needed by updateAnnotationsInStore)
  let currentPreview = () => null
  const setCurrentPreviewGetter = getter => {
    currentPreview = getter
  }

  // Mirror the canvas instances from the AnnotationCanvas components.
  // flush: 'sync' is critical: the parent's onMounted may immediately
  // try to load annotations into the canvases, so we cannot wait for
  // Vue's default microtask flush to propagate the assignment.
  // configureCanvas is called whenever the main canvas becomes
  // available so its event handlers are wired without parent
  // involvement. The watches are set up after every function is
  // declared to avoid TDZ when a caller mounts with an already-
  // resolved canvas ref (immediate + flush: 'sync' fires the
  // callback synchronously during initialization).
  if (mainCanvasComponent) {
    watch(
      () => mainCanvasComponent.value?.canvas || null,
      canvas => {
        fabricCanvas.value = canvas
        if (canvas) configureCanvas()
      },
      { immediate: true, flush: 'sync' }
    )
  }
  if (comparisonCanvasComponent) {
    watch(
      () => comparisonCanvasComponent.value?.canvas || null,
      canvas => {
        fabricCanvasComparison.value = canvas
      },
      { immediate: true, flush: 'sync' }
    )
  }

  return {
    // State
    fabricCanvas,
    fabricCanvasComparison,
    lastAnnotationTime,
    additions,
    deletions,
    updates,
    notSaved,
    pencilColor,
    pencilWidth,
    textColor,

    // Objects
    findAnnotation,
    getObjectById,
    addSerialization,
    setObjectData,
    addObject,
    addText,
    addTypeArea,
    removeTypeArea,

    // Object management
    deleteSelection,
    deleteObject,
    removeObjectFromCanvas,
    updateObjectInCanvas,

    // Modifications
    addToAdditions,
    removeFromAdditions,
    addToDeletions,
    removeFromDeletions,
    addToUpdates,
    addToUpdatesSerializedObject,
    clearModifications,
    printModificationStats,
    isWriting,

    // Annotations
    getNewAnnotations,
    updateAnnotationsInStore,
    loadSingleAnnotation,
    loadSingleAnnotationComparison,
    addObjectToCanvas,

    // Events
    onChangePencilColor,
    onChangePencilWidth,
    onChangeTextColor,
    _resetColor,
    _resetPencil,
    resetPencilConfiguration,
    onAnnotateClicked,
    onObjectAdded,
    onObjectModified,
    onWindowsClosed,

    // Undo / Redo
    resetUndoStacks,
    stackAddAction,
    undoLastAction,
    redoLastAction,
    clearUndoneStack,

    // Canvas management
    deleteAllAnnotations,
    clearAnnotationSelection,
    isAnnotationCanvas,
    setAnnotationCanvasDimensions,
    setAnnotationDrawingMode,
    configureCanvas,

    // Shape mode
    currentShape,
    isShapeMode,
    setShapeTool,
    toggleShapeMode,

    // Mouse pressure
    initializeMouseDrawing,
    getCanvasRelativePointDrawingDifference,
    updateMousePressure,
    endDrawing,

    // Canvas
    isEmptyCanvas,
    clearCanvas,
    clearComparisonCanvas,
    copyAnnotations,
    pasteAnnotations,
    applyGroupChanges,
    fadeObject,

    // Saving
    markLastAnnotationTime,
    startAnnotationSaving,
    endAnnotationSaving,
    confirmAnnotationsSaved,
    restoreFailedAnnotations,
    copyAnnotationCanvas,
    compositeLiveAnnotationsOntoCanvas,

    // Setter for component-specific callbacks
    setCurrentPreviewGetter
  }
}
