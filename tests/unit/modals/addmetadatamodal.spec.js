import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
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
  emits: ['enter', 'update:modelValue'],
  methods: { focus() {} },
  template: '<input />'
}

const openModal = async () => {
  const wrapper = shallowMount(AddMetadataModal, {
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
})
