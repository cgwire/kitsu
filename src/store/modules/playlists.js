import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'
import playlistsApi from '@/store/api/playlists'
import { sortByDate } from '@/lib/sorting'
import { removeModelFromList, updateModelFromList } from '@/lib/models'

import {
  ADD_PLAYLISTS,
  LOAD_PLAYLISTS_END,
  LOAD_PLAYLIST_START,
  LOAD_PLAYLIST_END,
  EDIT_PLAYLIST_START,
  EDIT_PLAYLIST_ERROR,
  EDIT_PLAYLIST_END,
  DELETE_PLAYLIST_START,
  DELETE_PLAYLIST_ERROR,
  DELETE_PLAYLIST_END,
  CHANGE_PLAYLIST_PREVIEW,
  CHANGE_PLAYLIST_ORDER,
  CHANGE_PLAYLIST_TYPE,
  ADD_ENTITY_TO_PLAYLIST,
  REMOVE_ENTITY_FROM_PLAYLIST,
  LOAD_ENTITY_PREVIEW_FILES_END,
  ADD_NEW_JOB,
  MARK_JOB_AS_DONE,
  REMOVE_BUILD_JOB,
  SET_PLAYLIST_ENTRY_MAP,
  UPDATE_PREVIEW_ANNOTATION,
  UPDATE_PREVIEW_VALIDATION_STATUS,
  RESET_ALL
} from '@/store/mutation-types'

const helpers = {
  getEntityPreviewFile(entity, previewFileList, taskTypeId) {
    const previewFiles = taskTypeId
      ? previewFileList.filter(p => p.task_type_id === taskTypeId)
      : previewFileList

    const previewFile = previewFiles.find(
      file => !state.playlistEntryMap.has(`${entity.id}-${file.id}`)
    )

    if (previewFile) {
      state.playlistEntryMap.set(`${entity.id}-${previewFile.id}`, previewFile)
    }

    return previewFile || null
  }
}

const initialState = {
  playlists: [],
  playlistMap: new Map(),
  previewFileMap: new Map(),
  previewFileEntityMap: new Map(),
  playlistEntryMap: new Map()
}

const state = { ...initialState }

const getters = {
  playlists: state => state.playlists,
  playlistMap: state => state.playlistMap,
  playlistEntryMap: state => state.playlistEntryMap,
  previewFileMap: state => state.previewFileMap
}

