/**
 * Utilities to deal with full screen state.
 *
 * Warning: Webkit prefix is needed for Safari < 16.4.
 */
export const fullScreenMixin = {
  computed: {
    isFullScreenEnabled() {
      return Boolean(
        document.fullscreenEnabled || document.webkitFullscreenEnabled
      )
    }
  },

  methods: {
    isFullScreen() {
      return Boolean(document.fullscreenElement || document.webkitIsFullScreen)
    },

    /**
     * Exit fullscreen mode
     * @returns {Promise<void>}
     */
    documentExitFullScreen() {
      return (
        document.exitFullscreen?.() ||
        Promise.resolve(document.webkitCancelFullScreen?.())
      )
    },

    /**
     * Request fullscreen mode for the given HTML element
     * @param {HTMLElement} element - The HTML element to display in fullscreen
     * @returns {Promise<void>}
     */
    documentSetFullScreen(element) {
      return (
        element.requestFullscreen?.() ||
        Promise.resolve(element.webkitRequestFullScreen?.())
      )
    }
  }
}
