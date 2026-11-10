import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import EditSearchFilterGroupModal from '@/components/modals/EditSearchFilterGroupModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import BooleanField from '@/components/widgets/BooleanField.vue'
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

const group = {
  id: 'group-1',
  name: 'Mine',
  color: '#ff3860',
  is_shared: false,
  department_id: null
}

const toEdit = filterGroup => ({ ...filterGroup, person_id: 'person-1' })

const mountModal = (props = {}) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      isCurrentUserManager: () => true,
      personMap: () => new Map([['person-1', { id: 'person-1' }]])
    }
  })
  return shallowMount(EditSearchFilterGroupModal, {
    props: { active: true, ...props },
    global: {
      plugins: [store, i18n],
      stubs: {
        BaseModal: { template: '<div><slot /></div>' },
        TextField: {
          methods: { focus: () => {} },
          props: ['errored', 'errorText', 'maxlength'],
          template: '<input />'
        }
      }
    }
  })
}

describe('EditSearchFilterGroupModal', () => {
  // The modal focuses its name field 100 ms after it opens.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('confirms on the Enter key of its name field', () => {
    const wrapper = mountModal({ groupToEdit: toEdit(group) })

    wrapper.findComponent(TextField).vm.$emit('enter', 'Mine')

    expect(wrapper.emitted('confirm')).toEqual([[group]])
  })

  test('confirms nothing while a save runs', () => {
    const wrapper = mountModal({
      groupToEdit: toEdit(group),
      isLoading: true
    })

    wrapper.findComponent(TextField).vm.$emit('enter', 'Mine')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  describe('on a name the list holds', () => {
    const groups = [group, { id: 'group-2', name: 'Taken' }]
    const nameField = wrapper => wrapper.findComponent(TextField)
    const footer = wrapper => wrapper.findComponent(ModalFooter)

    test('refuses it on a new group', async () => {
      const wrapper = mountModal({ groups })

      await nameField(wrapper).vm.$emit('update:modelValue', 'Taken')

      expect(nameField(wrapper).props('errored')).toBe(true)
      expect(nameField(wrapper).props('errorText')).toBe(
        'main.filter_name_taken'
      )
      expect(footer(wrapper).props('isDisabled')).toBe(true)

      nameField(wrapper).vm.$emit('enter', 'Taken')
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    test('refuses it on a rename', async () => {
      const wrapper = mountModal({ groups, groupToEdit: toEdit(group) })

      await nameField(wrapper).vm.$emit('update:modelValue', 'Taken')

      expect(nameField(wrapper).props('errored')).toBe(true)
    })

    test('leaves a name unchanged, so a duplicate stays editable', () => {
      const wrapper = mountModal({
        groups: [...groups, { id: 'group-3', name: 'Mine' }],
        groupToEdit: toEdit(group)
      })

      expect(nameField(wrapper).props('errored')).toBe(false)
      expect(footer(wrapper).props('isDisabled')).toBe(false)
    })
  })

  test('limits its name to what Zou takes', () => {
    const wrapper = mountModal()

    expect(wrapper.findComponent(TextField).props('maxlength')).toBe(200)
  })

  test('drops the department of a new group no longer shared', async () => {
    const wrapper = mountModal()
    const sharing = wrapper.findComponent(BooleanField)

    await wrapper.findComponent(TextField).vm.$emit('update:modelValue', 'Mine')
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

  test('drops the department of a saved group no longer shared', async () => {
    const wrapper = mountModal({
      groupToEdit: toEdit({
        ...group,
        is_shared: true,
        department_id: 'department-1'
      })
    })

    await wrapper
      .findComponent(BooleanField)
      .vm.$emit('update:modelValue', 'false')
    wrapper.findComponent(ModalFooter).vm.$emit('confirm')

    expect(wrapper.emitted('confirm')).toEqual([[group]])
  })
})
