<template>
  <panel-layout
    class="sequence entity-page xyz-in"
    xyz="fade"
    :class="{ 'drawer-open': isDrawerOpen }"
    :side="hasSidePanel"
    v-if="currentProduction"
  >
    <template #filters>
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :title="$t('main.back')"
          :to="sequencesPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentSequence"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentSequence"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :title="$t('main.previous_entity')"
          :to="previousEntityPath"
          v-if="previousEntityPath && entityList.length > 1"
        >
          <chevron-left-icon />
        </router-link>
        <router-link
          class="flexrow-item has-text-centered back-link"
          :title="$t('main.next_entity')"
          :to="nextEntityPath"
          v-if="nextEntityPath && entityList.length > 1"
        >
          <chevron-right-icon />
        </router-link>
      </div>
    </template>

    <template #list>
      <div class="entity-data" v-if="!loadError">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="sequenceTabs"
        />

        <div class="flexrow mt1">
          <template v-if="currentSection === 'casting'">
            <span
              class="tag tag-standby"
              v-if="currentSequence?.is_casting_standby"
            >
              {{ $t('breakdown.fields.standby') }}
            </span>
          </template>
          <div class="filler"></div>
          <template
            v-if="
              currentSection === 'schedule' &&
              scheduleItems[0].children.length > 0
            "
          >
            <span class="flexrow-item mt05">
              {{ $t('schedule.zoom_level') }}:
            </span>
            <combobox-number
              class="zoom-level flexrow-item"
              is-simple
              :options="zoomOptions"
              v-model="zoomLevel"
            />
          </template>
        </div>

        <div class="flexcolumn infos" v-show="currentSection === 'infos'">
          <entity-task-list
            class="task-list"
            :entries="currentTasks"
            :is-loading="!currentSequence"
            :is-error="false"
            :selected-task-id="currentTask?.id"
            @task-selected="onTaskSelected"
          />
        </div>

        <div
          class="flexcolumn information"
          v-show="currentSection === 'information'"
        >
          <button-simple
            class="edit-button"
            icon="edit"
            :title="$t('sequences.edit_title')"
            @click="showEditModal"
            v-if="isCurrentUserManager"
          />
          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentSequence">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.description') }}
                  </td>
                  <description-cell :entry="currentSequence" :full="true" />
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in sequenceMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    <metadata-value
                      :descriptor="descriptor"
                      :entity="currentSequence"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentSequence"
          :name="currentSequence?.full_name"
          v-if="currentSection === 'chat'"
        />

        <div class="entity-casting" v-show="currentSection === 'casting'">
          <template v-if="currentSequence">
            <div v-if="currentSequence.castingAssetsByType?.[0]?.length > 0">
              <div class="casting-title flexrow">
                <page-subtitle
                  class="flexrow-item"
                  :text="`${nbAssets} ${$t('assets.number', { count: nbAssets })}`"
                />
                <div class="filler"></div>
                <button-simple
                  class="flexrow-item"
                  icon="grid"
                  :active="castingView === 'cards'"
                  :title="$t('breakdown.view_as_cards')"
                  @click="castingView = 'cards'"
                />
                <button-simple
                  class="flexrow-item"
                  icon="list"
                  :active="castingView === 'list'"
                  :title="$t('breakdown.view_as_list')"
                  @click="castingView = 'list'"
                />
                <button-simple
                  class="flexrow-item"
                  icon="film"
                  :title="$t('playlists.view_as_playlist')"
                  @click="viewPlaylist(castAssets)"
                />
              </div>
              <div
                class="casting-group"
                :key="typeAssets[0]?.asset_type_name"
                v-for="typeAssets in currentSequence.castingAssetsByType"
              >
                <div class="casting-group-header flexrow">
                  <span class="flexrow-item group-name">
                    {{ typeAssets[0]?.asset_type_name }}
                  </span>
                  <span class="flexrow-item tag">{{ typeAssets.length }}</span>
                  <div class="filler"></div>
                  <button-simple
                    class="flexrow-item"
                    icon="film"
                    :title="$t('playlists.view_as_playlist')"
                    @click="viewPlaylist(typeAssets)"
                  />
                </div>
                <div class="casting-grid" v-if="castingView === 'cards'">
                  <router-link
                    class="casting-card"
                    :class="{ shared: asset.shared }"
                    :key="asset.asset_id"
                    :to="assetPath(asset)"
                    v-for="asset in typeAssets"
                  >
                    <div class="card-preview">
                      <entity-preview
                        cover
                        is-rounded-top-border
                        :entity="asset"
                        :empty-width="200"
                        :empty-height="112"
                        :show-movie="false"
                      />
                      <span
                        class="nb-occurences"
                        v-if="asset.nb_occurences > 1"
                      >
                        {{ asset.nb_occurences }}
                      </span>
                    </div>
                    <div class="card-description">
                      <div class="card-name flexrow">
                        <span class="flexrow-item filler break-word">
                          {{ asset.asset_name }}
                        </span>
                        <span
                          class="asset-label flexrow-item"
                          :label="asset.label"
                        >
                          {{ asset.label || $t('breakdown.options.animate') }}
                        </span>
                      </div>
                      <div class="ready-for flexrow" v-if="asset.ready_for">
                        <span class="flexrow-item filler">
                          {{ $t('assets.fields.ready_for') }}
                        </span>
                        <task-type-name
                          class="flexrow-item"
                          :task-type="taskTypeMap.get(asset.ready_for)"
                          :is-link="false"
                          :title="
                            'Ready for: ' +
                            (taskTypeMap.get(asset.ready_for)?.name || '')
                          "
                        />
                      </div>
                    </div>
                  </router-link>
                </div>
                <casting-list
                  entity-type="asset"
                  :entries="typeAssets"
                  :entity-path="assetPath"
                  v-else
                />
              </div>
            </div>
            <empty-section
              :icon="BoxIcon"
              :text="$t('sequences.no_casting')"
              v-else
            />
          </template>
          <table-info
            :is-loading="casting.isLoading"
            :is-error="casting.isError"
            v-else
          />
        </div>

        <div
          class="schedule mt1"
          v-if="scheduleItems[0].children.length > 0"
          v-show="currentSection === 'schedule'"
        >
          <error-text
            class="has-text-centered"
            :text="scheduleSaveErrorText"
            v-if="scheduleSaveErrorText"
          />
          <div class="wrapper">
            <schedule
              ref="scheduleWidget"
              :start-date="tasksStartDate"
              :end-date="tasksEndDate"
              :hierarchy="scheduleItems"
              :zoom-level="zoomLevel"
              :is-loading="false"
              :is-estimation-linked="true"
              :hide-root="true"
              :with-milestones="false"
              @item-changed="saveTaskScheduleItem"
              @estimation-changed="event => saveTaskScheduleItem(event.item)"
            />
          </div>
        </div>
        <empty-section
          :icon="CalendarIcon"
          :text="$t('main.empty_schedule')"
          v-else-if="currentSection === 'schedule'"
        />

        <entity-preview-files
          :entity="currentSequence"
          v-if="currentSequence && currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentSequence"
          v-if="currentSequence && currentSection === 'time-logs'"
        />
      </div>
      <entity-load-error
        class="entity-data"
        :error="loadError"
        @reload="init()"
        v-else
      />
    </template>

    <template #side>
      <task-info :task="currentTask" entity-type="Sequence" with-actions>
        <entity-news class="news-column" :entity="currentSequence" />
      </task-info>
    </template>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isDrawerOpen }"
      @click="closeTask"
      v-if="hasSidePanel"
    ></div>

    <view-playlist-modal
      active
      entity-type="asset"
      :entity-ids="playlistEntityIds"
      @cancel="playlistEntityIds = null"
      v-if="playlistEntityIds"
    />

    <edit-sequence-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-deleted="errors.editDeleted"
      :sequence-to-edit="currentSequence"
      @cancel="modals.edit = false"
      @confirm="confirmEditSequence"
    />
  </panel-layout>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import {
  BoxIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerLeftUpIcon
} from 'lucide-vue-next'
import {
  computed,
  defineAsyncComponent,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useCastingView } from '@/composables/castingView'
