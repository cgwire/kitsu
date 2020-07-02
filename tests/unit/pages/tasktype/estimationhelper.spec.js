import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import i18n from '@/lib/i18n'
import EstimationHelper from '@/components/pages/tasktype/EstimationHelper'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
const router = new VueRouter()


describe('EstimationHelper', () => {
  let store, assetStore, peopleStore, productionStore, shotStore, taskStore
  let wrapper
  let getters

  beforeEach(() => {
    assetStore = {
      state: {
        assetSearchText: ''
      },
      getters: {
        assetMetadataDescriptors: () => [
          {
            id: 'descriptor-1', name: 'Difficulty', choices: ['easy', 'hard']
          },
          { id: 'descriptor-2', name: 'Size' },
        ],
        assetSearchText: (state) => state.assetSearchText,
        assetValidationColumns: () => ['task-type-1', 'task-type-2'],
        assetMap: () => ({
          'asset-1': { id: 'asset-1', name: 'Lama'},
          'asset-2': { id: 'asset-2', name: 'Pingu'}
        })
      },
      mutations: {
        'CHANGE_SEARCH': (state, query) => state.assetSearchText = query
      },
      actions: {
        changeSearch ({ commit, state }, query) {
          commit('CHANGE_SEARCH', query)
        }
      }
    }
    shotStore = {
      getters: {
        shotMetadataDescriptors: () => [
          { id: 'descriptor-3', name: 'Style' },
          { id: 'descriptor-4', name: 'Length' },
        ],
        shotSearchText: () => '',
        shotValidationColumns: () => ['task-type-3', 'task-type-4'],
        shotMap: () => ({
          'shot-1': { id: 'shot-1', name: 'SH01'},
          'shot-2': { id: 'shot-2', name: 'SH02'}
        })
      },
      actions: {}
    }
    productionStore = {
      getters: {
        currentProduction: () => ({
          id: 'production-1',
          name: 'Caminandes',
          team: ['person-2', 'person-3']
        })
      },
      actions: {}
    }
    peopleStore = {
      getters: {
        isCurrentUserVendor: () => false,
        people: () => [
          { id: 'person-1', name: 'John' },
          { id: 'person-2', name: 'James' },
          { id: 'person-3', name: 'Ema' }
        ],
        personMap: () => ({
          'person-1': { id: 'person-1', name: 'John' },
          'person-2': { id: 'person-2', name: 'James' },
          'person-3': { id: 'person-3', name: 'Ema' }
        })
      },
      actions: {}
    }
    taskStore = {
      getters: {
        taskTypes: () => [
          { id: 'task-type-1', name: 'Modeling' },
          { id: 'task-type-2', name: 'Rigging' },
          { id: 'task-type-3', name: 'Layout' },
          { id: 'task-type-4', name: 'Animation' }
        ],
        taskStatus: () => [
          { id: 'task-status-1', short_name: 'WFA' },
          { id: 'task-status-2', short_name: 'WIP' },
          { id: 'task-status-3', short_name: 'Retake' }
        ],
        taskTypeMap: () => ({
          'task-type-1': { id: 'task-type-1', name: 'Modeling' },
          'task-type-2': { id: 'task-type-2', name: 'Rigging' },
          'task-type-3': { id: 'task-type-3', name: 'Layout' },
          'task-type-4': { id: 'task-type-4', name: 'Animation' }
        }),
        taskStatusMap: () => ({
          'task-status-1': { id: 'task-status-1', short_name: 'WFA' },
          'task-status-2': { id: 'task-status-2', short_name: 'WIP' },
          'task-status-3': { id: 'task-status-3', short_name: 'Retake' },
        })
      },
      actions: {}
    }
    store = new Vuex.Store({
      strict: true,
      modules: {
        assets: assetStore,
        productions: productionStore,
        people: peopleStore,
        shots: shotStore,
        tasks: taskStore
      }
    })

    wrapper = shallowMount(EstimationHelper, {
      store,
      getters,
      localVue,
      i18n,
      router,
      propsData: {
      }
    })
  })

  describe('UI', () => {
    it('mount succeeds', () => {
      const panel = wrapper.find(EstimationHelper)
    })
  })

  describe('Helpers', () => {
    describe('computed', () => {
      it('tasksByPerson', () => {
        expect(wrapper.vm.tasksByPerson).toStrictEqual([])
      })
      it.skip('assignees', () => {
      })
    })

    describe('methods', () => {
      it('getEntity', () => {
        expect(wrapper.vm.getEntity('asset-1').name).toBe('Lama')
        wrapper.setProps({ isAssets: false })
        expect(wrapper.vm.getEntity('asset-1')).toBe(undefined)
        expect(wrapper.vm.getEntity('shot-1').name).toBe('SH01')
      })
      it.skip('compareFirstAssignees', () => {
      })
      it.skip('formatEstimation', () => {
      })
      it.skip('getSeconds', () => {
      })
      it.skip('estimationUpdated', () => {
      })
      it.skip('saveEstimations', () => {
      })
      it.skip('onKeyDown', () => {
      })
      it.skip('clearSelection', () => {
      })
      it.skip('addToSelection', () => {
      })
      it.skip('selectTask', () => {
      })
      it.skip('selectPrevious', () => {
      })
      it.skip('selectNext', () => {
      })
      it.skip('selectSingleTask', () => {
      })
      it.skip('selectTaskRange', () => {
      })
    })
  })
})
