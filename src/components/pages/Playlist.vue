<template>
  <div class="playlists page fixed-page dark">
    <div class="columns">
      <div
        ref="playlistList"
        class="playlist-list-column column"
        :class="{ toggled: isListToggled }"
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
          class="button"
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
                  width="53px"
                  height="35px"
                  max-width="53px"
                  max-height="35px"
                  empty-width="53px"
                  empty-height="35px"
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
        <div
          class="pa1"
          v-if="playlists.length >= 20 && !loading.playlists && isMorePlaylists"
        >
          <button-simple
            :class="{
              button: true,
              'is-loading': loading.morePlaylists
            }"
            :text="$t('main.load_more')"
            @click="onLoadMoreClicked"
          />
        </div>
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
            v-for="playlist in playlists"
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
          <p class="empty-explanation">
            {{ $t('playlists.no_playlist') }}
          </p>
          <button
            class="big button"
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
          :entities="currentEntitiesList"
          :is-loading="loading.playlist"
          :is-adding-entity="isAddingEntity"
          :initial-share-links-count="currentShareLinksCount"
          :current-entity-type="currentEntityType"
          @edit-clicked="showEditModal"
          @show-add-entities="toggleAddEntities"
          @preview-changed="onPreviewChanged"
          @task-type-changed="onTaskTypeChanged"
          @update-to-latest-version="onUpdateToLatestVersion"
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
              <a
                class="close-button"
                role="button"
                tabindex="0"
                @click="toggleAddEntities"
                @keydown.enter.prevent="toggleAddEntities"
                @keydown.space.prevent="toggleAddEntities"
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
                class="button flexrow-item add-sequence"
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
                  'is-loading': loading.addWeekly
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
                v-if="
                  isTVShow &&
                  !isAssetPlaylist &&
                  !isSequencePlaylist &&
                  !isEditPlaylist &&
                  !isEpisodePlaylist
                "
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
                v-else-if="
                  !isAssetPlaylist && !isEditPlaylist && !isEpisodePlaylist
                "
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
            v-if="
              isShotsLoading ||
              isAssetsLoading ||
              isEditsLoading ||
              isEpisodesLoading
            "
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
                    :key="asset.id"
                    :class="{
                      'addition-shot': true,
                      playlisted: currentEntitiesMap[asset.id] !== undefined
                    }"
                    draggable="true"
                    role="button"
                    tabindex="0"
                    @dragstart="onEntityDragStart($event, asset)"
                    @click.prevent="addEntityToPlaylist(asset)"
                    @keydown.enter.prevent="addEntityToPlaylist(asset)"
                    @keydown.space.prevent="addEntityToPlaylist(asset)"
                    v-for="asset in typeAssets.filter(a => !a.canceled)"
                  >
                    <div
                      class="entity-loading-spinner"
                      v-if="entityLoading[asset.id]"
                    >
                      <spinner />
                    </div>
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
            <div v-else-if="flatAdditionEntities">
              <div class="addition-entities">
                <div
                  :key="entity.id"
                  :class="{
                    'addition-shot': true,
                    playlisted: currentEntitiesMap[entity.id] !== undefined
                  }"
                  draggable="true"
                  role="button"
                  tabindex="0"
                  @dragstart="onEntityDragStart($event, entity)"
                  @click.prevent="addEntityToPlaylist(entity)"
                  @keydown.enter.prevent="addEntityToPlaylist(entity)"
                  @keydown.space.prevent="addEntityToPlaylist(entity)"
                  v-for="entity in flatAdditionEntities"
                >
                  <div
                    class="entity-loading-spinner"
                    v-if="entityLoading[entity.id]"
                  >
                    <spinner />
                  </div>
                  <light-entity-thumbnail
                    :preview-file-id="entity.preview_file_id"
                    width="150px"
                    height="100px"
                  />
                  <div>
                    <span
                      :title="getTaskStatus(entity).name"
                      :style="{
                        color: getTaskStatus(entity).color
                      }"
                      v-if="currentPlaylist.task_type_id"
                    >
                      &bullet;
                    </span>
                    <span class="playlisted-shot-name">{{ entity.name }}</span>
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
                        playlisted: currentEntitiesMap[shot.id] !== undefined
                      }"
                      draggable="true"
                      role="button"
                      tabindex="0"
                      @dragstart="onEntityDragStart($event, shot)"
                      @click.prevent="addEntityToPlaylist(shot)"
                      @keydown.enter.prevent="addEntityToPlaylist(shot)"
                      @keydown.space.prevent="addEntityToPlaylist(shot)"
                    >
                      <div
                        class="entity-loading-spinner"
                        v-if="entityLoading[shot.id]"
                      >
                        <spinner />
                      </div>
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
      :active="modals.isEditDisplayed"
      :is-loading="loading.editPlaylist"
      :is-error="errors.editPlaylist"
      :playlist-to-edit="playlistToEdit"
      :task-type-id="taskTypeId"
      @cancel="hideEditModal"
      @confirm="confirmEditPlaylist"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      :entity-type="currentEntityType"
      @confirm="confirmBuildFilter"
      @cancel="modals.isBuildFilterDisplayed = false"
    />
  </div>
