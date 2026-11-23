import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

vi.mock('@/composables/modal', () => ({ useModal: () => {} }))

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const department = { id: 'd1', name: 'Animation', color: '#000' }

const loadStaleMetadataDescriptors = vi.fn()

const store = createStore({
  actions: { loadStaleMetadataDescriptors },
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
  // A failed read leaves the columns of the production stale.
  it('reads the stale columns of the production again on opening', async () => {
    loadStaleMetadataDescriptors.mockClear()

    const wrapper = await openModal()
    await wrapper.setProps({ active: false })

    expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(1)
    expect(loadStaleMetadataDescriptors).toHaveBeenCalledWith(
      expect.anything(),
      'production-1'
    )
  })

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

  // Zou spells € as "eur": "FPS (€)" makes the field name fps_eur, which no
  // built-in field uses.
  it('leaves to Zou the field name of a name it spells otherwise', async () => {
    const wrapper = await openModal({ entityType: 'Shot' })
    const nameField = wrapper.findComponent({ name: 'TextField' })

    await nameField.vm.$emit('update:modelValue', 'FPS (€)')
    nameField.vm.$emit('enter')

    expect(nameField.props('errored')).toBe(false)
    expect(wrapper.emitted('confirm')[0][0].name).toBe('FPS (€)')
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

  // Zou refuses a name another column of the entity type holds, as its name
  // or as its field name: the modal only showed a generic error once the
  // request failed, even for a column hidden from the list.
  describe('name of another column', () => {
    const column = (id, name, fieldName) => ({
      id,
      name,
      field_name: fieldName,
      entity_type: 'Shot',
      data_type: 'string',
      for_client: false,
      choices: [],
      departments: []
    })
    const camera = column('descriptor-camera', 'Camera', 'camera')
    const notes = column('descriptor-notes', 'Notes', 'notes')

    it.each(['Camera', 'câmera', 'CAMERA !'])('refuses %s', async name => {
      const wrapper = await openModal({
        entityType: 'Shot',
        descriptors: [camera]
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', name)
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(true)
      expect(nameField.props('errorText')).toBe(
        'productions.metadata.taken_name'
      )
      expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    it('takes the name of a column of another entity type', async () => {
      const wrapper = await openModal({
        entityType: 'Asset',
        descriptors: [camera]
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'Camera')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Camera')
    })

    // python-slugify spells € as "eur", so Zou keeps Budget (€) apart from
    // Budget: the field name decides only for a name of plain letters.
    const budgetEur = column('descriptor-budget-eur', 'Budget (€)', 'budget_eur')
    const budget = column('descriptor-budget', 'Budget', 'budget')

    it.each(['Budget', 'Budget (£)'])(
      'takes %s next to a column whose field name Zou spells otherwise',
      async name => {
        const wrapper = await openModal({
          entityType: 'Shot',
          descriptors: [budgetEur]
        })
        const nameField = wrapper.findComponent({ name: 'TextField' })

        await nameField.vm.$emit('update:modelValue', name)
        nameField.vm.$emit('enter')

        expect(nameField.props('errored')).toBe(false)
        expect(wrapper.emitted('confirm')[0][0].name).toBe(name)
      }
    )

    it.each([
      ['the field name', 'Budget EUR', [budgetEur]],
      ['the name', 'Budget (€)', [budgetEur]],
      ['the name of a column of other letters', 'Камера', [column('descriptor-kamera', 'Камера', 'kamera')]]
    ])('refuses %s of another column', async (_, name, descriptors) => {
      const wrapper = await openModal({ entityType: 'Shot', descriptors })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', name)
      nameField.vm.$emit('enter')

      expect(nameField.props('errorText')).toBe(
        'productions.metadata.taken_name'
      )
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })

    // python-slugify drops a fullwidth apostrophe, where it turns an
    // apostrophe into a separator.
    it('takes a name Zou spells otherwise next to a similar one', async () => {
      const wrapper = await openModal({
        entityType: 'Shot',
        descriptors: [column('descriptor-cut', "Director's cut", 'director_s_cut')]
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'Director\uff07s cut')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Director\uff07s cut')
    })

    it('takes a name of other symbols next to a column named in plain letters', async () => {
      const wrapper = await openModal({
        entityType: 'Shot',
        descriptors: [budget]
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'Budget (€)')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Budget (€)')
    })

    // Zou checks the name on every save, and keeps the field name of Budget
    // (€) apart from Budget.
    it('lets an edited column keep its name next to a similar one', async () => {
      const wrapper = await openModal({
        entityType: 'Shot',
        descriptors: [budget, budgetEur],
        descriptorToEdit: budgetEur
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Budget (€)')
    })

    it('lets an edited column keep its name, not take another', async () => {
      const wrapper = await openModal({
        entityType: 'Shot',
        descriptors: [camera, notes],
        descriptorToEdit: camera
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      nameField.vm.$emit('enter')
      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Camera')

      await nameField.vm.$emit('update:modelValue', 'Notes')
      nameField.vm.$emit('enter')
      expect(nameField.props('errored')).toBe(true)
      expect(nameField.props('errorText')).toBe(
        'productions.metadata.taken_name'
      )
      expect(wrapper.emitted('confirm')).toHaveLength(1)
    })

    // The modal cannot judge every name, and the Productions page passes no
    // columns: the page gives back the name Zou refused.
    it('says the name Zou refused is taken until it changes', async () => {
      const wrapper = await openModal({ entityType: 'Shot' })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'Budget €')
      await wrapper.setProps({ takenName: 'Budget €' })
      nameField.vm.$emit('enter')

      expect(nameField.props('errorText')).toBe(
        'productions.metadata.taken_name'
      )
      expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
      expect(wrapper.emitted('confirm')).toBeUndefined()

      await nameField.vm.$emit('update:modelValue', 'Budget $')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Budget $')
    })

    // Zou drops the emoji, and finds the key of the built-in FPS field.
    it('says a built-in field uses the name Zou refused as one until it changes', async () => {
      const wrapper = await openModal({ entityType: 'Shot' })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'FPS 🎬')
      await wrapper.setProps({ builtInName: 'FPS 🎬' })
      nameField.vm.$emit('enter')

      expect(nameField.props('errorText')).toBe(
        'productions.metadata.built_in_name'
      )
      expect(wrapper.findComponent(ModalFooter).props('isDisabled')).toBe(true)
      expect(wrapper.emitted('confirm')).toBeUndefined()

      await nameField.vm.$emit('update:modelValue', 'Shot FPS 🎬')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0].name).toBe('Shot FPS 🎬')
    })

    // A template lists the task columns of every task type, and Zou keeps
    // their names unique per task type.
    it('compares a task column with those of the task type picked', async () => {
      const notes = {
        ...column('descriptor-notes', 'Notes', 'notes'),
        entity_type: 'Task',
        task_type_id: 'tt1'
      }
      const wrapper = await openModal({
        entityType: 'Task',
        taskTypes: [{ id: 'tt1' }, { id: 'tt2' }],
        descriptors: [notes]
      })
      const nameField = wrapper.findComponent({ name: 'TextField' })

      await nameField.vm.$emit('update:modelValue', 'Notes')
      expect(nameField.props('errorText')).toBe(
        'productions.metadata.taken_name'
      )

      await wrapper
        .findComponent(ComboboxTaskType)
        .vm.$emit('update:modelValue', 'tt2')
      nameField.vm.$emit('enter')

      expect(nameField.props('errored')).toBe(false)
      expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
        name: 'Notes',
        task_type_id: 'tt2'
      })
    })
  })
})
