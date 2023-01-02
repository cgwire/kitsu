import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import { formatSimpleDate } from '@/lib/time'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'

import i18n from '@/lib/i18n'

import ProductionParameters from '@/components/pages/production/ProductionParameters'
import productionStoreFixture from '../../fixtures/production-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)
localVue.directive('focus', {
  inserted (el) {
    el.focus()
  }
})

function initialiseStore (actions, state) {
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
          productionAvatarFormData: null,
          currentProduction: {
            id: 'production-1',
            description: 'initial brief',
            name: 'Caminandes',
            team: ['person-2', 'person-3'],
            task_statuses: []
          },
          isTVShow: true,
          ...state
        },
        mutations: {
          setCurrentProduction (state, production) {
            state.currentProduction = production
          },
          setProductionAvatarFormData (state, avatar) {
            state.productionAvatarFormData = avatar
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
          currentProduction: (state) => state.currentProduction,
          isTVShow: (state) => state.isTVShow,
          productionAvatarFormData: (state) => state.productionAvatarFormData
        }
      },
      user: userStore
    }
  })
}

function initialiseWrapper (store, localVue, i18n) {
  return shallowMount(ProductionParameters, {
    store,
    localVue,
    i18n
  })
}

const currentProduction = {
  id: 'production-current',
  name: 'name',
  team: ['person'],
  task_statuses: [],
  start_date: '2020-01-20',
  end_date: '2020-06-20',
  fps: '24',
  ratio: '16:9',
  resolution: '1920:1080',
  production_type: 'tvshow',
  nb_episodes: 12,
  span_episode: 2
}

