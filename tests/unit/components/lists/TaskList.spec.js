import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import TaskList from '@/components/lists/TaskList.vue'

vi.mock('@/store', () => ({ default: {} }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRouter: () => ({ resolve: () => ({ href: '/tasks/task-1' }) })
}))

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  task_status_id: 'task-status-1',
  entity: { id: 'asset-1' },
  assignees: [],
  difficulty: 3,
  retake_count: 0
}

const mountList = config =>
  shallowMount(TaskList, {
    global: {
      config,
      plugins: [
        createStore({
          getters: {
            currentEpisode: () => null,
            currentProduction: () => ({ id: 'production-1' }),
            dateFormat: () => 'YYYY-MM-DD',
            isCurrentUserProductionManager: () => false,
            isCurrentUserProductionSupervisor: () => false,
            isPaperProduction: () => false,
            isTVShow: () => false,
            nbSelectedTasks: () => 0,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            selectedTasks: () => new Map(),
            taskMap: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            user: () => ({ id: 'user-1', departments: [] })
          },
          actions: {
            addSelectedTask: () => {},
            clearSelectedTasks: () => {},
            removeSelectedTask: () => {}
          }
        })
      ]
    },
    props: { entityType: 'Asset', tasks: [task] }
  })

// The click target when the pointer is on the drawn line of an icon
const appendIconStroke = cell => {
  const svgNamespace = 'http://www.w3.org/2000/svg'
  const icon = document.createElementNS(svgNamespace, 'svg')
  const stroke = document.createElementNS(svgNamespace, 'path')
  icon.appendChild(stroke)
  cell.appendChild(icon)
  return stroke
}

describe('lists/TaskList', () => {
  test('selects a task when its row is clicked', async () => {
    const wrapper = mountList()

    await wrapper.find('tbody td.name').trigger('click')

    expect(wrapper.emitted('task-selected')).toHaveLength(1)

    wrapper.unmount()
  })

  test('does not select a task from a click on an icon', () => {
    const errorHandler = vi.fn()
    const wrapper = mountList({ errorHandler })
    const stroke = appendIconStroke(wrapper.find('tbody td.name').element)

    stroke.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(errorHandler).not.toHaveBeenCalled()
    expect(wrapper.emitted('task-selected')).toBeUndefined()

    wrapper.unmount()
  })
})
