<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="sequences page">
        <div class="sequence-list-header page-header">
          <div class="flexrow">
            <search-field
              ref="sequence-search-field"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 sequence=wip"
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
                :selectable-departments="selectableDepartments('Sequence')"
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
                :text="$t('sequences.new_sequences')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list mt1">
            <search-query-list
              :queries="sequenceSearchQueries"
              type="sequence"
              :production-id="currentProduction?.id"
              @remove-search="removeSearchQuery"
              v-if="!isSequencesLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :sorting="sequenceSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="sequenceSorting?.length"
        />
        <sequence-list
          ref="sequence-list"
          :contact-sheet-mode="contactSheetMode"
          :display-settings="displaySettings"
          :displayed-sequences="displayedSequences"
          :is-loading="isSequencesLoading || initialLoading"
          :is-error="isSequencesLoadingError"
          :validation-columns="sequenceValidationColumns"
          :department-filter="departmentFilter"
          @add-metadata="onAddMetadataClicked"
          @add-sequences="showNewModal"
          @change-sort="onChangeSortClicked"
          @create-tasks="showCreateTasksModal"
          @delete-all-tasks="onDeleteAllTasksClicked"
          @delete-clicked="onDeleteClicked"
          @delete-metadata="onDeleteMetadataClicked"
          @edit-clicked="onEditClicked"
          @edit-metadata="onEditMetadataClicked"
          @field-changed="onFieldChanged"
          @metadata-changed="onMetadataChanged"
          @scroll="saveScrollPosition"
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
        entity-type="Sequence"
        with-actions
      />
    </div>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('sequences.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteSequence"
    />

    <delete-modal
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      :text="$t('productions.metadata.delete_text')"
      :error-text="$t('productions.metadata.delete_error')"
      @cancel="modals.isDeleteMetadataDisplayed = false"
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

    <create-tasks-modal
      :active="modals.isCreateTasksDisplayed"
      :is-loading="loading.creatingTasks"
      :is-loading-stay="loading.creatingTasksStay"
      :is-loading-all="loading.creatingAllTasks"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_sequence')"
      :text="$t('tasks.create_tasks_sequence_explanation')"
      :error-text="$t('tasks.create_tasks_sequence_failed')"
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
      entity-type="Sequence"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      entity-type="Sequence"
      parent="sequences"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
      v-if="false"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      entity-type="sequence"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />

    <edit-sequence-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :sequence-to-edit="sequenceToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditSequence"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('sequences.delete_error')"
      :lock-text="sequenceToDelete ? sequenceToDelete.name : ''"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteSequence"
    />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useEntityPage } from '@/composables/entityPage'

/* eslint-disable no-unused-vars */
import SequenceList from '@/components/lists/SequenceList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditSequenceModal from '@/components/modals/EditSequenceModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxDisplayOptions from '@/components/widgets/ComboboxDisplayOptions.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
/* eslint-enable no-unused-vars */

const { t } = useI18n()
const store = useStore()

const type = 'sequence'
const contactSheetMode = false

// State
// --------------------------------------------------------------------------

const listRef = useTemplateRef('sequence-list')
const searchFieldRef = useTemplateRef('sequence-search-field')

const initialLoading = ref(true)

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const currentSection = computed(() => store.getters.currentSection)
const departments = computed(() => store.getters.departments)
const displayedSequences = computed(() => store.getters.displayedSequences)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isSequencesLoading = computed(() => store.getters.isSequencesLoading)
const isSequencesLoadingError = computed(
  () => store.getters.isSequencesLoadingError
)
const isTVShow = computed(() => store.getters.isTVShow)
const selectedTasks = computed(() => store.getters.selectedTasks)
const sequenceMap = computed(() => store.getters.sequenceMap)
const sequenceSearchQueries = computed(
  () => store.getters.sequenceSearchQueries
)
const sequenceSorting = computed(() => store.getters.sequenceSorting)
const sequenceValidationColumns = computed(
  () => store.getters.sequenceValidationColumns
)
const user = computed(() => store.getters.user)

