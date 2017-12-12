import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import assetsApi from '../../src/store/api/assets'
import assetsStore from '../../src/store/modules/assets'
import { reset, runAction } from './helpers'
import {
  LOAD_ASSETS_START,
  LOAD_ASSETS_ERROR,
  LOAD_ASSETS_END,

  EDIT_ASSET_START,
  EDIT_ASSET_ERROR,
  EDIT_ASSET_END,

  DELETE_ASSET_START,
  DELETE_ASSET_ERROR,
  DELETE_ASSET_END,

  LOAD_ASSET_TYPES_START,
  LOAD_ASSET_TYPES_ERROR,
  LOAD_ASSET_TYPES_END,

  ASSET_CSV_FILE_SELECTED,
  IMPORT_ASSETS_START,
  IMPORT_ASSETS_END,

  DELETE_TASK_END,

  NEW_TASK_COMMENT_END,

  LOAD_ASSET_TYPE_STATUS_END
} from '../../src/store/mutation-types'


let assets = []
let assetTypes = []

assetsApi.getAssets = (callback) => {
  process.nextTick(() => {
    callback(null, assets)
  })
}

assetsApi.newAsset = (asset, callback) => {
  asset.id = 4
  process.nextTick(() => {
    callback(null, asset)
  })
}

assetsApi.updateAsset = (asset, callback) => {
  process.nextTick(() => {
    callback(null, asset)
  })
}

assetsApi.deleteAsset = (asset, callback) => {
  process.nextTick(() => {
    callback(null, assets)
  })
}

assetsApi.postCsv = (formData, callback) => {
  process.nextTick(() => {
    callback(null, assets)
  })
}



const getters = assetsStore.getters
const state = store.state.assets

describe('assets', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    assets = [
      {
        id: 1,
        name: 'Bunny',
        project_name: 'BBB',
        asset_type_name: 'Character',
        tasks: [
          {
            id: 'task-1',
            entity_name: 'BBB / Bunny',
            task_type_name: 'Concept',
            task_type_color: '#0000FF',
            task_type_priority: 1
          },
          {
            id: 'task-2',
            entity_name: 'BBB / Bunny',
            project_name: 'BBB',
            asset_type_name: 'Character',
            task_type_name: 'Modeling',
            task_type_color: '#00FF00',
            task_type_priority: 2
          }
        ]
      },
      {
        id: 2,
        name: 'Chair',
        project_name: 'BBB',
        asset_type_name: 'Props',
        tasks: [
          {
            id: 'task-3',
            task_type_name: 'Concept',
            task_type_color: '#0000FF',
            task_type_priority: 1
          },
          {
            id: 'task-4',
            task_type_name: 'Shaders',
            task_type_color: '#FF0000',
            task_type_priority: 3
          }
        ]
      },
      {
        id: 3,
        project_name: 'BBB',
        asset_type_name: 'Environment',
        name: 'Forest',
        tasks: []
      }
    ]

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
    it('getAsset', () => {
      store.commit(LOAD_ASSETS_END, assets)
      const assetType = getters.getAsset(state)(2)
      expect(assetType.id).to.equal(2)
      expect(assetType.name).to.equal('Chair')
    })

    it('getAssetTypeOptions', () => {
      store.commit(LOAD_ASSET_TYPES_END, assetTypes)
      const options = getters.getAssetTypeOptions(state)
      expect(options.length).to.equal(3)
      expect(options[0].label).to.equal('Animation')
      expect(options[0].value).to.equal(assets[1].id)
    })
  })

  /*
  describe('actions', () => {
    it('loadAssets', (done) => {
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
  */

  describe('mutations', () => {

    it('LOAD_ASSETS_START', () => {
      store.commit(LOAD_ASSETS_START)
      expect(state.isAssetsLoading).to.equal(true)
      expect(state.isAssetsLoadingError).to.equal(false)
    })

    it('LOAD_ASSETS_ERROR', () => {
      store.commit(LOAD_ASSETS_ERROR)
      expect(state.isAssetsLoading).to.equal(false)
      expect(state.isAssetsLoadingError).to.equal(true)
      expect(state.assets).to.deep.equal([])
    })

    it('LOAD_ASSETS_END', () => {
      store.commit(LOAD_ASSETS_END, assets)
      expect(state.isAssetsLoading).to.equal(false)
      expect(state.isAssetsLoadingError).to.equal(false)
      expect(state.assets).to.deep.equal(assets)
      expect(state.assets[0].name).to.equal('Bunny')
      expect(state.assets[1].name).to.equal('Forest')

      expect(state.assets[0].validations.Modeling).to.deep.equal(
        assets[0].tasks[1]
      )
      expect(state.assets[0].validations.Concept).to.deep.equal(
        assets[0].tasks[0]
      )

      expect(state.validationColumns).to.deep.equal({
        Concept: {
          name: assets[0].tasks[0].task_type_name,
          color: assets[0].tasks[0].task_type_color,
          priority: assets[0].tasks[0].task_type_priority
        },
        Modeling: {
          name: assets[0].tasks[1].task_type_name,
          color: assets[0].tasks[1].task_type_color,
          priority: assets[0].tasks[1].task_type_priority
        },
        Shaders: {
          name: assets[2].tasks[1].task_type_name,
          color: assets[2].tasks[1].task_type_color,
          priority: assets[2].tasks[1].task_type_priority
        }
      })

      expect(state.assetIndex["Bun"][0]).to.deep.equal(assets[0])
    })

    it('EDIT_ASSET_START', () => {
      store.commit(LOAD_ASSETS_END, assets)
      store.commit(EDIT_ASSET_START)
      expect(state.editAsset).to.deep.equal({
        isCreateError: false,
        isLoading: true,
        isError: false
      })
    })

    it('EDIT_ASSET_ERROR', () => {
      store.commit(LOAD_ASSETS_END, assets)
      store.commit(EDIT_ASSET_ERROR)
      expect(state.editAsset).to.deep.equal({
        isCreateError: true,
        isLoading: false,
        isError: true
      })
    })

    it('EDIT_ASSET_END', () => {
      store.commit(LOAD_ASSETS_END, assets)
      store.commit(EDIT_ASSET_END, {
        id: 4,
        name: 'New asset',
        asset_type_name: 'Props',
        project_name: 'Agent 327'
      })
      expect(state.assets.length).to.equal(4)
      expect(state.assets[0].name).to.equal('New asset')

      const newName = 'Chair edited'
      store.commit(EDIT_ASSET_END, {
        id: 2,
        name: newName
      })
      expect(state.assets.length).to.equal(4)
      const assetName = getters.getAsset(state)(2).name
      expect(assetName).to.equal(newName)
      expect(state.editAsset).to.deep.equal({
        isLoading: false,
        isError: false
      })
      store.commit(DELETE_ASSET_END, assets[2])
    })

    /*
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

    it('DELETE_TASK_END', () => {
    })
    it('NEW_TASK_COMMENT_END', () => {
    })
    */
  })
})
