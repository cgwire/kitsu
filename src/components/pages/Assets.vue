<template>
<div class="columns fixed-page">
  <div class="column main-column">
    <div class="assets page">
      <div class="asset-list-header page-header">
        <div class="level header-title">
          <div class="level-left flexcolumn">
            <div class="filters-area flexcolumn-item">
              <div class="flexrow">
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
                  icon="funnel"
                  @click="modals.isBuildFilterDisplayed = true"
                />
              </div>
            </div>
          </div>

          <div class="level-right flexrow">
            <div class="flexrow" v-if="!isCurrentUserClient">
              <show-assignations-button class="flexrow-item" />
              <show-infos-button class="flexrow-item" />
              <div class="flexrow-item"></div>
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
              :text="$t('assets.new_asset')"
              icon="plus"
              @click="showNewModal"
            />
            </div>
          </div>
        </div>
        <div class="query-list">
          <search-query-list
            :queries="assetSearchQueries"
            @changesearch="changeSearch"
            @removesearch="removeSearchQuery"
            v-if="!isAssetsLoading && !initialLoading"
          />
        </div>
      </div>

      <sorting-info
        :label="$t('main.sorted_by')"
        :sorting="assetSorting"
        @clear-sorting="onChangeSortClicked(null)"
      />
      <asset-list
        ref="asset-list"
        :displayed-assets="displayedAssetsByType"
        :is-loading="isAssetsLoading || initialLoading"
        :is-error="isAssetsLoadingError"
        :validation-columns="assetValidationColumns"
        @change-sort="onChangeSortClicked"
        @create-tasks="showCreateTasksModal"
        @delete-all-tasks="onDeleteAllTasksClicked"
        @edit-clicked="onEditClicked"
        @delete-clicked="onDeleteClicked"
        @restore-clicked="onRestoreClicked"
        @add-metadata="onAddMetadataClicked"
        @edit-metadata="onEditMetadataClicked"
        @delete-metadata="onDeleteMetadataClicked"
        @scroll="saveScrollPosition"
      />
    </div>
  </div>

  <div
    class="column side-column"
    v-if="nbSelectedTasks === 1"
  >
    <task-info
      :task="Object.values(selectedTasks)[0]"
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
    :parsed-csv="parsedCSV"
    :form-data="assetsCsvFormData"
    :columns="columns"
    :dataMatchers="dataMatchers"
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
    :columns="columns"
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
    @confirm="confirmAddMetadata"
    @cancel="modals.isAddMetadataDisplayed = false"
  />

  <add-thumbnails-modal
    ref="add-thumbnails-modal"
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
import csv from '../../lib/csv'
import func from '../../lib/func'
import { sortByName } from '../../lib/sorting'
import { slugify } from '../../lib/string'
import { searchMixin } from '../mixins/search'
import { entityListMixin } from '../mixins/entities'

import AssetList from '../lists/AssetList'
import AddMetadataModal from '../modals/AddMetadataModal'
import AddThumbnailsModal from '../modals/AddThumbnailsModal'
import BuildFilterModal from '../modals/BuildFilterModal'
import ButtonSimple from '../widgets/ButtonSimple'
import CreateTasksModal from '../modals/CreateTasksModal'
import DeleteModal from '../modals/DeleteModal'
import EditAssetModal from '../modals/EditAssetModal'
import ImportModal from '../modals/ImportModal'
import ImportRenderModal from '../modals/ImportRenderModal'
import HardDeleteModal from '../modals/HardDeleteModal'
import SearchField from '../widgets/SearchField'
import SearchQueryList from '../widgets/SearchQueryList'
import SortingInfo from '../widgets/SortingInfo'
import ShowAssignationsButton from '../widgets/ShowAssignationsButton'
import ShowInfosButton from '../widgets/ShowInfosButton'
import TaskInfo from '../sides/TaskInfo.vue'