</template>
<script setup>
import { useHead } from '@unhead/vue'
import moment from 'moment-timezone'
import { firstBy } from 'thenby'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { removeModelFromList, updateModelFromList } from '@/lib/models'
import { getPlaylistPath as buildPlaylistPath } from '@/lib/path'
import { DEFAULT_NB_FRAMES_PICTURE, isPlaylistInScope } from '@/lib/playlist'
import { sortAssets, sortShots } from '@/lib/sorting'
import { formatDate as formatDateBase } from '@/lib/time'
import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'

/* eslint-disable no-unused-vars */
import { PlusIcon, XIcon } from 'lucide-vue-next'

import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import EditPlaylistModal from '@/components/modals/EditPlaylistModal.vue'
import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import LightEntityThumbnail from '@/components/widgets/LightEntityThumbnail.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

const sortOptions = ['updated_at', 'created_at', 'name'].map(name => ({
  label: name,
  value: name
}))

const newPlaylistForm = () => ({
  name: moment().format('YYYY-MM-DD HH:mm:ss'),
  for_client: false
})

// State
// --------------------------------------------------------------------------

const entityListContentRef = useTemplateRef('entityListContent')
const playlistListRef = useTemplateRef('playlistList')
const playlistPlayerRef = useTemplateRef('playlist-player')
const searchFieldRef = useTemplateRef('search-field')

const currentEntitiesList = ref([])
const currentEntitiesMap = ref({})
const currentPlaylist = ref({ name: '' })
const currentShareLinksCount = ref(0)
const currentSort = ref(localStorage.getItem('playlist-sort') || 'updated_at')
const isAddingEntity = ref(false)
const isListToggled = ref(false)
const isMorePlaylists = ref(true)
const playlistToEdit = ref(newPlaylistForm())
const taskTypeId = ref('')
// Refs although never rendered: the entries read back must be reactive
// proxies, for the annotations written on them to reach the player.
const previewFileEntityMap = ref(new Map())
const previewFileMap = ref(new Map())

const entityLoading = reactive({})
const errors = reactive({
  editPlaylist: false,
  playlistLoading: false
})
const loading = reactive({
  addDaily: false,
  addEpisode: false,
  addMovie: false,
  addWeekly: false,
  editPlaylist: false,
  morePlaylists: false,
  playlist: false,
  playlists: false,
  playlistsInit: true
})
const modals = reactive({
  isBuildFilterDisplayed: false,
  isEditDisplayed: false
})

let entitiesAddedWhilePanelOpen = false
let isReloadPending = false
let isServedScopeStale = false
let isSilent = false
let isSilentMore = false
let isUnmounted = false
let page = 1
let servedScope = null
let silentOperationCount = 0

// Computed
// --------------------------------------------------------------------------

const assetSearchText = computed(() => store.getters.assetSearchText)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const dateFormat = computed(() => store.getters.dateFormat)
const displayedAssets = computed(() => store.getters.displayedAssets)
const displayedAssetsByType = computed(
  () => store.getters.displayedAssetsByType
)
const displayedEdits = computed(() => store.getters.displayedEdits)
const displayedEpisodes = computed(() => store.getters.displayedEpisodes)
const displayedSequences = computed(() => store.getters.displayedSequences)
const displayedShots = computed(() => store.getters.displayedShots)
const displayedShotsBySequence = computed(
  () => store.getters.displayedShotsBySequence
)
const editsLoadingKey = computed(() => store.getters.editsLoadingKey)
const isAssetsLoading = computed(() => store.getters.isAssetsLoading)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserProductionSupervisor
)
const isEditsLoading = computed(() => store.getters.isEditsLoading)
const isEpisodesLoading = computed(() => store.getters.isEpisodesLoading)
const isShotsLoading = computed(() => store.getters.isShotsLoading)
const isTVShow = computed(() => store.getters.isTVShow)
const playlistMap = computed(() => store.getters.playlistMap)
const playlists = computed(() => store.getters.playlists)
const playlistsPath = computed(() => store.getters.playlistsPath)
const productionTaskTypes = computed(() => store.getters.productionTaskTypes)
const shotSearchText = computed(() => store.getters.shotSearchText)
const shotsByEpisode = computed(() => store.getters.shotsByEpisode)
const shotsLoadingKey = computed(() => store.getters.shotsLoadingKey)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const use12HourClock = computed(() => store.getters.use12HourClock)

const isAdditionLoading = computed(
  () => loading.addWeekly || loading.addDaily || loading.addEpisode
)

// The all pseudo-episode is split by entity type: "All assets" (default)
// and "All shots" (?for_entity=shot). Undefined outside of it.
const allForEntity = computed(() => {
  if (!isTVShow.value || currentEpisode.value?.id !== 'all') return undefined
  return route.query.for_entity === 'shot' ? 'shot' : 'asset'
})

