<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="edits page">
      <div class="edit-list-header page-header">
        <div class="flexrow">
          <search-field
            ref="edit-search-field"
            :can-save="true"
            :active="isSearchActive"
            @change="onSearchChange"
            @enter="(query) => isLongEditList
              ? applySearch(query)
              : saveEditSearch(query)"
            @save="saveSearchQuery"
            placeholder="ex: e01 edit=wip"
          />
          <button-simple
            class="flexrow-item"
            :title="$t('entities.build_filter.title')"
            icon="funnel"
            @click="() => modals.isBuildFilterDisplayed = true"
          />
          <combobox-department
            class="combobox-department flexrow-item"
            :selectable-departments="selectableDepartments('Edit')"
            :value="selectedDepartment"
            :dispay-all-and-my-departments="true"
            :width="230"
            rounded
            @input="onSelectedDepartment"
            v-model="selectedDepartment"
            v-if="departments.length > 0"
          />
          <div class="filler"></div>
          <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
            <show-assignations-button class="flexrow-item" />
            <show-infos-button class="flexrow-item" />
            <big-thumbnails-button class="flexrow-item" />
          </div>
          <div class="flexrow" v-if="isCurrentUserManager">
            <button-simple
              class="flexrow-item"
              :title="$t('entities.thumbnails.title')"
              icon="image"
              @click="showAddThumbnailsModal"
            />
            <button-simple
              class="flexrow-item"
              :title="$t('main.csv.import_file')"
              icon="upload"
              @click="showImportModal"
            />
            <button-simple
              class="flexrow-item"
              icon="download"
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
            @change-search="changeSearch"
            @remove-search="removeSearchQuery"
            v-if="!isEditsLoading && !initialLoading"
          />
        </div>
      </div>

      <sorting-info
        :label="$t('main.sorted_by')"
        :sorting="editSorting"
        @clear-sorting="onChangeSortClicked(null)"
        v-if="editSorting && editSorting.length > 0"
      />
      <edit-list
        ref="edit-list"
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
      />
    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="selectedTasks.values().next().value"
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
    :columns="columns"
    :dataMatchers="dataMatchers"
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
    :columns="columns"
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
    :is-loading-stay="loading.addMetadata"
    :is-error="errors.addMetadata"
    :descriptor-to-edit="descriptorToEdit"
    entity-type="Edit"
    @cancel="closeMetadataModal"
    @confirm="confirmAddMetadata"
  />

  <add-thumbnails-modal
    ref="add-thumbnails-modal"
    parent="edits"
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
import csv from '../../lib/csv'
import func from '../../lib/func'
import { sortByName } from '../../lib/sorting'
import stringHelpers from '../../lib/string'

import { searchMixin } from '../mixins/search'
import { entitiesMixin } from '../mixins/entities'

