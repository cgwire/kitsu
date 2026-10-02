<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="assets page">
        <div class="asset-list-header page-header">
          <div class="flexrow mb1">
            <search-field
              ref="asset-search-field"
              class="flexrow-item"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: props modeling=wip"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('entities.build_filter.title')"
              icon="filter"
              @click="modals.isBuildFilterDisplayed = true"
            />
            <div class="flexrow-item filler"></div>
            <div class="flexrow flexrow-item">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Asset')"
                :display-all-and-my-departments="true"
                rounded
                v-model="selectedDepartment"
                v-if="departments.length > 0 && !isCurrentUserClient"
              />
              <combobox-display-options
                class="flexrow-item"
                :has-linked-assets="isTVShow"
                :is-all-episodes="currentEpisode?.id === 'all'"
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
                :text="$t('assets.new_assets')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>
          <div class="query-list">
            <search-query-list
              :groups="productionAssetFilterGroups"
              :is-group-enabled="true"
              :queries="productionAssetSearchQueries"
              type="asset"
              :production-id="currentProduction?.id"
              @remove-search="removeSearchQuery"
            />
          </div>
        </div>

        <sorting-info
          :sorting="assetSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="assetSorting?.length"
        />
        <asset-list
          ref="asset-list"
          :displayed-assets="displayedAssetsByType"
          :display-settings="displaySettings"
          :is-loading="isAssetsLoading || initialLoading"
          :is-error="isAssetsLoadingError"
          :department-filter="departmentFilter"
          :validation-columns="assetValidationColumns"
          @change-sort="onChangeSortClicked"
          @create-tasks="showCreateTasksModal"
          @delete-all-tasks="onDeleteAllTasksClicked"
          @new-clicked="showNewModal"
          @edit-clicked="onEditClicked"
          @delete-clicked="onDeleteClicked"
          @restore-clicked="onRestoreClicked"
          @add-metadata="onAddMetadataClicked"
          @edit-metadata="onEditMetadataClicked"
          @delete-metadata="onDeleteMetadataClicked"
          @metadata-changed="onMetadataChanged"
          @asset-changed="onAssetChanged"
          @field-changed="onFieldChanged"
          @scroll="saveScrollPosition"
          @asset-type-clicked="onAssetTypeClicked"
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
        entity-type="Asset"
        with-actions
      />
    </div>

    <edit-asset-modal
      ref="edit-asset-modal"
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-loading-stay="loading.stay"
      :is-error="errors.edit"
      :is-success="success.edit"
      :asset-to-edit="assetToEdit"
      @confirm="confirmEditAsset"
      @confirm-and-stay="confirmNewAssetStay"
      @cancel="modals.isNewDisplayed = false"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('assets.delete_error')"
      @confirm="confirmDeleteAsset"
      @cancel="modals.isDeleteDisplayed = false"
    />

    <delete-modal
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="errors.restore"
      :text="restoreText"
      :error-text="$t('assets.restore_error')"
      @confirm="confirmRestoreAsset"
      @cancel="modals.isRestoreDisplayed = false"
    />

    <hard-delete-modal
      :active="modals.isDeleteAllTasksDisplayed"
      :is-loading="loading.deleteAllTasks"
      :is-error="errors.deleteAllTasks"
      :text="deleteAllTasksText"
      :error-text="$t('tasks.delete_all_error')"
      :lock-text="deleteAllTasksLockText"
      :selection-option="true"
      @confirm="confirmDeleteAllTasks"
      @cancel="modals.isDeleteAllTasksDisplayed = false"
    />

    <delete-modal
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      :text="$t('productions.metadata.delete_text')"
      :error-text="$t('productions.metadata.delete_error')"
      @confirm="confirmDeleteMetadata"
      @cancel="modals.isDeleteMetadataDisplayed = false"
    />

    <import-render-modal
      :active="modals.isImportRenderDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :import-error="errors.importingError"
      :parsed-csv="parsedCSV"
      :form-data="assetsCsvFormData"
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="filteredAssets"
      @reupload="resetImport"
      @confirm="uploadImportFile"
      @cancel="hideImportRenderModal"
    />

    <import-modal
      ref="import-modal"
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :form-data="assetsCsvFormData"
      :columns="dataMatchers"
      :optional-columns="optionalColumns"
      :generic-columns="genericColumns"
      @confirm="renderImport"
      @cancel="hideImportModal"
    />

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-loading-stay="loading.creatingTasksStay"
      :is-loading-all="loading.creatingAllTasks"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_asset')"
      :text="$t('tasks.create_tasks_asset_explanation')"
      :error-text="$t('tasks.create_tasks_asset_failed')"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
      @confirm-all-missing="confirmCreateAllMissingTasks"
      @cancel="hideCreateTasksModal"
    />

    <add-metadata-modal
      :active="modals.isAddMetadataDisplayed"
      :is-loading="loading.addMetadata"
      :is-error="errors.addMetadata"
      :descriptor-to-edit="descriptorToEdit"
      entity-type="Asset"
      @confirm="confirmAddMetadata"
      @cancel="modals.isAddMetadataDisplayed = false"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      active
      entity-type="Asset"
      parent="assets"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @confirm="confirmAddThumbnails"
      @cancel="hideAddThumbnailsModal"
      v-if="modals.isAddThumbnailsDisplayed"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      @confirm="confirmBuildFilter"
      @cancel="modals.isBuildFilterDisplayed = false"
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
  reactive,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import {
  GENERIC_IMPORT_COLUMNS as genericColumns,
  useEntityPage
} from '@/composables/entityPage'
import { getExportDescriptors } from '@/lib/descriptors'

