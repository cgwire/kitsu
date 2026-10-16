import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { isArmed, pressOn, release } from '../fixtures/sortable'

import TaskStatusSettings from '@/components/pages/production/TaskStatusSettings.vue'

const taskStatuses = [
  { id: 'todo', name: 'Todo' },
  { id: 'wip', name: 'WIP' }
]

describe('TaskStatusSettings', () => {
  // A held Remove button must not arm a drag: the list reloads after a
  // removal, and rows shifting before the release crashed vuedraggable
  // (see productionsettings.spec.js).
  it('drags a row from its grip but not from its Remove button', () => {
    const wrapper = shallowMount(TaskStatusSettings, {
      props: { taskStatuses, allTaskStatuses: taskStatuses },
      global: { stubs: { draggable: false } }
    })
    const [row] = wrapper.findAll('tr.task-status')

    pressOn(row.find('td.grab').element)
    expect(isArmed(row)).toBe(true)
    release()

    pressOn(row.find('button').element)
    expect(isArmed(row)).toBe(false)
    release()
  })
})
