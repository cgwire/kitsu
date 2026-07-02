import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// Load @/store first to avoid a circular-import race when ViewPlaylistModal
// transitively imports the assets/shots/sequences store modules.
import '@/lib/auth'

const routeState = vi.hoisted(() => ({
  path: '/shots',
  params: { production_id: 'production-1' }
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({
    get path() {
      return routeState.path
    },
    get params() {
      return routeState.params
    }
  }),
  useRouter: () => ({ push: () => {} })
}))

// PlaylistPlayer is a very heavy component and is only rendered, never used in
// the save flow we exercise here, so stub it away.
vi.mock('@/components/players/players/PlaylistPlayer.vue', () => ({
  default: { name: 'PlaylistPlayer', props: ['canSave'], render: () => null }
}))

import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'

describe('ViewPlaylistModal', () => {
  let store
  let wrapper
  let i18n
  let editPlaylistPayload
  let tempEntities

  beforeEach(() => {
    routeState.path = '/shots'
    routeState.params = { production_id: 'production-1' }
    editPlaylistPayload = null
    tempEntities = []
    store = createStore({
      strict: true,
      getters: {
        currentEpisode: () => null,
        currentProduction: () => ({ id: 'production-1' }),
        isTVShow: () => false,
        selectedTasks: () => new Map()
      },
      mutations: {
        SET_PLAYLIST_ENTRY_MAP: () => {}
      },
      actions: {
        // The create response does not necessarily echo task_type_id back, so
        // the save flow must not rely on it being present here.
        newPlaylist: (_ctx, data) => {
          const created = { ...data, id: 'playlist-1' }
          delete created.task_type_id
          return Promise.resolve(created)
        },
        editPlaylist: (_ctx, payload) => {
          editPlaylistPayload = payload
          return Promise.resolve()
        },
        loadPlaylists: () => {},
        loadTempPlaylist: () => Promise.resolve(tempEntities)
      }
    })

    i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: { playlists: { created: 'Playlist “{name}” created.' } }
      },
      missingWarn: false,
      fallbackWarn: false
    })

    wrapper = shallowMount(ViewPlaylistModal, {
      global: { plugins: [store, i18n] },
      props: { active: false }
    })
  })

  it('keeps the selected task type when saving a playlist from a selection', async () => {
    const editModal = wrapper.findComponent(EditPlaylistModal)
    editModal.vm.$emit('confirm', {
      name: 'My playlist',
      for_entity: 'shot',
      for_client: false,
      is_for_all: false,
      task_type_id: 'task-type-1'
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve))

    expect(editPlaylistPayload).not.toBeNull()
    expect(editPlaylistPayload.data.task_type_id).toBe('task-type-1')
  })

  it('shows a success state instead of closing the modal right after creation', async () => {
    // Open the create form the way the user does (Save in the player).
    wrapper.findComponent({ name: 'PlaylistPlayer' }).vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()

    const editModal = wrapper.findComponent(EditPlaylistModal)
    expect(editModal.props('active')).toBe(true)
    editModal.vm.$emit('confirm', {
      name: 'My playlist',
      for_entity: 'shot',
      for_client: false,
      is_for_all: false,
      task_type_id: 'task-type-1'
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve))
    await wrapper.vm.$nextTick()

    // The edit modal stays open and switches to its success state.
    expect(editModal.props('active')).toBe(true)
    expect(editModal.props('isSuccess')).toBe(true)
    expect(editModal.props('successText')).toContain('My playlist')
  })

  it('saves the chosen task type preview for each entity, not the default one', async () => {
    // Entity carries a preview per task type; the default differs from the one
    // matching the task type the user picks.
    tempEntities = [
      {
        id: 'shot-1',
        name: 'SH01',
        preview_file_id: 'pf-anim',
        preview_files: {
          'tt-anim': [{ id: 'pf-anim' }],
          'tt-compo': [{ id: 'pf-compo' }]
        }
      }
    ]
    await wrapper.setProps({ active: true })
    await new Promise(resolve => setTimeout(resolve))
    await wrapper.vm.$nextTick()

    const editModal = wrapper.findComponent(EditPlaylistModal)
    editModal.vm.$emit('confirm', {
      name: 'Compo review',
      for_entity: 'shot',
      for_client: false,
      is_for_all: false,
      task_type_id: 'tt-compo'
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve))

    expect(editPlaylistPayload.data.shots).toEqual([
      { entity_id: 'shot-1', preview_file_id: 'pf-compo' }
    ])
  })

  it.each([
    // A shots page under an episode contains "episodes" in the URL but is a
    // shot view: it must save a shot playlist, not an empty episode one.
    ['/productions/production-1/episodes/episode-1/shots', 'shot'],
    // The bare episodes list still infers "episode" (dormant episode-playlist
    // support kept in place on purpose).
    ['/productions/production-1/episodes', 'episode']
  ])('infers for_entity "%s" → "%s" when saving from a selection', async (path, expected) => {
    routeState.path = path
    const localWrapper = shallowMount(ViewPlaylistModal, {
      global: { plugins: [store, i18n] },
      props: { active: false }
    })

    localWrapper
      .findComponent({ name: 'PlaylistPlayer' })
      .vm.$emit('save-clicked')
    await localWrapper.vm.$nextTick()

    const editModal = localWrapper.findComponent(EditPlaylistModal)
    expect(editModal.props('playlistToEdit').for_entity).toBe(expected)
  })

  it('disallows saving outside a production context (e.g. My Checks)', async () => {
    // Saving attaches the playlist to currentProduction: from a
    // cross-production view the tasks may span several productions.
    expect(
      wrapper.findComponent({ name: 'PlaylistPlayer' }).props('canSave')
    ).toBe(true)

    routeState.path = '/my-checks'
    routeState.params = {}
    const localWrapper = shallowMount(ViewPlaylistModal, {
      global: { plugins: [store, i18n] },
      props: { active: false }
    })
    expect(
      localWrapper.findComponent({ name: 'PlaylistPlayer' }).props('canSave')
    ).toBe(false)
  })
})
