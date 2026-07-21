const chunkErrors = new Set()

const PRELOAD_ERROR_FLAG = 'vite-preload-error-reload'

// Handle chunk loading errors after deployment.
// See: https://vite.dev/guide/build.html#load-error-handling
window.addEventListener('vite:preloadError', event => {
  chunkErrors.add(event.payload)
})

export function isChunkError(error) {
  return chunkErrors.has(error)
}

/**
 * Sets up a global error handler for chunk loading errors in a Vue Router application.
 * When a chunk loading error is detected during navigation, the page will be reloaded
 * to attempt to load the chunk again. A sessionStorage flag is used to prevent infinite reload loops.
 *
 * @param {import('vue-router').Router} router - The Vue Router instance to attach the error handler to.
 */
export async function setupChunkErrorHandler(router) {
  // Listen for navigation errors in the router.
  router.onError((error, to) => {
    if (chunkErrors.has(error) && !sessionStorage.getItem(PRELOAD_ERROR_FLAG)) {
      sessionStorage.setItem(PRELOAD_ERROR_FLAG, 'true')
      window.location.assign(to.fullPath)
    }
  })

  // Reset the reload flag once the initial navigation settles, whether it
  // resolves or a guard aborts it (e.g. the 2FA redirect on a cold load).
  try {
    await router.isReady()
  } catch (error) {
    // A chunk error keeps the flag: window.location.assign is about to reload,
    // and clearing it first would re-arm the loop on a missing initial chunk.
    if (isChunkError(error)) {
      return
    }
  }
  sessionStorage.removeItem(PRELOAD_ERROR_FLAG)
}
