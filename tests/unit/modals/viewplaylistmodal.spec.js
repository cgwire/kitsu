import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// Load @/store first to avoid a circular-import race when ViewPlaylistModal
// transitively imports the assets/shots/sequences store modules.
import '@/lib/auth'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/shots' }),
  useRouter: () => ({ push: () => {} })
}))

// PlaylistPlayer is a very heavy component and is only rendered, never used in
// the save flow we exercise here, so stub it away.
vi.mock('@/components/players/players/PlaylistPlayer.vue', () => ({
  default: { name: 'PlaylistPlayer', render: () => null }
}))

import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'

describe('ViewPlaylistModal', () => {
  let store
  let wrapper
  let editPlaylistPayload
  let tempEntities

  beforeEach(() => {
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

    const i18n = createI18n({
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
})
