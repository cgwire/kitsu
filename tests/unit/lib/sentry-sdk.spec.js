import { startSession } from '@sentry/vue'
import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import sentry from '@/lib/sentry'

const NativeError = Error
const Page = {}

// What the script of the page put in place of window.Error, with what the
// production build gives the errors of vue-router: no message, and the
// frames of the vendor chunk under the replacement.
function new_constructor() {
  const error = new NativeError()
  error.stack = [
    'Error',
    '    at new_constructor (<anonymous>:191:17)',
    `    at xu (${location.origin}/assets/vue-vendor-15NSOsgB.js:2:75141)`,
    `    at l (${location.origin}/assets/vue-vendor-15NSOsgB.js:2:79737)`
  ].join('\n')
  return error
}

describe('lib/sentry with the SDK', () => {
  const fetch = vi.fn(() =>
    Promise.resolve({ status: 200, headers: { get: () => null } })
  )
  let router

  // The items of a type in the envelopes posted to Sentry.
  const getSentItems = type =>
    fetch.mock.calls.flatMap(([, { body }]) => {
      const [, ...items] = body.split('\n')
      return items.flatMap((line, index) =>
        index % 2 === 0 && JSON.parse(line).type === type
          ? [JSON.parse(items[index + 1])]
          : []
      )
    })

  // vue-router reads window.Error at each call.
  const pushWithReplacedError = async locations => {
    globalThis.Error = new_constructor
    try {
      for (const location of locations) {
        await router.push(location).catch(() => {})
      }
    } finally {
      globalThis.Error = NativeError
    }
  }

  beforeAll(() => {
    vi.stubEnv('PROD', true)
    vi.stubGlobal('fetch', fetch)
  })

  afterAll(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Page },
        { path: '/login', name: 'login', component: Page },
        { path: '/other', name: 'other', component: Page },
        {
          path: '/private',
          name: 'private',
          component: Page,
          beforeEnter: () => ({ name: 'login' })
        },
        {
          path: '/elsewhere',
          name: 'elsewhere',
          component: Page,
          beforeEnter: () => ({ name: 'other' })
        }
      ]
    })
    sentry.init(createApp({}), router, {
      dsn: 'https://key@sentry.example.invalid/1',
      sampleRate: 0
    })
    await router.push('/')
    fetch.mockClear()
  })

  // Kitsu recovers from these failures: they must not count as crashes in
  // the release health.
  test('reports a navigation failure as handled, its session not crashed', async () => {
    const { sid } = startSession()
    await pushWithReplacedError(['/private'])
    const [event] = getSentItems('event')
    expect(event.level).toBe('warning')
    expect(event.exception.values[0].mechanism.handled).toBe(true)
    const sessions = getSentItems('session').filter(item => item.sid === sid)
    expect(sessions.map(session => session.status)).toEqual(['ok'])
  })

  // Dedupe drops an event like the one before it.
  test('sends a repeat of the same navigation failure once', async () => {
    await pushWithReplacedError(['/private', '/private'])
    const events = getSentItems('event')
    expect(events.map(event => event.exception.values[0].value)).toEqual([
      'redirect from private to login (window.Error replaced)'
    ])
  })

  test('sends each of two different navigation failures', async () => {
    await pushWithReplacedError(['/private', '/elsewhere'])
    const events = getSentItems('event')
    expect(events.map(event => event.exception.values[0].value)).toEqual([
      'redirect from private to login (window.Error replaced)',
      'redirect from elsewhere to other (window.Error replaced)'
    ])
  })
})
