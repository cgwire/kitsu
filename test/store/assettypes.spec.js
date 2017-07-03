import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import assetTypesApi from '../../src/store/api/assettypes'
import assetTypeStore from '../../src/store/modules/assettypes'
import { reset, runAction } from './helpers'
import {
  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,

  EDIT_ASSET_TYPE_START,
  EDIT_ASSET_TYPE_ERROR,
  EDIT_ASSET_TYPE_END,

  DELETE_ASSET_TYPE_START,
  DELETE_ASSET_TYPE_ERROR,
  DELETE_ASSET_TYPE_END,

  LOAD_ASSET_TYPE_STATUS_END
} from '../../src/store/mutation-types'


let assetTypes = []

assetTypesApi.getAssetTypes = (callback) => {
  process.nextTick(() => {
    callback(null, assetTypes)
  })
}

assetTypesApi.newAssetType = (assetType, callback) => {
  assetType.id = 4
  process.nextTick(() => {
    callback(null, assetType)
  })
}

assetTypesApi.updateAssetType = (assetType, callback) => {
  process.nextTick(() => {
    callback(null, assetType)
  })
}

assetTypesApi.deleteAssetType = (assetType, callback) => {
  process.nextTick(() => {
    callback(null, assetTypes)
  })
}


const getters = assetTypeStore.getters
const state = store.state.assetTypes

describe('assetTypes', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    assetTypes = [
      {
        id: 1,
        name: 'Modeling'
      },
      {
        id: 2,
        name: 'Animation'
      },
      {
        id: 3,
        name: 'FX'
      }
    ]
  })

  describe('getters', () => {
    it('getAssetType', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      const assetType = getters.getAssetType(state)(2)
      expect(assetType.id).to.equal(2)
      expect(assetType.name).to.equal('Animation')
    })
  })

  describe('actions', () => {
    it('loadAssetTypes', (done) => {
      helpers.runAction('loadAssetTypes', (err) => {
        expect(err).to.be.null
        expect(state.isAssetTypesLoading).to.equal(false)
        expect(state.isAssetTypesLoadingError).to.equal(false)
        expect(state.assetTypes).to.deep.equal(assetTypes)
        done()
      })
      expect(state.isAssetTypesLoading).to.equal(true)
      expect(state.isAssetTypesLoadingError).to.equal(false)
    })

    it('newAssetType', (done) => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      helpers.runAction('newAssetType', {
        data: {
          name: 'New assetType'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editAssetType.isLoading).to.equal(false)
          expect(state.editAssetType.isError).to.equal(false)
          expect(state.assetTypes.length).to.equal(4)
          done()
        }
      })
      expect(state.editAssetType.isLoading).to.equal(true)
      expect(state.editAssetType.isError).to.equal(false)
    })

    it('editAssetType', (done) => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      helpers.runAction('editAssetType', {
        data: {
          id: 2,
          name: 'Modeling edited',
          color: '#FFFFFF'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editAssetType.isLoading).to.equal(false)
          expect(state.editAssetType.isError).to.equal(false)
          expect(state.assetTypes.length).to.equal(3)
          const assetTypeName = getters.getAssetType(state)(2).name
          expect(assetTypeName).to.equal('Modeling edited')
          done()
        }
      })
      expect(state.editAssetType.isLoading).to.equal(true)
      expect(state.editAssetType.isError).to.equal(false)
    })
    it('deleteAssetType', (done) => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      helpers.runAction('deleteAssetType', {
        assetType: assetTypes[1],
        callback: (err) => {
          expect(err).to.be.null
          expect(state.deleteAssetType.isLoading).to.equal(false)
          expect(state.deleteAssetType.isError).to.equal(false)
          expect(state.assetTypes.length).to.equal(2)
          done()
        }
      })
      expect(state.deleteAssetType.isLoading).to.equal(true)
      expect(state.deleteAssetType.isError).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('LOAD_ASSET_TYPES_START', () => {
      store.commit(LOAD_ASSET_TYPES_START)
      expect(state.isAssetTypesLoading).to.equal(true)
      expect(state.isAssetTypesLoadingError).to.equal(false)
    })

    it('LOAD_ASSET_TYPES_ERROR', () => {
      store.commit(LOAD_ASSET_TYPES_ERROR)
      expect(state.isAssetTypesLoading).to.equal(false)
      expect(state.isAssetTypesLoadingError).to.equal(true)
      expect(state.assetTypes).to.deep.equal([])
    })

    it('LOAD_ASSET_TYPES_END', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      expect(state.isAssetTypesLoading).to.equal(false)
      expect(state.isAssetTypesLoadingError).to.equal(false)
      expect(state.assetTypes).to.deep.equal(assetTypes)
      expect(state.assetTypes[0].name).to.equal('Animation')
      expect(state.assetTypes[1].name).to.equal('FX')
    })

    it('EDIT_ASSET_TYPE_START', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      store.commit(EDIT_ASSET_TYPE_START)
      expect(state.editAssetType).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('EDIT_ASSET_TYPE_ERROR', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      store.commit(EDIT_ASSET_TYPE_ERROR)
      expect(state.editAssetType).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('EDIT_ASSET_TYPE_END', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      store.commit(EDIT_ASSET_TYPE_END, {
        id: 4,
        name: 'New asset type'
      })
      expect(state.assetTypes.length).to.equal(4)
      store.commit(EDIT_ASSET_TYPE_END, {
        id: 2,
        name: 'Modeling edited'
      })
      expect(state.assetTypes.length).to.equal(4)
      const assetTypeName = getters.getAssetType(state)(2).name
      expect(assetTypeName).to.equal('Modeling edited')

      expect(state.editAssetType).to.deep.equal({
        isLoading: false,
        isError: false
      })
      store.commit(DELETE_ASSET_TYPE_END, assetTypes[2])
    })

    it('DELETE_ASSET_TYPE_START', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      store.commit(DELETE_ASSET_TYPE_START)
      expect(state.deleteAssetType).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('DELETE_ASSET_TYPE_ERROR', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      store.commit(DELETE_ASSET_TYPE_ERROR)
      expect(state.deleteAssetType).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('DELETE_ASSET_TYPE_END', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      expect(state.assetTypes.length).to.equal(3)
      store.commit(DELETE_ASSET_TYPE_END, assetTypes[1])
      expect(state.assetTypes.length).to.equal(2)
      expect(state.deleteAssetType).to.deep.equal({
        isLoading: false,
        isError: false
      })
    })
  })
})
