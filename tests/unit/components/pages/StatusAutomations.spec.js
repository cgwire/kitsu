import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

import csv from '@/lib/csv'

import StatusAutomationList from '@/components/lists/StatusAutomationList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditStatusAutomationModal from '@/components/modals/EditStatusAutomationModal.vue'
import StatusAutomations from '@/components/pages/StatusAutomations.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'

import { shallowMountWithI18n } from '../../fixtures/i18n'

const statusAutomation = {
  id: 'automation-1',
  entity_type: 'asset',
  in_task_type_id: 'task-type-1',
  in_task_status_id: 'task-status-1',
  out_field_type: 'status',
  out_task_type_id: 'task-type-2',
  out_task_status_id: 'task-status-2',
  import_last_revision: false,
  archived: false
}

const multiConditionAutomation = {
  id: 'automation-2',
  entity_type: 'shot',
  in_conditions: {
    operator: 'or',
    conditions: [
      { task_type_id: 'task-type-1', task_status_ids: ['task-status-1'] },
      {
        task_type_id: 'task-type-3',
        task_status_ids: ['task-status-1', 'task-status-3']
      }
    ]
  },
  in_task_type_id: null,
  in_task_status_id: null,
  out_field_type: 'status',
  out_task_type_id: 'task-type-2',
  out_task_status_id: 'task-status-2',
  out_only_if_task_status_ids: ['task-status-4', 'task-status-2'],
  import_last_revision: true,
  archived: false
}

const taskTypeMap = new Map([
  ['task-type-1', { id: 'task-type-1', name: 'Lighting' }],
  ['task-type-2', { id: 'task-type-2', name: 'Compositing' }],
  ['task-type-3', { id: 'task-type-3', name: 'FX' }]
])
const taskStatusMap = new Map([
  ['task-status-1', { id: 'task-status-1', short_name: 'done' }],
  ['task-status-2', { id: 'task-status-2', short_name: 'ready' }],
  ['task-status-3', { id: 'task-status-3', short_name: 'na' }],
  ['task-status-4', { id: 'task-status-4', short_name: 'todo' }]
])

