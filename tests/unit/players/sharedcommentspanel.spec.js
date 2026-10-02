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

// The people the panel registers, as the people store receives them.
const loadedPeople = []

const store = createStore({
  getters: {
    currentProduction: () => null,
    personMap: () => new Map(),
    taskStatusMap: () => new Map()
  },
  mutations: {
    LOAD_PEOPLE_END: (state, { people }) => {
      loadedPeople.push(...people)
    }
  }
})

const mountPanel = () =>
  shallowMount(SharedCommentsPanel, {
    props: { token: 'token', currentTaskId: 'task-1' },
    global: { directives: { autosize: {} }, plugins: [store, i18n] }
  })

const sharedAvatarPath = personId =>
  `/api/shared/playlists/token/pictures/thumbnails/persons/${personId}.png`

describe('players/SharedCommentsPanel', () => {
  beforeEach(() => {
    loadedPeople.length = 0
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

  // The avatar route needs a login: the page shows the pictures through the
  // link, for the comment authors and the repliers alike.
  it('shows the avatars and the repliers through the link', async () => {
    playlistsApi.loadSharedPlaylistComments.mockResolvedValue([
      {
        id: 'comment-1',
        object_id: 'task-1',
        person_id: 'person-1',
        person: { id: 'person-1', full_name: 'Sam Super', has_avatar: true },
        text: 'Nice timing',
        created_at: '2026-10-01T10:00:00',
        replies: [
          {
            id: 'reply-1',
            person_id: 'person-2',
            person: { id: 'person-2', full_name: 'Max Prod', has_avatar: true }
          },
          {
            id: 'reply-2',
            person_id: 'guest-1',
            person: { id: 'guest-1', full_name: 'Guest', has_avatar: false }
          }
        ]
      }
    ])
    const wrapper = mountPanel()
    await flushPromises()

    const comment = wrapper.findComponent(TaskComment).props('comment')
    expect(comment.person.avatarPath).toBe(sharedAvatarPath('person-1'))
    expect(comment.replies[0].person).toMatchObject({
      full_name: 'Max Prod',
      has_avatar: true,
      avatarPath: sharedAvatarPath('person-2')
    })
    expect(comment.replies[1].person.has_avatar).toBe(false)
    expect(comment.replies[1].person.avatarPath).toBeUndefined()
    // The store keeps initials: its avatar route would answer 401 here.
    expect(
      loadedPeople.map(({ id, has_avatar }) => [id, has_avatar])
    ).toEqual([
      ['person-1', false],
      ['person-2', false],
      ['guest-1', false]
    ])
  })
})
