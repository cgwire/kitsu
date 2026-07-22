import { ref } from 'vue'

import { useAnnotationBroadcast } from '@/composables/players/annotationBroadcast'

const makeSocket = () => ({ emit: vi.fn() })

const makeRoom = (overrides = {}) => ({
  id: 'playlist-1',
  localId: 'local-abc',
  ...overrides
})

const fakeAnnotation = {
  type: 'path',
  id: 'obj-42'
}

describe('composables/annotationBroadcast', () => {
  describe('postAnnotationAddition', () => {
    it("emits 'preview-room:add-annotation' with the room and user payload", () => {
      const socket = makeSocket()
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      postAnnotationAddition(1.234, fakeAnnotation)
      expect(socket.emit).toHaveBeenCalledWith('preview-room:add-annotation', {
        playlist_id: 'playlist-1',
        data: {
          local_id: 'local-abc',
          user_id: 'user-1',
          time: 1.234,
          obj: fakeAnnotation
        }
      })
    })
  })

  describe('postAnnotationDeletion', () => {
    it("emits 'preview-room:remove-annotation'", () => {
      const socket = makeSocket()
      const { postAnnotationDeletion } = useAnnotationBroadcast({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      postAnnotationDeletion(2, fakeAnnotation)
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:remove-annotation',
        expect.objectContaining({ playlist_id: 'playlist-1' })
      )
    })
  })

  describe('postAnnotationUpdate', () => {
    it("emits 'preview-room:update-annotation'", () => {
      const socket = makeSocket()
      const { postAnnotationUpdate } = useAnnotationBroadcast({
        room: makeRoom(),
        userId: 'user-1',
        socket
      })
      postAnnotationUpdate(0, fakeAnnotation)
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:update-annotation',
        expect.objectContaining({ playlist_id: 'playlist-1' })
      )
    })
  })

  describe('room validity', () => {
    it('skips the emit when room id is missing', () => {
      const socket = makeSocket()
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: { localId: 'local-abc' },
        userId: 'user-1',
        socket
      })
      postAnnotationAddition(1, fakeAnnotation)
      expect(socket.emit).not.toHaveBeenCalled()
    })

    it("skips the emit when room id is 'temp'", () => {
      const socket = makeSocket()
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: makeRoom({ id: 'temp' }),
        userId: 'user-1',
        socket
      })
      postAnnotationAddition(1, fakeAnnotation)
      expect(socket.emit).not.toHaveBeenCalled()
    })

    it('skips the emit when room itself is null', () => {
      const socket = makeSocket()
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: null,
        userId: 'user-1',
        socket
      })
      postAnnotationAddition(1, fakeAnnotation)
      expect(socket.emit).not.toHaveBeenCalled()
    })
  })

  describe('reactive inputs', () => {
    it('accepts a ref-wrapped room and reads its current value on each call', () => {
      const socket = makeSocket()
      const roomRef = ref(makeRoom({ id: 'first' }))
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: roomRef,
        userId: 'user-1',
        socket
      })
      postAnnotationAddition(1, fakeAnnotation)
      roomRef.value = makeRoom({ id: 'second' })
      postAnnotationAddition(2, fakeAnnotation)
      expect(socket.emit).toHaveBeenNthCalledWith(
        1,
        'preview-room:add-annotation',
        expect.objectContaining({ playlist_id: 'first' })
      )
      expect(socket.emit).toHaveBeenNthCalledWith(
        2,
        'preview-room:add-annotation',
        expect.objectContaining({ playlist_id: 'second' })
      )
    })

    it('accepts a ref-wrapped userId', () => {
      const socket = makeSocket()
      const userIdRef = ref('user-original')
      const { postAnnotationAddition } = useAnnotationBroadcast({
        room: makeRoom(),
        userId: userIdRef,
        socket
      })
      userIdRef.value = 'user-rotated'
      postAnnotationAddition(1, fakeAnnotation)
      expect(socket.emit).toHaveBeenCalledWith(
        'preview-room:add-annotation',
        expect.objectContaining({
          data: expect.objectContaining({ user_id: 'user-rotated' })
        })
      )
    })
  })
})
