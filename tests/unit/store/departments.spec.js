import store from '../../../src/store/modules/departments'

const departments = [
  {
    name: 'NAME1',
    id: "1",
    color: '#ffffff'
  },
  {
    name: 'NAME2',
    id: "2",
    color: '#eeeeee'
  }
]

describe('Productions store', () => {
  describe('Getters', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        departments: [...departments],
      }
    })

    test('departments', () => {
      expect(store.getters.departments(rootState)).toStrictEqual(departments)
    }),
    test('getDepartments', () => {
        expect(store.getters.getDepartments(rootState)(departments[0].id)).toStrictEqual(departments[0])
    })
  })

  describe('Actions', () => {
  })

  describe('Mutations', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        departments
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(rootState)
      expect(rootState.departments).toEqual([])
    }),

    test('EDIT_DEPARTMENTS_END', () => {
      const newDepartement = {
        name: 'NEW DEPARTMENT',
        id: 'newId',
        color: '#eeeeee'
      }
      store.mutations.EDIT_DEPARTMENTS_END(rootState, newDepartement)
      const result = departments
      result.push(newDepartement)
      expect(rootState.departments).toEqual(result)
    }),

    test('DELETE_DEPARTMENTS_END', () => {
      const state = {
        departments: [{
          name: 'test',
          id: 'test',
          color: 'test'
        }],
      }
      store.mutations.DELETE_DEPARTMENTS_END(state, state.departments[0])
      expect(state.departments).toEqual([])
    })
  })
})
