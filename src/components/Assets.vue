<template>
<div class="assets page fixed-page">

  <div class="asset-list-header page-header">
    <div class="level header-title">
      <div class="level-left flexcolumn">
        <div class="filters-area flexcolumn-item">
          <search-field
            ref="asset-search-field"
            :can-save="true"
            @change="onSearchChange"
            @save="saveSearchQuery"
            placeholder="ex: props modeling=wip"
          />
        </div>

        <div class="query-list flexcolumn-item">
          <search-query-list
            :queries="assetSearchQueries"
            @changesearch="changeSearch"
            @removesearch="removeSearchQuery"
            v-if="!isAssetsLoading && !initialLoading"
          />
        </div>
      </div>

      <div class="level-right flexrow" v-if="isCurrentUserManager">
        <show-assignations-button class="flexrow-item" />
        <button-link
          class="flexrow-item"
          :text="$t('main.csv.import_file')"
          icon="upload"
          :is-responsive="true"
          :path="importPath"
        />
        <button-href-link
          class="flexrow-item"
          :text="$t('main.csv.export_file')"
          icon="download"
          :is-responsive="true"
          :path="'/api/export/csv/projects/' + currentProduction.id + '/assets.csv'"
        />
        <button-link
          class="flexrow-item"
          :text="$t('assets.new_asset')"
          icon="plus"
          :is-responsive="true"
          :path="newAssetPath"
        />
      </div>
    </div>
  </div>

  <asset-list
    ref="asset-list"
    :displayed-assets="displayedAssetsByType"
    :is-loading="isAssetsLoading || initialLoading"
    :is-error="isAssetsLoadingError"
    :validation-columns="assetValidationColumns"
    @scroll="saveScrollPosition"
    @delete-all-tasks="onDeleteAllTasksClicked"
  />

  <edit-asset-modal
    ref="edit-asset-modal"
    :active="modals.isNewDisplayed"
    :is-loading="loading.edit"
    :is-loading-stay="loading.stay"
    :is-error="editAsset.isCreateError"
    :is-success="editAsset.isSuccess"
    :cancel-route="assetsPath"
    :asset-to-edit="assetToEdit"
    @confirm="confirmEditAsset"
    @confirmAndStay="confirmNewAssetStay"
  />

  <delete-modal
    :active="modals.isDeleteDisplayed"
    :is-loading="deleteAsset.isLoading"
    :is-error="deleteAsset.isError"
    :cancel-route="assetsPath"
    :text="deleteText()"
    :error-text="$t('assets.delete_error')"
    @confirm="confirmDeleteAsset"
  />

  <delete-modal
    :active="modals.isRestoreDisplayed"
    :is-loading="restoreAsset.isLoading"
    :is-error="restoreAsset.isDeleteError"
    :cancel-route="assetsPath"
    :text="restoreText()"
    :error-text="$t('assets.restore_error')"
    @confirm="confirmRestoreAsset"
  />

  <hard-delete-modal
    :active="modals.isDeleteAllTasksDisplayed"
    :is-loading="loading.deleteAllTasks"
    :is-error="errors.deleteAllTasks"
    :cancel-route="assetsPath"
    :text="deleteAllTasksText()"
    :error-text="$t('tasks.delete_all_error')"
    :lock-text="deleteAllTasksLockText"
    @confirm="confirmDeleteAllTasks"
  />

  <import-modal
    :active="modals.isImportDisplayed"
    :is-loading="loading.importing"
    :is-error="errors.importing"
    :cancel-route="assetsPath"
    :form-data="assetsCsvFormData"
    :columns="columns"
    @fileselected="selectFile"
    @confirm="uploadImportFile"
  />

  <create-tasks-modal
    :active="modals.isCreateTasksDisplayed"
    :is-loading="loading.creatingTasks"
    :is-loading-stay="loading.taskStay"
    :is-error="errors.creatingTasks"
    :cancel-route="assetsPath"
    :title="$t('tasks.create_tasks_asset')"
    :text="$t('tasks.create_tasks_asset_explaination')"
    :error-text="$t('tasks.create_tasks_asset_failed')"
    @confirm="confirmCreateTasks"
    @confirm-and-stay="confirmCreateTasksAndStay"
  />
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import AssetList from './lists/AssetList'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import ButtonLink from './widgets/ButtonLink'
import CreateTasksModal from './modals/CreateTasksModal'
import DeleteModal from './widgets/DeleteModal'
import EditAssetModal from './modals/EditAssetModal'
import ImportModal from './modals/ImportModal'
import HardDeleteModal from './modals/HardDeleteModal'
import PageTitle from './widgets/PageTitle'
import SearchField from './widgets/SearchField'
import SearchQueryList from './widgets/SearchQueryList'
import ShowAssignationsButton from './widgets/ShowAssignationsButton'

