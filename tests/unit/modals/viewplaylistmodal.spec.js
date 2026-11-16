import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// Load @/store first to avoid a circular-import race when ViewPlaylistModal
// transitively imports the assets/shots/sequences store modules.
import '@/lib/auth'
import { markRequestFailure } from '@/lib/errors'

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
    default: {
      name: 'PlaylistPlayer',
      props: ['canSave', 'entities', 'isLoading', 'loadingError'],
      methods: { clearCanvas() {}, pause() {} },
      render: () => h('div')
    }
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
      global: {
        plugins: [store, i18n],
        // the modal sits in a teleport, disabled off a phone: render it in
        // place; the mocked player keeps the methods a close calls
        stubs: { teleport: false, PlaylistPlayer: false }
      },
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

  // The action answers null when the save of the entries fails: the new
  // playlist is there, but empty.
  it('tells when the entries of a new playlist fail to save', async () => {
    const dispatch = store.dispatch.bind(store)
    vi.spyOn(store, 'dispatch').mockImplementation((type, payload) =>
      type === 'editPlaylist' ? Promise.resolve(null) : dispatch(type, payload)
    )
    const editModal = wrapper.findComponent(EditPlaylistModal)

    wrapper.findComponent({ name: 'PlaylistPlayer' }).vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    await flushPromises()

    expect(editModal.props('isError')).toBe(true)
    expect(editModal.props('isSuccess')).toBe(false)
  })

  // That playlist is there, empty: a new try from the same form sends the
  // entries to it instead of creating another one.
  it('sends the entries again to the playlist a failed save created', async () => {
    tempEntities = [
      {
        id: 'shot-1',
        name: 'SH01',
        preview_file_id: 'pf-1',
        preview_files: { 'tt-1': [{ id: 'pf-1' }] }
      }
    ]
    await wrapper.setProps({ active: true })
    await new Promise(resolve => setTimeout(resolve))
    await wrapper.vm.$nextTick()
    const dispatch = store.dispatch.bind(store)
    const editAnswers = [null]
    const dispatched = vi
      .spyOn(store, 'dispatch')
      .mockImplementation((type, payload) =>
        type === 'editPlaylist' && editAnswers.length
          ? Promise.resolve(editAnswers.shift())
          : dispatch(type, payload)
      )
    const editModal = wrapper.findComponent(EditPlaylistModal)
    wrapper.findComponent({ name: 'PlaylistPlayer' }).vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    await flushPromises()
    expect(editModal.props('isError')).toBe(true)

    editModal.vm.$emit('confirm', { name: 'Renamed', for_entity: 'shot' })
    await flushPromises()

    const creations = dispatched.mock.calls.filter(
      ([type]) => type === 'newPlaylist'
    )
    expect(creations).toHaveLength(1)
    expect(editPlaylistPayload.data).toMatchObject({
      id: 'playlist-1',
      name: 'Renamed',
      shots: [{ entity_id: 'shot-1', preview_file_id: 'pf-1' }]
    })
    expect(editModal.props('isSuccess')).toBe(true)
  })

  // Cancel, then Save again, opens a new form: it creates a playlist again.
  it('creates a playlist again from a new form after a failed save', async () => {
    const dispatch = store.dispatch.bind(store)
    const editAnswers = [null]
    const dispatched = vi
      .spyOn(store, 'dispatch')
      .mockImplementation((type, payload) =>
        type === 'editPlaylist' && editAnswers.length
          ? Promise.resolve(editAnswers.shift())
          : dispatch(type, payload)
      )
    const player = wrapper.findComponent({ name: 'PlaylistPlayer' })
    const editModal = wrapper.findComponent(EditPlaylistModal)
    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    await flushPromises()

    editModal.vm.$emit('cancel')
    await wrapper.vm.$nextTick()
    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    await flushPromises()

    const creations = dispatched.mock.calls.filter(
      ([type]) => type === 'newPlaylist'
    )
    expect(creations).toHaveLength(2)
  })

  // A save that fails after a cancel leaves its closed form alone.
  it('keeps the error of a save that failed after a cancel out of the form', async () => {
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
    expect(editModal.props('isError')).toBe(false)

    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()

    expect(editModal.props('active')).toBe(true)
    expect(editModal.props('isError')).toBe(false)
  })

  // Cancel, then Save again, before the save answers.
  const reopenDuringSave = async () => {
    const player = wrapper.findComponent({ name: 'PlaylistPlayer' })
    const editModal = wrapper.findComponent(EditPlaylistModal)
    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    editModal.vm.$emit('confirm', { name: 'My playlist', for_entity: 'shot' })
    editModal.vm.$emit('cancel')
    await wrapper.vm.$nextTick()
    player.vm.$emit('save-clicked')
    await wrapper.vm.$nextTick()
    expect(editModal.props('active')).toBe(true)
    return editModal
  }

  it('keeps a late success out of a save form opened again', async () => {
    let resolveSave
    newPlaylistRequest = new Promise(resolve => {
      resolveSave = resolve
    })
    const editModal = await reopenDuringSave()

    resolveSave({ id: 'playlist-1', name: 'My playlist', for_entity: 'shot' })
    await flushPromises()

    expect(editPlaylistPayload.data.id).toBe('playlist-1')
    expect(editModal.props()).toMatchObject({
      active: true,
      isLoading: false,
      isSuccess: false
    })
  })

  it('keeps a late failure out of a save form opened again', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let rejectSave
    newPlaylistRequest = new Promise((resolve, reject) => {
      rejectSave = reject
    })
    const editModal = await reopenDuringSave()

    rejectSave(new Error('taken'))
    await flushPromises()

    expect(consoleError).toHaveBeenCalled()
    expect(editModal.props()).toMatchObject({
      active: true,
      isLoading: false,
      isError: false
    })
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

  // A large selection can take the server minutes: the modal may be gone, or
  // closed and opened again through its active prop, before the answer comes.
  describe('playlist generation', () => {
    const shot = id => ({
      id,
      name: id,
      preview_file_id: `pf-${id}`,
      preview_files: { 'tt-anim': [{ id: `pf-${id}` }] }
    })
    const player = () => wrapper.findComponent({ name: 'PlaylistPlayer' })
    const shownShots = () => player().props('entities').map(entity => entity.id)
    const failure = () => {
      const err = new Error('Gateway Timeout')
      markRequestFailure(err)
      return err
    }
    // Opens the modal on a temporary playlist answered when a test says so.
    const open = async () => {
      const load = {}
      tempEntities = new Promise((resolve, reject) => {
        Object.assign(load, { resolve, reject })
      })
      await wrapper.setProps({ active: true })
      return load
    }
    const close = () => wrapper.setProps({ active: false })

    it('stops loading and tells when the playlist cannot be generated', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const err = failure()
      const load = await open()
      load.reject(err)
      await flushPromises()

      expect(console.error).toHaveBeenCalledWith(err)
      expect(player().props('isLoading')).toBe(false)
      expect(player().props('loadingError')).toBe(
        'playlists.create_for_selection_error'
      )
    })

    it('opens without the error of an earlier generation', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const first = await open()
      first.reject(failure())
      await flushPromises()
      await close()
      const second = await open()

      expect(player().props('isLoading')).toBe(true)
      expect(player().props('loadingError')).toBe('')

      second.resolve([shot('shot-2')])
      await flushPromises()

      expect(player().props('isLoading')).toBe(false)
      expect(shownShots()).toEqual(['shot-2'])
    })

    it('keeps loading when a closed generation answers first', async () => {
      const first = await open()
      await close()
      const second = await open()
      first.resolve([shot('shot-1')])
      await flushPromises()

      expect(player().props('isLoading')).toBe(true)
      expect(shownShots()).toEqual([])

      second.resolve([shot('shot-2')])
      await flushPromises()

      expect(player().props('isLoading')).toBe(false)
      expect(shownShots()).toEqual(['shot-2'])
    })

    it('keeps the last playlist when a closed generation answers last', async () => {
      const first = await open()
      await close()
      const second = await open()
      second.resolve([shot('shot-2')])
      await flushPromises()
      first.resolve([shot('shot-1')])
      await flushPromises()

      expect(shownShots()).toEqual(['shot-2'])
    })

    // The entry map is the one of the playlist page too.
    it('leaves the playlist entries alone when a closed generation answers', async () => {
      const load = await open()
      await close()
      const commit = vi.spyOn(store, 'commit')
      load.resolve([shot('shot-1')])
      await flushPromises()

      expect(commit).not.toHaveBeenCalled()
    })

    // Its parents close the modal by unmounting it.
    it('leaves the playlist entries alone once the modal is gone', async () => {
      const load = await open()
      wrapper.unmount()
      const commit = vi.spyOn(store, 'commit')
      load.resolve([shot('shot-1')])
      await flushPromises()

      expect(commit).not.toHaveBeenCalled()
    })

    it('shows no error when a closed generation fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const err = failure()
      const first = await open()
      await close()
      const second = await open()
      second.resolve([shot('shot-2')])
      await flushPromises()
      first.reject(err)
      await flushPromises()

      expect(console.error).toHaveBeenCalledWith(err)
      expect(player().props('loadingError')).toBe('')
      expect(shownShots()).toEqual(['shot-2'])
    })
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
