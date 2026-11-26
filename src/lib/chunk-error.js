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

// Vite never requests a stylesheet that failed again: its preload cache keeps
// the URL as loaded, so every later page that needs it renders without it
// until a reload.
const STYLESHEET_RETRY_DELAYS = [5000, 30000, 120000]
const stylesheetRetries = new Map()

const isOwnStylesheet = element =>
  element?.tagName === 'LINK' &&
  element.rel === 'stylesheet' &&
  new URL(element.href, window.location.href).origin === window.location.origin

// A fresh link at the same place keeps the order of the cascade. Offline, it
// waits for the network: a try then would fail too, and spend one of the few.
const replaceStylesheet = link => {
  const replace = () => link.replaceWith(link.cloneNode())
  if (navigator.onLine) {
    replace()
  } else {
    window.addEventListener('online', replace, { once: true })
  }
}

const retryStylesheet = link => {
  const tries = stylesheetRetries.get(link.href) || 0
  if (tries < STYLESHEET_RETRY_DELAYS.length) {
    stylesheetRetries.set(link.href, tries + 1)
    setTimeout(() => replaceStylesheet(link), STYLESHEET_RETRY_DELAYS[tries])
  }
}

/**
 * Loads again, a few times, the stylesheets of Kitsu that fail to load once
 * the app runs, such as those of a lazy page. The stylesheets of index.html
 * load before this code: one that fails there stays out until a reload.
 */
export const setupStylesheetRetry = () => {
  // The error event of a resource does not bubble: catch it on the way down.
  window.addEventListener(
    'error',
    event => {
      if (isOwnStylesheet(event.target)) {
        retryStylesheet(event.target)
      }
    },
    true
  )
}

/**
 * Sets up a global error handler for chunk loading errors in a Vue Router application.
 * When a chunk loading error is detected during navigation, the page will be reloaded
 * to attempt to load the chunk again. A sessionStorage flag is used to prevent infinite reload loops.
 * Offline, the page stays: the reload would show the error page of the browser instead
 * of the app, and the next navigation tries again.
 *
 * @param {import('vue-router').Router} router - The Vue Router instance to attach the error handler to.
 */
export async function setupChunkErrorHandler(router) {
  // Listen for navigation errors in the router.
  router.onError((error, to) => {
    if (
      chunkErrors.has(error) &&
      navigator.onLine &&
      !sessionStorage.getItem(PRELOAD_ERROR_FLAG)
    ) {
      sessionStorage.setItem(PRELOAD_ERROR_FLAG, 'true')
      window.location.assign(to.fullPath)
    }
  })

  // Reset the reload flag once the initial navigation settles, whether it
  // resolves or a guard aborts it (e.g. the 2FA redirect on a cold load).
  try {
    await router.isReady()
  } catch (error) {
    // A chunk error keeps the flag: unless offline, window.location.assign is
    // about to reload, and clearing it first would re-arm the loop on a
    // missing initial chunk.
    if (isChunkError(error)) {
      return
    }
  }
  sessionStorage.removeItem(PRELOAD_ERROR_FLAG)
}
