// @vitest-environment node

import { vi } from 'vitest'
import { createStore } from 'vuex'

import breakdownApi from '@/store/api/breakdown'
import client from '@/store/api/client'
import assetStore from '@/store/modules/assets'
import breakdownStore from '@/store/modules/breakdown'
import episodeStore from '@/store/modules/episodes'
import shotStore from '@/store/modules/shots'
import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_START,
  RESET_ALL,
  SET_IS_SHOW_INFOS_BREAKDOWN
} from '@/store/mutation-types'

// The breakdown module pulls the assets module, which transitively imports
// the root store; stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

vi.mock('@/store/api/client', () => ({
  default: {
    pdel: vi.fn(),
    pget: vi.fn(),
    ppost: vi.fn(),
    ppostImport: vi.fn(),
    pput: vi.fn()
  }
}))


const rootGetters = { currentProduction: { id: 'p1' } }

describe('Breakdown store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('castAsset', () => {
    test('sends the count and label each entity holds locally, one request per distinct pair', async () => {
      const castAsset = vi.spyOn(breakdownApi, 'castAsset').mockResolvedValue({})
      breakdownStore.state.casting = {
        s1: [{ asset_id: 'a1', nb_occurences: 2, label: 'animate' }],
        s2: [{ asset_id: 'a1', nb_occurences: 2, label: 'animate' }],
        s3: [{ asset_id: 'a1', nb_occurences: 1, label: 'fixed' }],
        s4: []
      }

      await breakdownStore.actions.castAsset(
        { state: breakdownStore.state, rootGetters },
        { entityIds: ['s1', 's2', 's3', 's4'], assetId: 'a1' }
      )

      expect(castAsset.mock.calls.map(call => call.slice(0, 3))).toEqual([
        ['p1', 'a1', { entity_ids: ['s1', 's2'], nb_occurences: 2, label: 'animate' }],
        ['p1', 'a1', { entity_ids: ['s3'], nb_occurences: 1, label: 'fixed' }],
        ['p1', 'a1', { entity_ids: ['s4'], nb_occurences: 0 }]
      ])
    })
  })

  describe('casting responses', () => {
    // The rows on screen belong to the last sequence picked: an earlier
    // response landing after would show them empty, and an asset added
    // then would overwrite their real count on the server.
    test('keeps the casting of the last sequence picked', async () => {
      let endFirst
      vi.spyOn(breakdownApi, 'getSequenceCasting')
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              endFirst = resolve
            })
        )
        .mockResolvedValueOnce({ 'shot-b': [] })
      const commit = vi.fn()
      const context = {
        commit,
        rootGetters: { ...rootGetters, currentEpisode: null }
      }

      const first = breakdownStore.actions.setCastingSequence(context, 'seq-a')
      await breakdownStore.actions.setCastingSequence(context, 'seq-b')
      endFirst({ 'shot-a': [] })
      await first

      const castings = commit.mock.calls.filter(
        ([type]) => type === 'CASTING_SET_CASTING'
      )
      expect(castings.map(([, { casting }]) => casting)).toEqual([
        { 'shot-b': [] }
      ])
    })
  })

  describe('uncastAsset', () => {
    test('removes the asset from the entity with a zero count', async () => {
      const castAsset = vi.spyOn(breakdownApi, 'castAsset').mockResolvedValue({})

      await breakdownStore.actions.uncastAsset(
        { rootGetters },
        { entityId: 's1', assetId: 'a1' }
      )

      expect(castAsset).toHaveBeenCalledWith('p1', 'a1', {
        entity_ids: ['s1'],
        nb_occurences: 0
      })
    })
  })

  // A full casting reload drops the entities the API returned no link for,
  // so a modal confirmed after such a reload can target a missing key.
  describe('CASTING_REMOVE_FROM_CASTING', () => {
    test('ignores an entity missing from the casting map', () => {
      breakdownStore.state.casting = {}
      breakdownStore.state.castingByType = {}

      breakdownStore.mutations.CASTING_REMOVE_FROM_CASTING(
        breakdownStore.state,
        { entityId: 's1', asset: { id: 'a1' }, nbOccurences: 1 }
      )

      expect(breakdownStore.state.casting).toEqual({})
      expect(breakdownStore.state.castingByType).toEqual({})
    })
  })

  describe('CASTING_SET_LINK_LABEL', () => {
    test('ignores an entity missing from the casting map', () => {
      breakdownStore.state.casting = {}

      breakdownStore.mutations.CASTING_SET_LINK_LABEL(breakdownStore.state, {
        label: 'fixed',
        asset: { asset_id: 'a1' },
        targetEntityId: 's1'
      })

      expect(breakdownStore.state.casting).toEqual({})
    })

    test('ignores an asset missing from the entity casting', () => {
      const link = { asset_id: 'a2', label: 'animate' }
      breakdownStore.state.casting = { s1: [link] }

      breakdownStore.mutations.CASTING_SET_LINK_LABEL(breakdownStore.state, {
        label: 'fixed',
        asset: { asset_id: 'a1' },
        targetEntityId: 's1'
      })

      expect(link.label).toBe('animate')
    })
  })
})

