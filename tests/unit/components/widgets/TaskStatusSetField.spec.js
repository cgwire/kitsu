import { enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import TaskStatusSetField from '@/components/widgets/TaskStatusSetField.vue'

import { mountWithI18n } from '../../fixtures/i18n'

const done = { id: 'task-status-done', name: 'Done', short_name: 'done' }
const na = { id: 'task-status-na', name: 'Not applicable', short_name: 'na' }
const wip = { id: 'task-status-wip', name: 'WIP', short_name: 'wip' }
// Archived: kept by the map, left out of the options.
const ok = { id: 'task-status-ok', name: 'OK', short_name: 'ok' }

enableAutoUnmount(afterEach)

describe('TaskStatusSetField', () => {
  const createFieldStore = () =>
    createStore({
      getters: {
        isDarkTheme: () => false,
        taskStatusMap: () =>
          new Map([done, na, wip, ok].map(status => [status.id, status]))
      }
    })

  const mountField = props =>
    mountWithI18n(TaskStatusSetField, {
      props: { taskStatusList: [done, na, wip], ...props },
      global: { plugins: [createFieldStore()], stubs: { ComboboxStatus: true } }
    })

  // Bound with v-model, as the modal does, in the document so that the
  // focus can be read. The picker stub is focusable, as the real one.
  const mountWithModel = taskStatusIds =>
    mountWithI18n(
      {
        components: { TaskStatusSetField },
        data: () => ({ taskStatusIds, taskStatusList: [done, na, wip] }),
        template:
          '<task-status-set-field :task-status-list="taskStatusList" v-model="taskStatusIds" />'
      },
      {
        attachTo: document.body,
        global: {
          plugins: [createFieldStore()],
          stubs: {
            ComboboxStatus: {
              name: 'ComboboxStatus',
              emits: ['update:model-value'],
              template: '<div role="combobox" tabindex="0"></div>'
            }
          }
        }
      }
    )

  const tags = wrapper =>
    wrapper.findAll('.task-status').map(tag => tag.text())

  it('shows the chosen statuses, an archived one included', () => {
    const wrapper = mountField({ modelValue: [done.id, ok.id] })
    expect(tags(wrapper)).toEqual(['done', 'ok'])
  })

  it('offers the statuses not chosen yet', () => {
    const wrapper = mountField({ modelValue: [done.id] })
    const combobox = wrapper.findComponent(ComboboxStatus)
    expect(combobox.props('addPlaceholder')).toBe(true)
    expect(combobox.props('taskStatusList')).toEqual([na, wip])
  })

  it('names its picker by its label', () => {
    const wrapper = mountField({ label: 'Task Status', modelValue: [] })
    const labelId = wrapper.find('label').attributes('id')
    expect(labelId).toBeTruthy()
    expect(wrapper.findComponent(ComboboxStatus).props('ariaLabelledby')).toBe(
      labelId
    )
    expect(
      mountField({ modelValue: [] })
        .findComponent(ComboboxStatus)
        .props('ariaLabelledby')
    ).toBe('')
  })

  it('adds a status', () => {
    const wrapper = mountField({ modelValue: [done.id] })
    wrapper.findComponent(ComboboxStatus).vm.$emit('update:model-value', na.id)
    expect(wrapper.emitted('update:model-value')).toEqual([
      [[done.id, na.id]]
    ])
  })

  it('removes a status', async () => {
    const wrapper = mountField({ modelValue: [done.id, na.id] })
    const removeButtons = wrapper.findAll('button.remove-status')
    expect(removeButtons[1].attributes('aria-label')).toBe(
      'Remove status Not applicable'
    )
    await removeButtons[0].trigger('click')
    expect(wrapper.emitted('update:model-value')).toEqual([[[na.id]]])
  })

  it('hides the picker once every status is chosen', () => {
    const wrapper = mountField({ modelValue: [done.id, na.id, wip.id] })
    expect(wrapper.findComponent(ComboboxStatus).exists()).toBe(false)
  })

  // The focused button leaves the page with its tag: keyboard users keep
  // their place on the next tag, else the previous one, else the picker.
  it('moves the focus to the nearest tag after a removal', async () => {
    const wrapper = mountWithModel([done.id, na.id, wip.id])
    const removeButtons = () => wrapper.findAll('button.remove-status')

    await removeButtons()[1].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(removeButtons()[1].element)

    await removeButtons()[1].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(removeButtons()[0].element)

    await removeButtons()[0].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(
      wrapper.find('[role="combobox"]').element
    )
  })

  it('moves the focus to the last tag when the picker goes away', async () => {
    const wrapper = mountWithModel([done.id, na.id])

    wrapper.findComponent({ name: 'ComboboxStatus' }).vm.$emit(
      'update:model-value',
      wip.id
    )
    await nextTick()
    await nextTick()

    expect(wrapper.find('[role="combobox"]').exists()).toBe(false)
    const removeButtons = wrapper.findAll('button.remove-status')
    expect(document.activeElement).toBe(removeButtons[2].element)
  })
})