const allShotsQuery = computed(() =>
  allForEntity.value === 'shot' ? { for_entity: 'shot' } : {}
)

// The store keeps the last loaded list across pages: on mount it can
// belong to another production, episode or all-mode entity type.
const isPlaylistListStale = computed(() => {
  const [first] = playlists.value
  if (!first) return false
  return !isPlaylistInScope(first, {
    productionId: currentProduction.value.id,
    episodeId: isTVShow.value ? currentEpisode.value?.id : undefined,
    forEntity: allForEntity.value
  })
})

const currentEntityType = computed(() => currentPlaylist.value.for_entity)
const isAssetPlaylist = computed(() => currentEntityType.value === 'asset')
const isEditPlaylist = computed(() => currentEntityType.value === 'edit')
const isEpisodePlaylist = computed(() => currentEntityType.value === 'episode')
const isSequencePlaylist = computed(
  () => currentEntityType.value === 'sequence'
)

// Sequences, edits and episodes are listed flat, the others by group.
const flatAdditionEntities = computed(() => {
  let entities
  if (isSequencePlaylist.value) entities = displayedSequences.value
  else if (isEditPlaylist.value) entities = displayedEdits.value
  else if (isEpisodePlaylist.value) entities = displayedEpisodes.value
  return entities?.filter(entity => !entity.canceled)
})

const isAddSearchVisible = computed(
  () =>
    (isAssetPlaylist.value && assetSearchText.value) ||
    (!isAssetPlaylist.value && shotSearchText.value)
)

const addEntitiesText = computed(() => {
  if (isAssetPlaylist.value) return t('playlists.add_assets')
  if (isSequencePlaylist.value) return t('playlists.add_sequences')
  if (isEditPlaylist.value) return t('playlists.add_edits')
  if (isEpisodePlaylist.value) return t('playlists.add_episodes')
  return t('playlists.add_shots')
})

const episodeName = computed(() => {
  if (!currentEpisode.value) return ''
  if (currentEpisode.value.id === 'all') {
    return t(
      allForEntity.value === 'shot' ? 'main.all_shots' : 'main.all_assets'
    )
  }
  if (currentEpisode.value.id === 'main') return t('main.main_pack')
  return currentEpisode.value.name
})

const pageTitle = computed(() => {
  const productionName = currentProduction.value
    ? currentProduction.value.name
    : ''
  const context = isTVShow.value
    ? `${productionName} - ${episodeName.value}`
    : productionName
  return `${context} | ${t('playlists.title')} - Kitsu`
})

const taskTypeList = computed(() => [
  { id: '', color: '#999', name: t('news.all') },
  ...productionTaskTypes.value
])

// Functions
// --------------------------------------------------------------------------

// The playlist:update events are ignored while an operation of this page is
// saving, and for two seconds after: they echo its own changes.
const setSilent = () => {
  silentOperationCount++
  isSilent = true
}

const clearSilent = () => {
  setTimeout(() => {
    silentOperationCount--
    if (silentOperationCount <= 0) {
      isSilent = false
      silentOperationCount = 0
    }
  }, 2000)
}

const withSilent = async work => {
  setSilent()
  try {
    return await work()
  } finally {
    clearSilent()
  }
}

// Helpers

const formatDate = dateString =>
  formatDateBase(dateString, dateFormat.value, use12HourClock.value)

const isCurrentProjectEvent = eventData =>
  currentProduction.value?.id != null &&
  eventData?.project_id != null &&
  eventData.project_id === currentProduction.value.id

const getPlaylistPath = (playlistId, section) => ({
  ...buildPlaylistPath(
    currentProduction.value.id,
    currentEpisode.value ? currentEpisode.value.id : null,
    playlistId,
    section
  ),
  query: allShotsQuery.value
})

const playlistElementStyle = playlist => {
  if (isListToggled.value) return
  const color = taskTypeMap.value.get(playlist.task_type_id)?.color
  return { 'border-left': `4px solid ${color || 'transparent'}` }
}

const getTaskStatus = entity => {
  if (!getCachedEntity(entity.id)) return {}
  const taskId = entity.validations.get(currentPlaylist.value.task_type_id)
  const task = taskMap.value.get(taskId)
  return task ? taskStatusMap.value.get(task.task_status_id) : {}
}

const getCachedEntity = entityId => {
  if (isAssetPlaylist.value) return assetStore.cache.assetMap.get(entityId)
  if (isSequencePlaylist.value) {
    return sequenceStore.cache.sequenceMap.get(entityId)
  }
  if (isEditPlaylist.value) return editStore.cache.editMap.get(entityId)
  if (isEpisodePlaylist.value) {
    return episodeStore.cache.episodeMap.get(entityId)
  }
  return shotStore.cache.shotMap.get(entityId)
}

// Data loading

