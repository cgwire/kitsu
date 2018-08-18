import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import productionsApi from '../../src/store/api/productions'
import productionStore from '../../src/store/modules/productions'
import { reset, runAction } from './helpers'
import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END,

  EDIT_PRODUCTION_START,
  EDIT_PRODUCTION_ERROR,
  EDIT_PRODUCTION_END,

  DELETE_PRODUCTION_START,
  DELETE_PRODUCTION_ERROR,
  DELETE_PRODUCTION_END,

  PRODUCTION_PICTURE_FILE_SELECTED,
  PRODUCTION_AVATAR_UPLOADED,
  LOAD_PRODUCTION_STATUS_END
} from '../../src/store/mutation-types'


const productionStatuses = [
  {
    id: 1,
    name: 'Open'
  },
  {
    id: 2,
    name: 'Closed'
  }
]

let productions = []

productionsApi.getProductions = (callback) => {
  process.nextTick(() => {
    callback(null, productions)
  })
}

productionsApi.newProduction = (production, callback) => {
  production.id = 4
  process.nextTick(() => {
    callback(null, production)
  })
}

productionsApi.updateProduction = (production, callback) => {
  process.nextTick(() => {
    callback(null, production)
  })
}

productionsApi.deleteProduction = (production, callback) => {
  process.nextTick(() => {
    callback(null, production)
  })
}

productionsApi.postAvatar = (productionId, formData, callback) => {
  process.nextTick(() => {
    callback(null, productionId)
  })
}


const getters = productionStore.getters
const state = store.state.productions

