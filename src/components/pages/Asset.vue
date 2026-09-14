<template>
  <div class="columns fixed-page asset xyz-in" xyz="fade">
    <div class="page column main-column">
      <div class="page-header flexrow">
        <router-link
          class="flexrow-item has-text-centered back-link ml1"
          :to="assetsPath"
        >
          <corner-left-up-icon />
        </router-link>
        <span class="flexrow-item ml2">
          <entity-thumbnail
            class="entity-thumbnail"
            :entity="currentAsset"
            :empty-width="100"
            :empty-height="60"
            :width="100"
            v-if="currentAsset"
          />
        </span>
        <div class="entity-title flexrow-item">
          {{ title }}
        </div>
        <div class="filler"></div>
        <div
          class="ready-for flexrow block mr0 flexrow-item mt1 mb0"
          v-if="
            currentAsset &&
            currentAsset.ready_for &&
            currentAsset.ready_for !== 'None'
          "
        >
          <span class="flexrow-item">
            {{ $t('assets.fields.ready_for') }}
          </span>
          <task-type-name
            class="flexrow-item"
            :task-type="taskTypeMap.get(currentAsset.ready_for)"
            :current-production-id="currentProduction.id"
          />
        </div>
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

      <div class="asset-data block">
        <route-section-tabs
          class="section-tabs"
          :active-tab="currentSection"
          :route="$route"
          :tabs="assetTabs"
        />

        <div class="flexrow mt1">
          <span
            class="tag tag-standby"
            v-if="
              currentSection === 'casting' && currentAsset?.is_casting_standby
            "
          >
            {{ $t('breakdown.fields.standby') }}
          </span>
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
            :entries="localTasks"
            :is-loading="!currentAsset"
            :selected-task-id="currentTask?.id"
            :is-error="false"
            @task-selected="onTaskSelected"
          />
          <div class="flexrow">
            <page-subtitle :text="$t('main.info')" />
            <div class="filler"></div>
            <div class="flexrow-item has-text-right">
              <button-simple
                icon="edit"
                :title="$t('assets.edit_title')"
                @click="modals.edit = true"
                v-if="isCurrentUserManager"
              />
            </div>
          </div>

          <div class="table-body metadata-infos">
            <table class="datatable no-header" v-if="currentAsset">
              <tbody class="table-body">
                <tr class="datatable-row">
                  <td class="field-label">
                    {{ $t('assets.fields.description') }}
                  </td>
                  <description-cell :entry="currentAsset" :full="true" />
                </tr>
                <tr
                  :key="descriptor.id"
                  class="datatable-row"
                  v-for="descriptor in assetMetadataDescriptors"
                >
                  <td class="field-label">{{ descriptor.name }}</td>
                  <td>
                    <metadata-value
                      :descriptor="descriptor"
                      :entity="currentAsset"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <entity-chat
          :entity="currentAsset"
          :name="currentAsset?.full_name"
          v-if="currentSection === 'chat'"
        />

        <div class="asset-casted-in" v-show="currentSection === 'casting'">
          <template v-if="currentAsset">
            <div v-if="currentAsset.castInShotsBySequence?.[0]?.length > 0">
              <div class="casting-title flexrow">
                <page-subtitle
                  class="flexrow-item"
                  :text="
                    $t('assets.casted_in_shots', { nbShots: nbShotsCastedIn })
                  "
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
                  @click="viewPlaylist(castInShots, 'shot')"
                />
              </div>
              <template
                v-if="
                  currentAsset.castInShotsBySequence?.[0]?.[0]?.sequence_name
                "
              >
                <div
                  class="casting-group"
                  :key="sequenceShots[0]?.sequence_name"
                  v-for="sequenceShots in currentAsset.castInShotsBySequence ||
                  []"
                >
                  <div class="casting-group-header flexrow">
                    <span class="flexrow-item group-name">
                      {{ sequenceShots[0]?.sequence_name }}
                    </span>
                    <span class="flexrow-item tag">
                      {{ sequenceShots.length }}
                    </span>
                    <div class="filler"></div>
                    <button-simple
                      class="flexrow-item"
                      icon="film"
                      :title="$t('playlists.view_as_playlist')"
                      @click="viewPlaylist(sequenceShots, 'shot')"
                    />
                  </div>
                  <div class="casting-grid" v-if="castingView === 'cards'">
                    <router-link
                      class="casting-card"
                      :key="shot.shot_id"
                      :to="shotPath(shot)"
                      v-for="shot in sequenceShots"
                    >
                      <div class="card-preview">
                        <entity-preview
                          cover
                          is-rounded-top-border
                          :entity="shot"
                          :empty-width="200"
                          :empty-height="112"
                          :show-movie="false"
                        />
                        <button-simple
                          class="remove-button"
                          icon="remove"
                          :title="$t('breakdown.remove_from_casting')"
                          @click.prevent.stop="
                            uncastAsset(shot.shot_id, currentAsset.id)
                          "
                          v-if="isCurrentUserManager"
                        />
                        <span
                          class="nb-occurences"
                          v-if="shot.nb_occurences > 1"
                        >
                          {{ shot.nb_occurences }}
                        </span>
                      </div>
                      <div class="card-description">
                        <div class="card-name flexrow">
                          <span class="flexrow-item filler break-word">
                            {{ shot.shot_name }}
                          </span>
                          <span
                            class="asset-label flexrow-item"
                            :label="shot.label"
                          >
                            {{ shot.label || $t('breakdown.options.animate') }}
                          </span>
                        </div>
                      </div>
                    </router-link>
                  </div>
                  <casting-list
                    entity-type="shot"
                    :entries="sequenceShots"
                    :entity-path="shotPath"
                    :can-remove="isCurrentUserManager"
                    @remove="shot => uncastAsset(shot.shot_id, currentAsset.id)"
                    v-else
                  />
                </div>
              </template>
            </div>
            <empty-section
              :icon="ClapperboardIcon"
              :text="$t('assets.no_cast_in')"
              v-else-if="currentAsset.castingAssetsByType?.[0]?.length === 0"
            />
          </template>
          <table-info
            :is-loading="castIn.isLoading"
            :is-error="castIn.isError"
            v-else
          />

          <div
            v-if="
              currentAsset && currentAsset.castingAssetsByType?.[0]?.length > 0
            "
          >
            <div class="casting-title flexrow">
              <page-subtitle class="flexrow-item" :text="$t('assets.linked')" />
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
                @click="viewPlaylist(linkedAssets, 'asset')"
              />
            </div>
            <div
              class="casting-group"
              :key="typeAssets[0]?.asset_type_name"
              v-for="typeAssets in currentAsset.castingAssetsByType"
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
                  @click="viewPlaylist(typeAssets, 'asset')"
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
                        uncastAsset(currentAsset.id, asset.asset_id)
                      "
                      v-if="isCurrentUserManager"
                    />
                    <span class="nb-occurences" v-if="asset.nb_occurences > 1">
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
                  </div>
                </router-link>
              </div>
              <casting-list
                entity-type="asset"
                :entries="typeAssets"
                :entity-path="assetPath"
                :can-remove="isCurrentUserManager"
                @remove="asset => uncastAsset(currentAsset.id, asset.asset_id)"
                v-else
              />
            </div>
          </div>
        </div>

        <div
          class="concepts"
          v-show="currentSection === 'concepts'"
          v-if="currentAsset"
        >
          <combobox-status
            :label="$t('main.status')"
            :task-status-list="taskStatusList"
            v-model="currentConceptStatus"
            v-if="linkedConcepts.length"
          />
          <div class="concept-list mt1" v-if="filteredLinkedConcepts.length">
            <concept-card
              class="concept"
              :class="{ selected: currentConcept?.id === concept.id }"
              :key="'concept-' + concept.id"
              :concept="concept"
              @click="selectConcept(concept)"
              v-for="concept in filteredLinkedConcepts"
            />
          </div>
          <empty-section
            :icon="ImageIcon"
            :text="$t('assets.no_concept')"
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
          :entity="currentAsset"
          v-if="currentSection === 'preview-files'"
        />

        <entity-time-logs
          :entity="currentAsset"
          v-if="currentSection === 'time-logs'"
        />

        <entity-output-files
          :entity="currentAsset"
          v-if="currentSection === 'output-files'"
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
      <task-info :task="currentTask" entity-type="Asset" with-actions>
        <entity-news class="news-column" :entity="currentAsset" />
      </task-info>
    </div>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isConceptDrawerOpen }"
      @click="closeConcept"
      v-show="currentSection === 'concepts'"
    ></div>
    <div
      class="column side-column"
      :class="{ 'is-open': isConceptDrawerOpen }"
      v-show="currentSection === 'concepts'"
    >
      <button
        class="drawer-close"
        type="button"
        :title="$t('main.close')"
        @click="closeConcept"
      >
        <x-icon :size="20" />
      </button>
      <task-info entity-type="Concept" :task="currentConceptTask" />
    </div>

    <view-playlist-modal
      active
      :entity-ids="playlist.entityIds"
      :entity-type="playlist.entityType"
      @cancel="playlist = null"
      v-if="playlist"
    />

    <edit-asset-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :asset-to-edit="currentAsset"
      @cancel="modals.edit = false"
      @confirm="confirmEditAsset"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClapperboardIcon,
  CornerLeftUpIcon,
  ImageIcon,
  XIcon
} from 'lucide-vue-next'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { useCastingView } from '@/composables/castingView'
import { useEntity } from '@/composables/entity'
import { sortByName } from '@/lib/sorting'
import assetStore from '@/store/modules/assets'

