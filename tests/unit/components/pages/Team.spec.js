import { enableAutoUnmount, flushPromises } from '@vue/test-utils'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import Team from '@/components/pages/Team.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'

import { mountEntityPage } from '../../fixtures/entity-page'
import { buildRefusal } from '../../fixtures/refusal'

enableAutoUnmount(afterEach)

const people = [
  { id: 'ann', name: 'Ann', role: 'user', departments: ['anim'] },
  { id: 'bob', name: 'Bob', role: 'manager', departments: ['comp'] },
  { id: 'cat', name: 'Cat', role: 'user', departments: ['anim', 'comp'] }
]
// Out of the team.
const dan = {
  id: 'dan',
  name: 'Dan',
  role: 'user',
  departments: ['anim'],
  active: true
}

const mountTeam = (query = {}, { actions = {}, getters = {} } = {}) =>
  mountEntityPage(Team, {
    listName: 'ProductionTeamList',
    query,
    actions,
    getters: {
      currentProduction: {
        id: 'production-1',
        name: 'Production',
        team: people.map(({ id }) => id)
      },
      personMap: new Map([...people, dan].map(person => [person.id, person])),
      // Cat supervises this production
      productionTeamRoles: { cat: 'supervisor' },
      activePeople: [...people, dan],
      openProductions: [],
      ...getters
    },
    messages: {
      main: {
        cell_save_error: '"{name}" not saved.',
        cells_save_error: 'Some changes not saved.'
      }
    },
    stubs: {
      PageLayout: false,
      ProductionTeamList: {
        name: 'ProductionTeamList',
        props: ['entries', 'roleRedraws'],
        template: '<div>{{ roleRedraws }}</div>'
      }
    }
  })

const teamList = wrapper => wrapper.findComponent({ name: 'ProductionTeamList' })

// The page bumps the counts in place: only what the list rendered tells
// whether the list saw them.
const renderedRoleRedraws = wrapper => JSON.parse(teamList(wrapper).text())

const listedNames = wrapper =>
  teamList(wrapper)
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

  // The store has put the team back: the page tells it.
  describe('changes Zou refuses', () => {
    const asManager = { isCurrentUserProductionManager: true }
    const message = wrapper => wrapper.findComponent(ErrorText)

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('tells an addition Zou refuses', async () => {
      const { wrapper, dispatched } = await mountTeam(
        {},
        {
          getters: asManager,
          actions: { addPersonToTeam: () => Promise.reject(buildRefusal(403)) }
        }
      )
      expect(message(wrapper).exists()).toBe(false)

      await wrapper.find('.person-to-add').trigger('click')
      await flushPromises()

      expect(dispatched('addPersonToTeam')).toEqual([['addPersonToTeam', dan]])
      expect(message(wrapper).props('text')).toBe('"Dan" not saved.')
      expect(console.error.mock.calls).toEqual([[buildRefusal(403)]])
    })

    test('tells a removal Zou refuses', async () => {
      const [ann] = people
      const { wrapper, dispatched } = await mountTeam(
        {},
        {
          getters: asManager,
          actions: {
            removePersonFromTeam: () => Promise.reject(buildRefusal(403))
          }
        }
      )

      teamList(wrapper).vm.$emit('remove-person', ann)
      await flushPromises()

      expect(dispatched('removePersonFromTeam')).toEqual([
        ['removePersonFromTeam', ann]
      ])
      expect(message(wrapper).props('text')).toBe('"Ann" not saved.')
      expect(console.error.mock.calls).toEqual([[buildRefusal(403)]])
    })

    test('tells a role change Zou refuses and draws the role again', async () => {
      const [ann] = people
      const { wrapper, dispatched } = await mountTeam(
        {},
        {
          getters: asManager,
          actions: {
            setTeamMemberRole: () => Promise.reject(buildRefusal(403))
          }
        }
      )

      teamList(wrapper).vm.$emit('update-role', { person: ann, role: 'manager' })
      await flushPromises()

      expect(dispatched('setTeamMemberRole')).toEqual([
        ['setTeamMemberRole', { personId: 'ann', role: 'manager' }]
      ])
      expect(message(wrapper).props('text')).toBe('"Ann" not saved.')
      expect(renderedRoleRedraws(wrapper)).toEqual({ ann: 1 })
      expect(console.error.mock.calls).toEqual([[buildRefusal(403)]])
    })

    // A select drawn again loses the keyboard focus: only a refusal redraws it.
    test('draws the role again only after a refusal', async () => {
      const [ann] = people
      const { wrapper, dispatched } = await mountTeam(
        {},
        {
          getters: asManager,
          actions: {
            setTeamMemberRole: vi
              .fn()
              .mockRejectedValueOnce(buildRefusal(403))
              .mockResolvedValueOnce()
          }
        }
      )

      teamList(wrapper).vm.$emit('update-role', { person: ann, role: 'manager' })
      await flushPromises()
      expect(renderedRoleRedraws(wrapper)).toEqual({ ann: 1 })

      teamList(wrapper).vm.$emit('update-role', { person: ann, role: 'manager' })
      await flushPromises()

      expect(dispatched('setTeamMemberRole')).toEqual([
        ['setTeamMemberRole', { personId: 'ann', role: 'manager' }],
        ['setTeamMemberRole', { personId: 'ann', role: 'manager' }]
      ])
      expect(renderedRoleRedraws(wrapper)).toEqual({ ann: 1 })
      expect(console.error.mock.calls).toEqual([[buildRefusal(403)]])
    })

    test('tells the refusals of an import at once', async () => {
      const { wrapper, dispatched } = await mountTeam(
        {},
        {
          getters: asManager,
          actions: { addPersonToTeam: () => Promise.reject(buildRefusal(403)) }
        }
      )

      await wrapper
        .findAllComponents({ name: 'ComboboxDepartment' })
        .at(-1)
        .vm.$emit('update:modelValue', 'anim')
      wrapper.findComponent({ name: 'ButtonSimple' }).vm.$emit('click')
      await flushPromises()

      expect(dispatched('addPersonToTeam')).toHaveLength(3)
      expect(message(wrapper).props('text')).toBe('Some changes not saved.')
      const refusal = buildRefusal(403)
      expect(console.error.mock.calls).toEqual([[refusal], [refusal], [refusal]])
    })
  })
})
