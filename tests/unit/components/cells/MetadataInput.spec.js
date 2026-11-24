import { mount, RouterLinkStub } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// The people module pulls in the root store (lib/auth → @/store): stub it so
// no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import peopleStore from '@/store/modules/people'

import MetadataInput from '@/components/cells/MetadataInput.vue'
import MetadataPerson from '@/components/cells/MetadataPerson.vue'

import { useNumberField } from '../../fixtures/number-input'

const descriptor = {
  id: 'descriptor-1',
  field_name: 'drawings',
  data_type: 'number',
  departments: []
}

describe('cells/MetadataInput', () => {
  describe('number', () => {
    // A list saving each key, the way the entity pages do: the new value
    // comes back to the cell at once.
    const mountCell = () => {
      const store = createStore({
        getters: {
          currentProduction: () => ({ id: 'production-1', team: [] }),
          isCurrentUserAdmin: () => true,
          isCurrentUserManager: () => true,
          isCurrentUserSupervisor: () => false,
          selectedAssets: () => new Map(),
          selectedEdits: () => new Map(),
          selectedShots: () => new Map(),
          selectedTasks: () => new Map(),
          taskTypeMap: () => new Map(),
          user: () => ({ departments: [] })
        }
      })
      const i18n = createI18n({ legacy: false, locale: 'en' })
      const wrapper = mount(MetadataInput, {
        attachTo: document.body,
        props: {
          descriptor,
          entity: { id: 'shot-1', data: {} },
          onMetadataChanged: ({ entry, value }) =>
            wrapper.setProps({
              entity: { ...entry, data: { [descriptor.field_name]: value } }
            })
        },
        global: { plugins: [store, i18n] }
      })
      return wrapper
    }

    const savedValues = wrapper =>
      wrapper.emitted('metadata-changed').map(([{ value }]) => value)

    // Written back from the number saved, "1.0" turned into "1": typing 1.05
    // key by key saved 15.
    test('keeps the zero typed after the decimal point', async () => {
      const wrapper = mountCell()
      const field = useNumberField(wrapper.find('input').element)

      expect(await field.type('1.05')).toEqual(['1', '1.', '1.0', '1.05'])
      expect(savedValues(wrapper)).toEqual([1, 1, 1.05])

      wrapper.unmount()
    })

    test('shows a value saved elsewhere', async () => {
      const wrapper = mountCell()
      const field = useNumberField(wrapper.find('input').element)
      await field.type('1.0')

      await wrapper.setProps({
        entity: { id: 'shot-1', data: { drawings: 3 } }
      })
      expect(field.text()).toBe('3')
      await wrapper.setProps({ entity: { id: 'shot-1', data: {} } })
      expect(field.text()).toBe('')

      wrapper.unmount()
    })
  })

  describe('url', () => {
    const url = 'https://example.com/reference'

    const mountCell = ({ value = url, isAdmin = true, selected } = {}) => {
      const store = createStore({
        getters: {
          currentProduction: () => ({ id: 'production-1', team: [] }),
          isCurrentUserAdmin: () => isAdmin,
          isCurrentUserManager: () => isAdmin,
          isCurrentUserSupervisor: () => false,
          selectedAssets: () => new Map(),
          selectedEdits: () => new Map(),
          selectedShots: () => new Map(),
          selectedTasks: () => new Map(),
          taskTypeMap: () => new Map(),
          user: () => ({ departments: [] })
        }
      })
      return mount(MetadataInput, {
        props: {
          descriptor: {
            id: 'descriptor-2',
            field_name: 'reference',
            data_type: 'url',
            departments: []
          },
          entity: { id: 'asset-1', data: { reference: value } },
          selected
        },
        global: {
          plugins: [store, createI18n({ legacy: false, locale: 'en' })]
        }
      })
    }

    test('opens the url in a new tab from the list editor', () => {
      const wrapper = mountCell()

      expect(wrapper.find('input[type="url"]').element.value).toBe(url)
      expect(wrapper.find('input[type="url"]').attributes()).not.toHaveProperty(
        'readonly'
      )
      const link = wrapper.find('a')
      expect(link.attributes()).toMatchObject({
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer'
      })
    })

    test('opens the url when the user cannot edit it', () => {
      const wrapper = mountCell({ isAdmin: false })

      expect(wrapper.find('input[type="url"]').attributes()).toHaveProperty(
        'readonly'
      )
      expect(wrapper.find('a').attributes('href')).toBe(url)
    })

    test('keeps the click away from the row', async () => {
      const wrapper = mountCell()
      const onRowClick = vi.fn()
      wrapper.element.parentElement.addEventListener('click', onRowClick)

      await wrapper.find('a').trigger('click')

      expect(onRowClick).not.toHaveBeenCalled()
    })

    // A task list row selects itself on Enter and cancels the key: the link
    // keeps it, so the browser opens the url.
    test.each([
      ['the open button', {}],
      ['the link of an unselected task row', { selected: false }]
    ])('keeps Enter on %s away from the row', (_, options) => {
      const wrapper = mountCell(options)
      const onRowKeydown = vi.fn()
      wrapper.element.parentElement.addEventListener('keydown', onRowKeydown)
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      })

      wrapper.find('a').element.dispatchEvent(event)

      expect(onRowKeydown).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    })

    test('has no link without a value', () => {
      expect(mountCell({ value: '' }).find('a').exists()).toBe(false)
      expect(
        mountCell({ value: '', selected: false }).find('a').exists()
      ).toBe(false)
    })

    test('links no unsafe scheme', () => {
      const value = 'javascript:alert(1)'

      expect(mountCell({ value }).find('a').exists()).toBe(false)
      const readonly = mountCell({ value, selected: false })
      expect(readonly.find('a').exists()).toBe(false)
      expect(readonly.text()).toBe(value)
    })

    test('shows a link on an unselected task row', () => {
      const wrapper = mountCell({ selected: false })

      expect(wrapper.find('input').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe(url)
      expect(wrapper.find('a').text()).toBe(url)
    })
  })

  describe('person', () => {
    const person = (id, firstName) => ({
      id,
      first_name: firstName,
      last_name: 'Doe',
      email: `${id}@example.com`,
      active: true
    })

    let theme

    beforeEach(() => {
      theme = document.createElement('div')
      theme.innerHTML = '<div id="theme-popups"></div>'
      document.body.appendChild(theme)
    })

    afterEach(() => {
      theme.remove()
    })

    // The real people module, whose person map keeps its identity when a
    // person changes.
    const mountCell = () => {
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
          currentProduction: () => ({
            id: 'production-1',
            team: ['person-1', 'person-2']
          }),
          isCurrentUserAdmin: () => true,
          isCurrentUserManager: () => true,
          isCurrentUserSupervisor: () => false,
          isDarkTheme: () => false,
          selectedAssets: () => new Map(),
          selectedEdits: () => new Map(),
          selectedShots: () => new Map(),
          selectedTasks: () => new Map(),
          taskTypeMap: () => new Map(),
          user: () => ({ departments: [] })
        }
      })
      store.commit('LOAD_PEOPLE_END', {
        people: [person('person-1', 'Ada'), person('person-2', 'Bob')],
        userFilters: {}
      })
      const wrapper = mount(MetadataInput, {
        props: {
          descriptor: {
            id: 'descriptor-3',
            field_name: 'supervisor',
            data_type: 'person',
            departments: []
          },
          entity: { id: 'shot-1', data: { supervisor: 'person-1' } }
        },
        global: {
          plugins: [store, createI18n({ legacy: false, locale: 'en' })],
          stubs: { RouterLink: RouterLinkStub }
        }
      })
      return { store, wrapper }
    }

    const findName = wrapper => wrapper.find('.metadata-person-cell .ellipsis')
    // The people the picker offers.
    const getTeamNames = wrapper =>
      wrapper
        .findComponent(MetadataPerson)
        .props('people')
        .map(({ name }) => name)

    test('shows a person renamed elsewhere, in the cell and its picker', async () => {
      const { store, wrapper } = mountCell()
      expect(findName(wrapper).text()).toBe('Ada Doe')
      expect(getTeamNames(wrapper)).toEqual(['Ada Doe', 'Bob Doe'])

      store.commit('EDIT_PEOPLE_END', person('person-1', 'Zoe'))
      await nextTick()

      expect(findName(wrapper).text()).toBe('Zoe Doe')
      expect(getTeamNames(wrapper)).toEqual(['Bob Doe', 'Zoe Doe'])
    })

    test('empties the cell of a person deleted elsewhere', async () => {
      const { store, wrapper } = mountCell()

      store.commit('DELETE_PEOPLE_END', person('person-1', 'Ada'))
      await nextTick()

      expect(findName(wrapper).exists()).toBe(false)
      expect(getTeamNames(wrapper)).toEqual(['Bob Doe'])
    })
  })
})
