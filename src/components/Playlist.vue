<template>
  <div class="productions page fixed-page">
    <div class="columns">
      <div class="playlist-list-column column">
        <page-title class="title" :text="$t('playlists.title')"></page-title>
        <button
          :class="{
            button: true,
            'is-loading': loading.addPlaylist
          }"
          @click="addPlaylist"
        >
          {{ $t('playlists.new_playlist') }}
        </button>

        <div class="playlists" v-if="!loading.playlists">
          <router-link
            :key="playlist.id"
            :to="{
              name: 'playlist',
              params: {
                playlist_id: playlist.id,
                production_id: currentProduction.id
              }
            }"
            :class="{
              'playlist-item': true,
              selected: playlist.id === currentPlaylist.id
            }"
            v-for="playlist in playlists"
          >
            {{ playlist.name }}
          </router-link>
        </div>
        <spinner v-else></spinner>
        <error-text
          text="$t('playlists.loading_error')"
          v-if="errors.playlistLoading">
        </error-text>
      </div>

      <div class="playlist-column column">
        {{ currentPlaylist.name }}
        <button-link
          :path="{
            name: 'delete-playlist',
            params: {
              production_id: currentProduction.id,
              playlist_id: currentPlaylist.id
            }
          }"
          icon="delete"
          v-if="currentPlaylist.id"
        >
        </button-link>
      </div>

      <div class="addition-column column">
        <page-subtitle :text="$t('playlists.add_shots')"></page-subtitle>
        <spinner v-if="isShotsLoading"></spinner>
        <div v-else>
          <combobox
            :label="$t('shots.fields.episode')"
            :options="getEpisodeOptions"
            v-model="episodeId"
            v-if="episodes.length > 0"
          ></combobox>
          <div v-else>
            There is no shot in this production.
          </div>
          <combobox
            :label="$t('shots.fields.sequence')"
            :options="sequenceOptions"
            v-model="sequenceId"
            v-if="episodeId && sequenceOptions.length > 0"
          ></combobox>
          <div v-if="sequenceOptions.length === 0 && episodeId">
            There is no sequence in this episode.
          </div>

          <div v-if="sequenceShots.length === 0 && sequenceId">
            There is no shot in this sequence.
          </div>
          <div class="addition-shot" v-for="shot in sequenceShots">
            {{ shot.name }}
            <button class="button">add</button>
          </div>
        </div>
      </div>
    </div>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.deletePlaylist"
      :is-error="errors.deletePlaylist"
      :cancel-route="{
        name: 'playlist',
        params: {
          production_id: currentProduction.id,
          playlist_id: currentPlaylist.id
        }
      }"
      :text="deleteText"
      :error-text="$t('playlists.delete_error')"
      @confirm="removePlaylist"
    >
    </delete-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import ButtonLink from './widgets/ButtonLink'
import Combobox from './widgets/Combobox'
import ErrorText from './widgets/ErrorText'
import PageSubtitle from './widgets/PageSubtitle'
import PageTitle from './widgets/PageTitle'
import Spinner from './widgets/Spinner'
import DeleteModal from './widgets/DeleteModal'

