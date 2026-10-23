import { flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import Team from '@/components/pages/Team.vue'

import { mountEntityPage } from '../../fixtures/entity-page'

const people = [
  { id: 'ann', name: 'Ann', role: 'user', departments: ['anim'] },
  { id: 'bob', name: 'Bob', role: 'manager', departments: ['comp'] },
  { id: 'cat', name: 'Cat', role: 'user', departments: ['anim', 'comp'] }
]

const mountTeam = (query = {}) =>
  mountEntityPage(Team, {
    listName: 'ProductionTeamList',
    query,
    getters: {
      currentProduction: {
        id: 'production-1',
        name: 'Production',
        team: people.map(({ id }) => id)
      },
      personMap: new Map(people.map(person => [person.id, person])),
      // Cat supervises this production
      productionTeamRoles: { cat: 'supervisor' },
      activePeople: people,
      openProductions: []
    },
    stubs: {
      PageLayout: false,
      ProductionTeamList: {
        name: 'ProductionTeamList',
        props: ['entries'],
        template: '<div />'
      }
    }
  })

const listedNames = wrapper =>
  wrapper
    .findComponent({ name: 'ProductionTeamList' })
    .props('entries')
    .map(({ name }) => name)

describe('Team page', () => {
  test('lists the whole team', async () => {
    const { wrapper } = await mountTeam()

    expect(listedNames(wrapper)).toEqual(['Ann', 'Bob', 'Cat'])
  })

  test('filters the team on a department', async () => {
    const { wrapper } = await mountTeam({ department: 'comp' })

    expect(listedNames(wrapper)).toEqual(['Bob', 'Cat'])
  })

  test('filters the team on the role held in the production', async () => {
    const { wrapper } = await mountTeam({ role: 'user' })

    expect(listedNames(wrapper)).toEqual(['Ann'])
  })

  test('writes the chosen filters in the URL', async () => {
    const { wrapper, router } = await mountTeam()

    await wrapper
      .findComponent({ name: 'ComboboxDepartment' })
      .vm.$emit('update:modelValue', 'anim')
    await flushPromises()
    await wrapper
      .findComponent({ name: 'ComboboxStyled' })
      .vm.$emit('update:modelValue', 'supervisor')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      department: 'anim',
      role: 'supervisor'
    })
    expect(listedNames(wrapper)).toEqual(['Cat'])
  })
})
