import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import assetsApi from '../../src/store/api/assets'
import shotsApi from '../../src/store/api/shots'
import breakdownStore from '../../src/store/modules/breakdown'
import { reset, runAction } from './helpers'
import {
  CASTING_SET_SHOT,
  CASTING_SET_SHOTS,
  CASTING_SET_SEQUENCE,
  CASTING_SET_CASTING,
  CASTING_SET_ISDIRTY,

  CASTING_ADD_TO_CASTING,
  CASTING_REMOVE_FROM_CASTING,

  RESET_ALL
} from '../../src/store/mutation-types'

let assets = []
let assetTypes = []

const getters = breakdownStore.getters
const state = store.state.breakdown


const shot = {
  id: 'shot-1',
  sequence_id: 'sequence-1'
}

const shot2 = {
  id: 'shot-2',
  sequence_id: 'sequence-1'
}

let casting = {}

const shots = [shot, shot2]

describe('breakdown', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    store.commit(RESET_ALL)
    casting = {
      'asset-1': {
        asset_type_name: 'Character',
        name: 'Agent327',
        nb_occurences: 1
      },
      'asset-2': {
        asset_type_name: 'Props',
        name: 'Tree',
        nb_occurences: 100
      },
      'asset-3': {
        asset_type_name: 'Character',
        name: 'Bunny',
        nb_occurences: 1
      }
    }
  })

  describe('getters', () => {
    it('isCastingSaveActive', () => {
      expect(getters.isCastingSaveActive(state)).to.equal(false)
      store.commit(CASTING_SET_SHOT, shot)
      expect(getters.isCastingSaveActive(state)).to.equal(false)
      store.commit(CASTING_SET_ISDIRTY, true)
      expect(getters.isCastingSaveActive(state)).to.equal(true)
    })

    it('getCastingAssetsByType', () => {
      store.commit(CASTING_SET_CASTING, casting)
      const assetsByType = getters.getCastingAssetsByType(state)
      expect(assetsByType.length).to.equal(2)
      expect(assetsByType[0].length).to.equal(2)
      expect(assetsByType[1].length).to.equal(1)
      expect(assetsByType[0][0]["asset_type_name"]).to.equal('Character')
      expect(assetsByType[1][0]["asset_type_name"]).to.equal('Props')
    })
  })

  describe('actions', () => {
    it.skip('setCastingShot', () => {
    })

    it.skip('setCastingSequence', () => {
    })

    it.skip('addAssetToCasting', () => {
    })

    it.skip('removeAssetFromCasting', () => {
    })

    it.skip('saveCasting', () => {
    })
  })

  describe('mutations', () => {
    it('CASTING_SET_SHOT', () => {
      store.commit(CASTING_SET_SHOT, shot)
      expect(state.castingCurrentShot).to.equal(shot)
      expect(state.castingShotId).to.equal(shot.id)
      expect(state.castingSequenceId).to.equal(shot.sequence_id)

      store.commit(CASTING_SET_SHOT)
      expect(state.castingCurrentShot).to.equal(null)
      expect(state.castingShotId).to.equal(null)
      expect(state.castingSequenceId).to.equal(null)
    })

    it('CASTING_SET_SHOTS', () => {
      store.commit(CASTING_SET_SHOTS, shots)
      expect(state.castingSequenceShots).to.equal(shots)
    })

    it('CASTING_SET_SEQUENCE', () => {
      store.commit(CASTING_SET_SEQUENCE, shot.sequence_id)
      expect(state.castingSequenceId).to.equal(shot.sequence_id)
    })

    it('CASTING_SET_ISDIRTY', () => {
      const isDirty = false
      store.commit(CASTING_SET_ISDIRTY, isDirty)
      expect(state.isCastingDirty).to.equal(isDirty)
    })

    it('CASTING_SET_CASTING', () => {
      store.commit(CASTING_SET_ISDIRTY, true)
      store.commit(CASTING_SET_CASTING, casting)
      expect(state.casting).to.equal(casting)
      expect(state.castingAssetsByType.length).to.equal(2)
      expect(state.castingAssetsByType[0].length).to.equal(2)
      expect(state.castingAssetsByType[1].length).to.equal(1)
      expect(state.isCastingDirty).to.equal(false)
    })

    it('CASTING_ADD_TO_CASTING', () => {
      const asset =  {
        id: 'asset-4',
        asset_type_name: 'Props',
        name: 'Plant'
      }
      store.commit(CASTING_SET_CASTING, casting)
      store.commit(CASTING_ADD_TO_CASTING, {asset, nbOccurences: 2})

      expect(state.castingAssetsByType.length).to.equal(2)
      expect(state.castingAssetsByType[0].length).to.equal(2)
      expect(state.castingAssetsByType[1].length).to.equal(2)
      expect(state.castingAssetsByType[1][0].nb_occurences).to.equal(2)

      expect(state.isCastingDirty).to.equal(true)

      store.commit(CASTING_ADD_TO_CASTING, {asset, nbOccurences: 2})
      expect(state.castingAssetsByType[0].length).to.equal(2)
      expect(state.castingAssetsByType[1].length).to.equal(2)
      expect(state.castingAssetsByType[1][0].nb_occurences).to.equal(4)
    })

    it('CASTING_REMOVE_FROM_CASTING', () => {
      const asset =  {
        id: 'asset-4',
        asset_type_name: 'Props',
        name: 'Plant'
      }
      store.commit(CASTING_SET_CASTING, casting)
      store.commit(CASTING_ADD_TO_CASTING, {asset, nbOccurences: 2})
      store.commit(CASTING_REMOVE_FROM_CASTING, {asset, nbOccurences: 1})
      expect(state.castingAssetsByType.length).to.equal(2)
      expect(state.castingAssetsByType[0].length).to.equal(2)
      expect(state.castingAssetsByType[1].length).to.equal(2)
      expect(state.castingAssetsByType[1][0].nb_occurences).to.equal(1)
      expect(state.isCastingDirty).to.equal(true)

      store.commit(CASTING_REMOVE_FROM_CASTING, {asset, nbOccurences: 1})
      expect(state.castingAssetsByType.length).to.equal(2)
      expect(state.castingAssetsByType[0].length).to.equal(2)
      expect(state.castingAssetsByType[1].length).to.equal(1)
    })

  })
})
