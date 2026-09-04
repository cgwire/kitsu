// @vitest-environment node

import { vi } from 'vitest'

// Fake superagent: every call returns a thenable request that resolves with
// h.response or rejects with h.error, while recording what was requested.
const h = vi.hoisted(() => ({
  response: null,
  error: null,
  calls: [],
  sent: null,
  responseType: null
}))

vi.mock('superagent', () => {
  const makeRequest = () => {
    const request = {}
    request.timeout = vi.fn(() => request)
    request.send = vi.fn(data => {
      h.sent = data
      return request
    })
    request.responseType = vi.fn(type => {
      h.responseType = type
      return request
    })
    request.on = vi.fn(() => request)
    request.then = (onFulfilled, onRejected) => {
      const settled = h.error
        ? Promise.reject(h.error)
        : Promise.resolve(h.response)
      return settled.then(onFulfilled, onRejected)
    }
    request.catch = onRejected => request.then(undefined, onRejected)
    return request
  }
  const superagent = vi.fn((method, path) => {
    h.calls.push({ method, path })
    return makeRequest()
  })
  superagent.post = vi.fn(path => {
    h.calls.push({ method: 'POST', path })
    return makeRequest()
  })
  return { default: superagent }
})

vi.mock('@/lib/errors', () => ({
  default: { backToLogin: vi.fn() }
}))

import client, { buildQuery } from '@/store/api/client'
import errors from '@/lib/errors'

