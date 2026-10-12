import * as Sentry from '@sentry/vue'
import superagent from 'superagent'

import { name, version } from '@/../package.json'
import { isChunkError } from '@/lib/chunk-error'
import errors from '@/lib/errors'
import { setErrorReporter } from '@/store/api/client'

// The guest share URL carries its access token in the path, and so do the
// API paths behind it and the routes that revoke the link or invite people
// to it: strip it from everything Sentry reports.
const SHARED_TOKEN_RGX =
  /(\/(?:playlists\/(?:shared|[^/]+\/share)|shared\/playlists)\/)[^/?#\s]+/g
export const scrubSharedToken = value =>
  typeof value === 'string'
    ? value.replace(SHARED_TOKEN_RGX, '$1[token]')
    : value

// The query values that identify someone or grant access: the email of the
// two-factor login, the email and token of the password reset page, the
// state of the app login, the search texts, which can name a person, and
// the redirect path that carries them. Zou also reads the password of a
// shared playlist from the query.
const SENSITIVE_KEYS = [
  'email',
  'password',
  'redirect',
  'search',
  'state',
  'token'
]
const QUERY_PARAM_RGX = /(^|[?&])([^=&#?\s]+)=[^&#\s]*/g
const FILTERED = '[Filtered]'

// The router integration also sets each parameter of the route alone on
// the transaction, as query.email or params.token.
const isSensitiveKey = key =>
  SENSITIVE_KEYS.includes(key.split('.').pop().toLowerCase())

const scrubUrl = value =>
  scrubSharedToken(value).replace(QUERY_PARAM_RGX, (param, separator, key) =>
    isSensitiveKey(key) ? `${separator}${key}=${FILTERED}` : param
  )

// The event also holds SDK objects, like its scopes, which are never sent.
const isPlainData = value =>
  Array.isArray(value) ||
  (value instanceof Object && Object.getPrototypeOf(value) === Object.prototype)

// The SDK copies the URLs as they are wherever it puts them: page, referrer,
// breadcrumbs, attributes of the transactions and spans.
const scrubData = (data, isSensitive = false) => {
  Object.entries(data).forEach(([key, value]) => {
    const isFiltered = isSensitive || isSensitiveKey(key)
    if (typeof value === 'string') {
      data[key] = isFiltered ? FILTERED : scrubUrl(value)
    } else if (isPlainData(value)) {
      scrubData(value, isFiltered)
    }
  })
}

const scrubEvent = event => {
  scrubData(event)
  return event
}

// Code that Kitsu did not ship, like the DevTools console, an extension or
// an in-app browser, fails with no frame from its bundles. The Sentry chunk
// does not count: its fetch wrapper sits in the stack of every fetch call.
const isKitsuFrame = ({ filename }) =>
  filename?.startsWith(`${location.origin}/assets/`) &&
  !filename.startsWith(`${location.origin}/assets/sentry-`)

const isForeignError = event => {
  const frames = (event.exception?.values || []).flatMap(
    value => value.stacktrace?.frames || []
  )
  return frames.length > 0 && !frames.some(isKitsuFrame)
}

const ID_RGX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const DATE_RGX = /\d{4}-\d{2}-\d{2}/g
const NUMBER_RGX = /\/\d+(?=\/|$)/g
// The names people give to their files and to the metadata columns of all
// the productions.
const NAME_RGX =
  /(\/(?:attachment-files\/[^/]+\/file|metadata-descriptors\/all-projects)\/)[^/]+/g
const SESSION_CHECK_TIMEOUT = 20000

let userId = null
let isPageHidden = false
const reportedRoutes = new Set()

const isOwnData = path =>
  path.startsWith('/api/data/user/') || Boolean(userId && path.includes(userId))

// The status of the answer, or why there was none.
const getFailureKind = err => {
  if (err?.status) return err.status
  return err?.timeout ? 'timeout' : 'no response'
}

// The API client reported the failure as a warning named after its route,
// and the raw error, grouped by the superagent stack, would only repeat it.
// A deliberate capture brings its own context: it stays.
const isReportedRequestFailure = (event, hint) =>
  errors.isRequestFailure(hint.originalException) &&
  (event.exception?.values || []).some(
    ({ mechanism }) =>
      mechanism?.handled === false || mechanism?.type?.startsWith('auto.')
  )

// Refused on their own data, the user either lost the session cookie to
// another login, or Zou refused the right session. Not through the API
// client, where a 401 sends back to the login page.
const getSessionOwner = async () => {
  try {
    const res = await superagent
      .get('/api/auth/authenticated')
      .timeout(SESSION_CHECK_TIMEOUT)
    const id = res.body?.user?.id
    if (!id) return { result: 'logged_out' }
    return id === userId
      ? { result: 'same' }
      : { result: 'changed', user_id: id }
  } catch (err) {
    return {
      result: [401, 422].includes(err.status) ? 'logged_out' : 'unknown'
    }
  }
}

// One warning per kind of failure, route and session, whatever the ids,
// dates and numbers in the path. The 2FA setup gate refuses everything on
// purpose.
export const reportApiError = async (err, { method, path, duration }) => {
  if (err?.body?.two_factor_authentication_required) return
  const kind = getFailureKind(err)
  const cleanPath = scrubSharedToken(path.split('?')[0])
  const route = cleanPath
    .replace(ID_RGX, ':id')
    .replace(DATE_RGX, ':date')
    .replace(NUMBER_RGX, '/:n')
    .replace(NAME_RGX, '$1:name')
  const key = `${kind} ${method} ${route}`
  if (reportedRoutes.has(key)) return
  reportedRoutes.add(key)
  // Sentry records the breadcrumb of the request once the microtasks of its
  // response have run: capture in a later task to keep it.
  await new Promise(resolve => setTimeout(resolve))
  // Leaving the page cuts the requests still running.
  if (kind === 'no response' && isPageHidden) return
  const identity =
    err.status === 403 && isOwnData(path) ? await getSessionOwner() : null
  Sentry.captureMessage(`API ${kind} on ${method} ${route}`, {
    level: 'warning',
    fingerprint: ['api-error', key],
    tags: {
      'api.status': kind,
      'api.method': method,
      'api.route': route,
      // A browser that knows it is offline tells a lost connection apart
      // from a server that stopped answering.
      ...(kind === 'no response' && {
        'api.online': String(navigator.onLine)
      }),
      ...(identity && { 'api.identity': identity.result })
    },
    contexts: {
      api: {
        path: cleanPath,
        // A proxy answers with an HTML page, which becomes the message.
        message: (err.body?.message || err.message)?.slice(0, 300),
        duration_ms: duration
      },
      ...(identity && { identity })
    }
  })
}

export default {
  init(app, router, { dsn, sampleRate = 0.1 }) {
    Sentry.init({
      Vue: app,
      dsn,
      enabled: import.meta.env.PROD,
      release: `${name}@${version}`,
      integrations: [
        Sentry.browserTracingIntegration({
          router
        })
      ],
      tracesSampleRate: sampleRate, // capture Trace for % of transactions for performance monitoring
      beforeSend(event, hint) {
        if (hint.originalException && isChunkError(hint.originalException)) {
          return null
        }
        if (isReportedRequestFailure(event, hint)) return null
        if (isForeignError(event)) return null
        return scrubEvent(event)
      },
      beforeSendTransaction(event) {
        return scrubEvent(event)
      },
      // The INP span of an interaction goes out alone, through neither hook
      // above, named after the path the page loaded with.
      beforeSendSpan(span) {
        scrubData(span)
        return span
      }
    })
    setErrorReporter(reportApiError)
    window.addEventListener('pagehide', () => {
      isPageHidden = true
    })
    window.addEventListener('pageshow', () => {
      isPageHidden = false
    })
  },

  setContext(organisation, user) {
    userId = user.id
    Sentry.setTag('kitsu.org', organisation.name)
    Sentry.setTag('kitsu.role', user.role)
    Sentry.setUser({
      id: user.id,
      locale: user.locale,
      timezone: user.timezone
    })
  }
}
