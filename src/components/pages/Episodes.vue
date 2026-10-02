<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="episodes page">
        <div class="episode-list-header page-header">
          <div class="flexrow">
            <search-field
              ref="episode-search-field"
              :can-save="true"
              @change="onSearchChange"
              @save="saveSearchQuery"
              placeholder="ex: e01 episode=wip"
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
                :selectable-departments="selectableDepartments('Episode')"
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
                :text="$t('episodes.new_episodes')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list mt1">
            <search-query-list
              :queries="episodeSearchQueries"
              type="episode"
              :production-id="currentProduction?.id"
              @remove-search="removeSearchQuery"
              v-if="!isEpisodesLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :sorting="episodeSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="episodeSorting?.length"
        />
        <episode-list
          ref="episode-list"
          :displayed-episodes="displayedEpisodes"
          :display-settings="displaySettings"
          :is-loading="isEpisodesLoading || initialLoading"
          :is-error="isEpisodesLoadingError"
          :validation-columns="episodeValidationColumns"
          :department-filter="departmentFilter"
          @add-episodes="showNewModal"
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
        entity-type="Episode"
        with-actions
      />
    </div>

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
      :title="$t('tasks.create_tasks_episode')"
      :text="$t('tasks.create_tasks_episode_explanation')"
      :error-text="$t('tasks.create_tasks_episode_failed')"
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
      entity-type="Episode"
      @cancel="closeMetadataModal"
      @confirm="confirmAddMetadata"
    />

    <add-thumbnails-modal
      entity-type="Episode"
      parent="episodes"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
      v-if="false"
    />

    <build-filter-modal
      :active="modals.isBuildFilterDisplayed"
      entity-type="episode"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />

    <edit-episode-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :episode-to-edit="episodeToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditEpisode"
    />

    <hard-delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('episodes.delete_error')"
      :lock-text="episodeToDelete ? episodeToDelete.name : ''"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEpisode"
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

import { useEntityPage } from '@/composables/entityPage'

/* eslint-disable no-unused-vars */
import EpisodeList from '@/components/lists/EpisodeList.vue'
import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEpisodeModal from '@/components/modals/EditEpisodeModal.vue'
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

const type = 'episode'

// State
// --------------------------------------------------------------------------

const listRef = useTemplateRef('episode-list')
const searchFieldRef = useTemplateRef('episode-search-field')

const initialLoading = ref(true)

// Computed
// --------------------------------------------------------------------------

const currentProduction = computed(() => store.getters.currentProduction)
const departments = computed(() => store.getters.departments)
const displayedEpisodes = computed(() => store.getters.displayedEpisodes)
const episodeMap = computed(() => store.getters.episodeMap)
const episodeSearchQueries = computed(() => store.getters.episodeSearchQueries)
const episodeSorting = computed(() => store.getters.episodeSorting)
const episodeValidationColumns = computed(
  () => store.getters.episodeValidationColumns
)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(
  () => store.getters.isCurrentUserProductionManager
)
const isEpisodesLoading = computed(() => store.getters.isEpisodesLoading)
const isEpisodesLoadingError = computed(
  () => store.getters.isEpisodesLoadingError
)
const selectedTasks = computed(() => store.getters.selectedTasks)
const user = computed(() => store.getters.user)

// Functions
// --------------------------------------------------------------------------

const reset = () => {
  initialLoading.value = false
  store.dispatch('loadEpisodesWithTasks', err => {
    if (err) console.error(err)
    initialLoading.value = false
  })
}

const {
  applySearchFromUrl,
  closeMetadataModal,
  confirmAddMetadata,
  confirmAddThumbnails,
  confirmBuildFilter,
  confirmCreateAllMissingTasks,
  confirmCreateTasks,
  confirmCreateTasksAndStay,
  confirmDelete: confirmDeleteEpisode,
  confirmDeleteAllTasks,
  confirmDeleteMetadata,
  deleteAllTasksLockText,
  deleteAllTasksText,
  deleteText,
  departmentFilter,
  descriptorToEdit,
  displaySettings,
  entityToDelete: episodeToDelete,
  entityToEdit: episodeToEdit,
  errors,
  hideAddThumbnailsModal,
  hideCreateTasksModal,
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
  setSearchFromUrl,
  showCreateTasksModal
} = useEntityPage({
  type,
  pageName: 'Episodes',
  listRef,
  searchFieldRef,
  reset
})

const showNewModal = () => onEditClicked()

const confirmEditEpisode = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (form.id) {
      await store.dispatch('editEpisode', form)
      applySearchFromUrl(false)
    } else {
      await store.dispatch('newEpisode', {
        ...form,
        project_id: currentProduction.value.id
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
  await store.dispatch('editEpisode', {
    id: entry.id,
    description: entry.description,
    [fieldName]: value
  })
  applySearchFromUrl(false)
}

// Watchers
// --------------------------------------------------------------------------

watch(currentProduction, () => {
  store.commit('SET_EPISODE_LIST_SCROLL_POSITION', 0)
  initialLoading.value = false
  reset()
})

watch(isEpisodesLoading, isLoading => {
  if (isLoading) return
  initialLoading.value = false
  nextTick(() => {
    setSearchFromUrl()
    onSearchChange()
  })
  setScrollPosition()
})

// Lifecycle
// --------------------------------------------------------------------------

store.dispatch('setLastProductionScreen', 'episodes')

onMounted(() => {
  setSearchFromUrl()
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
      setSearchFromUrl()
      onSearchChange()
      setScrollPosition()
      nextTick(() => {
        listRef.value?.selectTaskFromQuery()
      })
    }
  }

  if (
    episodeMap.value.size < 1 ||
    episodeValidationColumns.value.length === 0 ||
    episodeMap.value.values().next().value?.project_id !==
      currentProduction.value.id
  ) {
    store
      .dispatch('loadEpisodesWithTasks')
      .then(() => {
        setTimeout(finalize, 200)
      })
      .catch(console.error)
  } else {
    if (!isEpisodesLoading.value) initialLoading.value = false
    finalize()
  }
})

onBeforeUnmount(() => {
  store.dispatch('clearSelectedEpisodes')
})

// Head
// --------------------------------------------------------------------------

useHead({
  title: computed(
    () => `${currentProduction.value.name} ${t('episodes.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.page-header {
  margin-bottom: 1em;
}

.episodes {
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
