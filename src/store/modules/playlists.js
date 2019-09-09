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
  ADD_SHOT_TO_PLAYLIST,
  REMOVE_SHOT_FROM_PLAYLIST,
  LOAD_SHOT_PREVIEW_FILES_END,

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

  loadShotPreviewFiles ({ commit }, shot) {
    return playlistsApi.getShotPreviewFiles(shot)
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
      if (callback) callback(err)
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

  addShotPreviewToPlaylist (
    { commit, dispatch }, { playlist, shot, previewFiles, callback }
  ) {
    return new Promise((resolve, reject) => {
      commit(LOAD_SHOT_PREVIEW_FILES_END, { playlist, shot, previewFiles })
      commit(ADD_SHOT_TO_PLAYLIST, { playlist, shot })
      dispatch('editPlaylist', {
        data: playlist,
        callback: () => {
          const previewFile = {
            shot_id: shot.id,
            id: shot.preview_file_id,
            extension: shot.preview_file_extension,
            annotations: shot.preview_file_annotations,
            task_id: shot.preview_file_task_id,
            preview_files: previewFiles
          }
          resolve(previewFile)
        }
      })
    })
  },

  removeShotPreviewFromPlaylist (
    { commit, dispatch }, { playlist, shot, callback }
  ) {
    commit(REMOVE_SHOT_FROM_PLAYLIST, { playlist, shot })
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
    { playlist, shot, previewFileId, callback }
  ) {
    commit(CHANGE_PLAYLIST_PREVIEW, {
      playlist,
      shotId: shot.id,
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
      if (!playlist.shots) playlist.shots = []
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
      state.playlists.push(newPlaylist)
      state.playlistMap[newPlaylist.id] = newPlaylist
    }
    state.playlists = sortPlaylists(state.playlists)
  },

  [DELETE_PLAYLIST_START] (state) {
  },
  [DELETE_PLAYLIST_ERROR] (state) {
  },
  [DELETE_PLAYLIST_END] (state, playlistToDelete) {
    state.playlists = removeModelFromList(state.playlists, playlistToDelete)
    delete state.playlistMap[playlistToDelete.id]
  },

  [LOAD_SHOT_PREVIEW_FILES_END] (state, { playlist, shot, previewFiles }) {
    let previewFileList = []
    Object.keys(previewFiles).forEach(taskTypeId => {
      previewFiles[taskTypeId].forEach(previewFile => {
        previewFileList.push(previewFile)
      })
    })
    previewFileList = sortByDate(previewFileList)
    if (previewFileList.length > 0) {
      const preview = previewFileList[0]
      shot.preview_file_id = preview.id
      shot.preview_file_extension = preview.extension
      shot.preview_file_annotations = preview.annotations
    }
    shot.preview_files = previewFiles
  },

  [ADD_SHOT_TO_PLAYLIST] (state, { playlist, shot }) {
    if (!playlist.shots) playlist.shots = []
    playlist.shots.push({
      shot_id: shot.id,
      preview_file_id: shot.preview_file_id,
      preview_file_extension: shot.preview_file_extension,
      preview_file_annotations: shot.preview_file_annotations,
      preview_files: shot.preview_files
    })
  },

  [REMOVE_SHOT_FROM_PLAYLIST] (state, { playlist, shot }) {
    if (!playlist.shots) playlist.shots = []
    const shotPlaylistToDeleteIndex = playlist.shots.findIndex(
      (shotPlaylist) => shotPlaylist.shot_id === shot.id
    )
    playlist.shots.splice(shotPlaylistToDeleteIndex, 1)
  },

  [CHANGE_PLAYLIST_ORDER] (state, { playlist, info }) {
    const shotToMove = playlist.shots.find(
      (shotPlaylist) => shotPlaylist.shot_id === info.after
    )
    const shotToMoveIndex = playlist.shots.findIndex(
      (shotPlaylist) => shotPlaylist.shot_id === info.after
    )
    let targetShotIndex = playlist.shots.findIndex(
      (shotPlaylist) => shotPlaylist.shot_id === info.before
    )
    if (shotToMoveIndex >= 0 && targetShotIndex >= 0) {
      playlist.shots.splice(shotToMoveIndex, 1)
      if (shotToMoveIndex > targetShotIndex) targetShotIndex++
      playlist.shots.splice(targetShotIndex, 0, shotToMove)
    }
  },

  [CHANGE_PLAYLIST_PREVIEW] (state, { playlist, shotId, previewFileId }) {
    const shotToChange = playlist.shots.find((shot) => shot.shot_id === shotId)
    shotToChange.preview_file_id = previewFileId
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
