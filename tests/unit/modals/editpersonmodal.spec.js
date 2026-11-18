import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// lib/lang pulls in the root store: stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import EditPersonModal from '@/components/modals/EditPersonModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
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

const mountModal = (personToEdit, props = {}) =>
  shallowMount(EditPersonModal, {
    global: { plugins: [store, i18n], renderStubDefaultSlot: true },
    props: { active: true, personToEdit, ...props }
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

    // Zou asks for the current password to change one's own email: the
    // profile page does that.
    it('locks the email of the person logged in', () => {
      const own = mountModal({ id: 'admin-1', email: 'ada@studio.com' })
      const other = mountModal({ id: 'p1', email: 'jdoe@studio.com' })

      expect(emailField(own).props('disabled')).toBe(true)
      expect(emailField(own).props('description')).toBe(
        'people.own_email_hint'
      )
      expect(emailField(other).props('disabled')).toBe(false)
      expect(emailField(other).props('description')).toBe('')
    })
  })

  describe('invitation link', () => {
    it('says why the link is refused', () => {
      const wrapper = mountModal(
        { id: 'p1', first_name: 'Ada', email: 'ada@studio.com', active: true },
        { isInviteLinkRefused: true }
      )

      expect(wrapper.text()).toContain('people.invite_link_refused')
    })
  })

  // An inactive account cannot log in, and an LDAP account logs in with the
  // password of its directory: an invitation would lead them nowhere.
  describe('invitation buttons', () => {
    const person = { id: 'p1', first_name: 'Ada', email: 'ada@studio.com' }
    const invitationButtons = wrapper =>
      wrapper
        .findAllComponents(ButtonSimple)
        .filter(button => ['send', 'link'].includes(button.props('icon')))
    const activeField = wrapper =>
      wrapper
        .findAllComponents(Combobox)
        .find(combobox => combobox.props('label') === 'people.fields.active')

    it('offers them for an active account', () => {
      const wrapper = mountModal({ ...person, active: true })
      expect(invitationButtons(wrapper)).toHaveLength(2)
    })

    it.each([
      ['an inactive account', { active: false }],
      ['an LDAP account', { active: true, is_generated_from_ldap: true }]
    ])('hides them for %s', (_, fields) => {
      const wrapper = mountModal({ ...person, ...fields })
      expect(invitationButtons(wrapper)).toHaveLength(0)
    })

    // The invitation buttons do not save the form: an account set active
    // there stays inactive for Zou until the form is saved.
    it('keeps them hidden until the activation is saved', async () => {
      const wrapper = mountModal({ ...person, active: false })

      await activeField(wrapper).vm.$emit('update:modelValue', 'true')

      expect(invitationButtons(wrapper)).toHaveLength(0)
    })

    it('creates an inactive user without an invitation', async () => {
      const wrapper = mountModal({ role: 'user' })
      const createAndInvite = () =>
        wrapper
          .findAll('button')
          .filter(button => button.text() === 'people.create_invite')
      expect(createAndInvite()).toHaveLength(1)

      await activeField(wrapper).vm.$emit('update:modelValue', 'false')

      expect(createAndInvite()).toHaveLength(0)
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
