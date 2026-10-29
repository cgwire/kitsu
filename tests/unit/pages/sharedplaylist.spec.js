import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

const { TOKEN } = vi.hoisted(() => ({ TOKEN: 'token-1' }))

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { token: TOKEN } })
}))
vi.mock('@/components/players/players/SharedPlaylistPlayer.vue', () => ({
  default: {
    name: 'SharedPlaylistPlayer',
    props: ['canComment', 'entities', 'guestId', 'loading', 'playlist', 'token'],
    template: '<div />'
  }
}))

import { USER_LOGIN } from '@/store/mutation-types'

import SharedPlaylist from '@/components/pages/SharedPlaylist.vue'
import SharedPlaylistIdentityCard from '@/components/pages/SharedPlaylistIdentityCard.vue'
import SharedPlaylistPlayer from '@/components/players/players/SharedPlaylistPlayer.vue'

let actions
let mutations

const mountPage = async ({ canComment }) => {
  actions = {
    loadSharedPlaylist: vi.fn(async () => ({ id: 'playlist-1', shots: [] })),
    loadSharedPlaylistContext: vi.fn(async () => ({
      share_link: { can_comment: canComment },
      project: { id: 'production-1' },
      task_types: [],
      task_statuses: []
    })),
    postSharedPlaylistGuest: vi.fn(async () => ({
      id: 'guest-1',
      first_name: 'Jane'
    }))
  }
  mutations = {
    TOGGLE_DARK_THEME: vi.fn(),
    USER_LOGIN: vi.fn(),
    USER_LOGOUT: vi.fn()
  }
  const store = createStore({ actions, mutations })
  const wrapper = shallowMount(SharedPlaylist, {
    global: { mocks: { $t: key => key }, plugins: [store] }
  })
  await flushPromises()
  return wrapper
}

describe('pages/SharedPlaylist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('asks for a name on a link open to comments', async () => {
    const wrapper = await mountPage({ canComment: true })
    expect(wrapper.findComponent(SharedPlaylistIdentityCard).exists()).toBe(
      true
    )
    expect(wrapper.findComponent(SharedPlaylistPlayer).exists()).toBe(false)
    expect(mutations[USER_LOGIN]).not.toHaveBeenCalled()
  })

  test('brings back the guest of a link open to comments', async () => {
    localStorage.setItem(`shared-playlist-guest-${TOKEN}`, 'guest-1')
    const wrapper = await mountPage({ canComment: true })
    expect(actions.postSharedPlaylistGuest).toHaveBeenCalledWith(
      expect.anything(),
      { shareToken: TOKEN, data: { guest_id: 'guest-1' } }
    )
    const player = wrapper.findComponent(SharedPlaylistPlayer)
    expect(player.props('canComment')).toBe(true)
    expect(player.props('guestId')).toBe('guest-1')
  })

  test('opens the playlist read only on a link closed to comments', async () => {
    const wrapper = await mountPage({ canComment: false })
    expect(wrapper.findComponent(SharedPlaylistIdentityCard).exists()).toBe(
      false
    )
    const player = wrapper.findComponent(SharedPlaylistPlayer)
    expect(player.props('canComment')).toBe(false)
    expect(player.props('guestId')).toBe('')
  })

  test('shows a link closed to comments as a client sees it', async () => {
    await mountPage({ canComment: false })
    expect(mutations[USER_LOGIN]).toHaveBeenCalledTimes(1)
    const [, user] = mutations[USER_LOGIN].mock.calls[0]
    expect(user.role).toBe('client')
    expect(user.id).toBeUndefined()
  })

  test('creates no guest on a link closed to comments', async () => {
    localStorage.setItem(`shared-playlist-guest-${TOKEN}`, 'guest-1')
    await mountPage({ canComment: false })
    expect(actions.postSharedPlaylistGuest).not.toHaveBeenCalled()
  })
})