const loadShotsData = async () => {
  // Only the scope the store recorded tells an episode dataset from the
  // production-wide one, and a load in flight has emptied the map: await
  // it, or the playlist is rebuilt without its shots.
  const scope = isTVShow.value ? (currentEpisode.value?.id ?? '') : ''
  if (
    isShotsLoading.value ||
    shotsLoadingKey.value !== `${currentProduction.value.id}/${scope}`
  ) {
    if (isTVShow.value && ['main', 'all'].includes(currentEpisode.value?.id)) {
      // Pseudo-episodes load nothing of their own: only let the load in
      // flight refill the map it emptied.
      if (isShotsLoading.value) await shotStore.cache.shotsLoadingPromise
    } else {
      if (isTVShow.value && !currentEpisode.value) {
        await store.dispatch('loadEpisodes')
      }
      await store.dispatch('loadShots')
    }
  }
}

const loadAssetsData = async () => {
  if (isTVShow.value || displayedAssets.value.length === 0) {
    return store.dispatch('loadAssets')
  }
}

const loadEditsData = async () => {
  // Same rule as loadShotsData.
  const scope = isTVShow.value ? (currentEpisode.value?.id ?? '') : ''
  if (
    isEditsLoading.value ||
    editsLoadingKey.value !== `${currentProduction.value.id}/${scope}`
  ) {
    if (isTVShow.value && !currentEpisode.value) {
      await store.dispatch('loadEpisodes')
    }
    await store.dispatch('loadEdits')
  }
}

const loadEpisodesData = async () => {
  if (
    isTVShow.value &&
    (displayedEpisodes.value.length === 0 ||
      displayedEpisodes.value[0].project_id !== currentProduction.value.id)
  ) {
    await store.dispatch('loadEpisodes')
  }
}

const loadShareLinksCount = async playlistId => {
  if (!isCurrentUserManager.value || !playlistId) return
  try {
    const links = await store.dispatch('loadPlaylistShareLinks', playlistId)
    currentShareLinksCount.value = links.length
  } catch {
    currentShareLinksCount.value = 0
  }
}

const listQuery = () => ({
  sortBy: currentSort.value,
  page,
  taskTypeId: taskTypeId.value,
  forEntity: allForEntity.value
})

const loadPlaylistsData = async (force = false) => {
  if (playlists.value.length === 0 || force) {
    errors.playlistLoading = false
    try {
      await store.dispatch('loadPlaylists', listQuery())
    } catch (err) {
      console.error(err)
      errors.playlistLoading = true
      throw err
    }
  }
}

const onPlaylistListScroll = event => {
  if (isSilentMore) return
  const listEl = playlistListRef.value
  const maxHeight = listEl.scrollHeight - listEl.offsetHeight
  if (maxHeight < event.target.scrollTop + 20) {
    onLoadMoreClicked()
  }
}

const onLoadMoreClicked = async () => {
  isSilentMore = true
  page++
  loading.morePlaylists = true
  errors.playlistLoading = false
  try {
    const morePlaylists = await store.dispatch('loadMorePlaylists', listQuery())
    setTimeout(() => {
      loading.morePlaylists = false
      isSilentMore = false
    }, 1000)
    if (morePlaylists.length < 20) {
      isMorePlaylists.value = false
    }
  } catch (err) {
    console.error(err)
    // The page asked for was not served: the next try asks for it again.
    page--
    loading.morePlaylists = false
    isSilentMore = false
    errors.playlistLoading = true
  }
}

// Playlist build

const rebuildCurrentEntities = () => {
  currentEntitiesMap.value = {}
  currentEntitiesList.value = []
  previewFileMap.value = new Map()
  previewFileEntityMap.value = new Map()
  const entities = (currentPlaylist.value?.shots || [])
    .map(entity => convertEntityToPlaylistFormat(entity))
    .filter(Boolean)
  entities.forEach(playlistEntity => {
    currentEntitiesMap.value[playlistEntity.id] = playlistEntity
    Object.values(playlistEntity.preview_files)
      .flat()
      .forEach(previewFile => {
        previewFileMap.value.set(previewFile.id, previewFile)
      })
  })
  nextTick(() => {
    currentEntitiesList.value = entities
  })
}

const onAnnotationsRefreshed = preview => {
  const entity = previewFileEntityMap.value.get(preview.id)
  const localPreview = previewFileMap.value.get(preview.id)
  if (entity) {
    entity.preview_file_annotations = preview.annotations
  }
  if (localPreview) {
    localPreview.annotations = preview.annotations
  }
}

const convertEntityToPlaylistFormat = entityInfo => {
  if (!entityInfo) return null
  const entity = getCachedEntity(entityInfo.id)
  if (!entity) return null
  if (isSequencePlaylist.value && currentEpisode.value) {
    entity.episode_name = currentEpisode.value.name
  }
  const playlistEntity = {
    id: entityInfo.id,
    name: entity.name,
    parent_name:
      entity.sequence_name || entity.episode_name || entity.asset_type_name,
    // Per-entity fps: an entity can override the production fps via
    // data.fps. Carried here so the player uses the right rate for
    // whichever entity is playing (a playlist can mix fps).
    fps:
      parseFloat(entity.data?.fps) ||
      parseFloat(currentProduction.value?.fps) ||
      25,
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
      entityInfo.preview_file_annotations || entity.preview_file_annotations,
    preview_file_previews:
      entityInfo.preview_file_previews || entity.preview_file_previews,
    preview_nb_frames:
      entityInfo.nb_frames || entity.nb_frames || DEFAULT_NB_FRAMES_PICTURE
  }
  previewFileEntityMap.value.set(playlistEntity.preview_file_id, playlistEntity)
  const previews = playlistEntity.preview_file_previews || []
  previews.forEach(preview => {
    previewFileMap.value.set(preview.id, preview)
  })
  return playlistEntity
}

