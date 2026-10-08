import * as Sentry from '@sentry/vue'
import superagent from 'superagent'

import { name, version } from '@/../package.json'
import { isChunkError } from '@/lib/chunk-error'
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

const ID_RGX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const DATE_RGX = /\d{4}-\d{2}-\d{2}/g
const SESSION_CHECK_TIMEOUT = 20000

let userId = null
const reportedRoutes = new Set()

const isOwnData = path =>
  path.startsWith('/api/data/user/') || Boolean(userId && path.includes(userId))

// A refused write, a refused read of the user's own data, and a rejected
// payload point at a bug. Other refused reads are expected, like an access
// lost meanwhile, and the 2FA setup gate refuses everything on purpose.
const isWorthReporting = (err, method, path) => {
  if (err?.body?.two_factor_authentication_required) return false
  if (err?.status === 400 || err?.status === 422) return true
  return err?.status === 403 && (method !== 'GET' || isOwnData(path))
}

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

// One warning per route and session, whatever the ids in the path.
export const reportApiError = async (err, { method, path }) => {
  if (!isWorthReporting(err, method, path)) return
  const cleanPath = scrubSharedToken(path.split('?')[0])
  const route = cleanPath.replace(ID_RGX, ':id').replace(DATE_RGX, ':date')
  const key = `${err.status} ${method} ${route}`
  if (reportedRoutes.has(key)) return
  reportedRoutes.add(key)
  // Sentry records the breadcrumb of the request once the microtasks of its
  // response have run: capture in a later task to keep it.
  await new Promise(resolve => setTimeout(resolve))
  const identity =
    err.status === 403 && isOwnData(path) ? await getSessionOwner() : null
  Sentry.captureMessage(`API ${err.status} on ${method} ${route}`, {
    level: 'warning',
    fingerprint: ['api-error', key],
    tags: {
      'api.status': err.status,
      'api.method': method,
      'api.route': route,
      ...(identity && { 'api.identity': identity.result })
    },
    contexts: {
      api: { path: cleanPath, message: err.body?.message },
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