import AddMetadataModal from '../modals/AddMetadataModal'
import AddThumbnailsModal from '../modals/AddThumbnailsModal'
import BigThumbnailsButton from '../widgets/BigThumbnailsButton'
import BuildFilterModal from '../modals/BuildFilterModal'
import ButtonSimple from '../widgets/ButtonSimple'
import ComboboxDepartment from '../widgets/ComboboxDepartment'
import CreateTasksModal from '../modals/CreateTasksModal'
import DeleteModal from '../modals/DeleteModal'
import EditEditModal from '../modals/EditEditModal'
import ImportRenderModal from '../modals/ImportRenderModal'
import ImportModal from '../modals/ImportModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import SortingInfo from '../widgets/SortingInfo'
import ShowAssignationsButton from '../widgets/ShowAssignationsButton'
import ShowInfosButton from '../widgets/ShowInfosButton'
import EditHistoryModal from '../modals/EditHistoryModal'
import EditList from '../lists/EditList.vue'
import TaskInfo from '../sides/TaskInfo.vue'

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

  data () {
    return {
      initialLoading: true,
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      formData: null,
      isSearchActive: false,
      historyEdit: {},
      parsedCSV: [],
      editToDelete: null,
      editToEdit: null,
      taskTypeForTaskDeletion: null,
      selectedDepartment: 'ALL',
      departmentFilter: [],
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

  beforeDestroy () {
    this.clearSelectedEdits()
  },

  created () {
    this.setLastProductionScreen('edits')
  },

  mounted () {
    let searchQuery = ''
    if (this.editSearchText.length > 0) {
      this.searchField.setValue(this.editSearchText)
    }
    if (this.$route.query.search && this.$route.query.search.length > 0) {
      searchQuery = '' + this.$route.query.search
    }
    this.$refs['edit-list'].setScrollPosition(
      this.editListScrollPosition
    )
    this.onSearchChange()
    this.$refs['edit-list'].setScrollPosition(
      this.editListScrollPosition
    )
    const finalize = () => {
      if (this.$refs['edit-list']) {
        this.$refs['edit-search-field'].setValue(searchQuery)
        this.onSearchChange()
        this.$refs['edit-list'].setScrollPosition(
          this.editListScrollPosition
        )
      }
    }

    if (
      this.editMap.size < 2 ||
      (
        this.editValidationColumns.length > 0 &&
        !this.editMap.get(this.editMap.keys().next().value).validations
      )
    ) {
      setTimeout(() => {
        this.loadEdits()
          .then(() => {
            setTimeout(() => {
              this.initialLoading = false
              finalize()
            }, 500)
          })
      }, 0)
    } else {
      if (!this.isEditsLoading) this.initialLoading = false
      finalize()
    }
    if (!this.isCurrentUserManager && this.user.departments.length > 0) {
      this.selectedDepartment = 'MY_DEPARTMENTS'
      this.departmentFilter = this.user.departments
    } else {
      this.departmentFilter = []
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedEdits',
      'departments',
      'episodeMap',
      'episodes',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isEditDescription',
      'isEditEstimation',
      'isEditTime',
      'isEditsLoading',
      'isEditsLoadingError',
      'isShowAssignations',
      'isTVShow',
      'nbSelectedTasks',
      'openProductions',
      'selectedTasks',
      'isLongEditList',
      'editMap',
      'editFilledColumns',
      'editsCsvFormData',
      'editSearchQueries',
      'editSearchText',
      'editValidationColumns',
      'editListScrollPosition',
      'editSorting',
      'taskTypeMap',
      'user',
      'departmentMap'
    ]),

    searchField () {
      return this.$refs['edit-search-field']
    },

    addThumbnailsModal () {
      return this.$refs['add-thumbnails-modal']
    },

    columns () {
      const collection = [
        'Name',
        'Description'
      ]
      if (this.isTVShow) {
        collection.unshift('Episode')
      }
      return collection
    },

    dataMatchers () {
      const collection = [
        'Name'
      ]
      if (this.isTVShow) {
        collection.unshift('Episode')
      }
      return collection
    },

    filteredEdits () {
      return this.displayedEdits
    },

    metadataDescriptors () {
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

    confirmAddMetadata (form) {
      this.loading.addMetadata = true
      form.entity_type = 'Edit'
      this.addMetadataDescriptor(form)
        .then(() => {
          this.loading.addMetadata = false
          this.modals.isAddMetadataDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.addMetadata = false
          this.errors.addMetadata = true
        })
    },

    closeMetadataModal () {
      this.modals.isAddMetadataDisplayed = false
    },

    confirmDeleteMetadata () {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.loading.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.errors.deleteMetadata = true
          this.loading.deleteMetadata = false
        })
    },

    onAddMetadataClicked () {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked (descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onDeleteClicked (edit) {
      this.editToDelete = edit
      this.modals.isDeleteDisplayed = true
    },

    showNewModal () {
      this.editToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onEditClicked (edit) {
      this.editToEdit = edit
      this.modals.isNewDisplayed = true
    },

    onRestoreClicked (edit) {
      this.editToRestore = edit
      this.modals.isRestoreDisplayed = true
    },

    onEditMetadataClicked (descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmEditEdit (form) {
      let action = 'newEdit'
      this.loading.edit = true
      this.errors.edit = false
      if (this.editToEdit && this.editToEdit.id) {
        action = 'editEdit'
        form.id = this.editToEdit.id
      }
      this[action](form)
        .then((form) => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteAllTasks (selectionOnly) {
      const taskTypeId = this.taskTypeForTaskDeletion.id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllEditTasks({ projectId, taskTypeId, selectionOnly })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.modals.isDeleteAllTasksDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
    },

    confirmDeleteEdit () {
      this.loading.del = true
      this.errors.del = false
      this.deleteEdit(this.editToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.isDeleteDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.del = false
          this.errors.del = true
        })
    },

    confirmRestoreEdit () {
      this.loading.restore = true
      this.errors.restore = false
      this.restoreEdit(this.editToRestore)
        .then(() => {
          this.loading.restore = false
          this.modals.isRestoreDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.restore = false
          this.errors.restore = true
        })
    },

    confirmAddThumbnails (forms) {
      const addPreview = (form) => {
        this.addThumbnailsModal.markLoading(form.task.entity_id)
        return this.commentTaskWithPreview({
          taskId: form.task.id,
          commentText: '',
          taskStatusId: form.task.task_status_id,
          form: form
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
      func.runPromiseMapAsSeries(forms, addPreview)
        .then(() => {
          this.loading.addThumbnails = false
          this.modals.isAddThumbnailsDisplayed = false
        })
    },

    confirmCreateTasks ({ form, selectionOnly }) {
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

    confirmCreateTasksAndStay ({ form, selectionOnly }) {
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

    runTasksCreation (form, selectionOnly) {
      this.errors.creatingTasks = false
      return this.createTasks({
        type: 'edits',
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      })
    },

    reset () {
      this.initialLoading = true
      this.loadEdits((err) => {
        if (err) console.error(err)
        this.initialLoading = false
      })
    },

    resetEditModal () {
      const form = { name: '' }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.editToEdit = form
    },

    deleteText () {
      const edit = this.editToDelete
      if (
        edit &&
        (edit.canceled || !edit.tasks || edit.tasks.length === 0)
      ) {
        return this.$t('edits.delete_text', { name: edit.name })
      } else if (edit) {
        return this.$t('edits.cancel_text', { name: edit.name })
      } else {
        return ''
      }
    },

    deleteAllTasksText () {
      const taskType = this.taskTypeForTaskDeletion
      if (taskType) {
        return this.$t('tasks.delete_all_text', { name: taskType.name })
      } else {
        return ''
      }
    },

    restoreText () {
      const edit = this.editToRestore
      if (edit) {
        return this.$t('edits.restore_text', { name: edit.name })
      } else {
        return ''
      }
    },

    renderImport (data, mode) {
      this.loading.importing = true
      this.errors.importing = false
      this.formData = data
      if (mode === 'file') {
        data = data.get('file')
      }
      csv.processCSV(data)
        .then((results) => {
          this.parsedCSV = results
          this.hideImportModal()
          this.loading.importing = false
          this.showImportRenderModal()
        })
    },

    uploadImportFile (data, toUpdate) {
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
          this.loading.importing = false
          this.loadEpisodes()
            .catch(console.error)
          this.hideImportRenderModal()
          this.loadEdits()
        })
        .catch(err => {
          console.error(err)
          this.loading.importing = false
          this.loading.importingError = err
          this.errors.importing = true
        })
    },

    resetImport () {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('EDIT_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    onDeleteAllTasksClicked (taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    onSearchChange () {
      if (!this.searchField) return
      this.isSearchActive = false
      const searchQuery = this.searchField.getValue()
      if (searchQuery.length !== 1 && !this.isLongEditList) {
        this.applySearch(searchQuery)
      }
      if (searchQuery.length === 0 && this.isLongEditList) {
        this.applySearch('')
      }
    },

    saveScrollPosition (scrollPosition) {
      this.$store.commit(
        'SET_EDIT_LIST_SCROLL_POSITION',
        scrollPosition
      )
    },

    applySearch (searchQuery) {
      this.setEditSearch(searchQuery)
      this.setSearchInUrl()
      this.isSearchActive = true
    },

    saveSearchQuery (searchQuery) {
      this.saveEditSearch(searchQuery)
        .catch(console.error)
    },

    removeSearchQuery (searchQuery) {
      this.removeEditSearch(searchQuery)
        .catch(console.error)
    },

    getPath (section) {
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

    showEditHistoryModal (edit) {
      this.historyEdit = edit
      this.modals.isEditHistoryDisplayed = true
    },

    hideEditHistoryModal () {
      this.modals.isEditHistoryDisplayed = false
    },

    onExportClick () {
      this.getEditsCsvLines()
        .then((editLines) => {
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
            .forEach((descriptor) => {
              headers.push(descriptor.name)
            })
          if (this.isEditTime) {
            headers.push(this.$t('edits.fields.time_spent'))
          }
          if (this.isEditEstimation) {
            headers.push(this.$t('main.estimation_short'))
          }
          this.editValidationColumns
            .forEach((taskTypeId) => {
              headers.push(this.taskTypeMap.get(taskTypeId).name)
              headers.push('Assignations')
            })
          csv.buildCsvFile(name, [headers].concat(editLines))
        })
    },

    onChangeSortClicked (sortInfo) {
      this.changeEditSort(sortInfo)
    },

    confirmBuildFilter (query) {
      this.modals.isBuildFilterDisplayed = false
      this.$refs['edit-search-field'].setValue(query)
      this.applySearch(query)
    },

    onFieldChanged ({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        description: entry.description
      }
      data[fieldName] = value
      this.editEdit(data)
    },

    onMetadataChanged ({ entry, descriptor, value }) {
      const metadata = { ...entry.data }
      metadata[descriptor.field_name] = value
      const data = {
        id: entry.id,
        description: entry.description,
        data: metadata
      }
      this.editEdit(data)
    }
  },

  watch: {
    $route () {
      if (!this.$route.query) return
      const search = this.$route.query.search
      const actualSearch = this.$refs['edit-search-field'].getValue()
      if (search !== actualSearch) {
        this.searchField.setValue(search)
        this.applySearch(search)
      }
    },

    currentProduction () {
      this.$refs['edit-search-field'].setValue('')
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
      this.initialLoading = true
      if (!this.isTVShow) this.reset()
    },

    currentEpisode () {
      this.$refs['edit-search-field'].setValue('')
      this.$store.commit('SET_EDIT_LIST_SCROLL_POSITION', 0)
      if (this.isTVShow && this.currentEpisode) this.reset()
    },

    isEditsLoading () {
      if (!this.isEditsLoading) {
        let searchQuery = ''
        if (
          this.$route.query.search &&
          this.$route.query.search.length > 0
        ) {
          searchQuery = '' + this.$route.query.search
        }
        this.initialLoading = false
        this.$refs['edit-search-field'].setValue(searchQuery)
        this.$nextTick(() => {
          this.applySearch(searchQuery)
        })
        if (this.$refs['edit-list']) {
          this.$refs['edit-list'].setScrollPosition(
            this.editListScrollPosition
          )
        }
      }
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` - ${this.currentEpisode ? this.currentEpisode.name : ''}` +
               ` | ${this.$t('edits.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction.name} ${this.$t('edits.title')} - Kitsu`
      }
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

.main-column {
  border-right: 3px solid $light-grey;
}

.combobox-department {
  margin-bottom: 0px;
  padding-right: 20px;
}
</style>
