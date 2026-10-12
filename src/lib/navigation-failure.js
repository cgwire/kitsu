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

export const getNavigationFailureKind = error =>
  error?.from && error.to ? FAILURE_KINDS.get(error.type) : undefined
