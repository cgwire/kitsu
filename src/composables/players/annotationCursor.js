/*
 * Derives the cursor to display over the annotation overlay from the
 * current player modes (drawing, typing, shape, laser, Alt-pan). Two
 * cursors need pixel art the browser can't synthesise (pencil and
 * laser ring); the rest are CSS keywords.
 *
 * The composable also tracks the global mouse-down state so Alt+drag
 * can swap from `grab` to `grabbing` while the user is actively
 * panning the underlying media.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const svgUri = svg =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`

const PENCIL_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/><path d='m15 5 4 4'/></svg>`

const LASER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><circle cx='10' cy='10' r='6' fill='none' stroke='white' stroke-width='3'/><circle cx='10' cy='10' r='6' fill='none' stroke='black' stroke-width='1'/></svg>`

// `x y` after the URL is the cursor hot-spot; the trailing keyword is
// the mandatory fallback when the browser refuses the custom image.
export const CURSOR_PENCIL = `${svgUri(PENCIL_SVG)} 2 22, crosshair`
export const CURSOR_LASER = `${svgUri(LASER_SVG)} 10 10, crosshair`

/**
 * @param {Object} modes - reactive refs describing the player state.
 * @param {import('vue').Ref<boolean>} modes.isAltHeld
 * @param {import('vue').Ref<boolean>} modes.isDrawing
 * @param {import('vue').Ref<boolean>} modes.isTyping
 * @param {import('vue').Ref<boolean>} modes.isShapeMode
 * @param {import('vue').Ref<boolean>} [modes.isLaserModeOn]
 */
export const useAnnotationCursor = ({
  isAltHeld,
  isDrawing,
  isTyping,
  isShapeMode,
  isLaserModeOn = ref(false)
}) => {
  const isMouseDown = ref(false)

  const onMouseDown = () => {
    isMouseDown.value = true
  }
  const onMouseUp = () => {
    isMouseDown.value = false
  }

  onMounted(() => {
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mouseup', onMouseUp)
  })

  // Order matters: Alt-pan trumps everything else (it's a transient
  // modifier the user holds on top of any other mode), then specific
  // tools, then the freehand pencil as the default drawing cursor.
  const cursor = computed(() => {
    if (isAltHeld.value) return isMouseDown.value ? 'grabbing' : 'grab'
    if (isTyping.value) return 'text'
    if (isLaserModeOn.value) return CURSOR_LASER
    if (isShapeMode.value) return 'crosshair'
    if (isDrawing.value) return CURSOR_PENCIL
    return null
  })

  return { cursor }
}
