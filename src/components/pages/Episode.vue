<template>
  <div class="columns fixed-page episode xyz-in" xyz="fade">
    <div class="page column main-column">
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :to="episodesPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentEpisode"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentEpisode"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :to="previousEntityPath"
          v-if="previousEntityPath && entityList.length > 1"
        >
          <chevron-left-icon />
        </router-link>
        <router-link
          class="flexrow-item has-text-centered back-link"
          :to="nextEntityPath"
          v-if="nextEntityPath && entityList.length > 1"
        >
          <chevron-right-icon />
        </router-link>
      </div>

      <div class="episode-data block">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="episodeTabs"
        />

        <div class="flexrow mt1">
          <template v-if="currentSection === 'casting'">
            <span
              class="tag tag-standby"
              v-if="currentEpisode?.is_casting_standby"
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
          <page-subtitle :text="$t('main.tasks')" />
          <entity-task-list
            class="task-list"
            :entries="currentTasks"
            :is-loading="!currentEpisode"
            :is-error="false"
            :selected-task-id="currentTask?.id"
            @task-selected="onTaskSelected"
          />
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                :title="$t('episodes.edit_title')"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>

          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentEpisode">
              <tbody class="datatable-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('shots.fields.description') }}
                  </td>
                  <description-cell :entry="currentEpisode" :full="true" />
                </tr>
                <tr
                  class="datatable-row"
                  v-if="currentEpisode.data?.resolution"
                >
                  <td class="field-label">
                    {{ $t('shots.fields.resolution') }}
                  </td>
                  <td>{{ currentEpisode.data.resolution }}</td>
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in episodeMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    <metadata-value
                      :descriptor="descriptor"
                      :entity="currentEpisode"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentEpisode"
          :name="currentEpisode?.name"
          v-if="currentSection === 'chat'"
        />

        <div class="episode-casting" v-show="currentSection === 'casting'">
          <template v-if="currentEpisode">
            <div v-if="currentEpisode.castingAssetsByType?.[0]?.length > 0">
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
                v-for="typeAssets in currentEpisode.castingAssetsByType"
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
                          uncastAsset(currentEpisode.id, asset.asset_id)
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
                      <div class="ready-for flexrow" v-if="asset.ready_for">
                        <span class="flexrow-item filler">
                          {{ $t('assets.fields.ready_for') }}
                        </span>
                        <task-type-name
                          class="flexrow-item"
                          :task-type="taskTypeMap.get(asset.ready_for)"
                          :current-production-id="currentProduction.id"
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
                  @remove="
                    asset => uncastAsset(currentEpisode.id, asset.asset_id)
                  "
                  v-else
                />
              </div>
            </div>
            <empty-section
              :icon="BoxIcon"
              :text="$t('episodes.no_casting')"
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
          :entity="currentEpisode"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentEpisode"
          v-if="currentSection === 'time-logs'"
        />
      </div>
    </div>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isTaskDrawerOpen }"
      @click="closeTask"
      v-show="currentSection === 'infos'"
    ></div>
    <div
      class="column side-column"
      :class="{ 'is-open': isTaskDrawerOpen }"
      v-show="currentSection === 'infos'"
    >
      <task-info :task="currentTask" entity-type="Episode" with-actions>
        <entity-news class="news-column" :entity="currentEpisode" />
      </task-info>
    </div>

    <view-playlist-modal
      active
      entity-type="asset"
      :entity-ids="playlistEntityIds"
      @cancel="playlistEntityIds = null"
      v-if="playlistEntityIds"
    />

    <edit-episode-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :episode-to-edit="currentEpisode"
      @cancel="modals.edit = false"
      @confirm="confirmEditEpisode"
    />
  </div>
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
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useCastingView } from '@/composables/castingView'
import { useEntity } from '@/composables/entity'
import { episodifyRoute } from '@/lib/path'
import episodeStore from '@/store/modules/episodes'

import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import CastingList from '@/components/lists/CastingList.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

