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

      const [r1, r2] = await Promise.all([p1, p2])
      expect(getAssets).toHaveBeenCalledTimes(1)
      expect(r1).toEqual(sentinel)
      expect(r2).toEqual(sentinel) // buggy guard resolved to [] instead
    })

    test('ignores a response for a production the user already switched away from (BUG-3)', async () => {
      const sentinel = [{ id: 'a1', asset_type_id: 't1', name: 'A1' }]
      vi.spyOn(assetsApi, 'getAssets').mockResolvedValue(sentinel)
      const state = { isAssetsLoading: false, isAssetsLoadingError: false }
      const commit = realCommit(state)
      const rootGetters = baseRootGetters()
      const ctx = { commit, dispatch: vi.fn(), state, rootGetters }

      const promise = assetsStore.actions.loadAssets(ctx, { withShared: false })
      // User navigates to another production before the response lands.
      rootGetters.currentProduction = { id: 'p2' }
      const result = await promise

      expect(result).toEqual(sentinel)
      // Stale response must NOT overwrite the current production's assets...
      expect(commit.mock.calls.map(c => c[0])).not.toContain('LOAD_ASSETS_END')
      // ...and must leave the loading flag to the newer load (reset by CLEAR).
      expect(state.isAssetsLoading).toBe(true)
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
      expect(entitiesApi.deleteEntities).toHaveBeenCalledWith('p1', [
        'asset-1',
        'asset-2'
      ])
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith('REMOVE_ASSETS', {
        removedAssets: [assetToRemove],
        canceledAssets: [assetToCancel]
      })
    })
  })
})
