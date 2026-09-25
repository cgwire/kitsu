import { vi } from 'vitest'

// Importing the edits page transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import Edits from '@/components/pages/Edits.vue'

describe('Edits page, reloadEpisodeEditsIfNeeded', () => {
  const production = { id: 'p' }

  // The method only reads its component instance, so a plain object is
  // enough to exercise the staleness decision without mounting the page.
  const buildContext = (overrides = {}) => {
    const context = {
      currentProduction: production,
      currentEpisode: null,
      isTVShow: false,
      editsLoadingKey: 'p/',
      initialLoading: false,
      loadEdits: vi.fn(),
      $refs: {},
      $store: { commit: vi.fn() },
      ...overrides
    }
    context.reset = () => Edits.methods.reset.call(context)
    return context
  }

  const run = context => {
    Edits.methods.reloadEpisodeEditsIfNeeded.call(context)
    return context
  }

  test('reloads when the store holds another episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-b' },
        editsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadEdits).toHaveBeenCalled()
    expect(context.initialLoading).toBe(true)
  })

  test('reloads when the store holds the production-wide dataset', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/all'
      })
    )

    expect(context.loadEdits).toHaveBeenCalled()
  })

  test('does not reload when the store holds the displayed episode', () => {
    const context = run(
      buildContext({
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/ep-a'
      })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
    expect(context.initialLoading).toBe(false)
  })

  test('does not reload on a production without episodes', () => {
    const context = run(
      buildContext({
        // A stale currentEpisode left by a previous TV show must not make an
        // episode-less production look out of scope.
        currentEpisode: { id: 'ep-a' },
        editsLoadingKey: 'p/'
      })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
  })

  test('does nothing while no production is set', () => {
    const context = run(
      buildContext({ currentProduction: null, editsLoadingKey: null })
    )

    expect(context.loadEdits).not.toHaveBeenCalled()
  })
})

describe('Edits page, uploadImportFile', () => {
  const buildContext = uploadEditFile => ({
    errors: { importing: false, importingError: null },
    loading: { importing: false },
    uploadEditFile,
    loadEpisodes: vi.fn(() => Promise.resolve()),
    loadEdits: vi.fn(),
    hideImportRenderModal: vi.fn(),
    $store: { commit: vi.fn() }
  })

  const upload = async context => {
    Edits.methods.uploadImportFile.call(
      context,
      [
        ['Name', 'Description'],
        ['E01', 'intro']
      ],
      false
    )
    await new Promise(resolve => setTimeout(resolve))
  }

  // The modal reads errors.importingError to show the rejected line or
  // the timeout message.
  test('hands the failure to the import modal', async () => {
    const error = Object.assign(new Error('Bad Request'), { status: 400 })
    const context = buildContext(vi.fn(() => Promise.reject(error)))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await upload(context)

    expect(context.errors.importing).toBe(true)
    expect(context.errors.importingError).toBe(error)
    expect(context.loading.importing).toBe(false)
  })

  test('clears the previous failure before a new upload', async () => {
    const context = buildContext(vi.fn(() => Promise.resolve()))
    context.errors.importingError = new Error('previous')

    await upload(context)

    expect(context.errors.importingError).toBe(null)
    expect(context.hideImportRenderModal).toHaveBeenCalled()
  })
})
