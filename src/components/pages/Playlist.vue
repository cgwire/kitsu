<template>
  <div class="productions page fixed-page">
    <div class="columns">
      <div class="playlist-list-column column" v-if="playlists.length > 0">

        <div>
          <combobox
            :label="$t('main.sorted_by')"
            :options="sortOptions"
            :thin="true"
            locale-key-prefix="playlists.fields."
            v-model="currentSort"
          />
        </div>

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
            v-for="playlist in sortedPlaylists"
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
        v-if="playlists.length > 0 && !currentPlaylist.id && !loading.playlist"
      >
        <h2>{{ $t('playlists.last_creation') }}</h2>
        <div class="flexrow" v-if="!loading.playlists && !loading.playlistsInit">
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
        <div v-if="!loading.playlists && !loading.playlistsInit">
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
          :entities="currentEntities"
          :is-loading="loading.playlist"
          :is-adding-entity="isAddingEntity"
          :is-asset-playlist="isAssetPlaylist"
          @edit-clicked="showEditModal"
          @show-add-entities="toggleAddEntities"
          @preview-changed="onPreviewChanged"
          @task-type-changed="onTaskTypeChanged"
          @playlist-deleted="goFirstPlaylist"
          @remove-entity="removeEntity"
          @order-change="onOrderChange"
          @annotationchanged="onAnnotationChanged"
          @for-client-changed="onForClientChanged"
        />

        <div
          v-if="isCurrentUserManager && isAddingEntity && !loading.playlist"
        >
          <div class="addition-header">
            <div class="flexrow">
              <page-subtitle
                class="flexrow-item"
                :text="addEntitiesText"
              />
              <span class="filler"></span>
              <a
                class="close-button"
                @click="toggleAddEntities"
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
                :placeholder="isAssetPlaylist ? 'chars mode=wfa' : 'ex: seq01 anim=wfa'"
              />
              <button
                :class="{
                  button: true,
                  'flexrow-item': true,
                  'add-sequence': true
                }"
                :disabled="isAdditionLoading"
                @click="addCurrentSelection"
                v-if="isAddSearchVisible"
              >
                {{ $t('playlists.add_selection') }}
              </button>
              <span class="filler"></span>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': this.loading.addDaily
                }"
                :disabled="isAdditionLoading"
                @click="addDailyPending"
                v-if="!isAssetPlaylist"
              >
                {{ $t('playlists.build_daily') }}
              </button>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': this.loading.addEpisode
                }"
                :disabled="isAdditionLoading"
                @click="addEpisodePending"
                v-if="isTVShow && !isAssetPlaylist"
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
                v-else-if="!isAssetPlaylist"
              >
                {{ $t('playlists.add_movie') }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="addition-section"
          v-if="isCurrentUserManager && isAddingEntity"
          v-scroll="onBodyScroll"
          ref="List"
        >
          <spinner
            class="mt2"
            key="entity-loader"
            v-if="isShotsLoading || isAssetsLoading"
          />
          <div
            ref="entityListContent"
            v-else
          >
            <div v-if="isAssetPlaylist">
              <div
                :key="'asset-type-' + i"
                v-for="(typeAssets, i) in displayedAssetsByType"
              >
                <h2
                  class="entity-group-title"
                  v-if="typeAssets.length > 0"
                >
                  {{ typeAssets[0].asset_type_name }}
                  <!--button
                    class="button"
                    @click="addAsset(sequenceShots)"
                    :key="'add-sequence-button-' + sequenceShots[0].sequence_id"
                    v-if="isCurrentUserManager"
                  >
                    {{ $t('playlists.add_sequence') }}
                  </button-->
                </h2>
                <div
                 class="addition-entities"
                >
                  <div
                    :class="{
                      'addition-shot': true
                    }"
                    :key="asset.id"
                    @click.prevent="addEntityToPlaylist(asset)"
                    v-for="asset in typeAssets"
                  >
                      <light-entity-thumbnail
                        :preview-file-id="asset.preview_file_id"
                        width="150px"
                        height="100px"
                      />
                    <span class="playlisted-shot-name">{{ asset.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div
                :key="'sequence-' + i"
                v-for="(sequenceShots, i) in displayedShotsBySequence"
              >
                <h2
                  class="entity-group-title"
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
                 class="addition-entities"
                >
                  <div
                    :class="{
                      'addition-shot': true,
                      playlisted: currentEntities[shot.id] !== undefined
                    }"
                    :key="shot.id"
                    @click.prevent="addEntityToPlaylist(shot)"
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
import firstBy from 'thenby'
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import { PlusIcon, XIcon } from 'vue-feather-icons'
import { formatDate } from '../../lib/time'
import { getPlaylistPath } from '../../lib/path'
import {
  updateModelFromList,
  removeModelFromList
} from '../../lib/models'

import Combobox from '../widgets/Combobox'
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
    Combobox,
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
      currentPlaylist: { name: '' },
      currentSort: 'updated_at',
      sortOptions: [
        'updated_at',
        'created_at',
        'name'
      ].map(name => ({ label: name, value: name })),
      currentEntities: {},
      isAddingEntity: false,
      sortedPlaylists: [],
      playlistToEdit: {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      },
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
        playlists: false,
        playlistsInit: true
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
      'assetMap',
      'assetSearchText',
      'currentEpisode',
      'currentProduction',
      'displayedAssets',
      'displayedAssetsByType',
      'displayedShots',
      'displayedShotsBySequence',
      'isAssetsLoading',
      'isCurrentUserManager',
      'isShotsLoading',
      'isTVShow',
      'playlistMap',
      'playlists',
      'playlistsPath',
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

    isAssetPlaylist () {
      return this.currentPlaylist.for_entity === 'asset'
    },

    isAddSearchVisible () {
      return (
        (this.isAssetPlaylist && this.assetSearchText) ||
        (!this.isAssetPlaylist && this.shotSearchText)
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
    },

    addEntitiesText () {
      if (this.isAssetPlaylist) {
        return this.$t('playlists.add_assets')
      } else {
        return this.$t('playlists.add_shots')
      }
    },

    tvShowPageTitle () {
      const productionName =
        this.currentProduction ? this.currentProduction.name : ''
      let episodeName = ''
      if (this.currentEpisode) {
        episodeName = this.currentEpisode.name
        if (this.currentEpisode.id === 'all') episodeName = this.$t('main.all')
        if (this.currentEpisode.id === 'main') episodeName = 'Main Pack'
      }
      return `${productionName} - ${episodeName}` +
             ` | ${this.$t('playlists.title')} - Kitsu`
    },

    shortPageTitle () {
      const productionName =
        this.currentProduction ? this.currentProduction.name : ''
      return `${productionName} ${this.$t('playlists.title')} - Kitsu`
    }
  },

  methods: {
    ...mapActions([
      'addNewBuildJob',
      'pushEntityToPlaylist',
      'changePlaylistOrder',
      'changePlaylistPreview',
      'changePlaylistType',
      'displayMoreAssets',
      'displayMoreShots',
      'editPlaylist',
      'getPending',
      'loadPlaylist',
      'loadPlaylists',
      'loadEntityPreviewFiles',
      'loadShots',
      'loadAssets',
      'markBuildJobAsDone',
      'newPlaylist',
      'refreshPlaylist',
      'removeEntityPreviewFromPlaylist',
      'removeBuildJobFromList',
      'setAssetSearch',
      'setCurrentEpisode',
      'setShotSearch',
      'updatePreviewAnnotation'
    ]),

    // Helpers

    formatDate (dateString) {
      return formatDate(dateString)
    },

    getPlaylistPath (playlistId, section) {
      return getPlaylistPath(
        this.currentProduction.id,
        this.currentEpisode ? this.currentEpisode.id : null,
        playlistId,
        section
      )
    },

    // Data loading

    loadShotsData (callback) {
      if (
        this.displayedShots.length === 0 ||
        this.displayedShots[0].project_id !== this.currentProduction.id ||
        (
          this.currentEpisode &&
          this.displayedShots[0].episode_id !== this.currentEpisode.id
        )
      ) {
        if (this.isTVShow &&
            this.currentEpisode &&
            (this.currentEpisode.id === 'main' ||
            this.currentEpisode.id === 'all')) {
          callback()
        } else {
          this.loadShots(callback)
        }
      } else {
        callback()
      }
    },

    loadAssetsData (callback) {
      if (this.isTVShow || this.displayedAssets.length === 0) {
        return this.loadAssets()
      } else {
        return Promise.resolve()
      }
    },

    loadPlaylistsData (callback) {
      const setFirstPlaylist = () => {
        this.setCurrentPlaylist(() => {
          if (!this.currentPlaylist || !this.currentPlaylist.id) {
            this.goFirstPlaylist()
          }
        })
      }
      if (this.playlists.length === 0) {
        this.loadPlaylists((err) => {
          if (err) this.errors.loadPlaylists = true
          if (!err) setFirstPlaylist()
          if (callback) callback()
        })
      } else {
        setFirstPlaylist()
        if (callback) callback()
      }
    },

    // Playlist build

    rebuildCurrentEntities () {
      this.currentEntities = {}
      const tmpEntities = {}
      if (this.currentPlaylist && this.currentPlaylist.shots) {
        this.currentPlaylist.shots.forEach((entity) => {
          const playlistEntity = this.convertEntityToPlaylistFormat(entity)
          if (playlistEntity) tmpEntities[playlistEntity.id] = playlistEntity
        })
      }
      this.$nextTick(() => {
        this.currentEntities = tmpEntities
      })
    },

    convertEntityToPlaylistFormat (entityInfo) {
      let entity
      if (this.isAssetPlaylist) {
        entity = this.assetMap[entityInfo.id]
      } else {
        entity = this.shotMap[entityInfo.id]
      }
      if (entity) {
        const playlistEntity = {
          id: entityInfo.id,
          name: entity.name,
          parent_name: entity.sequence_name || entity.asset_type_name,
          preview_files: entityInfo.preview_files,
          preview_file_id:
            entityInfo.preview_file_id ||
            entity.preview_file_id,
          preview_file_extension:
            entityInfo.preview_file_extension ||
            entity.preview_file_extension,
          preview_file_task_id:
            entityInfo.task_id ||
            entityInfo.preview_file_task_id ||
            entity.preview_file_task_id,
          preview_file_annotations:
            entityInfo.preview_file_annotations ||
            entity.preview_file_annotations,
          preview_file_previews:
            entityInfo.preview_file_previews ||
            entity.preview_file_previews
        }
        return playlistEntity
      } else {
        return null
      }
    },

    setCurrentPlaylist (callback) {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap[playlistId]
      if (playlist) {
        this.loading.playlist = true
        this.loadPlaylist({
          playlist,
          callback: (err, playlist) => {
            if (err) console.error(err)
            this.currentPlaylist = playlist
            this.rebuildCurrentEntities()
            this.loading.playlist = false
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

    addEntity (entity) {
      return this.loadEntityPreviewFiles(entity)
        .then(previewFiles => {
          return this.addToStorePlaylistAndSave(previewFiles, entity)
        })
        .then(this.addToPlayerPlaylist)
        .catch((err) => console.error(err))
    },

    addToStorePlaylistAndSave (previewFiles, entity) {
      return this.pushEntityToPlaylist({
        playlist: this.currentPlaylist,
        previewFiles: previewFiles,
        entity: { ...entity }
      })
    },

    addToPlayerPlaylist (entity) {
      const playlistEntity = this.convertEntityToPlaylistFormat(entity)
      this.currentEntities[playlistEntity.id] = playlistEntity
      this.playlistPlayer.entityList.push(playlistEntity)
      this.$nextTick(() => {
        this.playlistPlayer.scrollToRight()
      })
    },

    addEntityToPlaylist (entity) {
      if (!this.currentEntities[entity.id]) {
        this.addEntity(entity)
          .then(this.playlistPlayer.scrollToRight())
      }
    },

    removeEntity (entity) {
      this.removeEntityPreviewFromPlaylist({
        playlist: this.currentPlaylist,
        entity,
        callback: () => {
          delete this.currentEntities[entity.id]
        }
      })
    },

    clearCurrentPlaylist () {
      this.currentPlaylist = {}
      this.currentShots = {}
    },

    resetPlaylist () {
      this.clearCurrentPlaylist()
      this.setCurrentPlaylist()
    },

    // Addition Helpers

    addCurrentSelection () {
      this.$options.silent = true
      const entities =
        this.isAssetPlaylist ? this.displayedAssets : this.displayedShots
      this.addEntities([...entities].reverse(), () => {
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
        this.addEntities(shots, () => {
          this.$options.silent = false
        })
      }
    },

    addAllPending () {
      this.$options.silent = true
      this.loading.addWeekly = true
      this.getPending(false)
        .then((shots) => {
          this.addEntities(shots.reverse(), () => {
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
          this.addEntities(shots.reverse(), () => {
            this.loading.addDaily = false
            this.$options.silent = false
          })
        })
    },

    addEpisodePending () {
      this.loading.addEpisode = true
      this.$options.silent = true
      const shots = [].concat(...this.shotsByEpisode).reverse()
      this.addEntities(shots, () => {
        this.loading.addEpisode = false
        this.$options.silent = false
      })
    },

    addMovie () {
      this.loading.addMovie = true
      this.$options.silent = true
      const shots = Object.values(this.shotMap)
      this.addEntities(shots.reverse(), () => {
        this.loading.addMovie = false
        this.$options.silent = false
      })
    },

    addEntities (entities, callback) {
      if (entities && entities.length > 0) {
        const entity = entities.pop()
        this.addEntity(entity)
          .then(() => {
            this.addEntities(entities, callback)
          })
      } else {
        callback()
      }
    },

    // Save data

    onPreviewChanged (entity, previewFileId) {
      this.changePlaylistPreview({
        playlist: this.currentPlaylist,
        entity,
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

    // Search

    onSearchChange (searchQuery) {
      if (searchQuery.length > 1) {
        if (this.isAssetPlaylist) {
          this.setAssetSearch(searchQuery)
          this.displayMoreAssets()
        } else {
          this.setShotSearch(searchQuery)
          this.displayMoreShots()
        }
      } else {
        if (this.isAssetPlaylist) {
          this.setAssetSearch('')
        } else {
          this.setShotSearch('')
        }
      }
    },

    // Playlist list

    onForClientChanged (forClient) {
      this.editPlaylist({
        data: {
          id: this.currentPlaylist.id,
          for_client: forClient
        }
      })
    },

    runAddPlaylist (form) {
      const newPlaylist = {
        name: form.name,
        production_id: this.currentProduction.id,
        for_client: form.for_client,
        for_entity: form.for_entity,
        is_for_all: form.is_for_all
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
          id: form.id,
          for_client: form.for_client,
          for_entity: form.for_entity,
          name: form.name
        },
        callback: (err, playlist) => {
          if (err) this.errors.editPlaylist = true
          this.loading.editPlaylist = false
          this.modals.isEditDisplayed = false
          Object.assign(this.currentPlaylist, playlist)
        }
      })
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

    // Changes

    toggleAddEntities () {
      if (this.isAddingEntity) {
        this.resetPlaylist()
      }
      this.isAddingEntity = !this.isAddingEntity
    },

    onTaskTypeChanged (taskTypeId) {
      this.changePlaylistType({
        playlist: this.currentPlaylist,
        taskTypeId,
        callback: () => {
          this.rebuildCurrentEntities()
        }
      })
    },

    onBodyScroll (event, position) {
      const maxHeight =
        this.$refs.entityListContent.scrollHeight -
        this.$refs.entityListContent.offsetHeight
      if (maxHeight < position.scrollTop) {
        if (this.isAssetPlaylist) {
          this.displayMoreAssets()
        } else {
          this.displayMoreShots()
        }
      }
    },

    resetSorting () {
      let order = 1
      if (['created_at', 'updated_at'].includes(this.currentSort)) {
        order = -1
      }
      this.sortedPlaylists = [...this.playlists]
        .sort(
          firstBy(this.currentSort, order)
            .thenBy('name')
        )
    },

    // Modals

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
    },

    // Loading

    reloadAll () {
      if (!this.loading.playlists) {
        this.loading.playlists = true
        this.loadShotsData(() => {
          this.loadAssetsData()
            .then(() => {
              this.loadPlaylistsData(() => {
                this.loading.playlists = false
                this.resetPlaylist()
                setTimeout(() => {
                  this.loading.playlistsInit = false
                }, 300)
              })
            })
        })
      }
    }
  },

  mounted () {
    // Next tick needed to ensure that current production is properly set.
    this.$nextTick(() => {
      this.reloadAll()
      if (localStorage.getItem('playlist-sort')) {
        this.currentSort = localStorage.getItem('playlist-sort')
      }
      this.resetSorting()
    })
  },

  watch: {
    $route () {
      this.setCurrentPlaylist()
    },

    currentPlaylist () {
      if (this.currentPlaylist.shots) {
        this.isAddingEntity =
          Object.keys(this.currentPlaylist.shots).length === 0
      } else {
        this.isAddingEntity = true
      }
    },

    currentProduction () {
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      this.reloadAll()
    },

    currentEpisode () {
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      if (this.currentEpisode) {
        this.reloadAll()
      }
    },

    playlists () {
      this.resetSorting()
    },

    currentSort () {
      localStorage.setItem('playlist-sort', this.currentSort)
      this.resetSorting()
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
  },

  metaInfo () {
    if (this.isTVShow) {
      return { title: this.tvShowPageTitle }
    } else {
      return { title: this.shortPageTitle }
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

  .playlist-column {
    button,
    h2.entity-group-title {
      color: white;
    }
  }

  .playlist-column.no-selection {
    background: $dark-grey-light;

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
    background: $light-purple;
    border: 1px solid $purple;
  }
}

.playlist-item.selected {
  border-right: 3px solid $light-green;
}

.playlist-list-column .button {
  width: 100%;
}

.addition-entities {
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

.entity-group-title {
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
