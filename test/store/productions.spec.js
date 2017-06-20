import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import productionsApi from '../../src/store/api/productions'
import { reset, runAction } from './helpers'
import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END
} from '../../src/store/mutation-types'


const productions = [
  {
    name: 'Caminandes',
    project_status_name: 'Open'
  },
  {
    name: 'Big Buck Bunny',
    project_status_name: 'Closed'
  },
  {
    name: 'Agent 327',
    project_status_name: 'Open'
  }
]

productionsApi.getProductions = (callback) => {
  process.nextTick(() => {
    callback(null, productions)
  })
}

describe('productions', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  describe('actions', () => {
    it('loadProductions', (done) => {
      helpers.runAction('loadProductions', (err) => {
        expect(err).to.be.null
        expect(store._vm.isProductionsLoading).to.equal(false)
        expect(store._vm.isProductionsLoadingError).to.equal(false)
        expect(store._vm.productions).to.deep.equal(productions)
        done()
      })
      expect(store._vm.isProductionsLoading).to.equal(true)
      expect(store._vm.isProductionsLoadingError).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('LOAD_PRODUCTIONS_START', () => {
      store.commit(LOAD_PRODUCTIONS_START)
      expect(store._vm.isProductionsLoading).to.equal(true)
      expect(store._vm.isProductionsLoadingError).to.equal(false)
    })

    it('LOAD_PRODUCTIONS_ERROR', () => {
      store.commit(LOAD_PRODUCTIONS_ERROR)
      expect(store._vm.isProductionsLoading).to.equal(false)
      expect(store._vm.isProductionsLoadingError).to.equal(true)
      expect(store._vm.productions).to.deep.equal([])
    })

    it('LOAD_PRODUCTIONS_END', () => {
      store.commit(LOAD_PRODUCTIONS_END, productions)
      expect(store._vm.isProductionsLoading).to.equal(false)
      expect(store._vm.isProductionsLoadingError).to.equal(false)
      expect(store._vm.productions).to.deep.equal(productions)
      expect(store._vm.productions[0].name).to.equal('Agent 327')
      expect(store._vm.productions[1].name).to.equal('Caminandes')
    })
  })
})
