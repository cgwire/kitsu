import func from '@/lib/func'
import { isPreviewFileStatus, latestPreviewFileStatus } from '@/lib/preview'
import previewsApi from '@/store/api/previews'

import {
  SET_PREVIEW_FILE_STATUS,
  FORGET_PREVIEW_FILE_STATUSES,
  RESET_ALL
} from '@/store/mutation-types'

// The ids travel in the query string.
const STATUS_CHUNK_SIZE = 50

const initialState = {
  previewFileStatusMap: new Map()
}

const state = {
  ...initialState
}

const getters = {
  previewFileStatusMap: state => state.previewFileStatusMap
}

const actions = {
  // A payload may predate the events received since: its status settles on
  // the final one the registry knows. Its ready previews only matter for the
  // ones the registry follows.
  registerPreviewFileStatuses({ commit, state }, previewFiles) {
    const statusMap = state.previewFileStatusMap
    previewFiles
      .filter(
        ({ id, status }) =>
          isPreviewFileStatus(status) &&
          (status !== 'ready' || statusMap.has(id))
      )
      .forEach(({ id, status }) => {
        commit(SET_PREVIEW_FILE_STATUS, {
          previewFileId: id,
          status: latestPreviewFileStatus(status, statusMap.get(id))
        })
      })
  },

  // Zou does not send again the events emitted while the socket was down.
  refreshProcessingPreviewFiles({ commit, state }) {
    const ids = [...state.previewFileStatusMap]
      .filter(([, status]) => status === 'processing')
      .map(([previewFileId]) => previewFileId)
    const chunks = Array.from(
      { length: Math.ceil(ids.length / STATUS_CHUNK_SIZE) },
      (_, index) =>
        ids.slice(index * STATUS_CHUNK_SIZE, (index + 1) * STATUS_CHUNK_SIZE)
    )
    return func.runPromiseMapAsSeries(chunks, async chunk => {
      const previewFiles = await previewsApi.getPreviewFileStatuses(chunk)
      previewFiles.forEach(({ id, status }) => {
        commit(SET_PREVIEW_FILE_STATUS, { previewFileId: id, status })
      })
      // Deleted or out of reach: no event will ever tell their end.
      const answeredIds = new Set(previewFiles.map(({ id }) => id))
      commit(
        FORGET_PREVIEW_FILE_STATUSES,
        chunk.filter(id => !answeredIds.has(id))
      )
    })
  }
}

const mutations = {
  [SET_PREVIEW_FILE_STATUS](state, { previewFileId, status }) {
    const statusMap = state.previewFileStatusMap
    statusMap.set(
      previewFileId,
      latestPreviewFileStatus(statusMap.get(previewFileId), status)
    )
  },

  [FORGET_PREVIEW_FILE_STATUSES](state, previewFileIds) {
    previewFileIds.forEach(previewFileId => {
      state.previewFileStatusMap.delete(previewFileId)
    })
  },

  // initialState holds the very map the session filled.
  [RESET_ALL](state) {
    state.previewFileStatusMap = new Map()
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