describe('store/api/client', () => {
  beforeEach(() => {
    h.response = null
    h.error = null
    h.calls = []
    h.sent = null
    h.responseType = null
    vi.clearAllMocks()
  })

  test('pget resolves with the response body', async () => {
    h.response = { body: { id: 'model-1' } }
    await expect(client.pget('/api/data/foo')).resolves.toEqual({
      id: 'model-1'
    })
    expect(h.calls).toEqual([{ method: 'GET', path: '/api/data/foo' }])
  })

  test('ppost sends the payload', async () => {
    h.response = { body: { ok: true } }
    await client.ppost('/api/data/foo', { name: 'foo' })
    expect(h.calls).toEqual([{ method: 'POST', path: '/api/data/foo' }])
    expect(h.sent).toEqual({ name: 'foo' })
  })

  test('a 401 redirects to login and never settles the promise', async () => {
    h.error = { response: { status: 401 } }
    const outcome = await Promise.race([
      client.pget('/api/data/foo').then(
        () => 'resolved',
        () => 'rejected'
      ),
      new Promise(resolve => setTimeout(() => resolve('pending'), 20))
    ])
    expect(outcome).toBe('pending')
    expect(errors.backToLogin).toHaveBeenCalled()
  })

  test('other HTTP errors reject with the response body attached', async () => {
    h.error = { response: { status: 500, body: { message: 'boom' } } }
    await expect(client.pget('/api/data/foo')).rejects.toMatchObject({
      body: { message: 'boom' }
    })
    expect(errors.backToLogin).not.toHaveBeenCalled()
  })

  test('network errors without a response reject with an empty body', async () => {
    h.error = new Error('socket hang up')
    await expect(client.pget('/api/data/foo')).rejects.toMatchObject({
      body: ''
    })
  })

  test('getText resolves with the response text', async () => {
    h.response = { text: 'plain content' }
    await expect(client.getText('/api/foo.txt')).resolves.toEqual(
      'plain content'
    )
  })

  test('getBlob requests a blob response type', async () => {
    const blob = new Blob(['binary'])
    h.response = { body: blob }
    await expect(client.getBlob('/api/foo.png')).resolves.toBe(blob)
    expect(h.responseType).toBe('blob')
  })

  test('getModel builds the path, with and without relations', async () => {
    h.response = { body: {} }
    await client.getModel('persons', 'person-1')
    await client.getModel('persons', 'person-1', true)
    expect(h.calls.map(call => call.path)).toEqual([
      '/api/data/persons/person-1',
      '/api/data/persons/person-1?relations=true'
    ])
  })

  test('getEvents appends the cursor only when provided', async () => {
    h.response = { body: [] }
    const filters = { after: '2023-01-01', before: '2023-01-02', limit: 100 }
    await client.getEvents(filters)
    await client.getEvents({ ...filters, lastEventId: 'event-1' })
    expect(h.calls[0].path).toEqual(
      '/api/data/events/last?after=2023-01-01&before=2023-01-02&limit=100'
    )
    expect(h.calls[1].path).toEqual(
      '/api/data/events/last?after=2023-01-01&before=2023-01-02&limit=100' +
        '&cursor_event_id=event-1'
    )
  })

  test('searchData omits the production filter for "all"', async () => {
    h.response = { body: [] }
    await client.searchData('rabbit', 10, 0, ['assets'], 'all')
    expect(h.sent.project_id).toBeUndefined()
    await client.searchData('rabbit', 10, 0, ['assets'], 'production-1')
    expect(h.sent.project_id).toEqual('production-1')
  })

  describe('pgetNdjson', () => {
    // NDJSON body split in two chunks, cutting a line in half, to
    // exercise the buffering.
    const ndjsonResponse = lines => {
      const text = lines.map(line => JSON.stringify(line)).join('\n') + '\n'
      const encoder = new TextEncoder()
      const middle = Math.floor(text.length / 2)
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'application/x-ndjson' },
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(text.slice(0, middle)))
            controller.enqueue(encoder.encode(text.slice(middle)))
            controller.close()
          }
        })
      }
    }

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('requests stream+compact and maps rows by field name', async () => {
      const fetchMock = vi.fn(async () =>
        ndjsonResponse([
          {
            compact: true,
            asset_fields: ['id', 'name', 'tasks'],
            task_fields: ['id', 'task_status_id']
          },
          ['asset-1', 'Chair', [['task-1', 'status-open']]],
          ['asset-2', 'Table', []]
        ])
      )
      vi.stubGlobal('fetch', fetchMock)
      const entities = await client.pgetNdjson(
        '/api/data/assets/with-tasks?project_id=production-1'
      )
      expect(fetchMock.mock.calls[0][0]).toEqual(
        '/api/data/assets/with-tasks?project_id=production-1' +
          '&stream=true&compact=true'
      )
      expect(entities).toEqual([
        {
          id: 'asset-1',
          name: 'Chair',
          tasks: [
            { id: 'task-1', task_status_id: 'status-open', assignees: [] }
          ]
        },
        { id: 'asset-2', name: 'Table', tasks: [] }
      ])
    })

    test('falls back to the legacy request when the answer is not NDJSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: false,
          status: 400,
          headers: { get: () => 'application/json' }
        }))
      )
      h.response = { body: [{ id: 'asset-1' }] }
      await expect(
        client.pgetNdjson('/api/data/shots/with-tasks')
      ).resolves.toEqual([{ id: 'asset-1' }])
      expect(h.calls).toEqual([
        { method: 'GET', path: '/api/data/shots/with-tasks' }
      ])
    })

    test('a 401 redirects to login and never settles the promise', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({ status: 401 })))
      const outcome = await Promise.race([
        client.pgetNdjson('/api/data/shots/with-tasks').then(
          () => 'resolved',
          () => 'rejected'
        ),
        new Promise(resolve => setTimeout(() => resolve('pending'), 20))
      ])
      expect(outcome).toBe('pending')
      expect(errors.backToLogin).toHaveBeenCalled()
    })
  })

  describe('buildQuery', () => {
    test('drops empty values so an unset filter never reaches the API', () => {
      expect(
        buildQuery({
          limit: 100,
          after: null,
          before: undefined,
          project_id: '',
          person_ids: []
        })
      ).toBe('limit=100')
    })

    test('repeats the key once per array entry', () => {
      expect(buildQuery({ person_ids: ['a', 'b'] })).toBe(
        'person_ids=a&person_ids=b'
      )
    })

    test('escapes values', () => {
      expect(buildQuery({ name_prefixes: ['%'] })).toBe('name_prefixes=%25')
    })
  })

  describe('log endpoints', () => {
    test('getEvents maps the filters to query parameters', async () => {
      h.response = { body: [] }
      await client.getEvents({
        limit: 1000,
        after: '2026-07-01T00:00:00',
        personIds: ['person-1', 'person-2'],
        namePrefixes: ['task'],
        nameSuffixes: ['update', 'new'],
        onlyFiles: true,
        projectId: 'project-1'
      })
      expect(h.calls[0].path).toBe(
        '/api/data/events/last?after=2026-07-01T00%3A00%3A00&limit=1000' +
          '&project_id=project-1&only_files=true' +
          '&person_ids=person-1&person_ids=person-2' +
          '&name_prefixes=task&name_suffixes=update&name_suffixes=new'
      )
    })

    test('getEvents omits only_files when it is false', async () => {
      h.response = { body: [] }
      await client.getEvents({ limit: 10 })
      expect(h.calls[0].path).toBe('/api/data/events/last?limit=10')
    })

    test('getLoginLogs passes the cursor and the person filter', async () => {
      h.response = { body: [] }
      await client.getLoginLogs({
        limit: 100,
        lastLoginLogId: 'log-1',
        personIds: ['person-1']
      })
      expect(h.calls[0].path).toBe(
        '/api/data/events/login-logs/last?limit=100' +
          '&cursor_login_log_id=log-1&person_ids=person-1'
      )
    })
  })
})