/* eslint-disable no-unused-vars */
import AssetList from '@/components/lists/AssetList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditAssetModal from '@/components/modals/EditAssetModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const type = 'asset'

// State
// --------------------------------------------------------------------------

const addThumbnailsModalRef = useTemplateRef('add-thumbnails-modal')
const editAssetModalRef = useTemplateRef('edit-asset-modal')
const importModalRef = useTemplateRef('import-modal')
const listRef = useTemplateRef('asset-list')
const searchFieldRef = useTemplateRef('asset-search-field')

const initialLoading = ref(true)
const optionalColumns = ref(['Description', 'Ready for', 'Resolution'])

const success = reactive({ edit: false })

let resetTimeout = null

// Computed
// --------------------------------------------------------------------------

const assetMap = computed(() => store.getters.assetMap)
const assetsCsvFormData = computed(() => store.getters.assetsCsvFormData)
const assetSearchText = computed(() => store.getters.assetSearchText)
const assetSorting = computed(() => store.getters.assetSorting)
const assetValidationColumns = computed(
  () => store.getters.assetValidationColumns
)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const currentSection = computed(() => store.getters.currentSection)
const departments = computed(() => store.getters.departments)
const displayedAssets = computed(() => store.getters.displayedAssets)
const displayedAssetsByType = computed(
  () => store.getters.displayedAssetsByType
)
const episodeMap = computed(() => store.getters.episodeMap)
const isAssetEstimation = computed(() => store.getters.isAssetEstimation)
const isAssetResolution = computed(() => store.getters.isAssetResolution)
const isAssetsLoading = computed(() => store.getters.isAssetsLoading)
const isAssetsLoadingError = computed(() => store.getters.isAssetsLoadingError)
const isAssetTime = computed(() => store.getters.isAssetTime)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedTasks = computed(() => store.getters.selectedTasks)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const userFilterGroups = computed(() => store.getters.userFilterGroups)
const userFilters = computed(() => store.getters.userFilters)

const productionAssetSearchQueries = computed(
  () => userFilters.value?.asset?.[currentProduction.value?.id] || []
)

const productionAssetFilterGroups = computed(
  () => userFilterGroups.value?.asset?.[currentProduction.value?.id] || []
)

const dataMatchers = computed(() =>
  isTVShow.value ? ['Episode', 'Type', 'Name'] : ['Type', 'Name']
)

