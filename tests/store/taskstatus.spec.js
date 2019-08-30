import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import taskStatusApi from '../../src/store/api/taskstatus'
import taskStatusStore from '../../src/store/modules/taskstatus'
import { reset, runAction } from './helpers'
import {
  LOAD_TASK_STATUSES_START,
  LOAD_TASK_STATUSES_ERROR,
  LOAD_TASK_STATUSES_END,

  EDIT_TASK_STATUS_START,
  EDIT_TASK_STATUS_ERROR,
  EDIT_TASK_STATUS_END,

  DELETE_TASK_STATUS_START,
  DELETE_TASK_STATUS_ERROR,
  DELETE_TASK_STATUS_END,

  LOAD_TASK_STATUS_STATUS_END
} from '../../src/store/mutation-types'


let taskStatus = []

taskStatusApi.getTaskStatus = (callback) => {
  process.nextTick(() => {
    callback(null, taskStatus)
  })
}

taskStatusApi.newTaskStatus = (taskStatus, callback) => {
  taskStatus.id = 4
  process.nextTick(() => {
    callback(null, taskStatus)
  })
}

taskStatusApi.updateTaskStatus = (taskStatus, callback) => {
  process.nextTick(() => {
    callback(null, taskStatus)
  })
}

taskStatusApi.deleteTaskStatus = (taskStatus, callback) => {
  process.nextTick(() => {
    callback(null, taskStatus)
  })
}


const getters = taskStatusStore.getters
const state = store.state.taskStatus

describe('taskStatus', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    taskStatus = [
      {
        id: 'task-status-1',
        name: 'Todo',
        color: '#FFFFFF',
        is_reviewable: false
      },
      {
        id: 'task-status-2',
        name: 'Retake',
        color: '#000000',
        is_reviewable: false
      },
      {
        id: 'task-status-3',
        name: 'Waiting For Approval',
        color: '#333333',
        is_reviewable: false
      }
    ]
  })

  describe('actions', () => {
    it('loadTaskStatus', (done) => {
      helpers.runAction('loadTaskStatus', (err) => {
        expect(err).to.be.null
        expect(state.taskStatus).to.deep.equal([
          {
            id: 'task-status-2',
            name: 'Retake',
            short_name: 'rtk',
            color: '#000000',
            is_reviewable: false
          },
          {
            id: 'task-status-1',
            name: 'Todo',
            short_name: 'todo',
            color: '#FFFFFF',
            is_reviewable: false
          },
          {
            id: 'task-status-3',
            name: 'Waiting For Approval',
            short_name: 'wfa',
            color: '#333333',
            is_reviewable: false
          }
        ])
        done()
      })
    })

    it('newTaskStatus', (done) => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      helpers.runAction('newTaskStatus', {
        form: {
          name: 'New taskStatus'
        },
        callback: (err, taskStatus) => {
          expect(err).to.be.null
          expect(state.taskStatus.length).to.equal(4)
          expect(state.taskStatusMap[taskStatus.id]).to.deep.equal(taskStatus)
          done()
        }
      })
    })

    it('editTaskStatus', (done) => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      helpers.runAction('saveTaskStatus', {
        form: {
          id: 'task-status-2',
          name: 'Modeling edited',
          color: '#AAAAAA'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.taskStatus.length).to.equal(3)
          const taskStatusName = state.taskStatusMap['task-status-2'].name
          expect(taskStatusName).to.equal('Modeling edited')
          done()
        }
      })
    })

    it('deleteTaskStatus', (done) => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      helpers.runAction('deleteTaskStatus', {
        taskStatus: taskStatus[1],
        callback: (err) => {
          expect(err).to.be.null
          expect(state.taskStatus.length).to.equal(2)
          expect(state.taskStatusMap['task-status-1']).to.be.undefined
          done()
        }
      })
    })
  })


  describe('mutations', () => {
    it('LOAD_TASK_STATUSES_START', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(LOAD_TASK_STATUSES_START)
      expect(state.taskStatus).to.deep.equal([])
      expect(state.taskStatusMap).to.deep.equal({})
    })

    it('LOAD_TASK_STATUSES_ERROR', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(LOAD_TASK_STATUSES_ERROR)
      expect(state.taskStatus).to.deep.equal([])
      expect(state.taskStatusMap).to.deep.equal({})
    })

    it('LOAD_TASK_STATUSES_END', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      expect(state.taskStatus).to.deep.equal(taskStatus)
      expect(state.taskStatus[0].name).to.equal('Retake')
      expect(state.taskStatus[1].name).to.equal('Todo')
    })

    it('EDIT_TASK_STATUS_START', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(EDIT_TASK_STATUS_START)
    })

    it('EDIT_TASK_STATUS_ERROR', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(EDIT_TASK_STATUS_ERROR)
    })
    it('EDIT_TASK_STATUS_END', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(EDIT_TASK_STATUS_END, {
        id: 'task-status-4',
        name: 'New task status'
      })
      expect(state.taskStatus.length).to.equal(4)
      expect(state.taskStatusMap['task-status-4'].name)
        .to.equal('New task status')
      store.commit(EDIT_TASK_STATUS_END, {
        id: 'task-status-2',
        name: 'Retake edited'
      })
      expect(state.taskStatus.length).to.equal(4)
      const taskStatusName = state.taskStatusMap['task-status-2'].name
      expect(taskStatusName).to.equal('Retake edited')
      expect(state.taskStatusMap['task-status-2'].name)
        .to.equal('Retake edited')
      store.commit(DELETE_TASK_STATUS_END, taskStatus[2])
    })

    it('DELETE_TASK_STATUS_START', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(DELETE_TASK_STATUS_START)
    })
    it('DELETE_TASK_STATUS_ERROR', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      store.commit(DELETE_TASK_STATUS_ERROR)
    })
    it('DELETE_TASK_STATUS_END', () => {
      store.commit(LOAD_TASK_STATUSES_END, taskStatus)
      expect(state.taskStatus.length).to.equal(3)
      store.commit(DELETE_TASK_STATUS_END, taskStatus[1])
      expect(state.taskStatus.length).to.equal(2)
      expect(state.taskStatusMap[1]).to.be.undefined
    })
  })
})