describe('productions', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    productions = [
      {
        id: 'production-1',
        name: 'Caminandes',
        project_status_name: 'Open'
      },
      {
        id: 'production-2',
        name: 'Big Buck Bunny',
        project_status_name: 'Closed'
      },
      {
        id: 'production-3',
        name: 'Agent 327',
        project_status_name: 'Open'
      }
    ]
  })

  describe('getters', () => {
    it('getProduction', () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      const production = getters.getProduction(state)('production-2')
      expect(production.id).to.equal('production-2')
      expect(production.name).to.equal('Big Buck Bunny')
    })

    it('getProductionStatus', () => {
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      const productionStatus = getters.getProductionStatus(state)(2)
      expect(productionStatus.id).to.equal(2)
      expect(productionStatus.name).to.equal('Closed')
    })

    it('productionStatusOptions', () => {
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      const options = getters.getProductionStatusOptions(state)
      expect(options[0].label).to.equal('Open')
      expect(options[0].value).to.equal(1)
      expect(options[1].label).to.equal('Closed')
      expect(options[1].value).to.equal(2)
    })
  })

  describe('actions', () => {
    it('loadProductions', (done) => {
      helpers.runAction('loadProductions', (err) => {
        expect(err).to.be.null
        expect(state.isProductionsLoading).to.equal(false)
        expect(state.isProductionsLoadingError).to.equal(false)
        expect(state.productions).to.deep.equal(productions)
        done()
      })
      expect(state.isProductionsLoading).to.equal(true)
      expect(state.isProductionsLoadingError).to.equal(false)
    })

    it('newProduction', (done) => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      helpers.runAction('newProduction', {
        data: {
          name: 'New production',
          project_status_name: 'Open',
          project_status_id: 1
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editProduction.isLoading).to.equal(false)
          expect(state.editProduction.isError).to.equal(false)
          expect(state.productions.length).to.equal(4)
          done()
        }
      })
      expect(state.editProduction.isLoading).to.equal(true)
      expect(state.editProduction.isError).to.equal(false)
    })

    it('editProduction', (done) => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      helpers.runAction('editProduction', {
        data: {
          id: 'production-2',
          name: 'Big Buck Bunny 2',
          project_status_name: 'Open',
          project_status_id: 1
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editProduction.isLoading).to.equal(false)
          expect(state.editProduction.isError).to.equal(false)
          expect(state.productions.length).to.equal(3)
          expect(state.productions[2].name).to.equal('Big Buck Bunny 2')
          done()
        }
      })
      expect(state.editProduction.isLoading).to.equal(true)
      expect(state.editProduction.isError).to.equal(false)
    })

    it('deleteProduction', (done) => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      helpers.runAction('deleteProduction', {
        production: productions[1],
        callback: (err) => {
          expect(err).to.be.null
          expect(state.deleteProduction.isLoading).to.equal(false)
          expect(state.deleteProduction.isError).to.equal(false)
          expect(state.productions.length).to.equal(2)
          done()
        }
      })
      expect(state.deleteProduction.isLoading).to.equal(true)
      expect(state.deleteProduction.isError).to.equal(false)
    })

    it('storeProductionPicture', () => {
      const formData = { form: true }
      store.dispatch('storeProductionPicture', formData)
      expect(state.productionAvatarFormData).to.deep.equal(formData)
    })

    it('uploadProductionAvatar', () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      const formData = { form: true }
      store.dispatch('storeProductionPicture', formData)
      return helpers.runAction('uploadProductionAvatar', 'production-2')
        .then(
          () => {
            expect(state.productionMap['production-2'].has_avatar)
              .to.equal(true)
        })
    })
  })

  describe('mutations', () => {
    it(LOAD_PRODUCTIONS_START, () => {
      store.commit(LOAD_PRODUCTIONS_START)
      expect(state.isProductionsLoading).to.equal(true)
      expect(state.isProductionsLoadingError).to.equal(false)
    })

    it(LOAD_PRODUCTIONS_ERROR, () => {
      store.commit(LOAD_PRODUCTIONS_ERROR)
      expect(state.isProductionsLoading).to.equal(false)
      expect(state.isProductionsLoadingError).to.equal(true)
      expect(state.productions).to.deep.equal([])
    })

    it(LOAD_PRODUCTIONS_END, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      expect(state.isProductionsLoading).to.equal(false)
      expect(state.isProductionsLoadingError).to.equal(false)
      expect(state.productions).to.deep.equal(productions)
      expect(state.productions[0].name).to.equal('Agent 327')
      expect(state.productions[1].name).to.equal('Caminandes')
      expect(state.productionMap['production-1'].name).to.equal('Caminandes')
    })

    it(EDIT_PRODUCTION_START, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(EDIT_PRODUCTION_START)
      expect(state.editProduction).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })

    it(EDIT_PRODUCTION_ERROR, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(EDIT_PRODUCTION_ERROR)
      expect(state.editProduction).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })

    it(EDIT_PRODUCTION_END, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      store.commit(EDIT_PRODUCTION_END, {
        id: 'production-4',
        name: 'New production',
        project_status_name: 'Open',
        project_status_id: 1
      })
      expect(state.productions.length).to.equal(4)
      store.commit(EDIT_PRODUCTION_END, {
        id: 'production-2',
        name: 'Big Buck Bunny 2',
        project_status_name: 'Open',
        project_status_id: 1
      })
      expect(state.productions.length).to.equal(4)
      expect(state.productions[3].name).to.equal('Big Buck Bunny 2')

      expect(state.editProduction).to.deep.equal({
        isLoading: false,
        isError: false
      })
      store.commit(DELETE_PRODUCTION_END, productions[2])
    })

    it(DELETE_PRODUCTION_START, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(DELETE_PRODUCTION_START)
      expect(state.deleteProduction).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it(DELETE_PRODUCTION_ERROR, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(DELETE_PRODUCTION_ERROR)
      expect(state.deleteProduction).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it(DELETE_PRODUCTION_END, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      expect(state.productions.length).to.equal(3)
      store.commit(DELETE_PRODUCTION_END, productions[1])
      expect(state.productions.length).to.equal(2)
      expect(state.deleteProduction).to.deep.equal({
        isLoading: false,
        isError: false
      })
    })

    it(LOAD_PRODUCTION_STATUS_END, () => {
      store.commit(LOAD_PRODUCTION_STATUS_END, productionStatuses)
      expect(state.productionStatus.length).to.equal(2)
    })

    it(PRODUCTION_PICTURE_FILE_SELECTED, () => {
      const formData = { form: true }
      store.commit(PRODUCTION_PICTURE_FILE_SELECTED, formData)
      expect(state.productionAvatarFormData).to.deep.equal(formData)
    })

    it(PRODUCTION_AVATAR_UPLOADED, () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      store.commit(PRODUCTION_AVATAR_UPLOADED, 'production-2')
      expect(state.productionMap['production-2'].has_avatar).to.equal(true)
    })
  })
})
