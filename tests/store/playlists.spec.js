import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import playlistsApi from '../../src/store/api/playlists'
import playlistStore from '../../src/store/modules/playlists'
import { reset, runAction } from './helpers'
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

  LOAD_PLAYLIST_STATUS_END
} from '../../src/store/mutation-types'


let playlists = []

playlistsApi.getPlaylists = (production, episode, callback) => {
  process.nextTick(() => {
    callback(null, playlists)
  })
}

playlistsApi.newPlaylist = (playlist, callback) => {
  playlist.id = 4
  process.nextTick(() => {
    callback(null, playlist)
  })
}

playlistsApi.updatePlaylist = (playlist, callback) => {
  process.nextTick(() => {
    callback(null, playlist)
  })
}

playlistsApi.deletePlaylist = (playlist, callback) => {
  process.nextTick(() => {
    callback(null, playlists)
  })
}


const getters = playlistStore.getters
const state = store.state.playlists

describe('playlists', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    playlists = [
      {
        id: 1,
        name: 'Daily',
        project_name: 'Big Buck Bunny',
        created_at: '20180401'
      },
      {
        id: 2,
        name: 'Weekly',
        project_name: 'Big Buck Bunny',
        created_at: '20180401'
      },
      {
        id: 3,
        name: 'Sequence 01',
        project_name: 'Big Buck Bunny',
        created_at: '20180401'
      }
    ]
  })

  describe('actions', () => {
    it('loadPlaylists', (done) => {
      helpers.runAction('loadPlaylists', (err) => {
        expect(err).to.be.null
        expect(state.playlists).to.deep.equal(playlists)
        done()
      })
    })

    it('newPlaylist', (done) => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      helpers.runAction('newPlaylist', {
        data: {
          name: 'New playlist'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.playlists.length).to.equal(4)
          done()
        }
      })
    })

    it('editPlaylist', (done) => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      helpers.runAction('editPlaylist', {
        data: {
          id: 2,
          name: 'Modeling edited',
          color: '#FFFFFF'
        },
        callback: (err) => {
          expect(err).to.be.null
          expect(state.playlists.length).to.equal(3)
          const playlistName = state.playlistMap[2].name
          expect(playlistName).to.equal('Modeling edited')
          done()
        }
      })
    })
    it('deletePlaylist', (done) => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      helpers.runAction('deletePlaylist', {
        playlist: playlists[1],
        callback: (err) => {

          expect(err).to.be.null
          expect(state.playlists.length).to.equal(2)
          done()
        }
      })
    })
  })

  describe('mutations', () => {
    it('LOAD_PLAYLISTS_START', () => {
      store.commit(LOAD_PLAYLISTS_START)
    })

    it('LOAD_PLAYLISTS_ERROR', () => {
      store.commit(LOAD_PLAYLISTS_ERROR)
      expect(state.playlists).to.deep.equal([])
    })

    it('LOAD_PLAYLISTS_END', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      expect(state.playlists).to.deep.equal(playlists)
      expect(state.playlists[0].name).to.equal('Daily')
      expect(state.playlists[1].name).to.equal('Sequence 01')
    })

    it('EDIT_PLAYLIST_START', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      store.commit(EDIT_PLAYLIST_START)
    })
    it('EDIT_PLAYLIST_ERROR', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      store.commit(EDIT_PLAYLIST_ERROR)
    })
    it('EDIT_PLAYLIST_END', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      store.commit(EDIT_PLAYLIST_END, {
        id: 4,
        name: 'New task type'
      })
      expect(state.playlists.length).to.equal(4)
      store.commit(EDIT_PLAYLIST_END, {
        id: 2,
        name: 'Modeling edited'
      })
      expect(state.playlists.length).to.equal(4)
      const playlistName = state.playlistMap[2].name
      expect(playlistName).to.equal('Modeling edited')
      store.commit(DELETE_PLAYLIST_END, playlists[2])
    })

    it('DELETE_PLAYLIST_START', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      store.commit(DELETE_PLAYLIST_START)
    })
    it('DELETE_PLAYLIST_ERROR', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      store.commit(DELETE_PLAYLIST_ERROR)
    })
    it('DELETE_PLAYLIST_END', () => {
      store.commit(LOAD_PLAYLISTS_END, playlists)
      expect(state.playlists.length).to.equal(3)
      store.commit(DELETE_PLAYLIST_END, playlists[1])
      expect(state.playlists.length).to.equal(2)
    })
  })
})
