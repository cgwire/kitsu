import { nextTick } from 'vue'
import { createStore } from 'vuex'

// The people module pulls in the root store (lib/auth → @/store): stub it so
// no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import resizableColumn from '@/directives/resizable-column'
import peopleStore from '@/store/modules/people'

import ProductionList from '@/components/lists/ProductionList.vue'
import TableMetadataSelectorMenu from '@/components/widgets/TableMetadataSelectorMenu.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

const production = (index, name, data = {}) => ({
  id: `production-${index}`,
  name,
  project_status_name: 'Open',
  data
})

const column = (fieldName, dataType, choices = []) => ({
  id: `descriptor-${fieldName}`,
  entity_type: 'Project',
  field_name: fieldName,
  name: fieldName,
  data_type: dataType,
  choices
})

const person = (id, firstName, lastName) => ({
  id,
  first_name: firstName,
  last_name: lastName,
  active: true
})

// The real people module, whose person map keeps its identity when a person
// changes.
const mountList = ({
  productions,
  groupBy,
  descriptors = [],
  getters = {},
  people = [],
  guests = []
}) => {
  peopleStore.cache.people = []
  peopleStore.cache.personMap.clear()
  peopleStore.cache.guests = []
  const store = createStore({
    modules: {
      people: {
        state: { ...peopleStore.state },
        getters: peopleStore.getters,
        mutations: peopleStore.mutations
      }
    },
    getters: {
      isCurrentUserManager: () => false,
      isCurrentUserSupervisor: () => false,
      lastProductionScreen: () => 'assets',
      mergedProjectMetadataDescriptors: () => descriptors,
      openProductions: () => productions,
      ...getters
    }
  })
  store.commit('LOAD_PEOPLE_END', { people, userFilters: {} })
  store.commit('LOAD_GUESTS_END', { guests })
  const wrapper = shallowMountWithI18n(ProductionList, {
    global: {
      plugins: [store, resizableColumn],
      stubs: { RouterLink: true }
    },
    props: { entries: productions, groupBy }
  })
  return { store, wrapper }
}

const getSectionTitles = wrapper =>
  wrapper
    .findAll('tr.datatable-type-header')
    .map(header => header.text().replace(/\s+/g, ' '))

