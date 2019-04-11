import playlistsApi from '../api/playlists'
import { sortPlaylists } from '../../lib/sorting'

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
  ADD_SHOT_TO_PLAYLIST,
  REMOVE_SHOT_FROM_PLAYLIST,
  LOAD_SHOT_PREVIEW_FILES_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  playlists: [],
  playlistMap: {}
}

const state = {...initialState}

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

  loadShotPreviewFiles ({ commit }, { playlist, shot, callback }) {
    playlistsApi.getShotPreviewFiles(shot, (err, previewFiles) => {
      if (callback) callback(err, previewFiles)
    })
  },

  newPlaylist ({ commit }, { data, callback }) {
    commit(EDIT_PLAYLIST_START, data)
    playlistsApi.newPlaylist(data, (err, playlist) => {
      if (err) commit(EDIT_PLAYLIST_ERROR)
      else commit(EDIT_PLAYLIST_END, playlist)
      if (callback) callback(err, playlist)
    })
  },

  editPlaylist ({ commit }, {data, callback}) {
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
    commit(ADD_SHOT_TO_PLAYLIST, {playlist, shot})
    commit(LOAD_SHOT_PREVIEW_FILES_END, { playlist, shot, previewFiles })
    dispatch('editPlaylist', { data: playlist, callback })
  },

  removeShotPreviewFromPlaylist (
    { commit, dispatch }, {playlist, shot, callback}
  ) {
    commit(REMOVE_SHOT_FROM_PLAYLIST, { playlist, shot })
    dispatch('editPlaylist', {data: playlist, callback})
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
    dispatch('editPlaylist', {data: playlist, callback})
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

  [LOAD_PLAYLIST_END] (state) {
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
      state.playlists = sortPlaylists(state.playlists)
    }
    state.playlistMap[newPlaylist.id] = newPlaylist
  },

  [DELETE_PLAYLIST_START] (state) {
  },
  [DELETE_PLAYLIST_ERROR] (state) {
  },
  [DELETE_PLAYLIST_END] (state, playlistToDelete) {
    const playlistToDeleteIndex = state.playlists.findIndex(
      (playlist) => playlist.id === playlistToDelete.id
    )
    state.playlists.splice(playlistToDeleteIndex, 1)
    delete state.playlistMap[playlistToDelete.id]
  },

  [LOAD_SHOT_PREVIEW_FILES_END] (state, { playlist, shot, previewFiles }) {
    const shotToChange = playlist.shots.find(
      (playlistShot) => playlistShot.shot_id === shot.id)
    shotToChange.preview_files = previewFiles
    const previewFileList = []
    const previewFileMap = {}
    Object.keys(previewFiles).forEach(taskTypeId => {
      previewFiles[taskTypeId].forEach(previewFile => {
        previewFileList.push(previewFile)
        previewFileMap[previewFile.id] = previewFile
      })
    })
    if (previewFileList.length > 0) {
      let preview = previewFileMap[shot.preview_file_id]
      if (!preview) preview = previewFileList[0]
      shot.preview_file_id = preview.id
      shot.preview_file_extension = preview.extension
    }
  },

  [ADD_SHOT_TO_PLAYLIST] (state, {playlist, shot}) {
    if (!playlist.shots) playlist.shots = []
    playlist.shots.push({
      shot_id: shot.id,
      preview_file_id: shot.preview_file_id,
      preview_file_extension: shot.preview_file_extension,
      preview_files: shot.preview_files
    })
  },

  [REMOVE_SHOT_FROM_PLAYLIST] (state, {playlist, shot}) {
    if (!playlist.shots) playlist.shots = []
    const shotPlaylistToDeleteIndex = playlist.shots.findIndex(
      (shotPlaylist) => shotPlaylist.shot_id === shot.id
    )
    playlist.shots.splice(shotPlaylistToDeleteIndex, 1)
  },

  [CHANGE_PLAYLIST_PREVIEW] (state, { playlist, shotId, previewFileId }) {
    const shotToChange = playlist.shots.find((shot) => shot.shot_id === shotId)
    shotToChange.preview_file_id = previewFileId
  },

  [RESET_ALL] (state) {
    Object.assign(state, {...initialState})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
