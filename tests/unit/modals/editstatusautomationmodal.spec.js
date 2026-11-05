import { enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import TaskStatusSetField from '@/components/widgets/TaskStatusSetField.vue'

import { mountWithI18n } from '../fixtures/i18n'

const assetTaskTypes = [
  { id: 'task-type-modeling', name: 'Modeling', for_entity: 'Asset' },
  { id: 'task-type-shading', name: 'Shading', for_entity: 'Asset' }
]
const shotTaskTypes = [
  { id: 'task-type-layout', name: 'Layout', for_entity: 'Shot' },
  { id: 'task-type-animation', name: 'Animation', for_entity: 'Shot' },
  { id: 'task-type-lighting', name: 'Lighting', for_entity: 'Shot' },
  {
    id: 'task-type-matte',
    name: 'Matte',
    for_entity: 'Shot',
    archived: true
  }
]
const taskStatuses = [
  { id: 'task-status-todo', short_name: 'todo' },
  { id: 'task-status-wip', short_name: 'wip' },
  { id: 'task-status-done', short_name: 'done' }
]

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'shot',
  in_conditions: {
    operator: 'and',
    conditions: [
      { task_type_id: 'task-type-layout', task_status_ids: ['task-status-done'] }
    ]
  },
  in_task_type_id: 'task-type-layout',
  in_task_status_id: 'task-status-done',
  out_field_type: 'status',
  out_task_type_id: 'task-type-animation',
  out_task_status_id: 'task-status-wip',
  out_only_if_task_status_ids: null,
  import_last_revision: true,
  archived: false
}

const multiConditionAutomation = {
  ...statusAutomation,
  id: 'automation-2',
  in_conditions: {
    operator: 'or',
    conditions: [
      { task_type_id: 'task-type-layout', task_status_ids: ['task-status-done'] },
      { task_type_id: 'task-type-matte', task_status_ids: ['task-status-done'] }
    ]
  },
  in_task_type_id: null,
  in_task_status_id: null,
  out_task_type_id: 'task-type-lighting'
}

const readyForAutomation = {
  id: 'automation-3',
  entity_type: 'asset',
  in_conditions: {
    operator: 'and',
    conditions: [
      {
        task_type_id: 'task-type-modeling',
        task_status_ids: ['task-status-done']
      }
    ]
  },
  out_field_type: 'ready_for',
  out_task_type_id: 'task-type-layout',
  out_task_status_id: null,
  import_last_revision: false,
  archived: false
}

// A focusable root, as the real combobox has.
const ComboboxTaskTypeStub = {
  name: 'ComboboxTaskType',
  props: ['label', 'modelValue', 'openTop', 'taskTypeList'],
  emits: ['update:model-value'],
  template: '<div class="task-type-stub" role="combobox" tabindex="0"></div>'
}

enableAutoUnmount(afterEach)

