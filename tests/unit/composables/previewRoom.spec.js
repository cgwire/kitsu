import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'

import { usePreviewRoom } from '@/composables/previewRoom'

const SOCKET_EVENTS = [
  'preview-room:room-people-updated',
  'preview-room:room-updated',
  'preview-room:panzoom-changed',
  'preview-room:comparison-panzoom-changed',
  'preview-room:add-annotation',
  'preview-room:remove-annotation',
  'preview-room:update-annotation'
]

const makeSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
})

const makeRoom = (overrides = {}) =>
  reactive({
    id: 'playlist-1',
    localId: 'local-abc',
    people: ['user-1'],
    newComer: false,
    ...overrides
  })

/**
 * Mount the composable inside a tiny host component so onMounted /
 * onBeforeUnmount fire. Returns the wrapper plus the composable API
 * captured during setup().
 */
const mountWithRoom = (options = {}) => {
  let api
  const TestComponent = defineComponent({
    setup() {
      api = usePreviewRoom(options)
      return () => null
    }
  })
  const wrapper = mount(TestComponent)
  return { wrapper, api }
}

describe('composables/previewRoom', () => {
  describe('joinedRoom', () => {
    it('returns the matching user id when the user is in the room', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-1', 'user-2'] }),
        userId: 'user-1',
        socket
      })
      expect(api.joinedRoom.value).toBe('user-1')
      wrapper.unmount()
    })

    it('returns undefined when the user is not in the room', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-2'] }),
        userId: 'user-1',
        socket
      })
      expect(api.joinedRoom.value).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe('openRoom', () => {
    it("emits 'preview-room:open-playlist'", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      api.openRoom('explicit-id')
      expect(socket.emit).toHaveBeenCalledWith('preview-room:open-playlist', {
        playlist_id: 'explicit-id',
        user_id: 'user-1'
      })
      wrapper.unmount()
    })

    it('falls back to the room id when no playlistId is passed', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      api.openRoom()
      expect(socket.emit).toHaveBeenCalledWith('preview-room:open-playlist', {
        playlist_id: 'playlist-1',
        user_id: 'user-1'
      })
      wrapper.unmount()
    })
  })

  describe('closeRoom', () => {
    it("emits 'preview-room:close-playlist'", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      api.closeRoom('playlist-9')
      expect(socket.emit).toHaveBeenCalledWith('preview-room:close-playlist', {
        playlist_id: 'playlist-9',
        user_id: 'user-1'
      })
      wrapper.unmount()
    })
  })

  describe('joinRoom', () => {
    it("emits 'preview-room:join' with current player state", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket,
        isPlaying: ref(true),
        playingEntityIndex: ref(2),
        currentEntity: ref({ id: 'entity-7' }),
        currentPreview: ref({ id: 'preview-3' }),
        currentPreviewIndex: ref(1),
        currentFrame: ref(42),
        speed: ref(3),
        handleIn: ref(10),
        handleOut: ref(50)
      })
      api.joinRoom()
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:join',
        expect.objectContaining({
          user_id: 'user-1',
          playlist_id: 'playlist-1',
          is_playing: true,
          current_entity_id: 'entity-7',
          current_entity_index: 2,
          current_preview_file_id: 'preview-3',
          current_preview_file_index: 1,
          current_frame: 42,
          speed: 3,
          handle_in: 10,
          handle_out: 50,
          comparing: expect.any(Object)
        })
      )
      wrapper.unmount()
    })

    it('does not emit when room id is invalid', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ id: 'temp' }),
        userId: 'user-1',
        socket
      })
      api.joinRoom()
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('leaveRoom', () => {
    it("emits 'preview-room:leave'", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      api.leaveRoom()
      expect(socket.emit).toHaveBeenCalledWith('preview-room:leave', {
        user_id: 'user-1',
        playlist_id: 'playlist-1'
      })
      wrapper.unmount()
    })

    it('uses an explicit playlistId when provided', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      api.leaveRoom('other-list')
      expect(socket.emit).toHaveBeenCalledWith('preview-room:leave', {
        user_id: 'user-1',
        playlist_id: 'other-list'
      })
      wrapper.unmount()
    })

    it('is a no-op when userId is falsy', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom(),
        userId: '',
        socket
      })
      api.leaveRoom()
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('updateRoomStatus', () => {
    it("emits 'preview-room:room-updated' with local_id and player state", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        isPlaying: ref(false),
        currentFrame: ref(7),
        speed: ref(2)
      })
      api.updateRoomStatus('prev-preview-id')
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:room-updated',
        expect.objectContaining({
          user_id: 'user-1',
          // The room sequence rides inside local_id (see lib/players/roomSync)
          local_id: expect.stringMatching(/^local-abc#\d+$/),
          room_seq: expect.any(Number),
          playlist_id: 'playlist-1',
          previous_preview_file_id: 'prev-preview-id',
          is_playing: false,
          current_frame: 7,
          speed: 2
        })
      )
      wrapper.unmount()
    })

    it('does not emit when the user has not joined the room', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['someone-else'] }),
        userId: 'user-1',
        socket
      })
      api.updateRoomStatus()
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('postPanZoomChanged', () => {
    it("emits 'preview-room:panzoom-changed' with the local_id echo guard", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket
      })
      api.postPanZoomChanged(10, 20, 1.5)
      expect(socket.emit).toHaveBeenCalledWith('preview-room:panzoom-changed', {
        playlist_id: 'playlist-1',
        data: {
          local_id: 'local-abc',
          user_id: 'user-1',
          x: 10,
          y: 20,
          zoom: 1.5
        }
      })
      wrapper.unmount()
    })

    it('is a no-op when not joined', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: [] }),
        userId: 'user-1',
        socket
      })
      api.postPanZoomChanged(0, 0, 1)
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('postComparisonPanZoomChanged', () => {
    it("emits 'preview-room:comparison-panzoom-changed'", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket
      })
      api.postComparisonPanZoomChanged(5, 6, 2)
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:comparison-panzoom-changed',
        {
          playlist_id: 'playlist-1',
          data: {
            local_id: 'local-abc',
            user_id: 'user-1',
            x: 5,
            y: 6,
            zoom: 2
          }
        }
      )
      wrapper.unmount()
    })
  })

  describe('room validity guards', () => {
    it('updateRoomStatus skips when room id is missing', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ id: undefined }),
        userId: 'user-1',
        socket
      })
      api.updateRoomStatus()
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("postPanZoomChanged skips when room id is 'temp'", () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ id: 'temp', people: ['user-1'] }),
        userId: 'user-1',
        socket
      })
      api.postPanZoomChanged(1, 2, 3)
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('joinRoom skips when room is null', () => {
      const socket = makeSocket()
      const { wrapper, api } = mountWithRoom({
        room: null,
        userId: 'user-1',
        socket
      })
      api.joinRoom()
      expect(socket.emit).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('socket lifecycle', () => {
    it('registers all preview-room handlers on mount', () => {
      const socket = makeSocket()
      const { wrapper } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      expect(socket.on).toHaveBeenCalledTimes(SOCKET_EVENTS.length)
      SOCKET_EVENTS.forEach(event => {
        expect(socket.on).toHaveBeenCalledWith(event, expect.any(Function))
      })
      wrapper.unmount()
    })

    it('unregisters the same handler references on unmount', () => {
      const socket = makeSocket()
      const { wrapper } = mountWithRoom({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      // Capture handler refs registered with socket.on(...)
      const registered = new Map(socket.on.mock.calls)
      wrapper.unmount()
      expect(socket.off).toHaveBeenCalledTimes(SOCKET_EVENTS.length)
      SOCKET_EVENTS.forEach(event => {
        expect(socket.off).toHaveBeenCalledWith(event, registered.get(event))
      })
    })
  })

  describe('loadRoomCurrentState', () => {
    const makeEntity = () => ({
      id: 'entity-7',
      preview_file_id: 'preview-old',
      preview_files: {
        'task-type-1': [
          { id: 'preview-old', task_id: 'task-1' },
          { id: 'preview-new', task_id: 'task-1' }
        ]
      }
    })

    const mountPlayerState = (overrides = {}) => {
      const socket = makeSocket()
      const entity = makeEntity()
      const changePreviewFile = vi.fn()
      const currentPreviewIndex = ref(0)
      const { wrapper, api } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        playingEntityIndex: ref(0),
        currentEntity: ref(entity),
        currentPreview: ref({ id: 'preview-old' }),
        currentPreviewIndex,
        taskMap: ref(
          new Map([['task-1', { id: 'task-1', task_type_id: 'task-type-1' }]])
        ),
        findEntity: () => null,
        findEntityIndex: () => 0,
        changePreviewFile,
        ...overrides
      })
      return { wrapper, api, entity, changePreviewFile, currentPreviewIndex }
    }

    it('applies a remote version change without previous_preview_file_id', () => {
      const { wrapper, api, entity, changePreviewFile } = mountPlayerState()
      api.loadRoomCurrentState({
        is_playing: false,
        current_entity_id: 'entity-7',
        current_entity_index: 0,
        current_preview_file_id: 'preview-new',
        current_preview_file_index: 0
      })
      expect(changePreviewFile).toHaveBeenCalledWith(
        entity,
        { id: 'preview-new', task_id: 'task-1' },
        'task-type-1'
      )
      wrapper.unmount()
    })

    it('applies a remote position change within a multi-image preview', () => {
      const { wrapper, api, changePreviewFile, currentPreviewIndex } =
        mountPlayerState()
      api.loadRoomCurrentState({
        is_playing: false,
        current_entity_id: 'entity-7',
        current_entity_index: 0,
        current_preview_file_id: 'sub-preview-2',
        current_preview_file_index: 2
      })
      expect(changePreviewFile).not.toHaveBeenCalled()
      expect(currentPreviewIndex.value).toBe(2)
      wrapper.unmount()
    })

    it('goes back to the first image without treating it as a version change', () => {
      const { wrapper, api, changePreviewFile, currentPreviewIndex } =
        mountPlayerState({
          currentPreview: ref({ id: 'sub-preview-2' }),
          currentEntity: ref({
            ...makeEntity(),
            preview_file_id: 'preview-main'
          })
        })
      currentPreviewIndex.value = 2
      api.loadRoomCurrentState({
        is_playing: false,
        current_entity_id: 'entity-7',
        current_entity_index: 0,
        current_preview_file_id: 'preview-main',
        current_preview_file_index: 0
      })
      expect(changePreviewFile).not.toHaveBeenCalled()
      expect(currentPreviewIndex.value).toBe(0)
      wrapper.unmount()
    })

    it('ignores a version change for an unknown entity', () => {
      const { wrapper, api, changePreviewFile } = mountPlayerState()
      api.loadRoomCurrentState({
        is_playing: false,
        current_entity_id: 'entity-unknown',
        current_entity_index: 0,
        current_preview_file_id: 'preview-new',
        current_preview_file_index: 0
      })
      expect(changePreviewFile).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('incoming event echo guard', () => {
    /**
     * Helper: mount, grab the registered handler for `event`, return it.
     */
    const handlerFor = (socket, event) => {
      const call = socket.on.mock.calls.find(([name]) => name === event)
      return call?.[1]
    }

    it("'preview-room:room-updated' ignores events from our own localId", () => {
      const socket = makeSocket()
      const pause = vi.fn()
      const play = vi.fn()
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        pause,
        play
      })
      const handler = handlerFor(socket, 'preview-room:room-updated')
      handler({ local_id: 'local-abc', is_playing: true })
      expect(pause).not.toHaveBeenCalled()
      expect(play).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("'preview-room:panzoom-changed' ignores own broadcasts", () => {
      const socket = makeSocket()
      const setPanZoom = vi.fn()
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        setPanZoom
      })
      const handler = handlerFor(socket, 'preview-room:panzoom-changed')
      handler({
        local_id: 'local-abc',
        data: { x: 1, y: 2, zoom: 3 }
      })
      expect(setPanZoom).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("'preview-room:panzoom-changed' applies remote broadcasts", () => {
      const socket = makeSocket()
      const setPanZoom = vi.fn()
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        setPanZoom
      })
      const handler = handlerFor(socket, 'preview-room:panzoom-changed')
      handler({
        local_id: 'other-localId',
        data: { x: 1, y: 2, zoom: 3 }
      })
      expect(setPanZoom).toHaveBeenCalledWith(1, 2, 3)
      wrapper.unmount()
    })

    it("'preview-room:add-annotation' ignores own broadcasts (data.local_id)", () => {
      const socket = makeSocket()
      const addObjectToCanvas = vi.fn(() => Promise.resolve(null))
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        addObjectToCanvas
      })
      const handler = handlerFor(socket, 'preview-room:add-annotation')
      handler({
        time: 0,
        data: { local_id: 'local-abc', obj: { id: 'x' } }
      })
      expect(addObjectToCanvas).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it("'preview-room:remove-annotation' calls removeObjectFromCanvas for remote events", () => {
      const socket = makeSocket()
      const removeObjectFromCanvas = vi.fn()
      const getObjectById = vi.fn(() => ({ id: 'x' }))
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        removeObjectFromCanvas,
        getObjectById
      })
      const handler = handlerFor(socket, 'preview-room:remove-annotation')
      handler({
        data: { local_id: 'other', obj: { id: 'x' } }
      })
      expect(removeObjectFromCanvas).toHaveBeenCalledWith({ id: 'x' })
      wrapper.unmount()
    })

    it("'preview-room:update-annotation' calls updateObjectInCanvas for remote events", () => {
      const socket = makeSocket()
      const updateObjectInCanvas = vi.fn()
      const getAnnotation = vi.fn(() => ({ id: 'a' }))
      const { wrapper } = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        updateObjectInCanvas,
        getAnnotation
      })
      const handler = handlerFor(socket, 'preview-room:update-annotation')
      handler({
        data: { local_id: 'other', obj: { id: 'x' }, time: 1 }
      })
      expect(getAnnotation).toHaveBeenCalledWith(1)
      expect(updateObjectInCanvas).toHaveBeenCalledWith(
        { id: 'a' },
        { id: 'x' }
      )
      wrapper.unmount()
    })

    it("'preview-room:room-people-updated' updates room.people and clears newComer", () => {
      const socket = makeSocket()
      const room = makeRoom({ people: [], newComer: true })
      const { wrapper } = mountWithRoom({
        room,
        userId: 'user-1',
        socket
      })
      const handler = handlerFor(socket, 'preview-room:room-people-updated')
      handler({ people: ['user-1', 'user-2'] })
      expect(room.people).toEqual(['user-1', 'user-2'])
      expect(room.newComer).toBe(false)
      wrapper.unmount()
    })
  })

  describe('event storm guards (#1574)', () => {
    const handlerFor = (socket, event) => {
      const call = socket.on.mock.calls.find(([name]) => name === event)
      return call?.[1]
    }

    const roomUpdateCount = socket =>
      socket.emit.mock.calls.filter(
        ([event]) => event === 'preview-room:room-updated'
      ).length

    const mountPlayer = (extra = {}) => {
      const socket = makeSocket()
      const playEntity = vi.fn()
      const mounted = mountWithRoom({
        room: makeRoom({ people: ['user-1'] }),
        userId: 'user-1',
        socket,
        playEntity,
        ...extra
      })
      const handler = handlerFor(socket, 'preview-room:room-updated')
      return { ...mounted, socket, playEntity, handler }
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('drops stale incoming updates (sequence behind the last applied)', () => {
      const { wrapper, playEntity, handler } = mountPlayer()
      handler({
        local_id: 'other#2000',
        is_playing: false,
        current_entity_index: 2
      })
      expect(playEntity).toHaveBeenCalledTimes(1)
      handler({
        local_id: 'other#1000',
        is_playing: false,
        current_entity_index: 5
      })
      expect(playEntity).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('applies updates without a sequence (older clients)', () => {
      const { wrapper, playEntity, handler } = mountPlayer()
      handler({ local_id: 'other', is_playing: false, current_entity_index: 2 })
      handler({ local_id: 'other', is_playing: false, current_entity_index: 5 })
      expect(playEntity).toHaveBeenCalledTimes(2)
      wrapper.unmount()
    })

    it("drops incoming updates older than the user's own last action", () => {
      const { wrapper, api, playEntity, handler } = mountPlayer()
      api.updateRoomStatus()
      handler({
        local_id: `other#${Date.now() - 1000}`,
        is_playing: false,
        current_entity_index: 2
      })
      expect(playEntity).not.toHaveBeenCalled()
      handler({
        local_id: `other#${Date.now() + 1000}`,
        is_playing: false,
        current_entity_index: 3
      })
      expect(playEntity).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    })

    it('never re-broadcasts a state just applied from the network', () => {
      const { wrapper, api, socket, handler } = mountPlayer()
      handler({
        local_id: `other#${Date.now()}`,
        is_playing: false,
        current_entity_index: 2
      })
      socket.emit.mockClear()
      // A watcher on an applied ref echoing the state back
      api.updateRoomStatus()
      expect(roomUpdateCount(socket)).toBe(0)
      vi.advanceTimersByTime(600)
      api.updateRoomStatus()
      expect(roomUpdateCount(socket)).toBe(1)
      wrapper.unmount()
    })

    it('collapses a burst of updates into a leading and a trailing emit', () => {
      const { wrapper, api, socket } = mountPlayer()
      api.updateRoomStatus()
      api.updateRoomStatus()
      api.updateRoomStatus()
      expect(roomUpdateCount(socket)).toBe(1)
      vi.advanceTimersByTime(250)
      expect(roomUpdateCount(socket)).toBe(2)
      vi.advanceTimersByTime(1000)
      expect(roomUpdateCount(socket)).toBe(2)
      wrapper.unmount()
    })
  })
})
