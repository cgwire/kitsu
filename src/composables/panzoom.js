import { ref } from 'vue'

export const usePanzoomSync = () => {
  const panzoomTransform = ref({ x: 0, y: 0, scale: 1 })

  const onPanzoomChanged = ({ x, y, scale }) => {
    panzoomTransform.value = { x, y, scale }
  }

  const resetPanzoomTransform = () => {
    panzoomTransform.value = { x: 0, y: 0, scale: 1 }
  }

  const applyPanzoomTo = fabricCanvas => {
    if (!fabricCanvas) return
    const { x, y, scale } = panzoomTransform.value
    fabricCanvas.setViewportTransform([scale, 0, 0, scale, x, y])
    fabricCanvas.requestRenderAll()
  }

  return {
    panzoomTransform,
    onPanzoomChanged,
    resetPanzoomTransform,
    applyPanzoomTo
  }
}