describe('EditStatusAutomationModal', () => {
  // Mounted closed and opened afterwards, as the automations page does.
  const mountModal = async (statusAutomationToEdit, options = {}) => {
    const store = createStore({
      getters: {
        assetTaskTypes: () => assetTaskTypes,
        shotTaskTypes: () => shotTaskTypes,
        sequenceTaskTypes: () => [],
        episodeTaskTypes: () => [],
        editTaskTypes: () => [],
        taskStatuses: () => taskStatuses
      }
    })
    const wrapper = mountWithI18n(EditStatusAutomationModal, {
      props: { active: false, statusAutomationToEdit: null },
      global: {
        plugins: [store],
        stubs: {
          Combobox: true,
          ComboboxBoolean: true,
          ComboboxStatus: true,
          ComboboxTaskType: ComboboxTaskTypeStub,
          TaskStatusSetField: true
        }
      },
      ...options
    })
    await wrapper.setProps({ active: true, statusAutomationToEdit })
    return wrapper
  }

  const dialog = wrapper => wrapper.find('[role="dialog"]')

  const findField = (wrapper, component, label) =>
    wrapper
      .findAllComponents(component)
      .find(field => field.props('label') === label)

  const conditionTaskTypes = wrapper =>
    wrapper
      .findAllComponents(ComboboxTaskTypeStub)
      .filter(field => field.props('label') === 'Task Type')

  const conditionStatuses = wrapper =>
    wrapper
      .findAllComponents(TaskStatusSetField)
      .filter(field => field.props('label') === 'Task Status')

  const conditionValues = wrapper =>
    conditionTaskTypes(wrapper).map((field, index) => [
      field.props('modelValue'),
      conditionStatuses(wrapper)[index].props('modelValue')
    ])

  const operatorField = wrapper =>
    wrapper
      .findAllComponents(Combobox)
      .find(field => field.classes('operator'))

  const confirm = async wrapper => {
    await wrapper.find('.modal-footer a.is-primary').trigger('click')
  }

  it('opens its form in the dialog of the base modal', async () => {
    const wrapper = await mountModal({})
    expect(dialog(wrapper).exists()).toBe(true)
    expect(dialog(wrapper).find('form').exists()).toBe(true)
    expect(dialog(wrapper).find('.modal-footer').exists()).toBe(true)
  })

  it('titles a new automation and an edited one', async () => {
    const newModal = await mountModal({})
    expect(dialog(newModal).attributes('aria-label')).toBe(
      'Add status automation'
    )
    expect(dialog(newModal).find('h2.title').text()).toBe(
      'Add status automation'
    )

    const editModal = await mountModal(statusAutomation)
    expect(dialog(editModal).attributes('aria-label')).toBe(
      'Edit a status automation'
    )
    expect(dialog(editModal).find('h2.title').text()).toBe(
      'Edit a status automation'
    )
  })

  it('sends the form on Confirm', async () => {
    const wrapper = await mountModal(statusAutomation)
    await confirm(wrapper)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      entityType: 'shot',
      operator: 'and',
      conditions: [
        { taskTypeId: 'task-type-layout', taskStatusIds: ['task-status-done'] }
      ],
      outFieldType: 'status',
      outTaskTypeId: 'task-type-animation',
      outTaskStatusId: 'task-status-wip',
      importLastRevision: 'true',
      archived: 'false'
    })
  })

  it('loads the conditions of an automation', async () => {
    const wrapper = await mountModal(multiConditionAutomation)
    expect(conditionValues(wrapper)).toEqual([
      ['task-type-layout', ['task-status-done']],
      ['task-type-matte', ['task-status-done']]
    ])
    expect(operatorField(wrapper).props('modelValue')).toBe('or')
    // An archived task type a condition holds stays listed in its row only.
    const [layoutRow, matteRow] = conditionTaskTypes(wrapper)
    expect(
      matteRow.props('taskTypeList').map(taskType => taskType.id)
    ).toContain('task-type-matte')
    expect(
      layoutRow.props('taskTypeList').map(taskType => taskType.id)
    ).not.toContain('task-type-matte')
  })

  // The page hands the same row back: the form showed the canceled edits.
  it('shows the stored automation again after a canceled edit', async () => {
    const wrapper = await mountModal(statusAutomation)
    const importLastRevision = () =>
      findField(wrapper, ComboboxBoolean, 'Import Last Revision')

    conditionStatuses(wrapper)[0].vm.$emit('update:model-value', [
      'task-status-todo'
    ])
    importLastRevision().vm.$emit('update:model-value', 'false')
    await nextTick()
    expect(conditionStatuses(wrapper)[0].props('modelValue')).toEqual([
      'task-status-todo'
    ])
    expect(importLastRevision().props('modelValue')).toBe('false')

    await wrapper.setProps({ active: false })
    await wrapper.setProps({ active: true })

    expect(conditionStatuses(wrapper)[0].props('modelValue')).toEqual([
      'task-status-done'
    ])
    expect(importLastRevision().props('modelValue')).toBe('true')
  })

  it('follows another automation handed over while open', async () => {
    const wrapper = await mountModal(statusAutomation)

    await wrapper.setProps({
      statusAutomationToEdit: {
        ...statusAutomation,
        id: 'automation-2',
        in_conditions: {
          operator: 'and',
          conditions: [
            {
              task_type_id: 'task-type-layout',
              task_status_ids: ['task-status-wip']
            }
          ]
        }
      }
    })

    expect(conditionStatuses(wrapper)[0].props('modelValue')).toEqual([
      'task-status-wip'
    ])
  })

  // The output field type watcher replaced the stored task type with the
  // second shot task type.
  it('keeps the output task type of a ready for automation', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.setProps({ statusAutomationToEdit: readyForAutomation })
    expect(
      findField(wrapper, ComboboxTaskTypeStub, 'Applied Task Type').props(
        'modelValue'
      )
    ).toBe('task-type-layout')

    await wrapper.setProps({ statusAutomationToEdit: statusAutomation })
    expect(
      findField(wrapper, ComboboxTaskTypeStub, 'Applied Task Type').props(
        'modelValue'
      )
    ).toBe('task-type-animation')
  })

  it('groups the trigger and the applied change in two blocks', async () => {
    const wrapper = await mountModal(statusAutomation)
    const blocks = wrapper.findAll('.automation-block')
    expect(blocks.map(block => block.find('.subtitle').text())).toEqual([
      'Trigger conditions',
      'The change that will be applied on trigger firing'
    ])
    expect(blocks[0].find('button.add-condition').exists()).toBe(true)

    const contains = (block, label) =>
      block.element.contains(findField(wrapper, ComboboxBoolean, label).element)
    expect(contains(blocks[1], 'Import Last Revision')).toBe(true)
    expect(contains(blocks[1], 'Archived')).toBe(false)
  })

  it('draws an arrow from the trigger to the applied change', async () => {
    const wrapper = await mountModal(statusAutomation)
    expect(
      wrapper
        .find('.automation-block + .blocks-arrow + .automation-block')
        .exists()
    ).toBe(true)
  })

  it('asks for the entity type in the trigger block', async () => {
    const wrapper = await mountModal(null)
    const field = findField(wrapper, Combobox, 'Entity Type')
    expect(
      wrapper.find('.automation-block').element.contains(field.element)
    ).toBe(true)
  })

  it('shows the entity type of an edited row with its label', async () => {
    const wrapper = await mountModal(statusAutomation)
    const field = wrapper.find('.automation-block .entity-type-field')
    expect(field.find('label').text()).toBe('Entity Type')
    expect(field.find('.entity-type-name').text()).toBe('Shot')
  })

  // The fields of the next conditions keep theirs for screen readers.
  it('shows the labels of the first condition only', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.find('button.add-condition').trigger('click')

    const rows = wrapper.findAll('.condition')
    expect(rows.map(row => row.classes('is-following'))).toEqual([false, true])
    expect(conditionTaskTypes(wrapper)).toHaveLength(2)
    expect(conditionStatuses(wrapper)).toHaveLength(2)
  })

  it('removes a condition with a minus, as the filter modal does', async () => {
    const wrapper = await mountModal(multiConditionAutomation)
    const buttons = wrapper
      .findAllComponents(ButtonSimple)
      .filter(button => button.classes('remove-condition'))
    expect(buttons.map(button => button.props('icon'))).toEqual([
      'minus',
      'minus'
    ])
  })

  it('shows the operator from the second condition on', async () => {
    const wrapper = await mountModal(statusAutomation)
    expect(operatorField(wrapper)).toBeUndefined()

    await wrapper.find('button.add-condition').trigger('click')
    expect(operatorField(wrapper).props('modelValue')).toBe('and')
    expect(wrapper.find('.condition-connector').text()).toBe('and')

    operatorField(wrapper).vm.$emit('update:model-value', 'or')
    await nextTick()
    expect(wrapper.find('.condition-connector').text()).toBe('or')

    await wrapper.findAll('button.remove-condition')[1].trigger('click')
    expect(operatorField(wrapper)).toBeUndefined()
    await confirm(wrapper)
    expect(wrapper.emitted('confirm')[0][0].operator).toBe('and')
  })

  it('adds a condition on an unused task type with the last statuses', async () => {
    const wrapper = await mountModal(statusAutomation)
    conditionStatuses(wrapper)[0].vm.$emit('update:model-value', [
      'task-status-done',
      'task-status-wip'
    ])
    await nextTick()

    await wrapper.find('button.add-condition').trigger('click')

    // Animation is the applied task type: Lighting comes next.
    expect(conditionValues(wrapper)[1]).toEqual([
      'task-type-lighting',
      ['task-status-done', 'task-status-wip']
    ])
    expect(
      wrapper.find('button.add-condition').attributes('disabled')
    ).toBeDefined()
  })

  // Archived values are never offered for a new choice.
  it('leaves the archived statuses out of an added condition', async () => {
    const withStatuses = taskStatusIds => ({
      ...statusAutomation,
      in_conditions: {
        operator: 'and',
        conditions: [
          { task_type_id: 'task-type-layout', task_status_ids: taskStatusIds }
        ]
      }
    })
    const wrapper = await mountModal(
      withStatuses(['task-status-done', 'task-status-archived'])
    )
    await wrapper.find('button.add-condition').trigger('click')
    expect(conditionValues(wrapper)[1]).toEqual([
      'task-type-lighting',
      ['task-status-done']
    ])

    await wrapper.setProps({
      statusAutomationToEdit: {
        ...withStatuses(['task-status-archived']),
        id: 'automation-4'
      }
    })
    await wrapper.find('button.add-condition').trigger('click')
    expect(conditionValues(wrapper)[1]).toEqual([
      'task-type-lighting',
      ['task-status-todo']
    ])
  })

  it('keeps at least one condition', async () => {
    const wrapper = await mountModal(statusAutomation)
    expect(
      wrapper.find('button.remove-condition').attributes('disabled')
    ).toBeDefined()

    await wrapper.find('button.add-condition').trigger('click')
    const removeButtons = wrapper.findAll('button.remove-condition')
    expect(removeButtons[0].attributes('disabled')).toBeUndefined()
    await removeButtons[0].trigger('click')

    expect(conditionValues(wrapper)).toEqual([
      ['task-type-lighting', ['task-status-done']]
    ])
  })

  it('starts the conditions over when the entity type changes', async () => {
    const wrapper = await mountModal({})
    expect(conditionValues(wrapper)).toEqual([
      ['task-type-modeling', ['task-status-todo']]
    ])

    findField(wrapper, Combobox, 'Entity Type').vm.$emit(
      'update:model-value',
      'shot'
    )
    await nextTick()

    expect(conditionValues(wrapper)).toEqual([
      ['task-type-layout', ['task-status-todo']]
    ])
    expect(
      findField(wrapper, ComboboxTaskTypeStub, 'Applied Task Type').props(
        'modelValue'
      )
    ).toBe('task-type-animation')
  })

  it('locks the entity type of an edited automation', async () => {
    const wrapper = await mountModal(statusAutomation)
    expect(findField(wrapper, Combobox, 'Entity Type')).toBeUndefined()
    expect(wrapper.find('.entity-type-name').text()).toBe('Shot')
  })

  it('refuses to send an invalid form', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.find('button.add-condition').trigger('click')
    conditionTaskTypes(wrapper)[1].vm.$emit(
      'update:model-value',
      'task-type-layout'
    )
    await nextTick()

    expect(wrapper.find('.condition-error').text()).toBe(
      'This task type is already used by another condition: add the statuses there.'
    )
    expect(wrapper.find('.condition-error').attributes('role')).toBe('alert')
    await confirm(wrapper)
    findField(wrapper, ComboboxBoolean, 'Import Last Revision').vm.$emit(
      'enter'
    )
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  // Zou checks a write only when it changes the trigger or the output, so
  // that a row saved before a rule existed stays editable.
  it('saves a row breaking a rule while its trigger and output stay', async () => {
    const wrapper = await mountModal({
      ...statusAutomation,
      out_task_type_id: 'task-type-layout'
    })
    expect(wrapper.find('.condition-error').exists()).toBe(false)

    findField(wrapper, ComboboxBoolean, 'Archived').vm.$emit(
      'update:model-value',
      'true'
    )
    await nextTick()
    await confirm(wrapper)
    expect(wrapper.emitted('confirm')).toHaveLength(1)

    conditionStatuses(wrapper)[0].vm.$emit('update:model-value', [
      'task-status-wip'
    ])
    await nextTick()
    expect(wrapper.find('.condition-error').text()).toBe(
      'The applied task type cannot be used in the conditions.'
    )
    await confirm(wrapper)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  // Zou keeps the stored trigger when a write leaves it out, even a
  // malformed one that the form reads as far as it goes.
  it('tells whether the edit changes the trigger', async () => {
    const wrapper = await mountModal({
      ...statusAutomation,
      in_conditions: { ...statusAutomation.in_conditions, operator: 'xor' }
    })
    findField(wrapper, ComboboxBoolean, 'Import Last Revision').vm.$emit(
      'update:model-value',
      'false'
    )
    await nextTick()
    await confirm(wrapper)
    conditionStatuses(wrapper)[0].vm.$emit('update:model-value', [
      'task-status-wip'
    ])
    await nextTick()
    await confirm(wrapper)
    expect(
      wrapper.emitted('confirm').map(([form]) => form.isTriggerChanged)
    ).toEqual([false, true])

    const created = await mountModal({})
    await confirm(created)
    expect(created.emitted('confirm')[0][0].isTriggerChanged).toBe(true)
  })

  // The save leaves out the trigger it keeps, so Zou checks nothing.
  it('archives a stored row without conditions', async () => {
    const wrapper = await mountModal({
      ...statusAutomation,
      in_conditions: { operator: 'and', conditions: 'broken' }
    })
    expect(conditionValues(wrapper)).toEqual([])

    findField(wrapper, ComboboxBoolean, 'Archived').vm.$emit(
      'update:model-value',
      'true'
    )
    await nextTick()
    await confirm(wrapper)

    const [form] = wrapper.emitted('confirm')[0]
    expect(form.archived).toBe('true')
    expect(form.isTriggerChanged).toBe(false)
  })

  // Zou asks for a condition only in a trigger the write sends.
  it('saves a row without conditions whose output changes', async () => {
    const wrapper = await mountModal({
      ...statusAutomation,
      in_conditions: null,
      in_task_type_id: null,
      in_task_status_id: null
    })
    findField(wrapper, ComboboxTaskTypeStub, 'Applied Task Type').vm.$emit(
      'update:model-value',
      'task-type-lighting'
    )
    await nextTick()
    await confirm(wrapper)

    const [form] = wrapper.emitted('confirm')[0]
    expect(form.outTaskTypeId).toBe('task-type-lighting')
    expect(form.isTriggerChanged).toBe(false)
  })

  it('opens a row with a malformed guard after another row', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.setProps({ active: false })
    await wrapper.setProps({
      active: true,
      statusAutomationToEdit: {
        ...multiConditionAutomation,
        out_only_if_task_status_ids: {}
      }
    })

    expect(conditionValues(wrapper)).toEqual([
      ['task-type-layout', ['task-status-done']],
      ['task-type-matte', ['task-status-done']]
    ])
    await confirm(wrapper)
    const [form] = wrapper.emitted('confirm')[0]
    expect(form.outTaskTypeId).toBe('task-type-lighting')
    expect(form.outOnlyIfTaskStatusIds).toEqual([])
    expect(form.isGuardChanged).toBe(false)
  })

  it('shows why Zou refuses the automation', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.setProps({ isError: true })
    expect(wrapper.find('.modal-footer .error').text()).toBe(
      'Could not save. Please try again.'
    )
    expect(wrapper.find('.modal-footer .error-details').exists()).toBe(false)

    await wrapper.setProps({
      errorDetails: 'Task type Layout appears in two conditions.'
    })
    expect(wrapper.find('.modal-footer .error').text()).toBe(
      'This automation cannot be saved as it is.'
    )
    expect(wrapper.find('.modal-footer .error-details').text()).toBe(
      '(Technical details: Task type Layout appears in two conditions.)'
    )
  })

  // Older clients wrote "Asset", which Zou reads as "asset".
  it('reads a capitalized entity type', async () => {
    const wrapper = await mountModal({
      ...readyForAutomation,
      entity_type: 'Asset'
    })
    expect(wrapper.find('.entity-type-name').text()).toBe('Asset')
    expect(
      conditionTaskTypes(wrapper)[0]
        .props('taskTypeList')
        .map(taskType => taskType.id)
    ).toEqual(['task-type-modeling', 'task-type-shading'])

    await confirm(wrapper)
    expect(wrapper.emitted('confirm')[0][0].entityType).toBe('asset')
  })

  // Only a direct API write stores a row naming an asset type, which Zou
  // reads as an asset one.
  it('offers the asset task types to a row naming an asset type', async () => {
    const wrapper = await mountModal({
      ...readyForAutomation,
      entity_type: 'props'
    })
    expect(wrapper.find('.entity-type-name').text()).toBe('props')
    expect(
      conditionTaskTypes(wrapper)[0]
        .props('taskTypeList')
        .map(taskType => taskType.id)
    ).toEqual(['task-type-modeling', 'task-type-shading'])
    expect(
      wrapper.find('button.add-condition').attributes('disabled')
    ).toBeUndefined()
  })

  // Kitsu posts every status change as a comment, even without a text.
  it('tells that editing or deleting a comment runs no automation', async () => {
    const wrapper = await mountModal(statusAutomation)
    expect(wrapper.findAll('.help').map(help => help.text())).toContain(
      'Automations run when a new comment changes a status, never when a comment is edited or deleted.'
    )
  })

  it('names the operator after the sentence it ends', async () => {
    const wrapper = await mountModal(multiConditionAutomation)
    expect(operatorField(wrapper).props('ariaLabel')).toBe('Trigger when')
  })

  it('never resets the output to a task type of the conditions', async () => {
    const wrapper = await mountModal({})
    const outFieldType = () => findField(wrapper, Combobox, 'Applied Change')
    conditionTaskTypes(wrapper)[0].vm.$emit(
      'update:model-value',
      'task-type-shading'
    )
    await nextTick()

    outFieldType().vm.$emit('update:model-value', 'ready_for')
    await nextTick()
    outFieldType().vm.$emit('update:model-value', 'status')
    await nextTick()

    expect(
      findField(wrapper, ComboboxTaskTypeStub, 'Applied Task Type').props(
        'modelValue'
      )
    ).toBe('task-type-modeling')
    expect(wrapper.find('.condition-error').exists()).toBe(false)
  })

  it('moves the focus to the added condition', async () => {
    const wrapper = await mountModal(statusAutomation, {
      attachTo: document.body
    })
    await wrapper.find('button.add-condition').trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(conditionTaskTypes(wrapper)[1].element)
  })

  it('moves the focus to the next remove button after a removal', async () => {
    const wrapper = await mountModal(multiConditionAutomation, {
      attachTo: document.body
    })
    await wrapper.find('button.add-condition').trigger('click')
    expect(conditionValues(wrapper)).toHaveLength(3)
    await wrapper.findAll('button.remove-condition')[0].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(
      wrapper.findAll('button.remove-condition')[0].element
    )
  })

  it('moves the focus to the add button after a removal', async () => {
    const wrapper = await mountModal(statusAutomation, {
      attachTo: document.body
    })
    await wrapper.find('button.add-condition').trigger('click')
    await wrapper.findAll('button.remove-condition')[1].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(
      wrapper.find('button.add-condition').element
    )
  })

  // Removing archived Matte frees no task type to add.
  it('moves the focus to the previous row past a disabled add button', async () => {
    const done = ['task-status-done']
    const wrapper = await mountModal(
      {
        ...multiConditionAutomation,
        in_conditions: {
          operator: 'and',
          conditions: [
            { task_type_id: 'task-type-layout', task_status_ids: done },
            { task_type_id: 'task-type-lighting', task_status_ids: done },
            { task_type_id: 'task-type-matte', task_status_ids: done }
          ]
        },
        out_task_type_id: 'task-type-animation'
      },
      { attachTo: document.body }
    )
    await wrapper.findAll('button.remove-condition')[2].trigger('click')
    await nextTick()

    expect(conditionValues(wrapper)).toHaveLength(2)
    expect(
      wrapper.find('button.add-condition').attributes('disabled')
    ).toBeDefined()
    expect(document.activeElement).toBe(conditionTaskTypes(wrapper)[1].element)
  })

  it('names each remove button after the task type of its row', async () => {
    const wrapper = await mountModal({
      ...multiConditionAutomation,
      in_conditions: {
        operator: 'or',
        conditions: [
          ...multiConditionAutomation.in_conditions.conditions,
          { task_type_id: 'task-type-gone', task_status_ids: [] }
        ]
      }
    })
    const buttons = wrapper.findAll('button.remove-condition')
    expect(buttons.map(button => button.attributes('aria-label'))).toEqual([
      'Remove the condition on Layout',
      'Remove the condition on Matte',
      'Remove condition'
    ])
    // A title other than the name would be read after it as a description.
    expect(buttons.map(button => button.attributes('title'))).toEqual(
      buttons.map(button => button.attributes('aria-label'))
    )
  })

  it('cancels from the Cancel button and the background', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.find('.modal-footer button.is-link').trigger('click')
    await wrapper.find('.modal-background').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('leaves the status field of a ready for output out', async () => {
    const wrapper = await mountModal(readyForAutomation)
    expect(
      findField(wrapper, ComboboxStatus, 'Applied Task Status')
    ).toBeUndefined()
  })

  it('tells where the imported revision comes from', async () => {
    const wrapper = await mountModal({
      ...statusAutomation,
      import_last_revision: true
    })
    expect(wrapper.findAll('.help').map(help => help.text())).toContain(
      'The revision comes from the task whose status change met the conditions.'
    )
  })

  // Zou imports a revision for a status change only.
  it('leaves the revision help of a ready for output out', async () => {
    const wrapper = await mountModal({
      ...readyForAutomation,
      import_last_revision: true
    })
    expect(wrapper.text()).not.toContain('The revision comes from')
  })

  it('sends the form on Enter', async () => {
    const wrapper = await mountModal(statusAutomation)

    findField(wrapper, ComboboxBoolean, 'Import Last Revision').vm.$emit(
      'enter'
    )

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  // The comboboxes send Enter past the footer, which waits for the save.
  it('ignores Enter during a save', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.setProps({ isLoading: true })

    findField(wrapper, ComboboxBoolean, 'Import Last Revision').vm.$emit(
      'enter'
    )

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  describe('target guard', () => {
    const guardField = wrapper =>
      findField(wrapper, TaskStatusSetField, 'Only when the applied task is in')

    it('edits the statuses the applied task has to be in', async () => {
      const wrapper = await mountModal({
        ...statusAutomation,
        out_only_if_task_status_ids: ['task-status-todo']
      })
      expect(guardField(wrapper).props('modelValue')).toEqual([
        'task-status-todo'
      ])

      guardField(wrapper).vm.$emit('update:model-value', [
        'task-status-todo',
        'task-status-wip'
      ])
      await nextTick()
      await confirm(wrapper)

      expect(wrapper.emitted('confirm')[0][0].outOnlyIfTaskStatusIds).toEqual(
        ['task-status-todo', 'task-status-wip']
      )
    })

    it('tells whether the edit changes the guard', async () => {
      const wrapper = await mountModal({
        ...statusAutomation,
        out_only_if_task_status_ids: ['task-status-todo', 'task-status-wip']
      })
      await confirm(wrapper)
      guardField(wrapper).vm.$emit('update:model-value', [
        'task-status-wip',
        'task-status-todo'
      ])
      await nextTick()
      await confirm(wrapper)
      guardField(wrapper).vm.$emit('update:model-value', ['task-status-todo'])
      await nextTick()
      await confirm(wrapper)
      expect(
        wrapper.emitted('confirm').map(([form]) => form.isGuardChanged)
      ).toEqual([false, false, true])

      const created = await mountModal({})
      await confirm(created)
      expect(created.emitted('confirm')[0][0].isGuardChanged).toBe(true)
    })

    it('has no guard for a ready for output', async () => {
      const wrapper = await mountModal(readyForAutomation)
      expect(guardField(wrapper)).toBeUndefined()
    })

    // Only a direct write stores one, and Zou would refuse a trigger or
    // output edit next to it: the save clears it.
    it('clears a guard stored on a ready for output', async () => {
      const wrapper = await mountModal({
        ...readyForAutomation,
        out_only_if_task_status_ids: ['task-status-todo']
      })
      await confirm(wrapper)
      expect(wrapper.emitted('confirm')[0][0].isGuardChanged).toBe(true)
    })

    // The save leaves the trigger out, so it needs no condition.
    it('clears it on a row without conditions too', async () => {
      const wrapper = await mountModal({
        ...readyForAutomation,
        in_conditions: null,
        out_only_if_task_status_ids: ['task-status-todo']
      })
      await confirm(wrapper)

      const [form] = wrapper.emitted('confirm')[0]
      expect(form.isTriggerChanged).toBe(false)
      expect(form.isGuardChanged).toBe(true)
    })

    it('empties the guard when the output changes', async () => {
      const wrapper = await mountModal({})
      guardField(wrapper).vm.$emit('update:model-value', ['task-status-todo'])
      await nextTick()

      findField(wrapper, Combobox, 'Applied Change').vm.$emit(
        'update:model-value',
        'ready_for'
      )
      await nextTick()
      findField(wrapper, Combobox, 'Applied Change').vm.$emit(
        'update:model-value',
        'status'
      )
      await nextTick()

      expect(guardField(wrapper).props('modelValue')).toEqual([])
    })
  })
})
