/*
 * Composable for annotation canvas management. It's aimed at preview widgets.
 * Converted from the annotation mixin for use in Composition API components.
 */
import {
  Group,
  IText,
  Path,
  Point,
  Text,
  getFabricDocument,
  util
} from 'fabric'
import { PSStroke } from 'fabricjs-psbrush'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { markRaw, ref, watch } from 'vue'

import { useDrawingTools } from '@/composables/players/drawingTools'
import {
  SHAPE_WIDTHS,
  addSerialization,
  attachShapeDrawing,
  buildReadOnlyShape,
  deserializePSStroke,
  getAnnotationContainMapping
} from '@/lib/players/annotation'
import { normalizeType } from '@/lib/players/annotationTypes'
import {
  Eraser,
  hasVisiblePixels,
  reviveObjectEraser
} from '@/lib/players/eraserbrush'
import clipboard from '@/lib/clipboard'
import func from '@/lib/func'
import { formatFullDate } from '@/lib/time'
import localPreferences from '@/lib/preferences'

/* Force scaling / rotation handles to show on grouped selections so a
 * marquee around several annotations stays scalable / rotatable. */
Group.prototype.hasControls = true

/* Monkey patch needed to have text background including the padding.
 * MUST stay on Text.prototype (IText inherits it) — putting it on
 * FabricObject.prototype applied the padding-inflated dimensions to every
 * shape and rendered them stretched. */
Text.prototype._getNonTransformedDimensions = function () {
  // Object dimensions
  return new Point(this.width, this.height).scalarAdd(this.padding || 0)
}
Text.prototype._calculateCurrentDimensions = function () {
  // Controls dimensions
  return util.transformPoint(
    this._getTransformedDimensions(),
    this.getViewportTransform(),
    true
  )
}

