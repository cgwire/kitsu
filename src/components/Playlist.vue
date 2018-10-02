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
        >
          <plus-icon class="icon is-small"></plus-icon>
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
        <spinner v-else></spinner>
        <error-text
          text="$t('playlists.loading_error')"
          v-if="errors.playlistLoading"
        />
      </div>

      <div class="playlist-column column">
        <div class="playlist-header flexrow">
          <div class="flexrow-item playlist-name">
            {{ currentPlaylist.name }}
          </div>
          <div class="flexrow-item">
            <button-link
              :path="editPath"
              class="edit-button"
              icon="edit"
              v-if="currentPlaylist.id"
            />
          </div>
          <div class="flexrow-item">
            <button-link
              :path="deletePath"
              class="delete-button"
              icon="delete"
              v-if="currentPlaylist.id"
            />
          </div>
        </div>

        <div class="has-text-centered player">
          <div
            :class="{
              'video-wrapper': true,
              'is-hidden': Object.keys(currentShots).length === 0
            }"
          >
            <video
              class="video-player"
              ref="videoPlayer"
              src=""
              @ended="playNext"
              controls
            >
            </video>
            <p v-if="Object.values(currentShots)[currentShot]">
            {{ Object.values(currentShots)[currentShot].entity_name }}
            </p>
          </div>
          <p
            :class="{
              'is-hidden': Object.keys(currentShots).length > 0 || !currentPlaylist.id
            }"
          >
            {{ $t('playlists.select_shot') }}
          </p>
        </div>
        <div class="playlisted-shots flexrow">
          <div
            class="flexrow-item has-text-centered"
            :key="shot.id"
            v-for="(shot, index) in playlistedShots"
          >
            <playlisted-shot
              :index="index"
              :shot="shot"
              :is-playing="currentShot === index"
              @play-click="playShot"
              @remove-click="removeShot"
              @preview-changed="onPreviewChanged"
            />
          </div>
        </div>
      </div>

      <div class="addition-column column">
        <page-subtitle :text="$t('playlists.add_shots')" />

        <spinner v-if="isShotsLoading" />
        <div v-else>
          <div class="flexrow" v-if="episodes.length > 0">
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

    <edit-playlist-modal
      :active="modals.isEditDisplayed"
      :is-loading="loading.editPlaylist"
      :is-error="errors.editError"
      :cancel-route="currentPlaylistRoute"
      :playlist-to-edit="currentPlaylist"
      @confirm="runEditPlaylist"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.deletePlaylist"
      :is-error="errors.deletePlaylist"
      :cancel-route="currentPlaylistRoute"
      :text="deleteText"
      :error-text="$t('playlists.delete_error')"
      @confirm="removePlaylist"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

import moment from 'moment-timezone'
import { PlusIcon } from 'vue-feather-icons'

import ButtonLink from './widgets/ButtonLink'
import Combobox from './widgets/Combobox'
import DeleteModal from './widgets/DeleteModal'
import EditPlaylistModal from './modals/EditPlaylistModal'
import EntityThumbnail from './widgets/EntityThumbnail'
import ErrorText from './widgets/ErrorText'
import PageSubtitle from './widgets/PageSubtitle'
import PageTitle from './widgets/PageTitle'
import PlaylistedShot from './playlists/PlaylistedShot'
import Spinner from './widgets/Spinner'