/* eslint-disable no-unused-vars */
import DescriptionCell from '@/components/cells/DescriptionCell.vue'
import CastingList from '@/components/lists/CastingList.vue'
import EntityTaskList from '@/components/lists/EntityTaskList.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import ViewPlaylistModal from '@/components/modals/ViewPlaylistModal.vue'
import EntityChat from '@/components/pages/entities/EntityChat.vue'
import EntityNews from '@/components/pages/entities/EntityNews.vue'
import EntityOutputFiles from '@/components/pages/entities/EntityOutputFiles.vue'
import EntityPreviewFiles from '@/components/pages/entities/EntityPreviewFiles.vue'
import EntityTimeLogs from '@/components/pages/entities/EntityTimeLogs.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxNumber from '@/components/widgets/ComboboxNumber.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ConceptCard from '@/components/widgets/ConceptCard.vue'
import EmptySection from '@/components/widgets/EmptySection.vue'
import EntityPreview from '@/components/widgets/EntityPreview.vue'
import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import MetadataValue from '@/components/widgets/MetadataValue.vue'
import PageSubtitle from '@/components/widgets/PageSubtitle.vue'
import RouteSectionTabs from '@/components/widgets/RouteSectionTabs.vue'
import Schedule from '@/components/widgets/Schedule.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
/* eslint-enable no-unused-vars */

