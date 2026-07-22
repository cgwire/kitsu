// Socket event names shared between the preview-room composables
// (previewRoom.js and annotationBroadcast.js): one definition, no
// stringly-typed duplication.
export const PREVIEW_ROOM_EVENTS = {
  join: 'preview-room:join',
  leave: 'preview-room:leave',
  openPlaylist: 'preview-room:open-playlist',
  closePlaylist: 'preview-room:close-playlist',
  roomUpdated: 'preview-room:room-updated',
  roomPeopleUpdated: 'preview-room:room-people-updated',
  addAnnotation: 'preview-room:add-annotation',
  updateAnnotation: 'preview-room:update-annotation',
  removeAnnotation: 'preview-room:remove-annotation',
  panzoomChanged: 'preview-room:panzoom-changed',
  comparisonPanzoomChanged: 'preview-room:comparison-panzoom-changed'
}

// 'temp' is the placeholder room id used before a real playlist id is
// known. isValidRoomId() is shared the same way as the events above: it
// used to be redeclared verbatim in previewRoom.js, annotationBroadcast.js
// and PlaylistPlayer.vue.
export const TEMP_ROOM_ID = 'temp'

export const isValidRoomId = room =>
  Boolean(room?.id) && room.id !== TEMP_ROOM_ID
