vi.mock('@/store/api/playlists', () => ({
  default: {
    loadSharedPlaylistComments: vi.fn(),
    loadSharedPlaylistContext: vi.fn()
  }
}))

import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import playlistsApi from '@/store/api/playlists'

import SharedCommentsPanel from '@/components/players/sides/SharedCommentsPanel.vue'
import TaskComment from '@/components/widgets/Comment.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false
})

const store = createStore({
  getters: {
    currentProduction: () => null,
    personMap: () => new Map(),
    taskStatusMap: () => new Map()
  },
  mutations: { LOAD_PEOPLE_END: () => {} }
})

describe('players/SharedCommentsPanel', () => {
  beforeEach(() => {
    playlistsApi.loadSharedPlaylistContext.mockResolvedValue({
      task_statuses: []
    })
    playlistsApi.loadSharedPlaylistComments.mockResolvedValue([
      {
        id: 'comment-1',
        object_id: 'task-1',
        person_id: 'person-1',
        text: 'Nice timing',
        created_at: '2026-10-01T10:00:00'
      }
    ])
  })

  // External clients reviewing a shared playlist have no use for it.
  it('lists the comments without the acknowledgment button', async () => {
    const wrapper = shallowMount(SharedCommentsPanel, {
      props: { token: 'token', currentTaskId: 'task-1' },
      global: { directives: { autosize: {} }, plugins: [store, i18n] }
    })
    await flushPromises()

    const comments = wrapper.findAllComponents(TaskComment)
    expect(comments).toHaveLength(1)
    expect(comments[0].props('isAcknowledgeable')).toBe(false)
  })
})