const setCurrentPlaylist = async () => {
  const playlistId = route.params.playlist_id
  const playlist = playlistMap.value.get(playlistId)
  if (playlist) {
    loading.playlist = true
    const loadedPlaylist = await store.dispatch('loadPlaylist', playlist)
    // Another playlist opened during the load: its own load shows it.
    if (route.params.playlist_id !== playlistId) return
    currentPlaylist.value = loadedPlaylist
    rebuildCurrentEntities()
    loading.playlist = false
    loadShareLinksCount(loadedPlaylist.id)
  } else {
    loading.playlist = false
    currentPlaylist.value = { name: '' }
  }
}

const scrollPlayerToRight = () => {
  nextTick(() => {
    playlistPlayerRef.value?.scrollToRight()
  })
}

const addEntity = async (entity, playlist) => {
  entityLoading[entity.id] = true
  try {
    const previewFiles = await store.dispatch('loadEntityPreviewFiles', entity)
    const playlistEntity = await store.dispatch('pushEntityToPlaylist', {
      playlist,
      previewFiles,
      entity: { ...entity },
      entityMap: currentEntitiesMap.value
    })
    addToPlayerPlaylist(playlistEntity, playlist)
    return playlistEntity
  } catch (err) {
    console.error(err)
    return null
  } finally {
    entityLoading[entity.id] = false
  }
}

const addToPlayerPlaylist = (entity, playlist) => {
  if (playlist.id !== currentPlaylist.value.id) return
  const playlistEntity = convertEntityToPlaylistFormat(entity)
  if (!playlistEntity) return
  currentEntitiesList.value.push(playlistEntity)
  currentEntitiesMap.value[playlistEntity.id] = playlistEntity
  scrollPlayerToRight()
}

const addEntityToPlaylist = async entity => {
  setSilent()
  entitiesAddedWhilePanelOpen = true
  await addEntity(entity, currentPlaylist.value)
  clearSilent()
  playlistPlayerRef.value?.scrollToRight()
}

const onNewEntityDropped = async info => {
  setSilent()
  const entity = getCachedEntity(info.after.entity_id)
  if (entity && !currentEntitiesMap.value[entity.id]) {
    const addedEntity = await addEntity(entity, currentPlaylist.value)
    // The preview file id is only resolved when the entity is added, so
    // the dragged payload can't carry it. Patch it in before replaying
    // the drop so findEntity can locate the newly added entity and move
    // it to the drop position instead of leaving it at the end.
    if (addedEntity) {
      info.after.preview_file_id = addedEntity.preview_file_id
    }
    playlistPlayerRef.value?.onEntityDropped(info)
  }
  clearSilent()
}

const removeEntity = async ({ entity, previewFileId }) => {
  setSilent()
  currentEntitiesList.value = currentEntitiesList.value.filter(
    e => e.id !== entity.id || e.preview_file_id !== previewFileId
  )
  if (!currentEntitiesList.value.some(e => e.id === entity.id)) {
    currentEntitiesMap.value[entity.id] = undefined
  }
  await store.dispatch('removeEntityPreviewFromPlaylist', {
    playlist: currentPlaylist.value,
    entity,
    previewFileId
  })
  clearSilent()
}

const resetPlaylist = () => {
  currentPlaylist.value = {}
  setCurrentPlaylist()
}

// Addition helpers

const addEntities = async entities => {
  // Captured once: keep adding to the playlist the user started from,
  // even if they switch playlists mid-sequence.
  const playlist = currentPlaylist.value
  if (!entities?.length) return
  entitiesAddedWhilePanelOpen = true
  entities.forEach(entity => {
    entityLoading[entity.id] = true
  })
  try {
    await store.dispatch('addEntitiesToPlaylist', {
      playlist,
      entityIds: entities.map(entity => entity.id)
    })
    if (playlist.id === currentPlaylist.value.id) {
      const loadedPlaylist = await store.dispatch('loadPlaylist', playlist)
      if (route.params.playlist_id !== playlist.id) return
      currentPlaylist.value = loadedPlaylist
      rebuildCurrentEntities()
      scrollPlayerToRight()
    }
  } catch (err) {
    console.error(err)
  } finally {
    entities.forEach(entity => {
      entityLoading[entity.id] = false
    })
  }
}

const addWithLoading = (loadingKey, getEntities) =>
  withSilent(async () => {
    loading[loadingKey] = true
    try {
      await addEntities(await getEntities())
    } finally {
      loading[loadingKey] = false
    }
  })

