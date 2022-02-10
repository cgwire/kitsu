import store from '@/store/modules/tasktypes'

const taskTypes = [
  {
    name: 'Modeling',
    id: 'task-type-1',
    color: '#ffffff',
    for_entity: 'Asset'
  },
  {
    name: 'Shading',
    id: 'task-type-2',
    color: '#eeeeee',
    for_entity: 'Asset'
  },
  {
    name: 'Animation',
    id: 'task-type-3',
    color: '#00eeee',
    for_entity: 'Shot'
  },
  {
    name: 'Edit',
    id: 'task-type-4',
    color: '#ff0f0f',
    for_entity: 'Edit'
  }
]

const taskTypeMap = new Map()
taskTypes.forEach(taskType => {
  taskTypeMap.set(taskType.id, taskType)
})

const rootGetters = {
  productionTaskTypes: taskTypes
}
const getters = {
  assetTaskTypes: taskTypes.filter(t => t.for_entity === 'Asset'),
  shotTaskTypes: taskTypes.filter(t => t.for_entity === 'Shot'),
  editTaskTypes: taskTypes.filter(t => t.for_entity === 'Edit')
}

describe('Task types store', () => {
  describe('Getters', () => {
    let state
    beforeEach(() => {
      state = {
        taskTypes: [...taskTypes],
        taskTypeMap
      }
    })

    test('currentTaskType', () => {
      const rootState = {
        route: { params: { task_type_id: 'task-type-2' } }
      }
      expect(store.getters.currentTaskType(state, null, rootState))
        .toStrictEqual(taskTypes[1])
    }),
    test('assetTaskTypes', () => {
      expect(store.getters.assetTaskTypes(state, null, null, rootGetters))
        .toHaveLength(2)
    })
    test('shotTaskTypes', () => {
      expect(store.getters.shotTaskTypes(state, null, null, rootGetters))
        .toHaveLength(1)
    })
    test('editTaskTypes', () => {
      expect(store.getters.shotTaskTypes(state, null, null, rootGetters))
        .toHaveLength(1)
    })
    test('getTaskTypeOptions', () => {
      expect(
        store.getters.getTaskTypeOptions(state, null, null, rootGetters
        )[0])
        .toStrictEqual({
          label: 'Modeling',
          value: 'task-type-1'
        })
    })
    test('getAssetTaskTypeOptions', () => {
      expect(
        store.getters.getAssetTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Modeling',
          value: 'task-type-1'
        })
    })
    test('getShotTaskTypeOptions', () => {
      expect(
        store.getters.getShotTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Animation',
          value: 'task-type-3'
        })
    })
    test('getEditTaskTypeOptions', () => {
      expect(
        store.getters.getEditTaskTypeOptions(state, getters, null, rootGetters)
          [0])
        .toStrictEqual({
          label: 'Edit',
          value: 'task-type-4'
        })
    })
  })

  describe('Actions', () => {
    test('loadTaskType', () => {
    })
    test('loadTaskTypes', () => {
    })
    test('newTaskType', () => {
    })
    test('editTaskType', () => {
    })
    test('deleteTaskType', () => {
    })
    test('initTaskType', () => {
    })
  })

  describe('Mutations', () => {
    let state
    beforeEach(() => {
      state = {
        taskTypes,
        taskTypeMap
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(state)
      expect(state.taskTypes).toEqual([])
    })

    test('LOAD_TASK_TYPES_ERROR', () => {
      store.mutations.LOAD_TASK_TYPES_ERROR(state)
      expect(state.taskTypes).toEqual([])
      expect(state.taskTypeMap.size).toEqual(0)
    })

    test('LOAD_TASK_TYPES_END', () => {
      store.mutations.RESET_ALL(state)
      store.mutations.LOAD_TASK_TYPES_END(state, taskTypes)
      expect(state.taskTypes).toStrictEqual(taskTypes)
      expect(state.taskTypeMap.size).toEqual(4)
    })

    test('DELETE_TASK_TYPE_END', () => {
      store.mutations.RESET_ALL(state)
      store.mutations.LOAD_TASK_TYPES_END(state, taskTypes)
      store.mutations.DELETE_TASK_TYPE_END(state, { id: 'task-type-2' })
      expect(state.taskTypes).toHaveLength(3)
      expect(state.taskTypeMap.size).toEqual(3)
    })
  })
})
