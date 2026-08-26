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
})