describe('lists/ProductionList', () => {
  // A column named "Constructor" has the field name of a property every
  // object inherits.
  test('groups the productions without a Constructor value under None', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha'),
        production(2, 'Bravo', { constructor: 'Studio B' })
      ],
      groupBy: 'constructor'
    })

    expect(getSectionTitles(wrapper)).toEqual(['Studio B (1)', 'None (1)'])
    wrapper.unmount()
  })

  test('groups the productions by type', () => {
    const { wrapper } = mountList({
      productions: [
        { ...production(1, 'Alpha'), production_type: 'tvshow' },
        { ...production(2, 'Bravo'), production_type: 'featurefilm' },
        production(3, 'Charlie')
      ],
      groupBy: 'production_type'
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'Feature Film (1)',
      'Short (1)',
      'TV Show (1)'
    ])
    wrapper.unmount()
  })

  test('groups a blank text under None', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { studio: '  ' }),
        production(2, 'Bravo', { studio: 'Studio B' })
      ],
      groupBy: 'studio',
      descriptors: [column('studio', 'string')]
    })

    expect(getSectionTitles(wrapper)).toEqual(['Studio B (1)', 'None (1)'])
    wrapper.unmount()
  })

  test('sorts the values of a text column by their numbers', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { season: 'Season 10' }),
        production(2, 'Bravo', { season: 'Season 9' })
      ],
      groupBy: 'season',
      descriptors: [column('season', 'string')]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'Season 9 (1)',
      'Season 10 (1)'
    ])
    wrapper.unmount()
  })

  // A column turned from number to text still holds the numbers saved before.
  test('groups the numbers left in a text column as texts', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { season: '9' }),
        production(2, 'Bravo', { season: 'Season 2' }),
        production(3, 'Charlie', { season: 10 })
      ],
      groupBy: 'season',
      descriptors: [column('season', 'string')]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      '9 (1)',
      '10 (1)',
      'Season 2 (1)'
    ])
    wrapper.unmount()
  })

  // Zou keeps the number a number cell saves, while a column turned from
  // text to number still holds text, which its cells leave empty.
  test('groups a number column by value, zero included', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { episodes: 'TBD' }),
        production(2, 'Bravo', { episodes: 26 }),
        production(3, 'Charlie', { episodes: 9 }),
        production(4, 'Delta', { episodes: -5 }),
        production(5, 'Echo', { episodes: 1.5 }),
        production(6, 'Foxtrot'),
        production(7, 'Golf', { episodes: 0 }),
        production(8, 'Hotel', { episodes: '9' }),
        production(9, 'India', { episodes: -10 }),
        production(10, 'Juliett', { episodes: 1.25 }),
        production(11, 'Kilo', { episodes: ' 12' }),
        production(12, 'Lima', { episodes: '+5' }),
        production(13, 'Mike', { episodes: '1.' }),
        production(14, 'November', { episodes: '0x10' })
      ],
      groupBy: 'episodes',
      descriptors: [column('episodes', 'number')]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      '-10 (1)',
      '-5 (1)',
      '0 (1)',
      '1.25 (1)',
      '1.5 (1)',
      '9 (2)',
      '26 (1)',
      'None (6)'
    ])
    wrapper.unmount()
  })

  test('names the person of a person column', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { supervisor: 'person-2' }),
        production(2, 'Bravo', { supervisor: 'person-1' }),
        production(3, 'Charlie'),
        production(4, 'Delta', { supervisor: 'person-gone' }),
        production(5, 'Echo', { supervisor: ' person-1' }),
        production(6, 'Foxtrot', { supervisor: 'guest-1' })
      ],
      groupBy: 'supervisor',
      descriptors: [column('supervisor', 'person')],
      people: [
        person('person-1', 'Grace', 'Hopper'),
        person('person-2', 'Ada', 'Lovelace')
      ],
      guests: [person('guest-1', 'Zoe', 'Guest')]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'Ada Lovelace (1)',
      'Grace Hopper (1)',
      'Zoe Guest (1)',
      'None (3)'
    ])
    wrapper.unmount()
  })

  test('follows a renamed then deleted person', async () => {
    const { store, wrapper } = mountList({
      productions: [production(1, 'Alpha', { supervisor: 'person-1' })],
      groupBy: 'supervisor',
      descriptors: [column('supervisor', 'person')],
      people: [person('person-1', 'Ada', 'Lovelace')]
    })

    store.commit('EDIT_PEOPLE_END', person('person-1', 'Ada', 'King'))
    await nextTick()
    expect(getSectionTitles(wrapper)).toEqual(['Ada King (1)'])

    store.commit('DELETE_PEOPLE_END', person('person-1', 'Ada', 'King'))
    await nextTick()
    expect(getSectionTitles(wrapper)).toEqual(['None (1)'])
    wrapper.unmount()
  })

  // The guests load once the People page lists them.
  test('follows a guest loaded after the list, then renamed', async () => {
    const { store, wrapper } = mountList({
      productions: [production(1, 'Alpha', { supervisor: 'guest-1' })],
      groupBy: 'supervisor',
      descriptors: [column('supervisor', 'person')]
    })
    expect(getSectionTitles(wrapper)).toEqual(['None (1)'])

    store.commit('LOAD_GUESTS_END', {
      guests: [person('guest-1', 'Zoe', 'Guest')]
    })
    await nextTick()
    expect(getSectionTitles(wrapper)).toEqual(['Zoe Guest (1)'])

    store.commit('EDIT_PEOPLE_END', {
      ...person('guest-1', 'Zoe', 'Host'),
      is_guest: true
    })
    await nextTick()
    expect(getSectionTitles(wrapper)).toEqual(['Zoe Host (1)'])
    wrapper.unmount()
  })

  // Vue only checks the keys of the sections when they change.
  test('gives two people of the same name a section each', async () => {
    const warn = vi.spyOn(console, 'warn')
    const { store, wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { supervisor: 'person-1' }),
        production(2, 'Bravo', { supervisor: 'person-2' }),
        production(3, 'Charlie', { supervisor: 'person-1' }),
        production(4, 'Delta', { supervisor: 'person-3' })
      ],
      groupBy: 'supervisor',
      descriptors: [column('supervisor', 'person')],
      people: [
        person('person-1', 'Sam', 'Lee'),
        person('person-2', 'Sam', 'Lee'),
        person('person-3', 'Ada', 'Lovelace')
      ]
    })
    expect(getSectionTitles(wrapper)).toEqual([
      'Ada Lovelace (1)',
      'Sam Lee (2)',
      'Sam Lee (1)'
    ])

    store.commit('EDIT_PEOPLE_END', person('person-3', 'Zoe', 'Zimmer'))
    await nextTick()

    expect(getSectionTitles(wrapper)).toEqual([
      'Sam Lee (2)',
      'Sam Lee (1)',
      'Zoe Zimmer (1)'
    ])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
    wrapper.unmount()
  })

  test('groups a boolean column under No and Yes, as its boxes show', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { approved: 'true' }),
        production(2, 'Bravo', { approved: 'false' }),
        production(3, 'Charlie'),
        production(4, 'Delta', { approved: 'true' }),
        production(5, 'Echo', { approved: true })
      ],
      groupBy: 'approved',
      descriptors: [column('approved', 'boolean')]
    })

    expect(getSectionTitles(wrapper)).toEqual(['No (3)', 'Yes (2)'])
    wrapper.unmount()
  })

  test('writes a date column in the format of the user, in date order', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { delivery: '2027-03-01' }),
        production(2, 'Bravo', { delivery: '2026-12-15' }),
        production(3, 'Charlie'),
        production(4, 'Delta', { delivery: 'TBD' }),
        production(5, 'Echo', { delivery: '2026-02-30' }),
        production(6, 'Foxtrot', { delivery: '15/12/2026' }),
        production(7, 'Golf', { delivery: '2026-2-5' }),
        production(8, 'Hotel', { delivery: '2026-02-05' }),
        production(9, 'India', { delivery: '12/15/2026' }),
        production(10, 'Juliett', { delivery: ' 2026-12-15' })
      ],
      groupBy: 'delivery',
      descriptors: [column('delivery', 'date')],
      getters: { dateFormat: () => 'DD/MM/YYYY' }
    })

    expect(getSectionTitles(wrapper)).toEqual([
      '05/02/2026 (2)',
      '15/12/2026 (1)',
      '01/03/2027 (1)',
      'None (6)'
    ])
    wrapper.unmount()
  })

  test('lists the tags of a tag column as its cells do', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { tags: 'VFX,Animation' }),
        production(2, 'Bravo', { tags: 'Animation,VFX' }),
        production(3, 'Charlie', { tags: 'Removed' }),
        production(4, 'Delta', { tags: 'Animation,Removed' }),
        production(5, 'Echo', { tags: ' VFX' })
      ],
      groupBy: 'tags',
      descriptors: [column('tags', 'taglist', ['Animation', 'Sound', 'VFX'])]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'Animation (1)',
      'Animation, VFX (2)',
      'None (2)'
    ])
    wrapper.unmount()
  })

  test('groups a choice no longer listed under None', () => {
    const { wrapper } = mountList({
      productions: [
        production(1, 'Alpha', { priority: 'High' }),
        production(2, 'Bravo', { priority: 'Urgent' }),
        production(3, 'Charlie', { priority: 'Low' }),
        production(4, 'Delta', { priority: ' High' })
      ],
      groupBy: 'priority',
      descriptors: [column('priority', 'list', ['Low', 'Medium', 'High'])]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'High (1)',
      'Low (1)',
      'None (2)'
    ])
    wrapper.unmount()
  })

  // A production closed while its column changed type keeps the old type
  // once open again.
  test('keeps apart the values of copies of different types', () => {
    const copy = (index, name, data, dataType) => ({
      ...production(index, name, data),
      descriptors: [column('budget', dataType)]
    })
    const { wrapper } = mountList({
      productions: [
        copy(1, 'Alpha', { budget: '5' }, 'string'),
        copy(2, 'Bravo', { budget: 3 }, 'number'),
        copy(3, 'Charlie', { budget: 5 }, 'number'),
        copy(4, 'Delta', { budget: 10 }, 'number'),
        copy(5, 'Echo', { budget: 'false' }, 'string'),
        copy(6, 'Foxtrot', {}, 'boolean'),
        copy(7, 'Golf', { budget: '2026-12-15' }, 'string'),
        copy(8, 'Hotel', { budget: '2026-12-15' }, 'date')
      ],
      groupBy: 'budget',
      descriptors: [column('budget', 'string')],
      getters: { dateFormat: () => 'DD/MM/YYYY' }
    })

    expect(getSectionTitles(wrapper)).toEqual([
      'No (1)',
      '3 (1)',
      '5 (1)',
      '10 (1)',
      '5 (1)',
      '2026-12-15 (1)',
      '15/12/2026 (1)',
      'false (1)'
    ])
    wrapper.unmount()
  })

  // Zou changes a column of every production on the open ones only, and the
  // merged column may be the copy of a closed one.
  test('reads the column of each production as its cells do', () => {
    const { wrapper } = mountList({
      productions: [
        {
          ...production(1, 'Alpha', { priority: 'Urgent' }),
          descriptors: [column('priority', 'list', ['Low', 'Urgent'])]
        },
        {
          ...production(2, 'Bravo', { priority: 'abc' }),
          descriptors: [column('priority', 'string')]
        },
        {
          ...production(3, 'Charlie', { priority: 5 }),
          descriptors: [column('priority', 'number')]
        }
      ],
      groupBy: 'priority',
      descriptors: [column('priority', 'list', ['Low'])]
    })

    expect(getSectionTitles(wrapper)).toEqual([
      '5 (1)',
      'abc (1)',
      'Urgent (1)'
    ])
    wrapper.unmount()
  })

  describe('visible columns menu', () => {
    const findMenu = getters => {
      const { wrapper } = mountList({
        productions: [production(1, 'Alpha')],
        getters
      })
      onTestFinished(() => wrapper.unmount())
      return { menu: wrapper.findComponent(TableMetadataSelectorMenu), wrapper }
    }

    test.each([
      ['a manager', { isCurrentUserManager: () => true }, true],
      ['a supervisor', { isCurrentUserSupervisor: () => true }, true],
      ['an artist', {}, false]
    ])('lets %s add a metadata column', (_, getters, isAllowed) => {
      const { menu } = findMenu(getters)

      expect(menu.props('isAddAllowed')).toBe(isAllowed)
    })

    test('passes the menu request on to the page', async () => {
      const { menu, wrapper } = findMenu({ isCurrentUserManager: () => true })

      await menu.vm.$emit('add-metadata')

      expect(wrapper.emitted('add-metadata')).toHaveLength(1)
    })
  })
})
