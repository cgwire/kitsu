<template>
  <div class="playlists page fixed-page dark">
    <div class="columns">
      <div
        ref="playlistList"
        :class="{
          'playlist-list-column': true,
          column: true,
          toggled: isListToggled
        }"
        @scroll.passive="onPlaylistListScroll"
      >
        <div class="flexrow top-section">
          <combobox-task-type
            class="flexrow-item selector mb1"
            :task-type-list="taskTypeList"
            :label="$t('playlists.filter_task_type')"
            :thin="true"
            v-model="taskTypeId"
            v-if="!isListToggled"
          />
          <span class="filler" v-if="!isListToggled"></span>
          <button-simple
            class="flexrow-item"
            style="flex: 0"
            :icon="isListToggled ? 'right' : 'left'"
            is-small
            @click="isListToggled = !isListToggled"
          />
        </div>

        <div class="flexrow">
          <template v-if="!isListToggled">
            <combobox
              class="flexrow-item mb2"
              :label="$t('main.sorted_by')"
              :options="sortOptions"
              locale-key-prefix="playlists.fields."
              v-model="currentSort"
            />
          </template>
        </div>

        <button
          :class="{
            button: true,
            'is-loading': loading.addPlaylist
          }"
          @click="showAddModal"
          key="new-playlist-button"
          v-if="
            (isCurrentUserManager || isCurrentUserSupervisor) && !isListToggled
          "
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
              'for-client': playlist.for_client || false,
              selected: playlist.id === currentPlaylist.id
            }"
            v-for="playlist in playlists"
          >
            <div
              class="playlist-item-content"
              :style="playlistElementStyle(playlist)"
            >
              <div class="flexrow" v-if="!isListToggled">
                <light-entity-thumbnail
                  class="playlist-thumbnail"
                  :preview-file-id="playlist.first_preview_file_id"
                  type="previews"
                  width="38px"
                  height="30px"
                  max-width="38px"
                  max-height="30px"
                  empty-width="38px"
                  empty-height="30px"
                  :title="playlist.name"
                />
                <div class="ml05">
                  {{ playlist.name }}
                  <span class="playlist-date">
                    {{ $t('playlists.updated_at') }}
                    {{ formatDate(playlist.updated_at) }}
                  </span>
                </div>
              </div>
              <div class="has-text-centered" v-else>
                <light-entity-thumbnail
                  :preview-file-id="playlist.first_preview_file_id"
                  type="previews"
                  width="38px"
                  height="30px"
                  max-width="38px"
                  max-height="30px"
                  empty-width="38px"
                  empty-height="30px"
                  :title="playlist.name"
                  v-if="playlist.first_preview_file_id"
                />
              </div>
            </div>
          </router-link>
        </div>
        <spinner class="mt2" v-else />
        <error-text
          :text="$t('playlists.loading_error')"
          v-if="errors.playlistLoading"
        />
      </div>

      <div
        class="playlist-column no-selection"
        v-if="playlists.length > 0 && !currentPlaylist.id && !loading.playlist"
      >
        <div
          class="flexcolumn xyz-in"
          xyz="fade stagger"
          v-if="!loading.playlists && !loading.playlistsInit"
        >
          <router-link
            class="recent-playlist flexrow-item flexrow"
            :key="'recent-playlist-' + playlist.id"
            :to="getPlaylistPath(playlist.id)"
            v-for="playlist in lastPlaylists"
          >
            <div class="has-text-centered">
              <light-entity-thumbnail
                class="playlist-thumbnail"
                :preview-file-id="playlist.first_preview_file_id"
                type="previews"
                width="auto"
                height="auto"
                empty-height="252px"
              />
            </div>
            <div class="playlist-infos flexrow">
              <div>
                <h3>{{ playlist.name }}</h3>
                <span v-if="currentSort === 'created_at'">
                  {{ $t('playlists.created_at') }}
                  {{ formatDate(playlist.created_at) }}
                </span>
                <span v-else>
                  {{ $t('playlists.updated_at') }}
                  {{ formatDate(playlist.updated_at) }}
                </span>
              </div>
              <span class="filler"> </span>
              <div>
                <task-type-name
                  :task-type="taskTypeMap.get(playlist.task_type_id)"
                  v-if="playlist.task_type_id"
                />
              </div>
            </div>
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
            v-if="isCurrentUserManager || isCurrentUserSupervisor"
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
          :current-entity-type="currentEntityType"
          @edit-clicked="showEditModal"
          @show-add-entities="toggleAddEntities"
          @preview-changed="onPreviewChanged"
          @task-type-changed="onTaskTypeChanged"
          @playlist-deleted="goFirstPlaylist"
          @remove-entity="removeEntity"
          @order-change="onOrderChange"
          @annotation-changed="onAnnotationChanged"
          @for-client-changed="onForClientChanged"
          @annotations-refreshed="onAnnotationsRefreshed"
          @new-entity-dropped="onNewEntityDropped"
        />

        <div
          v-if="
            (isCurrentUserManager || isCurrentUserSupervisor) &&
            isAddingEntity &&
            !loading.playlist
          "
        >
          <div class="addition-header">
            <div class="flexrow">
              <page-subtitle class="flexrow-item" :text="addEntitiesText" />
              <span class="filler"></span>
              <a class="close-button" @click="toggleAddEntities">
                <x-icon />
              </a>
            </div>
            <div class="flexrow">
              <search-field
                class="flexrow-item"
                ref="search-field"
                :can-save="false"
                @change="onSearchChange"
                :placeholder="
                  isAssetPlaylist ? 'chars mode=wfa' : 'ex: seq01 anim=wfa'
                "
              />
              <button-simple
                class="flexrow-item"
                :title="$t('entities.build_filter.title')"
                icon="filter"
                @click="modals.isBuildFilterDisplayed = true"
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
                  'is-loading': loading.addDaily
                }"
                :disabled="isAdditionLoading"
                @click="addDailyPending"
              >
                {{ $t('playlists.build_daily') }}
              </button>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': loading.addDaily
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
                  'is-loading': loading.addEpisode
                }"
                :disabled="isAdditionLoading"
                @click="addEpisodePending"
                v-if="isTVShow && !isAssetPlaylist && !isSequencePlaylist"
              >
                {{ $t('playlists.add_episode') }}
              </button>
              <button
                :class="{
                  button: true,
                  'add-sequence': true,
                  'is-loading': loading.addMovie
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
          v-if="
            (isCurrentUserManager || isCurrentUserSupervisor) && isAddingEntity
          "
          @scroll.passive="onBodyScroll"
        >
          <spinner
            class="mt2"
            key="entity-loader"
            v-if="isShotsLoading || isAssetsLoading"
          />
          <div ref="entityListContent" v-else>
            <div v-if="isAssetPlaylist">
              <div
                :key="'asset-type-' + i"
                v-for="(typeAssets, i) in displayedAssetsByType"
              >
                <h2 class="entity-group-title" v-if="typeAssets.length > 0">
                  {{ typeAssets[0].asset_type_name }}
                </h2>
                <div class="addition-entities">
                  <div
                    :class="{
                      'addition-shot': true,
                      playlisted: currentEntities[asset.id] !== undefined
                    }"
                    :key="asset.id"
                    draggable="true"
                    @dragstart="onEntityDragStart($event, asset)"
                    @click.prevent="addEntityToPlaylist(asset)"
                    v-for="asset in typeAssets.filter(a => !a.canceled)"
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
            <div v-else-if="isSequencePlaylist">
              <div class="addition-entities">
                <div
                  :class="{
                    'addition-shot': true,
                    playlisted: currentEntities[sequence.id] !== undefined
                  }"
                  :key="sequence.id"
                  draggable="true"
                  @dragstart="onEntityDragStart($event, sequence)"
                  @click.prevent="addEntityToPlaylist(sequence)"
                  v-for="sequence in displayedSequences.filter(
                    s => !s.canceled
                  )"
                >
                  <light-entity-thumbnail
                    :preview-file-id="sequence.preview_file_id"
                    width="150px"
                    height="100px"
                  />
                  <div>
                    <span
                      :title="getTaskStatus(sequence).name"
                      :style="{
                        color: getTaskStatus(sequence).color
                      }"
                      v-if="currentPlaylist.task_type_id"
                    >
                      &bullet;
                    </span>
                    <span class="playlisted-shot-name">{{
                      sequence.name
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div
                :key="'sequence-' + i"
                v-for="(sequenceShots, i) in displayedShotsBySequence"
              >
                <h2 class="entity-group-title" v-if="sequenceShots.length > 0">
                  {{ sequenceShots[0].sequence_name }}
                  <button
                    class="button"
                    @click="addSequence(sequenceShots)"
                    :key="'add-sequence-button-' + sequenceShots[0].sequence_id"
                    v-if="isCurrentUserManager || isCurrentUserSupervisor"
                  >
                    {{ $t('playlists.add_sequence') }}
                  </button>
                </h2>
                <div class="addition-entities">
                  <div
                    :key="shot.id"
                    v-for="shot in sequenceShots.filter(s => !s.canceled)"
                  >
                    <div
                      :class="{
                        'addition-shot': true,
                        playlisted: currentEntities[shot.id] !== undefined
                      }"
                      draggable="true"
                      @dragstart="onEntityDragStart($event, shot)"
                      @click.prevent="addEntityToPlaylist(shot)"
                    >
                      <light-entity-thumbnail
                        :preview-file-id="shot.preview_file_id"
                        width="150px"
                        height="100px"
                      />
                      <div>
                        <span
                          :title="getTaskStatus(shot).name"
                          :style="{
                            color: getTaskStatus(shot).color
                          }"
                          v-if="currentPlaylist.task_type_id"
                        >
                          &bullet;
                        </span>
                        <span class="playlisted-shot-name">{{
                          shot.name
                        }}</span>
                      </div>
                    </div>
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
      :task-type-id="taskTypeId"
      @cancel="hideEditModal"
      @confirm="confirmEditPlaylist"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      :entity-type="currentEntityType"
      @confirm="confirmBuildFilter"
      @cancel="modals.isBuildFilterDisplayed = false"
    />
  </div>
