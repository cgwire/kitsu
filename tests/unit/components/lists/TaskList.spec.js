import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import { openModalHost } from '../../fixtures/modal-host'
import {
  addTextField,
  onPlatform,
  pressAltArrow
} from '../../fixtures/platform'
import { buildRefusal } from '../../fixtures/refusal'
import { trackTaskSelection } from '../../fixtures/task-selection'

import MetadataInput from '@/components/cells/MetadataInput.vue'
import TaskList from '@/components/lists/TaskList.vue'
import DateField from '@/components/widgets/DateField.vue'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

vi.mock('@/store', () => ({ default: {} }))

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  // The parameters of a message show in its text.
  useI18n: () => ({
    t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key)
  })
}))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => ({ path: '/', query: {} }),
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

// The status link of a row only serves middle click and the context menu:
// every click goes on to the row.
const appendStatusLink = cell => {
  const link = document.createElement('a')
  link.className = 'task-link'
  link.href = '/tasks/task-1'
  link.addEventListener('click', event => event.preventDefault())
  cell.appendChild(link)
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

  test('selects a task when its status link is clicked', async () => {
    const wrapper = mountList()
    appendStatusLink(wrapper.find('tbody .status').element)

    await wrapper.find('tbody a.task-link').trigger('click')

    expect(wrapper.emitted('task-selected')).toHaveLength(1)

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

  // The cards of a contact sheet grouped by sequence were numbered per
  // group: a Shift+click in the second group selected cards of the first.
  test('extends a Shift+click between the cards of a later group', async () => {
    const shotMap = shotStore.cache.shotMap
    onTestFinished(() => shotMap.clear())
    const tasks = [1, 2, 3, 4].map(number => {
      const sequenceNumber = number < 3 ? 1 : 2
      shotMap.set(`shot-${number}`, {
        id: `shot-${number}`,
        name: `SH0${number}0`,
        sequence_id: `sequence-${sequenceNumber}`
      })
      return {
        ...task,
        id: `task-${number}`,
        entity: { id: `shot-${number}` },
        sequence_name: `SQ0${sequenceNumber}`
      }
    })
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, {
      selection,
      props: {
        entityType: 'Shot',
        isContactSheet: true,
        isGrouped: true,
        tasks
      }
    })
    onTestFinished(() => wrapper.unmount())
    const cards = wrapper.findAll('.task-card')

    await cards[2].trigger('click')
    await cards[3].trigger('click', { shiftKey: true })

    expect(selection.selectedIds()).toEqual(['task-3', 'task-4'])
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

  // In the page, the keys of a field of the list reach the window.
  const mountOnFirstTask = async () => {
    const tasks = ['task-1', 'task-2'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, {
      selection,
      props: { tasks },
      attachTo: document.body
    })
    onTestFinished(() => wrapper.unmount())
    await wrapper.find('tbody td.name').trigger('click')
    return { wrapper, selection }
  }

  // macOS moves the caret of a field by word on Option and an arrow.
  test('leaves Option+Down to a field out of the list on macOS', async () => {
    onPlatform('MacIntel')
    const { wrapper, selection } = await mountOnFirstTask()

    const event = pressAltArrow(addTextField('input', 'Shot'), 40)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(selection.selectedIds()).toEqual(['task-1'])

    // A field of the list keeps walking it.
    const rowField = document.createElement('input')
    rowField.value = 'Shot'
    wrapper.find('tbody').element.append(rowField)
    pressAltArrow(rowField, 40)
    await nextTick()

    expect(selection.selectedIds()).toEqual(['task-2'])
  })

  // An empty field has no caret to move.
  test('walks from an empty field out of the list on macOS', async () => {
    onPlatform('MacIntel')
    const { selection } = await mountOnFirstTask()

    pressAltArrow(addTextField('input', ''), 40)
    await nextTick()

    expect(selection.selectedIds()).toEqual(['task-2'])
  })

  // Confirming in a modal sent the change to the row Alt+Down had reached.
  test('keeps the selection on Alt+Down behind a modal', async () => {
    const tasks = ['task-1', 'task-2'].map(id => ({ ...task, id }))
    const selection = trackTaskSelection()
    const wrapper = mountList(undefined, { selection, props: { tasks } })
    await wrapper.find('tbody td.name').trigger('click')
    const closeModal = await openModalHost()

    const event = new KeyboardEvent('keydown', {
      altKey: true,
      cancelable: true,
      keyCode: 40
    })
    window.dispatchEvent(event)
    await nextTick()

    expect(selection.selectedIds()).toEqual(['task-1'])
    expect(event.defaultPrevented).toBe(true)

    closeModal()
    window.dispatchEvent(
      new KeyboardEvent('keydown', { altKey: true, keyCode: 40 })
    )
    await nextTick()

    expect(selection.selectedIds()).toEqual(['task-2'])

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

  // Status changes set the real dates: the expert mode of the instance lets
  // the studio managers set them too.
  describe('real dates', () => {
    const datedTask = {
      ...task,
      real_start_date: '2026-11-02T09:30:00',
      end_date: '2026-11-10T17:00:00',
      done_date: null
    }
    const realDateCells = ['real-start-date', 'real-end-date', 'done-date']

    const mountDatedList = ({
      canEditRealDates = true,
      tasks = [datedTask],
      updateTask = vi.fn()
    } = {}) =>
      mountList(undefined, {
        getters: {
          canEditRealDates: () => canEditRealDates,
          isCurrentUserProductionManager: () => true,
          taskMap: () => new Map(tasks.map(entry => [entry.id, entry]))
        },
        actions: { updateTask },
        props: { disabledDates: {}, tasks }
      })
    const dateField = (wrapper, cell) =>
      wrapper.find(`tbody td.${cell}`).findComponent(DateField)
    const payloads = updateTask =>
      updateTask.mock.calls.map(([, payload]) => payload)

    test('shows them as text on a row not selected', () => {
      const wrapper = mountDatedList()

      realDateCells.forEach(cell => {
        expect(dateField(wrapper, cell).exists()).toBe(false)
      })
      expect(wrapper.find('tbody td.real-start-date').text()).toBe('2026-11-02')
      expect(wrapper.find('tbody td.real-end-date').text()).toBe('2026-11-10')
      expect(wrapper.find('tbody td.done-date').text()).toBe('')

      wrapper.unmount()
    })

    test('gives a date field per real date of a selected row', async () => {
      const wrapper = mountDatedList()
      await wrapper.find('tbody td.name').trigger('click')

      expect(dateField(wrapper, 'real-start-date').props('modelValue')).toEqual(
        new Date(2026, 10, 2)
      )
      expect(dateField(wrapper, 'real-end-date').props('modelValue')).toEqual(
        new Date(2026, 10, 10)
      )
      expect(dateField(wrapper, 'done-date').props('modelValue')).toBe(null)

      wrapper.unmount()
    })

    // As the import of Zou: a mistyped year would spread the task over
    // decades of quota days.
    test('offers the days from 2000 to 2100 only', async () => {
      const wrapper = mountDatedList()
      await wrapper.find('tbody td.name').trigger('click')

      realDateCells.forEach(cell => {
        expect(dateField(wrapper, cell).props('minDate')).toEqual(
          new Date(2000, 0, 1)
        )
        expect(dateField(wrapper, cell).props('maxDate')).toEqual(
          new Date(2100, 11, 31)
        )
      })

      wrapper.unmount()
    })

    test('keeps them as text for a user who cannot edit them', async () => {
      const wrapper = mountDatedList({ canEditRealDates: false })
      await wrapper.find('tbody td.name').trigger('click')

      realDateCells.forEach(cell => {
        expect(dateField(wrapper, cell).exists()).toBe(false)
      })
      expect(wrapper.find('tbody td.real-start-date').text()).toBe('2026-11-02')
      // the planned dates stay editable
      expect(dateField(wrapper, 'start-date').exists()).toBe(true)

      wrapper.unmount()
    })

    // Zou counts a real date on the calendar day of each user: 10:00 UTC is
    // the same day from UTC-10 to UTC+13, midnight the day before west of
    // UTC.
    test('saves each real date at 10:00 UTC on every selected task', async () => {
      const other = {
        ...datedTask,
        id: 'task-2',
        entity: { id: 'asset-2' },
        real_start_date: null
      }
      const updateTask = vi.fn()
      const wrapper = mountDatedList({ tasks: [datedTask, other], updateTask })
      const names = wrapper.findAll('tbody td.name')
      await names[0].trigger('click')
      await names[1].trigger('click', { ctrlKey: true })

      dateField(wrapper, 'real-start-date').vm.$emit(
        'update:model-value',
        new Date(2026, 10, 3)
      )
      dateField(wrapper, 'real-end-date').vm.$emit('update:model-value', null)
      dateField(wrapper, 'done-date').vm.$emit(
        'update:model-value',
        new Date(2026, 10, 12)
      )

      expect(payloads(updateTask)).toEqual([
        { taskId: 'task-1', data: { real_start_date: '2026-11-03T10:00:00' } },
        { taskId: 'task-2', data: { real_start_date: '2026-11-03T10:00:00' } },
        { taskId: 'task-1', data: { end_date: null } },
        { taskId: 'task-2', data: { end_date: null } },
        { taskId: 'task-1', data: { done_date: '2026-11-12T10:00:00' } },
        { taskId: 'task-2', data: { done_date: '2026-11-12T10:00:00' } }
      ])

      wrapper.unmount()
    })

    test('skips a task whose real date stays the same', async () => {
      const updateTask = vi.fn()
      const wrapper = mountDatedList({ updateTask })
      await wrapper.find('tbody td.name').trigger('click')

      dateField(wrapper, 'real-start-date').vm.$emit(
        'update:model-value',
        new Date(2026, 10, 2)
      )
      dateField(wrapper, 'done-date').vm.$emit('update:model-value', null)

      expect(updateTask).not.toHaveBeenCalled()

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

// The cells of a selected row save at once, with no modal to tell a refusal:
// the list gives the message the task type page shows above it.
describe('lists/TaskList, cell save', () => {
  // The entity stores give each task the name of its entity.
  const tree = { ...task, entity_name: 'Props / Tree' }
  const rock = {
    ...task,
    id: 'task-2',
    entity: { id: 'asset-2' },
    entity_name: 'Props / Rock'
  }
  const descriptor = {
    id: 'descriptor-1',
    field_name: 'note',
    name: 'Note',
    data_type: 'string',
    choices: [],
    departments: []
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountEditableList = updateTask =>
    mountList(undefined, {
      getters: {
        isCurrentUserProductionManager: () => true,
        taskMap: () =>
          new Map([
            [tree.id, tree],
            [rock.id, rock]
          ])
      },
      actions: { updateTask },
      props: {
        disabledDates: {},
        metadataDescriptors: [descriptor],
        tasks: [tree, rock]
      }
    })
  const message = wrapper =>
    wrapper.vm.$.exposed?.cellSaveErrorText?.value || null
  const typeEstimation = async (wrapper, value) => {
    await wrapper.find('tbody td.estimation input').setValue(value)
    await flushPromises()
  }

  test('tells a cell save Zou refuses', async () => {
    const error = buildRefusal(400)
    const wrapper = mountEditableList(() => Promise.reject(error))
    await wrapper.find('tbody td.name').trigger('click')

    await typeEstimation(wrapper, '1')

    expect(message(wrapper)).toBe(
      'main.cell_save_error {"name":"Props / Tree"}'
    )
    expect(console.error).toHaveBeenCalledWith(error)

    wrapper.unmount()
  })

  test('tells a metadata cell save Zou refuses', async () => {
    const wrapper = mountEditableList(() => Promise.reject(buildRefusal(400)))

    wrapper
      .findComponent(MetadataInput)
      .vm.$emit('metadata-changed', { entry: tree, descriptor, value: 'x' })
    await flushPromises()

    expect(message(wrapper)).toBe(
      'main.cell_save_error {"name":"Props / Tree"}'
    )

    wrapper.unmount()
  })

  test('tells the refusal of several tasks at once', async () => {
    const wrapper = mountEditableList(() => Promise.reject(buildRefusal(400)))
    const names = wrapper.findAll('tbody td.name')
    await names[0].trigger('click')
    await names[1].trigger('click', { ctrlKey: true })

    await typeEstimation(wrapper, '1')

    expect(message(wrapper)).toBe('main.cells_save_error')

    wrapper.unmount()
  })

  // Its row names the entity of the task, which may still stand.
  test('tells a task deleted meanwhile as any refusal', async () => {
    const wrapper = mountEditableList(() => Promise.reject(buildRefusal(404)))
    await wrapper.find('tbody td.name').trigger('click')

    await typeEstimation(wrapper, '1')

    expect(message(wrapper)).toBe(
      'main.cell_save_error {"name":"Props / Tree"}'
    )

    wrapper.unmount()
  })

  test('clears the message once a cell save goes through', async () => {
    const updateTask = vi
      .fn()
      .mockImplementationOnce(() => Promise.reject(buildRefusal(400)))
      .mockImplementationOnce(() => Promise.resolve())
    const wrapper = mountEditableList(updateTask)
    await wrapper.find('tbody td.name').trigger('click')
    await typeEstimation(wrapper, '1')
    expect(message(wrapper)).not.toBeNull()

    await typeEstimation(wrapper, '2')

    expect(updateTask).toHaveBeenCalledTimes(2)
    expect(message(wrapper)).toBeNull()

    wrapper.unmount()
  })
})
