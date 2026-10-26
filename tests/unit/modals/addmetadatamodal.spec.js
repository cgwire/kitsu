import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const department = { id: 'd1', name: 'Animation', color: '#000' }

const store = createStore({
  getters: {
    currentProduction: () => ({ id: 'production-1', task_types: ['tt1'] }),
    departmentMap: () => new Map([[department.id, department]]),
    isCurrentUserProductionSupervisor: () => false,
    taskTypeMap: () =>
      new Map([
        ['tt1', { id: 'tt1', for_entity: 'Asset', department_id: department.id }]
      ]),
    user: () => ({ id: 'admin-1', role: 'admin', departments: [] })
  }
})

// The modal focuses its name field on opening.
const TextFieldStub = {
  name: 'TextField',
  props: {
    errored: { type: Boolean, default: false },
    errorText: { type: String, default: '' }
  },
  emits: ['enter', 'update:modelValue'],
  methods: { focus() {} },
  template: '<input />'
}

const openModal = async (props = {}) => {
  const wrapper = shallowMount(AddMetadataModal, {
    props,
    global: {
      plugins: [store, i18n],
      renderStubDefaultSlot: true,
      stubs: { TextField: TextFieldStub }
    }
  })
  await wrapper.setProps({ active: true })
  return wrapper
}

describe('modals/AddMetadataModal', () => {
  // A grayed button only stops the mouse: the keyboard used to add an empty
  // department.
  it('cannot add a department before one is picked', async () => {
    const wrapper = await openModal()
    const addButton = wrapper.find('.departments button.is-success')

    expect(addButton.element.disabled).toBe(true)

    await wrapper
      .findComponent(ComboboxDepartment)
      .vm.$emit('update:modelValue', department.id)
    expect(addButton.element.disabled).toBe(false)
    await addButton.trigger('click')
    expect(wrapper.findAll('.department-element')).toHaveLength(1)
  })

  // The name field confirms on Enter, past the grayed confirm button.
  it('does not confirm on Enter without a name', async () => {
    const wrapper = await openModal()

    wrapper.findComponent({ name: 'TextField' }).vm.$emit('enter')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('confirms on Enter once named', async () => {
    const wrapper = await openModal()
    const nameField = wrapper.findComponent({ name: 'TextField' })

    await nameField.vm.$emit('update:modelValue', 'Difficulty')
    nameField.vm.$emit('enter')

    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      name: 'Difficulty',
      data_type: 'string'
    })
  })

  // A Resolution shot column shared its values with the built-in field:
  // the list showed both columns on the same value.
  it('refuses the name of a built-in field', async () => {
    const wrapper = await openModal({ entityType: 'Shot' })
    const nameField = wrapper.findComponent({ name: 'TextField' })

    await nameField.vm.$emit('update:modelValue', 'Résolution')
    nameField.vm.$emit('enter')

    expect(nameField.props('errored')).toBe(true)
    expect(nameField.props('errorText')).toBe(
      'productions.metadata.built_in_name'
    )
    expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('keeps the name of a built-in field for a project column', async () => {
    const wrapper = await openModal({ entityType: 'Project' })
    const nameField = wrapper.findComponent({ name: 'TextField' })

    await nameField.vm.$emit('update:modelValue', 'Resolution')
    nameField.vm.$emit('enter')

    expect(nameField.props('errored')).toBe(false)
    expect(wrapper.emitted('confirm')[0][0].name).toBe('Resolution')
  })

  // A column created before Zou refused these names stays editable, under
  // its name, but cannot move onto another built-in field.
  it('lets a column on a built-in field keep its name', async () => {
    const wrapper = await openModal({
      entityType: 'Shot',
      descriptorToEdit: {
        id: 'descriptor-1',
        name: 'Resolution',
        field_name: 'resolution',
        data_type: 'string',
        for_client: false,
        choices: [],
        departments: []
      }
    })
    const nameField = wrapper.findComponent({ name: 'TextField' })

    nameField.vm.$emit('enter')
    expect(nameField.props('errored')).toBe(false)
    expect(wrapper.emitted('confirm')[0][0].name).toBe('Resolution')

    await nameField.vm.$emit('update:modelValue', 'FPS')
    nameField.vm.$emit('enter')
    expect(nameField.props('errored')).toBe(true)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })
})
