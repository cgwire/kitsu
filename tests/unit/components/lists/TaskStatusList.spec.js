import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  dropBefore,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../../fixtures/sortable'

import TaskStatusList from '@/components/lists/TaskStatusList.vue'

const workflow = ['Todo', 'Ready', 'WIP', 'Done'].map((name, index) => ({
  id: name.toLowerCase(),
  name,
  short_name: name.toLowerCase(),
  priority: index + 1
}))

// Mounts the real vuedraggable, so that SortableJS handles the rows. New
// entries play a reload of the task statuses.
const mountList = () => {
  const wrapper = shallowMount(TaskStatusList, {
    props: { entries: workflow },
    global: { mocks: { $t: key => key }, stubs: { draggable: false } }
  })
  const rows = () => wrapper.findAll('tr.task-status')
  const names = () => rows().map(row => row.find('td.name').text())
  const reload = names =>
    wrapper.setProps({
      entries: names.map(name => workflow.find(status => status.name === name))
    })
  return { names, reload, rows, wrapper }
}

describe('TaskStatusList', () => {
  // Regression: the answers to the saves of a reorder rebuild the list one
  // status at a time. During the next drag, vuedraggable then moved the row
  // found at the index the dragged one had when its drag started.
  it('emits the dropped order when a reload reorders the rows during the drag', async () => {
    const { names, reload, rows, wrapper } = mountList()
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.name'))
      await reload(['Ready', 'Todo', 'WIP', 'Done'])
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['Done', 'Todo', 'Ready', 'WIP'])
    expect(wrapper.emitted('update-priorities')).toEqual([
      [
        [
          { id: 'done', priority: 1 },
          { id: 'todo', priority: 2 },
          { id: 'ready', priority: 3 },
          { id: 'wip', priority: 4 }
        ]
      ]
    ])

    // The reload that follows the save.
    await reload(['Done', 'Ready', 'Todo', 'WIP'])
    expect(names()).toEqual(['Done', 'Ready', 'Todo', 'WIP'])
  })

  // The save of a status deleted by another user during the drag would
  // fail, and stop the saves of the next ones.
  it('leaves a status deleted during the drag out of the dropped order', async () => {
    const { reload, rows, wrapper } = mountList()
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.name'))
      await reload(['Todo', 'WIP', 'Done'])
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(wrapper.emitted('update-priorities')).toEqual([
      [
        [
          { id: 'done', priority: 1 },
          { id: 'todo', priority: 2 },
          { id: 'wip', priority: 3 }
        ]
      ]
    ])
  })

  it('shows a reload that came during a press once the row is released', async () => {
    const { names, reload, rows } = mountList()

    pressOn(rows()[1].find('td.name').element)
    await flushPromises()
    await reload(['Todo', 'WIP', 'Done'])
    expect(names()).toEqual(['Todo', 'Ready', 'WIP', 'Done'])

    release()
    await flushPromises()
    expect(names()).toEqual(['Todo', 'WIP', 'Done'])
  })
})
