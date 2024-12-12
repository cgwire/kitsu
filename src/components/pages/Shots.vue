<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="shots page">
        <div class="shot-list-header page-header">
          <div class="flexrow mb1">
            <search-field
              ref="shot-search-field"
              :can-save="true"
              :active="isSearchActive"
              @change="onSearchChange"
              @enter="applySearch(searchField.getValue())"
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
            <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Shot')"
                :display-all-and-my-departments="true"
                rounded
                v-model="selectedDepartment"
                v-if="departments.length > 0"
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
                :text="$t('shots.manage')"
                icon="plus"
                @click="showManageShots"
              />
            </div>
          </div>

          <div class="query-list">
            <search-query-list
              :groups="shotSearchFilterGroups"
              :is-group-enabled="true"
              :queries="shotSearchQueries"
              type="shot"
              @change-search="changeSearch"
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
          :displayed-shots="displayedShotsBySequence"
          :is-loading="isShotsLoading || initialLoading"
          :is-error="isShotsLoadingError"
          :validation-columns="shotValidationColumns"
          :department-filter="departmentFilter"
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
      ref="delete-shot-modal"
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText()"
      :error-text="$t('shots.delete_error')"
      @cancel="modals.isDeleteDisplayed = false"
      @confirm="confirmDeleteShot"
    />

    <delete-modal
      ref="restore-shot-modal"
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="errors.restore"
      :text="restoreText()"
      :error-text="$t('shots.restore_error')"
      @cancel="modals.isRestoreDisplayed = false"
      @confirm="confirmRestoreShot"
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
      :form-data="shotsCsvFormData"
      :columns="renderColumns"
      :data-matchers="dataMatchers"
      :database="filteredShots"
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
      ref="import-edl-modal"
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
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_shot')"
      :text="$t('tasks.create_tasks_shot_explaination')"
      :error-text="$t('tasks.create_tasks_shot_failed')"
      @cancel="hideCreateTasksModal"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
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
      ref="add-thumbnails-modal"
      entity-type="Shot"
      parent="shots"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @cancel="hideAddThumbnailsModal"
      @confirm="confirmAddThumbnails"
    />

    <shot-history-modal
      :active="modals.isShotHistoryDisplayed"
      :shot="historyShot"
      @cancel="hideShotHistoryModal"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      entity-type="shot"
      @cancel="modals.isBuildFilterDisplayed = false"
      @confirm="confirmBuildFilter"
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'