export default {
  name: 'assets',
  mixins: [searchMixin, entityListMixin],

  components: {
    AssetList,
    AddMetadataModal,
    AddThumbnailsModal,
    BuildFilterModal,
    ButtonSimple,
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

  data () {
    return {
      assetToDelete: {},
      assetToRestore: {},
      assetToEdit: {},
      assetFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      assetFilterTypes: [
        'Type'
      ],
      columns: [
        'Type',
        'Name',
        'Description'
      ],
      dataMatchers: [
        'Type',
        'Name'
      ],
      deleteAllTasksLockText: null,
      descriptorToEdit: {},
      errors: {
        addMetadata: false,
        addThumbnails: false,
        creatingTasks: false,
        delete: false,
        deleteMetadata: false,
        edit: false,
        restore: false,
        importing: false
      },
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
      parsedCSV: [],
      success: {
        edit: false
      }
    }
  },

  created () {
    this.setLastProductionScreen('assets')
  },

  mounted () {
    if (this.assetSearchText.length > 0) {
      this.searchField.setValue(this.assetSearchText)
    }
    this.$refs['asset-list'].setScrollPosition(
      this.assetListScrollPosition
    )
    if (
      Object.keys(this.assetMap).length < 2 ||
      (
        this.assetValidationColumns.length > 0 &&
        !Object.keys(this.assetMap)[0].validations
      )
    ) {
      setTimeout(() => {
        this.loadAssets()
          .then(() => {
            setTimeout(() => {
              this.initialLoading = false
              if (this.$refs['asset-list']) {
                this.onSearchChange()
                this.resetCsvColumns()
                this.$refs['asset-list'].setScrollPosition(
                  this.assetListScrollPosition
                )
              }
            }, 500)
          })
      }, 0)
    } else {
      if (!this.isAssetsLoading) this.initialLoading = false
      this.onSearchChange()
      this.resetCsvColumns()
      this.$refs['asset-list'].setScrollPosition(
        this.assetListScrollPosition
      )
    }
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'assetsPath',
      'assetListScrollPosition',
      'assetsCsvFormData',
      'assetSearchText',
      'assetSearchQueries',
      'assetTypes',
      'assetValidationColumns',
      'currentEpisode',
      'currentProduction',
      'displayedAssetsByType',
      'openProductions',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isAssetTime',
      'isTVShow',
      'nbSelectedTasks',
      'selectedTasks',
      'assetSorting',
      'taskTypeMap',
      'taskTypes'
    ]),

    newAssetPath () {
      return this.getPath('new-asset')
    },

    addThumbnailsModal () {
      return this.$refs['add-thumbnails-modal']
    },

    searchField () {
      return this.$refs['asset-search-field']
    },

    filteredAssets () {
      const assets = {}
      this.displayedAssetsByType.forEach(type => {
        type.forEach(item => {
          const assetKey = `${item.asset_type_name}${item.name}`
          assets[assetKey] = true
        })
      })
      return assets
    },

    // Page titles

    tvShowPageTitle () {
      const productionName =
        this.currentProduction ? this.currentProduction.name : ''
      let episodeName = ''
      if (this.currentEpisode) {
        episodeName = this.currentEpisode.name
        if (this.currentEpisode.id === 'all') episodeName = this.$t('main.all')
        if (this.currentEpisode.id === 'main') episodeName = 'Main Pack'
      }
      return `${productionName} - ${episodeName}` +
             ` | ${this.$t('assets.title')} - Kitsu`
    },

    shortPageTitle () {
      const productionName =
        this.currentProduction ? this.currentProduction.name : ''
      return `${productionName} ${this.$t('assets.title')} - Kitsu`
    }
  },

  methods: {
    ...mapActions([
      'addMetadataDescriptor',
      'changeAssetSort',
      'commentTaskWithPreview',
      'deleteAllTasks',
      'deleteAsset',
      'deleteMetadataDescriptor',
      'editAsset',
      'getAssetsCsvLines',
      'loadAssets',
      'loadComment',
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

    showNewModal () {
      this.assetToEdit = {}
      this.modals.isNewDisplayed = true
    },

    onEditClicked (asset) {
      this.assetToEdit = asset
      this.modals.isNewDisplayed = true
    },

    onDeleteClicked (asset) {
      this.assetToDelete = asset
      this.modals.isDeleteDisplayed = true
    },

    onRestoreClicked (asset) {
      this.assetToRestore = asset
      this.modals.isRestoreDisplayed = true
    },

    confirmNewAssetStay (form) {
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
        .catch((err) => {
          console.error(err)
          this.loading.stay = false
          this.loading.edit = false
          this.success.edit = false
          this.errors.edit = true
        })
    },

    confirmEditAsset (form) {
      let action = 'newAsset'
      this.loading.edit = true
      this.errors.edit = false
      if (this.assetToEdit && this.assetToEdit.id) {
        action = 'editAsset'
        form.id = this.assetToEdit.id
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

    confirmDeleteAsset () {
      this.loading.delete = true
      this.errors.delete = false
      this.deleteAsset(this.assetToDelete)
        .then((form) => {
          this.loading.delete = false
          this.modals.isDeleteDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.delete = false
          this.errors.delete = true
        })
    },

    confirmRestoreAsset () {
      this.loading.restore = true
      this.errors.restore = false
      this.restoreAsset(this.assetToRestore)
        .then((form) => {
          this.loading.restore = false
          this.modals.isRestoreDisplayed = false
        })
        .catch((err) => {
          console.error(err)
          this.loading.restore = false
          this.errors.restore = true
        })
    },

    confirmBuildFilter (query) {
      this.isBuildFilterDisplayed = false
      this.$refs['asset-search-field'].setValue(query)
      this.onSearchChange()
    },

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, () => {
        this.hideCreateTasksModal()
        this.loading.creatingTasks = false
      })
    },

    confirmCreateTasksAndStay (form) {
      this.loading.taskStay = true
      this.runTasksCreation(form, () => {
        this.loading.taskStay = false
      })
    },

    runTasksCreation (form, callback) {
      this.errors.creatingTasks = false
      this.createTasks({
        task_type_id: form.task_type_id,
        type: 'assets',
        project_id: this.currentProduction.id,
        callback: (err) => {
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.loadAssets()
          }
          callback(err)
        }
      })
    },

    confirmDeleteAllTasks () {
      const taskTypeId = this.taskTypes.find(
        t => t.name === this.deleteAllTasksLockText
      ).id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllTasks({ projectId, taskTypeId })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.loadAssets()
          this.modals.isDeleteAllTasksDisplayed = false
        }).catch((err) => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
        })
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

    resetLightEditModal () {
      const form = {
        name: '',
        entity_type_id: this.assetToEdit.entity_type_id,
        production_id: this.currentProduction.id
      }
      this.assetToEdit = form
    },

    resetEditModal () {
      const form = { name: '' }
      if (this.assetTypes.length > 0) {
        form.asset_type_id = this.assetTypes[0].id
      }
      form.production_id = this.currentProduction.id
      this.assetToEdit = form
    },

    deleteText () {
      const asset = this.assetToDelete
      if (asset) {
        return this.$t('assets.delete_text', { name: asset.name })
      } else {
        return ''
      }
    },

    deleteAllTasksText () {
      return this.$t('tasks.delete_all_text', {
        name: this.deleteAllTasksLockText
      })
    },

    restoreText () {
      const asset = this.assetToRestore
      if (asset) {
        return this.$t('assets.restore_text', { name: asset.name })
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
      this.$store.commit('ASSET_CSV_FILE_SELECTED', formData)

      this.uploadAssetFile(toUpdate)
        .then(() => {
          this.hideImportRenderModal()
          this.loading.importing = false
          this.loadEpisodes()
          this.loadAssets()
        })
        .catch((err) => {
          console.error(err)
          this.loading.importing = false
          this.errors.importing = true
        })
    },

    resetImport () {
      this.errors.importing = false
      this.hideImportRenderModal()
      this.$store.commit('ASSET_CSV_FILE_SELECTED', null)
      this.$refs['import-modal'].reset()
      this.showImportModal()
    },

    onSearchChange () {
      const searchQuery = this.$refs['asset-search-field'].getValue()
      if (searchQuery.length !== 1) {
        this.setAssetSearch(searchQuery)
        this.setSearchInUrl()
      }
    },

    saveSearchQuery (searchQuery) {
      this.saveAssetSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeAssetSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.error(err)
        })
    },

    saveScrollPosition (scrollPosition) {
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', scrollPosition)
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

    onDeleteAllTasksClicked (taskTypeId) {
      const taskType = this.taskTypeMap[taskTypeId]
      this.deleteAllTasksLockText = taskType.name
      this.modals.isDeleteAllTasksDisplayed = true
    },

    confirmAddMetadata (form) {
      this.loading.addMetadata = true
      form.entity_type = 'Asset'
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

    onAddMetadataClicked () {
      this.descriptorToEdit = {}
      this.modals.isAddMetadataDisplayed = true
    },

    onDeleteMetadataClicked (descriptorId) {
      this.descriptorIdToDelete = descriptorId
      this.modals.isDeleteMetadataDisplayed = true
    },

    onEditMetadataClicked (descriptorId) {
      this.descriptorToEdit = this.currentProduction.descriptors.find(
        d => d.id === descriptorId
      )
      this.modals.isAddMetadataDisplayed = true
    },

    onExportClick () {
      this.getAssetsCsvLines()
        .then((assetLines) => {
          const nameData = [
            moment().format('YYYY-MM-DD'),
            'kitsu',
            this.currentProduction.name,
            this.$t('assets.title')
          ]
          if (this.currentEpisode) {
            nameData.splice(3, 0, this.currentEpisode.name)
          }
          const name = slugify(nameData.join('_'))
          let headers = this.isTVShow ? ['Episode'] : []
          headers = headers.concat([
            this.$t('assets.fields.type'),
            this.$t('assets.fields.name'),
            this.$t('assets.fields.description')
          ])
          sortByName([...this.currentProduction.descriptors])
            .filter(d => d.entity_type === 'Asset')
            .forEach((descriptor) => {
              headers.push(descriptor.name)
            })
          if (this.isAssetTime) {
            headers.push(this.$t('shots.fields.time_spent'))
          }
          this.assetValidationColumns
            .forEach((taskTypeId) => {
              headers.push(this.taskTypeMap[taskTypeId].name)
            })
          csv.buildCsvFile(name, [headers].concat(assetLines))
        })
    },

    resetCsvColumns () {
      const columns = this.isTVShow ? ['Episode'] : []
      this.columns = columns.concat([
        'Type',
        'Name',
        'Description'
      ])
    },

    onChangeSortClicked (sortInfo) {
      this.changeAssetSort(sortInfo)
    },

    reset () {
      this.initialLoading = true
      this.loadAssets()
        .then(() => {
          this.initialLoading = false
          this.setSearchFromUrl()
          this.onSearchChange()
        })
    }
  },

  watch: {
    currentProduction () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)
      this.resetCsvColumns()

      if (!this.isTVShow) this.reset()
    },

    currentEpisode () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)
      if (this.isTVShow && this.currentEpisode) this.reset()
      this.resetCsvColumns()
    },

    displayedAssets () {
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return { title: this.tvShowPageTitle }
    } else {
      return { title: this.shortPageTitle }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark .main-column {
  border-right: 3px solid $grey-strong;
}

.data-list {
  margin-top: 0;
}

.level {
  align-items: flex-start
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

.main-column {
  border-right: 3px solid $light-grey;
}
</style>
