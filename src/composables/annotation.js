/*
 * Composable for annotation canvas management. It's aimed at preview widgets.
 * Converted from the annotation mixin for use in Composition API components.
 */
import { fabric } from 'fabric'
import moment from 'moment'
import { PSStroke, PSBrush } from 'fabricjs-psbrush'
import { v4 as uuidv4 } from 'uuid'
import { computed, markRaw, ref } from 'vue'

import clipboard from '@/lib/clipboard'
import { formatFullDate } from '@/lib/time'
import localPreferences from '@/lib/preferences'

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
 * @param {import('vue').Ref} options.annotationCanvas - template ref for the annotation canvas element
 * @param {import('vue').Ref} options.canvasWrapper - template ref for the canvas wrapper element
 * @param {import('vue').Ref} options.annotations - reactive ref for annotations array
 * @param {import('vue').ComputedRef} options.isCurrentUserArtist - computed ref for artist check
 * @param {import('vue').ComputedRef} options.userId - computed ref for user id
 * @param {Object} options.store - Vuex store instance
 * @param {Function} options.emit - component emit function
 * @param {Function} options.getCurrentTime - callback to get current time
 * @param {Function} options.getCurrentFrame - callback to get current frame
 * @param {Function} options.saveAnnotationsCb - callback for saving annotations
 * @param {Function} options.loadAnnotationCb - callback for loading annotations
 * @param {Function} options.onCanvasMouseMovedCb - callback for canvas mouse moved
 * @param {Function} options.onCanvasReleasedCb - callback for canvas mouse released
 */
