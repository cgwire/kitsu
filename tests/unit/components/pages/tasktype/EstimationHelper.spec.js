import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import EstimationHelper from '@/components/pages/tasktype/EstimationHelper.vue'

// Estimated at one working day
const task = {
  id: 'task-1',
  entity_id: 'asset-1',
  entity: { id: 'asset-1' },
  task_status_id: 'status-1',
  task_type_id: 'task-type-1',
  estimation: 8 * 60,
  assignees: []
}

// Assigned to Ann, Bob, Cid, and Dan, so listed in that order. A task
// reassigned to Eve moves after them.
const people = ['Ann', 'Bob', 'Cid', 'Dan'].map((name, index) => ({
  id: `person-${index + 1}`,
  name
}))
const eve = { id: 'person-5', name: 'Eve' }
const assignedTasks = people.map((person, index) => ({
  ...task,
  id: `task-${index + 1}`,
  assignees: [person.id]
}))

const mountHelper = (
  isDurationInHours,
  { tasks = [task], errorHandler } = {}
) => {
  const store = createStore({
    getters: {
      currentProduction: () => ({ id: 'production-1' }),
      dateFormat: () => 'YYYY-MM-DD',
      isCurrentUserProductionManager: () => true,
      isCurrentUserProductionSupervisor: () => false,
      organisation: () => ({
        hours_by_day: 8,
        format_duration_in_hours: isDurationInHours
      }),
      personMap: () =>
        new Map([...people, eve].map(person => [person.id, person])),
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ id: 'manager-1', departments: [] })
    }
  })
  return shallowMount(EstimationHelper, {
    props: { entityType: 'Asset', tasks },
    global: { config: { errorHandler }, plugins: [store] }
  })
}

// The rows of the tasks, not the ones of the people beside them.
const taskCells = wrapper => wrapper.findAll('.task-list td.estimation')
const selectedRows = wrapper =>
  wrapper
    .findAll('.task-list tr.task-line')
    .map(row => row.classes('selected'))

