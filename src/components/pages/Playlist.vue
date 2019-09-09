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
          key="new-playlist-button"
          v-if="isCurrentUserManager"
        >
          <plus-icon class="icon is-small" />
          {{ $t('playlists.new_playlist') }}
        </button>

        <div
          class="playlists"
          v-if="!loading.playlists"
        >
          <router-link
            :key="playlist.id"
            :to="getPlaylistPath(playlist.id)"
            :class="{
              'playlist-item': true,
              selected: playlist.id === currentPlaylist.id
            }"
            v-for="playlist in playlists"
          >
            <span>
            {{ playlist.name }}
            </span>
            <span class="playlist-date">
            {{ formatDate(playlist.created_at)}}
            </span>
          </router-link>
        </div>
        <spinner
          class="mt2"
          v-else
        />
        <error-text
          text="$t('playlists.loading_error')"
          v-if="errors.playlistLoading"
        />
      </div>

      <div class="playlist-column column">
        <playlist-player
          ref="playlist-player"
          :playlist="currentPlaylist"
          :shots="currentShots"
          :is-loading="loading.playlist"
          @preview-changed="onPreviewChanged"
          @playlist-deleted="goFirstPlaylist"
          @remove-shot="removeShot"
          @order-change="onOrderChange"
          @annotationchanged="onAnnotationChanged"
        />
      </div>

      <div
        class="addition-column column"
        v-if="isCurrentUserManager"
      >
        <spinner
          class="mt2"
          key="shot-loader"
          v-if="isShotsLoading"
        />
        <div v-else>
          <div class="addition-header">
            <page-subtitle
              :text="$t('playlists.add_shots')"
            />
            <button
              :class="{
                button: true,
                'add-sequence': true,
                'is-loading': this.loading.addWeekly
              }"
              :disabled="isAdditionLoading"
              @click="addAllPending"
            >
              {{ $t('playlists.build_weekly') }}
            </button>
            <button
              :class="{
                button: true,
                'add-sequence': true,
                'is-loading': this.loading.addDaily
              }"
              :disabled="isAdditionLoading"
              @click="addDailyPending"
            >
              {{ $t('playlists.build_daily') }}
            </button>

            <div
              class="mt1"
              key="shot-list-header"
              v-if="episodes.length > 0 || !isTVShow"
            >
              <div>
                <combobox
                  class="select-sequence-combobox"
                  :label="$t('shots.fields.sequence')"
                  :options="sequenceOptions"
                  v-model="sequenceId"
                  v-if="sequenceOptions.length > 0"
                />
                <div v-if="sequenceOptions.length === 0">
                  {{ $t('playlists.no_sequence_for_episode') }}
                </div>
                <button
                  :class="{
                    button: true,
                    'add-sequence': true,
                    'is-loading': this.loading.addSequence
                  }"
                  :disabled="isAdditionLoading"
                  @click="addSequence"
                  v-if="sequenceOptions.length > 0"
                >
                  {{ $t('playlists.add_sequence') }}
                </button>
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
            @click.prevent="addShotToPlaylist(shot)"
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
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import { PlusIcon } from 'vue-feather-icons'
import { formatDate } from '../../lib/time'
import {
  updateModelFromList,
  removeModelFromList
} from '../../lib/models'

import Combobox from '../widgets/Combobox'
import EntityThumbnail from '../widgets/EntityThumbnail'
import ErrorText from '../widgets/ErrorText'
import PageSubtitle from '../widgets/PageSubtitle'
import PlaylistPlayer from './playlists/PlaylistPlayer'
import Spinner from '../widgets/Spinner'