defineOptions({ name: 'asset' })

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State
// --------------------------------------------------------------------------
const castingView = useCastingView()
const currentAsset = ref(null)
const currentConcept = ref(null)
const currentConceptStatus = ref(null)
const currentConceptTask = ref(null)
const localTasks = ref([])
const playlist = ref(null)
const scheduleWidget = ref(null)
const castIn = reactive({ isLoading: false, isError: false })
const errors = reactive({ edit: false })
const loading = reactive({ edit: false })
const modals = reactive({ edit: false })

// Computed
// --------------------------------------------------------------------------
const assetMetadataDescriptors = computed(
  () => store.getters.assetMetadataDescriptors
)
const assetSearchText = computed(() => store.getters.assetSearchText)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const linkedConcepts = computed(() => store.getters.linkedConcepts)
const taskMap = computed(() => store.getters.taskMap)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const entityList = computed(() => assetStore.cache.assets)

const title = computed(() =>
  currentAsset.value
    ? `${currentAsset.value.asset_type_name} / ${currentAsset.value.name}`
    : t('main.loading')
)

const castInShots = computed(() =>
  (currentAsset.value?.castInShotsBySequence || []).flat()
)
const nbShotsCastedIn = computed(() => castInShots.value.length)

const linkedAssets = computed(() =>
  (currentAsset.value?.castingAssetsByType || []).flat()
)

