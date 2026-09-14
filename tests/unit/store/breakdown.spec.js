// @vitest-environment node

import { vi } from 'vitest'

// The breakdown module pulls the assets module, which transitively imports
// the root store; stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import breakdownStore from '@/store/modules/breakdown'
import breakdownApi from '@/store/api/breakdown'

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