import { isListOfPageLoaded, useEntity } from '@/composables/entity'
import { isNotFound } from '@/lib/errors'
import { episodifyRoute, getEntitiesPath } from '@/lib/path'
import sequenceStore from '@/store/modules/sequences'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import PanelLayout from '@/components/layouts/PanelLayout.vue'
import CastingList from '@/components/lists/CastingList.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityLoadError from '@/components/pages/entities/EntityLoadError.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import Schedule from '@/components/schedule/Schedule.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const ViewPlaylistModal = defineAsyncComponent(
  () => import('@/components/modals/ViewPlaylistModal.vue')
)

defineOptions({ name: 'sequence' })

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------
const castingView = useCastingView()
const currentSequence = ref(null)
const playlistEntityIds = ref(null)
const scheduleWidget = ref(null)
const casting = reactive({ isLoading: false, isError: false })
const errors = reactive({ edit: false, editDeleted: false })
const loading = reactive({ edit: false })
const modals = reactive({ edit: false })

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isTVShow = computed(() => store.getters.isTVShow)
const sequenceMetadataDescriptors = computed(
  () => store.getters.sequenceMetadataDescriptors
)
const sequenceSearchText = computed(() => store.getters.sequenceSearchText)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// The list of the page, once loaded: a load replaces the cached array out of
// sight of Vue, and its scope and loading flag have it read again.
const entityList = computed(() =>
  isListOfPageLoaded(store.getters, 'sequence')
    ? sequenceStore.cache.sequences
    : []
)

const title = computed(() => {
  if (!currentSequence.value) return loadTitle.value
  const { name } = currentSequence.value
  return currentEpisode.value ? `${currentEpisode.value.name} / ${name}` : name
})

