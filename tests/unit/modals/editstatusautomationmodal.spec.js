import { enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal.vue'
import ComboboxBoolean from '@/components/widgets/ComboboxBoolean.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'

import { mountWithI18n } from '../fixtures/i18n'

const assetTaskTypes = [
  { id: 'task-type-modeling', name: 'Modeling', for_entity: 'Asset' },
  { id: 'task-type-shading', name: 'Shading', for_entity: 'Asset' }
]
const shotTaskTypes = [
  { id: 'task-type-layout', name: 'Layout', for_entity: 'Shot' },
  { id: 'task-type-animation', name: 'Animation', for_entity: 'Shot' }
]
const taskStatuses = [
  { id: 'task-status-todo', short_name: 'todo' },
  { id: 'task-status-wip', short_name: 'wip' },
  { id: 'task-status-done', short_name: 'done' }
]

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'shot',
  in_task_type_id: 'task-type-layout',
  in_task_status_id: 'task-status-done',
  out_field_type: 'status',
  out_task_type_id: 'task-type-animation',
  out_task_status_id: 'task-status-wip',
  import_last_revision: true,
  archived: false
}

enableAutoUnmount(afterEach)

describe('EditStatusAutomationModal', () => {
  // Mounted closed and opened afterwards, as the automations page does.
  const mountModal = async statusAutomationToEdit => {
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
          ComboboxTaskType: true
        }
      }
    })
    await wrapper.setProps({ active: true, statusAutomationToEdit })
    return wrapper
  }

  const dialog = wrapper => wrapper.find('[role="dialog"]')

  const findField = (wrapper, component, label) =>
    wrapper
      .findAllComponents(component)
      .find(field => field.props('label') === label)

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
    await wrapper.find('.modal-footer a.is-primary').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('confirm')[0][0]).toMatchObject({
      entityType: 'shot',
      inTaskTypeId: 'task-type-layout',
      inTaskStatusId: 'task-status-done',
      outFieldType: 'status',
      outTaskTypeId: 'task-type-animation',
      outTaskStatusId: 'task-status-wip',
      importLastRevision: 'true',
      archived: 'false'
    })
  })

  // The page hands the same row back: the form showed the canceled edits.
  it('shows the stored automation again after a canceled edit', async () => {
    const wrapper = await mountModal(statusAutomation)
    const inTaskStatus = () => findField(wrapper, ComboboxStatus, 'Task Status')
    const importLastRevision = () =>
      findField(wrapper, ComboboxBoolean, 'Import Last Revision')

    inTaskStatus().vm.$emit('update:model-value', 'task-status-todo')
    importLastRevision().vm.$emit('update:model-value', 'false')
    await nextTick()
    expect(inTaskStatus().props('modelValue')).toBe('task-status-todo')
    expect(importLastRevision().props('modelValue')).toBe('false')

    await wrapper.setProps({ active: false })
    await wrapper.setProps({ active: true })

    expect(inTaskStatus().props('modelValue')).toBe('task-status-done')
    expect(importLastRevision().props('modelValue')).toBe('true')
  })

  it('follows another automation handed over while open', async () => {
    const wrapper = await mountModal(statusAutomation)

    await wrapper.setProps({
      statusAutomationToEdit: {
        ...statusAutomation,
        id: 'automation-2',
        in_task_status_id: 'task-status-wip'
      }
    })

    expect(
      findField(wrapper, ComboboxStatus, 'Task Status').props('modelValue')
    ).toBe('task-status-wip')
  })

  it('cancels from the Cancel button and the background', async () => {
    const wrapper = await mountModal(statusAutomation)
    await wrapper.find('.modal-footer button.is-link').trigger('click')
    await wrapper.find('.modal-background').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(2)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