const getPendingEntities = async isDaily => {
  const [action, sortEntities] = isAssetPlaylist.value
    ? ['getPendingAssets', sortAssets]
    : ['getPendingShots', sortShots]
  return sortEntities(await store.dispatch(action, isDaily))
}

const addCurrentSelection = () => {
  let entities = displayedShots.value
  if (isAssetPlaylist.value) entities = displayedAssets.value
  else if (isEditPlaylist.value) entities = displayedEdits.value
  else if (isEpisodePlaylist.value) entities = displayedEpisodes.value
  return withSilent(() => addEntities(entities))
}

const addSequence = sequenceShots => {
  if (sequenceShots.length === 0) return
  const sequenceId = sequenceShots[0].sequence_id
  const shots = Array.from(shotStore.cache.shotMap.values())
    .filter(shot => shot.sequence_id === sequenceId)
    .sort(firstBy('name'))
  return withSilent(() => addEntities(shots))
}

const addAllPending = () =>
  addWithLoading('addWeekly', () => getPendingEntities(false))

const addDailyPending = () =>
  addWithLoading('addDaily', () => getPendingEntities(true))

const addEpisodePending = () =>
  addWithLoading('addEpisode', () => sortShots(shotsByEpisode.value.flat()))

const addMovie = () =>
  addWithLoading('addMovie', () =>
    sortShots(Array.from(shotStore.cache.shotMap.values()))
  )

// Save data

const onPreviewChanged = async ({
  entity,
  previewFileId,
  previousPreviewFileId
}) => {
  setSilent()
  await store.dispatch('changePlaylistPreview', {
    playlist: currentPlaylist.value,
    entity,
    previewFileId,
    previousPreviewFileId
  })
  clearSilent()
}

const onOrderChange = info => {
  setSilent()
  store.dispatch('changePlaylistOrder', {
    playlist: currentPlaylist.value,
    info
  })
  clearSilent()
}

const onAnnotationChanged = async ({
  preview,
  additions,
  deletions,
  updates
}) => {
  const playlistPlayer = playlistPlayerRef.value
  try {
    await store.dispatch('updatePreviewAnnotation', {
      taskId: preview.task_id,
      preview,
      additions,
      deletions,
      updates
    })
    playlistPlayer?.confirmAnnotationsSaved()
  } catch (err) {
    console.error('Failed to save annotations', err)
    playlistPlayer?.restoreFailedAnnotations()
  }
}

// Search

const confirmBuildFilter = query => {
  modals.isBuildFilterDisplayed = false
  searchFieldRef.value.setValue(query)
  onSearchChange(query)
}

const onSearchChange = searchQuery => {
  const query = searchQuery.length > 1 ? searchQuery : ''
  if (isAssetPlaylist.value) {
    store.dispatch('setAssetSearch', query)
    if (query) store.dispatch('displayMoreAssets')
  } else if (isSequencePlaylist.value) {
    store.dispatch('setSequenceSearch', query)
    if (query) store.dispatch('resetSequences')
  } else {
    store.dispatch('setShotSearch', query)
    if (query) store.dispatch('displayMoreShots')
  }
}

// Playlist list

const onForClientChanged = forClient => {
  store.dispatch('editPlaylist', {
    data: {
      id: currentPlaylist.value.id,
      for_client: forClient
    }
  })
}

const runAddPlaylist = async form => {
  loading.editPlaylist = true
  errors.editPlaylist = false
  try {
    const playlist = await store.dispatch('newPlaylist', {
      name: form.name,
      production_id: currentProduction.value.id,
      for_client: form.for_client,
      for_entity: form.for_entity,
      is_for_all: form.is_for_all,
      task_type_id: form.task_type_id,
      ...(isTVShow.value && currentEpisode.value
        ? { episode_id: currentEpisode.value.id }
        : {})
    })
    router.push(getPlaylistPath(playlist.id))
    modals.isEditDisplayed = false
  } catch (err) {
    console.error(err)
    errors.editPlaylist = true
  } finally {
    loading.editPlaylist = false
  }
}

const runEditPlaylist = async form => {
  loading.editPlaylist = true
  errors.editPlaylist = false
  try {
    const playlist = await store.dispatch('editPlaylist', {
      data: {
        id: form.id,
        for_client: form.for_client,
        for_entity: form.for_entity,
        name: form.name,
        task_type_id: form.task_type_id
      }
    })
    modals.isEditDisplayed = false
    Object.assign(currentPlaylist.value, playlist)
  } catch (err) {
    errors.editPlaylist = true
  } finally {
    loading.editPlaylist = false
  }
}

const confirmEditPlaylist = form => {
  if (playlistToEdit.value.id) {
    withSilent(() => runEditPlaylist({ ...form, id: currentPlaylist.value.id }))
  } else {
    runAddPlaylist(form)
  }
}

