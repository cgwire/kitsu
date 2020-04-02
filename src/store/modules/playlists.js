import Vue from 'vue'
import playlistsApi from '../api/playlists'
import { sortPlaylists, sortByDate } from '../../lib/sorting'
import { removeModelFromList, updateModelFromList } from '../../lib/models'

import {
  LOAD_PLAYLISTS_START,
  LOAD_PLAYLISTS_ERROR,
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

  RESET_ALL
} from '../mutation-types'

const initialState = {
  playlists: [],
  playlistMap: {}
}

const state = { ...initialState }

const getters = {
  playlists: state => state.playlists,
  playlistMap: state => state.playlistMap
}

const actions = {

  loadPlaylists ({ commit, rootGetters }, callback) {
    const production = rootGetters.currentProduction
    const episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow

    if (isTVShow && !episode) {
      if (callback) return callback()
      else return null
    }

    commit(LOAD_PLAYLISTS_START)
    playlistsApi.getPlaylists(production, episode, (err, playlists) => {
      if (err) commit(LOAD_PLAYLISTS_ERROR)
      else commit(LOAD_PLAYLISTS_END, playlists)
      if (callback) callback(err)
    })
  },

  loadPlaylist ({ commit, rootGetters }, { playlist, callback }) {
    const currentProduction = rootGetters.currentProduction
    commit(LOAD_PLAYLIST_START)
    playlistsApi.getPlaylist(
      currentProduction, playlist, (err, playlist) => {
        if (err) commit(LOAD_PLAYLIST_ERROR)
        else commit(LOAD_PLAYLIST_END, playlist)
        if (callback) callback(err, playlist)
      })
  },

  refreshPlaylist ({ commit, rootGetters }, id) {
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

  loadEntityPreviewFiles ({ commit }, entity) {
    return playlistsApi.getEntityPreviewFiles(entity)
  },

  newPlaylist ({ commit }, { data, callback }) {
    commit(EDIT_PLAYLIST_START, data)
    playlistsApi.newPlaylist(data, (err, playlist) => {
      if (err) commit(EDIT_PLAYLIST_ERROR)
      else commit(EDIT_PLAYLIST_END, playlist)
      if (callback) callback(err, playlist)
    })
  },

  editPlaylist ({ commit }, { data, callback }) {
    commit(EDIT_PLAYLIST_START)
    playlistsApi.updatePlaylist(data, (err, playlist) => {
      if (err) commit(EDIT_PLAYLIST_ERROR)
      else commit(EDIT_PLAYLIST_END, playlist)
      if (callback) callback(err, playlist)
    })
  },

  deletePlaylist ({ commit }, { playlist, callback }) {
    commit(DELETE_PLAYLIST_START)
    playlistsApi.deletePlaylist(playlist, (err) => {
      if (err) commit(DELETE_PLAYLIST_ERROR)
      else commit(DELETE_PLAYLIST_END, playlist)
      if (callback) callback(err)
    })
  },

  pushEntityToPlaylist (
    { commit, dispatch }, { playlist, entity, previewFiles, callback }
  ) {
    return new Promise((resolve, reject) => {
      commit(LOAD_ENTITY_PREVIEW_FILES_END, { playlist, entity, previewFiles })
      commit(ADD_ENTITY_TO_PLAYLIST, { playlist, entity })
      dispatch('editPlaylist', {
        data: playlist,
        callback: (err) => {
          if (err) reject(err)
          resolve(entity)
        }
      })
    })
  },

  removeEntityPreviewFromPlaylist (
    { commit, dispatch }, { playlist, entity, callback }
  ) {
    commit(REMOVE_ENTITY_FROM_PLAYLIST, { playlist, entity })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  changePlaylistOrder (
    { commit, dispatch }, { playlist, info, callback }
  ) {
    commit(CHANGE_PLAYLIST_ORDER, { playlist, info })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  changePlaylistPreview (
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

  removeBuildJob ({ commit }, job) {
    commit(REMOVE_BUILD_JOB, job)
    playlistsApi.deleteBuildJob(job)
  },

  removeBuildJobFromList ({ commit }, job) {
    commit(REMOVE_BUILD_JOB, job)
  },

  addNewBuildJob ({ commit }, job) {
    commit(ADD_NEW_JOB, job)
  },

  markBuildJobAsDone ({ commit }, job) {
    commit(MARK_JOB_AS_DONE, job)
  },

  runPlaylistBuild ({ commit }, playlist) {
    playlistsApi.runPlaylistBuild(playlist)
  },

  changePlaylistType (
    { commit, dispatch }, { playlist, taskTypeId, callback }
  ) {
    commit(CHANGE_PLAYLIST_TYPE, { playlist, taskTypeId })
    return dispatch('editPlaylist', { data: playlist, callback })
  },

  loadTempPlaylist ({ commit, dispatch, rootGetters }, taskIds) {
    const production = rootGetters.currentProduction
    return playlistsApi.loadTempPlaylist(production, taskIds)
  }
}

const mutations = {
  [LOAD_PLAYLISTS_START] (state) {
  },

  [LOAD_PLAYLISTS_ERROR] (state) {
  },

  [LOAD_PLAYLISTS_END] (state, playlists) {
    state.playlists = playlists
    state.playlists = sortPlaylists(state.playlists)
    state.playlistMap = {}
    playlists.forEach((playlist) => {
      if (!playlist.entities) playlist.entities = []
      state.playlistMap[playlist.id] = playlist
    })
  },

  [LOAD_PLAYLIST_START] (state) {
  },

  [LOAD_PLAYLIST_ERROR] (state) {
  },

  [LOAD_PLAYLIST_END] (state, playlist) {
    state.playlistMap[playlist.id].build_jobs = playlist.build_jobs
  },

  [EDIT_PLAYLIST_START] (state, data) {
  },

  [EDIT_PLAYLIST_ERROR] (state) {
  },

  [EDIT_PLAYLIST_END] (state, newPlaylist) {
    const playlist = state.playlistMap[newPlaylist.id]
    if (playlist && playlist.id) {
      Object.assign(playlist, newPlaylist)
    } else {
      state.playlists = [newPlaylist].concat(state.playlists)
      state.playlistMap[newPlaylist.id] = newPlaylist
    }
  },

  [DELETE_PLAYLIST_START] (state) {
  },
  [DELETE_PLAYLIST_ERROR] (state) {
  },
  [DELETE_PLAYLIST_END] (state, playlistToDelete) {
    state.playlists = removeModelFromList(state.playlists, playlistToDelete)
    delete state.playlistMap[playlistToDelete.id]
  },

  [LOAD_ENTITY_PREVIEW_FILES_END] (state, { playlist, entity, previewFiles }) {
    let previewFileList = []
    Object.keys(previewFiles).forEach(taskTypeId => {
      previewFiles[taskTypeId].forEach(previewFile => {
        previewFileList.push(previewFile)
      })
    })
    previewFileList = sortByDate(previewFileList)
    if (previewFileList.length > 0) {
      const preview = previewFileList[0]
      entity.preview_file_id = preview.id
      entity.preview_file_extension = preview.extension
      entity.preview_file_annotations = preview.annotations
      entity.preview_file_task_id = preview.task_id
    }
    entity.preview_files = previewFiles
  },

  [ADD_ENTITY_TO_PLAYLIST] (state, { playlist, entity }) {
    if (!playlist.shots) playlist.shots = []
    playlist.shots.push({
      entity_id: entity.id,
      preview_file_id: entity.preview_file_id,
      preview_file_extension: entity.preview_file_extension,
      preview_file_annotations: entity.preview_file_annotations,
      preview_files: entity.preview_files
    })
  },

  [REMOVE_ENTITY_FROM_PLAYLIST] (state, { playlist, entity }) {
    if (!playlist.shots) playlist.shots = []
    const entityPlaylistToDeleteIndex = playlist.shots.findIndex(
      (entityPlaylist) => entityPlaylist.entity_id === entity.id
    )
    playlist.shots.splice(entityPlaylistToDeleteIndex, 1)
  },

  [CHANGE_PLAYLIST_ORDER] (state, { playlist, info }) {
    const entityToMove = playlist.shots.find(
      (entityPlaylist) => entityPlaylist.entity_id === info.after
    )
    const entityToMoveIndex = playlist.shots.findIndex(
      (entityPlaylist) => entityPlaylist.entity_id === info.after
    )
    let targetShotIndex = playlist.shots.findIndex(
      (entityPlaylist) => entityPlaylist.entity_id === info.before
    )
    if (entityToMoveIndex >= 0 && targetShotIndex >= 0) {
      playlist.shots.splice(entityToMoveIndex, 1)
      if (entityToMoveIndex > targetShotIndex) targetShotIndex++
      playlist.shots.splice(targetShotIndex, 0, entityToMove)
    }
  },

  [CHANGE_PLAYLIST_PREVIEW] (state, { playlist, entityId, previewFileId }) {
    const entityToChange = playlist.shots.find((entity) => entity.entity_id === entityId)
    entityToChange.preview_file_id = previewFileId
  },

  [ADD_NEW_JOB] (state, job) {
    const playlist = state.playlistMap[job.playlist_id]
    playlist.build_jobs = [{
      id: job.build_job_id,
      created_at: job.created_at,
      status: 'running',
      playlist_id: playlist.id
    }].concat(playlist.build_jobs)
  },

  [MARK_JOB_AS_DONE] (state, job) {
    const playlist = state.playlistMap[job.playlist_id]
    updateModelFromList(playlist.build_jobs, {
      id: job.build_job_id,
      status: 'succeeded'
    })
  },

  [REMOVE_BUILD_JOB] (state, job) {
    const playlist = state.playlistMap[job.playlist_id]
    Vue.set(playlist, 'build_jobs', removeModelFromList(playlist.build_jobs, job))
  },

  [CHANGE_PLAYLIST_TYPE] (state, { playlist, taskTypeId }) {
    if (playlist) {
      playlist.shots.forEach((entity) => {
        if (entity.preview_files[taskTypeId]) {
          const previewFile = entity.preview_files[taskTypeId][0]
          entity.preview_file_id = previewFile.id
          entity.preview_file_extension = previewFile.extension
          entity.preview_file_annotations = previewFile.annotations
          entity.extension = previewFile.extension
          entity.annotations = previewFile.annotations
        }
      })
    }
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