const actions = {
  loadPlaylists(
    { commit, rootGetters },
    { sortBy = 'updated_at', page = 1, taskTypeId }
  ) {
    const production = rootGetters.currentProduction
    let episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow

    if (isTVShow && !episode) return Promise.resolve([])
    if (!isTVShow) episode = null

    commit(LOAD_PLAYLISTS_END, [])
    return playlistsApi
      .getPlaylists(production, episode, taskTypeId, sortBy, page)
      .then(playlists => {
        commit(LOAD_PLAYLISTS_END, playlists)
        return playlists
      })
  },

  loadMorePlaylists(
    { commit, rootGetters },
    { sortBy = 'updated_at', page = 1, taskTypeId }
  ) {
    const production = rootGetters.currentProduction
    let episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow

    if (state.playlists.length === 0) return Promise.resolve([])
    if (isTVShow && !episode) return Promise.resolve([])
    if (!isTVShow) episode = null
    return playlistsApi
      .getPlaylists(production, episode, taskTypeId, sortBy, page)
      .then(playlists => {
        commit(ADD_PLAYLISTS, playlists)
        return playlists
      })
  },

  loadPlaylist({ commit, rootGetters }, playlist) {
    const currentProduction = rootGetters.currentProduction
    commit(LOAD_PLAYLIST_START)
    return playlistsApi
      .getPlaylist(currentProduction, playlist)
      .then(playlist => {
        commit(LOAD_PLAYLIST_END, playlist)
        return playlist
      })
      .catch(err => {
        console.error(err)
        return {}
      })
  },

  async refreshPlaylist({ commit, rootGetters }, id) {
    const currentProduction = rootGetters.currentProduction
    const playlist = await playlistsApi.getPlaylist(currentProduction, { id })
    commit(EDIT_PLAYLIST_END, playlist)
    return playlist
  },

  loadEntityPreviewFiles({ commit }, entity) {
    return playlistsApi.getEntityPreviewFiles(entity)
  },

  async newPlaylist({ commit }, data) {
    commit(EDIT_PLAYLIST_START, data)
    const playlist = await playlistsApi.newPlaylist(data)
    commit(EDIT_PLAYLIST_END, playlist)
    return playlist
  },

  async editPlaylist({ commit, rootGetters }, { data }) {
    if (!rootGetters.isCurrentUserClient) {
      commit(EDIT_PLAYLIST_START)
      try {
        const playlist = await playlistsApi.updatePlaylist(data)
        commit(EDIT_PLAYLIST_END, playlist)
        return playlist
      } catch (err) {
        console.error(err)
        commit(EDIT_PLAYLIST_ERROR)
        return null
      }
    }
  },

  async deletePlaylist({ commit }, { playlist }) {
    commit(DELETE_PLAYLIST_START)
    await playlistsApi.deletePlaylist(playlist)
    commit(DELETE_PLAYLIST_END, playlist)
    return playlist
  },

  async pushEntityToPlaylist(
    { commit, dispatch },
    { playlist, entity, previewFiles, task, entityMap }
  ) {
    commit(LOAD_ENTITY_PREVIEW_FILES_END, { playlist, entity, previewFiles })
    if (!entity.preview_file_id && entityMap[entity.id]) {
      return null
    } else {
      commit(ADD_ENTITY_TO_PLAYLIST, { playlist, entity, task })
      await dispatch('editPlaylist', { data: playlist })
      return entity
    }
  },

  removeEntityPreviewFromPlaylist(
    { commit, dispatch },
    { playlist, entity, previewFileId }
  ) {
    commit(REMOVE_ENTITY_FROM_PLAYLIST, { playlist, entity, previewFileId })
    dispatch('editPlaylist', { data: playlist })
  },

  changePlaylistOrder({ commit, dispatch }, { playlist, info }) {
    if (!playlist) return null
    commit(CHANGE_PLAYLIST_ORDER, { playlist, info })
    return dispatch('editPlaylist', { data: playlist })
  },

  changePlaylistPreview(
    { commit, dispatch },
    { playlist, entity, previewFileId, previousPreviewFileId, remote = true }
  ) {
    commit(CHANGE_PLAYLIST_PREVIEW, {
      playlist,
      entityId: entity.id,
      previewFileId,
      previousPreviewFileId
    })

    if (remote) {
      return dispatch('editPlaylist', { data: playlist })
    } else {
      return Promise.resolve()
    }
  },

  removeBuildJob({ commit }, job) {
    commit(REMOVE_BUILD_JOB, job)
    return playlistsApi.deleteBuildJob(job)
  },

  removeBuildJobFromList({ commit }, job) {
    commit(REMOVE_BUILD_JOB, job)
  },

  addNewBuildJob({ commit }, job) {
    commit(ADD_NEW_JOB, job)
  },

  markBuildJobAsDone({ commit }, job) {
    commit(MARK_JOB_AS_DONE, job)
  },

  runPlaylistBuild({ commit }, { playlist, full }) {
    return playlistsApi.runPlaylistBuild(playlist, full)
  },

  changePlaylistType({ commit, dispatch }, { playlist, taskTypeId }) {
    commit(CHANGE_PLAYLIST_TYPE, { playlist, taskTypeId })
    return dispatch('editPlaylist', { data: playlist })
  },

  loadTempPlaylist({ commit, dispatch, rootGetters }, { taskIds, sort }) {
    const production = rootGetters.currentProduction
    return playlistsApi.loadTempPlaylist(production, taskIds, sort)
  },

  getRunningPreviewFiles(_, { limit, lastPreviewFileId = null }) {
    return playlistsApi.getRunningPreviewFiles(limit, lastPreviewFileId)
  },

  markPreviewFileAsBroken(utils, previewFileId) {
    return playlistsApi.markPreviewFileAsBroken(previewFileId)
  },

  updatePreviewFileValidationStatus({ commit }, { previewFile, status }) {
    commit(UPDATE_PREVIEW_VALIDATION_STATUS, { previewFile, status })
    return playlistsApi.updatePreviewFileValidationStatus(previewFile, status)
  },

  notifyClients({ commit }, { playlist, studioId, departmentId }) {
    return playlistsApi.notifyClients(playlist, studioId, departmentId)
  }
}

