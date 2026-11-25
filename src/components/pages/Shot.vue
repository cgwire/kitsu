<template>
  <panel-layout
    class="shot entity-page xyz-in"
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
          :to="shotsPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentShot"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentShot"
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
          :tabs="shotTabs"
        />

        <div class="flexrow mt1">
          <template v-if="currentSection === 'casting'">
            <span
              class="tag tag-standby"
              v-if="currentShot?.is_casting_standby"
            >
              {{ $t('breakdown.fields.standby') }}
            </span>
          </template>
          <div class="filler"></div>
          <template v-if="currentSection === 'schedule'">
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
            :is-loading="!currentShot"
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
            :title="$t('shots.edit_title')"
            @click="showEditModal"
            v-if="isCurrentUserManager"
          />
          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentShot">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.description') }}
                  </td>
                  <description-cell :entry="currentShot" :full="true" />
                </tr>
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.nb_frames') }}
                  </td>
                  <td>{{ currentShot.nb_frames }}</td>
                </tr>
                <tr
                  class="datatable-row"
                  v-if="currentShot.data?.frame_in != null"
                >
                  <td class="field-label">
                    {{ $t('shots.fields.frame_in') }}
                  </td>
                  <td>{{ currentShot.data.frame_in }}</td>
                </tr>
                <tr class="datatable-row" v-if="currentShot.data?.frame_out">
                  <td class="field-label">
                    {{ $t('shots.fields.frame_out') }}
                  </td>
                  <td>{{ currentShot.data.frame_out }}</td>
                </tr>
                <tr class="datatable-row" v-if="currentShot.data?.fps">
                  <td class="field-label">{{ $t('shots.fields.fps') }}</td>
                  <td>{{ currentShot.data.fps }}</td>
                </tr>
                <tr class="datatable-row" v-if="currentShot.data?.resolution">
                  <td class="field-label">
                    {{ $t('shots.fields.resolution') }}
                  </td>
                  <td>{{ currentShot.data.resolution }}</td>
                </tr>
                <tr class="datatable-row" v-if="currentShot.data?.max_retakes">
                  <td class="field-label">
                    {{ $t('shots.fields.max_retakes') }}
                  </td>
                  <td>{{ currentShot.data.max_retakes }}</td>
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in shotMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    <metadata-value
                      :descriptor="descriptor"
                      :entity="currentShot"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentShot"
          :name="currentShot?.full_name"
          v-if="currentSection === 'chat'"
        />

        <div class="entity-casting" v-show="currentSection === 'casting'">
          <template v-if="currentShot">
            <div v-if="currentShot.castingAssetsByType?.[0]?.length > 0">
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
                v-for="typeAssets in currentShot.castingAssetsByType"
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
                      <button-simple
                        class="remove-button"
                        icon="remove"
                        :title="$t('breakdown.remove_from_casting')"
                        @click.prevent.stop="
                          uncastAsset(currentShot.id, asset.asset_id)
                        "
                        v-if="isCurrentUserManager"
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
                      <div
                        class="ready-for flexrow"
                        v-if="!asset.shared && asset.ready_for"
                      >
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
                  :can-remove="isCurrentUserManager"
                  @remove="asset => uncastAsset(currentShot.id, asset.asset_id)"
                  v-else
                />
              </div>
            </div>
            <empty-section
              :icon="BoxIcon"
              :text="$t('shots.no_casting')"
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
          :entity="currentShot"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentShot"
          v-if="currentSection === 'time-logs'"
        />

        <entity-working-files
          :entity="currentShot"
          v-if="currentSection === 'working-files'"
        />

        <entity-output-files
          :entity="currentShot"
          v-if="currentSection === 'output-files'"
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
      <task-info :task="currentTask" entity-type="Shot" with-actions>
        <entity-news class="news-column" :entity="currentShot" />
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

    <edit-shot-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-deleted="errors.editDeleted"
      :shot-to-edit="currentShot"
      @cancel="modals.edit = false"
      @confirm="confirmEditShot"
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
import { episodifyRoute } from '@/lib/path'
import shotStore from '@/store/modules/shots'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import PanelLayout from '@/components/layouts/PanelLayout.vue'
import CastingList from '@/components/lists/CastingList.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityLoadError from '@/components/pages/entities/EntityLoadError.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import EntityWorkingFiles from '@/components/pages/entities/EntityWorkingFiles.vue'
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

defineOptions({ name: 'shot' })

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()
const clientAccess = computed(() => store.getters.clientAccess)

