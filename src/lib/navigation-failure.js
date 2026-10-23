// vue-router builds a navigation failure as an error carrying its type, the
// route it came from, and the one it went to. It tells them from the real
// errors with instanceof Error, which fails once a script of the page has
// replaced window.Error: read their shape instead. The types are those of
// its internal ErrorTypes.
const FAILURE_KINDS = new Map([
  [2, 'redirect'],
  [4, 'abort'],
  [8, 'cancel'],
  [16, 'duplicate']
])

const MAX_FOLLOWED_REDIRECTS = 10

export const getNavigationFailureKind = error =>
  error?.from && error.to ? FAILURE_KINDS.get(error.type) : undefined

// A redirect taken for an error, to the login page for instance, is dropped
// and the page stays as it was: blank on a first load. Follow it, ten times
// in a row at most: the count starts over at each afterEach, which such
// failures skip. The next handlers, Sentry's among them, still get each one.
export const followLostRedirects = router => {
  let followedRedirects = 0

  router.afterEach(() => {
    followedRedirects = 0
  })

  router.onError(error => {
    if (getNavigationFailureKind(error) !== 'redirect') return
    if (followedRedirects >= MAX_FOLLOWED_REDIRECTS) return
    followedRedirects++
    try {
      // The failures of this navigation come back here as well.
      router.push(error.to).catch(() => {})
    } catch {
      // An unknown route throws at once. The next handlers, Sentry's among
      // them, still get the failure, which names it.
    }
  })
}
