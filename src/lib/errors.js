// The failures of the requests sent through the API client, which reports
// them on its own.
const requestFailures = new WeakSet()

export const markRequestFailure = err => {
  if (Object(err) === err) requestFailures.add(err)
}

export const isRequestFailure = err => requestFailures.has(err)

// Ends a promise chain nobody else waits on: a failed request is already
// reported, anything else is a bug that must stay unhandled for Sentry.
export const logRequestFailure = err => {
  if (!isRequestFailure(err)) throw err
  console.error(err)
}

// Zou answers 404 to a change on an entity deleted in the meantime, from
// another session for instance.
export const isNotFound = err => err?.status === 404

// An entity deleted (404), out of the user's reach (403), or named by a
// malformed id from a broken link (400).
export const isMissingEntity = err => [400, 403, 404].includes(err?.status)

const errors = {
  backToLogin() {
    if (window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
  },

  markRequestFailure,
  isRequestFailure,
  logRequestFailure
}
export default errors