import shotStore from '@/store/modules/shots'

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
import EditShotModal from '@/components/modals/EditShotModal.vue'
import ImportRenderModal from '@/components/modals/ImportRenderModal.vue'
import ImportModal from '@/components/modals/ImportModal.vue'
import ImportEdlModal from '@/components/modals/ImportEdlModal.vue'
import InfoQuestionMark from '@/components/widgets/InfoQuestionMark.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import ManageShotsModal from '@/components/modals/ManageShotsModal.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import SetFramesFromTaskTypePreviewsModal from '@/components/modals/SetFramesFromTaskTypePreviewsModal.vue'
import SortingInfo from '@/components/widgets/SortingInfo.vue'
import ShowAssignationsButton from '@/components/widgets/ShowAssignationsButton.vue'
import ShowInfosButton from '@/components/widgets/ShowInfosButton.vue'
import ShotHistoryModal from '@/components/modals/ShotHistoryModal.vue'
import ShotList from '@/components/lists/ShotList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'shots',

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
    EditShotModal,
    ImportModal,
    ImportEdlModal,
    HardDeleteModal,
    ManageShotsModal,
    ImportRenderModal,
    InfoQuestionMark,
    SearchField,
    SearchQueryList,
    SetFramesFromTaskTypePreviewsModal,
    SortingInfo,
    ShotHistoryModal,
    ShowAssignationsButton,
    ShowInfosButton,
    ShotList,
    TaskInfo
  },

  data() {
    return {
      type: 'shot',
      initialLoading: true,
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      formData: null,
      isSearchActive: false,
      historyShot: {},
      optionalColumns: [
        'Description',
        'Nb Frames',
        'Frame In',
        'Frame Out',
        'FPS'
      ],
      genericColumns: [
        'Metadata column name (text value)',
        'Task type name (task status name value)',
        'Task type name + comment (text value)'
      ],
      parsedCSV: [],
      selectedDepartment: 'ALL',
      shotToDelete: null,
      shotToEdit: null,
      shotToRestore: null,
      taskTypeForTaskDeletion: null,
      departmentFilter: [],
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isBuildFilterDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isSetFramesDisplayed: false,
        isImportRenderDisplayed: false,
        isImportDisplayed: false,
        isEDLImportDisplayed: false,
        isManageDisplayed: false,
        isNewDisplayed: false,
        isRestoreDisplayed: false,
        isShotHistoryDisplayed: false
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
        getFrames: false,
        importing: false,
        restore: false,
        savingSearch: false,
        stay: false
      },
      pageName: 'Shots',
      errors: {
        addMetadata: false,
        deleteMetadata: false,
        creatingTasks: false,
        deleteAllTasks: false,
        getFrames: false,
        importing: false,
        importingError: null
      }
    }
  },

  beforeUnmount() {
    this.clearSelectedShots()
  },

  mounted() {
    let searchQuery = ''
    if (this.$route.query.search && this.$route.query.search.length > 0) {
      searchQuery = `${this.$route.query.search}`
    }
    this.$refs['shot-search-field']?.setValue(searchQuery)
    const finalize = () => {
      this.$nextTick(() => {
        // Needed to be sure the current production is set
        this.loadShots(() => {
          this.$nextTick(() => {
            // Needed to be sure the shots are loaded
            this.onSearchChange()
            this.$nextTick(() => {
              this.$refs['shot-list']?.selectTaskFromQuery()
            })
          })
        })
      })
    }

    if (
      this.shotMap.size < 2 ||
      (this.shotValidationColumns.length > 0 &&
        (!this.shotMap.get(this.shotMap.keys().next().value) ||
          !this.shotMap.get(this.shotMap.keys().next().value).validations))
    ) {
      if (
        this.currentProduction &&
        this.episodes.length > 0 &&
        this.episodes[0].project_id !== this.currentProduction.id
      ) {
        this.loadEpisodes()
          .then(() => finalize())
          .catch(console.error)
      } else {
        finalize()
      }
    } else {
      if (!this.isShotsLoading) this.initialLoading = false
      this.onSearchChange()
      this.$refs['shot-list'].setScrollPosition(this.shotListScrollPosition)
      this.$nextTick(() => {
        this.$refs['shot-list']?.selectTaskFromQuery()
      })
      this.reloadEpisodeShotsIfNeeded()
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'currentSection',
      'departmentMap',
      'displayedSequences',
      'displayedShots',
      'displayedShotsBySequence',
      'episodeMap',
      'episodes',
      'departments',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isFrames',
      'isFrameIn',
      'isFrameOut',
      'isFps',
      'isLongShotList',
      'isMaxRetakes',
      'isResolution',
      'isShotDescription',
      'isShotEstimation',
      'isShotTime',
      'isShotsLoading',
      'isShotsLoadingError',
      'isShowAssignations',
      'isTVShow',
      'openProductions',
      'productionShotTaskTypes',
      'selectedShots',
      'sequences',
      'shotFilledColumns',
      'shotsCsvFormData',
      'shotSearchQueries',
      'shotSearchText',
      'shotSearchFilterGroups',
      'shotsPath',
      'shotValidationColumns',
      'shotListScrollPosition',
      'shotSorting',
      'taskTypeMap',
      'user'
    ]),

    shotMap() {
      return shotStore.cache.shotMap
    },

    searchField() {
      return this.$refs['shot-search-field']
    },

    addThumbnailsModal() {
      return this.$refs['add-thumbnails-modal']
    },

    renderColumns() {
      const collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionShotTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(`${item.name} comment`)
      })

      return collection
    },

    dataMatchers() {
      return this.isTVShow
        ? ['Episode', 'Sequence', 'Name']
        : ['Sequence', 'Name']
    },

    filteredShots() {
      const shots = {}
      this.displayedShotsBySequence.forEach(sequence => {
        sequence.forEach(item => {
          let shotKey = `${item.sequence_name}${item.name}`
          if (this.isTVShow) {
            shotKey = item.episode_name + shotKey
          }
          shots[shotKey] = true
        })
      })
      return shots
    },

    metadataDescriptors() {
      return this.shotMetadataDescriptors
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'createTasks',
      'changeShotSort',
      'clearSelectedShots',
      'clearSelectedTasks',
      'commentTaskWithPreview',
      'deleteAllShotTasks',
      'deleteShot',
      'deleteMetadataDescriptor',
      'editShot',
      'getShotsCsvLines',
      'hideAssignations',
      'loadEpisodes',
      'loadShots',
      'setNbFramesFromTaskTypePreviews',
      'newEpisode',
      'newSequence',
      'newShot',
      'removeShotSearch',
      'restoreShot',
      'saveShotSearch',
      'setLastProductionScreen',
      'setPreview',
      'setShotSearch',
      'showAssignations',
      'uploadShotFile',
      'uploadEdlFile'
    ]),

    reloadEpisodeShotsIfNeeded() {
      if (
        (this.isTVShow && this.displayedSequences.length === 0) ||
        this.displayedSequences[0]?.episode_id !== this.currentEpisode?.id ||
        this.displayedShots[0]?.episode_id !== this.currentEpisode?.id
      ) {
        this.$refs['shot-search-field'].setValue('')
        this.$store.commit('SET_SHOT_LIST_SCROLL_POSITION', 0)
        this.initialLoading = true
        this.loadShots(() => {
          this.initialLoading = false
          this.setSearchFromUrl()
          this.onSearchChange()
        })
      }
    },

    addEpisode(episode, callback) {
      this.newEpisode(episode).then(callback).catch(console.error)
    },

    addSequence(sequence, callback) {
      this.newSequence(sequence).then(callback).catch(console.error)
    },

    addShot(shot, callback) {
      this.newShot(shot).then(callback).catch(console.error)
    },

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = 'Shot'
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

    onDeleteClicked(shot) {
      this.shotToDelete = shot
      this.modals.isDeleteDisplayed = true
    },

    onEditClicked(shot) {
      this.shotToEdit = shot
      this.modals.isNewDisplayed = true
    },

    onRestoreClicked(shot) {
      this.shotToRestore = shot
      this.modals.isRestoreDisplayed = true
    },

    onEditMetadataClicked(descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    confirmEditShot(form) {
      form.id = this.shotToEdit.id
      form.data.resolution = form.resolution
      form.data.max_retakes = form.max_retakes
      form.data.frame_in = form.frameIn
      form.data.frame_out = form.frameOut
      form.data.fps = form.fps
      this.loading.edit = true
      this.errors.edit = false
      this.editShot(form)
        .then(() => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
          this.onSearchChange(false)
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
      this.deleteAllShotTasks({ projectId, taskTypeId, selectionOnly })
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

    confirmDeleteShot() {
      this.loading.del = true
      this.errors.del = false
      this.deleteShot(this.shotToDelete)
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

    confirmRestoreShot() {
      this.loading.restore = true
      this.errors.restore = false
      this.restoreShot(this.shotToRestore)
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
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        type: 'shots',
        selectionOnly
      })
    },

    reset() {
      this.initialLoading = true
      this.loadShots(err => {
        if (err) console.error(err)
        this.initialLoading = false
      })
    },

    resetEditModal() {
      const form = { name: '' }
      if (this.sequences.length > 0) {
        form.sequence_id = this.sequences[0].id
      }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
      this.shotToEdit = form
    },

    deleteText() {
      const shot = this.shotToDelete
      if (shot && (shot.canceled || !shot.tasks || shot.tasks.length === 0)) {
        return this.$t('shots.delete_text', { name: shot.name })
      } else if (shot) {
        return this.$t('shots.cancel_text', { name: shot.name })
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
      const shot = this.shotToRestore
      if (shot) {
        return this.$t('shots.restore_text', { name: shot.name })
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
      this.errors.importingError = null
      this.$store.commit('SHOT_CSV_FILE_SELECTED', formData)

      this.uploadShotFile(toUpdate)
        .then(() => {
          this.loadEpisodes().catch(console.error)
          this.hideImportRenderModal()
          this.loadShots()
        })
        .catch(err => {
          console.error(err)
          this.errors.importingError = err
          this.errors.importing = true
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    resetImport() {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('SHOT_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    onDeleteAllTasksClicked(taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    onSequenceClicked(sequenceName) {
      this.searchField.setValue(`${this.shotSearchText} ${sequenceName}`)
      this.onSearchChange()
    },

    onSearchChange(clearSelection = true) {
      if (!this.searchField) return
      this.isSearchActive = false
      const searchQuery = this.searchField.getValue() || ''
      if (searchQuery.length !== 1 && !this.isLongShotList) {
        this.applySearch(searchQuery)
      } else if (searchQuery.length === 0 && this.isLongShotList) {
        this.applySearch('')
      } else {
        this.setSearchInUrl()
      }
      if (clearSelection) {
        this.clearSelection()
      }
    },

    saveScrollPosition(scrollPosition) {
      this.$store.commit('SET_SHOT_LIST_SCROLL_POSITION', scrollPosition)
    },

    applySearch(searchQuery) {
      this.setShotSearch(searchQuery)
      this.setSearchInUrl()
      this.isSearchActive = true
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveShotSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeShotSearch(searchQuery).catch(console.error)
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

    showManageShots() {
      this.modals.isManageDisplayed = true
    },

    hideManageShots() {
      this.modals.isManageDisplayed = false
    },

    showShotHistoryModal(shot) {
      this.historyShot = shot
      this.modals.isShotHistoryDisplayed = true
    },

    hideShotHistoryModal() {
      this.modals.isShotHistoryDisplayed = false
    },

    onExportClick() {
      this.getShotsCsvLines().then(shotLines => {
        const nameData = [
          moment().format('YYYY-MM-DD'),
          'kitsu',
          this.currentProduction.name,
          this.$t('shots.title')
        ]
        if (this.currentEpisode) {
          nameData.splice(3, 0, this.currentEpisode.name)
        }
        const name = stringHelpers.slugify(nameData.join('_'))
        const headers = [
          this.$t('shots.fields.sequence'),
          this.$t('shots.fields.name'),
          this.$t('shots.fields.description')
        ]
        if (this.currentEpisode) {
          headers.splice(0, 0, 'Episode')
        }
        sortByName([...this.currentProduction.descriptors])
          .filter(d => d.entity_type === 'Shot')
          .forEach(descriptor => {
            headers.push(descriptor.name)
          })
        if (this.isShotTime) {
          headers.push(this.$t('shots.fields.time_spent'))
        }
        if (this.isShotEstimation) {
          headers.push(this.$t('main.estimation_short'))
        }
        if (this.isFrames) {
          headers.push(this.$t('main.frames'))
        }
        if (this.isFrameIn) {
          headers.push(this.$t('main.frame_in'))
        }
        if (this.isFrameOut) {
          headers.push(this.$t('main.frame_out'))
        }
        if (this.isFps) {
          headers.push(this.$t('main.fps'))
        }
        if (this.isResolution) {
          headers.push(this.$t('shots.fields.resolution'))
        }
        if (this.isMaxRetakes) {
          headers.push(this.$t('shots.fields.max_retakes'))
        }
        this.shotValidationColumns.forEach(taskTypeId => {
          headers.push(this.taskTypeMap.get(taskTypeId).name)
          headers.push('Assignations')
        })
        csv.buildCsvFile(name, [headers].concat(shotLines))
      })
    },

    onChangeSortClicked(sortInfo) {
      this.changeShotSort(sortInfo)
    },

    confirmBuildFilter(query) {
      this.modals.isBuildFilterDisplayed = false
      this.$refs['shot-search-field'].setValue(query)
      this.applySearch(query)
    },

    async onFieldChanged({ entry, fieldName, value }) {
      const data = {
        id: entry.id,
        nb_frames: entry.nb_frames,
        description: entry.description
      }
      data[fieldName] = value
      await this.editShot(data)
      this.onSearchChange(false)
    },

    async onMetadataChanged({ entry, descriptor, value }) {
      const data = {
        id: entry.id,
        data: {
          [descriptor.field_name]: value
        }
      }
      const shot = this.shotMap.get(entry.id)
      if (
        descriptor.field_name === 'frame_in' &&
        shot.data?.frame_out &&
        parseInt(shot.data.frame_out) > parseInt(value)
      ) {
        data.nb_frames = parseInt(shot.data.frame_out) - parseInt(value) + 1
      }
      if (
        descriptor.field_name === 'frame_out' &&
        shot.data?.frame_in &&
        parseInt(shot.data.frame_in) < parseInt(value)
      ) {
        data.nb_frames = parseInt(value) - parseInt(shot.data.frame_in) + 1
      }
      await this.editShot(data)
      this.onSearchChange(false)
    },

    showEDLImportModal() {
      this.modals.isEDLImportDisplayed = true
    },

    hideEDLImportModal() {
      this.modals.isEDLImportDisplayed = false
    },

    uploadEDLFile(edl_file, namingConvention, matchCase) {
      this.loading.importing = true
      this.errors.importing = false
      this.errors.importingError = null

      this.uploadEdlFile({ edl_file, namingConvention, matchCase })
        .then(() => {
          this.loadEpisodes().catch(console.error)
          this.hideEDLImportModal()
          this.loadShots()
        })
        .catch(err => {
          console.error(err)
          this.errors.importingError = err
          this.errors.importing = true
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    async confirmSetFrames(taskTypeId) {
      this.loading.getFrames = true
      try {
        await this.setNbFramesFromTaskTypePreviews({
          taskTypeId,
          productionId: this.currentProduction.id,
          episodeId: this.currentEpisode ? this.currentEpisode.id : null
        })
        this.modals.isSetFramesDisplayed = false
      } catch (err) {
        console.error(err)
        this.errors.getFrames = true
      } finally {
        this.loading.getFrames = false
      }
    }
  },

  watch: {
    $route() {
      if (!this.$route.query) return
      const search = this.$route.query.search
      const actualSearch = this.$refs['shot-search-field']?.getValue()
      if (search !== actualSearch) {
        this.searchField.setValue(search)
        this.applySearch(search)
      }
    },

    currentSection() {
      this.reloadEpisodeShotsIfNeeded()
    },

    currentProduction() {
      this.$refs['shot-search-field']?.setValue('')
      this.$store.commit('SET_SHOT_LIST_SCROLL_POSITION', 0)

      this.initialLoading = true
      if (!this.isTVShow) {
        this.loadShots(() => {
          this.initialLoading = false
          this.setSearchFromUrl()
          this.onSearchChange()
        })
      }
    },

    currentEpisode() {
      const finalize = () => {
        this.initialLoading = true
        this.loadShots(() => {
          this.setSearchFromUrl()
          this.onSearchChange()
          this.initialLoading = false
        })
      }
      if (this.isTVShow && this.currentEpisode) {
        if (
          this.currentProduction &&
          this.episodes.length > 0 &&
          this.episodes[0].project_id !== this.currentProduction.id
        ) {
          this.loadEpisodes()
            .then(() => finalize())
            .catch(console.error)
        } else {
          finalize()
        }
      }
    },

    isShotsLoading() {
      if (!this.isShotsLoading) {
        let searchQuery = ''
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          searchQuery = `${this.$route.query.search}`
        }
        this.initialLoading = false
        this.$refs['shot-search-field'].setValue(searchQuery)
        this.$nextTick(() => {
          this.applySearch(searchQuery)
        })
        if (this.$refs['shot-list']) {
          this.$refs['shot-list'].setScrollPosition(this.shotListScrollPosition)
        }
      }
    }
  },

  head() {
    if (this.isTVShow) {
      return {
        title:
          `${this.currentProduction?.name || ''}` +
          ` - ${this.currentEpisode?.name || ''}` +
          ` | ${this.$t('shots.title')} - Kitsu`
      }
    }
    if (!this.currentProduction) {
      return {
        title: `${this.$t('shots.title')} - Kitsu`
      }
    }
    return {
      title: `${this.currentProduction.name} | ${this.$t('shots.title')} - Kitsu`
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
