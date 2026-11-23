import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import MoveCommentModal from '@/components/modals/MoveCommentModal.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'

const tasks = [
  { id: 'task-1', entity_id: 'shot-1', task_type_id: 'layout' },
  { id: 'task-2', entity_id: 'shot-1', task_type_id: 'animation' },
  { id: 'task-3', entity_id: 'shot-2', task_type_id: 'compositing' }
]
const taskMap = new Map(tasks.map(task => [task.id, task]))
const taskTypeMap = new Map(
  ['layout', 'animation', 'compositing'].map(id => [id, { id, name: id }])
)

const store = createStore({
  getters: { taskMap: () => taskMap, taskTypeMap: () => taskTypeMap }
})

describe('modals/MoveCommentModal', () => {
  const mountModal = props =>
    shallowMount(MoveCommentModal, {
      props,
      global: {
        plugins: [store],
        stubs: { BaseModal: { template: '<div><slot /></div>' } }
      }
    })

  // The task panel keeps the modal mounted and hands it each selected task:
  // reading every task of the production made each cell click slow.
  it('leaves the tasks alone while it is closed', async () => {
    const readTasks = vi.spyOn(taskMap, 'values')

    const wrapper = mountModal({ active: false, sourceTask: tasks[0] })
    await wrapper.setProps({ sourceTask: tasks[2] })

    expect(readTasks).not.toHaveBeenCalled()
    readTasks.mockRestore()
  })

  it('offers the other task types of the entity once open', async () => {
    const wrapper = mountModal({ active: false, sourceTask: tasks[0] })

    await wrapper.setProps({ active: true })

    const combobox = wrapper.findComponent(ComboboxTaskType)
    expect(combobox.props('taskTypeList')).toEqual([
      { id: 'animation', name: 'animation' }
    ])
    expect(combobox.props('modelValue')).toBe('animation')
  })
})