if (PSStroke) {
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
      return new Point(this.left, this.top)
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
 * @param {Function} [options.getAdditionalPreviews] - extra store previews
 *   that mirror the current one and must receive the same annotations
 *   (playlist revision copies). Returns `[{ taskId, preview }]` pairs.
 */
export const useAnnotation = ({
  mainCanvasComponent,
  comparisonCanvasComponent,
  onionCanvasComponent,
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
  isEraserModeOn = ref(false),
  postAnnotationAddition = () => {},
  postAnnotationDeletion = () => {},
  postAnnotationUpdate = () => {},
  getAdditionalPreviews = () => []
}) => {
  // Canvas instances are owned by AnnotationCanvas components; we
  // mirror them into local refs through watchers so internal code
  // can keep treating fabricCanvas / fabricCanvasComparison as
  // writable refs.
  const fabricCanvas = ref(null)
  const fabricCanvasComparison = ref(null)
  const fabricCanvasOnion = ref(null)
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
  // Bumped on every comparison-canvas clear so an in-flight async load can tell
  // it was superseded and stop repopulating a canvas meant to be cleared.
  let comparisonLoadToken = 0
  let mainLoadToken = 0
  let onionLoadToken = 0
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
      if (!object.createdAt) object.set('createdAt', new Date().toISOString())
    } else {
      if (!object.id) object.id = uuidv4()
      if (!object.canvasWidth) object.canvasWidth = fabricCanvas.value.width
      if (!object.canvasHeight) object.canvasHeight = fabricCanvas.value.height
      if (!object.createdBy) object.createdBy = userId.value
      if (!object.createdAt) object.createdAt = new Date().toISOString()
    }
    addSerialization(object)
    return object
  }

  // add() fires object:added whose handler stacks the action already;
  // drop that entry (and only that one — the laser branch stacks
  // nothing) so addObject's explicit push stays the single one.
  const popOwnAddEntry = obj => {
    const top = doneActionStack[doneActionStack.length - 1]
    if (top?.type === 'add' && top.obj === obj) doneActionStack.pop()
  }

  const addObject = (activeObject, persist = true) => {
    if (activeObject._objects) {
      activeObject._objects.forEach(obj => {
        fabricCanvas.value.add(obj)
        popOwnAddEntry(obj)
      })
    } else {
      fabricCanvas.value.add(activeObject)
      popOwnAddEntry(activeObject)
    }
    if (persist) {
      doneActionStack.push({
        type: 'add',
        obj: activeObject,
        time: getCurrentTime()
      })
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
    const fabricText = new IText('Type...', {
      left: posX,
      top: posY,
      erasable: false,
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
    const originalInitHiddenTextarea = IText.prototype.initHiddenTextarea
    Object.assign(IText.prototype, {
      initHiddenTextarea: function () {
        originalInitHiddenTextarea.call(this)
        this.canvas.wrapperEl.appendChild(this.hiddenTextarea)
      }
    })
  }

  const removeTypeArea = () => {
    const originalInitHiddenTextarea = IText.prototype.initHiddenTextarea
    Object.assign(IText.prototype, {
      initHiddenTextarea: function () {
        originalInitHiddenTextarea.call(this)
        getFabricDocument().body.appendChild(this.hiddenTextarea)
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
        doneActionStack.push({ type: 'remove', obj, time: getCurrentTime() })
      })
    } else if (activeObject) {
      fabricCanvas.value.remove(activeObject)
      addToDeletions(activeObject)
      doneActionStack.push({
        type: 'remove',
        obj: activeObject,
        time: getCurrentTime()
      })
    }
    if (activeObject) clearUndoneOnUserAction()
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

  const removeFromUpdates = obj => {
    const currentTime = getCurrentTime()
    const updatesEntry = findAnnotation(updates.value, currentTime)
    if (updatesEntry) {
      updatesEntry.drawing.objects = updatesEntry.drawing.objects.filter(
        updatedObject => updatedObject.id !== obj.id
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

  const isWriting = date => {
    return lastAnnotationTime.value >= date
  }

  // Annotations

  // Serialize a selection child with its ABSOLUTE transform: serialize()
  // reads the group-relative state, and the previous manual compensations
  // wrote live-canvas pixels over the normalized result (wrong reference
  // frame whenever the canvas differs from the authored size) while
  // ignoring the group's scale and rotation entirely.
  const GROUP_TRANSFORM_KEYS = [
    'left',
    'top',
    'angle',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'flipX',
    'flipY'
  ]

  const serializeAbsolute = obj => {
    const group = obj.group
    if (!group) return obj.serialize()
    const saved = {}
    GROUP_TRANSFORM_KEYS.forEach(key => {
      saved[key] = obj[key]
    })
    const matrix = obj.calcTransformMatrix()
    obj.group = undefined
    util.applyTransformToObject(obj, matrix)
    const result = obj.serialize()
    obj.group = group
    obj.set(saved)
    obj.setCoords()
    return result
  }

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
      const canvasObjects = fabricCanvas.value._objects.map(obj => {
        const result = serializeAbsolute(obj)
        if (obj.group) result.group = null
        return result
      })
      // Fast navigation can run a save while this frame's previously-saved
      // objects are still being revived asynchronously onto the canvas.
      // Replacing the drawing with the canvas content would silently drop
      // them, so merge instead: the canvas version wins per object id, and
      // existing objects stay unless explicitly queued for deletion.
      const canvasIds = new Set(canvasObjects.map(o => o.id))
      const deletedIds = new Set(
        findAnnotation(deletions.value, currentTime)?.objects || []
      )
      const keptObjects = (annotation.drawing?.objects || []).filter(
        o => !canvasIds.has(o.id) && !deletedIds.has(o.id)
      )
      annotation.drawing = { objects: [...keptObjects, ...canvasObjects] }
      annotation.time = currentTime
      if (annotation.drawing.objects.length < 1) {
        const index = annotations.value.indexOf(annotation)
        if (index >= 0) annotations.value.splice(index, 1)
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
      store.dispatch('updatePreviewAnnotations', {
        preview,
        annotations: annotations.value,
        extraPreviews: getAdditionalPreviews()
      })
    }
  }

  // Loading

  const loadSingleAnnotation = async (annotation, canvas = null) => {
    // Adding PSStrokes is async, so load sequentially and bail if a clear
    // (fast navigation) superseded us — late adds otherwise repopulate a
    // canvas that was just cleared and get saved into the wrong frame. An
    // object whose async build was already in flight when the clear hit is
    // removed right after it lands.
    const token = mainLoadToken
    for (const obj of annotation.drawing.objects) {
      if (token !== mainLoadToken) return
      const built = await addObjectToCanvas(annotation, obj, canvas)
      if (token !== mainLoadToken) {
        if (built) (canvas || fabricCanvas.value).remove(built)
        return
      }
    }
  }

  const loadSingleAnnotationComparison = async annotation => {
    const canvas = fabricCanvasComparison.value
    // The comparison viewer mounts at 0x0 and only gets its real size once the
    // side-by-side layout settles. Painting before then places every object at
    // scale 0; onComparisonCanvasResized reloads once it has a size.
    if (!canvas || !canvas.width || !canvas.height) return
    // Adding PSStrokes / shapes is async, so load sequentially and bail if a
    // clear (or newer load) superseded us — otherwise late adds repopulate a
    // canvas that was just cleared, leaving an incomplete/garbled overlay.
    // Like the main-canvas path, an object whose async build was already in
    // flight when the clear hit is removed right after it lands.
    const token = comparisonLoadToken
    for (const obj of annotation.drawing.objects) {
      if (token !== comparisonLoadToken) return
      const built = await addObjectToCanvas(annotation, obj, canvas)
      if (token !== comparisonLoadToken) {
        if (built) canvas.remove(built)
        return
      }
    }
  }

  const addObjectToCanvas = async (annotation, obj, canvas = null) => {
    if (!obj) return
    if (getObjectById(obj.id) && !canvas) return
    if (!canvas) canvas = fabricCanvas.value
    let path, shape, text, psstroke
    // Tolerate Fabric v6 PascalCase types as well as the stored lowercase
    // form so annotations saved under either revive on the editable canvas.
    const type = normalizeType(obj.type)
    const canvasWidth = obj.canvasWidth || annotation?.width
    const canvasHeight = obj.canvasHeight || annotation?.height
    const { scale, offsetX, offsetY } = getAnnotationContainMapping(
      canvas,
      canvasWidth,
      canvasHeight
    )

    const base = {
      id: obj.id,
      // Authorship metadata must survive the reload, or the next save
      // re-attributes the object to the current user via setObjectData.
      createdAt: obj.createdAt,
      createdBy: obj.createdBy,
      fill: 'transparent',
      left: obj.left * scale + offsetX,
      top: obj.top * scale + offsetY,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      radius: obj.radius,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX * scale,
      scaleY: obj.scaleY * scale,
      angle: obj.angle,
      scale: obj.scale,
      editable: !isCurrentUserArtist.value,
      selectable: !isCurrentUserArtist.value
    }

    if (type === 'path') {
      path = new Path(obj.path, {
        ...base
      })
      path.set('id', obj.id)
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
    } else if (type === 'i-text' || type === 'text' || type === 'textbox') {
      text = new IText(obj.text, {
        ...base,
        erasable: false,
        fill: obj.fill,
        left: obj.left * scale + offsetX,
        top: obj.top * scale + offsetY,
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
    } else if (type === 'PSStroke') {
      // deserializePSStroke resolves null on a failed revival (corrupt data);
      // skip it gracefully rather than aborting the whole frame's load.
      if (obj.canvasWidth) {
        psstroke = await deserializePSStroke(obj)
      }
      if (psstroke) {
        psstroke.set('id', obj.id)
        psstroke.set('strokeWidth', obj.strokeWidth)
        psstroke.set('strokeLineCap', 'round')
        psstroke.set('strokeLineJoin', 'round')
        psstroke.set('canvasWidth', canvasWidth)
        psstroke.set('canvasHeight', canvasHeight)
        psstroke.set('scaleX', obj.scaleX * scale)
        psstroke.set('scaleY', obj.scaleY * scale)
        psstroke.set('left', obj.left * scale + offsetX)
        psstroke.set('top', obj.top * scale + offsetY)
        psstroke.set('radius', obj.radius)
        psstroke.set('width', obj.width)
        psstroke.set('height', obj.height)
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
    } else if (type === 'rect' || type === 'circle' || type === 'arrow') {
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
    // Reattach the serialized eraser mask (local coords) to whatever was built.
    // Text is non-erasable so it never carries one; the helper is a no-op then.
    const built = path || text || psstroke || shape
    if (built) await reviveObjectEraser(built, obj)
    return built
  }

  // Events

  const onObjectAdded = obj => {
    if (silentAnnotation) return
    let o = obj.target ? obj.target : obj.targets[0]
    o = setObjectData(o)
    // The finalized stroke can lose the brush's round caps under
    // fabric 7 (the live brush preview had them). Force them like the
    // reload path (addObjectToCanvas) already does.
    if (o.set && (o.type === 'PSStroke' || o.type === 'path')) {
      o.set('strokeLineCap', 'round')
      o.set('strokeLineJoin', 'round')
    }
    if (isLaserModeOn.value) {
      // Laser strokes fade out locally and are broadcast as ephemeral
      // events (flagged so receivers fade them too); they are
      // intentionally not added to the additions stack.
      fadeObject(o)
      postAnnotationAddition(getCurrentTime(), o.serialize(), { laser: true })
    } else {
      addToAdditions(o)
      stackAddAction(obj)
      clearUndoneOnUserAction()
    }
  }

  const removeFullyErasedObject = obj => {
    const activeObject = fabricCanvas.value.getActiveObject?.()
    if (activeObject === obj || activeObject?._objects?.includes(obj)) {
      fabricCanvas.value.discardActiveObject()
    }
    fabricCanvas.value.remove(obj)
    removeFromUpdates(obj)
    addToDeletions(obj)
  }

  const onErasingEnd = ({ targets = [], subTargets = [], path } = {}) => {
    if (silentAnnotation) return
    const affected = [...new Set([...targets, ...subTargets])]
    if (affected.length === 0) return
    const removedTargets = []
    affected.forEach(obj => {
      if (hasVisiblePixels(obj)) {
        addToUpdates(obj)
      } else {
        removeFullyErasedObject(obj)
        removedTargets.push(obj)
      }
    })
    doneActionStack.push({
      type: 'erase',
      targets: affected,
      removedTargets,
      path,
      time: getCurrentTime()
    })
    clearUndoneStack()
    saveAnnotationsCb()
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
        const canvasObj = getObjectById(groupObj.id) ?? groupObj
        setObjectData(canvasObj)
        addToUpdatesSerializedObject(serializeAbsolute(canvasObj))
      })
      saveAnnotationsCb()
    }
  }

  // text:changed fires per keystroke and onObjectModified serializes the
  // whole canvas and dispatches the store each time (plus one socket emit
  // per keystroke in review rooms): batch it trailing-edge. The final
  // state is never lost — exiting text editing fires object:modified
  // directly. The canvas guard drops a pending call whose object was
  // cleared away (preview or frame switch) while the debounce ran.
  const onTextChangedDebounced = func.debounce(event => {
    if (event.target?.canvas === fabricCanvas.value) onObjectModified(event)
  }, 400)

  const onWindowsClosed = event => {
    if (notSaved.value) {
      const confirmationMessage = 'Your annotations are not saved yet.'
      event.returnValue = confirmationMessage
      return confirmationMessage
    }
  }

  // Undo / Redo

  const stackAddAction = ({ target }) => {
    doneActionStack.push({ type: 'add', obj: target, time: getCurrentTime() })
  }

  // History entries belong to the frame they were made on: replayed after
  // a seek, they would graft objects onto the wrong frame's annotation
  // entry (deltas are keyed on the CURRENT time). Stale history is
  // dropped instead of replayed.
  const isStaleAction = action =>
    action?.time !== undefined && action.time !== getCurrentTime()

  // Any NEW user action invalidates the redo stack (a kept one would
  // replay stale history on top of the new state) — but not the re-adds
  // and re-deletes performed by undo/redo themselves.
  let replayingHistory = false
  const clearUndoneOnUserAction = () => {
    if (!replayingHistory) clearUndoneStack()
  }

  // After a canvas reload (e.g. Esc-exit fullscreen) the stack entry
  // holds a stale fabric.Object that's no longer on the live canvas;
  // look it up by id. Groups (_objects) aren't on the canvas as a
  // whole, fall back to the stored reference.
  const resolveActionObject = action => {
    if (action.obj?._objects) return action.obj
    return getObjectById(action.obj.id) ?? action.obj
  }

  // Undo an erase: pop the last path off each affected object's eraser mask,
  // stashing the removed paths on the action so redo can restore them exactly.
  const undoEraseAction = action => {
    action.removed = []
    action.targets.forEach(t => {
      const obj = getObjectById(t.id) ?? t
      const paths = obj.eraser?.getObjects?.() ?? []
      if (!paths.length) return
      // Stash the id too: redo must re-resolve the live object, because a
      // save/reload between undo and redo replaces it with a fresh instance
      // (the stored ref would then point at an off-canvas object → no-op).
      action.removed.push({ id: obj.id, obj, path: obj.eraser._objects.pop() })
      if (obj.eraser._objects.length === 0) obj.eraser = undefined
      obj.set('dirty', true)
      if (action.removedTargets.includes(t)) {
        silentAnnotation = true
        try {
          fabricCanvas.value.add(obj)
        } finally {
          silentAnnotation = false
        }
        removeFromDeletions(obj)
        // The object may no longer exist in the saved drawing (its deletion
        // was already saved): zou drops updates for unknown ids and remote
        // viewers ignore them, so the restore must be an addition. The
        // update below still runs: zou applies additions first, so when the
        // object still exists server-side (same-batch undo) the addition is
        // ignored and the update carries the restored state.
        setObjectData(obj)
        addToAdditions(obj)
      }
      addToUpdates(obj)
    })
    fabricCanvas.value?.requestRenderAll()
  }

  // Redo an erase: push the stashed paths back onto each object's eraser,
  // re-resolving the live canvas object by id (see undoEraseAction).
  const redoEraseAction = action => {
    ;(action.removed ?? []).forEach(({ id, obj, path }) => {
      const target = getObjectById(id) ?? obj
      if (!target) return
      if (!target.eraser) target.eraser = new Eraser()
      target.eraser._objects.push(path)
      target.set('dirty', true)
      if (
        action.removedTargets.some(removedTarget => removedTarget.id === id)
      ) {
        removeFullyErasedObject(target)
      } else {
        addToUpdates(target)
      }
    })
    fabricCanvas.value?.requestRenderAll()
  }

  const undoLastAction = () => {
    const lastAction = doneActionStack[doneActionStack.length - 1]
    if (!lastAction) return
    if (isStaleAction(lastAction)) {
      resetUndoStacks()
      return
    }
    replayingHistory = true
    try {
      if (lastAction.type === 'erase') {
        const action = doneActionStack.pop()
        undoEraseAction(action)
        undoneActionStack.push(action)
        return
      }
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
    } finally {
      replayingHistory = false
    }
  }

  const redoLastAction = () => {
    const lastUndone = undoneActionStack[undoneActionStack.length - 1]
    if (!lastUndone) return
    if (isStaleAction(lastUndone)) {
      resetUndoStacks()
      return
    }
    replayingHistory = true
    try {
      if (lastUndone.type === 'erase') {
        const action = undoneActionStack.pop()
        redoEraseAction(action)
        doneActionStack.push(action)
        return
      }
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
    } finally {
      replayingHistory = false
    }
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
    fabricCanvas.value.off('erasing:end', onErasingEnd)
    fabricCanvas.value.off('mouse:down', initializeMouseDrawing)
    fabricCanvas.value.off('mouse:move', onCanvasMouseMovedCb)
    fabricCanvas.value.off('mouse:move', updateMousePressure)
    fabricCanvas.value.off('mouse:up', endDrawing)
    fabricCanvas.value.off('mouse:up', onCanvasReleasedCb)
    fabricCanvas.value.on('object:moved', onObjectModified)
    fabricCanvas.value.on('object:modified', onObjectModified)
    fabricCanvas.value.on('text:changed', onTextChangedDebounced)
    fabricCanvas.value.on('object:added', onObjectAdded)
    fabricCanvas.value.on('erasing:end', onErasingEnd)
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
        clearUndoneOnUserAction()
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
    // Apply the selected pencil width rather than a hardcoded value — the
    // drawing-mode toggle (setAnnotationDrawingMode) doesn't reset the brush,
    // so a hardcoded width here stuck every freehand stroke at that size.
    _resetPencil()

    Group.prototype._controlsVisibility = {
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

  const initializeMouseDrawing = opt => {
    if (
      mouseIsDrawing.value === false &&
      fabricCanvas.value?.isDrawingMode &&
      fabricCanvas.value.freeDrawingBrush
    ) {
      mouseIsDrawing.value = true
      mouseDrawingStartTime.value = Date.now()
      // v6: getPointer requires an event; use the move/down event's scene point.
      mouseDrawingPrevPoint.value = opt?.e
        ? fabricCanvas.value.getScenePoint(opt.e)
        : null
      mouseDrawingPrevPressure.value = fabricCanvas.value.freeDrawingBrush
        ? fabricCanvas.value.freeDrawingBrush.pressureManager.fallback
        : mouseDrawingMaxPressure.value
    }
  }

  const getCanvasRelativePointDrawingDifference = (p1, p2, canvas) => {
    const dimensions = new Point(canvas.getWidth(), canvas.getHeight())
    const p1_rel = p1.divide(dimensions)
    const p2_rel = p2.divide(dimensions)
    return Math.sqrt(
      Math.pow(Math.abs(p1_rel.x - p2_rel.x), 1) +
        Math.pow(Math.abs(p1_rel.y - p2_rel.y), 1)
    )
  }

  const updateMousePressure = opt => {
    if (
      fabricCanvas.value?.isDrawingMode &&
      fabricCanvas.value.freeDrawingBrush &&
      mouseIsDrawing.value
    ) {
      // v6: getPointer requires an event; resolve the scene point from it.
      const pointer = opt?.e ? fabricCanvas.value.getScenePoint(opt.e) : null
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
        mouseDrawingPrevPoint.value &&
        pointer
      ) {
        let delta_dist = getCanvasRelativePointDrawingDifference(
          mouseDrawingPrevPoint.value,
          pointer,
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
      if (pointer) mouseDrawingPrevPoint.value = pointer
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
    // Cancel any in-flight annotation load so its remaining async adds
    // don't land after this clear.
    mainLoadToken++
    if (isFabricReady(fabricCanvas.value)) {
      fabricCanvas.value.clear()
    }
    clearComparisonCanvas()
  }

  const clearComparisonCanvas = () => {
    // Cancel any in-flight comparison load so its remaining async adds don't
    // land after this clear.
    comparisonLoadToken++
    if (isFabricReady(fabricCanvasComparison.value)) {
      fabricCanvasComparison.value.clear()
    }
  }

  const clearOnionCanvas = () => {
    onionLoadToken++
    if (isFabricReady(fabricCanvasOnion.value)) {
      fabricCanvasOnion.value.clear()
    }
  }

  // Add one ghost annotation's objects at the given opacity. Sequential
  // because object creation is async and addObjectToCanvas mutates shared
  // state (so it can't run in parallel). Token-checked around every await
  // so a clear or a fresher load mid-ghost can't leave a partial ghost
  // painted on the cleared canvas.
  const renderOnionGhost = async (canvas, { annotation, opacity }, token) => {
    for (const obj of annotation.drawing.objects) {
      if (token !== onionLoadToken) return
      const built = await addObjectToCanvas(annotation, obj, canvas)
      if (token !== onionLoadToken) {
        if (built) canvas.remove(built)
        return
      }
      built?.set('opacity', opacity)
    }
  }

  // Paint the ghosts (each { annotation, opacity }) onto the read-only onion
  // canvas. Newest load wins: ghosts are skipped once a fresher load or a
  // clear has bumped onionLoadToken, so a superseded load never repopulates a
  // canvas meant for another frame.
  const loadOnionSkin = async ghosts => {
    const canvas = fabricCanvasOnion.value
    // A 0×0 canvas (not laid out yet) would scale every object to nothing.
    if (!canvas || !canvas.width || !canvas.height) return
    const token = ++onionLoadToken
    canvas.clear()
    for (const ghost of ghosts) {
      if (token !== onionLoadToken) return
      await renderOnionGhost(canvas, ghost, token)
    }
    if (token === onionLoadToken && isFabricReady(canvas)) {
      canvas.requestRenderAll()
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
        mainObject: activeObject,
        subObjects: []
      })
    }
    return activeObject
  }

  // Pasting must produce REAL copies. Re-adding the source instances (or
  // an Object.create wrapper inheriting the original's id) made every
  // later move post an update under the ORIGINAL's id (server and remote
  // viewers moved the original, the local duplicate vanished on reload)
  // and stacked duplicate entries of one instance in fabric's _objects.
  const PASTE_OFFSET = 10

  const pasteAnnotations = async () => {
    if (!fabricCanvas.value) return
    // Restores absolute coordinates on selection children before cloning.
    fabricCanvas.value.discardActiveObject()
    const { mainObject, subObjects } = clipboard.pasteAnnotations()
    const sources =
      subObjects?.length > 0 ? subObjects : mainObject ? [mainObject] : []
    let lastClone = null
    for (const source of sources) {
      const clone = await source.clone()
      clone.set('id', uuidv4())
      clone.set('left', clone.left + PASTE_OFFSET)
      clone.set('top', clone.top + PASTE_OFFSET)
      addObject(clone)
      lastClone = clone
    }
    if (lastClone && sources.length === 1) {
      fabricCanvas.value.setActiveObject(lastClone)
    }
    fabricCanvas.value.requestRenderAll()
  }

  const applyGroupChanges = (group, obj) => {
    if (obj.group) {
      const point = new Point(obj.left, obj.top)
      const transformedPoint = util.transformPoint(
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
    // fabric v6+ animate() only accepts the object form — the legacy
    // ('opacity', '0', options) signature silently does nothing, which
    // left laser strokes on the canvas forever.
    obj.animate(
      { opacity: 0 },
      {
        duration: 1500,
        onChange: fabricCanvas.value.renderAll.bind(fabricCanvas.value),
        onComplete: () => {
          fabricCanvas.value.remove(obj)
        }
      }
    )
  }

  // Saving

  // Guards against a freshly-saved annotation being immediately reloaded by
  // the socket echo of our own save (which would clear + reload the canvas and
  // drop strokes drawn since). isWriting() compares this against the event's
  // UTC updated_at, so it must be UTC too — the previous `moment().add(2,'h')`
  // only landed on UTC by accident in a UTC+2 zone, and elsewhere it either
  // blocked remote updates for ~2h or never guarded at all.
  const markLastAnnotationTime = () => {
    const time = moment.utc().add(6, 'seconds')
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
    // A save is already in flight: keep accumulating in the active
    // arrays instead of overwriting the in-flight buffer (which lost
    // strokes on failure and duplicated them on success). The next batch
    // is flushed by confirmAnnotationsSaved / restoreFailedAnnotations.
    if (pendingSave) return
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
  // target canvas. toCanvasElement re-renders the scene vectorially on
  // an offscreen canvas at the target resolution, so strokes stay sharp
  // (copying the display-sized live pixels would upscale and pixelate
  // them) while the live objects are never moved: no fabric "object
  // belongs to a different canvas" warnings.
  const compositeLiveAnnotationsOntoCanvas = canvas => {
    return new Promise(resolve => {
      const live = fabricCanvas.value
      if (!live) return resolve()
      const source = live.toCanvasElement(canvas.width / live.getWidth())
      const context = canvas.getContext('2d')
      context.drawImage(source, 0, 0, canvas.width, canvas.height)
      resolve()
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

  // Pencil / eraser / shape / text tool transitions and brush configuration
  // live in their own module; the facade re-exposes them unchanged.
  const {
    onChangePencilColor,
    onChangePencilWidth,
    onChangeTextColor,
    _resetColor,
    _resetPencil,
    resetPencilConfiguration,
    onAnnotateClicked,
    onEraseClicked,
    setAnnotationDrawingMode,
    toggleShapeMode,
    setShapeTool
  } = useDrawingTools({
    fabricCanvas,
    isEraserModeOn,
    isShapeMode,
    currentShape,
    pencilColor,
    pencilWidth,
    textColor,
    showCanvas,
    localPreferences
  })

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
  if (onionCanvasComponent) {
    watch(
      () => onionCanvasComponent.value?.canvas || null,
      canvas => {
        fabricCanvasOnion.value = canvas
      },
      { immediate: true, flush: 'sync' }
    )
  }

  return {
    // State
    fabricCanvas,
    fabricCanvasComparison,
    fabricCanvasOnion,
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
    onEraseClicked,
    isEraserModeOn,
    onObjectAdded,
    onErasingEnd,
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
    loadOnionSkin,
    clearOnionCanvas,
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
