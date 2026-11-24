import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid circular-import race from child components.
import '@/lib/auth'

import AllTaskList from '@/components/lists/AllTaskList.vue'

import { openModalHost } from '../../fixtures/modal-host'
import {
  addTextField,
  onPlatform,
  pressAltArrow
} from '../../fixtures/platform'
import { trackTaskSelection } from '../../fixtures/task-selection'

describe('lists/AllTaskList', () => {
  const tasks = ['task-1', 'task-2'].map(id => ({ id, assignees: [] }))

  const mountList = selection =>
    shallowMount(AllTaskList, {
      global: {
        plugins: [
          createStore({
            state: selection.state,
            mutations: selection.mutations,
            getters: {
              organisation: () => ({ hours_by_day: 8 }),
              personMap: () => new Map(),
              taskTypeMap: () => new Map(),
              user: () => ({ id: 'user-1' }),
              ...selection.getters
            },
            actions: selection.actions
          })
        ]
      },
      props: { tasks }
    })

  const pressAltDown = async () => {
    const event = new KeyboardEvent('keydown', {
      altKey: true,
      cancelable: true,
      keyCode: 40
    })
    window.dispatchEvent(event)
    await nextTick()
    return event
  }

  // The task of a comment being edited moved behind the modal.
  test('keeps the selection on Alt+Down behind a modal', async () => {
    const selection = trackTaskSelection()
    const wrapper = mountList(selection)
    await wrapper.find('tbody tr.task-line').trigger('click')
    const closeModal = await openModalHost()

    const event = await pressAltDown()

    expect(selection.selectedIds()).toEqual(['task-1'])
    expect(event.defaultPrevented).toBe(true)

    closeModal()
    await pressAltDown()

    expect(selection.selectedIds()).toEqual(['task-2'])

    wrapper.unmount()
  })

  const mountOnFirstTask = async () => {
    const selection = trackTaskSelection()
    const wrapper = mountList(selection)
    onTestFinished(() => wrapper.unmount())
    await wrapper.find('tbody tr.task-line').trigger('click')
    return selection
  }

  // macOS moves the caret of the field by word on Option and an arrow.
  test('leaves Option+Down to a field on macOS', async () => {
    onPlatform('MacIntel')
    const selection = await mountOnFirstTask()

    const event = pressAltArrow(addTextField('textarea', 'A draft'), 40)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(selection.selectedIds()).toEqual(['task-1'])
  })

  // An empty field has no caret to move.
  test('walks from an empty field on macOS', async () => {
    onPlatform('MacIntel')
    const selection = await mountOnFirstTask()

    pressAltArrow(addTextField('textarea', ''), 40)
    await nextTick()

    expect(selection.selectedIds()).toEqual(['task-2'])
  })

  // Phones get cards from the global datatable--cards rule: a card-head cell
  // titles the card, a data-label cell is a line of it, the rest is hidden.
  describe('cards', () => {
    const mountCards = () =>
      shallowMount(AllTaskList, {
        global: {
          plugins: [
            createStore({
              getters: {
                nbSelectedTasks: () => 0,
                organisation: () => ({ hours_by_day: 8 }),
                personMap: () => new Map(),
                selectedTasks: () => new Map(),
                taskTypeMap: () => new Map(),
                user: () => ({ id: 'user-1' })
              }
            })
          ]
        },
        props: {
          tasks: [
            {
              id: 'task-1',
              assignees: ['person-1'],
              due_date: '2026-12-01',
              project_name: 'Caminandes'
            },
            { id: 'task-2', assignees: [] }
          ]
        }
      })

    test('titles a card with the parent and the entity', () => {
      const row = mountCards().find('tbody tr')

      expect(row.find('td.asset-type').classes()).toContain('card-head')
      expect(row.find('td.entity').classes()).toContain('card-head')
    })

    // The avatar of the desktop rows names no production without its
    // tooltip, which a phone cannot show.
    test('names the production on a line', () => {
      const cell = mountCards().find('tbody tr td.project')

      expect(cell.attributes('data-label')).toBe('tasks.fields.production')
      expect(cell.find('.project-name').text()).toBe('Caminandes')
    })

    test('lines up the type, status, assignees and due date', () => {
      const wrapper = mountCards()
      const [row] = wrapper.findAll('tbody tr')
      const labelOf = selector => row.find(selector).attributes('data-label')

      expect(labelOf('.task-type')).toBe('tasks.fields.task_type')
      expect(labelOf('.status')).toBe('tasks.fields.task_status')
      expect(labelOf('td.assignees')).toBe('tasks.fields.assignees')
      expect(labelOf('td.due-date')).toBe('tasks.fields.due_date')
    })

    test('leaves out the empty assignees and due date', () => {
      const row = mountCards().findAll('tbody tr')[1]

      expect(row.find('td.assignees').attributes('data-label')).toBeUndefined()
      expect(row.find('td.due-date').attributes('data-label')).toBeUndefined()
    })

    test('keeps the other cells off the card', () => {
      const row = mountCards().find('tbody tr')
      const hidden = [
        'td.thumbnail',
        'td.estimation',
        'td.duration',
        'td.start-date',
        'td.done-date'
      ]

      hidden.forEach(selector => {
        const cell = row.find(selector)
        expect(cell.attributes('data-label')).toBeUndefined()
        expect(cell.classes()).not.toContain('card-head')
      })
    })
  })
})
