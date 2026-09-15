// @vitest-environment node

import { vi } from 'vitest'

// Importing the assets module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import assetsStore from '@/store/modules/assets'
import assetsApi from '@/store/api/assets'
import entitiesApi from '@/store/api/entities'
import taskStatusStore from '@/store/modules/taskstatus'
import { buildAssetIndex } from '@/lib/indexing'

const baseRootGetters = () => ({
  assetTypeMap: new Map(),
  currentProduction: { id: 'p1' },
  currentEpisode: null,
  isTVShow: false,
  userFilters: {},
  userFilterGroups: {},
  personMap: new Map(),
  taskTypeMap: new Map(),
  taskMap: new Map(),
  episodes: []
})

// Run the real mutation against the shared state so the loading flag actually
// flips, reproducing what a live concurrent dispatch would see.
const realCommit = state =>
  vi.fn((type, payload) => assetsStore.mutations[type]?.(state, payload))

describe('Assets store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    assetsStore.cache.assetsLoadingPromise = null
  })

  describe('loadAssets race conditions', () => {
    test('dedups concurrent calls: the second call resolves to the in-flight assets, not the cleared cache (BUG-2)', async () => {
      const sentinel = [{ id: 'a1', asset_type_id: 't1', name: 'A1' }]
      const getAssets = vi
        .spyOn(assetsApi, 'getAssets')
        .mockResolvedValue(sentinel)
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const commit = realCommit(state)
      const rootGetters = baseRootGetters()
      const ctx = { commit, dispatch: vi.fn(), state, rootGetters }

      const p1 = assetsStore.actions.loadAssets(ctx, { withShared: false })
      expect(state.isAssetsLoading).toBe(true)
      expect(assetsStore.cache.assetsLoadingPromise).toBeTruthy()

      // Second concurrent dispatch while the first is still loading. The guard
      // must hand back the in-flight promise (yielding the real assets), not
      // refetch and not return the freshly-cleared cache — the historical
      // `loadAssets → []` bug returned the emptied cache here.
      const p2 = assetsStore.actions.loadAssets(ctx, { withShared: false })
      // Switch away so the response short-circuits before the heavy
      // LOAD_ASSETS_END commit; both calls still resolve to the loaded assets.
      rootGetters.currentProduction = { id: 'p2' }
      assetsStore.mutations.CLEAR_ASSETS(state)

      const [r1, r2] = await Promise.all([p1, p2])
      expect(getAssets).toHaveBeenCalledTimes(1)
      expect(r1).toEqual(sentinel)
      expect(r2).toEqual(sentinel) // buggy guard resolved to [] instead
    })

    test('does not adopt an in-flight load made for another episode', async () => {
      const buildAsset = id => ({
        id,
        name: id,
        asset_type_id: 't1',
        asset_type_name: 'Char',
        canceled: false,
        tasks: [],
        data: {}
      })
      const assetsA = [buildAsset('a-ep-a')]
      const assetsB = [buildAsset('a-ep-b')]
      let releaseA = () => {}
      const getAssets = vi
        .spyOn(assetsApi, 'getAssets')
        .mockImplementation((production, episode) =>
          episode?.id === 'ep-a'
            ? new Promise(resolve => {
                releaseA = () => resolve(assetsA)
              })
            : Promise.resolve(assetsB)
        )
      const state = {
        isAssetsLoading: false,
        isAssetsLoadingError: false,
        assetsLoadingKey: null,
        assetSearchText: ''
      }
      const commit = realCommit(state)
      const rootGetters = {
        ...baseRootGetters(),
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }]
      }
      const ctx = { commit, state, rootGetters }
      ctx.dispatch = vi.fn((name, payload) =>
        assetsStore.actions[name](ctx, payload)
      )

      const promiseA = assetsStore.actions.loadAssets(ctx, {
        withShared: false
      })
      // The user picks another episode while the first load is still running.
      rootGetters.currentEpisode = { id: 'ep-b' }
      const promiseB = assetsStore.actions.loadAssets(ctx, {
        withShared: false
      })
      releaseA()

      const [, resultB] = await Promise.all([promiseA, promiseB])
      expect(getAssets).toHaveBeenCalledTimes(2)
      // The episode-B caller must get episode B's assets, not the ones the
      // episode-A load was already fetching.
      expect(resultB.map(asset => asset.id)).toEqual(['a-ep-b'])
    })

    test('a second queued caller resolves with the episode that was loaded', async () => {
      const buildAsset = id => ({
        id,
        name: id,
        asset_type_id: 't1',
        asset_type_name: 'Char',
        canceled: false,
        tasks: [],
        data: {}
      })
      const assetsA = [buildAsset('a-ep-a')]
      let releaseA = () => {}
      const getAssets = vi
        .spyOn(assetsApi, 'getAssets')
        .mockImplementation((production, episode) =>
          episode?.id === 'ep-a'
            ? new Promise(resolve => {
                releaseA = () => resolve(assetsA)
              })
            : Promise.resolve([buildAsset(`a-${episode?.id}`)])
        )
      const state = {
        isAssetsLoading: false,
        isAssetsLoadingError: false,
        assetsLoadingKey: null,
        assetSearchText: ''
      }
      const commit = realCommit(state)
      const rootGetters = {
        ...baseRootGetters(),
        isTVShow: true,
        currentEpisode: { id: 'ep-a' },
        episodes: [{ id: 'ep-a' }, { id: 'ep-b' }, { id: 'ep-c' }]
      }
      const ctx = { commit, state, rootGetters }
      ctx.dispatch = vi.fn((name, payload) =>
        assetsStore.actions[name](ctx, payload)
      )

      // The user clicks through two more episodes while ep-a is still in
      // flight: both queue behind it.
      const promiseA = assetsStore.actions.loadAssets(ctx, {
        withShared: false
      })
      rootGetters.currentEpisode = { id: 'ep-b' }
      const promiseB = assetsStore.actions.loadAssets(ctx, {
        withShared: false
      })
      rootGetters.currentEpisode = { id: 'ep-c' }
      const promiseC = assetsStore.actions.loadAssets(ctx, {
        withShared: false
      })
      releaseA()

      const [, , resultC] = await Promise.all([promiseA, promiseB, promiseC])
      // Once the first queued caller requeues for ep-c, the second must join
      // that load instead of being handed the ep-a assets it merely awaited.
      expect(getAssets).toHaveBeenCalledTimes(2)
      expect(resultC.map(asset => asset.id)).toEqual(['a-ep-c'])
    })

    test('records the loaded scope and clears it with the assets', () => {
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }

      assetsStore.mutations.LOAD_ASSETS_START(state, {
        loadingKey: 'p1/ep-a'
      })
      expect(state.assetsLoadingKey).toEqual('p1/ep-a')
      expect(assetsStore.getters.assetsLoadingKey(state)).toEqual('p1/ep-a')

      assetsStore.mutations.CLEAR_ASSETS(state)
      expect(state.assetsLoadingKey).toBeNull()
    })

    test('ignores a response for a production the user already switched away from (BUG-3)', async () => {
      const sentinel = [{ id: 'a1', asset_type_id: 't1', name: 'A1' }]
      vi.spyOn(assetsApi, 'getAssets').mockResolvedValue(sentinel)
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const commit = realCommit(state)
      const rootGetters = baseRootGetters()
      const ctx = { commit, dispatch: vi.fn(), state, rootGetters }

      const promise = assetsStore.actions.loadAssets(ctx, { withShared: false })
      // User navigates to another production before the response lands, and
      // the load of that production records its own scope.
      rootGetters.currentProduction = { id: 'p2' }
      state.assetsLoadingKey = 'p2/'
      const result = await promise

      expect(result).toEqual(sentinel)
      // Stale response must NOT overwrite the current production's assets...
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_ASSETS_END')
      // ...and must leave the loading flag to the newer load (reset by CLEAR).
      expect(state.isAssetsLoading).toBe(true)
    })

    // A production switch and back forgets the load in flight, and the load
    // started on return records its own scope: the late response must not
    // land under that newer key.
    test('drops a response whose scope a newer load replaced', async () => {
      vi.spyOn(assetsApi, 'getAssets').mockResolvedValue([
        { id: 'a1', asset_type_id: 't1', name: 'A1' }
      ])
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const commit = realCommit(state)

      const loading = assetsStore.actions.loadAssets(
        { commit, dispatch: vi.fn(), state, rootGetters: baseRootGetters() },
        { withShared: false }
      )
      state.assetsLoadingKey = 'p1/all#partial'
      await loading

      const types = commit.mock.calls.map(([type]) => type)
      expect(types).not.toContain('LOAD_ASSETS_END')
    })

    // The schedule under the all pseudo-episode loads without tasks nor
    // shared assets: a breakdown opened meanwhile must wait for that load,
    // then fetch its own dataset instead of adopting it.
    test('does not join a partial load in flight for a production-wide one', async () => {
      vi.spyOn(assetsApi, 'getAssets').mockResolvedValue([])
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const rootGetters = {
        ...baseRootGetters(),
        isTVShow: true,
        currentEpisode: { id: 'all' }
      }
      const ctx = { commit: realCommit(state), dispatch: vi.fn(), state, rootGetters }

      assetsStore.actions.loadAssets(ctx, { withTasks: false, withShared: false })
      const loading = assetsStore.actions.loadAssets(ctx, { all: true })
      // Switch away so the response short-circuits before LOAD_ASSETS_END.
      state.assetsLoadingKey = 'p2/'
      await loading

      expect(ctx.dispatch).toHaveBeenCalledWith('loadAssets', {
        all: true,
        withShared: true,
        withTasks: true
      })
    })

    // Its flag raised for the production left, no response would ever lower
    // it, and every later load would queue behind it in a loop.
    test('gives up when the production changed while it waited for the episodes', async () => {
      vi.spyOn(assetsApi, 'getAssets').mockResolvedValue([])
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const commit = realCommit(state)
      const rootGetters = { ...baseRootGetters(), isTVShow: true }
      // Like the real loadEpisodes, the fetch also resolves an episode:
      // without one the load stops on the no episode path, guard or not.
      const dispatch = vi.fn(async () => {
        rootGetters.currentProduction = { id: 'p2' }
        rootGetters.currentEpisode = { id: 'ep-a' }
      })

      const result = await assetsStore.actions.loadAssets({
        commit,
        dispatch,
        state,
        rootGetters
      })

      expect(result).toEqual([])
      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('cache.result aliasing on creation', () => {
    const makeAsset = (id, name) => ({
      id,
      name,
      asset_type_name: 'Char',
      canceled: false,
      timeSpent: 0,
      estimation: 0,
      tasks: [],
      data: {}
    })

    const searchPayload = assetSearch => ({
      assetSearch,
      production: { id: 'p1', descriptors: [] },
      taskStatusMap: new Map(),
      taskTypeMap: new Map(),
      persons: []
    })

    const makeState = () => ({
      assetSorting: [],
      assetTypes: [],
      displayedAssets: [],
      displayedAssetsTimeSpent: 0,
      displayedAssetsEstimation: 0
    })

    beforeEach(() => {
      const existing = makeAsset('a1', 'Existing')
      assetsStore.cache.assets = [existing]
      assetsStore.cache.assetMap = new Map([['a1', existing]])
      assetsStore.cache.assetIndex = {}
      assetsStore.cache.result = []
    })

    test('EDIT_ASSET_END does not duplicate the created asset when cache.result aliases cache.assets', () => {
      const state = makeState()

      // Empty query: indexSearch yields null, so buildResult falls back to
      // cache.assets and cache.result becomes the SAME array reference.
      assetsStore.mutations.SET_ASSET_SEARCH(state, searchPayload(''))
      expect(assetsStore.cache.result).toBe(assetsStore.cache.assets)

      assetsStore.mutations.EDIT_ASSET_END(state, {
        newAsset: makeAsset('a2', 'Created'),
        assetTypeMap: new Map()
      })

      // The next rebuild copies cache.result into displayedAssets: the
      // created asset must appear exactly once, not twice.
      assetsStore.mutations.SET_ASSET_SEARCH(state, searchPayload(''))
      expect(state.displayedAssets.filter(a => a.id === 'a2')).toHaveLength(1)
      expect(
        assetsStore.cache.assets.filter(a => a.id === 'a2')
      ).toHaveLength(1)
    })

    test('EDIT_ASSET_END still records the created asset in a distinct cache.result (active search)', () => {
      const state = makeState()

      // Non-empty query: indexSearch returns a fresh array, cache.result is
      // NOT aliased and must keep receiving the created asset.
      assetsStore.mutations.SET_ASSET_SEARCH(state, searchPayload('existing'))
      expect(assetsStore.cache.result).not.toBe(assetsStore.cache.assets)

      assetsStore.mutations.EDIT_ASSET_END(state, {
        newAsset: makeAsset('a2', 'Created'),
        assetTypeMap: new Map()
      })

      expect(
        assetsStore.cache.result.filter(a => a.id === 'a2')
      ).toHaveLength(1)
      expect(
        assetsStore.cache.assets.filter(a => a.id === 'a2')
      ).toHaveLength(1)
    })
  })

  describe('LOAD_ASSETS_END', () => {
    test('keeps the task own metadata (task descriptors) on reload', () => {
      taskStatusStore.cache.taskStatusMap = new Map([
        ['ts1', { id: 'ts1', short_name: 'wip' }]
      ])
      const task = {
        id: 't1',
        task_type_id: 'tt1',
        task_status_id: 'ts1',
        assignees: [],
        duration: 0,
        estimation: 0,
        data: { revision_note: 'keep me' }
      }
      const asset = {
        id: 'a1',
        name: 'A1',
        asset_type_id: 'type1',
        asset_type_name: 'Char',
        canceled: false,
        data: { color: 'blue' },
        tasks: [task]
      }
      const taskMap = new Map()

      assetsStore.mutations.LOAD_ASSETS_END(
        { assetSearchText: '' },
        {
          production: { id: 'p1' },
          assets: [asset],
          userFilters: {},
          userFilterGroups: {},
          personMap: new Map(),
          taskMap,
          taskTypeMap: new Map([
            ['tt1', { id: 'tt1', name: 'Modeling', priority: 1 }]
          ])
        }
      )

      expect(taskMap.get('t1').data).toEqual({ revision_note: 'keep me' })
    })
  })

  describe('getAssetsCsvLines', () => {
    test('exports the full name for person descriptors, not the id', () => {
      const asset = {
        id: 'a1',
        name: 'A1',
        asset_type_name: 'Char',
        description: '',
        ready_for: 'None',
        data: { reviewer: 'person-1' },
        validations: new Map()
      }
      assetsStore.cache.assets = [asset]
      assetsStore.cache.result = []
      const rootGetters = baseRootGetters()
      rootGetters.currentProduction = {
        id: 'p1',
        descriptors: [
          {
            name: 'Reviewer',
            field_name: 'reviewer',
            data_type: 'person',
            entity_type: 'Asset'
          }
        ]
      }
      rootGetters.personMap = new Map([
        ['person-1', { id: 'person-1', full_name: 'John Doe' }]
      ])
      const state = { assetValidationColumns: [] }

      const lines = assetsStore.actions.getAssetsCsvLines({
        state,
        rootGetters
      })

      expect(lines[0]).toContain('John Doe')
      expect(lines[0]).not.toContain('person-1')
    })

    test('exports the base columns when the production has no descriptors key', () => {
      assetsStore.cache.assets = [
        { id: 'a1', name: 'A1', asset_type_name: 'Char', description: '' }
      ]
      assetsStore.cache.result = []
      const rootGetters = baseRootGetters()
      rootGetters.currentProduction = { id: 'p1' }
      const state = { assetValidationColumns: [] }

      const lines = assetsStore.actions.getAssetsCsvLines({
        state,
        rootGetters
      })

      expect(lines).toEqual([['Char', 'A1', '', '']])
    })

    test('orders the descriptor columns by name and skips the other entity types', () => {
      const asset = {
        id: 'a1',
        name: 'A1',
        asset_type_name: 'Char',
        description: '',
        data: { zeta: 'z', alpha: 'a', other: 'x' },
        validations: new Map()
      }
      assetsStore.cache.assets = [asset]
      assetsStore.cache.result = []
      const rootGetters = baseRootGetters()
      rootGetters.currentProduction = {
        id: 'p1',
        descriptors: [
          {
            name: 'Zeta',
            field_name: 'zeta',
            data_type: 'string',
            entity_type: 'Asset'
          },
          {
            name: 'Alpha',
            field_name: 'alpha',
            data_type: 'string',
            entity_type: 'Asset'
          },
          {
            name: 'Other',
            field_name: 'other',
            data_type: 'string',
            entity_type: 'Shot'
          }
        ]
      }
      const state = { assetValidationColumns: [] }

      const lines = assetsStore.actions.getAssetsCsvLines({
        state,
        rootGetters
      })

      expect(lines[0].slice(4)).toEqual(['a', 'z'])
    })
  })

  describe('cache.result maintenance', () => {
    test('REMOVE_ASSET drops the asset from cache.result so it cannot reappear on "show more" (BUG-10)', () => {
      const asset = { id: 'a1', name: 'A1', asset_type_name: 'Char', tasks: [] }
      const other = { id: 'a2', name: 'A2', asset_type_name: 'Char', tasks: [] }
      assetsStore.cache.assetMap = new Map([
        ['a1', asset],
        ['a2', other]
      ])
      assetsStore.cache.assets = [asset, other]
      assetsStore.cache.result = [asset, other]
      const state = {
        displayedAssets: [asset, other],
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0
      }

      assetsStore.mutations.REMOVE_ASSET(state, asset)

      expect(assetsStore.cache.result.map(a => a.id)).toEqual(['a2'])
      expect(assetsStore.cache.assets.map(a => a.id)).toEqual(['a2'])
    })
  })

  describe('batched deletion (PERF-4)', () => {
    const buildAsset = (id, options = {}) => ({
      id,
      name: id,
      asset_type_name: 'Char',
      tasks: [],
      canceled: false,
      timeSpent: 10,
      estimation: 20,
      ...options
    })

    const buildState = assets => {
      assetsStore.cache.assetMap = new Map(
        assets.map(asset => [asset.id, asset])
      )
      assetsStore.cache.assets = [...assets]
      assetsStore.cache.result = [...assets]
      assetsStore.cache.assetIndex = buildAssetIndex(assets)
      return {
        displayedAssets: [...assets],
        displayedAssetsTimeSpent: 0,
        displayedAssetsEstimation: 0,
        displayedAssetsLength: assets.length
      }
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('REMOVE_ASSETS removes, cancels and recomputes stats in one pass', () => {
      const assets = [
        buildAsset('asset-1'),
        buildAsset('asset-2', { tasks: ['task-1'] }),
        buildAsset('asset-3')
      ]
      const state = buildState(assets)

      assetsStore.mutations.REMOVE_ASSETS(state, {
        removedAssets: [assets[0], assets[2]],
        canceledAssets: [assets[1]]
      })

      expect(assetsStore.cache.assets.map(a => a.id)).toEqual(['asset-2'])
      expect(assetsStore.cache.result.map(a => a.id)).toEqual(['asset-2'])
      expect(state.displayedAssets.map(a => a.id)).toEqual(['asset-2'])
      expect([...assetsStore.cache.assetMap.keys()]).toEqual(['asset-2'])
      expect(assets[1].canceled).toBe(true)
      // Stats recomputed once from the remaining, non-canceled assets.
      expect(state.displayedAssetsTimeSpent).toEqual(0)
      expect(state.displayedAssetsEstimation).toEqual(0)
      expect(state.displayedAssetsLength).toEqual(0)
    })

    test('deleteSelectedAssets deletes in one request and commits once', async () => {
      const assetToRemove = buildAsset('asset-1')
      const assetToCancel = buildAsset('asset-2', { tasks: ['task-1'] })
      buildState([assetToRemove, assetToCancel])
      const state = {
        selectedAssets: new Map([
          ['asset-1', assetToRemove],
          ['asset-2', assetToCancel]
        ])
      }
      const rootGetters = { currentProduction: { id: 'p1' } }

      vi.spyOn(entitiesApi, 'deleteEntities').mockResolvedValue()
      const commit = vi.fn()

      await assetsStore.actions.deleteSelectedAssets({
        state,
        commit,
        rootGetters
      })

      expect(entitiesApi.deleteEntities).toHaveBeenCalledTimes(1)
      expect(entitiesApi.deleteEntities).toHaveBeenCalledWith(
        'p1',
        ['asset-1', 'asset-2'],
        false
      )
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith('REMOVE_ASSETS', {
        removedAssets: [assetToRemove],
        canceledAssets: [assetToCancel]
      })
    })

    test('deleteSelectedAssets forces the deletion of an already canceled selection', async () => {
      const canceledAsset = buildAsset('asset-1', {
        canceled: true,
        tasks: ['task-1']
      })
      buildState([canceledAsset])
      const state = {
        selectedAssets: new Map([['asset-1', canceledAsset]])
      }
      const rootGetters = { currentProduction: { id: 'p1' } }

      vi.spyOn(entitiesApi, 'deleteEntities').mockResolvedValue()
      const commit = vi.fn()

      await assetsStore.actions.deleteSelectedAssets({
        state,
        commit,
        rootGetters
      })

      expect(entitiesApi.deleteEntities).toHaveBeenCalledWith(
        'p1',
        ['asset-1'],
        true
      )
      // Really deleted server-side, so it leaves the list instead of staying
      // struck through.
      expect(commit).toHaveBeenCalledWith('REMOVE_ASSETS', {
        removedAssets: [canceledAsset],
        canceledAssets: []
      })
    })
  })
})

describe('Assets store, loadAsset live insertion', () => {
  // A socket event announces an asset created elsewhere: a fresh asset is
  // cast nowhere yet, so its episode alone says whether the loaded dataset
  // should hold it. The single-asset payload carries `episode_id` as a
  // string, empty for the main pack, and no `source_id`. The scope comes from
  // the key the store recorded, not from the topbar: Breakdown loads every
  // asset under a real episode.
  const rootGetters = () => ({
    ...baseRootGetters(),
    isTVShow: true,
    currentEpisode: { id: 'ep-a' },
    people: [],
    taskStatusMap: new Map()
  })

  const committedTypes = async (payload, assetsLoadingKey, asset) => {
    vi.spyOn(assetsApi, 'getAsset').mockResolvedValue({ tasks: [], ...asset })
    const commit = vi.fn()
    await assetsStore.actions.loadAsset(
      { commit, state: { assetsLoadingKey }, rootGetters: rootGetters() },
      payload
    )
    return commit.mock.calls.map(([type]) => type)
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('skips an asset of another episode when asked to stay in scope', async () => {
    const types = await committedTypes(
      { assetId: 'a-scope-1', onlyInScope: true },
      'p1/ep-a',
      { id: 'a-scope-1', episode_id: 'ep-b' }
    )
    expect(types).not.toContain('ADD_ASSET')
  })

  test('adds an asset of the loaded episode', async () => {
    const types = await committedTypes(
      { assetId: 'a-scope-2', onlyInScope: true },
      'p1/ep-a',
      { id: 'a-scope-2', episode_id: 'ep-a' }
    )
    expect(types).toContain('ADD_ASSET')
  })

  test('adds only the assets without episode on the main pack', async () => {
    const inPack = await committedTypes(
      { assetId: 'a-scope-3', onlyInScope: true },
      'p1/main',
      { id: 'a-scope-3', episode_id: '' }
    )
    const inEpisode = await committedTypes(
      { assetId: 'a-scope-4', onlyInScope: true },
      'p1/main',
      { id: 'a-scope-4', episode_id: 'ep-a' }
    )
    expect(inPack).toContain('ADD_ASSET')
    expect(inEpisode).not.toContain('ADD_ASSET')
  })

  test('adds any asset to a production-wide dataset, whatever the topbar shows', async () => {
    const full = await committedTypes(
      { assetId: 'a-scope-5', onlyInScope: true },
      'p1/all',
      { id: 'a-scope-5', episode_id: 'ep-b' }
    )
    const partial = await committedTypes(
      { assetId: 'a-scope-6', onlyInScope: true },
      'p1/all#partial',
      { id: 'a-scope-6', episode_id: 'ep-b' }
    )
    expect(full).toContain('ADD_ASSET')
    expect(partial).toContain('ADD_ASSET')
  })

  // A production switch during the second the handler waits leaves the store
  // on another production: the payload says which one the asset belongs to.
  test('skips an asset of another production', async () => {
    const types = await committedTypes(
      { assetId: 'a-scope-9', onlyInScope: true },
      'p1/all',
      { id: 'a-scope-9', episode_id: 'ep-b', project_id: 'p2' }
    )
    expect(types).not.toContain('ADD_ASSET')
  })

  test('still adds an out-of-scope asset loaded by id', async () => {
    // The detail page reads the map after the load: a deep link to a main
    // pack asset cast in the displayed episode must keep working.
    const types = await committedTypes('a-scope-7', 'p1/ep-a', {
      id: 'a-scope-7',
      episode_id: ''
    })
    expect(types).toContain('ADD_ASSET')
  })

  test('reads the episode from source_id when a payload carries it', async () => {
    const types = await committedTypes(
      { assetId: 'a-scope-8', onlyInScope: true },
      'p1/ep-a',
      { id: 'a-scope-8', source_id: 'ep-a' }
    )
    expect(types).toContain('ADD_ASSET')
  })

  // An update then a deletion within one round trip: the refresh must not
  // bring back the row the deletion removed.
  test('marks the list partial for an asset loaded by id out of its scope', async () => {
    expect(
      await committedTypes('a-other', 'p1/ep-a', {
        id: 'a-other',
        episode_id: 'ep-b',
        project_id: 'p1'
      })
    ).toContain('MARK_ASSETS_PARTIAL')
  })

  test('keeps out a displayed asset deleted during its refresh', async () => {
    assetsStore.cache.assetMap.set('a-gone', { id: 'a-gone' })
    vi.spyOn(assetsApi, 'getAsset').mockImplementation(async () => {
      assetsStore.cache.assetMap.delete('a-gone')
      return { id: 'a-gone', episode_id: 'ep-a', project_id: 'p1', tasks: [] }
    })
    const commit = vi.fn()

    await assetsStore.actions.loadAsset(
      {
        commit,
        state: { assetsLoadingKey: 'p1/ep-a' },
        rootGetters: rootGetters()
      },
      { assetId: 'a-gone', onlyInScope: true }
    )

    expect(commit).not.toHaveBeenCalled()
  })
})

describe('Assets store, ADD_ASSET', () => {
  // The episode column and the scope checks read asset.episode_id. The
  // single-asset payload of a TV show carries it as a string, empty for the
  // main pack, and carries no source_id: the list payloads are the ones that
  // carry source_id.
  const addAsset = payload => {
    const state = { assetSearchText: '', assetSelectionGrid: {} }
    // The mutation completes the asset in place, so it is the object the
    // store keeps: assert on it, not on the fixture.
    const asset = {
      tasks: [],
      project_id: 'p1',
      asset_type_name: 'Character',
      description: '',
      data: {},
      ...payload
    }
    assetsStore.mutations.ADD_ASSET(state, {
      taskStatusMap: new Map(),
      taskTypeMap: new Map(),
      taskMap: new Map(),
      persons: [],
      personMap: new Map(),
      production: { id: 'p1', name: 'Prod', descriptors: [] },
      asset
    })
    return asset
  }

  test('keeps the episode of a single-asset payload', () => {
    const asset = addAsset({ id: 'a-add-1', name: 'A1', episode_id: 'ep-a' })
    expect(asset.episode_id).toEqual('ep-a')
  })

  test('resolves the main pack to no episode', () => {
    const asset = addAsset({ id: 'a-add-2', name: 'A2', episode_id: '' })
    expect(asset.episode_id).toBeNull()
  })

  test('falls back to the source_id the list payloads carry', () => {
    const asset = addAsset({ id: 'a-add-3', name: 'A3', source_id: 'ep-b' })
    expect(asset.episode_id).toEqual('ep-b')
  })
})

describe('Assets store, partial loads', () => {
  // The schedule loads the assets without tasks nor shared assets: that
  // dataset cannot stand in for the one the list pages display, so its scope
  // must not match theirs.
  const startLoad = options => {
    vi.spyOn(assetsApi, 'getUsedSharedAssets').mockResolvedValue([])
    const state = { isAssetsLoading: false, isAssetsLoadingError: false }
    // The response lands after a production switch, which forgets the scope:
    // it short-circuits before LOAD_ASSETS_END.
    vi.spyOn(assetsApi, 'getAssets').mockImplementation(() =>
      Promise.resolve().then(() => {
        assetsStore.mutations.CLEAR_ASSETS(state)
        return []
      })
    )
    const rootGetters = baseRootGetters()
    const ctx = { commit: realCommit(state), dispatch: vi.fn(), state, rootGetters }
    const loading = assetsStore.actions.loadAssets(ctx, options)
    return { state, loading }
  }

  afterEach(() => {
    vi.restoreAllMocks()
    assetsStore.cache.assetsLoadingPromise = null
  })

  test('a full load records the plain scope', async () => {
    const { state, loading } = startLoad({})
    expect(state.assetsLoadingKey).toBe('p1/')
    await loading
  })

  // Breakdown and Concepts load every asset with the shared assets of the
  // whole instance, the Assets page under all only the ones the production
  // uses: two datasets, two scopes.
  test('a production-wide load records its own scope', async () => {
    vi.spyOn(assetsApi, 'getSharedAssets').mockResolvedValue([])
    const { state, loading } = startLoad({ all: true })
    expect(state.assetsLoadingKey).toBe('p1/all#shared')
    await loading
  })

  test('a partial production-wide load stays partial', async () => {
    const { state, loading } = startLoad({
      all: true,
      withTasks: false,
      withShared: false
    })
    expect(state.assetsLoadingKey).toBe('p1/all#partial')
    await loading
  })

  test('a load without tasks or shared assets records a partial scope', async () => {
    const { state, loading } = startLoad({ withTasks: false, withShared: false })
    expect(state.assetsLoadingKey).not.toBe('p1/')
    expect(state.assetsLoadingKey.startsWith('p1/')).toBe(true)
    await loading
  })
})

describe('Assets store, LOAD_ASSETS_ERROR', () => {
  // The store logs the failed load: keep that expected error out of the
  // test output.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The pages decide from the recorded scope whether a reload is needed: a
  // failed load must not leave its scope behind an empty dataset, or they
  // never retry.
  test('forgets the scope of the failed load', () => {
    const state = { assetsLoadingKey: 'p1/ep-a' }
    assetsStore.mutations.LOAD_ASSETS_ERROR(state)
    expect(state.assetsLoadingKey).toBeNull()
  })

  // A production switch starts a new load before the previous one fails:
  // that rejection must not forget the scope of the load running now.
  const failingLoad = () => {
    const rootGetters = { ...baseRootGetters(), currentProduction: { id: 'p1' } }
    let rejectLoad
    vi.spyOn(assetsApi, 'getAssets').mockReturnValue(
      new Promise((resolve, reject) => {
        rejectLoad = reject
      })
    )
    const state = { isAssetsLoading: false }
    const commit = realCommit(state)
    const loading = assetsStore.actions.loadAssets({
      commit,
      dispatch: vi.fn(),
      state,
      rootGetters
    })
    return {
      rootGetters,
      state,
      types: async () => {
        rejectLoad(new Error('down'))
        await loading
        return commit.mock.calls.map(([type]) => type)
      }
    }
  }

  test('forgets the scope when the displayed load fails', async () => {
    const { types } = failingLoad()
    expect(await types()).toContain('LOAD_ASSETS_ERROR')
  })

  test('keeps the scope when the failure comes from the production left', async () => {
    const { rootGetters, state, types } = failingLoad()
    rootGetters.currentProduction = { id: 'p2' }
    assetsStore.mutations.CLEAR_ASSETS(state)
    expect(await types()).not.toContain('LOAD_ASSETS_ERROR')
  })
})

describe('Assets store, live insertion during a list load', () => {
  afterEach(() => {
    assetsStore.cache.assetsLoadingPromise = null
    assetsStore.cache.assetMap.delete('a-flight-3')
    vi.restoreAllMocks()
  })

  // The list load replaces the whole dataset: inserting before its response
  // lands drops the asset, and no second event announces it again.
  test('waits for the list in flight before inserting', async () => {
    vi.spyOn(assetsApi, 'getAsset').mockResolvedValue({
      id: 'a-flight-1',
      episode_id: 'ep-a',
      project_id: 'p1',
      tasks: []
    })
    let endList
    const state = { isAssetsLoading: true, assetsLoadingKey: 'p1/ep-a' }
    assetsStore.cache.assetsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isAssetsLoading = false
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = assetsStore.actions.loadAsset(
      {
        commit,
        state,
        rootGetters: {
          ...baseRootGetters(),
          isTVShow: true,
          currentEpisode: { id: 'ep-a' },
          people: [],
          taskStatusMap: new Map()
        }
      },
      { assetId: 'a-flight-1', onlyInScope: true }
    )
    await Promise.resolve()
    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_ASSET')

    endList()
    await loading
    expect(commit.mock.calls.map(([type]) => type)).toContain('ADD_ASSET')
  })

  // The fetch waits for the list response: issued after it, the payload is
  // the younger one and refreshes the row the list rebuilt.
  test('fetches once the list load settled and refreshes the row', async () => {
    vi.spyOn(assetsApi, 'getAsset').mockResolvedValue({
      id: 'a-flight-3',
      episode_id: 'ep-a',
      project_id: 'p1',
      name: 'from-socket',
      tasks: []
    })
    let endList
    const state = { isAssetsLoading: true, assetsLoadingKey: 'p1/ep-a' }
    assetsStore.cache.assetsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isAssetsLoading = false
        assetsStore.cache.assetMap.set('a-flight-3', {
          id: 'a-flight-3',
          name: 'from-list'
        })
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = assetsStore.actions.loadAsset(
      {
        commit,
        state,
        rootGetters: {
          ...baseRootGetters(),
          isTVShow: true,
          currentEpisode: { id: 'ep-a' },
          people: [],
          taskStatusMap: new Map()
        }
      },
      { assetId: 'a-flight-3', onlyInScope: true }
    )
    await Promise.resolve()
    expect(assetsApi.getAsset).not.toHaveBeenCalled()
    endList()
    await loading

    expect(assetsApi.getAsset).toHaveBeenCalledWith('a-flight-3')
    expect(commit.mock.calls).toEqual([
      ['UPDATE_ASSET', expect.objectContaining({ name: 'from-socket' })]
    ])
  })

  // An update of an asset the page displayed must not recreate it under the
  // list of the episode switched to meanwhile: the handlers pass onlyInScope.
  test('drops an updated asset once the list in flight replaced its episode', async () => {
    vi.spyOn(assetsApi, 'getAsset').mockResolvedValue({
      id: 'a-flight-2',
      episode_id: 'ep-a',
      project_id: 'p1',
      tasks: []
    })
    let endList
    const state = { isAssetsLoading: true, assetsLoadingKey: 'p1/ep-a' }
    assetsStore.cache.assetsLoadingPromise = new Promise(resolve => {
      endList = () => {
        state.isAssetsLoading = false
        state.assetsLoadingKey = 'p1/ep-b'
        resolve([])
      }
    })
    const commit = vi.fn()

    const loading = assetsStore.actions.loadAsset(
      {
        commit,
        state,
        rootGetters: {
          ...baseRootGetters(),
          isTVShow: true,
          currentEpisode: { id: 'ep-b' },
          people: [],
          taskStatusMap: new Map()
        }
      },
      { assetId: 'a-flight-2', onlyInScope: true }
    )
    await Promise.resolve()
    endList()
    await loading

    expect(commit.mock.calls.map(([type]) => type)).not.toContain('ADD_ASSET')
  })
})

describe('Assets store, UPDATE_ASSET', () => {
  afterEach(() => {
    assetsStore.cache.assetMap.delete('a-upd')
  })

  // A colleague's edit refetches the full entity, whose tasks are objects:
  // the cached ids must survive it, or the task lists come out empty.
  test('keeps the cached task ids', () => {
    const asset = {
      id: 'a-upd',
      name: 'old',
      asset_type_name: 'Props',
      tasks: ['t1']
    }
    assetsStore.cache.assetMap.set('a-upd', asset)
    const state = { displayedAssets: [asset] }
    assetsStore.mutations.UPDATE_ASSET(state, {
      id: 'a-upd',
      name: 'new',
      tasks: [{ id: 't1' }]
    })
    expect(state.displayedAssets[0]).toMatchObject({
      name: 'new',
      tasks: ['t1']
    })
  })
})
