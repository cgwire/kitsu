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
            <div class="flexrow flexrow-item" v-if="!isCurrentUserClient">
              <combobox-department
                class="combobox-department flexrow-item"
                :selectable-departments="selectableDepartments('Asset')"
                :dispay-all-and-my-departments="true"
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
                :text="$t('assets.new_asset')"
                icon="plus"
                @click="showNewModal"
              />
            </div>
          </div>
          <div class="query-list">
            <search-query-list
              :groups="assetSearchFilterGroups"
              :is-group-enabled="true"
              :queries="assetSearchQueries"
              type="asset"
              @change-search="changeSearch"
              @remove-search="removeSearchQuery"
              v-if="!isAssetsLoading && !initialLoading"
            />
          </div>
        </div>

        <sorting-info
          :label="$t('main.sorted_by')"
          :sorting="assetSorting"
          @clear-sorting="onChangeSortClicked(null)"
          v-if="assetSorting && assetSorting.length > 0"
        />
        <asset-list
          ref="asset-list"
          :displayed-assets="displayedAssetsByType"
          :is-loading="isAssetsLoading || initialLoading"
          :is-error="isAssetsLoadingError"
          :validation-columns="assetValidationColumns"
          :department-filter="departmentFilter"
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
      @confirmAndStay="confirmNewAssetStay"
      @cancel="modals.isNewDisplayed = false"
    />

    <delete-modal
      ref="delete-asset-modal"
      :active="modals.isDeleteDisplayed"
      :is-loading="loading.delete"
      :is-error="errors.delete"
      :text="deleteText()"
      :error-text="$t('assets.delete_error')"
      @confirm="confirmDeleteAsset"
      @cancel="modals.isDeleteDisplayed = false"
    />

    <delete-modal
      ref="restore-asset-modal"
      :active="modals.isRestoreDisplayed"
      :is-loading="loading.restore"
      :is-error="loading.delete"
      :text="restoreText()"
      :error-text="$t('assets.restore_error')"
      @confirm="confirmRestoreAsset"
      @cancel="modals.isRestoreDisplayed = false"
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
      @confirm="confirmDeleteAllTasks"
      @cancel="modals.isDeleteAllTasksDisplayed = false"
    />

    <delete-modal
      ref="delete-metadata-modal"
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
      :is-loading-stay="loading.taskStay"
      :is-error="errors.creatingTasks"
      :title="$t('tasks.create_tasks_asset')"
      :text="$t('tasks.create_tasks_asset_explaination')"
      :error-text="$t('tasks.create_tasks_asset_failed')"
      @confirm="confirmCreateTasks"
      @confirm-and-stay="confirmCreateTasksAndStay"
      @cancel="hideCreateTasksModal"
    />

    <add-metadata-modal
      :active="modals.isAddMetadataDisplayed"
      :is-loading="loading.addMetadata"
      :is-loading-stay="loading.addMetadata"
      :is-error="errors.addMetadata"
      :descriptor-to-edit="descriptorToEdit"
      entity-type="Asset"
      @confirm="confirmAddMetadata"
      @cancel="modals.isAddMetadataDisplayed = false"
    />

    <add-thumbnails-modal
      ref="add-thumbnails-modal"
      entity-type="Asset"
      parent="assets"
      :active="modals.isAddThumbnailsDisplayed"
      :is-loading="loading.addThumbnails"
      :is-error="errors.addThumbnails"
      @confirm="confirmAddThumbnails"
      @cancel="hideAddThumbnailsModal"
    />

    <build-filter-modal
      ref="build-filter-modal"
      :active="modals.isBuildFilterDisplayed"
      @confirm="confirmBuildFilter"
      @cancel="modals.isBuildFilterDisplayed = false"
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

