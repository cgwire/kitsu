// @vitest-environment node

import store from '@/store/modules/departments'

const buildDepartments = () => [
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

describe('Departments store', () => {
  let rootState

  beforeEach(() => {
    const departments = buildDepartments()
    rootState = { departments }
    store.cache.departmentMap = new Map(
      departments.map(department => [department.id, department])
    )
  })

  describe('Getters', () => {
    test('departments', () => {
      expect(store.getters.departments(rootState)).toEqual(buildDepartments())
    })

    test('departments filters archived ones', () => {
      rootState.departments[0].archived = true
      expect(
        store.getters.departments(rootState).map(department => department.id)
      ).toEqual(['2'])
      expect(
        store.getters
          .archivedDepartments(rootState)
          .map(department => department.id)
      ).toEqual(['1'])
    })

    test('getDepartment', () => {
      expect(store.getters.getDepartment(rootState)('1')).toEqual(
        buildDepartments()[0]
      )
    })
  })

  describe('Mutations', () => {
    test('RESET_ALL', () => {
      store.mutations.RESET_ALL(rootState)
      expect(rootState.departments).toEqual([])
      expect(store.cache.departmentMap.size).toBe(0)
    })

    test('EDIT_DEPARTMENTS_END adds a new department and keeps the list sorted', () => {
      const newDepartment = {
        name: 'AAA DEPARTMENT',
        id: 'new-id',
        color: '#dddddd'
      }
      store.mutations.EDIT_DEPARTMENTS_END(rootState, newDepartment)
      expect(rootState.departments.map(department => department.name)).toEqual(
        ['AAA DEPARTMENT', 'NAME1', 'NAME2']
      )
      expect(store.cache.departmentMap.get('new-id')).toEqual(newDepartment)
    })

    test('EDIT_DEPARTMENTS_END updates an existing department in place', () => {
      store.mutations.EDIT_DEPARTMENTS_END(rootState, {
        name: 'ZZZ DEPARTMENT',
        id: '1',
        color: '#000000'
      })
      expect(rootState.departments.map(department => department.name)).toEqual(
        ['NAME2', 'ZZZ DEPARTMENT']
      )
    })

    test('DELETE_DEPARTMENTS_END', () => {
      store.mutations.DELETE_DEPARTMENTS_END(rootState, { id: '1' })
      expect(rootState.departments.map(department => department.id)).toEqual([
        '2'
      ])
      expect(store.cache.departmentMap.has('1')).toBe(false)
    })

    test('DELETE_DEPARTMENTS_END ignores an unknown department', () => {
      store.mutations.DELETE_DEPARTMENTS_END(rootState, { id: 'ghost' })
      expect(rootState.departments).toHaveLength(2)
    })
  })
})