describe('EstimationHelper', () => {
  // The estimations are shown in the unit the organisation displays
  // durations in: a typed one is read in that unit too.
  it.each([
    ['hours', true, '8', '16'],
    ['days', false, '1', '2']
  ])(
    'saves the estimation typed in %s',
    async (_, isDurationInHours, shown, typed) => {
      const wrapper = mountHelper(isDurationInHours)
      const input = wrapper.find('td.estimation input')

      expect(input.element.value).toBe(shown)

      await input.setValue(typed)

      expect(wrapper.emitted('estimation-changed')).toEqual([
        [{ taskId: 'task-1', estimation: 16 * 60 }]
      ])
      wrapper.unmount()
    }
  )

  // A valid number, it saved -480 minutes for every selected task.
  it('ignores a negative entry', async () => {
    const wrapper = mountHelper(false)
    const input = wrapper.find('td.estimation input')

    await input.setValue('-1')

    expect(wrapper.emitted('estimation-changed')).toBeUndefined()
    // the day stored comes back
    expect(input.element.value).toBe('1')
    wrapper.unmount()
  })

  // The cell canceled the key, so the browser did not commit the typed
  // estimation, and selected its line again, drawn with the stored one.
  it('keeps the estimation typed when Enter is pressed in the field', async () => {
    const wrapper = mountHelper(false)
    await wrapper.find('td.estimation').trigger('click')
    const input = wrapper.find('td.estimation input')
    input.element.value = '2'
    let keydown
    wrapper.element.addEventListener('keydown', event => (keydown = event), {
      capture: true
    })

    await input.trigger('keydown', { key: 'Enter' })

    expect(keydown.defaultPrevented).toBe(false)
    expect(input.element.value).toBe('2')
    wrapper.unmount()
  })

  it('selects its line on Enter in the cell', async () => {
    const wrapper = mountHelper(false)

    await wrapper.find('td.estimation').trigger('keydown', { key: 'Enter' })

    expect(wrapper.find('tr.task-line').classes()).toContain('selected')
    wrapper.unmount()
  })

  // A search that hid Ann left the Shift+click start on the row number of
  // Bob, now the one of Cid.
  it('extends a Shift+click from its row after a search', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks })
    await taskCells(wrapper)[1].trigger('click')

    await wrapper.setProps({ tasks: assignedTasks.slice(1) })
    await taskCells(wrapper)[2].trigger('click', { shiftKey: true })

    expect(selectedRows(wrapper)).toEqual([true, true, true])
    wrapper.unmount()
  })

  // The Shift+click reached past the rows of the search and threw.
  it('starts a Shift+click from the first row once a search hides its row', async () => {
    const errorHandler = vi.fn()
    const wrapper = mountHelper(false, { tasks: assignedTasks, errorHandler })
    await taskCells(wrapper)[3].trigger('click')

    await wrapper.setProps({ tasks: assignedTasks.slice(0, 2) })
    await taskCells(wrapper)[1].trigger('click', { shiftKey: true })

    expect(errorHandler).not.toHaveBeenCalled()
    expect(selectedRows(wrapper)).toEqual([true, true])
    wrapper.unmount()
  })

  // The start comes back with its row once the search is cleared.
  it('extends a Shift+click from its row once a search shows it again', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks })
    await taskCells(wrapper)[1].trigger('click')
    await taskCells(wrapper)[3].trigger('click', { shiftKey: true })

    await wrapper.setProps({ tasks: assignedTasks.slice(0, 1) })
    await wrapper.setProps({ tasks: assignedTasks })
    await taskCells(wrapper)[2].trigger('click', { shiftKey: true })

    expect(selectedRows(wrapper)).toEqual([false, true, true, false])
    wrapper.unmount()
  })

  // No row clicked yet: whatever the searches before it, a Shift+click
  // starts from the first row.
  it('starts a first Shift+click from the first row after a search', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks })

    await wrapper.setProps({ tasks: assignedTasks.slice(1, 2) })
    await wrapper.setProps({ tasks: assignedTasks })
    await taskCells(wrapper)[3].trigger('click', { shiftKey: true })

    expect(selectedRows(wrapper)).toEqual([true, true, true, true])
    wrapper.unmount()
  })

  // A search that hid Ann left the arrows on the row number of Bob, now the
  // one of Cid.
  it('moves ArrowDown from its row after a search', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks })
    await taskCells(wrapper)[1].trigger('click')

    await wrapper.setProps({ tasks: assignedTasks.slice(1) })
    await taskCells(wrapper)[0]
      .find('input')
      .trigger('keydown', { key: 'ArrowDown' })

    expect(selectedRows(wrapper)).toEqual([false, true, false])
    wrapper.unmount()
  })

  // A search left the arrows past the end of its rows: ArrowUp threw.
  it('moves ArrowUp to the last row once a search hides its row', async () => {
    const errorHandler = vi.fn()
    const wrapper = mountHelper(false, { tasks: assignedTasks, errorHandler })
    await taskCells(wrapper)[3].trigger('click')

    await wrapper.setProps({ tasks: assignedTasks.slice(0, 2) })
    await taskCells(wrapper)[0]
      .find('input')
      .trigger('keydown', { key: 'ArrowUp' })

    expect(errorHandler).not.toHaveBeenCalled()
    expect(selectedRows(wrapper)).toEqual([false, true])
    wrapper.unmount()
  })

  // Bob's task, reassigned to Eve, moved to the last row: the Shift+click
  // started from its old row number, now the one of Cid.
  it('extends a Shift+click from its row after a new assignee', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks })
    await taskCells(wrapper)[1].trigger('click')

    await wrapper.setProps({
      tasks: assignedTasks.map(task =>
        task.id === 'task-2' ? { ...task, assignees: [eve.id] } : task
      )
    })
    await taskCells(wrapper)[0].trigger('click', { shiftKey: true })

    expect(selectedRows(wrapper)).toEqual([true, true, true, true])
    wrapper.unmount()
  })

  // The rows a search hides stay selected, out of sight: the estimation
  // typed in a row shown, reached with Tab, went to them too.
  it('saves a typed estimation in the selected rows a search leaves', async () => {
    const wrapper = mountHelper(false, { tasks: assignedTasks.slice(0, 3) })
    const cells = taskCells(wrapper)
    await cells[0].trigger('click')
    await cells[2].trigger('click', { shiftKey: true })

    await wrapper.setProps({ tasks: assignedTasks.slice(1, 3) })
    await taskCells(wrapper)[0].find('input').setValue('2')

    expect(wrapper.emitted('estimation-changed')).toEqual([
      [{ taskId: 'task-2', estimation: 16 * 60 }],
      [{ taskId: 'task-3', estimation: 16 * 60 }]
    ])
    wrapper.unmount()
  })
})
