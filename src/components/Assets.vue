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
            placeholder="ex: props, modeling=wip"
          />
        </div>

        <div class="query-list flexcolumn-item">
          <search-query-list
            :queries="assetSearchQueries"
            @changesearch="changeSearch"
            @removesearch="removeSearchQuery"
          />
        </div>
      </div>

      <div class="level-right" v-if="isCurrentUserManager">
        <div class="level-item">
          <show-assignations-button />
          <button-link
            class="level-item"
            :text="$t('main.csv.import_file')"
            icon="upload"
            :is-responsive="true"
            :path="importPath"
          />
          <button-href-link
            class="level-item"
            :text="$t('main.csv.export_file')"
            icon="download"
            :is-responsive="true"
            :path="'/api/export/csv/projects/' + currentProduction.id + '/assets.csv'"
          />
          <button-link
            class="level-item"
            :text="$t('assets.new_asset')"
            icon="plus"
            :is-responsive="true"
            :path="newAssetPath"
          />
        </div>
      </div>
    </div>
  </div>

  <asset-list
    ref="asset-list"
    :displayed-assets="displayedAssetsByType"
    :is-loading="isAssetsLoading"
    :is-error="isAssetsLoadingError"
    :validation-columns="assetValidationColumns"
    @scroll="saveScrollPosition"
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
    :is-error="errors.creatingTasks"
    :cancel-route="assetsPath"
    :title="$t('tasks.create_tasks_asset')"
    :text="$t('tasks.create_tasks_asset_explaination')"
    :error-text="$t('tasks.create_tasks_asset_failed')"
    @confirm="confirmCreateTasks"
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
    ImportModal,
    PageTitle,
    SearchField,
    SearchQueryList,
    ShowAssignationsButton
  },

  data () {
    return {
      modals: {
        isCreateTasksDisplayed: false,
        isImportDisplayed: false,
        isNewDisplayed: false,
        isDeleteDisplayed: false
      },
      loading: {
        creatingTasks: false,
        importing: false,
        edit: false,
        stay: false
      },
      errors: {
        creatingTasks: false,
        importing: false
      },
      assetToDelete: null,
      assetToRestore: null,
      assetToEdit: null,
      choices: [],
      assetFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      columns: [
        'Type',
        'Name',
        'Description'
      ],
      assetFilterTypes: [
        'Type'
      ]
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
      'isTVShow',
      'editAsset',
      'deleteAsset',
      'restoreAsset',
      'isCurrentUserManager'
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
    if (Object.keys(this.assetMap).length < 2) {
      this.loadAssets((err) => {
        if (!err) this.handleModalsDisplay()
      })
    }
  },

  methods: {
    ...mapActions([
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
      this.errors.creatingTasks = false
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        type: 'assets',
        project_id: this.currentProduction.id,
        callback: (err) => {
          this.loading.creatingTasks = false
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.modals.isCreateTasks = false
            this.$router.push(this.assetsPath)
            this.loadAssets()
          }
        }
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
          this.loadAssets()
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
    },

    changeSearch (searchQuery) {
      this.$refs['asset-search-field'].setValue(searchQuery.search_query)
      this.$refs['asset-search-field'].$emit('change', searchQuery.search_query)
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
        route.episode_id = this.currentEpisode.id
      }
      return route
    }
  },

  watch: {
    $route () {
      this.handleModalsDisplay()
    },

    currentProduction () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)

      this.loadAssets((err) => {
        if (!err) {
          this.handleModalsDisplay()
        }
      })
    },

    currentEpisode () {
      this.$refs['asset-search-field'].setValue('')
      this.$store.commit('SET_ASSET_LIST_SCROLL_POSITION', 0)

      if (this.isTVShow && this.currentEpisode) {
        this.loadAssets((err) => {
          if (!err) {
            this.handleModalsDisplay()
          }
        })
      }
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
</style>
