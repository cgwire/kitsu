/*
 * Composable for relaying annotation changes over the preview-room
 * socket to other participants. Returns three callbacks designed to
 * be plugged into useAnnotation's postAnnotationAddition / Deletion /
 * Update options.
 *
 * The callbacks emit nothing when the current room has no valid id
 * (which is also the case when collaborative review is disabled), so
 * single-user playback paths can plug them in unconditionally.
 *
 * The previous mixin sent `local_id: this.localId` for the three
 * annotation events — `this.localId` was never declared, so the value
 * landed on the wire as `undefined` and receivers couldn't tell the
 * broadcast was their own. We now read `room.localId` like every
 * other preview-room event does, so participants no longer echo
 * their own annotations back to themselves.
 */
import { unref } from 'vue'

const isValidRoomId = room => Boolean(room?.id) && room.id !== 'temp'

/**
 * @param {Object} options
 * @param {import('vue').Ref<Object>|Object} options.room - reactive
 *   ref or plain reactive object holding the preview room. The
 *   composable reads `id` and `localId` from it on every emit.
 * @param {import('vue').Ref<string>|string} options.userId - the
 *   current user id (ref, computed, or plain string).
 * @param {Object} options.socket - the socket.io client instance.
 */
export const useAnnotationBroadcast = ({ room, userId, socket }) => {
  const emitAnnotationEvent = (eventName, time, serializedObj) => {
    const currentRoom = unref(room)
    if (!isValidRoomId(currentRoom)) return
    socket.emit(eventName, {
      playlist_id: currentRoom.id,
      data: {
        local_id: currentRoom.localId,
        user_id: unref(userId),
        time,
        obj: serializedObj
      }
    })
  }

  return {
    postAnnotationAddition: (time, obj) =>
      emitAnnotationEvent('preview-room:add-annotation', time, obj),
    postAnnotationDeletion: (time, obj) =>
      emitAnnotationEvent('preview-room:remove-annotation', time, obj),
    postAnnotationUpdate: (time, obj) =>
      emitAnnotationEvent('preview-update-annotation', time, obj)
  }
}
