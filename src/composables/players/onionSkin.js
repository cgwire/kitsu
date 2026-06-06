/*
 * Onion skin orchestration.
 *
 * Watches the current frame and the onion settings, computes the ghost
 * annotations (neighbouring annotated frames + their fade opacity via the pure
 * helpers in @/lib/players/onionSkin) and pushes them to the read-only onion
 * canvas owned by the annotation composable.
 */
import { watch } from 'vue'

import { onionOpacity, selectOnionNeighbors } from '@/lib/players/onionSkin'

/*
 * @param {Object} options
 * @param {import('vue').Ref<boolean>} options.isOn
 * @param {import('vue').Ref<number>} options.frames - span 1..5
 * @param {import('vue').Ref<number>} options.currentFrame
 * @param {import('vue').Ref<number>} options.nbFrames
 * @param {import('vue').Ref<Array>} options.annotations - re-render when it changes
 * @param {Function} options.getAnnotationAtFrame - (frame) => annotation | null
 * @param {Function} options.loadOnionSkin - (ghosts) => Promise, ghosts = [{annotation, opacity}]
 * @param {Function} options.clearOnionCanvas - () => void
 */
export const useOnionSkin = ({
  isOn,
  frames,
  currentFrame,
  nbFrames,
  annotations,
  getAnnotationAtFrame,
  loadOnionSkin,
  clearOnionCanvas
}) => {
  const refresh = () => {
    if (!isOn.value) {
      clearOnionCanvas()
      return
    }
    const ghosts = selectOnionNeighbors(
      currentFrame.value,
      frames.value,
      getAnnotationAtFrame,
      nbFrames.value
    ).map(({ annotation, distance }) => ({
      annotation,
      opacity: onionOpacity(distance, frames.value)
    }))
    loadOnionSkin(ghosts)
  }

  watch([isOn, frames, currentFrame, annotations], refresh, { immediate: true })

  return { refresh }
}