describe('StatusAutomations page', () => {
  const mountPage = async (
    actions = {},
    statusAutomations = [statusAutomation, multiConditionAutomation]
  ) => {
    const store = createStore({
      getters: {
        statusAutomations: () => statusAutomations,
        archivedStatusAutomations: () => [],
        taskStatusMap: () => taskStatusMap,
        taskTypeMap: () => taskTypeMap
      },
      actions: { loadStatusAutomations: () => {}, ...actions }
    })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }]
    })
    await router.push('/')
    const wrapper = shallowMountWithI18n(StatusAutomations, {
      global: {
        plugins: [store, router],
        stubs: { DeleteModal: false }
      }
    })
    await flushPromises()
    return wrapper
  }

  // An automation has no name, and the text of the custom actions read
  // "remove custom action  from your database".
  it('asks to confirm the deletion of a status automation', async () => {
    const wrapper = await mountPage()

    wrapper
      .findComponent(StatusAutomationList)
      .vm.$emit('delete-clicked', statusAutomation)
    await nextTick()

    const deleteModal = wrapper.findComponent(DeleteModal)
    expect(deleteModal.props('active')).toBe(true)
    const text = deleteModal.find('.text').text()
    expect(text).not.toContain('custom action')
    expect(text).not.toContain('undefined')
    expect(text).toBe(
      'Are you sure you want to remove this status automation from your database?'
    )
  })

  // Zou refuses to delete an automation that a production or a production
  // template uses.
  it('explains why the deletion of a status automation fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const wrapper = await mountPage({
      deleteStatusAutomation: () => Promise.reject(new Error('Bad request'))
    })

    wrapper
      .findComponent(StatusAutomationList)
      .vm.$emit('delete-clicked', statusAutomation)
    await nextTick()
    const deleteModal = wrapper.findComponent(DeleteModal)
    deleteModal.vm.$emit('confirm')
    await flushPromises()

    expect(deleteModal.find('.is-danger').text()).toBe(
      'An error occurred while deleting this status automation. It may be ' +
        'linked to a production or a production template. If so, you must ' +
        'remove it from every production and template first.'
    )
    expect(consoleError).toHaveBeenCalledOnce()
    consoleError.mockRestore()
  })

  // Zou refuses a write that breaks a rule, with a message that says which:
  // trying again does not help.
  it('shows why Zou refuses to save an automation', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const refusal = 'Task type FX appears in two conditions.'
    const failures = [
      Object.assign(new Error('Server error'), {
        status: 500,
        body: { message: 'Internal error' }
      }),
      Object.assign(new Error('Bad request'), {
        status: 400,
        body: { message: refusal }
      })
    ]
    const wrapper = await mountPage({
      editStatusAutomation: () => Promise.reject(failures.shift())
    })
    const editModal = () => wrapper.findComponent(EditStatusAutomationModal)
    const save = async () => {
      editModal().vm.$emit('confirm', { conditions: [] })
      await flushPromises()
    }
    const openEdit = async () => {
      wrapper
        .findComponent(StatusAutomationList)
        .vm.$emit('edit-clicked', statusAutomation)
      await nextTick()
    }

    await openEdit()
    await save()
    expect(editModal().props('isError')).toBe(true)
    expect(editModal().props('errorDetails')).toBe('')

    await save()
    expect(editModal().props('isError')).toBe(true)
    expect(editModal().props('errorDetails')).toBe(refusal)
    expect(editModal().props('isLoading')).toBe(false)

    await openEdit()
    expect(editModal().props('isError')).toBe(false)
    expect(editModal().props('errorDetails')).toBe('')
    expect(consoleError).toHaveBeenCalledTimes(2)
    consoleError.mockRestore()
  })

  describe('answers', () => {
    const pendingAnswer = () => {
      const answer = {}
      answer.promise = new Promise((resolve, reject) => {
        Object.assign(answer, { resolve, reject })
      })
      return answer
    }

    const openRow = async (wrapper, event, row) => {
      wrapper.findComponent(StatusAutomationList).vm.$emit(event, row)
      await nextTick()
    }

    const refusal = Object.assign(new Error('Bad request'), {
      status: 400,
      body: { message: 'Task type FX appears in two conditions.' }
    })

    let consoleError

    beforeEach(() => {
      consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleError.mockRestore()
    })

    const saveThenOpenAnother = async answer => {
      const wrapper = await mountPage({
        editStatusAutomation: () => answer.promise
      })
      const modal = wrapper.findComponent(EditStatusAutomationModal)
      await openRow(wrapper, 'edit-clicked', statusAutomation)
      modal.vm.$emit('confirm', { conditions: [] })
      modal.vm.$emit('cancel')
      await openRow(wrapper, 'edit-clicked', multiConditionAutomation)
      return modal
    }

    const deleteThenOpenAnother = async answer => {
      const wrapper = await mountPage({
        deleteStatusAutomation: () => answer.promise
      })
      const modal = wrapper.findComponent(DeleteModal)
      await openRow(wrapper, 'delete-clicked', statusAutomation)
      modal.vm.$emit('confirm')
      modal.vm.$emit('cancel')
      await openRow(wrapper, 'delete-clicked', multiConditionAutomation)
      return modal
    }

    it('closes the edit modal once the row is saved', async () => {
      const wrapper = await mountPage({
        editStatusAutomation: () => Promise.resolve()
      })
      const modal = wrapper.findComponent(EditStatusAutomationModal)
      await openRow(wrapper, 'edit-clicked', statusAutomation)

      modal.vm.$emit('confirm', { conditions: [] })
      await flushPromises()

      expect(modal.props('active')).toBe(false)
    })

    it('closes the delete modal once the row is deleted', async () => {
      const wrapper = await mountPage({
        deleteStatusAutomation: () => Promise.resolve()
      })
      const modal = wrapper.findComponent(DeleteModal)
      await openRow(wrapper, 'delete-clicked', statusAutomation)

      modal.vm.$emit('confirm')
      await flushPromises()

      expect(modal.props('active')).toBe(false)
    })

    it('ignores a second deletion while the first one is pending', async () => {
      const deleteStatusAutomation = vi.fn(() => new Promise(() => {}))
      const wrapper = await mountPage({ deleteStatusAutomation })
      const modal = wrapper.findComponent(DeleteModal)
      await openRow(wrapper, 'delete-clicked', statusAutomation)

      modal.vm.$emit('confirm')
      modal.vm.$emit('confirm')
      await flushPromises()

      expect(deleteStatusAutomation).toHaveBeenCalledOnce()
    })

    it('takes a new deletion after a refusal', async () => {
      const deleteStatusAutomation = vi.fn(() => Promise.reject(refusal))
      const wrapper = await mountPage({ deleteStatusAutomation })
      const modal = wrapper.findComponent(DeleteModal)
      await openRow(wrapper, 'delete-clicked', statusAutomation)

      modal.vm.$emit('confirm')
      await flushPromises()
      modal.vm.$emit('confirm')
      await flushPromises()

      expect(deleteStatusAutomation).toHaveBeenCalledTimes(2)
      expect(consoleError).toHaveBeenCalledTimes(2)
    })

    it('leaves a new form open after the late save of the previous one', async () => {
      const answer = pendingAnswer()
      const wrapper = await mountPage({
        newStatusAutomation: () => answer.promise
      })
      const header = wrapper.findComponent(ListPageHeader)
      const modal = wrapper.findComponent(EditStatusAutomationModal)
      header.vm.$emit('new-clicked')
      await nextTick()
      modal.vm.$emit('confirm', { conditions: [] })
      modal.vm.$emit('cancel')
      header.vm.$emit('new-clicked')
      await nextTick()

      answer.resolve()
      await flushPromises()

      expect(modal.props('active')).toBe(true)
    })

    it('keeps a late refusal of a save off a modal reopened for another row', async () => {
      const answer = pendingAnswer()
      const modal = await saveThenOpenAnother(answer)

      answer.reject(refusal)
      await flushPromises()

      expect(modal.props('isError')).toBe(false)
      expect(modal.props('errorDetails')).toBe('')
      expect(consoleError).toHaveBeenCalledOnce()
    })

    it('leaves a modal reopened for another row open after a late save', async () => {
      const answer = pendingAnswer()
      const modal = await saveThenOpenAnother(answer)

      answer.resolve()
      await flushPromises()

      expect(modal.props('active')).toBe(true)
      expect(modal.props('statusAutomationToEdit')).toEqual(
        multiConditionAutomation
      )
    })

    it('keeps a late refusal of a deletion off a modal reopened for another row', async () => {
      const answer = pendingAnswer()
      const modal = await deleteThenOpenAnother(answer)

      answer.reject(refusal)
      await flushPromises()

      expect(modal.props('isError')).toBe(false)
      expect(consoleError).toHaveBeenCalledOnce()
    })

    it('leaves a modal reopened for another row open after a late deletion', async () => {
      const answer = pendingAnswer()
      const modal = await deleteThenOpenAnother(answer)

      answer.resolve()
      await flushPromises()

      expect(modal.props('active')).toBe(true)
    })
  })

  it('exports one line per automation with its conditions', async () => {
    const buildCsvFile = vi
      .spyOn(csv, 'buildCsvFile')
      .mockImplementation(() => {})
    const wrapper = await mountPage()

    wrapper.findComponent(ListPageHeader).vm.$emit('export-clicked')

    expect(buildCsvFile).toHaveBeenCalledWith('automations', [
      [
        'Entity Type',
        'Operator',
        'Conditions',
        'Applied Change',
        'Applied Task Type',
        'Applied Task Status',
        'Only when the applied task is in',
        'Import Last Revision'
      ],
      [
        'asset',
        'and',
        'Lighting: done',
        'changes the status of',
        'Compositing',
        'ready',
        '',
        false
      ],
      [
        'shot',
        'or',
        'Lighting: done; FX: done, na',
        'changes the status of',
        'Compositing',
        'ready',
        'todo, ready',
        true
      ]
    ])
    buildCsvFile.mockRestore()
  })

  // Only a direct write stores a guard that is not a list.
  it('exports a malformed guard as none', async () => {
    const buildCsvFile = vi
      .spyOn(csv, 'buildCsvFile')
      .mockImplementation(() => {})
    const wrapper = await mountPage({}, [
      { ...multiConditionAutomation, out_only_if_task_status_ids: {} }
    ])

    wrapper.findComponent(ListPageHeader).vm.$emit('export-clicked')

    expect(buildCsvFile.mock.calls[0][1][1][6]).toBe('')
    buildCsvFile.mockRestore()
  })
})
