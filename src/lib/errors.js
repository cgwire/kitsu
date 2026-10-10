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