const mutations = {
  [LOAD_PLAYLISTS_END](state, playlists) {
    state.playlists = playlists
    state.playlistMap = new Map()
    playlists.forEach(playlist => {
      if (!playlist.entities) playlist.entities = []
      state.playlistMap.set(playlist.id, playlist)
    })
  },

  [LOAD_PLAYLIST_START](state) {},

  [LOAD_PLAYLIST_END](state, playlist) {
    state.playlistMap.get(playlist.id).build_jobs = playlist.build_jobs
    state.previewFileMap.clear()
    state.previewFileEntityMap.clear()
    state.playlistEntryMap.clear()
    if (playlist.shots) {
      playlist.shots.forEach(entity => {
        state.previewFileEntityMap.set(entity.preview_file_id, entity)
        const previewFileGroups = Object.values(entity.preview_files)
        previewFileGroups.forEach(previewFiles => {
          previewFiles.forEach(previewFile => {
            state.previewFileMap.set(previewFile.id, previewFile)
          })
        })
        const key = `${entity.entity_id}-${entity.preview_file_id}`
        state.playlistEntryMap.set(key, entity)
      })
    }
  },

  [UPDATE_PREVIEW_ANNOTATION](state, { taskId, preview, annotations }) {
    const previewFile = state.previewFileMap.get(preview.id)
    const entity = state.previewFileEntityMap.get(preview.id)
    if (previewFile) {
      previewFile.annotations = annotations
    }
    if (entity) {
      entity.preview_file_annotations = annotations
    }
  },

  [UPDATE_PREVIEW_VALIDATION_STATUS](state, { previewFile, status }) {
    previewFile.validation_status = status
  },

  [EDIT_PLAYLIST_START](state, data) {},

  [EDIT_PLAYLIST_ERROR](state) {},

  [EDIT_PLAYLIST_END](state, newPlaylist) {
    const playlist = state.playlistMap.get(newPlaylist.id)
    if (playlist && playlist.id) {
      Object.assign(playlist, newPlaylist)
    } else {
      state.playlists = [newPlaylist].concat(state.playlists)
      state.playlistMap.set(newPlaylist.id, newPlaylist)
    }
  },

  [DELETE_PLAYLIST_START](state) {},
  [DELETE_PLAYLIST_ERROR](state) {},
  [DELETE_PLAYLIST_END](state, playlistToDelete) {
    state.playlists = removeModelFromList(state.playlists, playlistToDelete)
    state.playlistMap.delete(playlistToDelete.id)
  },

  [LOAD_ENTITY_PREVIEW_FILES_END](state, { playlist, entity, previewFiles }) {
    let previewFileList = []
    Object.keys(previewFiles).forEach(taskTypeId => {
      previewFiles[taskTypeId].forEach(previewFile => {
        previewFile.task_type_id = taskTypeId
        previewFileList.push(previewFile)
      })
    })
    previewFileList = sortByDate(previewFileList)

    // We get the latest preview file uploaded
    if (previewFileList.length > 0) {
      const preview = helpers.getEntityPreviewFile(
        entity,
        previewFileList,
        playlist.task_type_id
      )
      if (preview) {
        entity.preview_file_id = preview.id
        entity.preview_file_extension = preview.extension
        entity.preview_file_revision = preview.revision
        entity.preview_file_width = preview.width
        entity.preview_file_height = preview.height
        entity.preview_file_duration = preview.duration
        entity.preview_file_annotations = preview.annotations
        entity.preview_file_task_id = preview.task_id
      } else {
        entity.preview_file_id = null
      }
    }
    entity.preview_files = previewFiles
  },

  [ADD_ENTITY_TO_PLAYLIST](state, { playlist, entity }) {
    if (!playlist.shots) playlist.shots = []

    playlist.shots.push({
      entity_id: entity.id,
      preview_file_task_id: entity.preview_file_task_id,
      preview_file_id: entity.preview_file_id,
      preview_file_extension: entity.preview_file_extension,
      preview_file_width: entity.preview_file_width,
      preview_file_height: entity.preview_file_height,
      preview_file_duration: entity.preview_file_duration,
      preview_file_revision: entity.preview_file_revision,
      preview_file_annotations: entity.preview_file_annotations,
      preview_files: entity.preview_files,
      preview_nb_frames: entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE
    })
  },

  [REMOVE_ENTITY_FROM_PLAYLIST](state, { playlist, entity, previewFileId }) {
    if (!playlist.shots) playlist.shots = []
    const entityPlaylistToDeleteIndex = playlist.shots.findIndex(
      entityPlaylist =>
        entityPlaylist.entity_id === entity.id &&
        entityPlaylist.preview_file_id === previewFileId
    )
    if (entityPlaylistToDeleteIndex >= 0) {
      playlist.shots.splice(entityPlaylistToDeleteIndex, 1)
      state.playlistEntryMap.delete(`${entity.id}-${previewFileId}`)
    }
  },

  [CHANGE_PLAYLIST_ORDER](state, { playlist, info }) {
    const entityToMove = playlist.shots.find(
      entityPlaylist =>
        entityPlaylist.entity_id === info.after.entity_id &&
        entityPlaylist.preview_file_id === info.after.preview_file_id
    )
    const entityToMoveIndex = playlist.shots.findIndex(
      entityPlaylist =>
        entityPlaylist.entity_id === info.after.entity_id &&
        entityPlaylist.preview_file_id === info.after.preview_file_id
    )
    let targetShotIndex = playlist.shots.findIndex(
      entityPlaylist =>
        entityPlaylist.entity_id === info.before.entity_id &&
        entityPlaylist.preview_file_id === info.before.preview_file_id
    )
    if (entityToMoveIndex >= 0 && targetShotIndex >= 0) {
      const tmpShots = [...playlist.shots]
      tmpShots.splice(entityToMoveIndex, 1)
      if (entityToMoveIndex > targetShotIndex) targetShotIndex++
      tmpShots.splice(targetShotIndex, 0, entityToMove)
      playlist.shots = tmpShots
    }
  },

  [CHANGE_PLAYLIST_PREVIEW](
    state,
    { playlist, entityId, previewFileId, previousPreviewFileId }
  ) {
    let entityToChange = playlist.shots.find(
      e =>
        e.entity_id === entityId && e.preview_file_id === previousPreviewFileId
    )
    if (!entityToChange) {
      entityToChange = playlist.shots.find(
        e => e.id === entityId && e.preview_file_id === previousPreviewFileId
      )
    }
    state.playlistEntryMap.delete(`${entityId}-${previousPreviewFileId}`)
    if (entityToChange) {
      state.playlistEntryMap.set(`${entityId}-${previewFileId}`, entityToChange)
      entityToChange.preview_file_id = previewFileId
    }
  },

  [ADD_NEW_JOB](state, job) {
    const playlist = state.playlistMap.get(job.playlist_id)
    playlist.build_jobs = [
      {
        id: job.build_job_id,
        created_at: job.created_at,
        status: 'running',
        playlist_id: playlist.id
      }
    ].concat(playlist.build_jobs)
  },

  [MARK_JOB_AS_DONE](state, job) {
    const playlist = state.playlistMap.get(job.playlist_id)
    updateModelFromList(playlist.build_jobs, {
      id: job.build_job_id,
      status: 'succeeded'
    })
  },

  [REMOVE_BUILD_JOB](state, job) {
    const playlist = state.playlistMap.get(job.playlist_id)
    playlist.build_jobs = removeModelFromList(playlist.build_jobs, job)
  },

  [CHANGE_PLAYLIST_TYPE](state, { playlist, taskTypeId }) {
    if (playlist) {
      playlist.shots.forEach(entity => {
        if (entity.preview_files[taskTypeId]) {
          const previewFile = helpers.getEntityPreviewFile(
            entity,
            entity.preview_files[taskTypeId]
          )
          if (previewFile) {
            state.playlistEntryMap.delete(
              `${entity.id}-${entity.preview_file_id}`
            )
            entity.preview_file_id = previewFile.id
            entity.preview_file_task_id = previewFile.task_id
            entity.preview_file_extension = previewFile.extension
            entity.preview_file_revision = previewFile.revision
            entity.preview_file_width = previewFile.width
            entity.preview_file_height = previewFile.height
            entity.preview_file_duration = previewFile.duration
            entity.preview_file_annotations = previewFile.annotations
            entity.extension = previewFile.extension
            entity.revision = previewFile.revision
            entity.width = previewFile.width
            entity.height = previewFile.height
            entity.duration = previewFile.duration
            entity.annotations = previewFile.annotations
            state.playlistEntryMap.set(`${entity.id}-${previewFile.id}`, entity)
          }
        }
      })
    }
  },

  [ADD_PLAYLISTS](state, playlists) {
    state.playlists = state.playlists.concat(playlists)
    playlists.forEach(playlist => {
      if (!playlist.entities) playlist.entities = []
      state.playlistMap.set(playlist.id, playlist)
    })
  },

  [SET_PLAYLIST_ENTRY_MAP](state, playlistEntryMap) {
    state.playlistEntryMap = new Map(Object.entries(playlistEntryMap))
  },

  [RESET_ALL](state) {
    state.playlistEntryMap.clear()
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