// Functions
// --------------------------------------------------------------------------

const reset = () => {
  initialLoading.value = false
  store.dispatch('loadSequencesWithTasks', err => {
    if (err) console.error(err)
    applySearchFromUrl()
    initialLoading.value = false
  })
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
  confirmDelete: confirmDeleteSequence,
  confirmDeleteAllTasks,
  confirmDeleteMetadata,
  deleteAllTasksLockText,
  deleteAllTasksText,
  deleteText,
  departmentFilter,
  descriptorToEdit,
  displaySettings,
  entityToDelete: sequenceToDelete,
  entityToEdit: sequenceToEdit,
  errors,
  hideAddThumbnailsModal,
  hideCreateTasksModal,
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
  onSearchChange,
  openEditModal: onEditClicked,
  removeSearchQuery,
  saveScrollPosition,
  saveSearchQuery,
  selectableDepartments,
  selectedDepartment,
  setScrollPosition,
  showCreateTasksModal
} = useEntityPage({
  type,
  pageName: 'Sequences',
  listRef,
  searchFieldRef,
  reset
})

const showNewModal = () => onEditClicked()

const clearListAndReset = () => {
  clearSearchAndScroll()
  initialLoading.value = false
  reset()
}

const reloadEpisodeSequencesIfNeeded = () => {
  if (isLoadedScopeStale()) clearListAndReset()
}

const confirmEditSequence = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (form.id) {
      await store.dispatch('editSequence', form)
      applySearchFromUrl(false)
    } else {
      await store.dispatch('newSequence', {
        ...form,
        project_id: currentProduction.value.id,
        ...(currentEpisode.value ? { episode_id: currentEpisode.value.id } : {})
      })
    }
    modals.isNewDisplayed = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  } finally {
    loading.edit = false
  }
}

const onFieldChanged = async ({ entry, fieldName, value }) => {
  await store.dispatch('editSequence', { id: entry.id, [fieldName]: value })
  applySearchFromUrl(false)
}

// Watchers
// --------------------------------------------------------------------------

watch(currentProduction, clearListAndReset)
watch(currentEpisode, clearListAndReset)
watch(currentSection, reloadEpisodeSequencesIfNeeded)

watch(isSequencesLoading, isLoading => {
  if (isLoading) return
  initialLoading.value = false
  setScrollPosition()
})

// Lifecycle
// --------------------------------------------------------------------------

store.dispatch('setLastProductionScreen', 'sequences')

onMounted(() => {
  setScrollPosition()
  if (!isCurrentUserManager.value && user.value.departments.length > 0) {
    selectedDepartment.value = 'MY_DEPARTMENTS'
    departmentFilter.value = user.value.departments
  } else {
    departmentFilter.value = []
  }

  const finalize = () => {
    initialLoading.value = false
    if (listRef.value) {
      setScrollPosition()
      listRef.value.selectTaskFromQuery()
      setTimeout(() => {
        applySearchFromUrl()
      }, 200)
    }
  }

  if (
    sequenceMap.value.size < 1 ||
    sequenceValidationColumns.value.length === 0 ||
    sequenceMap.value.values().next().value?.project_id !==
      currentProduction.value.id
  ) {
    store
      .dispatch('loadSequencesWithTasks')
      .then(() => {
        initialLoading.value = false
        finalize()
      })
      .catch(console.error)
  } else {
    if (!isSequencesLoading.value) initialLoading.value = false
    finalize()
    reloadEpisodeSequencesIfNeeded()
  }
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedSequences')
})

// Head
// --------------------------------------------------------------------------

useHead({
  title: computed(() => {
    const productionName = currentProduction.value?.name || ''
    const title = `${t('sequences.title')} - Kitsu`
    if (isTVShow.value) {
      return `${productionName} - ${currentEpisode.value?.name || ''} | ${title}`
    }
    return `${productionName} | ${title}`
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

.sequences {
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
</style>
