import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'

import i18n from '@/lib/i18n'

import ProductionBrief from '@/components/pages/production/ProductionBrief'
import productionStoreFixture from '../../fixtures/production-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)

function initialiseStore (actions) {
  const userStore = {
    getters: {
      user: () => ({ id: 'user-1', timezone: 'Europe/Paris' }),
      isCurrentUserAdmin: () => true,
      isCurrentUserManager: () => true
    }
  }

  return new Vuex.Store({
    strict: true,
    modules: {
      productions: {
        ...productionStoreFixture,
        state: {
          currentProduction: {
            id: 'production-1',
            description: 'initial brief',
            name: 'Caminandes',
            team: ['person-2', 'person-3'],
            task_statuses: []
          }
        },
        mutations: {
          setCurrentProduction (state, production) {
            state.currentProduction = production
          }
        },
        actions: {
          setProduction () {
            return new Promise((resolve, reject) => {
              resolve()
            })
          },
          ...actions
        },
        getters: {
          currentProduction: (state) => state.currentProduction
        }
      },
      user: userStore
    }
  })
}

function initialiseWrapper (store, localVue, i18n) {
  return shallowMount(ProductionBrief, {
    store,
    localVue,
    i18n
  })
}

describe('ProductionBrief', () => {
  beforeEach(() => {
  })

  describe('Methods', () => {
    test('editBrief', async () => {
      const store = initialiseStore({
        editProduction ({ commit }, production) {
          return new Promise((resolve) => {
            commit('setCurrentProduction', production)
            resolve(production)
          })
        }
      })
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const brief = 'BRIEF'
      expect(wrapper.vm.brief).toBe('initial brief')
      wrapper.setData({ brief, isLoading: true })
      await wrapper.vm.editBrief()
      await Vue.nextTick()
      expect(wrapper.vm.isLoading).toBe(false)
      expect(store.getters.currentProduction.description).toBe(brief)
    }),

    test('editBrief error', async () => {
      const store = initialiseStore({
        editProduction () {
          return Promise.reject()
        }
      })
      const wrapper = initialiseWrapper(store, localVue, i18n)
      const brief = 'BRIEF'
      expect(wrapper.vm.brief).toBe('initial brief')
      wrapper.setData({ brief, isLoading: true })
      await wrapper.vm.editBrief()
      await Vue.nextTick()
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.errors.editBrief).toBe(true)
      expect(store.getters.currentProduction.description).toBe('initial brief')
    })
  })
})