describe('Breakdown store, through a store', () => {
  const production = { id: 'p1' }

  const buildStore = ({
    currentProduction = production,
    episode = null,
    sequences = [],
    assetTypes = []
  } = {}) =>
    createStore({
      modules: {
        breakdown: breakdownStore,
        productions: { state: { currentProduction } },
        assets: { state: { assetTypes } }
      },
      getters: {
        currentProduction: () => currentProduction,
        currentEpisode: () => episode,
        displayedSequences: () => sequences,
        episodeMap: () => new Map()
      }
    })

  const names = list => list.map(({ name }) => name)

  beforeEach(() => {
    Object.values(client).forEach(fn => fn.mockReset())
    Object.assign(breakdownStore.state, {
      breakdownSearchFilterGroups: [],
      breakdownSearchQueries: [],
      casting: {},
      castingAssetTypeAssets: [],
      castingAssetTypesOptions: [],
      castingByType: {},
      castingEpisodes: [],
      castingEpisodeSequences: [],
      castingSequencesOptions: [],
      castingSequenceShots: [],
      isShowInfosBreakdown: false
    })
    assetStore.cache.assetMap.clear()
    episodeStore.cache.episodeMap.clear()
    shotStore.cache.shotMap.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('casting scopes', () => {
    test('lists the episodes and loads their casting', async () => {
      const store = buildStore()
      episodeStore.cache.episodeMap.set('ep-10', { id: 'ep-10', name: 'E10' })
      episodeStore.cache.episodeMap.set('ep-2', { id: 'ep-2', name: 'E2' })
      const tree = {
        asset_id: 'a1',
        asset_type_name: 'Props',
        project_id: 'p1'
      }
      const rock = {
        asset_id: 'a2',
        asset_type_name: 'Props',
        project_id: 'p2'
      }
      client.pget.mockResolvedValueOnce({ 'ep-2': [tree, rock], 'ep-10': [] })

      await store.dispatch('setCastingForProductionEpisodes')

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/episodes/casting'
      )
      expect(names(store.getters.castingEpisodes)).toEqual(['E2', 'E10'])
      expect(store.getters.casting['ep-2'].map(({ shared }) => shared)).toEqual(
        [false, true]
      )
      expect(store.getters.castingByType['ep-2']).toEqual([[tree, rock]])
      expect(store.getters.castingByType['ep-10']).toEqual([[]])
    })

    test('loads no episode casting without a production', async () => {
      const store = buildStore({ currentProduction: null })

      await store.dispatch('setCastingForProductionEpisodes')

      expect(client.pget).not.toHaveBeenCalled()
    })

    test('lists the shots of a sequence and loads their casting', async () => {
      const store = buildStore()
      shotStore.cache.shotMap.set('sh2', {
        id: 'sh2',
        name: 'SH020',
        sequence_id: 'seq-1'
      })
      shotStore.cache.shotMap.set('sh1', {
        id: 'sh1',
        name: 'SH010',
        sequence_id: 'seq-1'
      })
      shotStore.cache.shotMap.set('sh3', {
        id: 'sh3',
        name: 'SH030',
        sequence_id: 'seq-1',
        canceled: true
      })
      shotStore.cache.shotMap.set('sh4', {
        id: 'sh4',
        name: 'SH040',
        sequence_id: 'seq-2'
      })
      client.pget.mockResolvedValueOnce({ sh1: [], sh2: [] })

      await store.dispatch('setCastingSequence', 'seq-1')

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/sequences/seq-1/casting'
      )
      expect(names(store.getters.castingSequenceShots)).toEqual([
        'SH010',
        'SH020'
      ])
      expect(store.getters.casting).toEqual({ sh1: [], sh2: [] })
    })

    test('loads the casting of every sequence of an episode', async () => {
      const store = buildStore({ episode: { id: 'ep-1' } })
      shotStore.cache.shotMap.set('sh1', { id: 'sh1', sequence_id: 'seq-1' })
      shotStore.cache.shotMap.set('sh2', { id: 'sh2', sequence_id: 'seq-2' })
      client.pget.mockResolvedValueOnce({ sh1: [] })

      await store.dispatch('setCastingSequence', 'all')

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/episodes/ep-1/sequences/all/casting'
      )
      expect(store.getters.castingSequenceShots).toHaveLength(2)
      expect(store.getters.casting).toEqual({ sh1: [] })
    })

    test('lists the assets of a type and loads their casting', async () => {
      const store = buildStore()
      assetStore.cache.assetMap.set('a1', {
        id: 'a1',
        name: 'Tree 10',
        asset_type_id: 'at-1'
      })
      assetStore.cache.assetMap.set('a2', {
        id: 'a2',
        name: 'Tree 2',
        entity_type_id: 'at-1'
      })
      assetStore.cache.assetMap.set('a3', {
        id: 'a3',
        name: 'Tree 3',
        asset_type_id: 'at-1',
        canceled: true
      })
      assetStore.cache.assetMap.set('a4', {
        id: 'a4',
        name: 'Rock',
        asset_type_id: 'at-2'
      })
      client.pget.mockResolvedValueOnce({ a1: [] })

      await store.dispatch('setCastingAssetType', 'at-1')

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/asset-types/at-1/casting'
      )
      expect(names(store.getters.castingAssetTypeAssets)).toEqual([
        'Tree 2',
        'Tree 10'
      ])
      expect(store.getters.casting).toEqual({ a1: [] })
    })

    test('keeps the casting of the last asset type picked', async () => {
      const store = buildStore()
      let endFirst
      client.pget
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              endFirst = resolve
            })
        )
        .mockResolvedValueOnce({ a2: [] })

      const first = store.dispatch('setCastingAssetType', 'at-1')
      await store.dispatch('setCastingAssetType', 'at-2')
      endFirst({ a1: [] })
      await first

      expect(store.getters.casting).toEqual({ a2: [] })
    })

    test.each([
      ['setCastingSequence', 'SequenceId'],
      ['setCastingAssetType', 'assetTypeId']
    ])('%s needs an id', async (action, idName) => {
      const store = buildStore()
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await store.dispatch(action, null)

      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(idName))
      expect(client.pget).not.toHaveBeenCalled()
    })

    test('builds the sequence options, all of them first', async () => {
      const store = buildStore({
        sequences: [
          { id: 's1', name: 'SQ01', project_id: 'p1' },
          { id: 's2', name: 'SQ02', project_id: 'p1', episode_id: 'ep-1' }
        ]
      })

      await store.dispatch('setCastingEpisode')

      expect(store.getters.castingSequencesOptions).toEqual([
        {
          label: 'All',
          value: 'all',
          route: {
            name: 'breakdown-sequence',
            params: { production_id: 'p1', sequence_id: 'all' }
          }
        },
        {
          label: 'SQ01',
          value: 's1',
          route: {
            name: 'breakdown-sequence',
            params: { production_id: 'p1', sequence_id: 's1' }
          }
        },
        {
          label: 'SQ02',
          value: 's2',
          route: {
            name: 'episode-breakdown-sequence',
            params: {
              production_id: 'p1',
              sequence_id: 's2',
              episode_id: 'ep-1'
            }
          }
        }
      ])
    })

    test('builds no sequence option without sequences', async () => {
      const store = buildStore()

      await store.dispatch('setCastingEpisode')

      expect(store.getters.castingSequencesOptions).toEqual([])
    })

    test('builds the asset type options', async () => {
      const store = buildStore({
        assetTypes: [
          { id: 'at-1', name: 'Props', project_id: 'p1' },
          { id: 'at-2', name: 'Sets', project_id: 'p1', episode_id: 'ep-1' }
        ]
      })

      await store.dispatch('setCastingAssetTypes')

      expect(store.getters.castingAssetTypesOptions).toEqual([
        {
          label: 'Props',
          value: 'at-1',
          route: {
            name: 'breakdown-asset-type',
            params: { production_id: 'p1', asset_type_id: 'at-1' }
          }
        },
        {
          label: 'Sets',
          value: 'at-2',
          route: {
            name: 'episode-breakdown-asset-type',
            params: {
              production_id: 'p1',
              asset_type_id: 'at-2',
              episode_id: 'ep-1'
            }
          }
        }
      ])
    })
  })

  describe('casting edits', () => {
    const cacheAsset = (id, name, assetTypeName) =>
      assetStore.cache.assetMap.set(id, {
        id,
        name,
        asset_type_name: assetTypeName,
        preview_file_id: `preview-${id}`,
        shared: false
      })

    test('adds an asset to a casting, then raises its count', async () => {
      const store = buildStore()
      cacheAsset('a1', 'Tree', 'Props')

      await store.dispatch('addAssetToCasting', {
        entityId: 'sh1',
        assetId: 'a1',
        nbOccurences: 1,
        label: 'animate'
      })
      await store.dispatch('addAssetToCasting', {
        entityId: 'sh1',
        assetId: 'a1',
        nbOccurences: 2
      })

      const link = {
        asset_id: 'a1',
        name: 'Tree',
        asset_name: 'Tree',
        asset_type_name: 'Props',
        nb_occurences: 3,
        preview_file_id: 'preview-a1',
        label: 'animate',
        shared: false
      }
      expect(store.getters.casting.sh1).toEqual([link])
      expect(store.getters.castingByType.sh1).toEqual([[link]])
    })

    test('keeps a casting sorted by asset type, then name', async () => {
      const store = buildStore()
      cacheAsset('a1', 'Tree', 'Props')
      cacheAsset('a2', 'Forest', 'Sets')
      cacheAsset('a3', 'Bush', 'Props')

      for (const assetId of ['a1', 'a2', 'a3']) {
        await store.dispatch('addAssetToCasting', {
          entityId: 'sh1',
          assetId,
          nbOccurences: 1
        })
      }

      expect(names(store.getters.casting.sh1)).toEqual([
        'Bush',
        'Tree',
        'Forest'
      ])
      expect(store.getters.castingByType.sh1.map(names)).toEqual([
        ['Bush', 'Tree'],
        ['Forest']
      ])
    })

    test('lowers the count of an asset, then removes it', async () => {
      const store = buildStore()
      cacheAsset('a1', 'Tree', 'Props')
      await store.dispatch('addAssetToCasting', {
        entityId: 'sh1',
        assetId: 'a1',
        nbOccurences: 2
      })

      await store.dispatch('removeAssetFromCasting', {
        entityId: 'sh1',
        assetId: 'a1',
        nbOccurences: 1
      })
      expect(store.getters.casting.sh1[0].nb_occurences).toBe(1)

      await store.dispatch('removeAssetFromCasting', {
        entityId: 'sh1',
        assetId: 'a1',
        nbOccurences: 1
      })
      expect(store.getters.casting.sh1).toEqual([])
      expect(store.getters.castingByType.sh1).toEqual([[]])
    })

    test('replaces the casting of an entity', async () => {
      const store = buildStore()
      const casting = [
        { asset_id: 'a1', name: 'Tree', asset_type_name: 'Props' },
        { asset_id: 'a2', name: 'Forest', asset_type_name: 'Sets' }
      ]

      await store.dispatch('setEntityCasting', { entityId: 'sh1', casting })

      expect(store.getters.casting.sh1).toEqual(casting)
      expect(store.getters.castingByType.sh1.map(names)).toEqual([
        ['Tree'],
        ['Forest']
      ])
    })

    test('saves the castings of the entities given', async () => {
      const store = buildStore()
      breakdownStore.state.casting = {
        sh1: [
          { asset_id: 'a1', name: 'Tree', nb_occurences: 2, label: 'fixed' }
        ],
        sh2: [{ asset_id: 'a2', name: 'Rock' }],
        sh3: [{ asset_id: 'a3', name: 'Bush', nb_occurences: 1 }]
      }
      client.pput.mockResolvedValueOnce({})

      await store.dispatch('saveCastings', ['sh1', 'sh2'])

      expect(client.pput).toHaveBeenCalledWith(
        '/api/data/projects/p1/entities/casting',
        {
          sh1: [{ asset_id: 'a1', nb_occurences: 2, label: 'fixed' }],
          sh2: [{ asset_id: 'a2', nb_occurences: 1, label: undefined }]
        }
      )
    })

    test('saves nothing without entities', async () => {
      const store = buildStore()

      await store.dispatch('saveCastings', [])

      expect(client.pput).not.toHaveBeenCalled()
    })

    test('labels a link, then saves it', async () => {
      const store = buildStore()
      breakdownStore.state.casting = {
        sh1: [{ asset_id: 'a1', nb_occurences: 2, label: 'animate' }]
      }
      client.pput.mockResolvedValueOnce({})

      await store.dispatch('setAssetLinkLabel', {
        label: 'fixed',
        asset: { asset_id: 'a1' },
        targetEntityId: 'sh1'
      })

      expect(store.getters.casting.sh1[0].label).toBe('fixed')
      expect(client.pput).toHaveBeenCalledWith(
        '/api/data/projects/p1/entities/casting/assets/a1',
        { entity_ids: ['sh1'], nb_occurences: 2, label: 'fixed' }
      )
    })

    test('imports a casting file', async () => {
      const store = buildStore()
      const formData = { file: 'casting.csv' }
      client.ppostImport.mockResolvedValueOnce({ count: 3 })

      const result = await store.dispatch('uploadCastingFile', formData)

      expect(client.ppostImport).toHaveBeenCalledWith(
        '/api/import/csv/projects/p1/casting',
        formData
      )
      expect(result).toEqual({ count: 3 })
    })
  })

  describe('entity castings', () => {
    test.each([
      'loadEpisodeCasting',
      'loadAssetCasting',
      'loadShotCasting',
      'loadSequenceCasting',
      'loadAssetCastIn'
    ])('%s loads nothing without an entity', async action => {
      const store = buildStore()

      expect(await store.dispatch(action, null)).toEqual({})
      expect(client.pget).not.toHaveBeenCalled()
    })

    test('loads the casting of an episode', async () => {
      const store = buildStore()
      const episode = { id: 'ep-1', project_id: 'p1' }
      client.pget.mockResolvedValueOnce([
        { asset_id: 'a1', asset_name: 'Tree', asset_type_name: 'Props' },
        { asset_id: 'a2', name: 'Rock', asset_type_name: 'Props' }
      ])

      const casting = await store.dispatch('loadEpisodeCasting', episode)

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/entities/ep-1/casting'
      )
      expect(names(casting)).toEqual(['Tree', 'Rock'])
      expect(episode.casting).toBe(casting)
      expect(episode.castingAssetsByType).toEqual([casting])
      expect(store.getters.casting['ep-1']).toEqual(casting)
    })

    test('loads the casting of an asset of its production', async () => {
      const store = buildStore()
      const asset = { id: 'a1', production_id: 'p1' }
      client.pget.mockResolvedValueOnce([
        { asset_id: 'a2', asset_name: 'Leaf', asset_type_name: 'Props' }
      ])

      await store.dispatch('loadAssetCasting', asset)

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/entities/a1/casting'
      )
      expect(names(asset.casting)).toEqual(['Leaf'])
      expect(store.getters.castingByType.a1).toEqual([asset.casting])
    })

    test('flags the shared assets of a shot casting', async () => {
      const store = buildStore()
      const shot = { id: 'sh1', project_id: 'p1' }
      client.pget.mockResolvedValueOnce([
        {
          asset_id: 'a1',
          asset_name: 'Tree',
          is_shared: true,
          project_id: 'p2'
        },
        {
          asset_id: 'a2',
          asset_name: 'Rock',
          is_shared: true,
          project_id: 'p1'
        },
        { asset_id: 'a3', name: 'Bush', is_shared: false, project_id: 'p2' }
      ])

      await store.dispatch('loadShotCasting', shot)

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/entities/sh1/casting'
      )
      expect(shot.casting.map(({ name, shared }) => [name, shared])).toEqual([
        ['Tree', true],
        ['Rock', false],
        ['Bush', false]
      ])
      expect(store.getters.casting.sh1).toEqual(shot.casting)
    })

    test('merges the castings of the shots of a sequence', async () => {
      const store = buildStore()
      const sequence = { id: 'seq-1', production_id: 'p1' }
      client.pget.mockResolvedValueOnce({
        sh1: [
          { asset_id: 'a1', asset_name: 'Tree', asset_type_name: 'Props' },
          {
            asset_id: 'a2',
            asset_name: 'Forest',
            asset_type_name: 'Sets',
            is_shared: true,
            project_id: 'p2'
          }
        ],
        sh2: [
          { asset_id: 'a1', asset_name: 'Tree', asset_type_name: 'Props' },
          { asset_id: 'a3', asset_name: 'Bush', asset_type_name: 'Props' }
        ]
      })

      await store.dispatch('loadSequenceCasting', sequence)

      expect(client.pget).toHaveBeenCalledWith(
        '/api/data/projects/p1/sequences/seq-1/casting'
      )
      expect(names(sequence.casting)).toEqual(['Bush', 'Tree', 'Forest'])
      expect(sequence.casting.map(({ shared }) => Boolean(shared))).toEqual([
        false,
        false,
        true
      ])
      expect(sequence.castingAssetsByType.map(names)).toEqual([
        ['Bush', 'Tree'],
        ['Forest']
      ])
    })

    test('groups the shots an asset is cast in by sequence', async () => {
      const store = buildStore()
      const asset = { id: 'a1' }
      client.pget.mockResolvedValueOnce([
        { shot_id: 'sh1', sequence_name: 'SQ01', episode_name: 'E01' },
        { shot_id: 'sh2', sequence_name: 'SQ01', episode_name: 'E01' },
        { shot_id: 'sh3', sequence_name: 'SQ02' },
        { sequence_name: 'SQ03' }
      ])

      const castIn = await store.dispatch('loadAssetCastIn', asset)

      expect(client.pget).toHaveBeenCalledWith('/api/data/assets/a1/cast-in')
      expect(castIn.map(({ sequence_name }) => sequence_name)).toEqual([
        'E01 / SQ01',
        'E01 / SQ01',
        'SQ02',
        'SQ03'
      ])
      expect(
        asset.castInShotsBySequence.map(shots =>
          shots.map(({ shot_id }) => shot_id)
        )
      ).toEqual([['sh1', 'sh2'], ['sh3']])
    })
  })

  describe('saved searches', () => {
    test('saves a search', async () => {
      const store = buildStore()
      const query = { id: 'f1', name: 'props' }
      client.ppost.mockResolvedValueOnce(query)

      await store.dispatch('saveBreakdownSearch', {
        name: 'props',
        search_query: 'props'
      })

      expect(client.ppost).toHaveBeenCalledWith('/api/data/user/filters', {
        list_type: 'breakdown',
        name: 'props',
        query: 'props',
        entity_type: null,
        project_id: 'p1'
      })
      expect(store.getters.breakdownSearchQueries).toEqual([query])
    })

    test('keeps the saved searches sorted', async () => {
      const store = buildStore()
      client.ppost
        .mockResolvedValueOnce({ id: 'f1', name: 'sets' })
        .mockResolvedValueOnce({ id: 'f2', name: 'props' })

      const save = name =>
        store.dispatch('saveBreakdownSearch', { name, search_query: name })
      await save('sets')
      await save('props')

      expect(names(store.getters.breakdownSearchQueries)).toEqual([
        'props',
        'sets'
      ])
    })

    test('removes a search', async () => {
      const store = buildStore()
      breakdownStore.state.breakdownSearchQueries = [
        { id: 'f1', name: 'props' },
        { id: 'f2', name: 'sets' }
      ]
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('removeBreakdownSearch', { id: 'f1', name: 'props' })

      expect(client.pdel).toHaveBeenCalledWith('/api/data/user/filters/f1')
      expect(names(store.getters.breakdownSearchQueries)).toEqual(['sets'])
    })

    test('saves a filter group', async () => {
      const store = buildStore()
      const group = {
        name: 'Layout',
        color: '#ff0000',
        is_shared: true,
        department_id: 'd1'
      }
      client.ppost.mockResolvedValueOnce({ id: 'g1', ...group })

      await store.dispatch('saveBreakdownSearchFilterGroup', group)

      expect(client.ppost).toHaveBeenCalledWith(
        '/api/data/user/filter-groups',
        {
          list_type: 'breakdown',
          name: 'Layout',
          color: '#ff0000',
          is_shared: true,
          project_id: 'p1',
          department_id: 'd1'
        }
      )
      expect(names(store.getters.breakdownSearchFilterGroups)).toEqual([
        'Layout'
      ])
    })

    test('removes a filter group', async () => {
      const store = buildStore()
      breakdownStore.state.breakdownSearchFilterGroups = [
        { id: 'g1', name: 'Layout' }
      ]
      client.pdel.mockResolvedValueOnce()

      await store.dispatch('removeBreakdownSearchFilterGroup', {
        id: 'g1',
        name: 'Layout'
      })

      expect(client.pdel).toHaveBeenCalledWith(
        '/api/data/user/filter-groups/g1'
      )
      expect(store.getters.breakdownSearchFilterGroups).toEqual([])
    })

    test('reads the searches of the production from the user filters', () => {
      const store = buildStore()
      const query = { id: 'f1', name: 'props' }
      const group = { id: 'g1', name: 'Layout' }

      store.commit(LOAD_ASSETS_END, {
        userFilters: { breakdown: { p1: [query], p2: [] } },
        userFilterGroups: { breakdown: { p1: [group] } },
        production
      })
      expect(store.getters.breakdownSearchQueries).toEqual([query])
      expect(store.getters.breakdownSearchFilterGroups).toEqual([group])

      store.commit(LOAD_ASSETS_END, {
        userFilters: {},
        production
      })
      expect(store.getters.breakdownSearchQueries).toEqual([])
      expect(store.getters.breakdownSearchFilterGroups).toEqual([])
    })
  })

  describe('resets', () => {
    test('clears the casting when the shots reload', () => {
      const store = buildStore()
      breakdownStore.state.casting = { sh1: [{ asset_id: 'a1' }] }
      breakdownStore.state.castingSequenceShots = [{ id: 'sh1' }]

      store.commit(LOAD_SHOTS_START)

      expect(store.getters.casting).toEqual({})
      expect(store.getters.castingSequenceShots).toEqual([])
    })

    test('shows the entity infos, until RESET_ALL', () => {
      const store = buildStore()

      store.commit(SET_IS_SHOW_INFOS_BREAKDOWN, true)
      expect(store.getters.isShowInfosBreakdown).toBe(true)

      store.commit(RESET_ALL)
      expect(store.getters.isShowInfosBreakdown).toBe(false)
    })
  })
})
