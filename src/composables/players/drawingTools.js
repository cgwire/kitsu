/*
 * Drawing-tools slice of the annotation composable: owns the pencil /
 * eraser / shape / text tool state transitions and brush configuration.
 * Canvas lifecycle, persistence and onion compositing stay in annotation.js,
 * which builds the shared `ctx` and re-exposes these functions unchanged.
 */
import { PSBrush } from 'fabricjs-psbrush'

import {
  DEFAULT_TEXT_SIZE,
  lockBrushToFirstPointer
} from '@/lib/players/annotation'
import { EraserBrush } from '@/lib/players/eraserbrush'

export const useDrawingTools = ({
  fabricCanvas,
  isEraserModeOn,
  isShapeMode,
  currentShape,
  pencilColor,
  pencilWidth,
  textColor,
  textSize,
  showCanvas,
  localPreferences
}) => {
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

  const onChangeTextSize = size => {
    textSize.value = size
    localPreferences.setPreference('player:text-size', size)
  }

  const _resetColor = () => {
    if (!fabricCanvas.value) return
    fabricCanvas.value.freeDrawingBrush.color = pencilColor.value
  }

  const _resetPencil = () => {
    if (!fabricCanvas.value) return
    const converter = {
      huge: 30,
      big: 20,
      medium: 10,
      small: 4,
      tiny: 2
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
    textSize.value =
      localPreferences.getPreference('player:text-size') || DEFAULT_TEXT_SIZE

    _resetColor()
    _resetPencil()
  }

  const onAnnotateClicked = () => {
    showCanvas()
    // Toggle off only when the pencil itself is the active brush. If the
    // eraser is on, switch over to the pencil instead of turning drawing off.
    if (fabricCanvas.value.isDrawingMode && !isEraserModeOn.value) {
      fabricCanvas.value.isDrawingMode = false
      return
    }
    isEraserModeOn.value = false
    if (fabricCanvas.value) {
      fabricCanvas.value.isDrawingMode = true
    }
    const brush = new PSBrush(fabricCanvas.value)
    brush.pressureManager.fallback = 0.5
    // PSBrush drops BaseBrush's round cap/join defaults (its initialize
    // doesn't call super), so restore them or strokes get flat ends.
    brush.strokeLineCap = 'round'
    brush.strokeLineJoin = 'round'
    lockBrushToFirstPointer(brush)
    fabricCanvas.value.freeDrawingBrush = brush
    _resetColor()
    _resetPencil()
  }

  // Eraser tool — mirror of onAnnotateClicked. Installs the v2 EraserBrush
  // (destination-out). Type-selectivity is handled per-object by the
  // `erasable` flag (IText is non-erasable), not by z-order.
  const onEraseClicked = () => {
    showCanvas()
    if (isEraserModeOn.value) {
      isEraserModeOn.value = false
      if (fabricCanvas.value) fabricCanvas.value.isDrawingMode = false
      return
    }
    isEraserModeOn.value = true
    isShapeMode.value = false
    if (fabricCanvas.value) {
      fabricCanvas.value.isDrawingMode = true
      const brush = new EraserBrush(fabricCanvas.value)
      brush.strokeLineCap = 'round'
      brush.strokeLineJoin = 'round'
      lockBrushToFirstPointer(brush)
      fabricCanvas.value.freeDrawingBrush = brush
      _resetEraserWidth()
    }
  }

  const _resetEraserWidth = () => {
    if (!fabricCanvas.value?.freeDrawingBrush) return
    // Reuse the pencil-width preference (same mapping as _resetPencil).
    const converter = { huge: 30, big: 20, medium: 10, small: 4, tiny: 2 }
    fabricCanvas.value.freeDrawingBrush.width = converter[pencilWidth.value]
  }

  const setAnnotationDrawingMode = isDrawingMode => {
    if (isDrawingMode) {
      isShapeMode.value = false
      // Coming back to the pencil from the eraser: the eraser swapped
      // freeDrawingBrush for an EraserBrush, so restore the pressure brush
      // (consumers that toggle drawing through this entry point — e.g.
      // PreviewPlayer — never re-create a PSBrush themselves).
      if (fabricCanvas.value?.freeDrawingBrush instanceof EraserBrush) {
        isEraserModeOn.value = false
        const brush = new PSBrush(fabricCanvas.value)
        brush.pressureManager.fallback = 0.5
        brush.strokeLineCap = 'round'
        brush.strokeLineJoin = 'round'
        lockBrushToFirstPointer(brush)
        fabricCanvas.value.freeDrawingBrush = brush
        _resetColor()
        _resetPencil()
      }
    } else if (isEraserModeOn.value) {
      // The eraser runs in drawing mode. A stray "leave drawing" — typically
      // the isDrawing watcher firing async as the user switches pencil→eraser
      // (onEraseClicked set isDrawing=false) — must not tear it down, or the
      // eraser stops working and its ring cursor reverts to the default.
      return
    }
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

  return {
    onChangePencilColor,
    onChangePencilWidth,
    onChangeTextColor,
    onChangeTextSize,
    _resetColor,
    _resetPencil,
    _resetEraserWidth,
    resetPencilConfiguration,
    onAnnotateClicked,
    onEraseClicked,
    setAnnotationDrawingMode,
    toggleShapeMode,
    setShapeTool
  }
}
