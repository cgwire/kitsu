const chunkErrors = new Set()

const PRELOAD_ERROR_FLAG = 'vite-preload-error-reload'

// Handle chunk loading errors after deployment.
// See: https://vite.dev/guide/build.html#load-error-handling
window.addEventListener('vite:preloadError', event => {
  chunkErrors.add(event.payload)
})

/**
 * Sets up a global error handler for chunk loading errors in a Vue Router application.
 * When a chunk loading error is detected during navigation, the page will be reloaded
 * to attempt to load the chunk again. A sessionStorage flag is used to prevent infinite reload loops.
 *
 * @param {import('vue-router').Router} router - The Vue Router instance to attach the error handler to.
 */
export function setupChunkErrorHandler(router) {
  // Listen for navigation errors in the router.
  router.onError((error, to) => {
    if (chunkErrors.has(error) && !sessionStorage.getItem(PRELOAD_ERROR_FLAG)) {
      sessionStorage.setItem(PRELOAD_ERROR_FLAG, 'true')
      window.location.assign(to.fullPath)
    }
  })

  // Reset reload flag once the initial route loads successfully.
  router.isReady().then(() => {
    sessionStorage.removeItem(PRELOAD_ERROR_FLAG)
  })
}