const assetsPath = computed(() => {
  const path = {
    name: 'assets',
    params: { production_id: currentProduction.value.id },
    query: { search: assetSearchText.value || '' }
  }
  if (currentEpisode.value) {
    path.name = 'episode-assets'
    path.params.episode_id = currentEpisode.value.id
  }
  return path
})

const assetTabs = computed(() => [
  { label: t('main.label.info'), name: 'infos' },
  { label: t('main.label.chat'), name: 'chat' },
  { label: t('main.label.concepts'), name: 'concepts' },
  { label: t('main.label.casting'), name: 'casting' },
  { label: t('main.label.schedule'), name: 'schedule' },
  { label: t('main.label.preview_files'), name: 'preview-files' },
  { label: t('main.label.timelog'), name: 'time-logs' },
  { label: t('main.label.output_files'), name: 'output-files' }
])

const taskStatusList = computed(() => {
  const allStatusItem = {
    id: null,
    color: '#999',
    name: t('main.all'),
    short_name: t('main.all')
  }
  const conceptTaskStatusList = sortByName(
    Array.from(taskStatusMap.value.values()).filter(
      status => status.for_concept
    )
  )
  return [allStatusItem, ...conceptTaskStatusList]
})

const isConceptDrawerOpen = computed(() => Boolean(currentConcept.value))
const isTaskDrawerOpen = computed(() => Boolean(currentTask.value))

const filteredLinkedConcepts = computed(() =>
  currentConceptStatus.value
    ? linkedConcepts.value.filter(
        concept =>
          concept.tasks[0].task_status_id === currentConceptStatus.value
      )
    : linkedConcepts.value
)

// Functions
// --------------------------------------------------------------------------
const getCurrentAsset = async () => {
  const assetId = route.params.asset_id
  if (!assetId) return null
  let asset = assetStore.cache.assetMap.get(assetId) || null
  if (!asset) {
    await store.dispatch('loadAsset', assetId)
    asset = assetStore.cache.assetMap.get(assetId)
    if (!asset) return null
  }
  localTasks.value = asset.tasks
    .map(taskId => taskMap.value.get(taskId))
    .filter(Boolean)
  return asset
}

const uncastAsset = async (entityId, assetId) => {
  await store.dispatch('uncastAsset', { entityId, assetId })
  await loadCastingData()
}

const loadCastingData = async () => {
  castIn.isLoading = true
  castIn.isError = false
  try {
    await store.dispatch('loadAssetCastIn', currentAsset.value)
    await store.dispatch('loadAssetCasting', currentAsset.value)
    castIn.isLoading = false
    await store.dispatch('loadLinkedConcepts', currentAsset.value)
  } catch (err) {
    castIn.isLoading = false
    castIn.isError = true
    console.error(err)
  }
}

const scrollScheduleToStart = () => {
  scheduleWidget.value?.scrollToDate(scheduleItems.value[0].startDate)
}

const resetData = async () => {
  castIn.isLoading = true
  if (route.params.episode_id === 'main') {
    store.dispatch('setCurrentEpisode', 'main')
  }
  // Next tick is needed to wait for the episode change.
  await nextTick()
  currentAsset.value = await getCurrentAsset()
  await loadCastingData()
}

const init = async () => {
  try {
    const assetId = route.params.asset_id
    const asset = await getCurrentAsset()
    // Another asset opened during the load: its own init shows it.
    if (route.params.asset_id !== assetId) return
    currentAsset.value = asset
    currentSection.value = route.query.section || 'infos'
    if (currentAsset.value) {
      loadCastingData()
    } else {
      resetData()
    }
    setTimeout(scrollScheduleToStart, 100)
  } catch (err) {
    console.error(err)
  }
}