defineOptions({ name: 'episode' })

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------
const castingView = useCastingView()
// the displayed episode, distinct from the store's currentEpisode filter
const currentEpisode = ref(null)
const playlistEntityIds = ref(null)
const scheduleWidget = ref(null)
const casting = reactive({ isLoading: false, isError: false })
const errors = reactive({ edit: false })
const loading = reactive({ edit: false })
const modals = reactive({ edit: false })

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const episodeMetadataDescriptors = computed(
  () => store.getters.episodeMetadataDescriptors
)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const entityList = computed(() => episodeStore.cache.episodes)

const title = computed(() => currentEpisode.value?.name || t('main.loading'))

const castAssets = computed(() =>
  (currentEpisode.value?.castingAssetsByType || []).flat()
)
const nbAssets = computed(() => castAssets.value.length)

const episodesPath = computed(() => ({
  name: 'episodes',
  params: { production_id: currentProduction.value.id },
  query: { search: episodeSearchText.value }
}))

const episodeTabs = computed(() => [
  { label: t('main.label.info'), name: 'infos' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.casting'), name: 'casting' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.preview_files'), name: 'preview-files' },
  { label: t('main.label.timelog'), name: 'time-logs' }
])

const isTaskDrawerOpen = computed(() => Boolean(currentTask.value))

// Functions
// --------------------------------------------------------------------------
// the episode list only carries the tasks once loaded with them
const getCurrentEpisode = async () => {
  const episodeId = route.params.episode_id
  let episode = episodeStore.cache.episodeMap.get(episodeId) || null
  if (!episode?.validations) {
    await store.dispatch('loadEpisodesWithTasks')
    episode = episodeStore.cache.episodeMap.get(episodeId) || null
  }
  return episode
}

const uncastAsset = async (entityId, assetId) => {
  await store.dispatch('uncastAsset', { entityId, assetId })
  await loadCastingData()
}

const loadCastingData = async () => {
  casting.isLoading = true
  casting.isError = false
  try {
    await store.dispatch('loadEpisodeCasting', currentEpisode.value)
  } catch (err) {
    casting.isError = true
    console.error(err)
  }
  casting.isLoading = false
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

const resetData = async () => {
  casting.isLoading = true
  await nextTick()
  currentEpisode.value = await getCurrentEpisode()
  await loadCastingData()
}

const init = async () => {
  try {
    const episodeId = route.params.episode_id
    const episode = await getCurrentEpisode()
    // Another episode opened during the load: its own init shows it.
    if (route.params.episode_id !== episodeId) return
    currentEpisode.value = episode
    currentSection.value = route.query.section || 'infos'
    if (currentEpisode.value) {
      loadCastingData()
    } else {
      resetData()
    }
    setTimeout(scrollScheduleToStart, 100)
  } catch (err) {
    console.error(err)
  }
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
    currentEpisode.value.id
  )

const confirmEditEpisode = async form => {
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editEpisode', {
      ...form,
      id: currentEpisode.value.id
    })
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
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
  saveTaskScheduleItem
} = useEntity({
  type: 'episode',
  currentEntity: currentEpisode,
  entityList,
  init
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
.dark {
  .table-body {
    border: 1px solid var(--border);
  }

  .wrapper {
    background: var(--background);
  }
}

.main-column {
  display: flex;
  flex-direction: column;
  background: var(--background-page);
  padding-bottom: 1em;
}

h2.subtitle {
  border-bottom: 0;
  margin-top: 0;
  margin-bottom: 0.5em;
  font-size: 1.5em;
}

.page-header {
  align-items: center;
  margin-top: calc(50px + 2em);
  margin-bottom: 0.8em;
  margin-left: 1em;
  margin-right: 1em;

  .entity-title {
    font-weight: 500;
  }
}

.episode-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.episode-casting {
  overflow-y: auto;
}

.casting-title {
  margin-top: 1em;
  margin-bottom: 1em;
}

.casting-group {
  margin-bottom: 2em;
}

.casting-group-header {
  border-bottom: 1px solid var(--border);
  margin-bottom: 1em;
  padding-bottom: 0.3em;

  .group-name {
    color: var(--text);
    font-size: 1.3em;
    font-weight: 500;
  }

  .tag {
    background: var(--background-tag);
    color: var(--text);
  }
}

.casting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 20px;
}

.casting-card {
  background: var(--background);
  border-radius: 1em;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--text-strong);
  display: flex;
  flex-direction: column;
  position: relative;

  .dark & {
    background: var(--background-alt);
  }

  &.shared {
    box-shadow: 0 0 3px 2px var(--shared-color);
  }

  .ready-for .no-link {
    cursor: inherit;
  }

  &:hover {
    background: var(--background-hover);
  }

  .card-preview {
    position: relative;
  }

  .nb-occurences {
    background: rgba(160, 160, 180, 0.8);
    border-radius: 2px;
    bottom: 4px;
    color: white;
    font-size: 0.8em;
    padding: 2px 4px;
    position: absolute;
    right: 4px;
  }

  .card-description {
    padding: 0.5em 1em;
  }

  .card-name {
    font-weight: bold;
  }

  .asset-label {
    background: $dark-green;
    border-radius: 4px;
    color: $white;
    font-size: 0.7em;
    font-weight: 500;
    padding: 2px 6px;

    &[label='fixed'] {
      background: $orange-carrot;
    }
  }

  .ready-for {
    color: var(--text-alt);
    font-size: 0.9em;
    font-weight: normal;
    margin-top: 0.4em;
  }

  .remove-button {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: $white;
    opacity: 0;
    transition:
      opacity 0.15s,
      background 0.15s;

    :deep(.icon) {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $red;
      color: $white;
    }
  }

  &:hover .remove-button,
  .remove-button:focus-visible {
    opacity: 1;
  }
}