</template>
<script>
import { ref } from 'vue'
import firstBy from 'thenby'
import moment from 'moment-timezone'
import { mapGetters, mapActions } from 'vuex'
import { PlusIcon, XIcon } from 'lucide-vue-next'

import { DEFAULT_NB_FRAMES_PICTURE } from '@/lib/playlist'
import { formatDate } from '@/lib/time'
import { getPlaylistPath } from '@/lib/path'
import { updateModelFromList, removeModelFromList } from '@/lib/models'
import { sortAssets, sortShots } from '@/lib/sorting'

import assetStore from '@/store/modules/assets'
import shotStore from '@/store/modules/shots'
import sequenceStore from '@/store/modules/sequences'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import PlaylistPlayer from '@/components/pages/playlists/PlaylistPlayer.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'playlist',

  components: {
    BuildFilterModal,
    ButtonSimple,
    Combobox,
    ComboboxTaskType,
    ErrorText,
    EditPlaylistModal,
    LightEntityThumbnail,
    PageSubtitle,
    PlaylistPlayer,
    PlusIcon,
    SearchField,
    Spinner,
    TaskTypeName,
    XIcon
  },

  data() {
    return {
      currentPlaylist: { name: '' },
      currentSort: 'updated_at',
      currentEntities: {},
      isAddingEntity: false,
      isListToggled: false,
      page: 1,
      taskTypeId: '',
      sortedPlaylists: [],
      sortOptions: ['updated_at', 'created_at', 'name'].map(name => ({
        label: name,
        value: name
      })),
      playlistToEdit: {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      },
      previewFileMap: new Map(),
      previewFileEntityMap: new Map(),
      modals: {
        isBuildFilterDisplayed: false,
        isEditDisplayed: false
      },
      loading: {
        addPlaylist: false,
        addDaily: false,
        addEpisode: false,
        addMovie: false,
        addSequence: false,
        addWeekly: false,
        editPlaylist: false,
        playlist: false,
        playlists: false,
        playlistsInit: true
      },
      errors: {
        editPlaylist: false,
        playlistLoading: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'assetSearchText',
      'currentEpisode',
      'currentProduction',
      'displayedAssets',
      'displayedAssetsByType',
      'displayedSequences',
      'displayedShots',
      'displayedShotsBySequence',
      'isAssetsLoading',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isShotsLoading',
      'isTVShow',
      'productionTaskTypes',
      'playlistMap',
      'playlists',
      'playlistsPath',
      'shotsByEpisode',
      'shotSearchText',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap'
    ]),

    isAdditionLoading() {
      return (
        this.loading.addSequence ||
        this.loading.addWeekly ||
        this.loading.addDaily ||
        this.loading.addEpisode
      )
    },

    isAssetPlaylist() {
      return this.currentPlaylist.for_entity === 'asset'
    },

    isSequencePlaylist() {
      return this.currentPlaylist.for_entity === 'sequence'
    },

    currentEntityType() {
      return this.currentPlaylist.for_entity
    },

    isAddSearchVisible() {
      return (
        (this.isAssetPlaylist && this.assetSearchText) ||
        (!this.isAssetPlaylist && this.shotSearchText)
      )
    },

    lastPlaylists() {
      return this.playlists
    },

    playlistPlayer() {
      return this.$refs['playlist-player']
    },

    addEntitiesText() {
      if (this.isAssetPlaylist) {
        return this.$t('playlists.add_assets')
      } else if (this.isSequencePlaylist) {
        return this.$t('playlists.add_sequences')
      } else {
        return this.$t('playlists.add_shots')
      }
    },

    tvShowPageTitle() {
      const productionName = this.currentProduction
        ? this.currentProduction.name
        : ''
      let episodeName = ''
      if (this.currentEpisode) {
        if (this.currentEpisode.id === 'all') {
          episodeName = this.$t('main.all')
        } else if (this.currentEpisode.id === 'main') {
          episodeName = this.$t('main.main_pack')
        } else {
          episodeName = this.currentEpisode.name
        }
      }
      return (
        `${productionName} - ${episodeName}` +
        ` | ${this.$t('playlists.title')} - Kitsu`
      )
    },

    shortPageTitle() {
      const productionName = this.currentProduction
        ? this.currentProduction.name
        : ''
      return `${productionName} | ${this.$t('playlists.title')} - Kitsu`
    },

    taskTypeList() {
      return [
        {
          id: '',
          color: '#999',
          name: this.$t('news.all')
        }
      ].concat([...this.productionTaskTypes])
    }
  },

  methods: {
    ...mapActions([
      'changePlaylistOrder',
      'changePlaylistPreview',
      'changePlaylistType',
      'displayMoreAssets',
      'displayMoreShots',
      'editPlaylist',
      'getPendingAssets',
      'getPendingShots',
      'loadEpisodes',
      'loadMorePlaylists',
      'loadPlaylist',
      'loadPlaylists',
      'loadEntityPreviewFiles',
      'loadShots',
      'loadAssets',
      'newPlaylist',
      'refreshPlaylist',
      'removeEntityPreviewFromPlaylist',
      'resetSequences',
      'pushEntityToPlaylist',
      'setAssetSearch',
      'setSequenceSearch',
      'setShotSearch',
      'updatePreviewAnnotation'
    ]),

    // Helpers

    formatDate(dateString) {
      return formatDate(dateString)
    },

    getPlaylistPath(playlistId, section) {
      return getPlaylistPath(
        this.currentProduction.id,
        this.currentEpisode ? this.currentEpisode.id : null,
        playlistId,
        section
      )
    },

    playlistElementStyle(playlist) {
      if (this.isListToggled) {
        return
      }
      const taskType = this.taskTypeMap.get(playlist.task_type_id)
      const color = taskType?.color || 'transparent'
      return {
        'border-left': `4px solid ${color}`
      }
    },

    getTaskStatus(entity) {
      let entityWithTasks = shotStore.cache.shotMap.get(entity.id)
      if (!entityWithTasks) {
        entityWithTasks = assetStore.cache.assetMap.get(entity.id)
      }
      if (!entityWithTasks) {
        entityWithTasks = sequenceStore.cache.sequenceMap.get(entity.id)
      }
      if (!entityWithTasks) return {}

      const taskId = entity.validations.get(this.currentPlaylist.task_type_id)
      if (taskId) {
        const task = this.taskMap.get(taskId)
        if (!task) return {}
        const taskStatus = this.taskStatusMap.get(task.task_status_id)
        return taskStatus
      } else {
        return {}
      }
    },

    // Data loading

    async loadShotsData() {
      if (
        this.displayedShots.length === 0 ||
        this.displayedShots[0].project_id !== this.currentProduction.id ||
        (this.currentEpisode &&
          this.displayedShots[0].episode_id !== this.currentEpisode.id)
      ) {
        if (
          this.isTVShow &&
          this.currentEpisode &&
          (this.currentEpisode.id === 'main' ||
            this.currentEpisode.id === 'all')
        ) {
          // Do nothing for main or all episodes
        } else {
          if (this.isTVShow && !this.currentEpisode) {
            await this.loadEpisodes()
          }
          await this.loadShots()
        }
      }
    },

    loadAssetsData() {
      if (this.isTVShow || this.displayedAssets.length === 0) {
        return this.loadAssets()
      } else {
        return Promise.resolve()
      }
    },

    loadPlaylistsData(force = false) {
      const setFirstPlaylist = () => {
        this.setCurrentPlaylist(() => {
          if (!this.currentPlaylist || !this.currentPlaylist.id) {
            this.goFirstPlaylist()
          }
          return Promise.resolve()
        })
      }
      if (this.playlists.length === 0 || force) {
        return this.loadPlaylists({
          sortBy: this.currentSort,
          page: this.page,
          taskTypeId: this.taskTypeId
        })
          .then(() => {
            return setFirstPlaylist()
          })
          .catch(err => {
            console.error(err)
            this.errors.loadPlaylists = true
            return Promise.reject(err)
          })
      } else {
        return setFirstPlaylist()
      }
    },

    onPlaylistListScroll(event) {
      if (this.$options.silentMore) return
      const listEl = this.$refs.playlistList
      const maxHeight = listEl.scrollHeight - listEl.offsetHeight
      const position = event.target
      if (maxHeight < position.scrollTop + 20) {
        this.$options.silentMore = true
        this.page++
        this.loadMorePlaylists({
          sortBy: this.currentSort,
          page: this.page,
          taskTypeId: this.taskTypeId
        })
          .then(playlists => {
            setTimeout(() => {
              this.$options.silentMore = false
            }, 1000)
          })
          .catch(err => {
            console.error(err)
            this.$options.silentMore = false
            this.errors.loadPlaylists = true
            return Promise.reject(err)
          })
      }
    },

    // Playlist build

    rebuildCurrentEntities() {
      this.currentEntities = {}
      const tmpEntities = {}
      this.previewFileMap = new Map()
      this.previewFileEntityMap = new Map()
      if (this.currentPlaylist && this.currentPlaylist.shots) {
        this.currentPlaylist.shots.forEach(entity => {
          const playlistEntity = this.convertEntityToPlaylistFormat(entity)
          if (playlistEntity) {
            tmpEntities[playlistEntity.id] = playlistEntity
            this.previewFileEntityMap.set(
              entity.preview_file_id,
              playlistEntity
            )
            const previewFileGroups = Object.values(
              playlistEntity.preview_files
            )
            previewFileGroups.forEach(previewFiles => {
              previewFiles.forEach(previewFile => {
                this.previewFileMap.set(previewFile.id, previewFile)
              })
            })
          }
        })
      }
      this.$nextTick(() => {
        this.currentEntities = tmpEntities
      })
    },

    onAnnotationsRefreshed(preview) {
      const entity = this.previewFileEntityMap.get(preview.id)
      const localPreview = this.previewFileMap.get(preview.id)
      if (entity) {
        entity.preview_file_annotations = preview.annotations
      }
      if (localPreview) {
        localPreview.annotations = preview.annotations
      }
    },

    convertEntityToPlaylistFormat(entityInfo) {
      let entity
      if (this.isAssetPlaylist) {
        entity = assetStore.cache.assetMap.get(entityInfo.id)
      } else if (this.isSequencePlaylist) {
        entity = sequenceStore.cache.sequenceMap.get(entityInfo.id)
        if (this.currentEpisode) {
          entity.episode_name = this.currentEpisode.name
        }
      } else {
        entity = shotStore.cache.shotMap.get(entityInfo.id)
      }
      if (entity) {
        const playlistEntity = {
          id: entityInfo.id,
          name: entity.name,
          parent_name:
            entity.sequence_name ||
            entity.episode_name ||
            entity.asset_type_name,
          preview_files: entityInfo.preview_files,
          preview_file_id: entityInfo.preview_file_id || entity.preview_file_id,
          preview_file_extension:
            entityInfo.preview_file_extension || entity.preview_file_extension,
          preview_file_revision:
            entityInfo.preview_file_revision || entity.preview_file_revision,
          preview_file_width:
            entityInfo.preview_file_width || entity.preview_file_width,
          preview_file_height:
            entityInfo.preview_file_height || entity.preview_file_height,
          preview_file_duration:
            entityInfo.preview_file_duration || entity.preview_file_duration,
          preview_file_task_id:
            entityInfo.task_id ||
            entityInfo.preview_file_task_id ||
            entity.preview_file_task_id,
          preview_file_annotations:
            entityInfo.preview_file_annotations ||
            entity.preview_file_annotations,
          preview_file_previews:
            entityInfo.preview_file_previews || entity.preview_file_previews,
          preview_nb_frames:
            entityInfo.nb_frames ||
            entity.nb_frames ||
            DEFAULT_NB_FRAMES_PICTURE
        }
        this.previewFileEntityMap.set(
          playlistEntity.preview_file_id,
          playlistEntity
        )
        const previews = playlistEntity.preview_file_previews || []
        previews.forEach(preview => {
          this.previewFileMap.set(preview.id, preview)
        })
        return playlistEntity
      } else {
        return null
      }
    },

    setCurrentPlaylist(callback) {
      const playlistId = this.$route.params.playlist_id
      const playlist = this.playlistMap.get(playlistId)
      if (playlist) {
        this.loading.playlist = true
        this.loadPlaylist(playlist).then(loadedPlaylist => {
          this.currentPlaylist = ref(loadedPlaylist)
          this.rebuildCurrentEntities()
          this.loading.playlist = false
          if (callback) callback()
        })
      } else {
        this.currentPlaylist = {
          name: ''
        }
        this.currentShots = {}
      }
    },

    addEntity(entity, playlist, scrollRight = true) {
      if (this.currentEntities[entity.id]) {
        return Promise.resolve()
      }
      return this.loadEntityPreviewFiles(entity)
        .then(previewFiles =>
          this.addToStorePlaylistAndSave(previewFiles, entity, playlist)
        )
        .then(entity => {
          this.addToPlayerPlaylist(entity, playlist, scrollRight)
        })
        .catch(err => console.error(err))
    },

    addToStorePlaylistAndSave(previewFiles, entity, playlist) {
      return this.pushEntityToPlaylist({
        playlist,
        previewFiles,
        entity: { ...entity }
      })
    },

    addToPlayerPlaylist(entity, playlist, scrollRight = true) {
      if (playlist.id !== this.playlistPlayer.playlist.id) {
        return
      }
      const playlistEntity = this.convertEntityToPlaylistFormat(entity)
      this.currentEntities[playlistEntity.id] = playlistEntity
      this.playlistPlayer.entityList.push(playlistEntity)
      if (scrollRight) {
        this.$nextTick(() => {
          this.playlistPlayer.scrollToRight()
        })
      }
    },

    addEntityToPlaylist(entity) {
      if (this.currentEntities[entity.id]) {
        return
      }
      const playlist = this.currentPlaylist
      this.addEntity(entity, playlist).then(this.playlistPlayer.scrollToRight())
    },

    onNewEntityDropped(info) {
      let entity
      if (this.isAssetPlaylist) {
        entity = assetStore.cache.assetMap.get(info.after)
      } else if (this.isSequencePlaylist) {
        entity = sequenceStore.cache.sequenceMap.get(info.after)
      } else {
        entity = shotStore.cache.shotMap.get(info.after)
      }

      if (entity && !this.currentEntities[entity.id]) {
        const notScrollRight = false
        const playlist = this.currentPlaylist
        this.addEntity(entity, playlist, notScrollRight).then(() => {
          this.playlistPlayer.onEntityDropped(info)
        })
      }
    },

    removeEntity(entity) {
      this.removeEntityPreviewFromPlaylist({
        playlist: this.currentPlaylist,
        entity,
        callback: () => {
          delete this.currentEntities[entity.id]
        }
      })
    },

    clearCurrentPlaylist() {
      this.currentPlaylist = {}
      this.currentShots = {}
    },

    resetPlaylist() {
      this.clearCurrentPlaylist()
      this.setCurrentPlaylist()
    },

    // Addition Helpers

    addCurrentSelection() {
      this.$options.silent = true
      const entities = this.isAssetPlaylist
        ? this.displayedAssets
        : this.displayedShots
      this.addEntities([...entities].reverse(), () => {
        this.$options.silent = false
      })
    },

    addSequence(sequenceShots) {
      if (sequenceShots.length > 0) {
        const sequenceId = sequenceShots[0].sequence_id
        const shots = Array.from(shotStore.cache.shotMap.values())
          .filter(s => s.sequence_id === sequenceId)
          .sort(firstBy('name'))
          .reverse()
        this.$options.silent = true
        this.addEntities(shots, () => {
          this.$options.silent = false
        })
      }
    },

    async addAllPending() {
      this.$options.silent = true
      this.loading.addWeekly = true
      const getPending = this.isAssetPlaylist
        ? this.getPendingAssets
        : this.getPendingShots
      const sortEntities = this.isAssetPlaylist ? sortAssets : sortShots
      let entities = await getPending(false)
      entities = sortEntities(entities).reverse()
      this.addEntities(entities, () => {
        this.loading.addWeekly = false
        this.$options.silent = false
      })
    },

    async addDailyPending() {
      this.loading.addDaily = true
      this.$options.silent = true
      const getPending = this.isAssetPlaylist
        ? this.getPendingAssets
        : this.getPendingShots
      const sortEntities = this.isAssetPlaylist ? sortAssets : sortShots
      let entities = await getPending(true)
      entities = sortEntities(entities).reverse()
      this.addEntities(entities, () => {
        this.loading.addDaily = false
        this.$options.silent = false
      })
    },

    addEpisodePending() {
      this.loading.addEpisode = true
      this.$options.silent = true
      let shots = [].concat(...this.shotsByEpisode)
      shots = sortShots(shots).reverse()
      this.addEntities(shots, () => {
        this.loading.addEpisode = false
        this.$options.silent = false
      })
    },

    addMovie() {
      this.loading.addMovie = true
      this.$options.silent = true
      const shots = sortShots(Array.from(shotStore.cache.shotMap.values()))
      this.addEntities(shots.reverse(), () => {
        this.loading.addMovie = false
        this.$options.silent = false
      })
    },

    addEntities(entities, callback, playlist = undefined) {
      if (!playlist) {
        playlist = this.currentPlaylist
      }
      if (entities && entities.length > 0) {
        const entity = entities.pop()
        this.addEntity(entity, playlist).then(() => {
          this.addEntities(entities, callback, playlist)
        })
      } else {
        callback()
      }
    },

    // Save data

    /* When a preview is modified, the change is persisted */
    onPreviewChanged(entity, previewFileId) {
      this.changePlaylistPreview({
        playlist: this.currentPlaylist,
        entity,
        previewFileId
      })
    },

    onOrderChange(info) {
      this.changePlaylistOrder({
        playlist: this.currentPlaylist,
        info
      })
    },

    onAnnotationChanged({ preview, additions, deletions, updates }) {
      const taskId = preview.task_id
      this.updatePreviewAnnotation({
        taskId,
        preview,
        additions,
        deletions,
        updates
      })
    },

    // Search

    confirmBuildFilter(query) {
      this.modals.isBuildFilterDisplayed = false
      this.$refs['search-field'].setValue(query)
      this.onSearchChange(query)
    },

    onSearchChange(searchQuery) {
      if (searchQuery.length > 1) {
        if (this.isAssetPlaylist) {
          this.setAssetSearch(searchQuery)
          this.displayMoreAssets()
        } else if (this.isSequencePlaylist) {
          this.setSequenceSearch(searchQuery)
          this.resetSequences()
        } else {
          this.setShotSearch(searchQuery)
          this.displayMoreShots()
        }
      } else {
        if (this.isAssetPlaylist) {
          this.setAssetSearch('')
        } else if (this.isSequencePlaylist) {
          this.setSequenceSearch('')
        } else {
          this.setShotSearch('')
        }
      }
    },

    // Playlist list

    onForClientChanged(forClient) {
      this.editPlaylist({
        data: {
          id: this.currentPlaylist.id,
          for_client: forClient
        }
      })
    },

    runAddPlaylist(form) {
      const newPlaylist = {
        name: form.name,
        production_id: this.currentProduction.id,
        for_client: form.for_client,
        for_entity: form.for_entity,
        is_for_all: form.is_for_all,
        task_type_id: form.task_type_id
      }
      if (this.isTVShow && this.currentEpisode) {
        newPlaylist.episode_id = this.currentEpisode.id
      }
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.newPlaylist(newPlaylist)
        .then(playlist => {
          this.$router.push(this.getPlaylistPath(playlist.id))
          this.loading.editPlaylist = false
          this.modals.isEditDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.editPlaylist = true
          this.loading.editPlaylist = false
        })
    },

    confirmEditPlaylist(form) {
      if (this.playlistToEdit.id) {
        form.id = this.currentPlaylist.id
        this.runEditPlaylist(form)
      } else {
        this.runAddPlaylist(form)
      }
    },

    runEditPlaylist(form) {
      this.loading.editPlaylist = true
      this.errors.editPlaylist = false
      this.editPlaylist({
        data: {
          id: form.id,
          for_client: form.for_client,
          for_entity: form.for_entity,
          name: form.name,
          task_type_id: form.task_type_id
        },
        callback: (err, playlist) => {
          if (err) {
            this.errors.editPlaylist = true
          } else {
            this.modals.isEditDisplayed = false
            Object.assign(this.currentPlaylist, playlist)
          }
          this.loading.editPlaylist = false
        }
      })
    },

    goFirstPlaylist() {
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

    onEntityDragStart(event, entity) {
      event.dataTransfer.setData('entityId', entity.id)
    },

    // Changes

    toggleAddEntities() {
      if (this.isAddingEntity) {
        this.resetPlaylist()
      }
      this.isAddingEntity = !this.isAddingEntity
    },

    onTaskTypeChanged(taskTypeId) {
      this.changePlaylistType({
        playlist: this.currentPlaylist,
        taskTypeId,
        callback: () => {
          this.rebuildCurrentEntities()
        }
      })
    },

    onBodyScroll(event) {
      const position = event.target
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

    resetSorting() {
      let order = 1
      if (['created_at', 'updated_at'].includes(this.currentSort)) {
        order = -1
      }
      this.sortedPlaylists = [...this.playlists].sort(
        firstBy(this.currentSort, order).thenBy('name')
      )
    },

    // Modals

    showAddModal() {
      this.playlistToEdit = {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      }
      this.errors.editPlaylist = false
      this.modals.isEditDisplayed = true
    },

    showEditModal() {
      this.playlistToEdit = this.currentPlaylist
      this.errors.editPlaylist = false
      this.modals.isEditDisplayed = true
    },

    hideEditModal() {
      this.playlistToEdit = {
        name: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        for_client: false
      }
      this.modals.isEditDisplayed = false
    },

    // Loading

    async reloadAll() {
      if (!this.loading.playlists) {
        this.loading.playlists = true
        await this.loadShotsData()
        await this.loadAssetsData()
        this.page = 1
        await this.loadPlaylistsData()
        this.loading.playlists = false
        this.resetPlaylist()
        setTimeout(() => {
          this.loading.playlistsInit = false
        }, 300)
      }
    }
  },

  mounted() {
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
    $route() {
      this.setCurrentPlaylist()
    },

    currentPlaylist() {
      if (this.currentPlaylist.shots) {
        this.$options.silentMore = false
        this.isAddingEntity =
          Object.keys(this.currentPlaylist.shots).length === 0
      } else {
        this.isAddingEntity = true
      }
    },

    currentProduction() {
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      this.reloadAll()
    },

    currentEpisode() {
      this.$store.commit('LOAD_PLAYLISTS_END', [])
      if (this.currentEpisode) {
        this.reloadAll()
      }
    },

    currentSort() {
      localStorage.setItem('playlist-sort', this.currentSort)
      this.loading.playlists = true
      this.page = 1
      this.loadPlaylistsData(true).then(() => {
        this.loading.playlists = false
      })
    },

    isListToggled() {
      this.playlistPlayer?.onWindowResize()
    },

    taskTypeId() {
      this.loadPlaylistsData(true)
    }
  },

  socket: {
    events: {
      'playlist:new'(eventData) {
        if (!this.playlistMap.get(eventData.playlist_id)) {
          this.refreshPlaylist(eventData.playlist_id)
        }
      },

      'playlist:update'(eventData) {
        if (this.playlistMap.get(eventData.playlist_id)) {
          this.refreshPlaylist(eventData.playlist_id)
        }
      },

      'playlist:delete'(eventData) {
        if (this.playlistMap.get(eventData.playlist_id)) {
          this.$store.commit('DELETE_PLAYLIST_END', {
            id: eventData.playlist_id
          })
        }
      },

      'build-job:new'(eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          this.currentPlaylist.build_jobs = [
            {
              id: eventData.build_job_id,
              created_at: eventData.created_at,
              status: 'running',
              playlist_id: this.currentPlaylist.id
            }
          ].concat(this.currentPlaylist.build_jobs)
        }
      },

      'build-job:update'(eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          updateModelFromList(this.currentPlaylist.build_jobs, {
            id: eventData.build_job_id,
            status: eventData.status
          })
        }
      },

      'build-job:delete'(eventData) {
        if (eventData.playlist_id === this.currentPlaylist.id) {
          this.currentPlaylist.build_jobs = removeModelFromList(
            this.currentPlaylist.build_jobs,
            {
              id: eventData.build_job_id
            }
          )
        }
      }
    }
  },

  head() {
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
    box-shadow: 0 0 6px #333;
    border-color: $dark-grey;
    color: $white-grey;
  }

  .playlist-list-column {
    background: $dark-grey-light;
    border-color: $dark-grey;
    box-shadow: 0 0 6px #333;
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
      position: relative;
      max-width: 800px;
      margin: auto;
      overflow: hidden;
      background: $dark-grey-lightmore;
      border: 2px solid $dark-grey;
      box-shadow: 0 0 6px #333;
      margin-bottom: 1em;

      h3 {
        color: white;
      }
    }
  }

  span.thumbnail-picture {
    box-shadow: 0 0 6px #333;
  }
}