export default {
  name: 'assets',

  components: {
    AssetList,
    ButtonLink,
    ButtonHrefLink,
    CreateTasksModal,
    DeleteModal,
    EditAssetModal,
    HardDeleteModal,
    ImportModal,
    PageTitle,
    SearchField,
    SearchQueryList,
    ShowAssignationsButton
  },

  data () {
    return {
      initialLoading: true,
      modals: {
        isCreateTasksDisplayed: false,
        isDeleteDisplayed: false,
        isDeleteAllTasksDisplayed: false,
        isImportDisplayed: false,
        isNewDisplayed: false
      },
      loading: {
        creatingTasks: false,
        deleteAllTasks: false,
        edit: false,
        importing: false,
        stay: false,
        taskStay: false
      },
      errors: {
        creatingTasks: false,
        importing: false
      },
      assetToDelete: null,
      assetToRestore: null,
      assetToEdit: null,
      assetFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      assetFilterTypes: [
        'Type'
      ],
      choices: [],
      columns: [
        'Type',
        'Name',
        'Description'
      ],
      deleteAllTasksLockText: null
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
      'editAsset',
      'deleteAsset',
      'displayedAssetsByType',
      'openProductions',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'isCurrentUserManager',
      'isTVShow',
      'restoreAsset',
      'taskTypeMap'
    ]),

    newAssetPath () {
      return this.getPath('new-asset')
    },

    importPath () {
      return this.getPath('import-assets')
    }
  },

  created () {
    this.setLastProductionScreen('assets')
  },

  mounted () {
    if (this.assetSearchText.length > 0) {
      this.$refs['asset-search-field'].setValue(this.assetSearchText)
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
        this.loadAssets((err) => {
          if (!err) {
            this.handleModalsDisplay()
            this.onSearchChange()
            setTimeout(() => {
              if (this.$refs['asset-list']) {
                this.$refs['asset-list'].setScrollPosition(
                  this.assetListScrollPosition
                )
              }
            }, 500)
          }
          setTimeout(() => {
            this.initialLoading = false
            this.resizeHeaders()
          }, 200)
        })
      }, 0)
    } else {
      if (!this.isAssetsLoading) this.initialLoading = false
      this.onSearchChange()
      this.$refs['asset-list'].setScrollPosition(
        this.assetListScrollPosition
      )
    }
  },

  methods: {
    ...mapActions([
      'deleteAllTasks',
      'loadAssets',
      'loadComment',
      'removeAssetSearch',
      'saveAssetSearch',
      'setLastProductionScreen',
      'setAssetSearch'
    ]),

    confirmNewAssetStay (form) {
      let action = 'newAsset'
      this.loading.stay = true
      this.editAsset.isSuccess = false
      this.editAsset.isError = false

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          this.loading.stay = false
          if (!err) {
            this.resetLightEditModal()
            this.$refs['edit-asset-modal'].focusName()
            this.editAsset.isSuccess = true
          } else {
            this.loading.edit = false
          }
        }
      })
    },

    confirmEditAsset (form) {
      let action = 'newAsset'
      this.loading.edit = true
      this.editAsset.isCreateError = false
      if (this.assetToEdit && this.assetToEdit.id) {
        action = 'editAsset'
        form.id = this.assetToEdit.id
      }

      this.$store.dispatch(action, {
        data: form,
        callback: (err) => {
          if (!err) {
            this.loading.edit = false
            this.modals.isNewDisplayed = false
            this.$router.push(this.assetsPath)
          } else {
            this.loading.edit = false
            this.editAsset.isCreateError = true
          }
        }
      })
    },

    confirmDeleteAsset () {
      this.$store.dispatch('deleteAsset', {
        asset: this.assetToDelete,
        callback: (err) => {
          if (!err) {
            this.$router.push(this.assetsPath)
          }
        }
      })
    },

    confirmRestoreAsset () {
      this.$store.dispatch('restoreAsset', {
        asset: this.assetToRestore,
        callback: (err) => {
          if (!err) this.modals.isRestoreDisplayed = false
        }
      })
    },

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.runTasksCreation(form, (err) => {
        if (!err) this.$router.push(this.assetsPath)
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
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        type: 'assets',
        project_id: this.currentProduction.id,
        callback: (err) => {
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.modals.isCreateTasks = false
            this.loadAssets(() => {
              this.resizeHeaders()
            })
          }
          callback(err)
        }
      })
    },

    confirmDeleteAllTasks () {
      const taskTypeId = this.$route.params.task_type_id
      const projectId = this.currentProduction.id
      this.errors.deleteAllTasks = false
      this.loading.deleteAllTasks = true
      this.deleteAllTasks({ projectId, taskTypeId })
        .then(() => {
          this.loading.deleteAllTasks = false
          this.loadAssets(() => {
            this.resizeHeaders()
          })
          this.$router.push(this.assetsPath)
        }).catch((err) => {
          console.error(err)
          this.loading.deleteAllTasks = false
          this.errors.deleteAllTasks = true
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
        return this.$t('assets.delete_text', {name: asset.name})
      } else {
        return ''
      }
    },

    deleteAllTasksText () {
      const taskType = this.taskTypeMap[this.$route.params.task_type_id]
      if (taskType) {
        return this.$t('tasks.delete_all_text', {name: taskType.name})
      } else {
        return ''
      }
    },

    restoreText () {
      const asset = this.assetToRestore
      if (asset) {
        return this.$t('assets.restore_text', {name: asset.name})
      } else {
        return ''
      }
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path
      const assetId = this.$store.state.route.params.asset_id
      this.editAsset.isSuccess = false
      this.editAsset.isError = false

      if (path.indexOf('new') > 0) {
        this.resetEditModal()
        this.editAsset.isSuccess = false
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('edit') > 0) {
        this.editAsset.isSuccess = false
        this.assetToEdit = this.assetMap[assetId]
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete-all-tasks') > 0) {
        const taskType = this.taskTypeMap[this.$route.params.task_type_id]
        this.deleteAllTasksLockText = taskType.name
        this.modals.isDeleteAllTasksDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.assetToDelete = this.assetMap[assetId]
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('restore') > 0) {
        this.assetToRestore = this.assetMap[assetId]
        this.modals.isRestoreDisplayed = true
      } else if (path.indexOf('import') > 0) {
        this.modals.isImportDisplayed = true
      } else if (path.indexOf('create-tasks') > 0) {
        this.modals.isCreateTasksDisplayed = true
      } else {
        this.modals = {
          isNewDisplayed: false,
          isDeleteDisplayed: false,
          isDeleteAllTasksDisplayed: false,
          isRestoreDisplayed: false,
          isImportDisplayed: false,
          isCreateTasksDisplayed: false
        }
      }
    },

    selectFile (formData) {
      this.$store.commit('ASSET_CSV_FILE_SELECTED', formData)
    },

    uploadImportFile () {
      this.loading.importing = true
      this.errors.importing = false

      this.$store.dispatch('uploadAssetFile', (err) => {
        if (!err) {
          this.loading.importing = false
          this.loadAssets(() => {
            this.resizeHeaders()
          })
          this.$router.push(this.assetsPath)
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    },

    onSearchChange () {
      const searchQuery = this.$refs['asset-search-field'].getValue()
      this.setAssetSearch(searchQuery)
      this.resizeHeaders()
    },

    changeSearch (searchQuery) {
      this.$refs['asset-search-field'].setValue(searchQuery.search_query)
      this.$refs['asset-search-field'].$emit('change', searchQuery.search_query)
      this.resizeHeaders()
    },

    saveSearchQuery (searchQuery) {
      this.saveAssetSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    },

    removeSearchQuery (searchQuery) {
      this.removeAssetSearch(searchQuery)
        .then(() => {
        })
        .catch((err) => {
          if (err) console.log('error')
        })
    },

    saveScrollPosition (scrollPosition) {
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', scrollPosition)
    },

    getPath (section) {
      let route = {
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

    resizeHeaders () {
      setTimeout(() => {
        if (this.$refs['asset-list']) {
          this.$refs['asset-list'].resizeHeaders()
        }
      }, 0)
    },

    onDeleteAllTasksClicked (taskTypeId) {
      const route = this.getPath('delete-all-asset-tasks')
      const taskType = this.taskTypeMap[taskTypeId]
      route.params.task_type_id = taskTypeId
      this.deleteAllTasksLockText = taskType.name
      this.$router.push(route)
    }
  },

  watch: {
    $route () {
      this.handleModalsDisplay()
    },

    currentProduction () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)

      if (!this.isTVShow) {
        this.initialLoading = true
        this.loadAssets((err) => {
          this.initialLoading = false
          this.resizeHeaders()
          if (!err) {
            this.handleModalsDisplay()
          }
        })
      }
    },

    currentEpisode () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)

      if (this.isTVShow && this.currentEpisode) {
        this.initialLoading = true
        this.loadAssets((err) => {
          if (!err) {
            this.handleModalsDisplay()
            this.initialLoading = false
            this.resizeHeaders()
          }
        })
      }
    },

    displayedAssets () {
      this.resizeHeaders()
    }
  },

  metaInfo () {
    if (this.isTVShow) {
      return {
        title: `${this.currentProduction ? this.currentProduction.name : ''}` +
               ` - ${this.currentEpisode ? this.currentEpisode.name : ''}` +
               ` | ${this.$t('assets.title')} - Kitsu`
      }
    } else {
      return {
        title: `${this.currentProduction.name} ${this.$t('assets.title')} - Kitsu`
      }
    }
  }
}
</script>

<style scoped>
.data-list {
  margin-top: 0;
}

.level {
  align-items: flex-start
}
</style>
