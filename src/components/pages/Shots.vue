<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="shots page">
        <div class="shot-list-header page-header">
          <div class="flexrow mb1">
            <search-field
              ref="shot-search-field"
              :can-save="true"
              @change="onSearchTyped"
              @enter="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 s01 anim=wip"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('entities.build_filter.title')"
              icon="filter"
              @click="() => (modals.isBuildFilterDisplayed = true)"
            />
            <info-question-mark
              class="flexrow-item mt05"
              :text="currentEpisode.description"
              v-if="currentEpisode && currentEpisode.description"
            />
            <div class="filler"></div>
            <div class="flexrow flexrow-item">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Shot')"
                :display-all-and-my-departments="true"
                rounded
                v-model="selectedDepartment"
                v-if="departments.length > 0 && !isCurrentUserClient"
              />
              <combobox-display-options
                class="flexrow-item"
                :type="type"
                v-model="displaySettings"
              />
            </div>
            <div class="flexrow" v-if="isCurrentUserManager">
              <button-simple
                class="flexrow-item"
                :title="$t('entities.thumbnails.title')"
                icon="import-files"
                @click="showAddThumbnailsModal"
              />
              <button-simple
                class="flexrow-item"
                icon="file-digit"
                :title="$t('shots.get_frames_from_previews')"
                @click="() => (modals.isSetFramesDisplayed = true)"
                v-if="isCurrentUserManager"
              />
              <button-simple
                class="flexrow-item"
                :title="$t('main.edl.import_file')"
                icon="import-edl"
                @click="showEDLImportModal"
                v-if="!isAllEpisodes"
              />
              <button-simple
                class="flexrow-item"
                :title="$t('main.csv.import_file')"
                icon="import"
                @click="showImportModal"
              />
              <button-simple
                class="flexrow-item"
                icon="export"
                :title="$t('main.csv.export_file')"
                @click="onExportClick"
              />
              <button-simple
                class="flexrow-item"
                :text="$t('shots.new_shots')"
                icon="plus"
                @click="showManageShots"
                v-if="!isAllEpisodes"
              />
            </div>
          </div>

          <div class="query-list">
            <search-query-list
              :groups="shotSearchFilterGroups"
              :is-group-enabled="true"
              :queries="shotSearchQueries"
              type="shot"
              :production-id="currentProduction?.id"
              @remove-search="removeSearchQuery"
              v-if="!isShotsLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :sorting="shotSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="shotSorting?.length"
        />
        <shot-list
          ref="shot-list"
          :department-filter="departmentFilter"
          :displayed-shots="displayedShotsBySequence"
          :display-settings="displaySettings"
          :is-loading="isShotsLoading || initialLoading"
          :is-error="isShotsLoadingError"
          :validation-columns="shotValidationColumns"
          @add-metadata="onAddMetadataClicked"
          @add-shots="showManageShots"
          @change-sort="onChangeSortClicked"
          @create-tasks="showCreateTasksModal"
          @delete-all-tasks="onDeleteAllTasksClicked"
          @delete-clicked="onDeleteClicked"
          @delete-metadata="onDeleteMetadataClicked"
          @edit-clicked="onEditClicked"
          @edit-metadata="onEditMetadataClicked"
          @field-changed="onFieldChanged"
          @metadata-changed="onMetadataChanged"
          @restore-clicked="onRestoreClicked"
          @scroll="saveScrollPosition"
          @shot-history="showShotHistoryModal"
          @sequence-clicked="onSequenceClicked"
          @keep-task-panel-open="onKeepTaskPanelOpenChanged"
        />
      </div>
    </div>

    <div
      id="side-column"
      class="column side-column"
      v-show="isTaskSidePanelOpen"
    >
      <task-info
        :task="selectedTasks.values().next().value"
        entity-type="Shot"
        with-actions
      />
    </div>

    <manage-shots-modal
      :active="modals.isManageDisplayed"
      :is-loading="loading.manage"
      @add-episode="addEpisode"
      @add-sequence="addSequence"
      @add-shot="addShot"
      @cancel="hideManageShots"
    />

    <edit-shot-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :shot-to-edit="shotToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditShot"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('shots.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteShot"
    />

    <delete-modal
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="errors.restore"
      :text="restoreText"
      :error-text="$t('shots.restore_error')"
      @cancel="modals.isRestoreDisplayed = false"
      @confirm="confirmRestoreShot"
    />

    <delete-modal
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      @cancel="modals.isDeleteMetadataDisplayed = false"
      :text="$t('productions.metadata.delete_text')"
      :error-text="$t('productions.metadata.delete_error')"
      @confirm="confirmDeleteMetadata"
    />

    <hard-delete-modal
      :active="modals.isDeleteAllTasksDisplayed"
      :is-loading="loading.deleteAllTasks"
      :is-error="errors.deleteAllTasks"
      :text="deleteAllTasksText"
      :error-text="$t('tasks.delete_all_error')"
      :lock-text="deleteAllTasksLockText"
      :selection-option="true"
      @cancel="modals.isDeleteAllTasksDisplayed = false"
      @confirm="confirmDeleteAllTasks"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :import-error="errors.importingError"
      :parsed-csv="parsedCSV"
      :form-data="shotsCsvFormData"
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="filteredShots"
      :required-values="dataMatchers"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
    />

    <import-modal
      ref="import-modal"
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :form-data="shotsCsvFormData"
      :columns="dataMatchers"
      :optional-columns="optionalColumns"
      :generic-columns="genericColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <import-edl-modal
      :active="modals.isEDLImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :import-error="errors.importingError"
      @cancel="hideEDLImportModal"
      @confirm="uploadEDLFile"
    />

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-loading-stay="loading.creatingTasksStay"
      :is-loading-all="loading.creatingAllTasks"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_shot')"
      :text="$t('tasks.create_tasks_shot_explanation')"
      :error-text="$t('tasks.create_tasks_shot_failed')"
      @cancel="hideCreateTasksModal"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
      @confirm-all-missing="confirmCreateAllMissingTasks"
    />

    <add-metadata-modal
      :active="modals.isAddMetadataDisplayed"
      :is-loading="loading.addMetadata"
      :is-error="errors.addMetadata"
      :descriptor-to-edit="descriptorToEdit"
      entity-type="Shot"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <set-frames-from-task-type-previews-modal
      :active="modals.isSetFramesDisplayed"
      :is-loading="loading.getFrames"
      :is-error="errors.getFrames"
      @cancel="modals.isSetFramesDisplayed = false"
      @confirm="confirmSetFrames"
    />

    <add-thumbnails-modal
      active
      entity-type="Shot"
      parent="shots"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
      v-if="modals.isAddThumbnailsDisplayed"
    />

    <shot-history-modal
      :active="modals.isShotHistoryDisplayed"
      :shot="historyShot"
      @cancel="hideShotHistoryModal"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      entity-type="shot"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import {
  GENERIC_IMPORT_COLUMNS as genericColumns,
  useEntityPage
} from '@/composables/entityPage'
import { getExportDescriptors } from '@/lib/descriptors'
import shotStore from '@/store/modules/shots'

/* eslint-disable no-unused-vars */
import ShotList from '@/components/lists/ShotList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditShotModal from '@/components/modals/EditShotModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportEdlModal from '@/components/modals/ImportEdlModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'
import SetFramesFromTaskTypePreviewsModal from '@/components/modals/SetFramesFromTaskTypePreviewsModal.vue'
import ShotHistoryModal from '@/components/modals/ShotHistoryModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const store = useStore()

const type = 'shot'
// Non-reactive store cache, read at call time.
const shotMap = shotStore.cache.shotMap

// State
// --------------------------------------------------------------------------

const importModalRef = useTemplateRef('import-modal')
const listRef = useTemplateRef('shot-list')
const searchFieldRef = useTemplateRef('shot-search-field')

const historyShot = ref({})
const initialLoading = ref(true)
const optionalColumns = ref([
  'Description',
  'Nb Frames',
  'Frame In',
  'Frame Out',
  'FPS',
  'Resolution'
])

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const currentSection = computed(() => store.getters.currentSection)
const departments = computed(() => store.getters.departments)
const displayedSequences = computed(() => store.getters.displayedSequences)
const displayedShots = computed(() => store.getters.displayedShots)
const displayedShotsBySequence = computed(
  () => store.getters.displayedShotsBySequence
)
const episodes = computed(() => store.getters.episodes)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isFps = computed(() => store.getters.isFps)
const isFrameIn = computed(() => store.getters.isFrameIn)
const isFrameOut = computed(() => store.getters.isFrameOut)
const isFrames = computed(() => store.getters.isFrames)
const isMaxRetakes = computed(() => store.getters.isMaxRetakes)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isResolution = computed(() => store.getters.isResolution)
const isShotEstimation = computed(() => store.getters.isShotEstimation)
const isShotsLoading = computed(() => store.getters.isShotsLoading)
const isShotsLoadingError = computed(() => store.getters.isShotsLoadingError)
const isShotTime = computed(() => store.getters.isShotTime)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedTasks = computed(() => store.getters.selectedTasks)
const shotsCsvFormData = computed(() => store.getters.shotsCsvFormData)
const shotSearchFilterGroups = computed(
  () => store.getters.shotSearchFilterGroups
)
const shotSearchQueries = computed(() => store.getters.shotSearchQueries)
const shotSearchText = computed(() => store.getters.shotSearchText)
const shotsLoadingKey = computed(() => store.getters.shotsLoadingKey)
const shotSorting = computed(() => store.getters.shotSorting)
const shotValidationColumns = computed(
  () => store.getters.shotValidationColumns
)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isAllEpisodes = computed(
  () => isTVShow.value && currentEpisode.value?.id === 'all'
)

const dataMatchers = computed(() =>
  isTVShow.value ? ['Episode', 'Sequence', 'Name'] : ['Sequence', 'Name']
)

// Built from the full shot cache, not the filtered display list, so the
// import creation check sees every shot. The cache Map is not reactive:
// depend on displayedShots (updated by the same mutations) to invalidate.
const filteredShots = computed(() => {
  displayedShots.value // eslint-disable-line no-unused-expressions
  return Object.fromEntries(
    Array.from(shotMap.values()).map(shot => [
      `${isTVShow.value ? shot.episode_name : ''}${shot.sequence_name}${shot.name}`,
      true
    ])
  )
})

// Functions
// --------------------------------------------------------------------------

const reset = async () => {
  initialLoading.value = true
  await store.dispatch('loadShots')
  initialLoading.value = false
}

const {
  applySearchFromUrl,
  clearSearchAndScroll,
  closeMetadataModal,
  confirmAddMetadata,
  confirmAddThumbnails,
  confirmBuildFilter,
  confirmCreateAllMissingTasks,
  confirmCreateTasks,
  confirmCreateTasksAndStay,
  confirmDelete: confirmDeleteShot,
  confirmDeleteAllTasks,
  confirmDeleteMetadata,
  confirmRestore: confirmRestoreShot,
  deleteAllTasksLockText,
  deleteAllTasksText,
  deleteText,
  departmentFilter,
  descriptorToEdit,
  displaySettings,
  entityToEdit: shotToEdit,
  errors,
  exportCsv,
  hideAddThumbnailsModal,
  hideCreateTasksModal,
  hideImportModal,
  hideImportRenderModal,
  isTaskSidePanelOpen,
  loading,
  modals,
  onAddMetadataClicked,
  onChangeSortClicked,
  onDeleteAllTasksClicked,
  onDeleteClicked,
  onDeleteMetadataClicked,
  onEditMetadataClicked,
  onKeepTaskPanelOpenChanged,
  onRestoreClicked,
  onSearchChange,
  openEditModal: onEditClicked,
  parsedCSV,
  removeSearchQuery,
  renderColumns,
  renderImport,
  resetImport,
  restoreText,
  saveScrollPosition,
  saveSearchQuery,
  selectableDepartments,
  selectedDepartment,
  setScrollPosition,
  showCreateTasksModal,
  showImportModal,
  uploadImportFile
} = useEntityPage({
  type,
  pageName: 'Shots',
  listRef,
  searchFieldRef,
  importModalRef,
  reset,
  loadEntities: () => store.dispatch('loadShots'),
  dataMatchers,
  optionalColumns,
  hasAssignationColumns: true,
  canCancel: true,
  displaySettings: { inOutTimecode: false },
  modals: {
    isEDLImportDisplayed: false,
    isManageDisplayed: false,
    isSetFramesDisplayed: false,
    isShotHistoryDisplayed: false
  },
  loading: { getFrames: false },
  errors: { getFrames: false }
})

const onExportClick = () =>
  exportCsv(
    [
      ...(currentEpisode.value ? ['Episode'] : []),
      t('shots.fields.sequence'),
      t('shots.fields.name'),
      t('shots.fields.description'),
      ...getExportDescriptors(currentProduction.value, 'Shot').map(
        descriptor => descriptor.name
      ),
      ...(isShotTime.value ? [t('shots.fields.time_spent')] : []),
      ...(isShotEstimation.value ? [t('main.estimation_short')] : []),
      ...(isFrames.value ? [t('main.frames')] : []),
      ...(isFrameIn.value ? [t('main.frame_in')] : []),
      ...(isFrameOut.value ? [t('main.frame_out')] : []),
      ...(isFps.value ? [t('main.fps')] : []),
      ...(isResolution.value ? [t('shots.fields.resolution')] : []),
      ...(isMaxRetakes.value ? [t('shots.fields.max_retakes')] : []),
      // Qualified by the task type so a re-import can tell the columns
      // apart: bare duplicated headers collapse in the server's reader.
      ...shotValidationColumns.value.flatMap(taskTypeId => {
        const taskTypeName = taskTypeMap.value.get(taskTypeId)?.name || ''
        return [taskTypeName, `${taskTypeName} assignations`]
      })
    ],
    currentEpisode.value &&
      (isAllEpisodes.value ? t('main.all_shots') : currentEpisode.value.name)
  )

const setOptionalImportColumns = () => {
  optionalColumns.value = [
    t('shots.fields.description'),
    ...(isPaperProduction.value ? [] : [t('shots.fields.nb_frames')]),
    t('shots.fields.frame_in'),
    t('shots.fields.frame_out'),
    t('shots.fields.fps'),
    t('shots.fields.resolution')
  ]
}

const reloadShots = async () => {
  initialLoading.value = true
  await store.dispatch('loadShots')
  initialLoading.value = false
  applySearchFromUrl()
}

const reloadEpisodeShotsIfNeeded = () => {
  // The first rows say nothing about the loaded scope: a production-wide
  // All dataset passes the per-episode checks whenever the first episode
  // owns the first rows. Compare the scope of the last load first.
  const scope = isTVShow.value ? (currentEpisode.value?.id ?? '') : ''
  const episodeId = currentEpisode.value?.id
  const isStale =
    shotsLoadingKey.value !== `${currentProduction.value?.id}/${scope}` ||
    (!isAllEpisodes.value &&
      ((isTVShow.value && displayedSequences.value.length === 0) ||
        displayedSequences.value[0]?.episode_id !== episodeId ||
        displayedShots.value[0]?.episode_id !== episodeId))
  if (isStale && !isShotsLoading.value && !initialLoading.value) {
    clearSearchAndScroll()
    reloadShots()
  }
}

// The episodes of another production are reloaded before the shots.
const loadShotsWithEpisodes = async () => {
  if (
    currentProduction.value &&
    episodes.value.length > 0 &&
    episodes.value[0].project_id !== currentProduction.value.id
  ) {
    await store.dispatch('loadEpisodes')
  }
  await store.dispatch('loadShots')
}

const addEpisode = (episode, callback) => {
  store.dispatch('newEpisode', episode).then(callback).catch(console.error)
}

const addSequence = (sequence, callback) => {
  store.dispatch('newSequence', sequence).then(callback).catch(console.error)
}

const addShot = (shot, callback) => {
  store.dispatch('newShot', shot).then(callback).catch(console.error)
}

const confirmEditShot = async form => {
  loading.edit = true
  errors.edit = false
  try {
    await store.dispatch('editShot', {
      ...form,
      id: shotToEdit.value.id,
      data: {
        ...form.data,
        resolution: form.resolution,
        max_retakes: form.max_retakes,
        frame_in: form.frameIn,
        frame_out: form.frameOut,
        fps: form.fps
      }
    })
    modals.isNewDisplayed = false
    applySearchFromUrl(false)
  } catch (err) {
    console.error(err)
    errors.edit = true
  } finally {
    loading.edit = false
  }
}

const onSequenceClicked = sequenceName => {
  const quotedName = sequenceName.includes(' ')
    ? `"${sequenceName}"`
    : sequenceName
  searchFieldRef.value.setValue(`${shotSearchText.value} ${quotedName}`)
  onSearchChange()
}

const showManageShots = () => {
  modals.isManageDisplayed = true
}

const hideManageShots = () => {
  modals.isManageDisplayed = false
}

const showShotHistoryModal = shot => {
  historyShot.value = shot
  modals.isShotHistoryDisplayed = true
}

const hideShotHistoryModal = () => {
  modals.isShotHistoryDisplayed = false
}

const onFieldChanged = async ({ entry, fieldName, value }) => {
  await store.dispatch('editShotDebounced', {
    id: entry.id,
    nb_frames: entry.nb_frames,
    description: entry.description,
    [fieldName]: value
  })
  onSearchChange(false)
}

// A frame in or out typed on a shot holding the other bound sets the
// frame count too.
const getFrameCount = (shot, fieldName, value) => {
  if (isPaperProduction.value) return undefined
  const frameIn = parseInt(
    fieldName === 'frame_in' ? value : shot.data?.frame_in
  )
  const frameOut = parseInt(
    fieldName === 'frame_out' ? value : shot.data?.frame_out
  )
  const isOtherBoundSet =
    fieldName === 'frame_in' ? shot.data?.frame_out : shot.data?.frame_in
  if (!['frame_in', 'frame_out'].includes(fieldName) || !isOtherBoundSet) {
    return undefined
  }
  return frameOut > frameIn ? frameOut - frameIn + 1 : undefined
}

const onMetadataChanged = async ({ entry, descriptor, value }) => {
  const shot = shotMap.get(entry.id)
  const nbFrames = getFrameCount(shot, descriptor.field_name, value)
  await store.dispatch('editShotDebounced', {
    id: entry.id,
    data: { [descriptor.field_name]: value },
    ...(nbFrames === undefined ? {} : { nb_frames: nbFrames })
  })
  applySearchFromUrl(false)
}

// A timed out import disables the upload of the EDL modal: reopening it
// must not keep the previous failure.
const showEDLImportModal = () => {
  errors.importing = false
  errors.importingError = null
  modals.isEDLImportDisplayed = true
}

const hideEDLImportModal = () => {
  modals.isEDLImportDisplayed = false
}

const uploadEDLFile = async (edl_file, namingConvention, matchCase) => {
  loading.importing = true
  errors.importing = false
  errors.importingError = null
  try {
    await store.dispatch('uploadEdlFile', {
      edl_file,
      namingConvention,
      matchCase
    })
    store.dispatch('loadEpisodes').catch(console.error)
    hideEDLImportModal()
    store.dispatch('loadShots')
  } catch (err) {
    console.error(err)
    errors.importingError = err
    errors.importing = true
  } finally {
    loading.importing = false
  }
}

const confirmSetFrames = async taskTypeId => {
  loading.getFrames = true
  try {
    await store.dispatch('setNbFramesFromTaskTypePreviews', {
      taskTypeId,
      productionId: currentProduction.value.id,
      // Whole production in All mode: zou rejects episode_id=all here.
      episodeId:
        currentEpisode.value && !isAllEpisodes.value
          ? currentEpisode.value.id
          : null
    })
    modals.isSetFramesDisplayed = false
  } catch (err) {
    console.error(err)
    errors.getFrames = true
  } finally {
    loading.getFrames = false
  }
}

// A long list is only filtered through the URL, by the route watcher.
const onSearchTyped = () => {
  if (shotMap.size < 800 || searchFieldRef.value?.getValue() === '') {
    onSearchChange()
  }
}

// Watchers
// --------------------------------------------------------------------------

watch(currentSection, reloadEpisodeShotsIfNeeded)

watch(currentProduction, () => {
  setOptionalImportColumns()
  clearSearchAndScroll()
  // Even during the first load: the switch dropped its response. A TV
  // show reloads from the episode watcher instead.
  if (currentProduction.value && !isTVShow.value) {
    store.dispatch('loadShots')
  }
})

watch(currentEpisode, () => {
  if (isTVShow.value && currentEpisode.value) {
    loadShotsWithEpisodes().catch(console.error)
  }
})

watch(isShotsLoading, isLoading => {
  if (isLoading) return
  initialLoading.value = false
  applySearchFromUrl()
  nextTick(() => {
    listRef.value?.selectTaskFromQuery()
  })
  setScrollPosition()
})

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  setOptionalImportColumns()
  const firstShot = shotMap.get(shotMap.keys().next().value)
  if (
    shotMap.size < 2 ||
    (shotValidationColumns.value.length > 0 && !firstShot?.validations)
  ) {
    // Next tick: the current production must be set.
    nextTick(() => {
      loadShotsWithEpisodes()
        .then(() => {
          initialLoading.value = false
        })
        .catch(console.error)
    })
  } else {
    if (!isShotsLoading.value) initialLoading.value = false
    onSearchChange()
    setScrollPosition()
    nextTick(() => {
      listRef.value?.selectTaskFromQuery()
      applySearchFromUrl()
      onSearchChange()
    })
    reloadEpisodeShotsIfNeeded()
  }
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedShots')
})

// Head
// --------------------------------------------------------------------------

useHead({
  title: computed(() => {
    const title = `${t('shots.title')} - Kitsu`
    if (isTVShow.value) {
      const episodeName = isAllEpisodes.value
        ? t('main.all_shots')
        : currentEpisode.value?.name || ''
      return `${currentProduction.value?.name || ''} - ${episodeName} | ${title}`
    }
    if (!currentProduction.value) return title
    return `${currentProduction.value.name} | ${title}`
  })
})
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.page-header {
  margin-bottom: 1em;
}

.shots {
  display: flex;
  flex-direction: column;
}

.columns {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.combobox-department {
  margin-bottom: 0;
}
</style>
