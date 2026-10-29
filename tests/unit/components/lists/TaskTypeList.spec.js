import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { describe, expect, it } from 'vitest'

import {
  dropBefore,
  pressOn,
  recordListenerErrors,
  release,
  startDrag
} from '../../fixtures/sortable'

import TaskTypeList from '@/components/lists/TaskTypeList.vue'

const workflow = ['Layout', 'Animation', 'Lighting', 'Compositing'].map(
  (name, index) => ({
    id: name.toLowerCase(),
    name,
    short_name: name.slice(0, 3).toUpperCase(),
    for_entity: 'Shot',
    priority: index + 1
  })
)

// Mounts the real vuedraggable, so that SortableJS handles the rows. New
// entries play a reload of the task types.
const mountList = () => {
  const store = createStore({ getters: { getDepartment: () => () => null } })
  const wrapper = shallowMount(TaskTypeList, {
    props: { entries: workflow },
    global: {
      plugins: [store],
      mocks: { $t: key => key },
      stubs: { draggable: false }
    }
  })
  const rows = () => wrapper.findAll('tr.tasktype-item')
  const names = () => rows().map(row => row.find('td.short_name').text())
  const reload = names =>
    wrapper.setProps({
      entries: names.map(name =>
        workflow.find(taskType => taskType.short_name === name)
      )
    })
  return { names, reload, rows, wrapper }
}

describe('TaskTypeList', () => {
  // Regression: a task type deleted by another user during a drag rebuilt
  // the list, and the drop threw: the row before which vuedraggable puts
  // the dragged one back was gone. The deleted row stays out of the order,
  // or the page would put it back in the store.
  it('emits the dropped order when a reload removes a row during the drag', async () => {
    const { names, reload, rows, wrapper } = mountList()
    const [first, , , last] = rows().map(row => row.element)

    const errors = await recordListenerErrors(async () => {
      await startDrag(last.querySelector('td.short_name'))
      await reload(['LAY', 'LIG', 'COM'])
      dropBefore(last, first)
      await flushPromises()
    })

    expect(errors).toEqual([])
    expect(names()).toEqual(['COM', 'LAY', 'ANI', 'LIG'])
    expect(wrapper.emitted('update-priorities')).toEqual([
      [
        [
          { id: 'compositing', name: 'Compositing', priority: '1' },
          { id: 'layout', name: 'Layout', priority: '2' },
          { id: 'lighting', name: 'Lighting', priority: '3' }
        ]
      ]
    ])

    // The reload that follows the save.
    await reload(['COM', 'LAY', 'LIG'])
    expect(names()).toEqual(['COM', 'LAY', 'LIG'])
  })

  it('shows a reload that came during a press once the row is released', async () => {
    const { names, reload, rows } = mountList()

    pressOn(rows()[1].find('td.short_name').element)
    await flushPromises()
    await reload(['LAY', 'LIG', 'COM'])
    expect(names()).toEqual(['LAY', 'ANI', 'LIG', 'COM'])

    release()
    await flushPromises()
    expect(names()).toEqual(['LAY', 'LIG', 'COM'])
  })
})
