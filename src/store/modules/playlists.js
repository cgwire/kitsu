import Vue from 'vue/dist/vue'
import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'
import playlistsApi from '@/store/api/playlists'
import { sortByDate } from '@/lib/sorting'
import { removeModelFromList, updateModelFromList } from '@/lib/models'

import {
  ADD_PLAYLISTS,
  LOAD_PLAYLISTS_END,
  LOAD_PLAYLIST_START,
  LOAD_PLAYLIST_ERROR,
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
  UPDATE_PREVIEW_ANNOTATION,
  UPDATE_PREVIEW_VALIDATION_STATUS,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  playlists: [],
  playlistMap: new Map(),
  previewFileMap: new Map(),
  previewFileEntityMap: new Map()
}

const state = { ...initialState }

const getters = {
  playlists: state => state.playlists,
  playlistMap: state => state.playlistMap,
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
        return Promise.resolve(playlists)
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
        return Promise.resolve(playlists)
      })
  },

  loadPlaylist({ commit, rootGetters }, { playlist, callback }) {
    const currentProduction = rootGetters.currentProduction
    commit(LOAD_PLAYLIST_START)
    playlistsApi.getPlaylist(currentProduction, playlist, (err, playlist) => {
      if (err) commit(LOAD_PLAYLIST_ERROR)
      else commit(LOAD_PLAYLIST_END, playlist)
      if (callback) callback(err, playlist)
    })
  },

  refreshPlaylist({ commit, rootGetters }, id) {
    return new Promise((resolve, reject) => {
      const currentProduction = rootGetters.currentProduction
      playlistsApi.getPlaylist(currentProduction, { id }, (err, playlist) => {
        if (err) reject(err)
        else {
          commit(EDIT_PLAYLIST_END, playlist)
          resolve(playlist)
        }
      })
    })
  },

  loadEntityPreviewFiles({ commit }, entity) {
    return playlistsApi.getEntityPreviewFiles(entity)
  },

  newPlaylist({ commit }, data) {
    commit(EDIT_PLAYLIST_START, data)
    return playlistsApi.newPlaylist(data).then(playlist => {
      commit(EDIT_PLAYLIST_END, playlist)
      return Promise.resolve(playlist)
    })
  },

  editPlaylist({ commit, rootGetters }, { data, callback }) {
    if (!rootGetters.isCurrentUserClient) {
      commit(EDIT_PLAYLIST_START)
      return playlistsApi.updatePlaylist(data, (err, playlist) => {
        if (err) commit(EDIT_PLAYLIST_ERROR)
        else commit(EDIT_PLAYLIST_END, playlist)
        if (callback) callback(err, playlist)
      })
    } else {
      if (callback) callback()
    }
  },

  deletePlaylist({ commit }, { playlist, callback }) {
    commit(DELETE_PLAYLIST_START)
    playlistsApi.deletePlaylist(playlist, err => {
      if (err) commit(DELETE_PLAYLIST_ERROR)
      else commit(DELETE_PLAYLIST_END, playlist)
      if (callback) callback(err)
    })
  },

  pushEntityToPlaylist(
    { commit, dispatch },
    { playlist, entity, previewFiles, task, callback }
  ) {
    return new Promise((resolve, reject) => {
      commit(LOAD_ENTITY_PREVIEW_FILES_END, { playlist, entity, previewFiles })
      commit(ADD_ENTITY_TO_PLAYLIST, { playlist, entity, task })
      dispatch('editPlaylist', {
        data: playlist,
        callback: err => {
          if (err) reject(err)
          resolve(entity)
        }
      })
    })
  },

  removeEntityPreviewFromPlaylist(
    { commit, dispatch },
    { playlist, entity, callback }
  ) {
    commit(REMOVE_ENTITY_FROM_PLAYLIST, { playlist, entity })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  changePlaylistOrder({ commit, dispatch }, { playlist, info, callback }) {
    commit(CHANGE_PLAYLIST_ORDER, { playlist, info })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  changePlaylistPreview(
    { commit, dispatch },
    { playlist, entity, previewFileId, callback }
  ) {
    commit(CHANGE_PLAYLIST_PREVIEW, {
      playlist,
      entityId: entity.id,
      previewFileId
    })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  removeBuildJob({ commit }, job) {
    commit(REMOVE_BUILD_JOB, job)
    playlistsApi.deleteBuildJob(job)
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

  changePlaylistType({ commit, dispatch }, { playlist, taskTypeId, callback }) {
    commit(CHANGE_PLAYLIST_TYPE, { playlist, taskTypeId })
    return dispatch('editPlaylist', { data: playlist, callback })
  },

  loadTempPlaylist({ commit, dispatch, rootGetters }, { taskIds, sort }) {
    const production = rootGetters.currentProduction
    return playlistsApi.loadTempPlaylist(production, taskIds, sort)
  },

  getRunningPreviewFiles() {
    return playlistsApi.getRunningPreviewFiles()
  },

  markPreviewFileAsBroken(utils, previewFileId) {
    return playlistsApi.markPreviewFileAsBroken(previewFileId)
  },

  updatePreviewFileValidationStatus({ commit }, { previewFile, status }) {
    commit(UPDATE_PREVIEW_VALIDATION_STATUS, { previewFile, status })
    return playlistsApi.updatePreviewFileValidationStatus(previewFile, status)
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

  [LOAD_PLAYLIST_ERROR](state) {},

  [LOAD_PLAYLIST_END](state, playlist) {
    state.playlistMap.get(playlist.id).build_jobs = playlist.build_jobs
    state.previewFileMap.clear()
    state.previewFileEntityMap.clear()
    if (playlist.shots) {
      playlist.shots.forEach(entity => {
        state.previewFileEntityMap.set(entity.preview_file_id, entity)
        const previewFileGroups = Object.values(entity.preview_files)
        previewFileGroups.forEach(previewFiles => {
          previewFiles.forEach(previewFile => {
            state.previewFileMap.set(previewFile.id, previewFile)
          })
        })
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
      let preview = previewFileList[0]

      // if the playlist is typed, we use the latest for this type.
      if (playlist.task_type_id) {
        previewFileList = previewFileList.filter(
          p => p.task_type_id === playlist.task_type_id
        )
        if (previewFileList.length > 0) preview = previewFileList[0]
      }
      entity.preview_file_id = preview.id
      entity.preview_file_extension = preview.extension
      entity.preview_file_annotations = preview.annotations
      entity.preview_file_task_id = preview.task_id
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
      preview_file_annotations: entity.preview_file_annotations,
      preview_files: entity.preview_files,
      preview_nb_frames: entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE
    })
  },

  [REMOVE_ENTITY_FROM_PLAYLIST](state, { playlist, entity }) {
    if (!playlist.shots) playlist.shots = []
    const entityPlaylistToDeleteIndex = playlist.shots.findIndex(
      entityPlaylist => entityPlaylist.entity_id === entity.id
    )
    playlist.shots.splice(entityPlaylistToDeleteIndex, 1)
  },

  [CHANGE_PLAYLIST_ORDER](state, { playlist, info }) {
    const entityToMove = playlist.shots.find(
      entityPlaylist => entityPlaylist.entity_id === info.after
    )
    const entityToMoveIndex = playlist.shots.findIndex(
      entityPlaylist => entityPlaylist.entity_id === info.after
    )
    let targetShotIndex = playlist.shots.findIndex(
      entityPlaylist => entityPlaylist.entity_id === info.before
    )
    if (entityToMoveIndex >= 0 && targetShotIndex >= 0) {
      playlist.shots.splice(entityToMoveIndex, 1)
      if (entityToMoveIndex > targetShotIndex) targetShotIndex++
      playlist.shots.splice(targetShotIndex, 0, entityToMove)
    }
  },

  [CHANGE_PLAYLIST_PREVIEW](state, { playlist, entityId, previewFileId }) {
    let entityToChange = playlist.shots.find(e => e.entity_id === entityId)
    if (!entityToChange) {
      entityToChange = playlist.shots.find(e => e.id === entityId)
    }
    if (entityToChange) {
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
    Vue.set(
      playlist,
      'build_jobs',
      removeModelFromList(playlist.build_jobs, job)
    )
  },

  [CHANGE_PLAYLIST_TYPE](state, { playlist, taskTypeId }) {
    if (playlist) {
      playlist.shots.forEach(entity => {
        if (entity.preview_files[taskTypeId]) {
          const previewFile = entity.preview_files[taskTypeId][0]
          entity.preview_file_id = previewFile.id
          entity.preview_file_task_id = previewFile.task_id
          entity.preview_file_extension = previewFile.extension
          entity.preview_file_annotations = previewFile.annotations
          entity.extension = previewFile.extension
          entity.annotations = previewFile.annotations
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

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
