import store from '@/store/modules/departments'

const departments = [
  {
    name: 'NAME1',
    id: '1',
    color: '#ffffff'
  },
  {
    name: 'NAME2',
    id: '2',
    color: '#eeeeee'
  }
]

const departmentMap = new Map()
departments.forEach(department => {
  departmentMap.set(department.id, department)
})

describe('Productions store', () => {
  describe('Getters', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        departments: [...departments],
        departmentMap
      }
    })

    test('departments', () => {
      expect(store.getters.departments(rootState)).toStrictEqual(departments)
    }),
    test('getDepartment', () => {
      expect(
        store.getters.getDepartment(rootState)(departments[0].id))
        .toStrictEqual(departments[0])
    })
  })

  describe('Mutations', () => {
    let rootState
    beforeEach(() => {
      rootState = {
        departments,
        departmentMap
      }
    })

    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(rootState)
      expect(rootState.departments).toEqual([])
    }),

    test('EDIT_DEPARTMENTS_END', () => {
      const newDepartment = {
        name: 'NEW DEPARTMENT',
        id: 'newId',
        color: '#eeeeee'
      }
      store.mutations.EDIT_DEPARTMENTS_END(rootState, newDepartment)
      const result = departments
      result.push(newDepartment)
      expect(rootState.departments).toEqual(result)
    }),

    test('DELETE_DEPARTMENTS_END', () => {
      store.mutations.DELETE_DEPARTMENTS_END(
        rootState, rootState.departments[0])
      store.mutations.DELETE_DEPARTMENTS_END(
        rootState, rootState.departments[0])
      store.mutations.DELETE_DEPARTMENTS_END(
        rootState, rootState.departments[0])
      store.mutations.DELETE_DEPARTMENTS_END(
        rootState, rootState.departments[0])
      expect(rootState.departments).toEqual([])
    })
  })
})
