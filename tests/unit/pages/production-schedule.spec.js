import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import moment from 'moment'

import i18n from '@/lib/i18n'

import ProductionSchedule from '@/components/pages/ProductionSchedule'
import productionStoreFixture from '../fixtures/production-store.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)
localVue.directive('focus', {
  inserted (el) {
    el.focus()
  }
})

describe('ProductionSchedule', () => {
  let store
  let taskStore
  let taskStatusStore
  let taskTypeStore
  let userStore
  let wrapper
  let scheduleStore

  beforeEach(() => {
    taskStore = {
      getters: {
        taskTypeMap: () => ({
          'task-type-1': {
            name: 'Modeling'
          }
        }),
        taskStatusMap: () => ({
          'task-status-1': {
            name: 'WIP',
            is_retake: false,
            is_done: false
          },
          'task-status-2': {
            name: 'Retake',
            is_retake: true,
            is_done: false
          },
          'task-status-3': {
            name: 'Done',
            is_retake: false,
            is_done: true
          }
        })
      },
      actions: {
        loadTask: jest.fn()
      }
    }
    taskStatusStore = {
      getters: {
        taskStatus: () => []
      },
      actions: {
      }
    }
    taskTypeStore = {
      getters: {
        taskTypes: () => []
      },
      actions: {
      }
    }
    userStore = {
      getters: {
        user: () => ({ id: 'user-1', timezone: 'Europe/Paris' }),
        isCurrentUserAdmin: () => true,
        isCurrentUserManager: () => true
      },
      actions: {
        editProduction (production) {
          return new Promise((resolve, reject) => {
            resolve(production)
          })
        },
        loadScheduleItems () {
          return new Promise((resolve, reject) => {
            resolve([])
          })
        }
      }
    }
    scheduleStore = {
      getters: {
      },
      actions: {
        loadMilestones () {
          return new Promise((resolve, reject) => {
            resolve([])
          })
        }
      }
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: taskStore,
        productions: { ...productionStoreFixture },
        taskStatus: taskStatusStore,
        taskTypes: taskTypeStore,
        user: userStore,
        schedule: scheduleStore
      }
    })

    wrapper = shallowMount(ProductionSchedule, {
      store,
      localVue,
      i18n
    })
  })

  describe('Mount', () => {
    test('mounted', () => {
    })
  })

  describe('Getters', () => {
    test('params', () => {
    })
  })

  describe('Methods', () => {
    test('onBodyScroll', () => {
    })

    test('convertScheduleItems', done => {
      const item = wrapper.vm.convertScheduleItems(undefined, [{
        name: 'Characters',
        start_date: '2019-08-15',
        end_date: '2019-09-01'
      }])
      Vue.nextTick(() => {
        const newItem = item[0]
        expect(newItem.editable).toEqual(true)
        expect(newItem.name).toEqual('Characters')
        expect(newItem.start_date).toEqual('2019-08-15')
        expect(newItem.end_date).toEqual('2019-09-01')
        expect(newItem.startDate.format('YYYY-MM-DD')).toEqual('2019-08-15')
        expect(newItem.endDate.format('YYYY-MM-DD')).toEqual('2019-09-01')
        expect(newItem.expanded).toEqual(false)
        expect(newItem.loading).toEqual(false)
        expect(newItem.children).toEqual([])
        done()
      })
    })
  })
})
