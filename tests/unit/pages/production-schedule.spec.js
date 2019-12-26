import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'
import moment from 'moment'

import i18n from '../../../src/lib/i18n'
import { range } from '../../../src/lib/time'

import ProductionSchedule from '../../../src/components/pages/ProductionSchedule'

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
  let newsStore
  let productionStore
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
    },
    taskStatusStore = {
      getters: {
        taskStatus: () => []
      },
      actions: {
      }
    },
    taskTypeStore = {
      getters: {
        taskTypes: () => []
      },
      actions: {
      }
    },
    productionStore = {
      getters: {
        currentProduction: () => ({ id: 'production-1', name: 'Prod 1' })
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
        productions: productionStore,
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

    test('convertScheduleItems', () => {
      let item = wrapper.vm.convertScheduleItems([{
        name: 'Characters',
        start_date: '2019-08-15',
        end_date: '2019-09-01'
      }])
      expect(item[0]).toEqual({
        editable: true,
        name: 'Characters',
        start_date: '2019-08-15',
        end_date: '2019-09-01',
        startDate: moment('2019-08-15', 'YYYY-MM-DD', 'en'),
        endDate: moment('2019-09-01', 'YYYY-MM-DD', 'en'),
        expanded: false,
        loading: false,
        children: []
      })
    })
  })
})