.page {
  display: flex;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}

.page .columns {
  margin-top: 0;
  margin-bottom: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-list-column {
  max-width: 300px;
  background: #f4f5f9;
  overflow-y: auto;
  padding: 1em;
  border-right: 1px solid #ddd;
  box-shadow: 0 0 6px #f0f0f0;
  z-index: 201;
}

.playlist-item {
  display: block;
  background: white;
  border: 2px solid $white-grey;
  border-radius: 3px;
  box-shadow: 0 0 6px #ddd;
  color: $grey-strong;
  margin: 0.2em;
  padding: 0.4em;
  transition: all 0.2s ease;

  &.for-client {
    background: $purple-grey;
  }

  &:hover {
    transform: scale(1.02);
    border: 2px solid var(--background-selectable);
  }
}

.playlist-item.selected {
  border: 2px solid var(--background-selected);
  transform: scale(1.02);
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

  a {
    margin: auto;
  }

  &:hover {
    opacity: 0.75;
  }

  &.playlisted {
    opacity: 1;

    img,
    span.thumbnail-picture {
      border: 2px solid $purple;
      border-radius: 5px;
    }
  }
}

span.thumbnail-picture {
  box-shadow: 0 0 6px #ddd;
  margin-bottom: 2px;
}

.add-sequence {
  margin-bottom: 0.4em;
}

.playlist-column {
  overflow: hidden;
  flex: 1;
  background: $dark-grey-2;
}

.playlisted-shot-name {
  padding-right: 20px;
  color: var(--text);
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
  background: var(--background);
  border-top: 3px solid $dark-grey;
  height: 110px;
  padding: 0 1em;

  .subtitle {
    margin-top: 1em;
  }
}

.addition-section {
  background: var(--background);
  overflow-y: auto;
  height: calc(100% - 420px);
}

h2 {
  font-weight: bold;
  text-transform: uppercase;
  color: $grey;
}

.toggled {
  padding: 1em 0.1em;
  max-width: 50px;

  .flexrow {
    align-items: center;
    justify-content: center;
    margin-bottom: 1em;
  }

  .playlist-item {
    padding: 0;
  }
  .playlist-item-content {
    height: 30px;
    padding: 0;
    border: 0;
  }
}

.playlist-column.no-selection {
  padding: 2em;
  overflow: auto;
  background: #f4f5f9;

  h2 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 0.3em;
    border-bottom: 0;

    &:first-child {
      margin-top: 0.5em;
    }
  }

  .recent-playlist {
    height: 320px;
    background: white;
    border: 2px solid $light-grey-light;
    box-shadow: 0 0 6px #ddd;
    border-radius: 1em;
    padding: 0;
    width: 100%;
    transition: all 0.6s ease;

    img {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    &:hover {
      transform: scale(1.03);
    }

    .playlist-infos {
      background-color: rgb(0, 0, 0, 0.2);
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      align-items: middle;
      padding: 0.3em 1.2em;
      height: 65px;
      padding-top: 0.3em;
    }

    h3 {
      color: $grey-strong;
      font-size: 1.4em;
      font-weight: bold;
    }
    span {
      display: block;
    }
  }

  .empty-explaination {
    color: $white;
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

.top-section {
  align-items: flex-start;
}

.thumbnail-picture,
.playlist-thumbnail {
  border-radius: 4px;
}

.playlist-item-content {
  padding-left: 0.5em;
  overflow-wrap: anywhere;

  .flexrow {
    align-items: flex-start;
    .thumbnail-picture {
      margin-top: 3px;
    }
  }
}
</style>