export default {
  name: 'productions',

  components: {
    ButtonLink,
    Combobox,
    DeleteModal,
    EditPlaylistModal,
    EntityThumbnail,
    ErrorText,
    PageSubtitle,
    PageTitle,
    PlaylistedShot,
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
      },
      playerOptions: {
        muted: true,
        fluid: true,
        sources: []
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
      'playlistMap',
      'playlists',
      'playlistsPath',
      'sequences',
      'shotMap',
      'taskTypeMap'
    ]),

    deleteText () {
      if (this.currentPlaylist) {
        return this.$t('playlists.delete_text', {
          name: this.currentPlaylist.name
        })
      } else {
        return ''
      }
    },

    playlistedShots () {
      return Object.values(this.currentShots)
    },

    player () {
      return this.$refs.videoPlayer
    },

    currentPlaylistRoute () {
      if (this.currentPlaylist.id) {
        return this.getPlaylistPath(this.currentPlaylist.id)
      } else {
        return this.playlistsPath
      }
    },

    currentMovieSrc () {
      if (this.currentShots.length > 0) {
        const currentIndex = this.currentShot
        const currentShot = this.currentShots[currentIndex]
        const previewId = currentShot.preview_file_id
        return `/api/movies/originals/preview-files/${previewId}.mp4`
      } else {
        return ''
      }
    },

    editPath () {
      return this.getPlaylistPath(this.currentPlaylist.id, 'edit')
    },

    deletePath () {
      return this.getPlaylistPath(this.currentPlaylist.id, 'delete')
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
      this.handleModalsDisplay()
      this.clearCurrentPlaylist()
      this.setCurrentPlaylist()
      this.configurePlayer()
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

    runEditPlaylist (form) {
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.editPlaylist({
        data: {
          name: form.name,
          id: this.currentPlaylist.id
        },
        callback: (err) => {
          if (err) this.errors.editPlaylist = true
          this.loading.editPlaylist = false
          this.$router.push(this.currentPlaylistRoute)
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
            this.configurePlayer()
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

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      this.modals.isDeleteDisplayed = false
      this.modals.isEditDisplayed = false
      if (path.indexOf('delete') > 0) {
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.modals.isEditDisplayed = true
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
                this.configurePlayer()
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
            this.currentShots = {}
            setTimeout(() => {
              this.rebuildCurrentShots()
            }, 100)
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
      this.configurePlayer()
    },

    rebuildCurrentShots () {
      this.currentShots = {}
      if (this.currentPlaylist) {
        this.currentPlaylist.shots.forEach((shotPreview) => {
          const shot = this.shotMap[shotPreview.shot_id]
          this.currentShots[shotPreview.shot_id] = {
            id: shotPreview.shot_id,
            name: shot.name,
            entity_name: shot.tasks[0].entity_name,
            preview_files: shotPreview.preview_files,
            preview_file_id: shotPreview.preview_file_id || shot.preview_file_id
          }
        })
      }
    },

    getMoviePath () {
      const currentIndex = this.currentShot
      if (this.currentShots && Object.keys(this.currentShots).length > 0) {
        const currentShotId = Object.keys(this.currentShots)[currentIndex]
        const currentShot = this.currentShots[currentShotId]
        const previewId = currentShot.preview_file_id
        return `/api/movies/originals/preview-files/${previewId}.mp4`
      } else {
        return ''
      }
    },

    playNext () {
      let currentIndex = this.currentShot + 1
      if (currentIndex >= Object.keys(this.currentShots).length) {
        currentIndex = 0
      }
      this.currentShot = currentIndex
      this.player.src = this.getMoviePath()
      this.player.play()
    },

    configurePlayer () {
      const moviePath = this.getMoviePath()
      this.player.src = moviePath
    },

    onPlayerReady (player) {
      if (this.player) {
        this.player.on('playlistitem', () => {
          this.onCurrentShotChange()
        })
      }
    },

    playShot (shotIndex) {
      if (this.player) {
        this.currentShot = shotIndex
        this.player.src = this.getMoviePath()
        this.player.play()
      }
    },

    loadShotsData (callback) {
      this.loadShots(() => {
        if (this.episodes.length > 0) {
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
          this.handleModalsDisplay()
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
    this.loadShotsData(() => {
      this.resetPlaylist()
    })
  },

  watch: {
    $route () {
    },

    sequenceId () {
      this.setAdditionShots()
    },

    currentEpisode () {
      this.setAdditionSequences()
      this.loadShotsData(() => {
        this.resetPlaylist()
      })
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction.name} - ${this.currentEpisode.id} |` +
               ` ${this.$t('playlists.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction.name} ${this.$t('playlists.title')}` +
               ` - Kitsu`
      }
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
  margin-bottom: 0;
  flex: 1;
}

.title {
  border-bottom: 2px solid #DDD;
  padding-bottom: 7px;
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
  border: 1px solid #EEE;
  box-shadow: 0px 0px 6px #DDD;
  color: #666;
}

.playlist-item.selected {
  border-right: 3px solid #67BE4B;
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
  padding: 2em 1.5em 1.5em 1.5em;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.playlist-list-column .button {
  width: 100%;
}

.playlist-header {
  align-items: center;
  border-bottom: 1px solid #CCC;
  padding-bottom: 0.5em;
  margin-bottom: 1em;
  min-height: 50px;
}

.video-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.video-wrapper video {
  max-height: calc(100vh - 450px);
}

.playlist-name {
  flex: 1;
  font-size: 1.5em;
}

.player {
  flex: 1;
  overflow-y: hidden;
}

.playlisted-shots {
  min-height: 150px;
  margin-top: 1em;
  overflow-x: auto;
}
</style>
