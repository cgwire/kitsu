import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import { trackTaskSelection } from '../../fixtures/task-selection'

import ToCheckList from '@/components/lists/ToCheckList.vue'

// The tasks module of the selection fixture reaches the store index.
vi.mock('@/store', () => ({ default: {} }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  entity_type_name: 'Shot',
  full_entity_name: 'SQ010 / SH0010',
  assignees: [],
  estimation: 240
}

const mountList = ({
  getters = {},
  actions = {},
  selection,
  tasks = [task],
  attachTo
} = {}) =>
  shallowMount(ToCheckList, {
    attachTo,
    global: {
      plugins: [
        createStore({
          state: selection?.state,
          mutations: selection?.mutations,
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserManager: () => false,
            isCurrentUserSupervisor: () => false,
            nbSelectedTasks: () => 0,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            productionMap: () => new Map(),
            selectedTasks: () => new Map(),
            taskMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            ...selection?.getters,
            ...getters
          },
          actions: {
            addSelectedTask: () => {},
            clearSelectedTasks: () => {},
            removeSelectedTask: () => {},
            ...selection?.actions,
            ...actions
          }
        })
      ],
      stubs: { RouterLink: true }
    },
    props: { tasks }
  })

// What a browser reports once "1." is left in a number field: no number, so
// an empty value with a bad input
const leaveInvalidEntry = async input => {
  input.element.value = '1.'
  Object.defineProperty(input.element, 'validity', {
    configurable: true,
    value: { badInput: true }
  })
  await input.trigger('change')
}

