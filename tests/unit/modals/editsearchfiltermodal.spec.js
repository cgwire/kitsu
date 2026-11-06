import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import EditSearchFilterModal from '@/components/modals/EditSearchFilterModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
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
        BaseModal: { template: '<div><slot /></div>' },
        TextField: { methods: { focus }, template: '<input />' }
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
