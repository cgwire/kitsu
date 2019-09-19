import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import store from '../../../src/store/modules/breakdown'
import breakdownApi from '../../../src/store/api/breakdown'

breakdownApi.updateCasting = jest.fn()

const localVue = createLocalVue()
localVue.use(Vuex)
const vuexStore = new Vuex.Store(store)


describe('Breakdown store', () => {
  let state, shots, assetCasting, casting, assetMap

  beforeEach(() => {
    state = {}
    shots = [
      { id: 'shot-1', name: 'SH01', sequence_name: 'SE01' },
      { id: 'shot-2', name: 'SH02', sequence_name: 'SE02' }
    ]
    assetCasting = [
      {
        id: 'asset-1',
        asset_id: 'asset-1',
        name: 'Asset 1',
        asset_type_name: 'Characters' ,
        nb_occurences: 1
      },
      {
        id: 'asset-2',
        asset_id: 'asset-2',
        name: 'Asset 2',
        asset_type_name: 'Props' ,
        nb_occurences: 2
      }
    ]
    assetMap = {
      'asset-1': assetCasting[0],
      'asset-2': assetCasting[1]
    }
    casting = {
      'shot-1': assetCasting,
      'shot-2': []
    }
  })

  describe('Getters', () => {
    // No complex getters
  })

  describe('Actions', () => {
    test.skip('setCastingSequence', () => {
    })
    test.skip('setCastingEpisode', () => {
    })
    test.skip('addAssetToCasting', () => {
    })
    test.skip('removeAssetFromCasting', () => {
    })
    test.skip('saveCasting', async () => {
      const commit = vuexStore.commit
      commit('CASTING_SET_SHOTS', shots)
      commit('CASTING_SET_CASTING', { casting, assetMap })
      await store.actions.saveCasting({ commit }, 'shot-1')
      expect(breakdownApi.updateCasting).toHaveBeenCalledWith(
        'shot-1',
        [{
          'asset_id': 'asset-1',
          'nb_occurences': 1
        },
        {
          'asset_id': 'asset-2',
          'nb_occurences': 2
        }]
      )
    })
  })

  describe('Mutations', () => {
    test('CASTING_SET_SHOTS', () => {
      store.mutations.CASTING_SET_SHOTS(state, shots)
      expect(state.castingSequenceShots).toEqual(shots)
      expect(state.casting['shot-1']).toEqual([])
      expect(state.casting['shot-2']).toEqual([])
      expect(state.castingByType['shot-1']).toEqual([])
      expect(state.castingByType['shot-2']).toEqual([])
    })

    test('CASTING_SET_SEQUENCES', () => {
      const sequences = [
        { id: 'sequence-1', project_id: 'production-1', name: 'SE01' },
        { id: 'sequence-2', project_id: 'production-1', name: 'SE02' }
      ]
      store.mutations.CASTING_SET_SEQUENCES(state, sequences)
      expect(state.castingEpisodeSequences).toEqual(sequences)
      expect(state.castingSequenceOptions).toEqual([
        {
          label: 'SE01',
          value: 'sequence-1',
          route: {
            name: 'breakdown-sequence',
            params: {
              production_id: 'production-1',
              sequence_id: 'sequence-1'
            }
          }
        },
        {
          label: 'SE02',
          value: 'sequence-2',
          route: {
            name: 'breakdown-sequence',
            params: {
              production_id: 'production-1',
              sequence_id: 'sequence-2'
            }
          }
        }
      ])
    })

    test('CASTING_SET_SEQUENCE', () => {
      store.mutations.CASTING_SET_SEQUENCE(state, 'sequence-1')
      expect(state.castingSequenceId).toEqual('sequence-1')
    })

    test('CASTING_SET_EPISODE', () => {
      store.mutations.CASTING_SET_EPISODE(state, 'episode-1')
      expect(state.castingEpisodeId).toEqual('episode-1')
    })

    test('CASTING_SET_CASTING', () => {
      store.mutations.CASTING_SET_SHOTS(state, shots)
      store.mutations.CASTING_SET_CASTING(state, { casting, assetMap })
      expect(state.casting['shot-1']).toEqual(assetCasting)
      expect(state.casting['shot-2']).toEqual([])
      expect(state.castingByType['shot-1']).toEqual([
        [{
          id: 'asset-1',
          asset_id: 'asset-1',
          name: 'Asset 1',
          asset_type_name: 'Characters',
          nb_occurences: 1
        }],
        [{
          id: 'asset-2',
          asset_id: 'asset-2',
          name: 'Asset 2',
          asset_type_name: 'Props',
          nb_occurences: 2
        }]
      ])
      expect(state.castingByType['shot-2']).toEqual([[]])
    })

    test('CASTING_ADD_TO_CASTING', () => {
      const newAsset = {
        id: 'asset-3',
        asset_name: 'Asset 3',
        asset_type_name: 'Props',
        name: 'Asset 3',
        nb_occurences: 1,
        preview_file_id: undefined
      }
      store.mutations.CASTING_SET_SHOTS(state, shots)
      store.mutations.CASTING_SET_CASTING(state, { casting, assetMap })
      store.mutations.CASTING_ADD_TO_CASTING(state,
        { entityId: 'shot-1', asset: newAsset, nbOccurences: 1 }
      )
      expect(state.casting['shot-1'][2]['asset_id']).toEqual(newAsset.id)
      expect(state.castingByType['shot-1'][1][1]['asset_id'])
        .toEqual(newAsset.id)

      store.mutations.CASTING_ADD_TO_CASTING(state,
        { entityId: 'shot-1', asset: assetMap['asset-2'], nbOccurences: 3 }
      )
      expect(state.casting['shot-1'][1]['nb_occurences'])
        .toEqual(5)
      expect(state.castingByType['shot-1'][1][0]['nb_occurences'])
        .toEqual(5)
    })

    test('CASTING_REMOVE_FROM_CASTING', () => {
      store.mutations.CASTING_SET_SHOTS(state, shots)
      store.mutations.CASTING_SET_CASTING(state, { casting, assetMap })
      store.mutations.CASTING_REMOVE_FROM_CASTING(state,
        { entityId: 'shot-1', asset: assetMap['asset-2'], nbOccurences: 1 }
      )
      expect(state.casting['shot-1'][1]['nb_occurences'])
        .toEqual(1)
      expect(state.castingByType['shot-1'][1][0]['nb_occurences'])
        .toEqual(1)
      store.mutations.CASTING_REMOVE_FROM_CASTING(state,
        { entityId: 'shot-1', asset: assetMap['asset-2'], nbOccurences: 1 }
      )
      expect(state.casting['shot-1'].length).toEqual(1)
      expect(state.castingByType['shot-1'].length).toEqual(1)
    })

    test('LOAD_SHOT_CASTING_END', () => {
      const shot = shots[0]
      store.mutations.LOAD_SHOT_CASTING_END(
        state,
        { shot, casting: assetCasting }
      )
      expect(shot.casting).toEqual(assetCasting)
      expect(shot.castingAssetsByType).toEqual([
        [{
          id: 'asset-1',
          asset_id: 'asset-1',
          name: 'Asset 1',
          asset_type_name: 'Characters',
          nb_occurences: 1
        }],
        [{
          id: 'asset-2',
          asset_id: 'asset-2',
          name: 'Asset 2',
          asset_type_name: 'Props',
          nb_occurences: 2
        }]
      ])
    })

    test('LOAD_ASSET_CAST_IN_END', () => {
      const asset = { id: 'asset-1', name: 'Asset 01' }
      store.mutations.LOAD_ASSET_CAST_IN_END(state, { asset, castIn: shots })
      expect(asset.castIn).toEqual(shots)
      expect(asset.castInShotsBySequence).toEqual([
        [{ id: 'shot-1', name: 'SH01', sequence_name: 'SE01' }],
        [{ id: 'shot-2', name: 'SH02', sequence_name: 'SE02' }]
      ])
    })
  })
})
