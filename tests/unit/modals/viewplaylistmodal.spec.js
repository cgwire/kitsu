import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
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
vi.mock('@/components/players/players/PlaylistPlayer.vue', async () => {
  const { h } = await import('vue')
  // Its root is the element the browser puts in full screen.
  return {
    default: { name: 'PlaylistPlayer', props: ['canSave'], render: () => h('div') }
  }
})

const crisp = vi.hoisted(() => ({ setChatVisibility: vi.fn() }))
vi.mock('@/lib/crisp', () => ({ default: crisp }))

import shotStore from '@/store/modules/shots'

import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'

import { resetFullScreen, setFullScreenElement } from '../fixtures/full-screen'

describe('ViewPlaylistModal', () => {
  let store
  let wrapper
  let i18n
  let editPlaylistPayload
  let newPlaylistError
  let newPlaylistRequest
  let tempEntities
  // The episode the topbar sets, which a test can move.
  const scope = reactive({ episode: null, isTVShow: false })

  beforeEach(() => {
    routeState.path = '/shots'
    routeState.params = { production_id: 'production-1' }
    editPlaylistPayload = null
    newPlaylistError = null
    newPlaylistRequest = null
    tempEntities = []
    Object.assign(scope, { episode: null, isTVShow: false })
    store = createStore({
      strict: true,
      getters: {
        currentEpisode: () => scope.episode,
        currentProduction: () => ({ id: 'production-1' }),
        isSupportChat: () => true,
        isTVShow: () => scope.isTVShow,
        selectedTasks: () => new Map()
      },
      mutations: {
        SET_PLAYLIST_ENTRY_MAP: () => {}
      },
      actions: {
        // The create response does not necessarily echo task_type_id back, so
        // the save flow must not rely on it being present here.
        newPlaylist: (_ctx, data) => {
          if (newPlaylistError) return Promise.reject(newPlaylistError)
          if (newPlaylistRequest) return newPlaylistRequest
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
      // the modal sits in a teleport, disabled off a phone: render it in place
      global: { plugins: [store, i18n], stubs: { teleport: false } },
      props: { active: false }
    })
  })

  afterEach(() => {
    shotStore.cache.shotMap.delete('shot-1')
    resetFullScreen()
    vi.restoreAllMocks()
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

  // The browser shows the player in full screen alone: its Save button opens
  // the save form in it, back in the modal once the full screen ends.
  it('opens the save form in the player in full screen', async () => {
    const player = wrapper.findComponent({ name: 'PlaylistPlayer' })
    setFullScreenElement(player.element)
    player.vm.$emit('save-clicked')
    await flushPromises()
    const editModal = wrapper.findComponent(EditPlaylistModal)
    expect(player.element.contains(editModal.element)).toBe(true)

    setFullScreenElement(null)
    await flushPromises()
    expect(player.element.contains(editModal.element)).toBe(false)
    expect(wrapper.element.contains(editModal.element)).toBe(true)
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

  // Close keeps the error of a failed save: the next Save opens without it.
  it('opens the save form without the error of a failed save', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    newPlaylistError = new Error('taken')
    const player = wrapper.findComponent({ name: 'PlaylistPlayer' })
    const editModal = wrapper.findComponent(EditPlaylistModal)

    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    await flushPromises()
    expect(editModal.props('isError')).toBe(true)

    editModal.vm.$emit('cancel')
    await wrapper.vm.$nextTick()
    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()

    expect(editModal.props('active')).toBe(true)
    expect(editModal.props('isError')).toBe(false)
  })

  // Clearing on cancel would miss a save that fails after the cancel.
  it('opens the save form without the error of a save that failed after a cancel', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let rejectSave
    newPlaylistRequest = new Promise((resolve, reject) => {
      rejectSave = reject
    })
    const player = wrapper.findComponent({ name: 'PlaylistPlayer' })
    const editModal = wrapper.findComponent(EditPlaylistModal)

    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    editModal.vm.$emit('cancel')
    rejectSave(new Error('taken'))
    await flushPromises()
    expect(editModal.props('isError')).toBe(true)

    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()

    expect(editModal.props('active')).toBe(true)
    expect(editModal.props('isError')).toBe(false)
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

  // The cached shot has no preview duration: copying it onto the
  // sub-previews of a multi-file revision erased the durations Zou sends.
  it('keeps the duration of each sub-preview', async () => {
    shotStore.cache.shotMap.set('shot-1', { id: 'shot-1', name: 'SH01' })
    tempEntities = [
      {
        id: 'shot-1',
        preview_file_id: 'pf-1',
        preview_file_duration: 2,
        preview_file_previews: [{ id: 'pf-1-b', duration: 3.5 }],
        preview_files: { 'tt-anim': [{ id: 'pf-1' }] }
      }
    ]
    await wrapper.setProps({ active: true })
    await new Promise(resolve => setTimeout(resolve))

    expect(tempEntities[0].preview_file_previews[0].duration).toBe(3.5)
  })

  // Sequence names repeat across episodes: All shots says which one.
  it.each([
    ['all shots', { id: 'all' }, 'E01 / SQ01'],
    ['an episode', { id: 'episode-1', name: 'E01' }, 'SQ01']
  ])('names the sequence of a shot under %s', async (_, episode, name) => {
    Object.assign(scope, { episode, isTVShow: true })
    shotStore.cache.shotMap.set('shot-1', {
      id: 'shot-1',
      name: 'SH01',
      sequence_name: 'SQ01',
      episode_name: 'E01'
    })
    tempEntities = [
      { id: 'shot-1', preview_file_id: 'pf-1', preview_files: {} }
    ]
    await wrapper.setProps({ active: true })
    await new Promise(resolve => setTimeout(resolve))

    expect(tempEntities[0].parent_name).toBe(name)
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
      // the modal sits in a teleport, disabled off a phone: render it in place
      global: { plugins: [store, i18n], stubs: { teleport: false } },
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
      // the modal sits in a teleport, disabled off a phone: render it in place
      global: { plugins: [store, i18n], stubs: { teleport: false } },
      props: { active: false }
    })
    expect(
      localWrapper.findComponent({ name: 'PlaylistPlayer' }).props('canSave')
    ).toBe(false)
  })

  describe('on a phone', () => {
    const stubPhone = isPhone => {
      window.matchMedia = query => ({
        matches: isPhone && query === '(max-width: 768px)',
        addEventListener: () => {},
        removeEventListener: () => {}
      })
    }

    const mountActive = () =>
      shallowMount(ViewPlaylistModal, {
        attachTo: document.body,
        // the modal sits in a teleport, disabled off a phone: render it in place
      global: { plugins: [store, i18n], stubs: { teleport: false } },
        props: { active: true }
      })
    const findModal = () => document.querySelector('#temp-playlist-modal')

    beforeEach(() => {
      crisp.setChatVisibility.mockClear()
    })

    afterEach(() => {
      delete window.matchMedia
    })

    it('closes from the close button on a phone', async () => {
      stubPhone(true)
      const modal = mountActive()
      findModal().querySelector('.close-button').click()
      expect(modal.emitted('cancel')).toHaveLength(1)
      expect(findModal().classList.contains('phone')).toBe(true)
      modal.unmount()
    })

    // the fixed page container traps the z-index of what it holds under
    // the topbar: the modal leaves it on phones
    it('renders right under the body on a phone', async () => {
      stubPhone(true)
      const modal = mountActive()
      expect(findModal().parentElement).toBe(document.body)
      modal.unmount()
    })

    it('hides the support chat while open on a phone', async () => {
      stubPhone(true)
      const modal = mountActive()
      await flushPromises()
      expect(crisp.setChatVisibility).toHaveBeenCalledWith(false)
      modal.unmount()
      expect(crisp.setChatVisibility).toHaveBeenLastCalledWith(true)
    })

    it('leaves the chat alone off a phone', async () => {
      stubPhone(false)
      const modal = mountActive()
      await flushPromises()
      expect(crisp.setChatVisibility).not.toHaveBeenCalled()
      expect(findModal().classList.contains('phone')).toBe(false)
      expect(findModal().parentElement).not.toBe(document.body)
      modal.unmount()
    })
  })
})