export default {
  name: 'productions',

  components: {
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
      currentPlaylist: { name: this.$t('playlists.no_selection') },
      currentShot: 0,
      currentShots: {},
      sequenceId: null,
      sequenceOptions: [],
      sequenceShots: [],
      modals: {
        isDeleteDisplayed: false,
        isEditDisplayed: false
      },
      loading: {
        playlist: false,
        playlists: false,
        addPlaylist: false,
        addDaily: false,
        addSequence: false,
        addWeekly: false,
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
      'isShotsLoading',
      'isTVShow',
      'isCurrentUserManager',
      'playlistMap',
      'playlists',
      'playlistsPath',
      'playlistMap',
      'sequences',
      'shotMap',
      'taskTypeMap'
    ]),

    isAdditionLoading () {
      return (
        this.loading.addSequence ||
        this.loading.addWeekly ||
        this.loading.addDaily
      )
    }
  },

  methods: {
    ...mapActions([
      'addNewBuildJob',
      'addShotPreviewToPlaylist',
      'changePlaylistOrder',
      'changePlaylistPreview',
      'getPending',
      'loadPlaylist',
      'loadPlaylists',
      'loadShotPreviewFiles',
      'loadShots',
      'markBuildJobAsDone',
      'newPlaylist',
      'refreshPlaylist',
      'removeShotPreviewFromPlaylist',
      'removeBuildJobFromList',
      'updatePreviewAnnotation'
    ]),

    formatDate (dateString) {
      return formatDate(dateString)
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

    rebuildCurrentShots () {
      this.currentShots = {}
      const tmpShots = {}
      if (this.currentPlaylist && this.currentPlaylist.shots) {
        this.currentPlaylist.shots.forEach((shotPreview) => {
          this.addShotToCurrentShots(shotPreview, tmpShots)
        })
      }
      this.currentShots = tmpShots
    },

    /*
     * Add to current playlist the shot related to given preview.
     * Use given preview as current preview for this shot and store other
     * previews in given shot.
     */
    addShotToCurrentShots (previewFile, playlistShotMap) {
      const shot = this.shotMap[previewFile.shot_id]
      if (shot) {
        const playlistShot = {
          id: previewFile.shot_id,
          name: shot.name,
          sequence_name: shot.sequence_name,
          entity_name: shot.tasks[0].entity_name,
          preview_files: previewFile.preview_files,
          preview_file_id:
            previewFile.id ||
            previewFile.preview_file_id ||
            shot.preview_file_id,
          preview_file_extension:
            previewFile.extension ||
            previewFile.preview_file_extension ||
            shot.preview_file_extension,
          preview_file_task_id:
            previewFile.task_id ||
            previewFile.preview_file_task_id ||
            shot.preview_file_task_id,
          preview_file_annotations:
            previewFile.annotations ||
            previewFile.preview_file_annotations ||
            shot.preview_file_annotations
        }
        playlistShotMap[previewFile.shot_id] = playlistShot
        return playlistShot
      } else {
        return null
      }
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
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
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

    setCurrentPlaylist (callback) {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap[playlistId]
      this.loading.playlist = true
      if (playlist) {
        this.loadPlaylist({
          playlist,
          callback: (err, playlist) => {
            this.loading.playlist = false
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

    clearAdditionColumn () {
      this.sequenceOptions = []
      this.sequenceId = null
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
        (sequence) => ({ label: sequence.name, value: sequence.id })
      )
      this.sequenceId = sequences.length > 0 ? sequences[0].id : null
    },

    setAdditionShots () {
      this.sequenceShots = Object.values(this.shotMap).filter((shot) => {
        return shot.sequence_id === this.sequenceId
      })
    },

    // if (this.currentPlaylist.id && !this.currentShots[shot.id]) {
    addShot (shot) {
      return this.loadShotPreviewFiles(shot)
        .then(previewFiles => this.addShotPreviewToPlaylist({
          playlist: this.currentPlaylist,
          previewFiles: previewFiles,
          shot: { ...shot }
        }))
        .then((shotPreview) => {
          return new Promise((resolve, reject) => {
            const playlistShot =
              this.addShotToCurrentShots(shotPreview, this.currentShots)
            this.$refs['playlist-player'].shotList.push(playlistShot)
            this.$nextTick(() => {
              this.$refs['playlist-player'].scrollToRight()
              resolve()
            })
          })
        })
        .catch((err) => console.error(err))
    },

    addShotToPlaylist (shot) {
      this.$options.silent = true
      this.addShot(shot)
        .then(() => {
          setTimeout(() => {
            this.$options.silent = false
          }, 500)
        })
    },

    addSequence () {
      this.$options.silent = true
      this.loading.addSequence = true
      const shots = [...this.sequenceShots].reverse()
      this.addShots(shots, () => {
        this.loading.addSequence = false
        this.$options.silent = false
      })
    },

    addAllPending () {
      this.$options.silent = true
      this.loading.addWeekly = true
      this.getPending(false)
        .then((shots) => {
          this.addShots(shots.reverse(), () => {
            this.loading.addWeekly = false
            this.$options.silent = false
          })
        })
    },

    addDailyPending () {
      this.loading.addDaily = true
      this.$options.silent = true
      this.getPending(true)
        .then((shots) => {
          this.addShots(shots.reverse(), () => {
            this.loading.addDaily = false
            this.$options.silent = false
          })
        })
    },

    addShots (shots, callback) {
      if (shots && shots.length > 0) {
        const shot = shots.pop()
        this.addShot(shot)
          .then(() => {
            this.addShots(shots, callback)
          })
      } else {
        callback()
      }
    },

    removeShot (shot) {
      this.removeShotPreviewFromPlaylist({
        playlist: this.currentPlaylist,
        shot,
        callback: () => {
          delete this.currentShots[shot.id]
        }
      })
    },

    onPreviewChanged (shot, previewFileId) {
      this.changePlaylistPreview({
        playlist: this.currentPlaylist,
        shot,
        previewFileId
      })
    },

    onOrderChange (info) {
      this.changePlaylistOrder({
        playlist: this.currentPlaylist,
        info
      })
    },

    onAnnotationChanged ({ preview, annotations }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({ taskId, preview, annotations })
    }
  },

  mounted () {
    setTimeout(() => { // Needed to ensure playlist is loaded after topbar
      this.loadShotsData(() => {
        this.setAdditionSequences()
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
      this.loadShotsData(() => {
        this.setAdditionSequences()
        this.resetPlaylist()
      })
    },

    currentEpisode () {
      if (this.currentEpisode) {
        this.loadShotsData(() => {
          this.setAdditionSequences()
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
  },

  socket: {
    events: {
      'playlist:new' (eventData) {
        if (!this.playlistMap[eventData.playlist_id]) {
          this.refreshPlaylist(eventData.playlist_id)
        }
      },

      'playlist:update' (eventData) {
        if (
          this.playlistMap[eventData.playlist_id] &&
          !this.$options.silent
        ) {
          this.refreshPlaylist(eventData.playlist_id)
            .then((playlist) => {
              if (this.currentPlaylist.id === playlist.id) {
                Object.assign(this.currentPlaylist, playlist)
                this.rebuildCurrentShots()
              }
            })
        }
      },

      'playlist:delete' (eventData) {
        this.$store.commit('DELETE_PLAYLIST_END', {
          id: eventData.playlist_id
        })
      },

      'build-job:new' (eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          this.currentPlaylist.build_jobs = [{
            id: eventData.build_job_id,
            created_at: eventData.created_at,
            status: 'running',
            playlist_id: this.currentPlaylist.id
          }].concat(this.currentPlaylist.build_jobs)
        }
      },

      'build-job:update' (eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          updateModelFromList(this.currentPlaylist.build_jobs, {
            id: eventData.build_job_id,
            status: eventData.status
          })
        }
      },

      'build-job:delete' (eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          this.currentPlaylist.build_jobs =
            removeModelFromList(this.currentPlaylist.build_jobs, {
              id: eventData.build_job_id
            })
        }
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
  z-index: 201;
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

.playlist-list-column .button {
  width: 100%;
}

.addition-column {
  max-width: 200px;
  margin-right: 12px;
  padding: 0;
  background: #F4F5F9;
  overflow-y: auto;
  border-left: 1px solid #DDD;
  box-shadow: 0px 0px 6px #F0F0F0;
  overflow-y: scroll;
  z-index: 201;
}

.addition-shot {
  padding: 0;
  cursor: pointer;
  text-align: center;
  margin: 0 0 0.5em 0;
  opacity: 0.5;
  display: flex;
  flex-direction: column;

  a {
    margin: auto;
  }

  &:hover {
    opacity: 0.75
  }

  &.playlisted {
    opacity: 1
  }
}

span.thumbnail-picture {
  box-shadow: 0px 0px 6px #DDD;
  margin-bottom: 2px;
}

.addition-column .thumbnail-empty {
  margin-left: 1.5em;
}

.addition-header {
  padding: 0 1em;

  .subtitle {
    margin-top: 1.5em;
  }
}

.select-sequence-combobox {
  margin-bottom: 1em;
}

.add-sequence {
  margin-bottom: 0.4em;
}

.playlist-column {
  margin-top: 10px;
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.playlist-date {
  display: block;
  color: $grey;
  font-size: 0.8em;
}
</style>
