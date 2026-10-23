import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { createStore } from 'vuex'

import KanbanBoard from '@/components/lists/KanbanBoard.vue'
import AddPreviewModal from '@/components/modals/AddPreviewModal.vue'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

const taskStatus = {
  id: 'task-status-1',
  name: 'WIP',
  short_name: 'wip',
  color: '#3273dc',
  is_artist_allowed: true,
  is_client_allowed: true,
  productions: ['production-1']
}

const task = {
  id: 'task-1',
  project_id: 'production-1',
  task_type_id: 'task-type-1',
  task_status_id: 'task-status-1',
  entity_preview_file_id: 'preview-file-1',
  full_entity_name: 'SQ010 / SH0010',
  assignees: [],
  priority: 0
}

const mountBoard = ({
  getters = {},
  statuses = [taskStatus],
  tasks = [task]
} = {}) =>
  shallowMount(KanbanBoard, {
    global: {
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            isDarkTheme: () => false,
            organisation: () => ({ hours_by_day: 8 }),
            personMap: () => new Map(),
            productionMap: () => new Map(),
            selectedTasks: () => new Map(),
            taskTypeMap: () => new Map(),
            use12HourClock: () => false,
            ...getters
          }
        })
      ]
    },
    props: {
      statuses,
      tasks,
      user: { role: 'admin' }
    }
  })

const findCard = wrapper => wrapper.find('.board-card .ui-droppable')

describe('lists/KanbanBoard', () => {
  describe('card preview', () => {
    test('shows the placeholder while the card preview is processing', () => {
      const wrapper = mountBoard({
        getters: {
          previewFileStatusMap: () =>
            new Map([['preview-file-1', 'processing']])
        }
      })
      const card = findCard(wrapper)

      expect(card.find('.preview-placeholder').exists()).toBe(true)
      expect(card.classes()).not.toContain('has-preview')
      // no request the picture route would answer 404
      expect(card.element.style.backgroundImage).toBe('')

      wrapper.unmount()
    })

    test('paints the card preview under a new URL once the registry knows it ready', async () => {
      const statusMap = reactive(new Map())
      const wrapper = mountBoard({
        getters: { previewFileStatusMap: () => statusMap }
      })
      const card = findCard(wrapper)
      expect(card.element.style.backgroundImage).toBe(
        'url("/api/pictures/previews/preview-files/preview-file-1.png")'
      )

      statusMap.set('preview-file-1', 'ready')
      await nextTick()

      // the browser keeps the 404 the former URL got while processing
      expect(card.element.style.backgroundImage).toBe(
        'url("/api/pictures/previews/preview-files/preview-file-1.png?ready")'
      )
      expect(card.classes()).toContain('has-preview')

      wrapper.unmount()
    })

    test('shows the placeholder on a card without preview', () => {
      const wrapper = mountBoard({
        getters: { previewFileStatusMap: () => new Map() },
        tasks: [{ ...task, entity_preview_file_id: null }]
      })
      const card = findCard(wrapper)

      expect(card.find('.preview-placeholder').exists()).toBe(true)
      expect(card.classes()).not.toContain('has-preview')
      expect(card.element.style.backgroundImage).toBe('')

      wrapper.unmount()
    })

    test('paints the card preview with a store that keeps no status', () => {
      const wrapper = mountBoard()
      const card = findCard(wrapper)

      expect(card.find('.preview-placeholder').exists()).toBe(false)
      expect(card.element.style.backgroundImage).toBe(
        'url("/api/pictures/previews/preview-files/preview-file-1.png")'
      )

      wrapper.unmount()
    })
  })

  describe('move to a feedback request status', () => {
    const feedbackStatus = {
      ...taskStatus,
      id: 'task-status-2',
      name: 'WFA',
      short_name: 'wfa',
      is_feedback_request: true
    }

    const buildDataTransfer = () => {
      const data = {}
      return {
        getData: key => data[key],
        setData: (key, value) => {
          data[key] = value
        },
        setDragImage: () => {}
      }
    }

    beforeEach(() => {
      // Reduced motion: jsdom cannot lay out the tilted drag proxy.
      vi.stubGlobal('matchMedia', () => ({ matches: true }))
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('publishes the files of the preview modal with the move', async () => {
      const wrapper = mountBoard({ statuses: [taskStatus, feedbackStatus] })
      const store = wrapper.vm.$store
      store.dispatch = vi.fn(() => Promise.resolve())
      const dataTransfer = buildDataTransfer()
      const form = new FormData()
      form.append('file', new File(['frame'], 'sh010.mp4'))

      await wrapper.find('.board-card').trigger('dragstart', { dataTransfer })
      await wrapper
        .find('[data-status-id="task-status-2"]')
        .trigger('drop', { dataTransfer })
      await wrapper.findComponent(AddPreviewModal).vm.$emit('confirm', [form])
      await flushPromises()

      expect(store.dispatch).toHaveBeenCalledWith('commentTaskWithPreview', {
        comment: '',
        taskId: 'task-1',
        taskStatusId: 'task-status-2',
        forms: [form]
      })

      wrapper.unmount()
    })
  })
})
