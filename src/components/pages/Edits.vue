<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="edits page">
        <div class="edit-list-header page-header">
          <div class="flexrow mb1">
            <search-field
              ref="edit-search-field"
              :can-save="true"
              @change="onSearchChange"
              @enter="applySearch(searchField.getValue())"
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
            <combobox-department
              class="combobox-department flexrow-item"
              :selectable-departments="selectableDepartments('Edit')"
              :display-all-and-my-departments="true"
              :width="230"
              rounded
              v-model="selectedDepartment"
              v-if="departments.length > 0"
            />
            <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
              <button-simple
                class="flexrow-item"
                icon="grid"
                :is-on="contactSheetMode"
                :title="$t('tasks.show_contact_sheet')"
                @click="contactSheetMode = !contactSheetMode"
              />
              <show-assignations-button class="flexrow-item" />
              <show-infos-button class="flexrow-item" />
              <big-thumbnails-button class="flexrow-item" />
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
                :text="$t('edits.new_edit')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>

          <div class="query-list">
            <search-query-list
              :queries="editSearchQueries"
              type="edit"
              @remove-search="removeSearchQuery"
              v-if="!isEditsLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :sorting="editSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="editSorting?.length"
        />
        <edit-list
          ref="edit-list"
          :contact-sheet-mode="contactSheetMode"
          :displayed-edits="displayedEdits"
          :is-loading="isEditsLoading || initialLoading"
          :is-error="isEditsLoadingError"
          :validation-columns="editValidationColumns"
          :department-filter="departmentFilter"
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
      :edit-to-edit="editToEdit"
      @cancel="modals.isNewDisplayed = false"
      @confirm="confirmEditEdit"
    />

    <delete-modal
      ref="delete-edit-modal"
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('edits.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteEdit"
    />

    <delete-modal
      ref="restore-edit-modal"
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="errors.restore"
      :text="restoreText()"
      :error-text="$t('edits.restore_error')"
      @cancel="modals.isRestoreDisplayed = false"
      @confirm="confirmRestoreEdit"
    />

    <delete-modal
      ref="delete-metadata-modal"
      :active="modals.isDeleteMetadataDisplayed"
      :is-loading="loading.deleteMetadata"
      :is-error="errors.deleteMetadata"
      @cancel="modals.isDeleteMetadataDisplayed = false"
      :text="$t('productions.metadata.delete_text')"
      :error-text="$t('productions.metadata.delete_error')"
      @confirm="confirmDeleteMetadata"
    />

    <hard-delete-modal
      ref="delete-all-tasks-modal"
      :active="modals.isDeleteAllTasksDisplayed"
      :is-loading="loading.deleteAllTasks"
      :is-error="errors.deleteAllTasks"
      :text="deleteAllTasksText()"
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
      :form-data="editsCsvFormData"
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="filteredEdits"
      @reupload="resetImport"
      @cancel="hideImportRenderModal"
      @confirm="uploadImportFile"
    />

    <import-modal
      ref="import-modal"
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :form-data="editsCsvFormData"
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
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_edit')"
      :text="$t('tasks.create_tasks_edit_explaination')"
      :error-text="$t('tasks.create_tasks_edit_failed')"
      @cancel="hideCreateTasksModal"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
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
      entity-type="Edit"
      :parent="isTVShow ? 'edits_tvshow' : 'edits'"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
    />

    <edit-history-modal
      :active="modals.isEditHistoryDisplayed"
      :edit="historyEdit"
      @cancel="hideEditHistoryModal"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      entity-type="edit"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import csv from '@/lib/csv'
import func from '@/lib/func'
import { sortByName } from '@/lib/sorting'
import stringHelpers from '@/lib/string'

import { searchMixin } from '@/components/mixins/search'
import { entitiesMixin } from '@/components/mixins/entities'

import AddMetadataModal from '@/components/modals/AddMetadataModal.vue'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal.vue'
import BigThumbnailsButton from '@/components/widgets/BigThumbnailsButton.vue'
import BuildFilterModal from '@/components/modals/BuildFilterModal.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import CreateTasksModal from '@/components/modals/CreateTasksModal.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditEditModal from '@/components/modals/EditEditModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
import ShowAssignationsButton from '@/components/widgets/ShowAssignationsButton.vue'
import ShowInfosButton from '@/components/widgets/ShowInfosButton.vue'
import EditHistoryModal from '@/components/modals/EditHistoryModal.vue'
import EditList from '@/components/lists/EditList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'edits',

  mixins: [searchMixin, entitiesMixin],

  components: {
    AddMetadataModal,
    AddThumbnailsModal,
    BigThumbnailsButton,
    BuildFilterModal,
    ButtonSimple,
    ComboboxDepartment,
    CreateTasksModal,
    DeleteModal,
    EditEditModal,
    ImportModal,
    HardDeleteModal,
    ImportRenderModal,
    SearchField,
    SearchQueryList,
    SortingInfo,
    EditHistoryModal,
    ShowAssignationsButton,
    ShowInfosButton,
    EditList,
    TaskInfo
  },

  data() {
    return {
      type: 'edit',
      contactSheetMode: false,
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      departmentFilter: [],
      editToDelete: null,
      editToEdit: null,
      editToRestore: null,
      formData: null,
      genericColumns: [
        'Metadata column name (text value)',
        'Task type name (task status name value)',
        'Task type name + comment (text value)'
      ],
      historyEdit: {},
      initialLoading: true,
      optionalColumns: ['Description'],
      pageName: 'Edits',
      parsedCSV: [],
      selectedDepartment: 'ALL',
      taskTypeForTaskDeletion: null,
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isBuildFilterDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isImportRenderDisplayed: false,
        isImportDisplayed: false,
        isNewDisplayed: false,
        isRestoreDisplayed: false,
        isEditHistoryDisplayed: false
      },
      loading: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        creatingTasksStay: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        edit: false,
        del: false,
        importing: false,
        restore: false,
        savingSearch: false,
        stay: false
      },
      errors: {
        addMetadata: false,
        deleteMetadata: false,
        creatingTasks: false,
        deleteAllTasks: false,
        importing: false,
        importingError: null
      }
    }
  },

  beforeUnmount() {
    this.clearSelectedEdits()
  },

  created() {
    this.setLastProductionScreen('edits')
  },

  mounted() {
    if (this.editSearchText.length > 0) {
      this.$refs['edit-search-field']?.setValue(this.editSearchText)
    }
    this.$refs['edit-list']?.setScrollPosition(this.editListScrollPosition)
    const finalize = () => {
      if (this.$refs['edit-list']) {
        this.applySearchFromUrl()
        this.$refs['edit-list'].setScrollPosition(this.editListScrollPosition)
        this.$refs['edit-list'].selectTaskFromQuery()
      }
    }

    if (
      this.editMap.size < 2 ||
      (this.editValidationColumns.length > 0 &&
        !this.editMap.get(this.editMap.keys().next().value).validations)
    ) {
      setTimeout(() => {
        this.loadEdits().then(() => {
          setTimeout(() => {
            this.initialLoading = false
            finalize()
          }, 200)
        })
      }, 0)
    } else {
      if (!this.isEditsLoading) this.initialLoading = false
      finalize()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedEdits',
      'departmentMap',
      'departments',
      'editMap',
      'editFilledColumns',
      'editsCsvFormData',
      'editSearchQueries',
      'editSearchText',
      'editValidationColumns',
      'editListScrollPosition',
      'editSorting',
      'episodeMap',
      'episodes',
      'openProductions',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isEditDescription',
      'isEditEstimation',
      'isEditTime',
      'isEditsLoading',
      'isEditsLoadingError',
      'isLongEditList',
      'isShowAssignations',
      'isTVShow',
      'productionEditTaskTypes',
      'selectedEdits',
      'taskTypeMap',
      'user'
    ]),

    searchField() {
      return this.$refs['edit-search-field']
    },

    addThumbnailsModal() {
      return this.$refs['add-thumbnails-modal']
    },

    renderColumns() {
      const collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionEditTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(`${item.name} comment`)
      })
      return collection
    },

    dataMatchers() {
      return this.isTVShow ? ['Episode', 'Name'] : ['Name']
    },

    filteredEdits() {
      const edits = {}
      this.displayedEdits.forEach(edit => {
        let editKey = ''
        if (
          this.isTVShow &&
          edit.episode_id &&
          this.episodeMap.has(edit.episode_id)
        ) {
          editKey += this.episodeMap.get(edit.episode_id).name
        }
        editKey += `${edit.name}`
        edits[editKey] = true
      })
      return edits
    },

    metadataDescriptors() {
      return this.editMetadataDescriptors
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'createTasks',
      'changeEditSort',
      'clearSelectedEdits',
      'commentTaskWithPreview',
      'deleteAllEditTasks',
      'deleteEdit',
      'deleteMetadataDescriptor',
      'editEdit',
      'getEditsCsvLines',
      'hideAssignations',
      'loadEpisodes',
      'loadEdits',
      'newEdit',
      'removeEditSearch',
      'restoreEdit',
      'saveEditSearch',
      'setLastProductionScreen',
      'setPreview',
      'setEditSearch',
      'showAssignations',
      'uploadEditFile'
    ]),

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = 'Edit'
      this.addMetadataDescriptor(form)
        .then(() => {
          this.loading.addMetadata = false
          this.modals.isAddMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.addMetadata = false
          this.errors.addMetadata = true
        })
    },

    closeMetadataModal() {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmDeleteMetadata() {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.loading.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteMetadata = true
          this.loading.deleteMetadata = false
        })
    },

    onAddMetadataClicked() {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked(descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onDeleteClicked(edit) {
      this.editToDelete = edit
      this.modals.isDeleteDisplayed = true
    },

    showNewModal() {
      this.editToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onEditClicked(edit) {
      this.editToEdit = edit
      this.modals.isNewDisplayed = true
    },

    onRestoreClicked(edit) {
      this.editToRestore = edit
      this.modals.isRestoreDisplayed = true
    },

    onEditMetadataClicked(descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmEditEdit(form) {
      let action = 'newEdit'
      this.loading.edit = true
      this.errors.edit = false
      if (this.editToEdit && this.editToEdit.id) {
        action = 'editEdit'
        form.id = this.editToEdit.id
      }
      this[action](form)
        .then(form => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
          this.applySearchFromUrl()
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteAllTasks(selectionOnly) {
      const taskTypeId = this.taskTypeForTaskDeletion.id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllEditTasks({ projectId, taskTypeId, selectionOnly })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.modals.isDeleteAllTasksDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
    },

    confirmDeleteEdit() {
      this.loading.del = true
      this.errors.del = false
      this.deleteEdit(this.editToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.isDeleteDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    confirmRestoreEdit() {
      this.loading.restore = true
      this.errors.restore = false
      this.restoreEdit(this.editToRestore)
        .then(() => {
          this.loading.restore = false
          this.modals.isRestoreDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.restore = false
          this.errors.restore = true
        })
    },

    confirmAddThumbnails(forms) {
      const addPreview = form => {
        this.addThumbnailsModal.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form
        })
          .then(({ newComment, preview }) => {
            return this.setPreview({
              taskId: form.task.id,
              entityId: form.task.entity_id,
              previewId: preview.id
            })
          })
          .then(() => {
            this.addThumbnailsModal.markUploaded(form.task.entity_id)
            return Promise.resolve()
          })
      }
      this.loading.addThumbnails = true
      func.runPromiseMapAsSeries(forms, addPreview).then(() => {
        this.loading.addThumbnails = false
        this.modals.isAddThumbnailsDisplayed = false
      })
    },

    confirmCreateTasks({ form, selectionOnly }) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, selectionOnly)
        .then(() => {
          this.reset()
          this.hideCreateTasksModal()
          this.loading.creatingTasks = false
        })
        .catch(err => {
          this.errors.creatingTasks = true
          console.error(err)
        })
    },

    confirmCreateTasksAndStay({ form, selectionOnly }) {
      this.loading.creatingTasksStay = true
      this.runTasksCreation(form, selectionOnly)
        .then(() => {
          this.reset()
          this.loading.creatingTasksStay = false
        })
        .catch(err => {
          this.errors.creatingTasks = true
          console.error(err)
        })
    },

    runTasksCreation(form, selectionOnly) {
      this.errors.creatingTasks = false
      return this.createTasks({
        type: 'edits',
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      })
    },

    reset() {
      this.initialLoading = true
      this.loadEdits(err => {
        if (err) console.error(err)
        this.initialLoading = false
      })
    },

    resetEditModal() {
      const form = { name: '' }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.editToEdit = form
    },

    deleteText() {
      const edit = this.editToDelete
      if (edit && (edit.canceled || !edit.tasks || edit.tasks.length === 0)) {
        return this.$t('edits.delete_text', { name: edit.name })
      } else if (edit) {
        return this.$t('edits.cancel_text', { name: edit.name })
      }
      return ''
    },

    deleteAllTasksText() {
      const taskType = this.taskTypeForTaskDeletion
      if (taskType) {
        return this.$t('tasks.delete_all_text', { name: taskType.name })
      }
      return ''
    },

    restoreText() {
      const edit = this.editToRestore
      if (edit) {
        return this.$t('edits.restore_text', { name: edit.name })
      }
      return ''
    },

    renderImport(data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      this.formData = data
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data).then(results => {
        this.parsedCSV = results
        this.hideImportModal()
        this.loading.importing = false
        this.showImportRenderModal()
      })
    },

    uploadImportFile(data, toUpdate) {
      const formData = new FormData()
      const filename = 'import.csv'
      const csvContent = csv.turnEntriesToCsvString(data)
      const file = new File([csvContent], filename, { type: 'text/csv' })

      formData.append('file', file)

      this.loading.importing = true
      this.errors.importing = false
      this.$store.commit('EDIT_CSV_FILE_SELECTED', formData)

      this.uploadEditFile(toUpdate)
        .then(() => {
          this.loadEpisodes().catch(console.error)
          this.hideImportRenderModal()
          this.loadEdits()
        })
        .catch(err => {
          console.error(err)
          this.loading.importingError = err
          this.errors.importing = true
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    resetImport() {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('EDIT_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    onDeleteAllTasksClicked(taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    onSearchChange(clearSelection = true) {
      if (!this.searchField) return
      const searchQuery = this.searchField.getValue() || ''
      this.setSearchInUrl()
      if (searchQuery.length !== 1 && !this.isLongEditList) {
        this.applySearch(searchQuery)
      }
      if (clearSelection) {
        this.clearSelection()
      }
    },

    saveScrollPosition(scrollPosition) {
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', scrollPosition)
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveEditSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeEditSearch(searchQuery).catch(console.error)
    },

    getPath(section) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
        }
      }
      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }
      return route
    },

    showEditHistoryModal(edit) {
      this.historyEdit = edit
      this.modals.isEditHistoryDisplayed = true
    },

    hideEditHistoryModal() {
      this.modals.isEditHistoryDisplayed = false
    },

    onExportClick() {
      this.getEditsCsvLines().then(editLines => {
        const nameData = [
          moment().format('YYYY-MM-DD'),
          'kitsu',
          this.currentProduction.name,
          this.$t('edits.title')
        ]
        if (this.currentEpisode) {
          nameData.splice(3, 0, this.currentEpisode.name)
        }
        const name = stringHelpers.slugify(nameData.join('_'))
        const headers = [
          this.$t('edits.fields.name'),
          this.$t('edits.fields.description')
        ]
        if (this.currentEpisode) {
          headers.splice(0, 0, 'Episode')
        }
        sortByName([...this.currentProduction.descriptors])
          .filter(d => d.entity_type === 'Edit')
          .forEach(descriptor => {
            headers.push(descriptor.name)
          })
        if (this.isEditTime) {
          headers.push(this.$t('edits.fields.time_spent'))
        }
        if (this.isEditEstimation) {
          headers.push(this.$t('main.estimation_short'))
        }
        this.editValidationColumns.forEach(taskTypeId => {
          headers.push(this.taskTypeMap.get(taskTypeId).name)
          headers.push('Assignations')
        })
        csv.buildCsvFile(name, [headers].concat(editLines))
      })
    },

    onChangeSortClicked(sortInfo) {
      this.changeEditSort(sortInfo)
    },

    async onFieldChanged({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        description: entry.description,
        [fieldName]: value
      }
      await this.editEdit(data)
      this.applySearchFromUrl()
    },

    async onMetadataChanged({ entry, descriptor, value }) {
      const data = {
        id: entry.id,
        data: {
          [descriptor.field_name]: value
        }
      }
      await this.editEdit(data)
      this.applySearchFromUrl()
    }
  },

  watch: {
    currentProduction() {
      this.$refs['edit-search-field']?.setValue('')
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
      this.initialLoading = true
      if (!this.isTVShow) this.reset()
    },

    currentEpisode() {
      this.$refs['edit-search-field']?.setValue('')
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
      if (this.isTVShow && this.currentEpisode) this.reset()
    },

    currentSection() {
      if (
        (this.isTVShow && this.edits.length === 0) ||
        this.edits[0].episode_id !== this.currentEpisode.id
      ) {
        this.$refs['edit-search-field'].setValue('')
        this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
        this.reset()
      }
    },

    isEditsLoading() {
      if (!this.isEditsLoading) {
        let searchQuery = ''
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          searchQuery = `${this.$route.query.search}`
        }
        this.initialLoading = false
        this.$refs['edit-search-field'].setValue(searchQuery)
        this.$nextTick(() => {
          this.applySearch(searchQuery)
        })
        if (this.$refs['edit-list']) {
          this.$refs['edit-list'].setScrollPosition(this.editListScrollPosition)
        }
      }
    }
  },

  head() {
    if (this.isTVShow) {
      return {
        title: `${
          this.currentProduction ? this.currentProduction.name : ''
        } - ${
          this.currentEpisode
            ? this.currentEpisode.name || this.$t('main.all')
            : ''
        } | ${this.$t('edits.title')} - Kitsu`
      }
    }
    return {
      title: `${this.currentProduction.name} ${this.$t('edits.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.page-header {
  margin-bottom: 1em;
}

.level {
  align-items: flex-start;
}

.flexcolumn {
  align-items: flex-start;
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
