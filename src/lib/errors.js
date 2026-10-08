// The failures of the requests sent through the API client, which reports
// them on its own.
const requestFailures = new WeakSet()

const errors = {
  backToLogin() {
    if (window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
  },

  markRequestFailure(err) {
    if (Object(err) === err) requestFailures.add(err)
  },

  isRequestFailure(err) {
    return requestFailures.has(err)
  },

  // Ends a promise chain nobody else waits on: a failed request is already
  // reported, anything else is a bug that must stay unhandled for Sentry.
  logRequestFailure(err) {
    if (!errors.isRequestFailure(err)) throw err
    console.error(err)
  }
}
export default errors