const goFirstPlaylist = () => {
  if (playlists.value.length > 0) {
    router.push({
      name: 'playlist',
      params: {
        production_id: currentProduction.value.id,
        playlist_id: playlists.value[0].id
      },
      query: allShotsQuery.value
    })
  } else {
    router.push({ ...playlistsPath.value, query: allShotsQuery.value })
  }
}

const onEntityDragStart = (event, entity) => {
  event.dataTransfer.setData('entityId', entity.id)
}

// Changes

const toggleAddEntities = () => {
  if (isAddingEntity.value) {
    // Only rebuild the playlist when entities were actually added:
    // closing an untouched panel otherwise reloads the whole player.
    if (entitiesAddedWhilePanelOpen) resetPlaylist()
    entitiesAddedWhilePanelOpen = false
  }
  isAddingEntity.value = !isAddingEntity.value
}

const rebuildAfter = (action, payload) =>
  withSilent(async () => {
    try {
      await store.dispatch(action, payload)
      rebuildCurrentEntities()
    } catch (err) {
      console.error(err)
    }
  })

const onTaskTypeChanged = newTaskTypeId =>
  rebuildAfter('changePlaylistType', {
    playlist: currentPlaylist.value,
    taskTypeId: newTaskTypeId
  })

const onUpdateToLatestVersion = () =>
  rebuildAfter('updatePlaylistToLatestVersion', {
    playlist: currentPlaylist.value
  })

const onBodyScroll = event => {
  const content = entityListContentRef.value
  const maxHeight = content.scrollHeight - content.offsetHeight
  if (maxHeight < event.target.scrollTop) {
    store.dispatch(
      isAssetPlaylist.value ? 'displayMoreAssets' : 'displayMoreShots'
    )
  }
}

// Modals

const showAddModal = () => {
  playlistToEdit.value = {
    ...newPlaylistForm(),
    for_entity: allForEntity.value
  }
  errors.editPlaylist = false
  modals.isEditDisplayed = true
}

const showEditModal = () => {
  playlistToEdit.value = currentPlaylist.value
  errors.editPlaylist = false
  modals.isEditDisplayed = true
}

const hideEditModal = () => {
  playlistToEdit.value = newPlaylistForm()
  modals.isEditDisplayed = false
}

// Loading

// What a run serves: the scope of the loads plus the list filters.
const reloadScope = () =>
  [
    currentProduction.value?.id,
    currentEpisode.value?.id ?? '',
    allForEntity.value ?? '',
    currentSort.value,
    taskTypeId.value
  ].join('/')

// Every reload goes through this gate. The watchers can ask again while
// a run is in flight: remember it and, once the run settles, run a full
// forced reload if the run did not serve the scope asked for since.
// `work` publishes the scope it serves through servedScope, or throws.
const runReload = async work => {
  if (loading.playlists) {
    isReloadPending = true
    // The scope may come back before the run settles while the loads
    // made in between served the other one: remember the move itself.
    if (servedScope && servedScope !== reloadScope()) {
      isServedScopeStale = true
    }
    return
  }
  loading.playlists = true
  let isServed = false
  try {
    await work()
    isServed = true
  } finally {
    loading.playlists = false
    const isStale =
      !isServed || isServedScopeStale || servedScope !== reloadScope()
    servedScope = null
    isServedScopeStale = false
    if (isReloadPending) {
      isReloadPending = false
      if (!isUnmounted && isStale) await reloadAll(true)
    }
  }
}

const reloadAll = (force = false) =>
  runReload(async () => {
    // Resolve the episode first: the fallback fires the currentEpisode
    // watcher, whose request this very run serves.
    if (isTVShow.value && !currentEpisode.value) {
      await store.dispatch('loadEpisodes')
    }
    servedScope = reloadScope()
    // Leaving the page stops the run: a further load would blank the
    // page displayed instead.
    await loadShotsData()
    if (isUnmounted) return
    await loadAssetsData()
    if (isUnmounted) return
    await loadEditsData()
    if (isUnmounted) return
    await loadEpisodesData()
    if (isUnmounted) return
    page = 1
    await loadPlaylistsData(force || isPlaylistListStale.value)
    if (isUnmounted) return
    resetPlaylist()
    setTimeout(() => {
      loading.playlistsInit = false
    }, 300)
  })

// The sort and the task type filter only need the list again, from its
// first page: the page reached before holds nothing once fewer
// playlists match.
const reloadPlaylistList = () =>
  runReload(async () => {
    servedScope = reloadScope()
    page = 1
    await loadPlaylistsData(true)
    setCurrentPlaylist()
  })

const resetPlaylistsAndReload = () => {
  store.commit('LOAD_PLAYLISTS_END', [])
  reloadAll()
}

// Socket events

const onBuildJobEvent = update => eventData => {
  if (
    isCurrentProjectEvent(eventData) &&
    eventData.playlist_id === currentPlaylist.value.id
  ) {
    update(eventData)
  }
}