import AssetList from '@/components/lists/AssetList'
import AddMetadataModal from '@/components/modals/AddMetadataModal'
import AddThumbnailsModal from '@/components/modals/AddThumbnailsModal'
import BigThumbnailsButton from '@/components/widgets/BigThumbnailsButton'
import BuildFilterModal from '@/components/modals/BuildFilterModal'
import ButtonSimple from '@/components/widgets/ButtonSimple'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment'
import CreateTasksModal from '@/components/modals/CreateTasksModal'
import DeleteModal from '@/components/modals/DeleteModal'
import EditAssetModal from '@/components/modals/EditAssetModal'
import ImportModal from '@/components/modals/ImportModal'
import ImportRenderModal from '@/components/modals/ImportRenderModal'
import HardDeleteModal from '@/components/modals/HardDeleteModal'
import SearchField from '@/components/widgets/SearchField'
import SearchQueryList from '@/components/widgets/SearchQueryList'
import SortingInfo from '@/components/widgets/SortingInfo'
import ShowAssignationsButton from '@/components/widgets/ShowAssignationsButton'
import ShowInfosButton from '@/components/widgets/ShowInfosButton'
import TaskInfo from '@/components/sides/TaskInfo.vue'

export default {
  name: 'assets',
  mixins: [searchMixin, entitiesMixin],

  components: {
    AssetList,
    AddMetadataModal,
    AddThumbnailsModal,
    BigThumbnailsButton,
    BuildFilterModal,
    ButtonSimple,
    ComboboxDepartment,
    CreateTasksModal,
    DeleteModal,
    EditAssetModal,
    HardDeleteModal,
    ImportModal,
    ImportRenderModal,
    SearchField,
    SearchQueryList,
    ShowAssignationsButton,
    ShowInfosButton,
    SortingInfo,
    TaskInfo
  },

  data() {
    return {
      type: 'asset',
      assetToDelete: {},
      assetToRestore: {},
      assetToEdit: {},
      assetFilters: [
        {
          type: 'Type',
          value: {
            name: 'open'
          }
        }
      ],
      assetFilterTypes: ['Type'],
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      departmentFilter: [],
      selectedDepartment: 'ALL',
      taskTypeForTaskDeletion: null,
      errors: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        delete: false,
        deleteMetadata: false,
        edit: false,
        restore: false,
        importing: false,
        importingError: null
      },
      genericColumns: [
        'Metadata column name (text value)',
        'Task type name (task status name value)',
        'Task type name + comment (text value)'
      ],
      initialLoading: true,
      loading: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        deleteAllTasks: false,
        deleteMetadata: false,
        delete: false,
        edit: false,
        importing: false,
        restore: false,
        savingSearch: false,
        stay: false,
        taskStay: false
      },
      modals: {
        isAddMetadataDisplayed: false,
        isAddThumbnailsDisplayed: false,
        isBuildFilterDisplayed: false,
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isDeleteMetadataDisplayed: false,
        isImportDisplayed: false,
        isImportRenderDisplayed: false,
        isNewDisplayed: false
      },
      pageName: 'Assets',
      optionalColumns: ['Description', 'Ready for'],
      parsedCSV: [],
      success: {
        edit: false
      }
    }
  },

  created() {
    this.setLastProductionScreen('assets')
  },

  mounted() {
    let searchQuery = ''
    if (this.assetSearchText.length > 0) {
      this.searchField.setValue(this.assetSearchText)
    }
    if (this.$route.query.search && this.$route.query.search.length > 0) {
      searchQuery = `${this.$route.query.search}`
    }
    this.$refs['asset-list'].setScrollPosition(this.assetListScrollPosition)
    this.onSearchChange()
    this.$refs['asset-list'].setScrollPosition(this.assetListScrollPosition)
    const finalize = () => {
      if (this.$refs['asset-list']) {
        this.searchField.setValue(searchQuery)
        this.onSearchChange()
        this.$refs['asset-list'].setScrollPosition(this.assetListScrollPosition)
      }
    }

    if (
      this.assetMap.size < 2 ||
      (this.assetValidationColumns.length > 0 &&
        !this.assetMap.get(this.assetMap.keys().next().value).validations)
    ) {
      setTimeout(() => {
        this.loadAssets().then(() => {
          setTimeout(() => {
            this.initialLoading = false
            finalize()
          }, 500)
        })
      }, 0)
    } else {
      if (!this.isAssetsLoading) this.initialLoading = false
      finalize()
    }
  },

  beforeDestroy() {
    this.clearSelectedAssets()
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsPath',
      'assetListScrollPosition',
      'assetsCsvFormData',
      'assetSearchText',
      'assetSearchFilterGroups',
      'assetSearchQueries',
      'assetSorting',
      'assetTypes',
      'assetValidationColumns',
      'currentEpisode',
      'currentProduction',
      'departmentMap',
      'departments',
      'displayedAssetsByType',
      'episodeMap',
      'isAssetEstimation',
      'isAssetTime',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isTVShow',
      'openProductions',
      'productionAssetTaskTypes',
      'selectedAssets',
      'taskTypeMap',
      'user'
    ]),

    addThumbnailsModal() {
      return this.$refs['add-thumbnails-modal']
    },

    searchField() {
      return this.$refs['asset-search-field']
    },

    filteredAssets() {
      const assets = {}
      this.displayedAssetsByType.forEach(type => {
        type.forEach(item => {
          let assetKey = ''
          if (this.isTVShow && item.episode_id) {
            assetKey += this.episodeMap.get(item.episode_id).name
          }
          assetKey += `${item.asset_type_name}${item.name}`
          assets[assetKey] = true
        })
      })
      return assets
    },

    // Page titles

    tvShowPageTitle() {
      const productionName = this.currentProduction?.name || ''
      let episodeName = ''
      if (this.currentEpisode) {
        switch (this.currentEpisode.id) {
          case 'all':
            episodeName = this.$t('main.all')
            break
          case 'main':
            episodeName = this.$t('main.main_pack')
            break
          default:
            episodeName = this.currentEpisode.name
        }
      }
      return (
        `${productionName} - ${episodeName}` +
        ` | ${this.$t('assets.title')} - Kitsu`
      )
    },

    shortPageTitle() {
      const productionName = this.currentProduction?.name || ''
      return `${productionName} ${this.$t('assets.title')} - Kitsu`
    },

    dataMatchers() {
      return this.isTVShow ? ['Episode', 'Type', 'Name'] : ['Type', 'Name']
    },

    renderColumns() {
      const collection = [...this.dataMatchers, ...this.optionalColumns]

      this.productionAssetTaskTypes.forEach(item => {
        collection.push(item.name)
        collection.push(`${item.name} comment`)
      })

      return collection
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'changeAssetSort',
      'clearSelectedAssets',
      'commentTaskWithPreview',
      'createTasks',
      'deleteAllAssetTasks',
      'deleteAsset',
      'deleteMetadataDescriptor',
      'editAsset',
      'getAssetsCsvLines',
      'loadAssets',
      'loadEpisodes',
      'newAsset',
      'removeAssetSearch',
      'restoreAsset',
      'saveAssetSearch',
      'setLastProductionScreen',
      'setAssetSearch',
      'setPreview',
      'uploadAssetFile'
    ]),

    showNewModal() {
      this.assetToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onEditClicked(asset) {
      this.assetToEdit = asset
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked(asset) {
      this.assetToDelete = asset
      this.modals.isDeleteDisplayed = true
    },

    onRestoreClicked(asset) {
      this.assetToRestore = asset
      this.modals.isRestoreDisplayed = true
    },

    confirmNewAssetStay(form) {
      this.loading.stay = true
      this.success.edit = false
      this.newAsset(form)
        .then(() => {
          this.loading.stay = false
          this.loading.edit = false
          this.resetLightEditModal()
          this.$refs['edit-asset-modal'].focusName()
          this.success.edit = true
        })
        .catch(err => {
          console.error(err)
          this.loading.stay = false
          this.loading.edit = false
          this.success.edit = false
          this.errors.edit = true
        })
    },

    confirmEditAsset(form) {
      let action = 'newAsset'
      this.loading.edit = true
      this.errors.edit = false
      if (this.assetToEdit && this.assetToEdit.id) {
        action = 'editAsset'
        form.id = this.assetToEdit.id
      }
      this[action](form)
        .then(form => {
          this.loading.edit = false
          this.modals.isNewDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteAsset() {
      this.loading.delete = true
      this.errors.delete = false
      this.deleteAsset(this.assetToDelete)
        .then(form => {
          this.loading.delete = false
          this.modals.isDeleteDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.delete = false
          this.errors.delete = true
        })
    },

    confirmRestoreAsset() {
      this.loading.restore = true
      this.errors.restore = false
      this.restoreAsset(this.assetToRestore)
        .then(form => {
          this.loading.restore = false
          this.modals.isRestoreDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.loading.restore = false
          this.errors.restore = true
        })
    },

    confirmBuildFilter(query) {
      this.modals.isBuildFilterDisplayed = false
      this.searchField.setValue(query)
      this.onSearchChange()
    },

    confirmCreateTasks({ form, selectionOnly }) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, selectionOnly).then(() => {
        this.reset()
        this.hideCreateTasksModal()
        this.loading.creatingTasks = false
      })
    },

    confirmCreateTasksAndStay({ form, selectionOnly }) {
      this.loading.taskStay = true
      this.runTasksCreation(form, selectionOnly).then(() => {
        this.reset()
        this.loading.taskStay = false
      })
    },

    runTasksCreation(form, selectionOnly) {
      this.errors.creatingTasks = false
      return this.createTasks({
        type: 'assets',
        task_type_id: form.task_type_id,
        project_id: this.currentProduction.id,
        selectionOnly
      }).catch(err => {
        this.errors.creatingTasks = true
        console.error(err)
      })
    },

    confirmDeleteAllTasks(selectionOnly) {
      const taskTypeId = this.taskTypeForTaskDeletion.id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllAssetTasks({ projectId, taskTypeId, selectionOnly })
        .then(() => {
          if (!selectionOnly) this.loadAssets()
          this.modals.isDeleteAllTasksDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteAllTasks = true
        })
        .finally(() => {
          this.loading.deleteAllTasks = false
        })
    },

    confirmDeleteMetadata() {
      this.errors.deleteMetadata = false
      this.loading.deleteMetadata = true
      this.deleteMetadataDescriptor(this.descriptorIdToDelete)
        .then(() => {
          this.errors.deleteMetadata = false
          this.modals.isDeleteMetadataDisplayed = false
        })
        .catch(err => {
          console.error(err)
          this.errors.deleteMetadata = true
        })
        .finally(() => {
          this.loading.deleteMetadata = false
        })
    },

    resetLightEditModal() {
      const form = {
        name: '',
        entity_type_id: this.assetToEdit.entity_type_id,
        production_id: this.currentProduction.id
      }
      this.assetToEdit = form
    },

    resetEditModal() {
      const form = { name: '' }
      if (this.assetTypes.length > 0) {
        form.asset_type_id = this.assetTypes[0].id
      }
      form.production_id = this.currentProduction.id
      this.assetToEdit = form
    },

    deleteText() {
      const asset = this.assetToDelete
      if (
        asset &&
        (asset.canceled || !asset.tasks || asset.tasks.length === 0)
      ) {
        return this.$t('assets.delete_text', { name: asset.name })
      } else if (asset) {
        return this.$t('assets.cancel_text', { name: asset.name })
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
      const asset = this.assetToRestore
      if (asset) {
        return this.$t('assets.restore_text', { name: asset.name })
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
      this.$store.commit('ASSET_CSV_FILE_SELECTED', formData)

      this.uploadAssetFile(toUpdate)
        .then(() => {
          this.hideImportRenderModal()
          this.loadEpisodes().catch(console.error)
          this.loadAssets()
        })
        .catch(err => {
          this.errors.importing = true
          this.errors.importingError = err
        })
        .finally(() => {
          this.loading.importing = false
        })
    },

    resetImport() {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('ASSET_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    onSearchChange() {
      const searchQuery = this.searchField.getValue() || ''
      if (
        searchQuery.length !== 1 &&
        searchQuery !== undefined &&
        searchQuery !== 'undefined'
      ) {
        this.setAssetSearch(searchQuery)
        this.setSearchInUrl()
      }
    },

    saveSearchQuery(searchQuery) {
      if (this.loading.savingSearch) {
        return
      }
      this.loading.savingSearch = true
      this.saveAssetSearch(searchQuery)
        .catch(console.error)
        .finally(() => {
          this.loading.savingSearch = false
        })
    },

    removeSearchQuery(searchQuery) {
      this.removeAssetSearch(searchQuery).catch(err => {
        if (err) console.error(err)
      })
    },

    saveScrollPosition(scrollPosition) {
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', scrollPosition)
    },

    onDeleteAllTasksClicked(taskTypeId) {
      const taskType = this.taskTypeMap.get(taskTypeId)
      this.taskTypeForTaskDeletion = taskType
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    confirmAddMetadata(form) {
      this.loading.addMetadata = true
      form.entity_type = 'Asset'
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

    onAddMetadataClicked() {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked(descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onEditMetadataClicked(descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    onExportClick() {
      this.getAssetsCsvLines().then(assetLines => {
        const nameData = [
          moment().format('YYYY-MM-DD'),
          'kitsu',
          this.currentProduction.name,
          this.$t('assets.title')
        ]
        if (this.currentEpisode) {
          nameData.splice(3, 0, this.currentEpisode.name)
        }
        const name = stringHelpers.slugify(nameData.join('_'))
        let headers = this.isTVShow ? ['Episode'] : []
        headers = headers.concat([
          this.$t('assets.fields.type'),
          this.$t('assets.fields.name'),
          this.$t('assets.fields.description'),
          this.$t('assets.fields.ready_for')
        ])
        sortByName([...this.currentProduction.descriptors])
          .filter(d => d.entity_type === 'Asset')
          .forEach(descriptor => {
            headers.push(descriptor.name)
          })
        if (this.isAssetTime) {
          headers.push(this.$t('assets.fields.time_spent'))
        }
        if (this.isAssetEstimation) {
          headers.push(this.$t('main.estimation_short'))
        }
        this.assetValidationColumns.forEach(taskTypeId => {
          headers.push(this.taskTypeMap.get(taskTypeId).name)
          headers.push('Assignations')
        })
        csv.buildCsvFile(name, [headers].concat(assetLines))
      })
    },

    onAssetTypeClicked(assetType) {
      this.searchField.setValue(`${this.assetSearchText} type=${assetType}`)
      this.onSearchChange()
    },

    onChangeSortClicked(sortInfo) {
      this.changeAssetSort(sortInfo)
    },

    onFieldChanged({ entry, fieldName, value }) {
      const data = { id: entry.id }
      data[fieldName] = value
      this.editAsset(data)
    },

    onMetadataChanged({ entry, descriptor, value }) {
      const metadata = {}
      metadata[descriptor.field_name] = value
      const data = {
        id: entry.id,
        data: metadata
      }
      this.editAsset(data)
    },

    onAssetChanged(asset) {
      this.editAsset(asset)
    },

    reset() {
      this.initialLoading = true
      this.loadAssets().then(() => {
        this.initialLoading = false
        this.setSearchFromUrl()
        this.onSearchChange()
      })
    }
  },

  watch: {
    $route() {
      if (!this.$route.query) return
      const search = this.$route.query.search
      const actualSearch = this.searchField.getValue()
      if (search !== actualSearch) {
        this.searchField.setValue(search)
        this.onSearchChange()
      }
    },

    currentProduction() {
      this.searchField.setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)
      this.initialLoading = true
      if (!this.isTVShow) this.reset()
    },

    currentEpisode() {
      this.searchField.setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)
      if (this.isTVShow && this.currentEpisode) this.reset()
    }
  },

  metaInfo() {
    if (this.isTVShow) {
      return { title: this.tvShowPageTitle }
    }
    return { title: this.shortPageTitle }
  }
}
</script>

<style lang="scss" scoped>
.data-list {
  margin-top: 0;
}

.level {
  align-items: flex-start;
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