const assetPath = asset => ({
  name: 'asset',
  params: {
    production_id: currentProduction.value.id,
    asset_id: asset.asset_id
  },
  query: { section: 'casting' }
})

const shotPath = shot => ({
  name: shot.episode_id ? 'episode-shot' : 'shot',
  params: {
    production_id: currentProduction.value.id,
    shot_id: shot.shot_id,
    episode_id: shot.episode_id ? shot.episode_id : undefined
  },
  query: { section: 'casting' }
})

const confirmEditAsset = async form => {
  const data = { ...form, id: currentAsset.value.id }
  loading.edit = true
  errors.edit = false
  const request = store.dispatch('editAsset', data)
  // editAsset commits optimistically, so the cache already holds the new values.
  currentAsset.value = { ...assetStore.cache.assetMap.get(data.id) }
  try {
    await request
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

// the cast-in shots and the linked assets carry their id under their type
const viewPlaylist = (entities, entityType) => {
  playlist.value = {
    entityType,
    entityIds: entities.map(entity => entity[`${entityType}_id`])
  }
}

const closeConcept = () => {
  store.dispatch('clearSelectedConcepts')
  currentConcept.value = null
  currentConceptTask.value = null
}

const selectConcept = concept => {
  if (currentConcept.value?.id === concept.id) {
    closeConcept()
  } else {
    store.dispatch('clearSelectedConcepts')
    store.dispatch('addSelectedConcepts', new Map([[concept.id, concept]]))
    currentConcept.value = concept
    currentConceptTask.value = concept.tasks[0]
  }
}

const {
  currentSection,
  currentTask,
  zoomLevel,
  zoomOptions,
  scheduleItems,
  previousEntityPath,
  nextEntityPath,
  tasksStartDate,
  tasksEndDate,
  onTaskSelected,
  saveTaskScheduleItem
} = useEntity({ type: 'asset', currentEntity: currentAsset, entityList, init })

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

.ready-for {
  margin-top: 0em;
  margin-bottom: 0em;
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

.asset-data {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 1em 0 1em;
  max-height: 100%;
  overflow: hidden;
}

.asset-casted-in,
.concepts {
  overflow-y: auto;
}

.concepts {
  flex: 1;
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

.concept-list {
  color: var(--text);
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 1em;
  gap: 10px;
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
  width: 120px;
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
  // The main column is the scroller, not the page: a scrolling ancestor
  // would count the off-screen drawers in its scroll range, and focusing
  // their content on open would shift the whole page sideways.
  .asset {
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

  .ready-for {
    display: none;
  }

  .asset-data {
    margin: 0 0.5em;
    max-height: none;
    overflow: visible;
  }

  .infos,
  .asset-casted-in,
  .concepts,
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

    // The schedule widget keeps a 180px entity column on mobile: give the
    // timeline room.
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

.concept {
  border: 5px solid transparent;
  cursor: pointer;
  transition: border 0.2s linear;
  &:hover {
    border: 5px solid var(--background-selectable);
  }
}

.selected {
  border: 5px solid var(--background-selected);
}

.drawer-close,
.drawer-backdrop {
  display: none;
}

// Under 1024px the side panels slide in from the right over the page, like
// the news feed drawer. The backdrop catches outside taps to close.
@media (max-width: 1024px) {
  // The xyz-in entry animation fills forward and leaves an identity
  // transform on the page, which would turn it into the containing block
  // and stacking context of the fixed drawers below.
  .asset {
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
    // TaskInfo writes its resizable panel width inline on the side column.
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

  .drawer-close {
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text);
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 36px;
    justify-content: center;
    padding: 6px;
    position: absolute;
    right: 12px;
    top: 8px;
    width: 36px;
    z-index: 2;

    &:hover {
      background: var(--background-hover);
      border-color: var(--border-strong);
      color: var(--text-strong);
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
