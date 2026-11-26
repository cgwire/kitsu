// The failures of the requests sent through the API client, which reports
// them on its own, and the refusals Zou answers with a 200, such as a task
// left out of the answer to an assignment.
const requestFailures = new WeakSet()

export const markRequestFailure = err => {
  if (Object(err) === err) requestFailures.add(err)
}

export const isRequestFailure = err => requestFailures.has(err)

// Ends a promise chain nobody else waits on: a failed request is already
// reported, a refusal Zou answered with a 200 is no bug, and anything else
// is one, which must stay unhandled for Sentry.
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

// A file named as a picture that Zou cannot read, such as an empty export or
// another format under a .png or .jpg name.
export const isUnreadablePicture = err =>
  err?.status === 400 &&
  (err.body?.message?.includes('not a readable picture') ?? false)

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