export default {
  name: 'productions',

  components: {
    ButtonLink,
    Combobox,
    DeleteModal,
    ErrorText,
    PageTitle,
    PageSubtitle,
    Spinner
  },

  data () {
    return {
      episodeId: null,
      sequenceId: null,
      sequenceOptions: [],
      sequenceShots: [],
      currentPlaylist: {
        name: this.$t('playlists.no_selection')
      },
      modals: {
        isDeleteDisplayed: false
      },
      loading: {
        playlists: false,
        addPlaylist: false,
        deletePlaylist: false
      },
      errors: {
        playlistLoading: false,
        addPlaylist: false,
        deletePlaylist: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'episodes',
      'getEpisodeOptions',
      'isShotsLoading',
      'playlistMap',
      'playlists',
      'sequences',
      'shots'
    ]),

    deleteText () {
      if (this.currentPlaylist) {
        return this.$t('playlists.delete_text', {
          name: this.currentPlaylist.name
        })
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'deletePlaylist',
      'loadPlaylists',
      'loadShots',
      'newPlaylist'
    ]),

    addPlaylist () {
      this.loading.addPlaylist = true
      this.errors.addPlaylist = false
      this.newPlaylist({
        data: {
          name: moment().format('YYYY-MM-DD hh:mm'),
          production_id: this.currentProduction.id
        },
        callback: (err) => {
          if (err) this.errors.addPlaylist = true
          this.loading.addPlaylist = false
        }
      })
    },

    removePlaylist () {
      this.loading.deletePlaylist = true
      this.errors.deletePlaylist = false
      this.deletePlaylist({
        playlist: this.currentPlaylist,
        callback: (err) => {
          if (err) this.errors.deletePlaylist = true
          this.loading.deletePlaylist = false
          this.goFirstPlaylist()
        }
      })
    },

    setCurrentPlaylist () {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap[playlistId]
      if (playlist) {
        this.currentPlaylist = playlist
      } else {
        this.currentPlaylist = {
          name: this.$t('playlists.no_selection')
        }
      }
    },

    goFirstPlaylist () {
      if (this.playlists.length > 0) {
        this.$router.push({
          name: 'playlist',
          params: {
            production_id: this.currentProduction.id,
            playlist_id: this.playlists[0].id
          }
        })
      } else {
        this.$router.push({
          name: 'playlists',
          params: {
            production_id: this.currentProduction.id
          }
        })
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      if (path.indexOf('delete') > 0) {
        this.modals.isDeleteDisplayed = true
      } else {
        this.modals.isDeleteDisplayed = false
      }
    },

    setSequences () {
      const sequences = this.sequences.filter((sequence) => {
        return sequence.parent_id === this.episodeId
      })
      this.sequenceOptions = sequences.map(
        (sequence) => { return { label: sequence.name, value: sequence.id } }
      )
    },

    setShots () {
      this.sequenceShots = this.shots.filter((shot) => {
        return shot.sequence_id === this.sequenceId
      })
    },

    clearAdditionColumn () {
      this.sequenceOptions = []
      this.episodeId = null
      this.sequenceId = null
    }
  },

  created () {
    if (this.currentProduction.id !== this.$route.params.production_id) {
      this.$store.commit(
        'SET_CURRENT_PRODUCTION',
        this.$route.params.production_id
      )
    }
    this.loading.playlists = true
    this.loadPlaylists((err) => {
      if (err) this.errors.loadPlaylists = true
      this.loading.playlists = false
      if (!err) {
        this.handleModalsDisplay()
        if (!this.currentPlaylist.id) this.goFirstPlaylist()
        this.setCurrentPlaylist()
      }
    })

    if (this.shots.length === 0) {
      this.loadShots(() => {
        if (this.episodes.length > 0) {
          this.episodeId = this.episodes[0].id
        }
      })
    } else {
      if (this.episodes.length > 0) {
        this.episodeId = this.episodes[0].id
      }
    }
  },

  watch: {
    $route () {
      this.handleModalsDisplay()
      this.setCurrentPlaylist()
    },

    currentProduction () {
      const newPath = {
        name: 'playlists',
        params: {production_id: this.currentProduction.id}
      }
      if (this.currentProduction.id !== this.$route.params.production_id) {
        this.$router.push(newPath)
        this.loadPlaylists()
        this.loadShots()
      }
    },

    episodeId () {
      this.sequenceId = null
      this.setSequences()
    },

    sequenceId () {
      this.setShots()
    }

  },

  metaInfo () {
    return {
      title: `${this.$t('playlists.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
.page {
  display: flex;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}

.columns {
  display: flex;
  flex: 1;
  margin-bottom: 0;
}

.playlist-list-column {
  max-width: 300px;
  padding: 2em 1em 1em 2em;
  background: #F4F5F9;
  overflow-y: auto;
}

.button {
  width: 100%;
}

.playlist-column {
  flex: 1;
}

.playlist-item {
  display: block;
  background: white;
  border-radius: 1em;
  padding: 1em;
  margin: 0.2em;
}

.addition-column {
  max-width: 200px;
  background: #F4F5F9;
}

.playlist-item.selected {
  border-right: 2px solid green;
}
</style>
