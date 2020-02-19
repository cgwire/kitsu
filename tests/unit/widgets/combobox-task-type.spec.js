import Vue from 'Vue'
import { mount, createLocalVue } from '@vue/test-utils'
import ComboboxTaskType from '../../../src/components/widgets/ComboboxTaskType'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('ComboboxTaskType', () => {
  let taskTypeStore
  let store
  let wrapper

  beforeEach(() => {
    taskTypeStore = {
      getters: {
        taskTypeMap: () => ({
          'task-type-1': {
            id: 'task-type-1',
            name: 'Modeling',
            color: 'blue'
          },
          'task-type-2': {
            id: 'task-type-2',
            name: 'Compositing',
            color: 'red'
          }
        })
      },
      actions: {
      }
    }

    store = new Vuex.Store({
      strict: true,
      modules: {
        taskTypes: taskTypeStore
      }
    })

    wrapper = mount(ComboboxTaskType, {
      propsData: {
        taskTypeList: [
          {
            id: 'task-type-1',
            name: 'Modeling',
            color: 'blue'
          },
          {
            id: 'task-type-2',
            name: 'Modeling',
            color: 'blue'
          }
        ],
        value: 'task-type-1'
      },
      store,
      localVue
    })
  })

  describe('Mount', () => {
    test('Empty list', () => {
      const emptyWrapper = mount(ComboboxTaskType, {
        propsData: {
          taskTypeList: [],
          value: ''
        },
        store
      })
      const lines = emptyWrapper.findAll('.task-type-line')
      expect(lines).toHaveLength(0)
    })

    test('Ensure task type list', done => {
      let lines = wrapper.findAll('.task-type-line')
      expect(lines).toHaveLength(0)
      wrapper.vm.toggleTaskTypeList()
      Vue.nextTick(() => {
        lines = wrapper.findAll('.task-type-line')
        expect(lines).toHaveLength(2)
        done()
      })
    })
  })

  describe('Methods', () => {
    test('toggleTaskTypeList', () => {
      wrapper.vm.toggleTaskTypeList()
      expect(wrapper.vm.showTaskTypeList).toBeTruthy()
      wrapper.vm.toggleTaskTypeList()
      expect(wrapper.vm.showTaskTypeList).toBeFalsy()
    })
    test('selectTaskType', () => {
      wrapper.vm.toggleTaskTypeList()
      expect(wrapper.vm.showTaskTypeList).toBeTruthy()
      wrapper.vm.selectTaskType({ id: 'task-type-1' })
      expect(wrapper.emitted().input[0][0]).toEqual('task-type-1')
      expect(wrapper.vm.showTaskTypeList).toBeFalsy()
    })
  })
})
