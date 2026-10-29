import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import { trackTaskSelection } from '../../fixtures/task-selection'

import TaskList from '@/components/lists/TaskList.vue'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

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
  estimation: 240,
  retake_count: 0
}

const mountList = (
  config,
  { getters = {}, actions = {}, props = {}, selection, attachTo } = {}
) =>
  shallowMount(TaskList, {
    attachTo,
    global: {
      config,
      plugins: [
        createStore({
          state: selection?.state,
          mutations: selection?.mutations,
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
            user: () => ({ id: 'user-1', departments: [] }),
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
      ]
    },
    props: { entityType: 'Asset', tasks: [task], ...props }
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

  // It unselected every row, where the other task lists keep that row.
  test('selects a row of a multi-selection alone on a click', async () => {
    const tasks = ['task-1', 'task-2'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection, props: { tasks } })
    const names = wrapper.findAll('tbody td.name')
    await names[0].trigger('click')
    await names[1].trigger('click', { ctrlKey: true })

    await names[1].trigger('click')

    expect(wrapper.findAll('tbody tr.selected')).toHaveLength(1)
    expect(selection.selectedIds()).toEqual(['task-2'])

    wrapper.unmount()
  })

  test('unselects its only selected row on a click', async () => {
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection })
    const name = wrapper.find('tbody td.name')
    await name.trigger('click')

    await name.trigger('click')

    expect(wrapper.findAll('tbody tr.selected')).toHaveLength(0)
    expect(selection.selectedIds()).toEqual([])

    wrapper.unmount()
  })

  // A Shift+click back to a closer row shrank the highlight only: the action
  // panel still changed the rows left out.
  test('gives the store only the range of the last Shift+click', async () => {
    const tasks = ['task-1', 'task-2', 'task-3'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection, props: { tasks } })
    const names = wrapper.findAll('tbody td.name')

    await names[0].trigger('click')
    await names[2].trigger('click', { shiftKey: true })
    await names[1].trigger('click', { shiftKey: true })

    expect(wrapper.findAll('tbody tr.selected')).toHaveLength(2)
    expect(selection.selectedIds()).toEqual(['task-1', 'task-2'])

    wrapper.unmount()
  })

  // A new sort dropped the highlight but not the store selection: the action
  // panel changed rows the list no longer showed as selected.
  test('keeps the selected rows highlighted through a new sort', async () => {
    const tasks = ['task-1', 'task-2', 'task-3'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection, props: { tasks } })
    const names = wrapper.findAll('tbody td.name')
    await names[0].trigger('click')
    await names[1].trigger('click', { ctrlKey: true })

    await wrapper.setProps({ tasks: [...tasks].reverse() })

    expect(
      wrapper.findAll('tbody tr.task-line').map(row => row.classes('selected'))
    ).toEqual([false, true, true])
    expect(selection.selectedIds()).toEqual(['task-1', 'task-2'])

    wrapper.unmount()
  })

  // A Shift+click extends the selection from the row clicked last.
  test('extends a Shift+click from the row clicked before a new sort', async () => {
    const tasks = ['task-1', 'task-2', 'task-3'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection, props: { tasks } })
    await wrapper.findAll('tbody td.name')[0].trigger('click')

    await wrapper.setProps({ tasks: [...tasks].reverse() })
    await wrapper
      .findAll('tbody td.name')[1]
      .trigger('click', { shiftKey: true })

    expect(selection.selectedIds()).toEqual(['task-2', 'task-1'])

    wrapper.unmount()
  })

  // Alt+Down came back to the only row and unselected it.
  test('keeps the only row selected on Alt+Down', async () => {
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection })
    await wrapper.find('tbody td.name').trigger('click')

    window.dispatchEvent(
      new KeyboardEvent('keydown', { altKey: true, keyCode: 40 })
    )
    await nextTick()

    expect(wrapper.findAll('tbody tr.selected')).toHaveLength(1)
    expect(selection.selectedIds()).toEqual(['task-1'])

    wrapper.unmount()
  })

  // 2.05 hours make 122.99999999999999 minutes in floats.
  test('saves an estimation typed in hours in whole minutes', async () => {
    const updateTask = vi.fn()
    const wrapper = mountList(undefined, {
      getters: {
        isCurrentUserProductionManager: () => true,
        organisation: () => ({
          hours_by_day: 8,
          format_duration_in_hours: true
        }),
        taskMap: () => new Map([[task.id, task]])
      },
      actions: { updateTask },
      // the task type page passes the dates of the production
      props: { disabledDates: {} }
    })
    await wrapper.find('tbody td.name').trigger('click')
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
      mountList(undefined, {
        getters: {
          isCurrentUserProductionManager: () => true,
          taskMap: () => new Map([[task.id, task]])
        },
        actions: { updateTask },
        props: { disabledDates: {} }
      })

    // It read as an emptied field and saved 0 for every selected task.
    test('ignores an entry that is no number', async () => {
      const updateTask = vi.fn()
      const wrapper = mountEditableList(updateTask)
      await wrapper.find('tbody td.name').trigger('click')
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
      await wrapper.find('tbody td.name').trigger('click')
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
      await wrapper.find('tbody td.name').trigger('click')

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
      const wrapper = mountList(undefined, {
        getters: {
          isCurrentUserProductionManager: () => true,
          taskMap: () =>
            new Map([
              [task.id, task],
              [next.id, next]
            ])
        },
        actions: { updateTask },
        props: { disabledDates: {}, tasks: [task, next] },
        attachTo: document.body
      })
      await wrapper.find('tbody td.name').trigger('click')
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

    // A task deleted elsewhere leaves the task map, not the selection.
    test('skips a selected task that left the task map', async () => {
      const deleted = { ...task, id: 'task-2' }
      const updateTask = vi.fn()
      const errorHandler = vi.fn()
      const wrapper = mountList(
        { errorHandler },
        {
          getters: {
            isCurrentUserProductionManager: () => true,
            taskMap: () => new Map([[task.id, task]])
          },
          actions: { updateTask },
          props: { disabledDates: {}, tasks: [task, deleted] }
        }
      )
      const names = wrapper.findAll('tbody td.name')
      await names[0].trigger('click')
      await names[1].trigger('click', { ctrlKey: true })

      await wrapper.find('tbody td.estimation input').setValue('1')

      expect(errorHandler).not.toHaveBeenCalled()
      expect(updateTask.mock.calls.map(([, { taskId }]) => taskId)).toEqual([
        'task-1'
      ])

      wrapper.unmount()
    })

    // Unselecting a row of a multi-selection only hid its field: the value
    // typed in another row was saved on it too.
    test('leaves a row unselected with Ctrl out of the edit', async () => {
      const other = { ...task, id: 'task-2' }
      const updateTask = vi.fn()
      const wrapper = mountList(undefined, {
        getters: {
          isCurrentUserProductionManager: () => true,
          taskMap: () =>
            new Map([
              [task.id, task],
              [other.id, other]
            ])
        },
        actions: { updateTask },
        props: { disabledDates: {}, tasks: [task, other] }
      })
      const names = wrapper.findAll('tbody td.name')
      await names[0].trigger('click')
      await names[1].trigger('click', { ctrlKey: true })
      await names[1].trigger('click', { ctrlKey: true })

      await wrapper.find('tbody td.estimation input').setValue('1')

      expect(updateTask.mock.calls.map(([, { taskId }]) => taskId)).toEqual([
        'task-1'
      ])

      wrapper.unmount()
    })
  })

  describe('export', () => {
    const entityMaps = {
      Asset: assetStore.cache.assetMap,
      Edit: editStore.cache.editMap,
      Episode: episodeStore.cache.episodeMap,
      Sequence: sequenceStore.cache.sequenceMap,
      Shot: shotStore.cache.shotMap
    }

    afterEach(() => {
      Object.values(entityMaps).forEach(map => map.clear())
    })

    const exportFirstColumns = (
      entityType,
      entity,
      { isTVShow = false } = {}
    ) => {
      entityMaps[entityType].set(entity.id, entity)
      const wrapper = mountList(undefined, {
        getters: { isTVShow: () => isTVShow },
        props: {
          entityType,
          tasks: [{ ...task, entity: { id: entity.id } }]
        }
      })
      const [headers, line] = wrapper.vm.getTableData()
      wrapper.unmount()
      return [headers.slice(0, 3), line.slice(0, 3)]
    }

    test('starts an asset line with its asset type', () => {
      const asset = { id: 'asset-1', name: 'Tree', asset_type_name: 'Props' }

      expect(exportFirstColumns('Asset', asset)).toEqual([
        [
          'tasks.fields.asset_type',
          'tasks.fields.entity_name',
          'tasks.fields.task_status'
        ],
        ['Props', 'Tree', undefined]
      ])
    })

    test('starts a shot line with its sequence', () => {
      const shot = { id: 'shot-1', name: 'SH010', sequence_name: 'SQ01' }

      expect(exportFirstColumns('Shot', shot)).toEqual([
        [
          'tasks.fields.sequence',
          'tasks.fields.entity_name',
          'tasks.fields.task_status'
        ],
        ['SQ01', 'SH010', undefined]
      ])
    })

    test('starts an episode line with its name', () => {
      const episode = { id: 'episode-1', name: 'E01' }

      expect(
        exportFirstColumns('Episode', episode, { isTVShow: true })
      ).toEqual([
        [
          'tasks.fields.entity_name',
          'tasks.fields.task_status',
          'tasks.fields.assignees'
        ],
        ['E01', undefined, '']
      ])
    })

    const sequenceAndEdit = [
      { entityType: 'Sequence', label: 'a sequence' },
      { entityType: 'Edit', label: 'an edit' }
    ]

    test.each(sequenceAndEdit)(
      'starts the line of $label task with its episode in a TV show',
      ({ entityType }) => {
        const entity = {
          id: 'entity-1',
          name: 'SQ01',
          episode_id: 'episode-1',
          episode_name: 'E01'
        }

        expect(
          exportFirstColumns(entityType, entity, { isTVShow: true })
        ).toEqual([
          [
            'shots.fields.episode',
            'tasks.fields.entity_name',
            'tasks.fields.task_status'
          ],
          ['E01', 'SQ01', undefined]
        ])
      }
    )

    test.each(sequenceAndEdit)(
      'starts the line of $label task with its name outside a TV show',
      ({ entityType }) => {
        const entity = { id: 'entity-1', name: 'SQ01', episode_name: '' }

        expect(exportFirstColumns(entityType, entity)).toEqual([
          [
            'tasks.fields.entity_name',
            'tasks.fields.task_status',
            'tasks.fields.assignees'
          ],
          ['SQ01', undefined, '']
        ])
      }
    )
  })
})