// Built from the full asset cache, not the paginated display list, so the
// import duplicate check sees every asset. The cache Map is not reactive:
// depend on displayedAssets (updated by the same mutations) to invalidate.
const filteredAssets = computed(() => {
  displayedAssets.value // eslint-disable-line no-unused-expressions
  return Object.fromEntries(
    Array.from(assetMap.value.values()).map(asset => {
      const episode = isTVShow.value && episodeMap.value.get(asset.episode_id)
      const episodeName = episode ? episode.name : ''
      return [`${episodeName}${asset.asset_type_name}${asset.name}`, true]
    })
  )
})

// Functions
// --------------------------------------------------------------------------

const loadAssets = async () => {
  await store.dispatch('loadAssets')
  initialLoading.value = false
  applySearchFromUrl()
}

// Debounced: a cross-production navigation changes the current episode
// twice in a row (a transient 'main', then 'all').
const reset = () => {
  if (resetTimeout) clearTimeout(resetTimeout)
  resetTimeout = setTimeout(() => {
    resetTimeout = null
    // No bail while a load runs: the store queues the new scope behind the
    // in-flight one, where returning would drop the episode switch.
    initialLoading.value = true
    loadAssets()
  }, 50)
}

const {
  applySearchFromUrl,
  clearSearchAndScroll,
  confirmAddMetadata,
  confirmAddThumbnails,
  confirmBuildFilter,
  confirmCreateAllMissingTasks,
  confirmCreateTasks,
  confirmCreateTasksAndStay,
  confirmDelete: confirmDeleteAsset,
  confirmDeleteAllTasks,
  confirmDeleteMetadata,
  confirmRestore: confirmRestoreAsset,
  deleteAllTasksLockText,
  deleteAllTasksText,
  deleteText,
  descriptorToEdit,
  displaySettings,
  entityToEdit: assetToEdit,
  errors,
  exportCsv,
  hideAddThumbnailsModal,
  hideCreateTasksModal,
  hideImportModal,
  hideImportRenderModal,
  isLoadedScopeStale,
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
  onMetadataChanged,
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
  showAddThumbnailsModal,
  showCreateTasksModal,
  showImportModal,
  uploadImportFile
} = useEntityPage({
  type,
  pageName: 'Assets',
  listRef,
  searchFieldRef,
  addThumbnailsModalRef,
  importModalRef,
  reset,
  loadEntities: () => store.dispatch('loadAssets'),
  dataMatchers,
  optionalColumns,
  hasAssignationColumns: true,
  canCancel: true,
  displaySettings: { showSharedAssets: true, showLinkedAssets: true }
})

const showNewModal = () => onEditClicked()

const reloadEpisodeAssetsIfNeeded = () => {
  if (!isLoadedScopeStale()) return
  clearSearchAndScroll()
  initialLoading.value = true
  loadAssets()
}

const onExportClick = () =>
  exportCsv(
    [
      ...(isTVShow.value ? ['Episode'] : []),
      t('assets.fields.type'),
      t('assets.fields.name'),
      t('assets.fields.description'),
      t('assets.fields.ready_for'),
      ...getExportDescriptors(currentProduction.value, 'Asset').map(
        descriptor => descriptor.name
      ),
      ...(isAssetTime.value ? [t('assets.fields.time_spent')] : []),
      ...(isAssetEstimation.value ? [t('main.estimation_short')] : []),
      ...(isAssetResolution.value ? [t('shots.fields.resolution')] : []),
      // Qualified by the task type so a re-import can tell the columns
      // apart: bare duplicated headers collapse in the server's reader.
      ...assetValidationColumns.value.flatMap(taskTypeId => {
        const taskTypeName = taskTypeMap.value.get(taskTypeId)?.name || ''
        return [taskTypeName, `${taskTypeName} assignations`]
      })
    ],
    currentEpisode.value?.name
  )

