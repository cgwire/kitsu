<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="edits page">
        <div class="edit-list-header page-header">
          <div class="flexrow mb1">
            <search-field
              ref="edit-search-field"
              :can-save="!isEditsLoading && !initialLoading"
              @change="onSearchTyped"
              @enter="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 edit=wip"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('entities.build_filter.title')"
              icon="filter"
              @click="() => (modals.isBuildFilterDisplayed = true)"
            />
            <div class="filler"></div>
            <div class="flexrow flexrow-item">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Edit')"
                :display-all-and-my-departments="true"
                :width="230"
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
                :title="$t('main.csv.import_file')"
                icon="import"
                @click="showImportModal"
              />
              <button-simple
                class="flexrow-item"
                icon="export"
                :title="$t('main.csv.export_file')"
                @click="exportEntityCsv"
              />
              <button-simple
                class="flexrow-item"
                :text="$t('edits.new_edits')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list">
            <search-query-list
              ref="edit-search-query-list"
              :queries="editSearchQueries"
              type="edit"
              :production-id="currentProduction?.id"
              v-if="!isEditsLoading && !initialLoading"
            />
          </div>
          <error-text :text="cellSaveErrorText" v-if="cellSaveErrorText" />
        </div>

        <sorting-info
          :sorting="editSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="editSorting?.length"
        />
        <edit-list
          ref="edit-list"
          :displayed-edits="displayedEdits"
          :is-loading="isEditsLoading || initialLoading"
          :is-error="isEditsLoadingError"
          :validation-columns="editValidationColumns"
          :department-filter="departmentFilter"
          :display-settings="displaySettings"
          @add-edits="showNewModal"
          @add-metadata="onAddMetadataClicked"
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
          @edit-history="showEditHistoryModal"
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
        entity-type="Edit"
        with-actions
      />
    </div>

    <edit-edit-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :is-deleted="errors.editDeleted"
      :edit-to-edit="editToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditEdit"
    />

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('edits.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEdit"
    />

    <delete-modal
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="errors.restore"
      :text="restoreText"
      :error-text="$t('edits.restore_error')"
      @cancel="modals.isRestoreDisplayed = false"
      @confirm="confirmRestoreEdit"
    />

    <delete-modal
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      @cancel="modals.isDeleteMetadataDisplayed = false"
      :text="$t('productions.metadata.delete_edit_text')"
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
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="importDatabase"
      :required-values="importRequiredValues"
      entity-type="Edit"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
    />

    <import-modal
      ref="import-modal"
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :columns="dataMatchers"
      :optional-columns="optionalColumns"
      :generic-columns="genericColumns"
      @cancel="hideImportModal"
      @confirm="renderImport"
    />

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-loading-stay="loading.creatingTasksStay"
      :is-loading-all="loading.creatingAllTasks"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_edit')"
      :text="$t('tasks.create_tasks_edit_explanation')"
      :error-text="$t('tasks.create_tasks_edit_failed')"
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
      entity-type="Edit"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      active
      entity-type="Edit"
      :parent="isTVShow ? 'edits_tvshow' : 'edits'"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
      v-if="modals.isAddThumbnailsDisplayed"
    />

    <edit-history-modal
      :active="modals.isEditHistoryDisplayed"
      :edit="historyEdit"
      @cancel="hideEditHistoryModal"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      entity-type="edit"
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
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import {
  GENERIC_IMPORT_COLUMNS as genericColumns,
  useEntityPage
} from '@/composables/entityPage'
import { isNotFound } from '@/lib/errors'

/* eslint-disable no-unused-vars */
import EditList from '@/components/lists/EditList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import EditHistoryModal from '@/components/modals/EditHistoryModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import ErrorText from '@/components/widgets/ErrorText.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const type = 'edit'

// State
// --------------------------------------------------------------------------

const addThumbnailsModalRef = useTemplateRef('add-thumbnails-modal')
const importModalRef = useTemplateRef('import-modal')
const listRef = useTemplateRef('edit-list')
const searchFieldRef = useTemplateRef('edit-search-field')
const searchQueryListRef = useTemplateRef('edit-search-query-list')

const historyEdit = ref({})
const initialLoading = ref(true)

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const departments = computed(() => store.getters.departments)
const displayedEdits = computed(() => store.getters.displayedEdits)
const editMap = computed(() => store.getters.editMap)
const editSearchQueries = computed(() => store.getters.editSearchQueries)
const editSearchText = computed(() => store.getters.editSearchText)
const editSorting = computed(() => store.getters.editSorting)
const editValidationColumns = computed(() =>
  store.getters.editValidationColumns.filter(
    store.getters.clientAccess.isTaskTypeVisible
  )
)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isEditsLoading = computed(() => store.getters.isEditsLoading)
const isEditsLoadingError = computed(() => store.getters.isEditsLoadingError)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedTasks = computed(() => store.getters.selectedTasks)

// Functions
// --------------------------------------------------------------------------

const reset = () => {
  initialLoading.value = true
  store.dispatch('loadEdits', err => {
    if (err) console.error(err)
    initialLoading.value = false
  })
}

const {
  applySearch,
  applySearchFromUrl,
  cellSaveErrorText,
  clearSearchAndScroll,
  clearSelection,
  closeMetadataModal,
  confirmAddMetadata,
  confirmAddThumbnails,
  confirmBuildFilter,
  confirmCreateAllMissingTasks,
  confirmCreateTasks,
  confirmCreateTasksAndStay,
  confirmDelete: confirmDeleteEdit,
  confirmDeleteAllTasks,
  confirmDeleteMetadata,
  confirmRestore: confirmRestoreEdit,
  dataMatchers,
  deleteAllTasksLockText,
  deleteAllTasksText,
  deleteText,
  departmentFilter,
  descriptorToEdit,
  displaySettings,
  entityToEdit: editToEdit,
  errors,
  exportEntityCsv,
  hideAddThumbnailsModal,
  hideCreateTasksModal,
  hideImportModal,
  hideImportRenderModal,
  importDatabase,
  importRequiredValues,
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
  openEditModal: onEditClicked,
  optionalColumns,
  parsedCSV,
  renderColumns,
  renderImport,
  resetImport,
  restoreText,
  saveCell,
  saveScrollPosition,
  saveSearchQuery,
  selectableDepartments,
  selectedDepartment,
  setScrollPosition,
  setSearchInUrl,
  showAddThumbnailsModal,
  showCreateTasksModal,
  showImportModal,
  uploadImportFile
} = useEntityPage({
  type,
  pageName: 'Edits',
  listRef,
  searchFieldRef,
  searchQueryListRef,
  addThumbnailsModalRef,
  importModalRef,
  reset,
  loadEntities: () => store.dispatch('loadEdits'),
  canCancel: true,
  modals: { isEditHistoryDisplayed: false }
})

const showNewModal = () => onEditClicked()

const reloadEpisodeEditsIfNeeded = () => {
  if (!isLoadedScopeStale()) return
  clearSearchAndScroll()
  reset()
}

// The edit map is not reactive: its size is read as the search is typed.
// Like the shot list, a long list is only searched on Enter.
const onSearchTyped = () => {
  if (editMap.value.size <= 500 || searchFieldRef.value?.getValue() === '') {
    onSearchChange()
  }
}

const onSearchChange = (clearSelectionAfter = true) => {
  if (!searchFieldRef.value) return
  const searchQuery = searchFieldRef.value.getValue() || ''
  setSearchInUrl()
  if (searchQuery.length !== 1) {
    applySearch(searchQuery)
  }
  if (clearSelectionAfter) clearSelection()
}

const confirmEditEdit = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (editToEdit.value?.id) {
      await store.dispatch('editEdit', { ...form, id: editToEdit.value.id })
    } else {
      await store.dispatch('newEdit', form)
    }
    modals.isNewDisplayed = false
    applySearchFromUrl(false)
  } catch (err) {
    console.error(err)
    errors.edit = true
    errors.editDeleted = isNotFound(err)
  } finally {
    loading.edit = false
  }
}

