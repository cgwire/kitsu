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
  'preview-update-annotation'
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
          local_id: 'local-abc',
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

    it("'preview-update-annotation' calls updateObjectInCanvas for remote events", () => {
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
      const handler = handlerFor(socket, 'preview-update-annotation')
      handler({
        time: 1,
        data: { local_id: 'other', obj: { id: 'x' } }
      })
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
})