describe('lists/ToCheckList', () => {
  describe('selection', () => {
    const tasks = ['task-1', 'task-2', 'task-3'].map(id => ({ ...task, id }))

    // A Ctrl+click left the row selected, and the edits reached it.
    test('unselects a row of a multi-selection on Ctrl+click', async () => {
      const updateTask = vi.fn()
      const selection = trackTaskSelection()
      const wrapper = mountList({
        selection,
        actions: { updateTask },
        getters: {
          isCurrentUserManager: () => true,
          taskMap: () => new Map(tasks.map(entry => [entry.id, entry]))
        },
        tasks
      })
      const cells = wrapper.findAll('tbody td.duration')
      await cells[0].trigger('click')
      await cells[1].trigger('click', { ctrlKey: true })
      await cells[2].trigger('click', { ctrlKey: true })

      await cells[1].trigger('click', { ctrlKey: true })
      await wrapper.find('tbody td.estimation input').setValue('1')

      expect(selection.selectedIds()).toEqual(['task-1', 'task-3'])
      expect(updateTask.mock.calls.map(([, { taskId }]) => taskId)).toEqual([
        'task-1',
        'task-3'
      ])

      wrapper.unmount()
    })

    test('selects a row of a multi-selection alone on a click', async () => {
      const selection = trackTaskSelection()
      const wrapper = mountList({ selection, tasks })
      const cells = wrapper.findAll('tbody td.duration')
      await cells[0].trigger('click')
      await cells[1].trigger('click', { ctrlKey: true })

      await cells[1].trigger('click')

      expect(selection.selectedIds()).toEqual(['task-2'])

      wrapper.unmount()
    })

    // A Shift+click back to a closer row shrank the highlight only: the
    // action panel still changed the rows left out.
    test('gives the store only the range of the last Shift+click', async () => {
      const selection = trackTaskSelection()
      const wrapper = mountList({ selection, tasks })
      const cells = wrapper.findAll('tbody td.duration')

      await cells[0].trigger('click')
      await cells[2].trigger('click', { shiftKey: true })
      await cells[1].trigger('click', { shiftKey: true })

      expect(wrapper.findAll('tbody tr.selected')).toHaveLength(2)
      expect(selection.selectedIds()).toEqual(['task-1', 'task-2'])

      wrapper.unmount()
    })

    // A new sort dropped the highlight but not the store selection: the
    // action panel changed rows the list no longer showed as selected.
    test('keeps the selected rows highlighted through a new sort', async () => {
      const selection = trackTaskSelection()
      const wrapper = mountList({ selection, tasks })
      const cells = wrapper.findAll('tbody td.duration')
      await cells[0].trigger('click')
      await cells[1].trigger('click', { ctrlKey: true })

      await wrapper.setProps({ tasks: [...tasks].reverse() })

      expect(
        wrapper.findAll('tbody tr').map(row => row.classes('selected'))
      ).toEqual([false, true, true])
      expect(selection.selectedIds()).toEqual(['task-1', 'task-2'])

      wrapper.unmount()
    })

    // Alt+Down came back to the only row and unselected it.
    test('keeps the only row selected on Alt+Down', async () => {
      const selection = trackTaskSelection()
      const wrapper = mountList({ selection })
      await wrapper.find('tbody td.duration').trigger('click')

      window.dispatchEvent(
        new KeyboardEvent('keydown', { altKey: true, keyCode: 40 })
      )
      await nextTick()

      expect(wrapper.findAll('tbody tr.selected')).toHaveLength(1)
      expect(selection.selectedIds()).toEqual(['task-1'])

      wrapper.unmount()
    })
  })

  // 2.05 hours make 122.99999999999999 minutes in floats.
  test('saves an estimation typed in hours in whole minutes', async () => {
    const updateTask = vi.fn()
    const wrapper = mountList({
      getters: {
        isCurrentUserManager: () => true,
        organisation: () => ({
          hours_by_day: 8,
          format_duration_in_hours: true
        }),
        taskMap: () => new Map([[task.id, task]])
      },
      actions: { updateTask }
    })
    await wrapper.find('tbody td.duration').trigger('click')
    const input = wrapper.find('tbody td.estimation input')

    // setValue fires the change event the list saves on
    await input.setValue('2.05')

    expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
      { taskId: 'task-1', data: { estimation: 123 } }
    ])

    wrapper.unmount()
  })

  describe('estimation field', () => {
    const mountEditableList = updateTask =>
      mountList({
        getters: {
          isCurrentUserManager: () => true,
          taskMap: () => new Map([[task.id, task]])
        },
        actions: { updateTask }
      })

    // It read as an emptied field and saved 0 for every selected task.
    test('ignores an entry that is no number', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')
      const input = wrapper.find('tbody td.estimation input')

      await leaveInvalidEntry(input)

      expect(updateTask).not.toHaveBeenCalled()
      // the half day stored comes back
      expect(input.element.value).toBe('0.5')

      wrapper.unmount()
    })

    // A valid number, it saved -480 minutes for every selected task.
    test('ignores a negative entry', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')
      const input = wrapper.find('tbody td.estimation input')

      await input.setValue('-1')

      expect(updateTask).not.toHaveBeenCalled()
      // the half day stored comes back
      expect(input.element.value).toBe('0.5')

      wrapper.unmount()
    })

    test('saves 0 for an emptied field', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.duration').trigger('click')

      await wrapper.find('tbody td.estimation input').setValue('')

      expect(updateTask.mock.calls.map(([, payload]) => payload)).toEqual([
        { taskId: 'task-1', data: { estimation: 0 } }
      ])

      wrapper.unmount()
    })

    // The field goes away with the selection of its row, and a browser fires
    // the change of a field removed while focused once the next row is
    // selected: the typed value was saved on that row.
    test('saves the value typed before Alt+Down on its own row', async () => {
      const next = { ...task, id: 'task-2' }
      const updateTask = vi.fn()
      const wrapper = mountList({
        getters: {
          isCurrentUserManager: () => true,
          taskMap: () =>
            new Map([
              [task.id, task],
              [next.id, next]
            ])
        },
        actions: { updateTask },
        tasks: [task, next],
        attachTo: document.body
      })
      await wrapper.find('tbody td.duration').trigger('click')
      const field = wrapper.find('tbody td.estimation input').element
      field.focus()
      field.value = '1'
      // jsdom fires no change on blur, nor on the removal of a focused field
      field.addEventListener('blur', () =>
        field.dispatchEvent(new Event('change'))
      )

      field.dispatchEvent(
        new KeyboardEvent('keydown', { altKey: true, keyCode: 40, bubbles: true })
      )
      const isFocusedAtRemoval = document.activeElement === field
      await nextTick()
      if (isFocusedAtRemoval) field.dispatchEvent(new Event('change'))

      expect(updateTask.mock.calls.map(([, { taskId }]) => taskId)).toEqual([
        'task-1'
      ])

      wrapper.unmount()
    })
  })

  describe('card layout', () => {
    test('opts the table into the mobile cards', () => {
      const wrapper = mountList()
      expect(wrapper.find('table').classes()).toContain('datatable--cards')
      wrapper.unmount()
    })

    test('heads the card with the production, then the entity', () => {
      const wrapper = mountList()
      expect(wrapper.find('tbody td.production').classes()).toContain(
        'card-head'
      )
      expect(wrapper.find('tbody td.name').classes()).toContain('card-head')
      wrapper.unmount()
    })

    test('labels the cells that carry a value', () => {
      const wrapper = mountList()
      const label = selector =>
        wrapper.find(`tbody ${selector}`).attributes('data-label')
      expect(label('.type')).toBe('tasks.fields.task_type')
      expect(label('td.estimation')).toBe('main.estimation')
      expect(label('td.duration')).toBe('tasks.fields.duration')
      expect(label('.status')).toBe('tasks.fields.task_status')
      wrapper.unmount()
    })

    test('leaves the cells without value unlabelled', () => {
      const wrapper = mountList()
      expect(
        wrapper.find('tbody td.assignees').attributes('data-label')
      ).toBeUndefined()
      expect(
        wrapper.find('tbody td.due-date').attributes('data-label')
      ).toBeUndefined()
      wrapper.unmount()
    })

    test('keeps the row read-only on a phone', async () => {
      const matchMedia = window.matchMedia
      window.matchMedia = query => ({ matches: query === '(max-width: 768px)' })
      const wrapper = mountList({
        getters: { isCurrentUserManager: () => true }
      })
      await wrapper.find('tbody td.duration').trigger('click')
      expect(wrapper.find('tbody td.estimation input').exists()).toBe(false)
      wrapper.unmount()
      window.matchMedia = matchMedia
    })

    test('keeps the row read-only on a landscape phone', async () => {
      const matchMedia = window.matchMedia
      window.matchMedia = query => ({
        matches: query === '(max-height: 500px) and (orientation: landscape)'
      })
      const wrapper = mountList({
        getters: { isCurrentUserManager: () => true }
      })
      await wrapper.find('tbody td.duration').trigger('click')
      expect(wrapper.find('tbody td.estimation input').exists()).toBe(false)
      wrapper.unmount()
      window.matchMedia = matchMedia
    })
  })
})