const showEditHistoryModal = edit => {
  historyEdit.value = edit
  modals.isEditHistoryDisplayed = true
}

const hideEditHistoryModal = () => {
  modals.isEditHistoryDisplayed = false
}

const onFieldChanged = async ({ entry, fieldName, value }) => {
  const isSaved = await saveCell(entry, () =>
    store.dispatch('editEdit', {
      id: entry.id,
      description: entry.description,
      [fieldName]: value
    })
  )
  if (isSaved) applySearchFromUrl(false)
}

// Watchers
// --------------------------------------------------------------------------

watch(currentProduction, () => {
  clearSearchAndScroll()
  initialLoading.value = true
  if (!isTVShow.value) reset()
})

watch(currentEpisode, () => {
  clearSearchAndScroll()
  if (isTVShow.value && currentEpisode.value) reset()
})

watch(isEditsLoading, isLoading => {
  if (isLoading) return
  const search = route.query.search
  const searchQuery = search?.length > 0 ? `${search}` : ''
  initialLoading.value = false
  searchFieldRef.value.setValue(searchQuery)
  nextTick(() => {
    applySearch(searchQuery)
  })
  setScrollPosition()
})

// Lifecycle
// --------------------------------------------------------------------------

store.dispatch('setLastProductionScreen', 'edits')

onMounted(() => {
  if (editSearchText.value.length > 0) {
    searchFieldRef.value?.setValue(editSearchText.value)
  }
  setScrollPosition()
  const finalize = () => {
    if (listRef.value) {
      applySearchFromUrl()
      setScrollPosition()
      listRef.value.selectTaskFromQuery()
    }
  }

  const firstEdit = editMap.value.get(editMap.value.keys().next().value)
  if (
    editMap.value.size < 2 ||
    (editValidationColumns.value.length > 0 && !firstEdit.validations)
  ) {
    setTimeout(() => {
      store.dispatch('loadEdits').then(() => {
        setTimeout(() => {
          initialLoading.value = false
          finalize()
        }, 200)
      })
    }, 0)
  } else {
    if (!isEditsLoading.value) initialLoading.value = false
    finalize()
    reloadEpisodeEditsIfNeeded()
  }
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedEdits')
})

// Head
// --------------------------------------------------------------------------

useHead({
  title: computed(() => {
    const productionName = currentProduction.value?.name || ''
    const title = `${t('edits.title')} - Kitsu`
    if (isTVShow.value) {
      const episodeName = currentEpisode.value
        ? currentEpisode.value.name || t('main.all')
        : ''
      return `${productionName} - ${episodeName} | ${title}`
    }
    return `${productionName} ${title}`
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

.edits {
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
