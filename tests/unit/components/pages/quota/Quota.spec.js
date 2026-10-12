vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'

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

// Each compute mode gives a quota to everybody, unless the test says who.
const mountQuota = async (props, peopleByMode = {}) => {
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
      computeQuota: ({ computeMode }) => {
        const ids = peopleByMode[computeMode] ?? people.map(({ id }) => id)
        return Object.fromEntries(
          [...ids, 'total'].map(id => [id, periods()])
        )
      }
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

  test('searches the people of the reloaded quotas', async () => {
    const wrapper = await mountQuota(
      { computeMode: 'done', searchText: 'a' },
      { done: ['ann', 'bob'], weighted: ['bob', 'cat'] }
    )
    expect(listedNames(wrapper)).toEqual(['Ann'])

    await wrapper.setProps({ computeMode: 'weighted' })
    await flushPromises()

    expect(listedNames(wrapper)).toEqual(['Cat'])
  })

  test('keeps the name order during a search', async () => {
    const wrapper = await mountQuota(
      { searchText: 'a' },
      { weighted: ['cat', 'bob', 'ann'] }
    )

    expect(listedNames(wrapper)).toEqual(['Ann', 'Cat'])
  })

  test('lists nobody for a search without a name word', async () => {
    const wrapper = await mountQuota({ searchText: 'x=1' })

    expect(wrapper.find('.datatable-body').exists()).toBe(true)
    expect(listedNames(wrapper)).toEqual([])
  })
})
