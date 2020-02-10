<template>
  <div class="productions page fixed-page">
    <div class="columns">
      <div class="playlist-list-column column" v-if="playlists.length > 0">
        <button
          :class="{
            button: true,
            'is-loading': loading.addPlaylist
          }"
          @click="showAddModal"
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
              'for-client': playlist.for_client || false,
              selected: playlist.id === currentPlaylist.id
            }"
            v-for="playlist in playlists"
          >
            <span>
              {{ playlist.name }}
            </span>
            <span class="playlist-date" title="last modified">
              {{ $t('playlists.updated_at') }}
              {{ formatDate(playlist.updated_at) }}
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

      <div
        class="playlist-column no-selection"
        v-if="playlists.length > 0 && !currentPlaylist.id"
      >
        <h2>{{ $t('playlists.last_creation') }}</h2>
        <div class="flexrow" v-if="!loading.playlists">
          <router-link
            class="recent-playlist flexrow-item"
            :key="'recent-playlist-' + playlist.id"
            :to="getPlaylistPath(playlist.id)"
            v-for="playlist in lastPlaylistsCreated"
          >
            <light-entity-thumbnail
              :preview-file-id="playlist.first_preview_file_id"
              type="previews"
              width="300px"
              height="auto"
              empty-height="150px"
            />
            <h3>{{ playlist.name }}</h3>
            <span>
              {{ $t('playlists.created_at') }}
              {{ formatDate(playlist.created_at) }}
            </span>
          </router-link>
        </div>
        <spinner class="mt2" v-else />

        <h2>{{ $t('playlists.last_modification') }}</h2>
        <div class="flexrow" v-if="!loading.playlists">
          <router-link
            class="recent-playlist flexrow-item"
            :key="'recent-modified-playlist-' + playlist.id"
            :to="getPlaylistPath(playlist.id)"
            v-for="playlist in lastPlaylistsUpdated"
          >
            <light-entity-thumbnail
              :preview-file-id="playlist.first_preview_file_id"
              type="previews"
              width="300px"
              height="auto"
              empty-height="150px"
            />
            <h3>{{ playlist.name }}</h3>
            <span>
              {{ $t('playlists.updated_at') }}
              {{ formatDate(playlist.updated_at) }}
            </span>
          </router-link>
        </div>
        <spinner class="mt2" v-else />
      </div>
      <div
        class="playlist-column no-selection has-text-centered"
        v-else-if="playlists.length === 0"
      >
        <div v-if="!loading.playlists">
          <p class="empty-explaination">
            {{ $t('playlists.no_playlist') }}
          </p>
          <button
            :class="{
              big: true,
              button: true,
              'is-loading': loading.addPlaylist
            }"
            @click="showAddModal"
            key="new-playlist-button"
            v-if="isCurrentUserManager"
          >
            {{ $t('playlists.new_playlist') }}
          </button>
        </div>
        <spinner class="mt2" v-else />
      </div>

      <div class="playlist-column column" v-else>
        <playlist-player
          ref="playlist-player"
          :playlist="currentPlaylist"
          :shots="currentShots"
          :is-loading="loading.playlist"
          :is-adding-shot="isAddingShot"
          @edit-clicked="showEditModal"
          @show-add-shots="toggleAddShots"
          @preview-changed="onPreviewChanged"
          @playlist-deleted="goFirstPlaylist"
          @remove-shot="removeShot"
          @order-change="onOrderChange"
          @annotationchanged="onAnnotationChanged"
          @for-client-changed="onForClientChanged"
        />

        <div
          v-if="isCurrentUserManager && isAddingShot"
        >
          <div class="addition-header">
            <div class="flexrow">
              <page-subtitle
                class="flexrow-item"
                :text="$t('playlists.add_shots')"
              />
              <span class="filler"></span>
              <button
              />
              <a
                class="close-button"
                @click="toggleAddShots"
              >
                <x-icon />
              </a>
            </div>
            <div class="flexrow">
              <search-field
                class="flexrow-item"
                ref="search-field"
                :can-save="false"
                @change="onSearchChange"
                placeholder="ex: seq01 anim=wfa"
              />
              <button
                :class="{
                  button: true,
                  'flexrow-item': true,
                  'add-sequence': true
                }"
                :disabled="isAdditionLoading"
                @click="addCurrentSelection"
                v-if="shotSearchText"
              >
                {{ $t('playlists.add_selection') }}
              </button>
              <span class="filler"></span>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': this.loading.addEpisode
                }"
                :disabled="isAdditionLoading"
                @click="addEpisodePending"
                v-if="isTVShow"
              >
                {{ $t('playlists.add_episode') }}
              </button>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': this.loading.addMovie
                }"
                :disabled="isAdditionLoading"
                @click="addMovie"
                v-else
              >
                {{ $t('playlists.add_movie') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="addition-section"
          v-if="isCurrentUserManager && isAddingShot"
        >
          <spinner
            class="mt2"
            key="shot-loader"
            v-if="isShotsLoading"
          />
          <div
            v-else
          >
            <div>
              <div
                :key="'sequence-' + i"
                v-for="(sequenceShots, i) in displayedShotsBySequence"
              >
                <h2
                  class="sequence-title"
                  v-if="sequenceShots.length > 0"
                >
                   {{ sequenceShots[0].sequence_name }}
                  <button
                    class="button"
                    @click="addSequence(sequenceShots)"
                    :key="'add-sequence-button-' + sequenceShots[0].sequence_id"
                    v-if="isCurrentUserManager"
                  >
                    {{ $t('playlists.add_sequence') }}
                  </button>
                </h2>
                <div
                 class="addition-shots"
                >
                  <div
                    :class="{
                      'addition-shot': true,
                      playlisted: currentShots[shot.id] !== undefined
                    }"
                    :key="shot.id"
                    @click.prevent="addShotToPlaylist(shot)"
                    v-for="shot in sequenceShots"
                  >
                      <light-entity-thumbnail
                        :preview-file-id="shot.preview_file_id"
                        width="150px"
                        height="100px"
                      />
                    <span class="playlisted-shot-name">{{ shot.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <edit-playlist-modal
      ref="edit-playlist-modal"
      :active="modals.isEditDisplayed"
      :is-loading="loading.editPlaylist"
      :is-error="errors.editPlaylist"
      :playlist-to-edit="playlistToEdit"
      @cancel="hideEditModal"
      @confirm="confirmEditPlaylist"
    />

  </div>
</template>
<script>
import Vue from 'vue'
import firstBy from 'thenby'
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import { PlusIcon, XIcon } from 'vue-feather-icons'
import { formatDate } from '../../lib/time'
import {
  updateModelFromList,
  removeModelFromList
} from '../../lib/models'

import EditPlaylistModal from '../modals/EditPlaylistModal'
import ErrorText from '../widgets/ErrorText'
import LightEntityThumbnail from '../widgets/LightEntityThumbnail'
import PageSubtitle from '../widgets/PageSubtitle'
import PlaylistPlayer from './playlists/PlaylistPlayer'
import SearchField from '../widgets/SearchField'
import Spinner from '../widgets/Spinner'

export default {
  name: 'productions',

  components: {
    ErrorText,
    EditPlaylistModal,
    LightEntityThumbnail,
    PageSubtitle,
    PlaylistPlayer,
    PlusIcon,
    SearchField,
    Spinner,
    XIcon
  },

  data () {
    return {
      currentPlaylist: { name: this.$t('playlists.no_selection') },
      currentShot: 0,
      currentShots: {},
      isAddingShot: true,
      playlistToEdit: {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      },
      sequenceId: null,
      sequenceOptions: [],
      sequenceShots: [],
      modals: {
        isDeleteDisplayed: false,
        isEditDisplayed: false
      },
      loading: {
        addPlaylist: false,
        addDaily: false,
        addEpisode: false,
        addMovie: false,
        addSequence: false,
        addWeekly: false,
        deletePlaylist: false,
        editPlaylist: false,
        playlist: false,
        playlists: false
      },
      errors: {
        addPlaylist: false,
        editPlaylist: false,
        deletePlaylist: false,
        playlistLoading: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedShots',
      'displayedShotsBySequence',
      'episodes',
      'isShotsLoading',
      'isTVShow',
      'isCurrentUserManager',
      'playlistMap',
      'playlists',
      'playlistsPath',
      'playlistMap',
      'sequences',
      'shotsByEpisode',
      'shotSearchText',
      'shotMap',
      'taskTypeMap'
    ]),

    isAdditionLoading () {
      return (
        this.loading.addSequence ||
        this.loading.addWeekly ||
        this.loading.addDaily ||
        this.loading.addEpisode
      )
    },

    lastPlaylistsUpdated () {
      return this.playlists
        .concat()
        .sort(firstBy('updated_at'))
        .reverse()
        .slice(0, 3)
    },

    lastPlaylistsCreated () {
      return this.playlists.slice(0, 3)
    },

    playlistPlayer () {
      return this.$refs['playlist-player']
    }
  },

  methods: {
    ...mapActions([
      'addNewBuildJob',
      'addShotPreviewToPlaylist',
      'changePlaylistOrder',
      'changePlaylistPreview',
      'displayMoreShots',
      'editPlaylist',
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
      'setShotSearch',
      'updatePreviewAnnotation'
    ]),

    formatDate (dateString) {
      return formatDate(dateString)
    },

    getPlaylistPath (playlistId, section) {
      const route = {
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
      const loadPlaylists = () => {
        this.loadPlaylistsData()
        if (callback) callback()
      }

      if (this.sequences.length === 0) {
        this.loadShots(loadPlaylists)
      } else {
        loadPlaylists()
      }
    },

    loadPlaylistsData () {
      const setFirstPlaylist = () => {
        this.setCurrentPlaylist(() => {
          if (!this.currentPlaylist || !this.currentPlaylist.id) {
            this.goFirstPlaylist()
          }
        })
      }
      if (this.playlists.length === 0) {
        this.loading.playlists = true
        this.loadPlaylists((err) => {
          if (err) this.errors.loadPlaylists = true
          this.loading.playlists = false
          if (!err) setFirstPlaylist()
        })
      } else {
        setFirstPlaylist()
      }
    },

    rebuildCurrentShots () {
      this.currentShots = {}
      const tmpShots = {}
      if (this.currentPlaylist && this.currentPlaylist.shots) {
        this.currentPlaylist.shots.forEach((shotPreview) => {
          this.addShotToCurrentShots(shotPreview, tmpShots)
        })
      }
      this.$nextTick(() => {
        this.currentShots = tmpShots
      })
    },

    /*
     * Add to current playlist the shot related to given preview.
     * Use given preview as current preview for this shot and store other
     * previews in given shot.
     */
    addShotToCurrentShots (previewFile, playlistShotMap) {
      const shot = this.shotMap[previewFile.shot_id]
      if (shot) {
        const entityName =
          shot.tasks.length > 0 ? shot.tasks[0].entity_name : shot.name
        const playlistShot = {
          id: previewFile.shot_id,
          name: shot.name,
          sequence_name: shot.sequence_name,
          entity_name: entityName,
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
        Vue.set(playlistShotMap, previewFile.shot_id, playlistShot)
        console.log(this.currentShots[shot.id])
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

    setCurrentPlaylist (callback) {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap[playlistId]
      this.loading.playlist = true
      if (playlist) {
        this.loadPlaylist({
          playlist,
          callback: (err, playlist) => {
            this.loading.playlist = false
            if (err) console.error(err)
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
      if (!this.currentShots[shot.id]) {
        this.$options.silent = true
        this.addShot(shot)
          .then(() => {
            this.playlistPlayer.scrollToRight()
            setTimeout(() => {
              this.$options.silent = false
            }, 500)
          })
      }
    },

    addCurrentSelection (sequenceShots) {
      this.$options.silent = true
      const currentShotMap = {}
      this.displayedShots.forEach((shot) => {
        currentShotMap[shot.id] = true
      })
      const shots = Object.values(this.shotMap)
        .filter(s => currentShotMap[s.id] === true)
        .reverse()

      this.addShots(shots, () => {
        this.$options.silent = false
      })
    },

    addSequence (sequenceShots) {
      if (sequenceShots.length > 0) {
        const sequenceId = sequenceShots[0].sequence_id
        const shots = Object.values(this.shotMap)
          .filter(s => s.sequence_id === sequenceId)
          .sort(firstBy('name'))
          .reverse()
        this.$options.silent = true
        this.addShots(shots, () => {
          this.$options.silent = false
        })
      }
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

    addEpisodePending () {
      this.loading.addEpisode = true
      this.$options.silent = true
      const shots = [].concat(...this.shotsByEpisode).reverse()
      this.addShots(shots, () => {
        this.loading.addEpisode = false
        this.$options.silent = false
      })
    },

    addMovie () {
      this.loading.addMovie = true
      this.$options.silent = true
      const shots = Object.values(this.shotMap)
      this.addShots(shots, () => {
        this.loading.addMovie = false
        this.$options.silent = false
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
    },

    onForClientChanged (forClient) {
      this.editPlaylist({
        data: {
          id: this.currentPlaylist.id,
          for_client: forClient
        }
      })
    },

    toggleAddShots () {
      this.isAddingShot = !this.isAddingShot
    },

    onSearchChange (searchQuery) {
      if (searchQuery.length > 1) {
        this.setShotSearch(searchQuery)
        this.displayMoreShots()
      } else {
        this.setShotSearch('')
      }
    },

    confirmEditPlaylist (form) {
      if (this.playlistToEdit.id) {
        form.id = this.currentPlaylist.id
        this.runEditPlaylist(form)
      } else {
        this.runAddPlaylist(form)
      }
    },

    runEditPlaylist (form) {
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.editPlaylist({
        data: {
          name: form.name,
          for_client: form.for_client,
          id: form.id
        },
        callback: (err, playlist) => {
          if (err) this.errors.editPlaylist = true
          this.loading.editPlaylist = false
          this.modals.isEditDisplayed = false
          Object.assign(this.currentPlaylist, playlist)
        }
      })
    },

    runAddPlaylist (form) {
      const newPlaylist = {
        name: form.name,
        production_id: this.currentProduction.id,
        for_client: form.for_client
      }
      if (this.isTVShow && this.currentEpisode) {
        newPlaylist.episode_id = this.currentEpisode.id
      }
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.newPlaylist({
        data: newPlaylist,
        callback: (err, playlist) => {
          if (err) this.errors.editPlaylist = true
          this.$router.push(this.getPlaylistPath(playlist.id))
          this.loading.editPlaylist = false
          this.modals.isEditDisplayed = false
        }
      })
    },

    showAddModal () {
      this.playlistToEdit = {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      }
      this.$refs['edit-playlist-modal'] = true
      this.modals.isEditDisplayed = true
    },

    showEditModal () {
      this.playlistToEdit = this.currentPlaylist
      this.modals.isEditDisplayed = true
    },

    hideEditModal () {
      this.playlistToEdit = {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      }
      this.modals.isEditDisplayed = false
    }
  },

  mounted () {
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

    currentPlaylist () {
      if (this.currentPlaylist.shots) {
        this.isAddingShot = this.currentPlaylist.shots.length === 0
      }
    },

    currentProduction () {
      this.$store.commit('LOAD_SEQUENCES_END', [])
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      this.loadShotsData(() => {
        this.resetPlaylist()
      })
    },

    currentEpisode () {
      this.$store.commit('LOAD_SEQUENCES_END', [])
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      if (this.currentEpisode) {
        this.loadShotsData(() => {
          this.resetPlaylist()
        })
      }
    },

    isAddingShot () {
      if (!this.isAddingShot) {
        this.resetPlaylist()
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
               ' - Kitsu'
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
          /*
          this.refreshPlaylist(eventData.playlist_id)
            .then((playlist) => {
              if (this.currentPlaylist.id === playlist.id) {
                Object.assign(this.currentPlaylist, playlist)
                this.rebuildCurrentShots()
              }
            })
          */
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
    background: $dark-grey-lightmore;
    box-shadow: 0px 0px 6px #333;
    border-color: $dark-grey;
    color: $white-grey;

    &.for-client {
      background: $purple-grey;
      border: 1px solid $dark-grey;
    }

    &.selected {
      border-right: 3px solid $dark-green;
    }
  }

  .playlist-list-column {
    background: $dark-grey-light;
    border-color: $dark-grey;
    box-shadow: 0px 0px 6px #333;
  }

  .playlist-column.no-selection {
    background: $dark-grey-light;
    overflow-x: scroll;

    h2 {
      color: white;
    }

    .recent-playlist {
      background: $dark-grey-lightmore;
      border: 2px solid $dark-grey;
      box-shadow: 0px 0px 6px #333;

      h3 {
        color: white;
      }
    }
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
  margin-top: 0px;
  margin-bottom: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-list-column {
  max-width: 300px;
  background: #F4F5F9;
  overflow-y: auto;
  padding: 1em 1em 1em 2em;
  border-right: 1px solid #DDD;
  box-shadow: 0px 0px 6px #F0F0F0;
  z-index: 201;
}

.playlist-item {
  display: block;
  background: white;
  padding: 0.4em;
  margin: 0.2em;
  border: 1px solid $white-grey;
  box-shadow: 0px 0px 6px #DDD;
  color: $grey-strong;

  &.for-client {
    background: $purple-light;
    border: 1px solid $purple;
  }
}

.playlist-item.selected {
  border-right: 3px solid $light-green;
}

.playlist-list-column .button {
  width: 100%;
}

.addition-shots {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  flex-direction: row;
  max-width: 100%;
  padding-left: 1em;
}

.addition-shot {
  padding: 0;
  cursor: pointer;
  text-align: center;
  margin: 0;
  opacity: 0.5;
  width: 170px;
  display: flex;
  flex-direction: column;
  border: 0px solid transparent;

  a {
    margin: auto;
  }

  &:hover {
    opacity: 0.75
  }

  &.playlisted {
    opacity: 1;

    img,
    span.thumbnail-picture {
      border: 2px solid $purple;
    }
  }
}

span.thumbnail-picture {
  box-shadow: 0px 0px 6px #DDD;
  margin-bottom: 2px;
}

.addition-header {
  padding: 0 1em;

  .subtitle {
    margin-top: 1em;
  }
}

.select-sequence-combobox {
  margin-bottom: 1em;
}

.add-sequence {
  margin-bottom: 0.4em;
}

.playlist-column {
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.playlist-column:last-child {
  padding-right: 0.7em;
}

.playlisted-shot-name {
  padding-right: 20px;
}

.playlist-date {
  display: block;
  color: $grey;
  font-size: 0.8em;
}

.sequence-title {
  border-bottom: 1px solid $light-grey-light;
  color: $grey;
  margin: 1em;
  padding-bottom: 0.2em;
  text-transform: uppercase;

  button {
    color: $grey;
    padding: 0.3em 0.8em;
    font-size: 0.7em;
  }
}

.addition-header {
  height: 110px;
}

.addition-section {
  overflow-y: auto;
  height: calc(100% - 420px);
}

h2 {
  font-weight: bold;
  text-transform: uppercase;
  color: $grey;
}

.playlist-column.no-selection {
  padding: 2em;
  overflow: auto;
  background: #F4F5F9;

  h2 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 0.3em;
  }

  .recent-playlist {
    width: 333px;
    background: white;
    border: 2px solid $light-grey-light;
    box-shadow: 0px 0px 6px #DDD;
    border-radius: 1em;
    padding: 1em;

    h3 {
      color: $grey-strong;
      font-size: 1.2em;
      font-weight: bold;
    }
    span {
      display: block;
    }
  }

  .empty-explaination {
    margin-top: 4em;
    font-size: 1.5em;
  }

  .big {
    font-size: 1.2em;
    margin-top: 1em;
    padding: 0.5em 1em;
    height: auto;
  }
}
</style>
