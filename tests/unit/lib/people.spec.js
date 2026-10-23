// @vitest-environment node

import { filterPeople, getProductionRole } from '@/lib/people'

const ann = { id: 'ann', role: 'user', departments: ['anim'] }
const bob = { id: 'bob', role: 'manager', departments: ['comp'] }
const cat = { id: 'cat', role: 'user', departments: ['anim', 'comp'] }
const dan = { id: 'dan', role: 'admin', departments: [] }
// Cat supervises the production, the link role on Dan predates their
// promotion to admin.
const projectRoles = { cat: 'supervisor', dan: 'user' }

describe('getProductionRole', () => {
  test('is the project role when one overrides the global role', () => {
    expect(getProductionRole(cat, projectRoles)).toBe('supervisor')
    expect(getProductionRole(ann, projectRoles)).toBe('user')
  })

  test('ignores the project role of an admin', () => {
    expect(getProductionRole(dan, projectRoles)).toBe('admin')
  })
})

describe('filterPeople', () => {
  const people = [ann, bob, cat, dan]

  test('keeps everybody without filter', () => {
    expect(filterPeople(people, {})).toEqual(people)
  })

  test('keeps the members of a department', () => {
    expect(filterPeople(people, { departmentId: 'comp' })).toEqual([bob, cat])
  })

  test('keeps the holders of a production role', () => {
    expect(filterPeople(people, { role: 'user', projectRoles })).toEqual([ann])
    expect(filterPeople(people, { role: 'admin', projectRoles })).toEqual([dan])
  })

  test('combines both filters', () => {
    expect(
      filterPeople(people, { departmentId: 'anim', role: 'supervisor', projectRoles })
    ).toEqual([cat])
  })
})
