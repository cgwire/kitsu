// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store', () => ({
  default: {
    commit: vi.fn(),
    dispatch: vi.fn(),
    state: { user: { user: { id: 'user-1' } } }
  }
}))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

import drafts from '@/lib/drafts'
import init from '@/lib/init'
import router from '@/router'
import store from '@/store'
import { DATA_LOADING_END, DATA_LOADING_START } from '@/store/mutation-types'

describe('lib/init', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    drafts.setUserScope()
    vi.restoreAllMocks()
  })

  test('loads the context, then the organisation', async () => {
    const steps = []
    store.commit.mockImplementation(type => steps.push(type))
    store.dispatch.mockImplementation(async action => steps.push(action))

    await expect(init()).resolves.toBe(true)

    expect(steps).toEqual([
      DATA_LOADING_START,
      'loadContext',
      'getOrganisation',
      DATA_LOADING_END
    ])
  })

  test('keeps the comment drafts of the logged-in user apart', async () => {
    store.dispatch.mockResolvedValue()

    await init()
    drafts.setTaskDraft('task-1', 'my draft')

    expect(localStorage.getItem('draft-user-1-task-1')).not.toBeNull()
  })

  test('sends a refused context to the two-factor page', async () => {
    store.dispatch.mockRejectedValueOnce(
      Object.assign(new Error('Second factor required'), { status: 403 })
    )

    await expect(init()).resolves.toBe(false)

    expect(router.push).toHaveBeenCalledWith({ name: 'login-2fa' })
    expect(store.commit).toHaveBeenLastCalledWith(DATA_LOADING_END)
  })

  test('ends the loading and passes any other failure on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = Object.assign(new Error('Bad gateway'), { status: 502 })
    store.dispatch.mockRejectedValueOnce(error)

    await expect(init()).rejects.toBe(error)

    expect(store.commit).toHaveBeenLastCalledWith(DATA_LOADING_END)
    expect(console.error).toHaveBeenCalledWith(
      'An init operation failed: ',
      error
    )
    expect(router.push).not.toHaveBeenCalled()
  })
})
