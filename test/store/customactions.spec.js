import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import customActionsApi from '../../src/store/api/customactions'
import customActionStore from '../../src/store/modules/customactions'
import { reset, runAction } from './helpers'
import {
  LOAD_CUSTOM_ACTIONS_START,
  LOAD_CUSTOM_ACTIONS_ERROR,
  LOAD_CUSTOM_ACTIONS_END,

  EDIT_CUSTOM_ACTION_START,
  EDIT_CUSTOM_ACTION_ERROR,
  EDIT_CUSTOM_ACTION_END,

  DELETE_CUSTOM_ACTION_START,
  DELETE_CUSTOM_ACTION_ERROR,
  DELETE_CUSTOM_ACTION_END,

  LOAD_CUSTOM_ACTION_STATUS_END
} from '../../src/store/mutation-types'


let customActions = []

customActionsApi.getCustomActions = (callback) => {
  process.nextTick(() => {
    callback(null, customActions)
  })
}

customActionsApi.newCustomAction = (customAction, callback) => {
  customAction.id = 4
  process.nextTick(() => {
    callback(null, customAction)
  })
}

customActionsApi.updateCustomAction = (customAction, callback) => {
  process.nextTick(() => {
    callback(null, customAction)
  })
}

customActionsApi.deleteCustomAction = (customAction, callback) => {
  process.nextTick(() => {
    callback(null, customActions)
  })
}


const getters = customActionStore.getters
const state = store.state.customActions

describe('customActions', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    customActions = [
      {
        id: 1,
        name: 'Send to render farm'
      },
      {
        id: 2,
        name: 'Build Playlist'
      },
      {
        id: 3,
        name: 'Change status'
      }
    ]
  })

  describe('getters', () => {
    it('customAction', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      console.log(getters)
      const customAction = getters.customAction(state)(2)
      expect(customAction.id).to.equal(2)
      expect(customAction.name).to.equal('Build Playlist')
    })
  })

  describe('actions', () => {
    it('loadCustomActions', (done) => {
      helpers.runAction('loadCustomActions', (err) => {
        expect(err).to.be.null
        expect(state.isCustomActionsLoading).to.equal(false)
        expect(state.isCustomActionsLoadingError).to.equal(false)
        expect(state.customActions).to.deep.equal(customActions)
        done()
      })
      expect(state.isCustomActionsLoading).to.equal(true)
      expect(state.isCustomActionsLoadingError).to.equal(false)
    })

    it('newCustomAction', (done) => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      helpers.runAction('newCustomAction', {
        data: {
          name: 'New customAction'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editCustomAction.isLoading).to.equal(false)
          expect(state.editCustomAction.isError).to.equal(false)
          expect(state.customActions.length).to.equal(4)
          done()
        }
      })
      expect(state.editCustomAction.isLoading).to.equal(true)
      expect(state.editCustomAction.isError).to.equal(false)
    })

    it('editCustomAction', (done) => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      helpers.runAction('editCustomAction', {
        data: {
          id: 2,
          name: 'Build playlist edited',
          color: '#FFFFFF'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editCustomAction.isLoading).to.equal(false)
          expect(state.editCustomAction.isError).to.equal(false)
          expect(state.customActions.length).to.equal(3)
          const customActionName = getters.customAction(state)(2).name
          expect(customActionName).to.equal('Build playlist edited')
          done()
        }
      })
      expect(state.editCustomAction.isLoading).to.equal(true)
      expect(state.editCustomAction.isError).to.equal(false)
    })
    it('deleteCustomAction', (done) => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      helpers.runAction('deleteCustomAction', {
        customAction: customActions[1],
        callback: (err) => {
          expect(err).to.be.null
          expect(state.deleteCustomAction.isLoading).to.equal(false)
          expect(state.deleteCustomAction.isError).to.equal(false)
          expect(state.customActions.length).to.equal(2)
          done()
        }
      })
      expect(state.deleteCustomAction.isLoading).to.equal(true)
      expect(state.deleteCustomAction.isError).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('LOAD_CUSTOM_ACTIONS_START', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_START)
      expect(state.isCustomActionsLoading).to.equal(true)
      expect(state.isCustomActionsLoadingError).to.equal(false)
    })

    it('LOAD_CUSTOM_ACTIONS_ERROR', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_ERROR)
      expect(state.isCustomActionsLoading).to.equal(false)
      expect(state.isCustomActionsLoadingError).to.equal(true)
      expect(state.customActions).to.deep.equal([])
    })

    it('LOAD_CUSTOM_ACTIONS_END', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      expect(state.isCustomActionsLoading).to.equal(false)
      expect(state.isCustomActionsLoadingError).to.equal(false)
      expect(state.customActions).to.deep.equal(customActions)
      expect(state.customActions[0].name).to.equal('Build Playlist')
      expect(state.customActions[1].name).to.equal('Change status')
    })

    it('EDIT_CUSTOM_ACTION_START', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      store.commit(EDIT_CUSTOM_ACTION_START)
      expect(state.editCustomAction).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('EDIT_CUSTOM_ACTION_ERROR', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      store.commit(EDIT_CUSTOM_ACTION_ERROR)
      expect(state.editCustomAction).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('EDIT_CUSTOM_ACTION_END', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      store.commit(EDIT_CUSTOM_ACTION_END, {
        id: 4,
        name: 'New custom action'
      })
      expect(state.customActions.length).to.equal(4)
      store.commit(EDIT_CUSTOM_ACTION_END, {
        id: 2,
        name: 'Send to render farm edited'
      })
      expect(state.customActions.length).to.equal(4)
      const customActionName = getters.customAction(state)(2).name
      expect(customActionName).to.equal('Send to render farm edited')

      expect(state.editCustomAction).to.deep.equal({
        isLoading: false,
        isError: false
      })
      store.commit(DELETE_CUSTOM_ACTION_END, customActions[2])
    })

    it('DELETE_CUSTOM_ACTION_START', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      store.commit(DELETE_CUSTOM_ACTION_START)
      expect(state.deleteCustomAction).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('DELETE_CUSTOM_ACTION_ERROR', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      store.commit(DELETE_CUSTOM_ACTION_ERROR)
      expect(state.deleteCustomAction).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('DELETE_CUSTOM_ACTION_END', () => {
      store.commit(LOAD_CUSTOM_ACTIONS_END, customActions)
      expect(state.customActions.length).to.equal(3)
      store.commit(DELETE_CUSTOM_ACTION_END, customActions[1])
      expect(state.customActions.length).to.equal(2)
      expect(state.deleteCustomAction).to.deep.equal({
        isLoading: false,
        isError: false
      })
    })
  })
})