const SOCKET_EVENTS = {
  'playlist:new': eventData => {
    if (
      isCurrentProjectEvent(eventData) &&
      !playlistMap.value.get(eventData.playlist_id)
    ) {
      store.dispatch('refreshPlaylist', {
        id: eventData.playlist_id,
        // The scope the list was loaded for, as in isPlaylistListStale.
        scope: {
          productionId: currentProduction.value.id,
          episodeId: isTVShow.value ? currentEpisode.value?.id : undefined,
          forEntity: allForEntity.value,
          taskTypeId: taskTypeId.value
        }
      })
    }
  },

  'playlist:update': async eventData => {
    if (
      isCurrentProjectEvent(eventData) &&
      playlistMap.value.get(eventData.playlist_id) &&
      !isSilent &&
      !isAddingEntity.value
    ) {
      const playlist = await store.dispatch('refreshPlaylist', {
        id: eventData.playlist_id
      })
      if (eventData.playlist_id === currentPlaylist.value.id) {
        currentPlaylist.value = playlist
        nextTick(() => {
          rebuildCurrentEntities()
        })
      }
    }
  },

  'playlist:delete': eventData => {
    if (
      isCurrentProjectEvent(eventData) &&
      playlistMap.value.get(eventData.playlist_id)
    ) {
      store.commit('DELETE_PLAYLIST_END', { id: eventData.playlist_id })
    }
  },

  'build-job:new': onBuildJobEvent(eventData => {
    currentPlaylist.value.build_jobs = [
      {
        id: eventData.build_job_id,
        created_at: eventData.created_at,
        status: 'running',
        playlist_id: currentPlaylist.value.id
      },
      ...(currentPlaylist.value.build_jobs || [])
    ]
  }),

  'build-job:update': onBuildJobEvent(eventData => {
    updateModelFromList(currentPlaylist.value.build_jobs, {
      id: eventData.build_job_id,
      status: eventData.status
    })
  }),

  'build-job:delete': onBuildJobEvent(eventData => {
    currentPlaylist.value.build_jobs = removeModelFromList(
      currentPlaylist.value.build_jobs,
      { id: eventData.build_job_id }
    )
  })
}

// Watchers
// --------------------------------------------------------------------------

watch(
  () => route.fullPath,
  () => setCurrentPlaylist()
)

watch(currentPlaylist, () => {
  if (currentPlaylist.value.shots) {
    isSilentMore = false
    isAddingEntity.value = Object.keys(currentPlaylist.value.shots).length === 0
  } else {
    isAddingEntity.value = true
  }
})

watch(currentProduction, resetPlaylistsAndReload)

watch(currentEpisode, () => {
  store.commit('LOAD_PLAYLISTS_END', [])
  if (currentEpisode.value) reloadAll()
})

watch(allForEntity, (forEntity, previous) => {
  // All assets <-> All shots: same episode, different query.
  if (forEntity && previous) resetPlaylistsAndReload()
})

watch(currentSort, () => {
  localStorage.setItem('playlist-sort', currentSort.value)
  reloadPlaylistList()
})

watch(isListToggled, () => {
  playlistPlayerRef.value?.onWindowResize()
})

watch(taskTypeId, () => reloadPlaylistList())

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.on(eventName, handler)
  })
  // Next tick needed to ensure that current production is properly set.
  nextTick(() => reloadAll())
})

onBeforeUnmount(() => {
  isUnmounted = true
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.off(eventName, handler)
  })
})

// Head
// --------------------------------------------------------------------------

useHead({ title: pageTitle })
</script>

<style lang="scss" scoped>
// The page is always dark, whatever the theme: see the root class.
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
  background: $dark-grey-light;
  overflow-y: auto;
  padding: 1em;
  border-right: 1px solid $dark-grey;
  box-shadow: 0 0 6px #333;
  z-index: 201;
}

.playlist-item {
  display: block;
  background: $dark-grey-lightmore;
  border: 2px solid $dark-grey;
  border-radius: 3px;
  box-shadow: 0 0 6px #333;
  color: $white-grey;
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
  position: relative;
  width: 170px;
  display: flex;
  flex-direction: column;

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
  box-shadow: 0 0 6px #333;
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

// The .page prefix outweighs the global button colors.
.page .playlist-column {
  button,
  h2.entity-group-title {
    color: white;
  }
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
  margin: 1em;
  padding-bottom: 0.2em;
  text-transform: uppercase;

  button {
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
  background: $dark-grey-light;

  .recent-playlist {
    position: relative;
    height: 320px;
    max-width: 800px;
    margin: auto;
    margin-bottom: 1em;
    overflow: hidden;
    background: $dark-grey-lightmore;
    border: 2px solid $dark-grey;
    box-shadow: 0 0 6px #333;
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
      padding: 0.3em 1.2em;
      height: 65px;
    }

    h3 {
      color: white;
      font-size: 1.4em;
      font-weight: bold;
    }
    span {
      display: block;
    }
  }

  .empty-explanation {
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
      margin-top: 1px;
    }
  }
}

.entity-loading-spinner {
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  bottom: 22px;
  display: flex;
  justify-content: center;
  left: 0;
  right: 20px;
  position: absolute;
  top: 0;
}
</style>
