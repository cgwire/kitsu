// @vitest-environment node

import { vi } from 'vitest'

const h = vi.hoisted(() => ({
  init: null,
  captureMessage: null,
  setErrorReporter: null,
  authenticated: null
}))

vi.mock('@sentry/vue', () => {
  h.init = vi.fn()
  h.captureMessage = vi.fn()
  return {
    init: h.init,
    browserTracingIntegration: vi.fn(),
    captureMessage: h.captureMessage,
    setTag: vi.fn(),
    setUser: vi.fn()
  }
})

vi.mock('superagent', () => ({
  default: {
    get: vi.fn(() => ({ timeout: () => h.authenticated() }))
  }
}))

vi.mock('@/lib/chunk-error', () => ({ isChunkError: () => false }))

vi.mock('@/store/api/client', () => {
  h.setErrorReporter = vi.fn()
  return { setErrorReporter: h.setErrorReporter }
})

import sentry, { reportApiError, scrubSharedToken } from '@/lib/sentry'

const OWN_ID = '11111111-1111-4111-8111-111111111111'
const OTHER_ID = '22222222-2222-4222-8222-222222222222'
const THIRD_ID = '33333333-3333-4333-8333-333333333333'

describe('lib/sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.authenticated = async () => ({ body: { user: { id: OWN_ID } } })
    sentry.setContext({ name: 'Studio' }, { id: OWN_ID, role: 'user' })
  })

  test('init hands the API error reporter to the client', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    expect(h.setErrorReporter).toHaveBeenCalledWith(reportApiError)
  })

  test('init strips the share token from the API paths of the breadcrumbs', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSend } = h.init.mock.calls[0][0]
    const event = {
      breadcrumbs: [{ data: { url: '/api/shared/playlists/s3cr3t/context' } }]
    }
    expect(beforeSend(event, {}).breadcrumbs[0].data.url).toBe(
      '/api/shared/playlists/[token]/context'
    )
  })

  test('init strips the share token from the routes that manage the link', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSend } = h.init.mock.calls[0][0]
    const links = `/api/data/playlists/${OTHER_ID}/share`
    const event = {
      breadcrumbs: [
        { category: 'xhr', data: { method: 'DELETE', url: `${links}/s3cr3t` } },
        {
          category: 'xhr',
          data: { method: 'POST', url: `${links}/s3cr3t/invite` }
        },
        { category: 'xhr', data: { method: 'GET', url: links } }
      ]
    }
    const urls = beforeSend(event, {}).breadcrumbs.map(({ data }) => data.url)
    expect(urls).toEqual([
      `${links}/[token]`,
      `${links}/[token]/invite`,
      links
    ])
  })

  // Sentry copies the URL of the page, of its referrer, of the requests and
  // of the navigations as they are, query included.
  test('init filters the emails, secrets and search texts out of the URLs', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSend } = h.init.mock.calls[0][0]
    const origin = 'https://kitsu.example.com'
    const reset = `${origin}/reset-change-password`
    const shots = `/productions/${OTHER_ID}/shots`
    const event = {
      request: {
        url: `${reset}?email=jane@example.com&token=K1T5U&type=new`,
        headers: { Referer: `${origin}${shots}?search=jane&tab=casting` }
      },
      breadcrumbs: [
        {
          category: 'xhr',
          data: { url: '/api/auth/email-otp?email=jane@example.com' }
        },
        {
          category: 'fetch',
          data: { url: `/api/data/tasks?project_id=${OTHER_ID}&page=2` }
        },
        {
          category: 'navigation',
          data: {
            from: `${shots}?search=assignedto[Anim]=[Jane+Doe]`,
            to: `/login?redirect=${shots}?search=jane`
          }
        },
        {
          category: 'navigation',
          data: { from: '/login', to: '/app-login?port=8765&state=Xy3' }
        }
      ]
    }
    const { request, breadcrumbs } = beforeSend(event, {})
    expect(request).toEqual({
      url: `${reset}?email=[Filtered]&token=[Filtered]&type=new`,
      headers: { Referer: `${origin}${shots}?search=[Filtered]&tab=casting` }
    })
    expect(breadcrumbs.map(({ data }) => data)).toEqual([
      { url: '/api/auth/email-otp?email=[Filtered]' },
      { url: `/api/data/tasks?project_id=${OTHER_ID}&page=2` },
      { from: `${shots}?search=[Filtered]`, to: '/login?redirect=[Filtered]' },
      { from: '/login', to: '/app-login?port=8765&state=[Filtered]' }
    ])
  })

  // The router integration also sets each parameter of the route alone on
  // the transaction.
  test('init strips the share token from the transactions of the guest page', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSendTransaction } = h.init.mock.calls[0][0]
    const event = {
      transaction: 'shared-playlist',
      contexts: {
        trace: {
          data: {
            'url.path': '/playlists/shared/s3cr3t',
            'params.token': 's3cr3t',
            'url.path.parameter.token': 's3cr3t'
          }
        }
      },
      spans: [
        {
          description: 'GET /api/shared/playlists/s3cr3t/context',
          data: { url: '/api/shared/playlists/s3cr3t/context' }
        }
      ]
    }
    expect(beforeSendTransaction(event)).toEqual({
      transaction: 'shared-playlist',
      contexts: {
        trace: {
          data: {
            'url.path': '/playlists/shared/[token]',
            'params.token': '[Filtered]',
            'url.path.parameter.token': '[Filtered]'
          }
        }
      },
      spans: [
        {
          description: 'GET /api/shared/playlists/[token]/context',
          data: { url: '/api/shared/playlists/[token]/context' }
        }
      ]
    })
  })

  test('init filters the emails and secrets out of the transactions', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSendTransaction } = h.init.mock.calls[0][0]
    const reset = 'https://kitsu.example.com/reset-change-password'
    const event = {
      contexts: {
        trace: {
          data: {
            'url.full': `${reset}?email=jane@example.com&token=K1T5U&type=new`,
            'query.email': 'jane@example.com',
            'query.token': 'K1T5U',
            'query.search': ['jane', 'john'],
            'query.type': 'new'
          }
        }
      },
      spans: [
        {
          description: 'GET /api/auth/email-otp',
          data: {
            url: '/api/auth/email-otp?email=jane@example.com',
            'http.query': '?email=jane@example.com'
          }
        }
      ]
    }
    const { contexts, spans } = beforeSendTransaction(event)
    expect(contexts.trace.data).toEqual({
      'url.full': `${reset}?email=[Filtered]&token=[Filtered]&type=new`,
      'query.email': '[Filtered]',
      'query.token': '[Filtered]',
      'query.search': ['[Filtered]', '[Filtered]'],
      'query.type': 'new'
    })
    expect(spans[0].data).toEqual({
      url: '/api/auth/email-otp?email=[Filtered]',
      'http.query': '?email=[Filtered]'
    })
  })

  // The INP span of an interaction goes out alone, named after the path the
  // page loaded with.
  test('init strips the share token from the spans sent alone', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSendSpan } = h.init.mock.calls[0][0]
    const span = {
      op: 'ui.interaction.click',
      data: { transaction: '/playlists/shared/s3cr3t' }
    }
    expect(beforeSendSpan(span)).toEqual({
      op: 'ui.interaction.click',
      data: { transaction: '/playlists/shared/[token]' }
    })
  })

  // The event also holds SDK objects, like its scopes, which are never sent.
  test('init leaves the objects of the SDK out of the scrub', () => {
    sentry.init({}, {}, { dsn: 'https://key@sentry.example.com/1' })
    const { beforeSend } = h.init.mock.calls[0][0]
    class Scope {}
    const scope = Object.assign(new Scope(), { url: '/playlists/shared/x' })
    scope.self = scope
    const event = { sdkProcessingMetadata: { capturedSpanScope: scope } }
    expect(beforeSend(event, {})).toBe(event)
    expect(scope.url).toBe('/playlists/shared/x')
  })

  test('scrubSharedToken strips the token of the page and of the API', () => {
    expect(scrubSharedToken('/playlists/shared/s3cr3t?x=1')).toBe(
      '/playlists/shared/[token]?x=1'
    )
    expect(scrubSharedToken('/api/shared/playlists/s3cr3t/guest')).toBe(
      '/api/shared/playlists/[token]/guest'
    )
  })

  // Each test takes a fresh route: the reporter reports a route once per
  // session, whatever the ids in its path.
  describe('reportApiError', () => {
    let routeCount = 0
    const nextRoute = () => `/api/data/check-${routeCount++}`
    const report = (status, method, path, body = { message: 'Nope' }) =>
      reportApiError({ status, body }, { method, path })

    // Sentry records the breadcrumb of a request once the microtasks of its
    // response have run: a capture among them would leave it out.
    test('captures in a later task, after the breadcrumb of the request', async () => {
      const reported = report(400, 'POST', nextRoute())
      for (let tick = 0; tick < 10; tick++) await Promise.resolve()
      expect(h.captureMessage).not.toHaveBeenCalled()
      await reported
      expect(h.captureMessage).toHaveBeenCalledTimes(1)
    })

    test('reports a refused write as a warning, one issue per route', async () => {
      const route = nextRoute()
      await report(403, 'PUT', `${route}/${OTHER_ID}/team?relations=true`)
      const message = `API 403 on PUT ${route}/:id/team`
      expect(h.captureMessage).toHaveBeenCalledWith(message, {
        level: 'warning',
        fingerprint: ['api-error', `403 PUT ${route}/:id/team`],
        tags: {
          'api.status': 403,
          'api.method': 'PUT',
          'api.route': `${route}/:id/team`
        },
        contexts: {
          api: { path: `${route}/${OTHER_ID}/team`, message: 'Nope' }
        }
      })
    })

    test('leaves out a refused read of the data of somebody else', async () => {
      await report(403, 'GET', `${nextRoute()}/${OTHER_ID}/day-offs/`)
      expect(h.captureMessage).not.toHaveBeenCalled()
    })

    test("reports a refused read of the user's own data, with the session owner", async () => {
      const route = nextRoute()
      await report(403, 'GET', `${route}/${OWN_ID}/day-offs/`)
      expect(h.captureMessage).toHaveBeenCalledWith(
        `API 403 on GET ${route}/:id/day-offs/`,
        expect.objectContaining({
          tags: expect.objectContaining({ 'api.identity': 'same' }),
          contexts: expect.objectContaining({ identity: { result: 'same' } })
        })
      )
    })

    test('names the person who now holds the session', async () => {
      h.authenticated = async () => ({ body: { user: { id: OTHER_ID } } })
      await report(403, 'GET', `${nextRoute()}/${OWN_ID}`)
      const [, context] = h.captureMessage.mock.calls[0]
      expect(context.tags['api.identity']).toBe('changed')
      expect(context.contexts.identity).toEqual({
        result: 'changed',
        user_id: OTHER_ID
      })
    })

    test('tells when the session is over', async () => {
      h.authenticated = async () => {
        throw Object.assign(new Error('Unauthorized'), { status: 401 })
      }
      await report(403, 'GET', `${nextRoute()}/${OWN_ID}`)
      expect(h.captureMessage.mock.calls[0][1].contexts.identity).toEqual({
        result: 'logged_out'
      })
    })

    test('tells when the session owner is unknown', async () => {
      h.authenticated = async () => {
        throw new Error('Request has been terminated')
      }
      await report(403, 'GET', `${nextRoute()}/${OWN_ID}`)
      expect(h.captureMessage.mock.calls[0][1].contexts.identity).toEqual({
        result: 'unknown'
      })
    })

    test('counts the user routes as own data', async () => {
      await report(403, 'GET', '/api/data/user/context')
      expect(h.captureMessage).toHaveBeenCalledWith(
        'API 403 on GET /api/data/user/context',
        expect.objectContaining({
          tags: expect.objectContaining({ 'api.identity': 'same' })
        })
      )
    })

    test('reports a rejected payload', async () => {
      await report(400, 'POST', nextRoute())
      await report(422, 'GET', nextRoute())
      expect(h.captureMessage).toHaveBeenCalledTimes(2)
    })

    test('leaves out the other failures', async () => {
      await report(404, 'GET', nextRoute())
      await report(500, 'PUT', nextRoute())
      await report(undefined, 'POST', nextRoute())
      expect(h.captureMessage).not.toHaveBeenCalled()
    })

    test('leaves out the refusals of the 2FA setup gate', async () => {
      await report(403, 'POST', nextRoute(), {
        error: true,
        two_factor_authentication_required: true
      })
      expect(h.captureMessage).not.toHaveBeenCalled()
    })

    test('reports a route once per session', async () => {
      const route = nextRoute()
      await report(403, 'DELETE', `${route}/${OTHER_ID}`)
      await report(403, 'DELETE', `${route}/${THIRD_ID}`)
      expect(h.captureMessage).toHaveBeenCalledTimes(1)
    })

    // Zou makes the token like an id: the route hid it, not the path.
    test('strips the share token from the routes that manage the link', async () => {
      const link = `/api/data/playlists/${OTHER_ID}/share/${THIRD_ID}`
      await report(403, 'DELETE', link)
      await report(400, 'POST', `${link}/invite`)
      const route = '/api/data/playlists/:id/share/[token]'
      const path = `/api/data/playlists/${OTHER_ID}/share/[token]`
      expect(h.captureMessage.mock.calls.map(([message]) => message)).toEqual([
        `API 403 on DELETE ${route}`,
        `API 400 on POST ${route}/invite`
      ])
      expect(
        h.captureMessage.mock.calls.map(([, context]) => context.contexts.api)
      ).toMatchObject([{ path }, { path: `${path}/invite` }])
    })

    test('strips the share token and the dates from the route', async () => {
      await report(400, 'POST', '/api/shared/playlists/s3cr3t/guest')
      await report(400, 'GET', `${nextRoute()}/2026-10-07`)
      expect(h.captureMessage.mock.calls[0][0]).toBe(
        'API 400 on POST /api/shared/playlists/[token]/guest'
      )
      expect(h.captureMessage.mock.calls[0][1].contexts.api.path).toBe(
        '/api/shared/playlists/[token]/guest'
      )
      expect(h.captureMessage.mock.calls[1][0]).toMatch(/\/:date$/)
    })
  })
})
