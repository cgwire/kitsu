import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuescroll from 'vue-scroll'
import Vuex from 'vuex'

import i18n from '../../../src/lib/i18n'
import { range } from '../../../src/lib/helpers'

// import ProductionSchedule from '../../../src/components/pages/ProductionSchedule'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuescroll)


describe('ProductionNewsFeed', () => {
  let store
  let newsStore
  let productionStore
  let taskStore
  let taskStatusStore
  let taskTypeStore
  let userStore
  let wrapper

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
        user: () => ({ id: 'user-1', timezone: 'Europe/Paris' })
      },
      actions: {}
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        tasks: taskStore,
        productions: productionStore,
        taskStatus: taskStatusStore,
        taskTypes: taskTypeStore,
        user: userStore
      }
    })

    /*
    wrapper = shallowMount(ProductionSchedule, {
      store,
      localVue,
      i18n
    })
    */
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
  })
})