.field-label {
  font-weight: bold;
  width: 140px;
}

.back-link {
  padding-top: 3px;
}

.task-list {
  flex: 1;
  margin-bottom: 3em;
  min-height: 150px;
  min-width: 100%;
  overflow: hidden;
}

.datatable-row {
  user-select: text;
}

.schedule {
  position: relative;
  height: 100%;
  overflow: hidden;

  .wrapper {
    height: 100%;
    border-radius: 10px;
  }
}

.entity-thumbnail {
  margin-bottom: 0;
  border-radius: 10px;
}

@media screen and (max-width: 768px) {
  .episode {
    overflow: visible;
  }

  .main-column {
    flex: 1;
    margin: 0;
    max-width: 100%;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
  }

  .column:first-child {
    margin-right: 0;
  }

  .page-header {
    margin: calc(60px + 1em) 0.5em 0.5em;
  }

  .entity-title {
    font-size: 1.3em;
    line-height: 1.5em;
  }

  .episode-data {
    margin: 0 0.5em;
    max-height: none;
    overflow: visible;
  }

  .infos,
  .episode-casting,
  .schedule {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .infos .button {
    display: none;
  }

  .task-list {
    min-height: 0;
    overflow: visible;
  }

  .schedule {
    height: 60vh;
    overflow-x: auto;

    .wrapper {
      min-width: 520px;
    }
  }

  .news-column {
    max-height: none;
  }
}

.tag-standby {
  background: $red;
  color: $white;
  margin-left: 1em;
  cursor: default;
  text-transform: uppercase;
}

.dark .tag-standby {
  background: $dark-red;
}

.section-tabs {
  min-height: 36px;
  margin-bottom: 0;
}

.infos {
  height: 100%;
  margin-top: 1em;
  margin-bottom: 1em;
  max-height: 100%;
  overflow-y: auto;

  .metadata-infos {
    flex: unset;
    min-height: 100px;
    overflow: auto;
  }
}

.news-column {
  max-height: 85%;
}

.drawer-backdrop {
  display: none;
}

@media (max-width: 1024px) {
  .episode {
    animation-fill-mode: none;
  }

  .side-column {
    background: var(--background);
    bottom: 0;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    margin-top: 0 !important;
    max-width: min(100vw, 420px) !important;
    min-width: 0 !important;
    overflow-y: auto;
    position: fixed;
    right: 0;
    top: 60px;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    width: min(100vw, 420px) !important;
    z-index: 250;

    &.is-open {
      transform: translateX(0);
    }
  }

  .drawer-backdrop {
    background: rgba(0, 0, 0, 0.4);
    display: block;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    transition: opacity 0.25s ease;
    z-index: 249;

    &.is-open {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
