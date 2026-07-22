/*
 * Composable for the shared-playlist annotation overlay.
 *
 * Owns the fabric canvas lifecycle for the guest / read-only overlay
 * view: canvas creation and disposal, pencil settings (color, width),
 * drawing and shape tool modes, local undo stack, and the additions
 * diff needed by `update_preview_file_annotations`. Does not handle
 * the full annotation feature set (that lives in useAnnotation).
 */
import { ref, shallowRef } from 'vue'

import { CURSOR_PENCIL } from '@/composables/players/annotationCursor'
import {
  DEFAULT_PENCIL_COLOR,
  DEFAULT_PENCIL_WIDTH,
  PENCIL_WIDTHS,
  SHAPE_STROKE_WIDTH,
  applyPencilColor,
  applyPencilWidth,
  attachMousePressureSimulation,
  attachShapeDrawing,
  createAnnotationCanvas,
  pushAddition,
  removeAddition,
  setObjectData
} from '@/lib/players/annotation'

/**
 * Composable that owns a `fabric.Canvas` configured exactly like the
 * studio-side annotation tool (PSBrush, same pencil width buckets, same
 * serialisation). Tracks user-drawn strokes as `additions` so the caller
 * can ship a diff matching `update_preview_file_annotations`.
 */
export const useSharedAnnotationCanvas = () => {
  const isDrawing = ref(false)
  const currentTool = ref('pen')
  const pencilColor = ref(DEFAULT_PENCIL_COLOR)
  const pencilWidth = ref(DEFAULT_PENCIL_WIDTH)
  const localStack = shallowRef([])
  const additionsRef = shallowRef([])

  let fabricCanvas = null
  let onPathCreated = null
  let detachMousePressure = null
  let detachShapeDrawing = null
  let currentTime = 0
  let currentFrame = 0
  let lastAnnotationW = 0
  let lastAnnotationH = 0
  let userId = null

  const setup = (canvasEl, { width = 1, height = 1 } = {}) => {
    fabricCanvas = createAnnotationCanvas(canvasEl)
    fabricCanvas.setDimensions({ width, height })
    applyPencilColor(fabricCanvas, pencilColor.value)
    applyPencilWidth(fabricCanvas, pencilWidth.value)

    onPathCreated = ({ path }) => {
      if (!path) return
      setObjectData(path, fabricCanvas, userId)
      path.set('selectable', false)
      path.set('evented', false)
      pushAddition(additionsRef.value, {
        time: currentTime,
        frame: currentFrame,
        canvasWidth: lastAnnotationW || fabricCanvas.width,
        canvasHeight: lastAnnotationH || fabricCanvas.height,
        object: path
      })
      // Trigger reactivity for the shallowRef
      additionsRef.value = [...additionsRef.value]
      localStack.value = [...localStack.value, path]
      fabricCanvas.requestRenderAll()
    }
    fabricCanvas.on('path:created', onPathCreated)
    detachMousePressure = attachMousePressureSimulation(fabricCanvas)
    detachShapeDrawing = attachShapeDrawing(fabricCanvas, {
      getTool: () => (isDrawing.value ? currentTool.value : null),
      getColor: () => pencilColor.value,
      getWidth: () => SHAPE_STROKE_WIDTH,
      onShapeAdded: shape => {
        setObjectData(shape, fabricCanvas, userId)
        shape.set('selectable', false)
        shape.set('evented', false)
        pushAddition(additionsRef.value, {
          time: currentTime,
          frame: currentFrame,
          canvasWidth: lastAnnotationW || fabricCanvas.width,
          canvasHeight: lastAnnotationH || fabricCanvas.height,
          object: shape
        })
        additionsRef.value = [...additionsRef.value]
        localStack.value = [...localStack.value, shape]
      }
    })
    return fabricCanvas
  }

  const applyToolToCanvas = () => {
    if (!fabricCanvas) return
    const penActive = isDrawing.value && currentTool.value === 'pen'
    fabricCanvas.isDrawingMode = penActive
    fabricCanvas.skipTargetFind = !isDrawing.value
    // Cursor parity with the studio annotation tool: pencil while drawing,
    // crosshair for the shape tools, default otherwise.
    const cursor = !isDrawing.value
      ? 'default'
      : currentTool.value === 'pen'
        ? CURSOR_PENCIL
        : 'crosshair'
    fabricCanvas.freeDrawingCursor = cursor
    fabricCanvas.defaultCursor = cursor
    fabricCanvas.hoverCursor = cursor
  }

  const setDrawingMode = enabled => {
    isDrawing.value = !!enabled
    applyToolToCanvas()
  }

  const setTool = tool => {
    currentTool.value = tool
    applyToolToCanvas()
  }

  const setColor = color => {
    pencilColor.value = color
    applyPencilColor(fabricCanvas, color)
  }

  const setWidth = width => {
    pencilWidth.value = width
    applyPencilWidth(fabricCanvas, width)
  }

  const setUserId = id => {
    userId = id
  }

  const setTime = (time, frame) => {
    currentTime = time
    currentFrame = frame
  }

  const setCanvasSize = (width, height) => {
    if (!fabricCanvas) return
    fabricCanvas.setDimensions({ width, height })
  }

  const setAnnotationDimensions = (width, height) => {
    lastAnnotationW = width
    lastAnnotationH = height
  }

  const undo = () => {
    if (!fabricCanvas || localStack.value.length === 0) return
    const next = [...localStack.value]
    const last = next.pop()
    fabricCanvas.remove(last)
    localStack.value = next
    additionsRef.value = removeAddition(additionsRef.value, last.id)
  }

  const clearLocal = () => {
    if (!fabricCanvas) return
    localStack.value.forEach(o => fabricCanvas.remove(o))
    localStack.value = []
    additionsRef.value = []
    fabricCanvas.requestRenderAll()
  }

  const hasChanges = () => additionsRef.value.length > 0

  const getDiff = () => ({
    additions: additionsRef.value.map(a => ({ ...a })),
    updates: [],
    deletions: []
  })

  const reset = () => {
    if (!fabricCanvas) return
    fabricCanvas.clear()
    localStack.value = []
    additionsRef.value = []
  }

  // Re-adopt unsaved additions captured before a reset (resize, frame
  // step): the serialized entries are canvas-size independent, only the
  // live object list needs the rebuilt instances so undo keeps working.
  const restoreUnsaved = (entries, objects) => {
    additionsRef.value = entries
    localStack.value = objects
  }

  const dispose = () => {
    if (fabricCanvas && onPathCreated) {
      fabricCanvas.off('path:created', onPathCreated)
    }
    detachMousePressure?.()
    detachMousePressure = null
    detachShapeDrawing?.()
    detachShapeDrawing = null
    fabricCanvas?.dispose()
    fabricCanvas = null
    onPathCreated = null
  }

  const getCanvas = () => fabricCanvas

  return {
    PENCIL_WIDTHS,
    additions: additionsRef,
    clearLocal,
    currentTool,
    dispose,
    getDiff,
    getCanvas,
    hasChanges,
    isDrawing,
    localStack,
    pencilColor,
    pencilWidth,
    reset,
    restoreUnsaved,
    setAnnotationDimensions,
    setCanvasSize,
    setColor,
    setDrawingMode,
    setTime,
    setTool,
    setUserId,
    setWidth,
    setup,
    undo
  }
}
