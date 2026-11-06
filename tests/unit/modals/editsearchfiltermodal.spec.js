import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import TextField from '@/components/widgets/TextField.vue'

// Labels render as their locale keys.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const search = {
  id: 'search-1',
  name: 'wip',
  search_query: 'anim=wip',
  search_filter_group_id: null,
  is_shared: false,
  department_id: null
}

const toEdit = searchQuery => ({ ...searchQuery, person_id: 'person-1' })
const focus = vi.fn()

const mountModal = ({ isManager = true, productionId, ...props } = {}) => {
  const store = createStore({
    getters: {
      // Set on every page, out of a production too.
      currentProduction: () => ({ id: 'production-1' }),
      isCurrentUserManager: () => isManager,
      personMap: () => new Map([['person-1', { id: 'person-1' }]])
    }
  })
  return shallowMount(EditSearchFilterModal, {
    props: { active: true, productionId, ...props },
    global: {
      plugins: [store, i18n],
      stubs: {
        BaseModal: {
          props: ['title'],
          template: '<div><h2>{{ title }}</h2><slot /></div>'
        },
        TextField: {
          methods: { focus },
          props: ['errored', 'errorText', 'maxlength', 'modelValue'],
          template: '<input />'
        }
      }
    }
  })
}

describe('EditSearchFilterModal', () => {
  // The modal focuses its name field 100 ms after it opens.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    focus.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('lets a manager share a search of a production', () => {
    const wrapper = mountModal({ productionId: 'production-1' })

    expect(wrapper.findComponent(BooleanField).exists()).toBe(true)
  })

  test('keeps the sharing from anyone else', () => {
    const wrapper = mountModal({
      isManager: false,
      productionId: 'production-1'
    })

    expect(wrapper.findComponent(BooleanField).exists()).toBe(false)
  })

  // Zou would turn it off without a word.
  test('offers no sharing for a search out of any production', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(BooleanField).exists()).toBe(false)
  })

  test('confirms on the Enter key of a field', () => {
    const wrapper = mountModal({ searchQueryToEdit: toEdit(search) })

    wrapper.findComponent(TextField).vm.$emit('enter', 'wip')

    expect(wrapper.emitted('confirm')).toEqual([[search]])
  })

  test('confirms nothing while a save runs', () => {
    const wrapper = mountModal({
      searchQueryToEdit: toEdit(search),
      isLoading: true
    })

    wrapper.findComponent(TextField).vm.$emit('enter', 'wip')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  test('asks for a query', async () => {
    const wrapper = mountModal({ searchQueryToEdit: toEdit(search) })

    await wrapper
      .findAllComponents(TextField)[1]
      .vm.$emit('update:modelValue', '')
    wrapper.findComponent(ModalFooter).vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(focus).toHaveBeenCalledTimes(1)
  })

  describe('on a new search', () => {
    const newSearch = { name: 'anim=wip', search_query: 'anim=wip' }

    test('titles and fills itself from the search', () => {
      const wrapper = mountModal({ searchQueryToEdit: newSearch })
      const [name, query] = wrapper.findAllComponents(TextField)

      expect(wrapper.find('h2').text()).toBe('main.search_query_add')
      expect(wrapper.findComponent(ModalFooter).props('errorText')).toBe(
        'main.search_query_add_error'
      )
      expect(name.props('modelValue')).toBe('anim=wip')
      expect(query.props('modelValue')).toBe('anim=wip')
    })

    test('confirms the search with no id', () => {
      const wrapper = mountModal({ searchQueryToEdit: newSearch })

      wrapper.findComponent(ModalFooter).vm.$emit('confirm')

      expect(wrapper.emitted('confirm')).toEqual([
        [
          {
            ...search,
            id: null,
            name: 'anim=wip'
          }
        ]
      ])
    })

    // A max length does not hold on a value set by script.
    test('cuts its name to the length Zou takes', () => {
      const long = `${'x'.repeat(199)} and more`
      const wrapper = mountModal({
        searchQueryToEdit: { name: long, search_query: long }
      })

      expect(
        wrapper.findComponent(TextField).props('modelValue')
      ).toBe('x'.repeat(199))
    })

    test('drops the department of a search no longer shared', async () => {
      const wrapper = mountModal({
        productionId: 'production-1',
        searchQueryToEdit: newSearch
      })
      const sharing = wrapper.findComponent(BooleanField)

      await sharing.vm.$emit('update:modelValue', 'true')
      await wrapper
        .findComponent(ComboboxDepartment)
        .vm.$emit('update:modelValue', 'department-1')
      await sharing.vm.$emit('update:modelValue', 'false')
      wrapper.findComponent(ModalFooter).vm.$emit('confirm')

      expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
        is_shared: false,
        department_id: null
      })
    })

    test('counts the length in characters', () => {
      const emojis = '😀'.repeat(300)
      const wrapper = mountModal({
        searchQueryToEdit: { name: emojis, search_query: emojis }
      })

      expect(wrapper.findComponent(TextField).props('modelValue')).toBe(
        '😀'.repeat(200)
      )
      expect(
        wrapper.findAllComponents(TextField)[1].props('errored')
      ).toBe(false)
    })
  })

  test('titles itself as an edit on a saved search', () => {
    const wrapper = mountModal({ searchQueryToEdit: toEdit(search) })

    expect(wrapper.find('h2').text()).toBe('main.search_query_edit')
    expect(wrapper.findComponent(ModalFooter).props('errorText')).toBe(
      'main.search_query_edit_error'
    )
  })

  test('limits its fields to what Zou takes', () => {
    const wrapper = mountModal({ searchQueryToEdit: toEdit(search) })
    const [name, query] = wrapper.findAllComponents(TextField)

    expect(name.props('maxlength')).toBe(200)
    expect(query.props('maxlength')).toBe(500)
  })

  describe('on a query too long to save', () => {
    const tooLong = 'x'.repeat(501)

    test('tells it and refuses to confirm', () => {
      const wrapper = mountModal({
        searchQueryToEdit: { name: 'long', search_query: tooLong }
      })
      const query = wrapper.findAllComponents(TextField)[1]

      expect(query.props('errored')).toBe(true)
      expect(query.props('errorText')).toBe('main.search_query_too_long')
      expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)

      query.vm.$emit('enter', tooLong)
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    test('takes it once shortened', async () => {
      const wrapper = mountModal({
        searchQueryToEdit: { name: 'long', search_query: tooLong }
      })

      await wrapper
        .findAllComponents(TextField)[1]
        .vm.$emit('update:modelValue', 'x'.repeat(500))

      expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(false)
    })
  })

  describe('on a name the list holds', () => {
    const queries = [
      search,
      { id: 'search-2', name: 'taken', search_filter_group_id: null },
      { id: 'search-3', name: 'grouped', search_filter_group_id: 'group-1' }
    ]
    const newSearch = name => ({ name, search_query: 'anim=wip' })
    const nameField = wrapper => wrapper.findComponent(TextField)
    const footer = wrapper => wrapper.findComponent(ModalFooter)

    test('refuses it on a new search', () => {
      const wrapper = mountModal({
        queries,
        searchQueryToEdit: newSearch('taken')
      })

      expect(nameField(wrapper).props('errored')).toBe(true)
      expect(nameField(wrapper).props('errorText')).toBe(
        'main.filter_name_taken'
      )
      expect(footer(wrapper).props('isDisabled')).toBe(true)

      nameField(wrapper).vm.$emit('enter', 'taken')
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    test('refuses it on a rename', async () => {
      const wrapper = mountModal({
        queries,
        searchQueryToEdit: toEdit(search)
      })

      await nameField(wrapper).vm.$emit('update:modelValue', 'taken')

      expect(nameField(wrapper).props('errored')).toBe(true)
      expect(footer(wrapper).props('isDisabled')).toBe(true)
    })

    test('leaves a name unchanged, so a duplicate stays editable', () => {
      const wrapper = mountModal({
        queries: [...queries, { ...search, id: 'search-4' }],
        searchQueryToEdit: toEdit(search)
      })

      expect(nameField(wrapper).props('errored')).toBe(false)
      expect(footer(wrapper).props('isDisabled')).toBe(false)
    })

    test('takes a name of another filter group', () => {
      const wrapper = mountModal({
        queries,
        searchQueryToEdit: newSearch('grouped')
      })

      expect(nameField(wrapper).props('errored')).toBe(false)
    })

    test('checks the name in the filter group picked', async () => {
      const wrapper = mountModal({
        groupOptions: [
          { label: '', value: null },
          { label: 'Mine', value: 'group-1', is_shared: false }
        ],
        isGroupEnabled: true,
        queries,
        searchQueryToEdit: newSearch('grouped')
      })

      await wrapper
        .findComponent(Combobox)
        .vm.$emit('update:modelValue', 'group-1')

      expect(nameField(wrapper).props('errored')).toBe(true)
    })
  })

  test('keeps the department of a shared search', () => {
    const shared = { ...search, is_shared: true, department_id: 'department-1' }
    const wrapper = mountModal({
      productionId: 'production-1',
      searchQueryToEdit: toEdit(shared)
    })

    wrapper.findComponent(ModalFooter).vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toEqual([[shared]])
  })

  test('drops the department of a saved search no longer shared', async () => {
    const wrapper = mountModal({
      productionId: 'production-1',
      searchQueryToEdit: toEdit({
        ...search,
        is_shared: true,
        department_id: 'department-1'
      })
    })

    await wrapper
      .findComponent(BooleanField)
      .vm.$emit('update:modelValue', 'false')
    wrapper.findComponent(ModalFooter).vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toEqual([[search]])
  })
})
