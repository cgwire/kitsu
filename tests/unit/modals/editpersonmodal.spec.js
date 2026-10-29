import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// lib/lang pulls in the root store: stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import TextField from '@/components/widgets/TextField.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const store = createStore({
  getters: {
    departmentMap: () => new Map(),
    departments: () => [],
    people: () => [],
    user: () => ({ id: 'admin-1', role: 'admin' })
  }
})

const mountModal = personToEdit =>
  shallowMount(EditPersonModal, {
    global: { plugins: [store, i18n], renderStubDefaultSlot: true },
    props: { active: true, personToEdit }
  })

const emailField = wrapper =>
  wrapper
    .findAllComponents(TextField)
    .find(field => field.props('type') === 'email')

describe('EditPersonModal', () => {
  // Opening schedules the focus of the name field, a stub without focus()
  // here: the timer must not fire once the test is over.
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  describe('email', () => {
    // Zou accepts a dotless domain where the instance does not check
    // deliverability: the form leaves that decision to it.
    it.each(['jdoe@studio.com', 'jdoe@studio'])('accepts %s', email => {
      const wrapper = mountModal({ id: 'p1', first_name: 'Jane', email })
      expect(emailField(wrapper).props('errored')).toBe(false)
    })

    it.each(['jdoe', 'jdoe@', 'jdoe@studio.c'])('refuses %s', email => {
      const wrapper = mountModal({ id: 'p1', first_name: 'Jane', email })
      expect(emailField(wrapper).props('errored')).toBe(true)
    })
  })

  describe('departments', () => {
    const department = { id: 'd1', name: 'Animation', color: '#000' }
    const departmentStore = createStore({
      getters: {
        departmentMap: () => new Map([[department.id, department]]),
        departments: () => [department],
        people: () => [],
        user: () => ({ id: 'admin-1', role: 'admin' })
      }
    })

    const mountWithDepartments = () =>
      shallowMount(EditPersonModal, {
        global: {
          plugins: [departmentStore, i18n],
          renderStubDefaultSlot: true
        },
        props: {
          active: true,
          personToEdit: { id: 'p1', first_name: 'Jane', departments: [] }
        }
      })

    // A grayed button only stops the mouse: the keyboard used to add an
    // empty department.
    it('cannot add a department before one is picked', async () => {
      const wrapper = mountWithDepartments()
      const addButton = wrapper.find('button.is-success')

      expect(addButton.element.disabled).toBe(true)

      await wrapper
        .findComponent(ComboboxDepartment)
        .vm.$emit('update:modelValue', department.id)
      expect(addButton.element.disabled).toBe(false)
      await addButton.trigger('click')
      expect(wrapper.findAll('.department-element')).toHaveLength(1)
    })
  })
})
