vi.mock('@/store', () => ({ default: {} }))

import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'

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
const mountQuota = async (props, peopleByMode = {}, quota = periods) => {
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
      productionTeamRoles: { cat: 'supervisor' }
    },
    actions: {
      computeQuota: ({ computeMode }) => {
        const ids = peopleByMode[computeMode] ?? people.map(({ id }) => id)
        return Object.fromEntries([...ids, 'total'].map(id => [id, quota()]))
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

// The tests switch the production of the store under the list, and answer
// each load when they decide.
const loadingGetters = () =>
  reactive({
    currentProduction: { id: 'production-1' },
    personMap: new Map(people.map(person => [person.id, person])),
    productionTeamRoles: {}
  })

const mountLoading = async (getters, computeQuota) => {
  const { wrapper, dispatched } = await mountEntityPage(Quota, {
    listName: 'PeopleAvatar',
    props: {
      computeMode: 'weighted',
      countMode: 'frames',
      detailLevel: 'month',
      taskTypeId: 'task-type-1',
      year: 2026
    },
    getters,
    actions: { computeQuota }
  })
  return { wrapper, loads: () => dispatched('computeQuota').length }
}

const quotasOf = ids =>
  Object.fromEntries([...ids, 'total'].map(id => [id, periods()]))

describe('Quota loading', () => {
  // Productions share their task types: a switch can keep the task type.
  test('loads the quotas of a production switched to', async () => {
    const getters = loadingGetters()
    const { wrapper } = await mountLoading(getters, () =>
      quotasOf(
        getters.currentProduction.id === 'production-1' ? ['ann'] : ['bob']
      )
    )
    expect(listedNames(wrapper)).toEqual(['Ann', 'main.total'])

    getters.currentProduction = { id: 'production-2' }
    await flushPromises()

    expect(listedNames(wrapper)).toEqual(['Bob', 'main.total'])
  })

  test('loads once for a task type and a compute mode changed together', async () => {
    const { wrapper, loads } = await mountLoading(loadingGetters(), () =>
      quotasOf(['ann'])
    )
    expect(loads()).toBe(1)

    await wrapper.setProps({ taskTypeId: 'task-type-2', computeMode: 'done' })
    await flushPromises()

    expect(loads()).toBe(2)
  })

  // A slow answer for the task type left must not replace the one picked.
  test('keeps the quotas of the latest selection', async () => {
    const answers = new Map()
    const { wrapper } = await mountLoading(
      loadingGetters(),
      ({ taskTypeId }) =>
        new Promise(resolve => answers.set(taskTypeId, resolve))
    )
    await wrapper.setProps({ taskTypeId: 'task-type-2' })

    answers.get('task-type-2')(quotasOf(['bob']))
    await flushPromises()
    answers.get('task-type-1')(quotasOf(['ann']))
    await flushPromises()

    expect(listedNames(wrapper)).toEqual(['Bob', 'main.total'])
  })

  test('shows no quota once nothing is selected', async () => {
    const { wrapper } = await mountLoading(loadingGetters(), () =>
      quotasOf(['ann'])
    )

    await wrapper.setProps({ taskTypeId: null })
    await flushPromises()

    expect(wrapper.find('.datatable-body').exists()).toBe(false)
    expect(wrapper.find('.empty-quota').exists()).toBe(true)
  })
})

describe('Quota weeks', () => {
  test('highlights a week below the quota to reach', async () => {
    const wrapper = await mountQuota(
      { detailLevel: 'week', year: 2025, month: 9, maxQuota: 10 },
      { weighted: ['ann'] },
      () => ({ ...periods(), week: { frames: { '2025-3': 5 }, entries: {} } })
    )

    const personRow = wrapper.findAll('tr.datatable-row')[0]
    const weekCells = personRow.findAll('td').slice(1)
    expect(weekCells[2].classes()).toContain('quota-low')
    expect(weekCells[3].classes()).not.toContain('quota-low')
  })
})

// A route change of the page brings a selected cell into view 100 ms later:
// the page can be left in between.
describe('Quota scroll to the selection', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('drops the scroll of a page left right after a route change', async () => {
    const wrapper = await mountQuota()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await wrapper.vm.$router.push({ path: '/', query: { year: '2025' } })
    await flushPromises()
    wrapper.unmount()

    expect(() => vi.advanceTimersByTime(100)).not.toThrow()
  })
})