describe('ProductionParameters', () => {
  describe('mounted', () => {
    test('mount ProductionParameters', async () => {
      const store = initialiseStore(
        {
          editProduction ({ commit }, production) {
            return new Promise((resolve) => {
              commit('setCurrentProduction', production)
              resolve(production)
            })
          }
        },
        {
          currentProduction
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      expect(wrapper.vm.form.name).toBe(currentProduction.name)
      expect(wrapper.vm.form.start_date).toStrictEqual(new Date(currentProduction.start_date))
      expect(wrapper.vm.form.end_date).toStrictEqual(new Date(currentProduction.end_date))
      expect(wrapper.vm.form.fps).toBe(currentProduction.fps)
      expect(wrapper.vm.form.ratio).toBe(currentProduction.ratio)
      expect(wrapper.vm.form.resolution).toBe(currentProduction.resolution)
      expect(wrapper.vm.form.production_type).toBe(currentProduction.production_type)
      expect(wrapper.vm.form.nb_episodes).toBe(currentProduction.nb_episodes)
      expect(wrapper.vm.form.episode_span).toBe(currentProduction.episode_span)
    })
  })

  describe('Methods', () => {
    const upload = vi.fn()
    test('editParameters', async () => {
      const store = initialiseStore(
        {
          editProduction ({ commit }, production) {
            return new Promise((resolve) => {
              commit('setCurrentProduction', production)
              resolve(production)
            })
          },
          uploadProductionAvatar ({ commit }, production) {
            return new Promise((resolve) => {
              upload()
              resolve(production)
            })
          }
        },
        {
          productionAvatarFormData: 'avatar'
        }
      )
      const formData = {
        name: 'newName',
        start_date: new Date('2020-09-01'),
        end_date: new Date('2021-09-01'),
        nb_episodes: 12,
        episode_span: 12,
        fps: 12,
        ratio: '16:9',
        resolution: '1920:1080',
        production_type: 'tvshow'
      }
      const wrapper = initialiseWrapper(store, localVue, i18n)
      wrapper.setData(
        {
          form: formData,
          isLoading: true
        }
      )
      await wrapper.vm.editParameters()
      await Vue.nextTick()
      store.getters.currentProduction
      expect(wrapper.vm.isLoading).toBe(false)
      expect(store.getters.currentProduction.name).toBe(formData.name)
      expect(store.getters.currentProduction.start_date).toStrictEqual(formatSimpleDate(formData.start_date))
      expect(store.getters.currentProduction.end_date).toStrictEqual(formatSimpleDate(formData.end_date))
      expect(store.getters.currentProduction.fps).toBe(formData.fps)
      expect(store.getters.currentProduction.ratio).toBe(formData.ratio)
      expect(store.getters.currentProduction.resolution).toBe(formData.resolution)
      expect(store.getters.currentProduction.production_type).toBe(formData.production_type)
      expect(store.getters.currentProduction.nb_episodes).toBe(formData.nb_episodes)
      expect(store.getters.currentProduction.episode_span).toBe(formData.episode_span)
      expect(upload).toHaveBeenCalled()
    })

    test('editParameters edit production error', async () => {
      const store = initialiseStore({
        editProduction () {
          return Promise.reject()
        }
      })
      const formData = {
        name: 'newName',
        start_date: new Date('2020-09-01'),
        end_date: new Date('2021-09-01'),
        nb_episodes: 12,
        episode_span: 12,
        fps: 12,
        ratio: '16:9',
        resolution: '1920:1080',
        production_type: 'tvshow'
      }
      const wrapper = initialiseWrapper(store, localVue, i18n)
      wrapper.setData(
        {
          form: formData,
          isLoading: true
        }
      )
      await wrapper.vm.editParameters()
      await Vue.nextTick()
      store.getters.currentProduction
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.isError).toBe(true)
    })

    test('editParameters edit avatar error', async () => {
      const store = initialiseStore(
        {
          editProduction ({ commit }, production) {
            return new Promise((resolve) => {
              commit('setCurrentProduction', production)
              resolve(production)
            })
          },
          uploadProductionAvatar () {
            return Promise.reject()
          }
        },
        {
          productionAvatarFormData: 'avatar'
        }
      )
      const formData = {
        name: 'newName',
        start_date: new Date('2020-09-01'),
        end_date: new Date('2021-09-01'),
        nb_episodes: 12,
        episode_span: 12,
        fps: 12,
        ratio: '16:9',
        resolution: '1920:1080',
        production_type: 'tvshow'
      }
      const wrapper = initialiseWrapper(store, localVue, i18n)
      wrapper.setData(
        {
          form: formData,
          isLoading: true
        }
      )
      await wrapper.vm.editParameters()
      await Vue.nextTick()
      store.getters.currentProduction
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.isError).toBe(true)
    })

    test('updateTvShowRelatedDatas not tvshow', async () => {
      const store = initialiseStore(
        {
          editProduction ({ commit }, production) {
            return new Promise((resolve) => {
              commit('setCurrentProduction', production)
              resolve(production)
            })
          },
          uploadProductionAvatar () {
            return Promise.reject()
          }
        },
        {
          currentProduction
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      wrapper.vm.updateTvShowRelatedDatas(false)
      store.getters.currentProduction
      expect(wrapper.vm.form.nb_episodes).toBe(0)
      expect(wrapper.vm.form.episode_span).toBe(0)
    })

    test('updateTvShowRelatedDatas tvshow', async () => {
      const store = initialiseStore(
        {
          editProduction ({ commit }, production) {
            return new Promise((resolve) => {
              commit('setCurrentProduction', production)
              resolve(production)
            })
          },
          uploadProductionAvatar () {
            return Promise.reject()
          }
        },
        {
          currentProduction
        }
      )
      const wrapper = initialiseWrapper(store, localVue, i18n)
      wrapper.vm.updateTvShowRelatedDatas(true)
      store.getters.currentProduction
      expect(wrapper.vm.form.nb_episodes).toBe(currentProduction.nb_episodes)
      expect(wrapper.vm.form.episode_span).toBe(currentProduction.episode_span)
    })
  })
})
