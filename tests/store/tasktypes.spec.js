import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import taskTypesApi from '../../src/store/api/tasktypes'
import taskTypeStore from '../../src/store/modules/tasktypes'
import { reset, runAction } from './helpers'
import {
  LOAD_TASK_TYPES_START,
  LOAD_TASK_TYPES_ERROR,
  LOAD_TASK_TYPES_END,

  EDIT_TASK_TYPE_START,
  EDIT_TASK_TYPE_ERROR,
  EDIT_TASK_TYPE_END,

  DELETE_TASK_TYPE_START,
  DELETE_TASK_TYPE_ERROR,
  DELETE_TASK_TYPE_END,

  LOAD_TASK_TYPE_STATUS_END
} from '../../src/store/mutation-types'


let taskTypes = []

taskTypesApi.getTaskTypes = (callback) => {
  process.nextTick(() => {
    callback(null, taskTypes)
  })
}

taskTypesApi.newTaskType = (taskType, callback) => {
  taskType.id = 4
  process.nextTick(() => {
    callback(null, taskType)
  })
}

taskTypesApi.updateTaskType = (taskType, callback) => {
  process.nextTick(() => {
    callback(null, taskType)
  })
}

taskTypesApi.deleteTaskType = (taskType, callback) => {
  process.nextTick(() => {
    callback(null, taskTypes)
  })
}


const getters = taskTypeStore.getters
const state = store.state.taskTypes

describe('taskTypes', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    taskTypes = [
      {
        id: 1,
        name: 'Modeling',
        priority: 1,
        for_shots: true
      },
      {
        id: 2,
        name: 'Animation',
        priority: 1,
        for_shots: true
      },
      {
        id: 3,
        name: 'FX',
        priority: 4,
        for_shots: true
      }
    ]
  })

  describe('getters', () => {
    it('getTaskType', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      const taskType = getters.getTaskType(state)(2)
      expect(taskType.id).to.equal(2)
      expect(taskType.name).to.equal('Animation')
    })
  })

  describe('actions', () => {
    it('loadTaskTypes', (done) => {
      helpers.runAction('loadTaskTypes', (err) => {
        expect(err).to.be.null
        expect(state.taskTypes).to.deep.equal(taskTypes)
        done()
      })
    })

    it('newTaskType', (done) => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      helpers.runAction('newTaskType', {
        data: {
          name: 'New taskType'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editTaskType.isLoading).to.equal(false)
          expect(state.editTaskType.isError).to.equal(false)
          expect(state.taskTypes.length).to.equal(4)
          done()
        }
      })
      expect(state.editTaskType.isLoading).to.equal(true)
      expect(state.editTaskType.isError).to.equal(false)
    })

    it('editTaskType', (done) => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      helpers.runAction('editTaskType', {
        data: {
          id: 2,
          name: 'Modeling edited',
          color: '#FFFFFF'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.editTaskType.isLoading).to.equal(false)
          expect(state.editTaskType.isError).to.equal(false)
          expect(state.taskTypes.length).to.equal(3)
          const taskTypeName = getters.getTaskType(state)(2).name
          expect(taskTypeName).to.equal('Modeling edited')
          done()
        }
      })
      expect(state.editTaskType.isLoading).to.equal(true)
      expect(state.editTaskType.isError).to.equal(false)
    })
    it('deleteTaskType', (done) => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      helpers.runAction('deleteTaskType', {
        taskType: taskTypes[1],
        callback: (err) => {
          expect(err).to.be.null
          expect(state.deleteTaskType.isLoading).to.equal(false)
          expect(state.deleteTaskType.isError).to.equal(false)
          expect(state.taskTypes.length).to.equal(2)
          done()
        }
      })
      expect(state.deleteTaskType.isLoading).to.equal(true)
      expect(state.deleteTaskType.isError).to.equal(false)
    })
  })

  describe('mutations', () => {
    it('LOAD_TASK_TYPES_START', () => {
      store.commit(LOAD_TASK_TYPES_START)
    })

    it('LOAD_TASK_TYPES_ERROR', () => {
      store.commit(LOAD_TASK_TYPES_ERROR)
      expect(state.taskTypes).to.deep.equal([])
    })

    it('LOAD_TASK_TYPES_END', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      expect(state.taskTypes).to.deep.equal(taskTypes)
      expect(state.taskTypes[0].name).to.equal('Animation')
      expect(state.taskTypes[1].name).to.equal('Modeling')
    })

    it('EDIT_TASK_TYPE_START', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(EDIT_TASK_TYPE_START)
      expect(state.editTaskType).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('EDIT_TASK_TYPE_ERROR', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(EDIT_TASK_TYPE_ERROR)
      expect(state.editTaskType).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('EDIT_TASK_TYPE_END', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(EDIT_TASK_TYPE_END, {
        id: 4,
        name: 'New task type',
        priority: 2,
        for_shots: true
      })
      expect(state.taskTypes.length).to.equal(4)
      let taskTypeName = state.taskTypes[2].name
      expect(taskTypeName).to.equal('New task type')

      store.commit(EDIT_TASK_TYPE_END, {
        id: 2,
        name: 'Modeling edited'
      })
      expect(state.taskTypes.length).to.equal(4)
      taskTypeName = getters.getTaskType(state)(2).name
      expect(taskTypeName).to.equal('Modeling edited')

      expect(state.editTaskType).to.deep.equal({
        isLoading: false,
        isError: false
      })
      store.commit(DELETE_TASK_TYPE_END, taskTypes[1])
    })

    it('DELETE_TASK_TYPE_START', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(DELETE_TASK_TYPE_START)
      expect(state.deleteTaskType).to.deep.equal({
        isLoading: true,
        isError: false
      })
    })
    it('DELETE_TASK_TYPE_ERROR', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      store.commit(DELETE_TASK_TYPE_ERROR)
      expect(state.deleteTaskType).to.deep.equal({
        isLoading: false,
        isError: true
      })
    })
    it('DELETE_TASK_TYPE_END', () => {
      store.commit(LOAD_TASK_TYPES_END, taskTypes)
      expect(state.taskTypes.length).to.equal(3)
      store.commit(DELETE_TASK_TYPE_END, taskTypes[1])
      expect(state.taskTypes.length).to.equal(2)
      expect(state.deleteTaskType).to.deep.equal({
        isLoading: false,
        isError: false
      })
    })
  })
})
