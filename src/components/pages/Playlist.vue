<template>
  <div class="productions page fixed-page">
    <div class="columns">

      <div class="playlist-list-column column">
        <button
          :class="{
            button: true,
            'is-loading': loading.addPlaylist
          }"
          @click="addPlaylist"
          v-if="isCurrentUserManager"
        >
          <plus-icon class="icon is-small" />
          {{ $t('playlists.new_playlist') }}
        </button>

        <div class="playlists" v-if="!loading.playlists">
          <router-link
            :key="playlist.id"
            :to="getPlaylistPath(playlist.id)"
            :class="{
              'playlist-item': true,
              selected: playlist.id === currentPlaylist.id
            }"
            v-for="playlist in playlists"
          >
            {{ playlist.name }}
          </router-link>
        </div>
        <spinner v-else />
        <error-text
          text="$t('playlists.loading_error')"
          v-if="errors.playlistLoading"
        />
      </div>

      <div class="playlist-column column">
        <playlist-player
          :playlist="currentPlaylist"
          :shots="currentShots"
          @preview-changed="onPreviewChanged"
          @playlist-deleted="goFirstPlaylist"
          @remove-shot="removeShot"
        />
      </div>

      <div
        class="addition-column column"
        v-if="isCurrentUserManager"
      >
        <spinner v-if="isShotsLoading" />
        <div v-else>
          <div class="addition-header">
            <page-subtitle :text="$t('playlists.add_shots')" />

            <div class="flexrow" v-if="episodes.length > 0 || !isTVShow">
              <div class="flexrow-item">
                <combobox
                  :label="$t('shots.fields.sequence')"
                  :options="sequenceOptions"
                  v-model="sequenceId"
                  v-if="sequenceOptions.length > 0"
                />
                <div v-if="sequenceOptions.length === 0">
                  {{ $t('playlists.no_sequence_for_episode') }}
                </div>
              </div>
            </div>
            <div v-else>
              {{ $t('playlists.no_shot_for_production') }}
            </div>

            <div v-if="sequenceShots.length === 0 && sequenceId">
              {{ $t('playlists.no_shot_for_sequence') }}
            </div>
          </div>

          <div
            :class="{
              'addition-shot': true,
              playlisted: currentShots[shot.id] !== undefined
            }"
            :key="shot.id"
            @click.prevent="addShot(shot)"
            v-for="shot in sequenceShots"
          >
            <entity-thumbnail
              :entity="shot"
              :empty-width="150"
              :empty-height="100"
            />
            {{ shot.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

import moment from 'moment-timezone'
import { PlusIcon } from 'vue-feather-icons'

import ButtonLink from '../widgets/ButtonLink'
import Combobox from '../widgets/Combobox'
import EntityThumbnail from '../widgets/EntityThumbnail'
import ErrorText from '../widgets/ErrorText'
import PageSubtitle from '../widgets/PageSubtitle'
import Spinner from '../widgets/Spinner'

import PlaylistPlayer from './playlists/PlaylistPlayer'

export default {
  name: 'productions',

  components: {
    ButtonLink,
    Combobox,
    EntityThumbnail,
    ErrorText,
    PageSubtitle,
    PlaylistPlayer,
    PlusIcon,
    Spinner
  },

  data () {
    return {
      sequenceId: null,
      sequenceOptions: [],
      sequenceShots: [],
      currentPlaylist: { name: this.$t('playlists.no_selection') },
      currentShots: {},
      currentShot: 0,
      modals: {
        isDeleteDisplayed: false,
        isEditDisplayed: false
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
      'currentEpisode',
      'currentProduction',
      'episodes',
      'getEpisodeOptions',
      'isShotsLoading',
      'isTVShow',
      'isCurrentUserManager',
      'playlistMap',
      'playlists',
      'playlistsPath',
      'sequences',
      'shotMap',
      'taskTypeMap'
    ]),

    playlistedShots () {
      return Object.values(this.currentShots)
    },

    currentPlaylistRoute () {
      if (this.currentPlaylist.id) {
        return this.getPlaylistPath(this.currentPlaylist.id)
      } else {
        return this.playlistsPath
      }
    }
  },

  methods: {
    ...mapActions([
      'addShotPreviewToPlaylist',
      'changePlaylistPreview',
      'deletePlaylist',
      'editPlaylist',
      'loadPlaylist',
      'loadPlaylists',
      'loadShotPreviewFiles',
      'loadShots',
      'newPlaylist',
      'removeShotPreviewFromPlaylist'
    ]),

    clearAdditionColumn () {
      this.sequenceOptions = []
      this.sequenceId = null
    },

    clearCurrentPlaylist () {
      this.currentPlaylist = {}
      this.currentShots = {}
    },

    resetPlaylist () {
      this.clearCurrentPlaylist()
      this.setCurrentPlaylist()
    },

    addPlaylist () {
      const newPlaylist = {
        name: moment().format('YYYY-MM-DD HH:mm'),
        production_id: this.currentProduction.id
      }

      if (this.isTVShow && this.currentEpisode) {
        newPlaylist.episode_id = this.currentEpisode.id
      }

      this.loading.addPlaylist = true
      this.errors.addPlaylist = false
      this.newPlaylist({
        data: newPlaylist,
        callback: (err, playlist) => {
          if (err) this.errors.addPlaylist = true
          this.$router.push(this.getPlaylistPath(playlist.id))
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

    setCurrentPlaylist (callback) {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap[playlistId]
      if (playlist) {
        this.loadPlaylist({
          playlist,
          callback: (err, playlist) => {
            if (err) console.log(err)
            this.currentPlaylist = playlist
            this.rebuildCurrentShots()
            if (callback) callback()
          }
        })
      } else {
        this.currentPlaylist = {
          name: this.$t('playlists.no_selection')
        }
        this.currentShots = {}
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
        this.$router.push(this.playlistsPath)
      }
    },

    setAdditionSequences () {
      let sequences = []
      if (this.isTVShow && this.currentEpisode) {
        sequences = this.sequences.filter((sequence) => {
          return sequence.parent_id === this.currentEpisode.id
        })
      } else {
        sequences = this.sequences
      }

      this.sequenceOptions = sequences.map(
        (sequence) => { return { label: sequence.name, value: sequence.id } }
      )

      if (sequences.length > 0) {
        this.sequenceId = sequences[0].id
      } else {
        this.sequenceId = null
      }
    },

    setAdditionShots () {
      this.sequenceShots = Object.values(this.shotMap).filter((shot) => {
        return shot.sequence_id === this.sequenceId
      })
    },

    addShot (shot) {
      if (this.currentPlaylist.id && !this.currentShots[shot.id]) {
        this.loadShotPreviewFiles({
          playlist: this.currentPlaylist,
          shot,
          callback: (err, previewFiles) => {
            if (err) console.log(err)
            this.addShotPreviewToPlaylist({
              playlist: this.currentPlaylist,
              previewFiles: previewFiles,
              shot,
              callback: () => {
                this.rebuildCurrentShots()
              }
            })
          }
        })
      }
    },

    removeShot (shot) {
      if (shot.preview_file_id) {
        this.removeShotPreviewFromPlaylist({
          playlist: this.currentPlaylist,
          shot,
          callback: () => {
            delete this.currentShots[shot.id]
            this.currentShots = {...this.currentShots}
          }
        })
      }
    },

    onPreviewChanged (shot, previewFileId) {
      this.changePlaylistPreview({
        playlist: this.currentPlaylist,
        shot,
        previewFileId
      })
      this.rebuildCurrentShots()
    },

    rebuildCurrentShots () {
      this.currentShots = {}
      if (this.currentPlaylist && this.currentPlaylist.shots) {
        this.currentPlaylist.shots.forEach((shotPreview) => {
          const shot = this.shotMap[shotPreview.shot_id]
          if (shot) {
            this.currentShots[shotPreview.shot_id] = {
              id: shotPreview.shot_id,
              name: shot.name,
              sequence_name: shot.sequence_name,
              entity_name: shot.tasks[0].entity_name,
              preview_files: shotPreview.preview_files,
              preview_file_id: shotPreview.preview_file_id || shot.preview_file_id,
              preview_file_extension: shotPreview.extension || shot.preview_file_extension,
              preview_file_task_id: shotPreview.task_id || shot.preview_file_task_id
            }
          }
        })
      }
    },

    getShotNumber () {
      return Object.keys(this.currentShots).length
    },

    loadShotsData (callback) {
      this.loadShots(() => {
        if (this.episodes.length > 0 || !this.isTVShow) {
          this.setAdditionSequences()
        }

        this.loadPlaylistsData()
        if (callback) callback()
      })
    },

    loadPlaylistsData () {
      this.loading.playlists = true
      this.loadPlaylists((err) => {
        if (err) this.errors.loadPlaylists = true
        this.loading.playlists = false
        if (!err) {
          this.setCurrentPlaylist(() => {
            if (!this.currentPlaylist || !this.currentPlaylist.id) {
              this.goFirstPlaylist()
            }
          })
        }
      })
    },

    getPlaylistPath (playlistId, section) {
      let route = {
        name: section ? `${section}-playlist` : 'playlist',
        params: {
          production_id: this.currentProduction.id,
          playlist_id: playlistId
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${route.name}`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    }
  },

  mounted () {
    this.setAdditionSequences()
    setTimeout(() => { // Needed to ensure playlist is loaded after topbar
      this.loadShotsData(() => {
        this.resetPlaylist()
      })
    }, 0)
  },

  watch: {
    $route () {
      this.setCurrentPlaylist()
    },

    sequenceId () {
      this.setAdditionShots()
    },

    currentProduction () {
      this.setAdditionSequences()
      this.loadShotsData(() => {
        this.resetPlaylist()
      })
    },

    currentEpisode () {
      if (this.currentEpisode) {
        this.setAdditionSequences()
        this.loadShotsData(() => {
          this.resetPlaylist()
        })
      }
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''} ` +
               `- ${this.currentEpisode ? this.currentEpisode.name : ''} |` +
               ` ${this.$t('playlists.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` ${this.$t('playlists.title')}` +
               ` - Kitsu`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .playlist-item {
    background: #46494F;
    box-shadow: 0px 0px 6px #333;
    border-color: $dark-grey;
    color: $white-grey;
  }

  .playlist-list-column {
    background: $dark-grey-light;
    border-color: $dark-grey;
    box-shadow: 0px 0px 6px #333;
  }

  .addition-column {
    background: $dark-grey-light;
    border-left: 1px solid $dark-grey;
    box-shadow: 0px 0px 6px #333;
  }

  span.thumbnail-picture {
    box-shadow: 0px 0px 6px #333;
  }
}

.page {
  display: flex;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}

.page .columns {
  margin-bottom: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-list-column {
  max-width: 300px;
  background: #F4F5F9;
  overflow-y: auto;
  padding: 2em 1em 1em 2em;
  border-right: 1px solid #DDD;
  box-shadow: 0px 0px 6px #F0F0F0;
}

.playlist-item {
  display: block;
  background: white;
  padding: 1em;
  margin: 0.2em;
  border: 1px solid $white-grey;
  box-shadow: 0px 0px 6px #DDD;
  color: $grey-strong;
}

.playlist-item.selected {
  border-right: 3px solid $light-green;
}

.addition-column {
  max-width: 200px;
  background: #F4F5F9;
  overflow-y: auto;
  border-left: 1px solid #DDD;
  box-shadow: 0px 0px 6px #F0F0F0;
}

.addition-shot {
  cursor: pointer;
  text-align: center;
  margin-bottom: 0.5em;
  opacity: 0.5
}

.addition-shot:hover {
  opacity: 0.75
}

.addition-shot.playlisted {
  opacity: 1
}

span.thumbnail-picture {
  box-shadow: 0px 0px 6px #DDD;
  margin-bottom: 2px;
}

.playlist-column {
  margin-top: 10px;
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.playlist-list-column .button {
  width: 100%;
}

.addition-column .thumbnail-empty {
  margin-left: 1.5em;
}

.addition-header {
  padding: 0 1.5em;
}

.addition-header .subtitle {
  margin-top: 1.5em;
}
</style>