const castAssets = computed(() =>
  (currentSequence.value?.castingAssetsByType || []).flat()
)
const nbAssets = computed(() => castAssets.value.length)

const sequencesPath = computed(() => ({
  ...getEntitiesPath(
    currentProduction.value.id,
    'sequences',
    currentEpisode.value?.id
  ),
  query: { search: sequenceSearchText.value }
}))

const sequenceTabs = computed(() => [
  // the section of the tasks keeps its name: links and the default use it
  { label: t('main.tasks'), name: 'infos' },
  { label: t('main.label.info'), name: 'information' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.casting'), name: 'casting' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.timelog'), name: 'time-logs' },
  { label: t('main.label.preview_files'), name: 'preview-files' }
])

// the task panel belongs to the section of the tasks
const hasSidePanel = computed(() => currentSection.value === 'infos')
const isDrawerOpen = computed(() => Boolean(currentTask.value))

// Functions
// --------------------------------------------------------------------------
// the sequence list only carries the tasks once loaded with them, and on
// a TV show that load is scoped to the current episode, which the route
// without episode leaves unset: align it on the sequence's own episode.
// The list of a production holds all its sequences: one it lacks is missing.
const getCurrentSequence = async () => {
  const sequenceId = route.params.sequence_id
  let sequence = sequenceStore.cache.sequenceMap.get(sequenceId) || null
  if (!sequence?.validations) {
    if (isTVShow.value) {
      await store.dispatch('loadEpisodes')
      const { parent_id } =
        sequence || (await store.dispatch('loadSequence', sequenceId)) || {}
      const episodeId = currentEpisode.value?.id
      // Left during the fetches: the page shown now owns the episode.
      const isStillShown = route.params.sequence_id === sequenceId
      if (
        isStillShown &&
        parent_id &&
        episodeId !== 'all' &&
        episodeId !== parent_id
      ) {
        store.dispatch('setCurrentEpisode', parent_id)
      }
    }
    await store.dispatch('loadSequencesWithTasks')
    sequence = sequenceStore.cache.sequenceMap.get(sequenceId) || null
  }
  return sequence
}

const loadCastingData = async () => {
  casting.isLoading = true
  casting.isError = false
  try {
    await store.dispatch('loadSequenceCasting', currentSequence.value)
  } catch (err) {
    casting.isError = true
    console.error(err)
  }
  casting.isLoading = false
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

const assetPath = asset =>
  episodifyRoute(
    {
      name: 'asset',
      params: {
        production_id: currentProduction.value.id,
        asset_id: asset.asset_id
      },
      query: { section: 'casting' }
    },
    isTVShow.value ? currentEpisode.value?.id || 'main' : null
  )

// Close leaves the error of the last save: opening drops it.
const showEditModal = () => {
  errors.edit = false
  modals.edit = true
}

const confirmEditSequence = async form => {
  const data = { ...form, id: currentSequence.value.id }
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editSequence', data)
    // The store writes the changes into its cached sequence out of sight of
    // Vue: a copy shows them, unless the page moved on to another sequence. Not
    // after a refusal: the modal, open on the error, would reset what was
    // typed.
    const sequence = sequenceStore.cache.sequenceMap.get(data.id)
    if (sequence && currentSequence.value?.id === data.id) {
      currentSequence.value = { ...sequence }
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
    errors.editDeleted = isNotFound(err)
  }
  loading.edit = false
}

const closeTask = () => {
  if (currentTask.value) onTaskSelected(currentTask.value)
}

const viewPlaylist = assets => {
  playlistEntityIds.value = assets.map(asset => asset.asset_id)
}

const {
  init,
  loadError,
  loadTitle,
  currentSection,
  currentTask,
  zoomLevel,
  zoomOptions,
  scheduleItems,
  previousEntityPath,
  nextEntityPath,
  currentTasks,
  tasksStartDate,
  tasksEndDate,
  onTaskSelected,
  saveTaskScheduleItem,
  scheduleSaveErrorText
} = useEntity({
  type: 'sequence',
  currentEntity: currentSequence,
  entityList,
  readEntity: getCurrentSequence,
  scheduleWidget,
  onEntityRead: (sequence, isListRead) => {
    loadCastingData()
    if (!isListRead) setTimeout(scrollScheduleToStart, 100)
  },
  loadList: () => store.dispatch('loadSequencesWithTasks')
})

// Watchers
// --------------------------------------------------------------------------
watch(currentSection, () => {
  if (currentSection.value === 'schedule' && scheduleItems.value.length > 0) {
    scrollScheduleToStart()
  }
})

watch(zoomLevel, scrollScheduleToStart)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  store.dispatch('clearSelectedTasks')
  init()
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${title.value} - Kitsu`) })
</script>

<style lang="scss" scoped>
@use '@/styles/entity-page.scss' as entity;

@include entity.page;
@include entity.casting;
</style>