export const useAnnotation = ({
  annotationCanvas,
  canvasWrapper,
  annotations,
  isCurrentUserArtist,
  userId,
  store,
  emit,
  getCurrentTime,
  getCurrentFrame,
  saveAnnotationsCb,
  loadAnnotationCb,
  onCanvasMouseMovedCb,
  onCanvasReleasedCb
}) => {
  // Reactive state
  const fabricCanvas = ref(null)
  const fabricCanvasComparison = ref(null)
  const lastAnnotationTime = ref('')
  const additions = ref([])
  const deletions = ref([])
  const updates = ref([])
  const isShowingPalette = ref(false)
  const isShowingPencilPalette = ref(false)
  const notSaved = ref(false)
  const pencilColor = ref('#ff3860')
  const pencilWidth = ref('big')
  const textColor = ref('#ff3860')
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
  let doneActionStack = []
  let undoneActionStack = []
  let silentAnnotation = false
  let annotatedPreview = null
  let annotationToSave = null
  let pendingSave = null

  // Computed
  const annotationCanvasEl = computed(() => annotationCanvas.value)

  // Init
  const resetUndoStacks = () => {
    doneActionStack = []
    undoneActionStack = []
  }
  resetUndoStacks()

  // Objects

  const findAnnotation = (list, time) => {
    return list.find(a => a.time < time + 0.0001 && a.time > time - 0.0001)
  }

  const getObjectById = objectId => {
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
    if (object.set) {
      if (!object.id) object.set('id', uuidv4())
      object.set('canvasWidth', fabricCanvas.value.width)
      object.set('canvasHeight', fabricCanvas.value.height)
      if (!object.createdBy) object.set('createdBy', userId.value)
    } else {
      if (!object.id) object.id = uuidv4()
      object.canvasWidth = fabricCanvas.value.width
      object.canvasHeight = fabricCanvas.value.height
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
      activeObject._objects.forEach(obj => {
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

  const postAnnotationAddition = (_currentTime, _obj) => {
    // Aimed at being supercharged
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

  const postAnnotationDeletion = (_currentTime, _obj) => {
    // Aimed at being supercharged
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

  const postAnnotationUpdate = (_currentTime, _obj) => {
    // Aimed at being supercharged
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
    let path, text, psstroke
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
    }
    return path || text || psstroke
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

  const onPickPencilWidth = () => {
    isShowingPencilPalette.value = !isShowingPencilPalette.value
  }

  const onPickPencilColor = () => {
    isShowingPalette.value = !isShowingPalette.value
  }

  const onPickTextColor = () => {
    isShowingPalette.value = !isShowingPalette.value
  }

  const onChangePencilColor = color => {
    pencilColor.value = color
    _resetColor()
    isShowingPalette.value = false
    localPreferences.setPreference('player:pencil-color', pencilColor.value)
  }

  const onChangePencilWidth = pencil => {
    pencilWidth.value = pencil
    _resetPencil()
    isShowingPalette.value = false
    localPreferences.setPreference('player:pencil-width', pencilWidth.value)
  }

  const onChangeTextColor = newValue => {
    textColor.value = newValue
    isShowingPalette.value = false
    localPreferences.setPreference('player:text-color', textColor.value)
  }

  const _resetColor = () => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.freeDrawingBrush.color = pencilColor.value
  }

  const _resetPencil = () => {
    if (!fabricCanvas.value) return
    const converter = {
      big: 10,
      medium: 5,
      small: 2
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
      fabricCanvas.value.freeDrawingBrush = brush
      brush.pressureManager.fallback = 0.5
      _resetColor()
      _resetPencil()
    }
  }

  const onObjectAdded = obj => {
    if (silentAnnotation) return
    let o = obj.target ? obj.target : obj.targets[0]
    o = setObjectData(o)
    addToAdditions(o)
    stackAddAction(obj)
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
    target.lockScalingX = true
    target.lockScalingY = true
    target.rotation = true
  }

  const undoLastAction = () => {
    const action = doneActionStack.pop()
    if (action && action.obj) {
      if (action.type === 'add') {
        deleteObject(action.obj)
        removeFromAdditions(action.obj)
      } else if (action.type === 'remove') {
        addObject(action.obj)
        addToAdditions(action.obj)
        removeFromDeletions(action.obj)
      }
      doneActionStack.pop()
      undoneActionStack.push(action)
    }
  }

  const redoLastAction = () => {
    const action = undoneActionStack.pop()
    if (action) {
      if (action.type === 'add') {
        addObject(action.obj)
      } else if (action.type === 'remove') {
        deleteObject(action.obj)
      }
    }
  }

  const clearUndoneStack = () => {
    undoneActionStack = []
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

  const resizeAnnotations = () => {
    resetCanvas().then(() => {
      reloadAnnotationsCb()
      loadAnnotationCb()
    })
  }

  const resetCanvas = () => {
    clearCanvas()
    return resetCanvasSize().then(() => {
      if (fabricCanvas.value) fabricCanvas.value.renderAll()
      resetCanvasVisibility()
      return fabricCanvas.value
    })
  }

  const resetCanvasVisibility = () => {
    if (canvasWrapper.value) {
      canvasWrapper.value.style.display = 'block'
    }
  }

  const isAnnotationCanvas = () => {
    return !!fabricCanvas.value
  }

  const setAnnotationCanvasDimensions = (width, height) => {
    fabricCanvas.value.setDimensions({ width, height })
  }

  const setAnnotationDrawingMode = isDrawingMode => {
    fabricCanvas.value.isDrawingMode = isDrawingMode
  }

  const setupFabricCanvasMixin = () => {
    if (!annotationCanvasEl.value) return

    const canvasId = annotationCanvasEl.value.id

    fabricCanvas.value = markRaw(
      new fabric.Canvas(canvasId, {
        fireRightClick: true
      })
    )
    fabricCanvas.value.setDimensions({
      width: 100,
      height: 100
    })
    if (!fabricCanvas.value.freeDrawingBrush) {
      const brush = new PSBrush(fabricCanvas.value)
      fabricCanvas.value.freeDrawingBrush = brush
    }
    configureCanvas()
    return fabricCanvas.value
  }

  const configureCanvas = () => {
    fabricCanvas.value.off('object:moved', onObjectModified)
    fabricCanvas.value.off('text:changed', onObjectModified)
    fabricCanvas.value.off('object:modified', onObjectModified)
    fabricCanvas.value.off('object:added', onObjectAdded)
    fabricCanvas.value.off('mouse:down', onCanvasClickedInternal)
    fabricCanvas.value.off('mouse:down', initalizeMouseDrawing)
    fabricCanvas.value.off('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.off('mouse:move', updateMousePressure)
    fabricCanvas.value.off('mouse:up', endDrawing)
    fabricCanvas.value.off('mouse:up', onCanvasReleasedCb)
    fabricCanvas.value.off('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.off('mouse:down', onCanvasClickedInternal)
    fabricCanvas.value.on('object:moved', onObjectModified)
    fabricCanvas.value.on('object:modified', onObjectModified)
    fabricCanvas.value.on('text:changed', onObjectModified)
    fabricCanvas.value.on('object:added', onObjectAdded)
    fabricCanvas.value.on('erasing:end', onObjectAdded)
    fabricCanvas.value.on('mouse:down', onCanvasClickedInternal)
    fabricCanvas.value.on('mouse:down', initalizeMouseDrawing)
    fabricCanvas.value.on('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.on('mouse:move', updateMousePressure)
    fabricCanvas.value.on('mouse:up', endDrawing)
    fabricCanvas.value.on('mouse:up', onCanvasReleasedCb)
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
    fabric.Group.prototype.hasControls = true
    return fabricCanvas.value
  }

  const onCanvasClickedInternal = event => {
    // This is the canvas click handler registered on the fabric canvas
    // Different from the template @click handler
  }

  // Mouse pressure

  const initalizeMouseDrawing = () => {
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
      saveAnnotationsCb()
    }
  }

  const isEmptyCanvas = () => {
    if (fabricCanvas.value) {
      return fabricCanvas.value.getObjects().length === 0
    }
    return true
  }

  const clearCanvas = () => {
    endAnnotationSaving()
    if (fabricCanvas.value) {
      fabricCanvas.value.clear()
    }
    if (fabricCanvasComparison.value) {
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
    annotatedPreview = preview
    annotationToSave = setTimeout(() => {
      endAnnotationSaving()
    }, 3000)
  }

  const endAnnotationSaving = () => {
    if (notSaved.value) {
      const preview = annotatedPreview
      pendingSave = {
        preview,
        additions: [...additions.value],
        updates: [...updates.value],
        deletions: [...deletions.value]
      }
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

  const copyAnnotationCanvas = (canvas, annotation) => {
    return new Promise(resolve => {
      clearCanvas()
      loadSingleAnnotation(annotation)
      setTimeout(() => {
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

  // Placeholder for resetCanvasSize (component-specific)
  let resetCanvasSize = () => Promise.resolve()
  const setResetCanvasSize = fn => {
    resetCanvasSize = fn
  }

  // Placeholder for reloadAnnotations callback in resizeAnnotations
  let reloadAnnotationsCb = () => {}
  const setReloadAnnotationsCb = fn => {
    reloadAnnotationsCb = fn
  }

  return {
    // State
    fabricCanvas,
    fabricCanvasComparison,
    lastAnnotationTime,
    additions,
    deletions,
    updates,
    isShowingPalette,
    isShowingPencilPalette,
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
    onPickPencilWidth,
    onPickPencilColor,
    onPickTextColor,
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
    resizeAnnotations,
    resetCanvas,
    resetCanvasVisibility,
    isAnnotationCanvas,
    setAnnotationCanvasDimensions,
    setAnnotationDrawingMode,
    setupFabricCanvas: setupFabricCanvasMixin,
    configureCanvas,

    // Mouse pressure
    initalizeMouseDrawing,
    getCanvasRelativePointDrawingDifference,
    updateMousePressure,
    endDrawing,

    // Canvas
    isEmptyCanvas,
    clearCanvas,
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

    // Setters for component-specific callbacks
    setCurrentPreviewGetter,
    setResetCanvasSize,
    setReloadAnnotationsCb
  }
}