// State
// --------------------------------------------------------------------------
const castingView = useCastingView()
const currentShot = ref(null)
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
const shotMetadataDescriptors = computed(
  () => store.getters.shotMetadataDescriptors
)
const shotSearchText = computed(() => store.getters.shotSearchText)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// The list of the page, once loaded: a load replaces the cached array out of
// sight of Vue, and its scope and loading flag have it read again.
const entityList = computed(() =>
  isListOfPageLoaded(store.getters, 'shot') ? shotStore.cache.shots : []
)

const title = computed(() => {
  if (!currentShot.value) return loadTitle.value
  const { episode_name, sequence_name, name } = currentShot.value
  const path = `${sequence_name} / ${name}`
  return episode_name ? `${episode_name} / ${path}` : path
})

const castAssets = computed(() =>
  (currentShot.value?.castingAssetsByType || []).flat()
)
const nbAssets = computed(() => castAssets.value.length)

const shotsPath = computed(() => {
  const path = {
    name: 'shots',
    params: { production_id: currentProduction.value.id },
    query: { search: shotSearchText.value }
  }
  if (currentEpisode.value) {
    path.name = 'episode-shots'
    path.params.episode_id = currentEpisode.value.id
  }
  return path
})

const shotTabs = computed(() => [
  // the section of the tasks keeps its name: links and the default use it
  { label: t('main.tasks'), name: 'infos' },
  { label: t('main.label.info'), name: 'information' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.casting'), name: 'casting' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.timelog'), name: 'time-logs' },
  { label: t('main.label.preview_files'), name: 'preview-files' },
  { label: t('main.label.working_files'), name: 'working-files' },
  { label: t('main.label.output_files'), name: 'output-files' }
])

// the task panel belongs to the section of the tasks
const hasSidePanel = computed(
  () =>
    clientAccess.value.isTaskPanelVisible && currentSection.value === 'infos'
)
const isDrawerOpen = computed(() => Boolean(currentTask.value))

// Functions
// --------------------------------------------------------------------------
const getCurrentShot = async () => {
  const shotId = route.params.shot_id
  if (!shotId) return null
  let shot = shotStore.cache.shotMap.get(shotId) || null
  if (!shot) {
    await store.dispatch('loadShot', shotId)
    shot = shotStore.cache.shotMap.get(shotId) || null
  }
  return shot
}

const uncastAsset = async (entityId, assetId) => {
  await store.dispatch('uncastAsset', { entityId, assetId })
  await loadCastingData()
}

const loadCastingData = async () => {
  casting.isLoading = true
  casting.isError = false
  try {
    await store.dispatch('loadShotCasting', currentShot.value)
  } catch (err) {
    casting.isError = true
    console.error(err)
  }
  casting.isLoading = false
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

const assetPath = asset => {
  const episodeId = asset.episode_id || (isTVShow.value ? 'main' : null)
  return episodifyRoute(
    {
      name: 'asset',
      params: {
        production_id: currentProduction.value.id,
        asset_id: asset.asset_id
      },
      query: { section: 'casting' }
    },
    episodeId
  )
}

// Close leaves the error of the last save: opening drops it.
const showEditModal = () => {
  errors.edit = false
  modals.edit = true
}

// the modal edits the shot data fields as flat form fields
const confirmEditShot = async form => {
  const data = {
    ...form,
    id: currentShot.value.id,
    data: {
      ...form.data,
      resolution: form.resolution,
      max_retakes: form.max_retakes,
      frame_in: form.frameIn,
      frame_out: form.frameOut,
      fps: form.fps
    }
  }
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editShot', data)
    // The store writes the changes into its cached shot out of sight of Vue: a
    // copy shows them, unless the page moved on to another shot. Not after a
    // refusal: the modal, open on the error, would reset what was typed.
    const shot = shotStore.cache.shotMap.get(data.id)
    if (shot && currentShot.value?.id === data.id) {
      // The casting loads onto the shot shown, not onto the cached one.
      const { casting, castingAssetsByType } = currentShot.value
      currentShot.value = { ...shot, casting, castingAssetsByType }
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
  type: 'shot',
  currentEntity: currentShot,
  entityList,
  readEntity: getCurrentShot,
  scheduleWidget,
  onEntityRead: (shot, isListRead) => {
    loadCastingData()
    if (!isListRead) setTimeout(scrollScheduleToStart, 100)
  },
  loadList: () => store.dispatch('loadShots')
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
