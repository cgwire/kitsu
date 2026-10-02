vi.mock('@/store', () => ({ default: {} }))

import Quota from '@/components/pages/quota/Quota.vue'

import { mountEntityPage } from '../../../fixtures/entity-page'

const person = (name, role, departments) => ({
  id: name.toLowerCase(),
  name,
  full_name: name,
  email: `${name.toLowerCase()}@studio.test`,
  role,
  departments
})
const people = [
  person('Ann', 'user', ['anim']),
  person('Bob', 'manager', ['comp']),
  person('Cat', 'user', ['anim', 'comp'])
]

const periods = () =>
  Object.fromEntries(
    ['day', 'week', 'month', 'year'].map(level => [
      level,
      { frames: {}, entries: {} }
    ])
  )

const mountQuota = async props => {
  const { wrapper } = await mountEntityPage(Quota, {
    listName: 'PeopleAvatar',
    props: {
      computeMode: 'weighted',
      countMode: 'frames',
      detailLevel: 'month',
      taskTypeId: 'task-type-1',
      year: 2026,
      ...props
    },
    getters: {
      personMap: new Map(people.map(person => [person.id, person])),
      productionTeamRoles: { cat: 'supervisor' },
      shotMap: new Map([
        ['shot-1', {}],
        ['shot-2', {}]
      ])
    },
    actions: {
      computeQuota: () =>
        Object.fromEntries(
          [...people.map(({ id }) => id), 'total'].map(id => [id, periods()])
        )
    }
  })
  return wrapper
}

const listedNames = wrapper =>
  wrapper
    .findAll('.datatable-row .name')
    .map(cell => cell.text().trim())
    .filter(Boolean)

describe('Quota list', () => {
  test('lists everybody with a quota, then the total', async () => {
    const wrapper = await mountQuota()

    expect(listedNames(wrapper)).toEqual(['Ann', 'Bob', 'Cat', 'main.total'])
  })

  test('keeps the members of the department', async () => {
    const wrapper = await mountQuota({ departmentId: 'comp' })

    expect(listedNames(wrapper)).toEqual(['Bob', 'Cat'])
  })

  test('keeps the holders of the production role', async () => {
    const wrapper = await mountQuota({ role: 'supervisor' })

    expect(listedNames(wrapper)).toEqual(['Cat'])
  })
})
