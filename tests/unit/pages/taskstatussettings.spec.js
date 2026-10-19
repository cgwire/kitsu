import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  dropBefore,
  isArmed,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../fixtures/sortable'

import TaskStatusSettings from '@/components/pages/production/TaskStatusSettings.vue'

const taskStatuses = [
  { id: 'todo', name: 'Todo' },
  { id: 'wip', name: 'WIP' }
]

const workflow = ['Todo', 'Ready', 'WIP', 'Done'].map(name => ({
  id: name.toLowerCase(),
  name
}))

// Mounts the real vuedraggable, so that SortableJS handles the rows. New
// props play the reload of the template.
const mountWorkflow = () => {
  const wrapper = shallowMount(TaskStatusSettings, {
    props: { taskStatuses: workflow, allTaskStatuses: workflow },
    global: { stubs: { draggable: false } }
  })
  const rows = () => wrapper.findAll('tr.task-status')
  const names = () => rows().map(row => row.find('td.name-full').text())
  const reload = names =>
    wrapper.setProps({
      taskStatuses: names.map(name =>
        workflow.find(status => status.name === name)
      )
    })
  return { names, reload, rows, wrapper }
}

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

  // Regression: a removal reloads the template, and a reload that came
  // during a drag removed the row before which vuedraggable puts the
  // dragged one back: the drop threw. The removed row stays out of the
  // order: Zou links again a status a template reorder names.
  it('emits the dropped order when a reload removes a row during the drag', async () => {
    const { names, reload, rows, wrapper } = mountWorkflow()
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.grab'))
      await reload(['Todo', 'WIP', 'Done'])
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['Done', 'Todo', 'Ready', 'WIP'])
    expect(wrapper.emitted('reorder')).toEqual([
      [
        [
          { taskStatusId: 'done', priority: 1 },
          { taskStatusId: 'todo', priority: 2 },
          { taskStatusId: 'wip', priority: 3 }
        ]
      ]
    ])

    // The reload that follows the save.
    await reload(['Done', 'Todo', 'WIP'])
    expect(names()).toEqual(['Done', 'Todo', 'WIP'])
  })

  it('shows a reload that came during a press once the row is released', async () => {
    const { names, reload, rows } = mountWorkflow()

    pressOn(rows()[1].find('td.name-full').element)
    await flushPromises()
    await reload(['Todo', 'WIP', 'Done'])
    expect(names()).toEqual(['Todo', 'Ready', 'WIP', 'Done'])

    release()
    await flushPromises()
    expect(names()).toEqual(['Todo', 'WIP', 'Done'])
  })
})