const setOptionalImportColumns = () => {
  optionalColumns.value = [
    t('assets.fields.description'),
    ...(isPaperProduction.value ? [] : [t('assets.fields.ready_for')]),
    t('shots.fields.resolution')
  ]
}

const saveAsset = async (form, { stay = false } = {}) => {
  const loadingKey = stay ? 'stay' : 'edit'
  loading[loadingKey] = true
  success.edit = false
  errors.edit = false
  try {
    if (!stay && assetToEdit.value?.id) {
      await store.dispatch('editAsset', { ...form, id: assetToEdit.value.id })
    } else {
      await store.dispatch('newAsset', form)
    }
    if (stay) {
      // The modal stays open, ready for the next asset of the same type.
      assetToEdit.value = {
        name: '',
        entity_type_id: assetToEdit.value.entity_type_id,
        production_id: currentProduction.value.id
      }
      editAssetModalRef.value.focusName()
    } else {
      modals.isNewDisplayed = false
      applySearchFromUrl(false)
    }
    success.edit = true
  } catch (err) {
    console.error(err)
    errors.edit = true
  } finally {
    loading[loadingKey] = false
    loading.edit = false
  }
}

const confirmEditAsset = form => saveAsset(form)

const confirmNewAssetStay = form => saveAsset(form, { stay: true })

const onAssetTypeClicked = assetType => {
  searchFieldRef.value.setValue(`${assetSearchText.value} type=[${assetType}]`)
  onSearchChange()
}

const onFieldChanged = async ({ entry, fieldName, value }) => {
  await store.dispatch('editAsset', { id: entry.id, [fieldName]: value })
  applySearchFromUrl(false)
}

const onAssetChanged = async asset => {
  await store.dispatch('editAsset', asset)
  applySearchFromUrl(false)
}

// Watchers
// --------------------------------------------------------------------------

watch(currentProduction, () => {
  setOptionalImportColumns()
  clearSearchAndScroll()
  initialLoading.value = true
  if (!isTVShow.value) reset()
})

watch(currentEpisode, () => {
  clearSearchAndScroll()
  if (isTVShow.value && currentEpisode.value) reset()
})

watch(currentSection, reloadEpisodeAssetsIfNeeded)

// Lifecycle
// --------------------------------------------------------------------------

store.dispatch('setLastProductionScreen', 'assets')

onMounted(() => {
  const searchQuery = route.query.search ?? ''
  if (assetSearchText.value) {
    searchFieldRef.value?.setValue(assetSearchText.value)
  }
  setScrollPosition()
  const finalize = () => {
    if (listRef.value) {
      searchFieldRef.value.setValue(searchQuery)
      applySearchFromUrl()
      setScrollPosition()
      nextTick(() => {
        listRef.value?.selectTaskFromQuery()
      })
    }
  }

  const firstAsset = assetMap.value.get(assetMap.value.keys().next().value)
  if (
    assetMap.value.size < 2 ||
    assetValidationColumns.value.length === 0 ||
    !firstAsset.validations?.size
  ) {
    setTimeout(() => {
      store.dispatch('loadAssets').then(() => {
        setTimeout(() => {
          initialLoading.value = false
          finalize()
        }, 500)
      })
    }, 0)
  } else {
    if (!isAssetsLoading.value) initialLoading.value = false
    finalize()
    reloadEpisodeAssetsIfNeeded()
  }
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedAssets')
  if (resetTimeout) clearTimeout(resetTimeout)
})

// Head
// --------------------------------------------------------------------------

const episodeName = computed(() => {
  if (!currentEpisode.value) return ''
  if (currentEpisode.value.id === 'all') return t('main.all')
  if (currentEpisode.value.id === 'main') return t('main.main_pack')
  return currentEpisode.value.name
})

useHead({
  title: computed(() => {
    const productionName = currentProduction.value?.name || ''
    const title = `${t('assets.title')} - Kitsu`
    if (isTVShow.value) {
      return `${productionName} - ${episodeName.value} | ${title}`
    }
    return `${productionName} | ${title}`
  })
})
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.assets {
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
