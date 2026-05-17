/*
 * Composable for native fullscreen handling.
 *
 * Centralises the cross-browser API, tracks the current state in a
 * reactive ref and registers / cleans up the fullscreenchange
 * listeners on the target element. The native event fires for every
 * transition (button click, ESC key, browser UI), so onChange is the
 * single source of truth for side-effects.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
  'webkitfullscreenchange'
]

const isDocumentFullScreen = () =>
  !!(
    document.fullscreen ||
    document.webkitIsFullScreen ||
    document.mozFullScreen ||
    document.msFullscreenElement ||
    document.fullscreenElement
  )

const requestFullScreen = element => {
  if (element.requestFullscreen) return element.requestFullscreen()
  if (element.mozRequestFullScreen) return element.mozRequestFullScreen()
  if (element.webkitRequestFullScreen) return element.webkitRequestFullScreen()
  if (element.msRequestFullscreen) return element.msRequestFullscreen()
}

const exitDocumentFullScreen = () => {
  if (document.exitFullscreen) return document.exitFullscreen()
  if (document.mozCancelFullScreen) return document.mozCancelFullScreen()
  if (document.webkitCancelFullScreen) return document.webkitCancelFullScreen()
  if (document.msExitFullscreen) return document.msExitFullscreen()
}

/**
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement>} options.container - template
 *   ref of the element to put fullscreen and to listen on
 * @param {Function} [options.onChange] - fired after fullScreen is
 *   updated; receives the new boolean
 */
export const useFullScreen = ({ container, onChange }) => {
  const fullScreen = ref(false)

  const handleNativeChange = () => {
    const nowFullScreen = isDocumentFullScreen()
    if (fullScreen.value === nowFullScreen) return
    fullScreen.value = nowFullScreen
    onChange?.(nowFullScreen)
  }

  const enter = () => container.value && requestFullScreen(container.value)
  const exit = () => exitDocumentFullScreen()

  const toggle = () => (fullScreen.value ? exit() : enter())

  onMounted(() => {
    const el = container.value
    if (!el) return
    FULLSCREEN_EVENTS.forEach(name =>
      el.addEventListener(name, handleNativeChange, false)
    )
  })

  onBeforeUnmount(() => {
    const el = container.value
    if (!el) return
    FULLSCREEN_EVENTS.forEach(name =>
      el.removeEventListener(name, handleNativeChange, false)
    )
  })

  return { fullScreen, enter, exit, toggle }
}
