import playlistsApi from '../api/playlists'
import { sortByName } from '../../lib/sorting'

import productionsStore from './productions'

import {
  LOAD_PLAYLISTS_START,
  LOAD_PLAYLISTS_ERROR,
  LOAD_PLAYLISTS_END,

  EDIT_PLAYLIST_START,
  EDIT_PLAYLIST_ERROR,
  EDIT_PLAYLIST_END,

  DELETE_PLAYLIST_START,
  DELETE_PLAYLIST_ERROR,
  DELETE_PLAYLIST_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  playlists: [],
  playlistMap: {},
  isPlaylistsLoading: false,
  isPlaylistsLoadingError: false,

  editPlaylist: {
    isLoading: false,
    isError: false
  },

  deletePlaylist: {
    isLoading: false,
    isError: false
  }
}

const getters = {
  playlists: state => state.playlists,
  playlistMap: state => state.playlistMap,

  isPlaylistsLoading: state => state.isPlaylistsLoading,
  isPlaylistsLoadingError: state => state.isPlaylistsLoadingError,

  editPlaylist: state => state.editPlaylist,
  deletePlaylist: state => state.deletePlaylist
}

const actions = {

  loadPlaylists ({ commit, state, rootState }, callback) {
    const currentProduction = productionsStore.getters.currentProduction(
      rootState.productions
    )
    commit(LOAD_PLAYLISTS_START)
    playlistsApi.getPlaylists(currentProduction, (err, playlists) => {
      if (err) commit(LOAD_PLAYLISTS_ERROR)
      else commit(LOAD_PLAYLISTS_END, playlists)
      if (callback) callback(err)
    })
  },

  newPlaylist ({ commit, state }, { data, callback }) {
    commit(EDIT_PLAYLIST_START, data)
    playlistsApi.newPlaylist(data, (err, playlist) => {
      if (err) {
        commit(EDIT_PLAYLIST_ERROR)
      } else {
        commit(EDIT_PLAYLIST_END, playlist)
      }
      if (callback) callback(err)
    })
  },

  editPlaylist ({ commit, state }, payload) {
    commit(EDIT_PLAYLIST_START)
    playlistsApi.updatePlaylist(payload.data, (err, playlist) => {
      if (err) {
        commit(EDIT_PLAYLIST_ERROR)
      } else {
        commit(EDIT_PLAYLIST_END, playlist)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deletePlaylist ({ commit, state }, { playlist, callback }) {
    commit(DELETE_PLAYLIST_START)
    playlistsApi.deletePlaylist(playlist, (err) => {
      if (err) {
        commit(DELETE_PLAYLIST_ERROR)
      } else {
        commit(DELETE_PLAYLIST_END, playlist)
      }
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_PLAYLISTS_START] (state) {
  },

  [LOAD_PLAYLISTS_ERROR] (state) {
  },

  [LOAD_PLAYLISTS_END] (state, playlists) {
    state.playlists = playlists
    state.playlists = sortByName(state.playlists)
    state.playlistMap = {}
    playlists.forEach((playlist) => {
      state.playlistMap[playlist.id] = playlist
    })
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
      state.playlists = sortByName(state.playlists)
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

    state.deletePlaylist = {
      isLoading: false,
      isError: false
    }
  },

  [RESET_ALL] (state) {
    state.playlists = []
    state.playlistMap = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
