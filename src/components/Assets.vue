<template>
<div class="assets page fixed-page">

  <div class="asset-list-header page-header">
    <div class="level header-title">
      <div class="level-left">
        <div class="level-item">
          <page-title :text="$t('assets.title')"></page-title>
        </div>
      </div>

      <div class="level-right" v-if="isCurrentUserManager">
        <div class="level-item">
          <button-link
            class="level-item"
            :text="$t('main.csv.import_file')"
            icon="upload"
            :path="{
              name: 'import-assets',
              params: {production_id: currentProduction.id}
            }"
          >
          </button-link>
          <button-href-link
            class="level-item"
            :text="$t('main.csv.export_file')"
            icon="download"
            :path="'/api/export/csv/projects/' + currentProduction.id + '/assets.csv'"
          >
          </button-href-link>
          <button-link
            class="level-item"
            :text="$t('assets.new_asset')"
            icon="plus"
            :path="{
              name: 'new-asset',
              params: {production_id: currentProduction.id}
            }"
          >
          </button-link>
        </div>
      </div>
    </div>

    <div class="filters-area">
      <div class="level">
        <div class="level-right">
          <div class="level-item">
            <search-icon></search-icon>
          </div>
          <div class="level-item">
            <input
              class="input search-input"
              type="text"
              @input="onSearchChange"
              v-focus
            />
          </div>
          <!--div class="level-item">
            <filter-icon></filter-icon>
          </div>
          <div class="level-item">
            No filter set.
          </div-->
        </div>
      </div>
    </div>
  </div>

  <asset-list
    :entries="displayedAssets"
    :is-loading="isAssetsLoading"
    :is-error="isAssetsLoadingError"
    :validation-columns="assetValidationColumns"
  ></asset-list>

  <edit-asset-modal
    :active="modals.isNewDisplayed"
    :is-loading="loading.edit"
    :is-loading-stay="loading.stay"
    :is-error="editAsset.isCreateError"
    :is-success="editAsset.isSuccess"
    :cancel-route="{
      name: 'assets',
      params: {production_id: currentProduction.id}
    }"
    :asset-to-edit="assetToEdit"
    @confirm="confirmEditAsset"
    @confirmAndStay="confirmNewAssetStay"
  >
  </edit-asset-modal>

  <delete-modal
    :active="modals.isDeleteDisplayed"
    :is-loading="deleteAsset.isLoading"
    :is-error="deleteAsset.isDeleteError"
    :cancel-route="{
      name: 'assets',
      params: {production_id: currentProduction.id}
    }"
    :text="deleteText()"
    :error-text="$t('assets.delete_error')"
    @confirm="confirmDeleteAsset"
  >
  </delete-modal>

  <delete-modal
    :active="modals.isRestoreDisplayed"
    :is-loading="restoreAsset.isLoading"
    :is-error="restoreAsset.isRestoreError"
    :cancel-route="{
      name: 'assets',
      params: {production_id: currentProduction.id}
    }"
    :text="restoreText()"
    :error-text="$t('assets.restore_error')"
    @confirm="confirmRestoreAsset"
  >
  </delete-modal>

  <import-modal
    :active="modals.isImportDisplayed"
    :is-loading="loading.importing"
    :is-error="errors.importing"
    :cancel-route="{
      name: 'assets',
      params: {production_id: currentProduction.id}
    }"
    :form-data="assetsCsvFormData"
    :columns="columns"
    @fileselected="selectFile"
    @confirm="uploadImportFile"
  >
  </import-modal>

  <create-tasks-modal
    :active="modals.isCreateTasksDisplayed"
    :is-loading="loading.creatingTasks"
    :is-error="errors.creatingTasks"
    :cancel-route="{
      name: 'assets',
      params: {production_id: currentProduction.id}
    }"
    :title="$t('tasks.create_tasks_asset')"
    :text="$t('tasks.create_tasks_asset_explaination')"
    :error-text="$t('tasks.create_tasks_asset_failed')"
    @confirm="confirmCreateTasks"
  >
  </create-tasks-modal>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchIcon, FilterIcon } from 'vue-feather-icons'

import AssetList from './lists/AssetList.vue'
import EditAssetModal from './modals/EditAssetModal'
import DeleteModal from './widgets/DeleteModal'
import ImportModal from './modals/ImportModal'
import Filters from './widgets/Filters'
import ButtonLink from './widgets/ButtonLink'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import PageTitle from './widgets/PageTitle'
import CreateTasksModal from './modals/CreateTasksModal'

export default {
  name: 'assets',

  components: {
    AssetList,
    CreateTasksModal,
    DeleteModal,
    FilterIcon,
    ImportModal,
    EditAssetModal,
    Filters,
    ButtonLink,
    ButtonHrefLink,
    PageTitle,
    SearchIcon
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
      'assets',
      'displayedAssets',
      'assetsCsvFormData',
      'assetTypes',
      'openProductions',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'editAsset',
      'deleteAsset',
      'restoreAsset',
      'getAsset',
      'assetValidationColumns',
      'currentProduction',
      'currentProduction',
      'isCurrentUserManager'
    ])
  },

  created () {
    this.$store.commit('SET_ASSET_SEARCH', '')
    const productionId = this.$store.state.route.params.production_id
    this.$store.commit(
      'SET_CURRENT_PRODUCTION',
      productionId
    )

    this.loadAssets((err) => {
      if (!err) this.handleModalsDisplay()
    })
  },

  methods: {
    ...mapActions([
      'loadAssets'
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
            this.resetEditModal()
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
            this.$router.push({
              name: 'assets',
              params: {production_id: this.currentProduction.id}
            })
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
          if (!err) this.modals.isDeleteDisplayed = false
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
            this.$router.push({
              name: 'assets',
              params: {production_id: this.currentProduction.id}
            })
            this.loadAssets()
          }
        }
      })
    },

    resetEditModal () {
      const form = { name: '' }
      if (this.assetTypes.length > 0) {
        form.asset_type_id = this.assetTypes[0].id
      }
      if (this.openProductions.length > 0) {
        form.production_id = this.openProductions[0].id
      }
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
        this.assetToEdit = this.getAsset(assetId)
        this.modals.isNewDisplayed = true
      } else if (path.indexOf('delete') > 0) {
        this.assetToDelete = this.getAsset(assetId)
        this.modals.isDeleteDisplayed = true
      } else if (path.indexOf('restore') > 0) {
        this.assetToRestore = this.getAsset(assetId)
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
          this.$store.dispatch('loadAssets')
          this.$router.push({
            name: 'assets',
            params: {production_id: this.currentProduction.id}
          })
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    },

    onSearchChange (event) {
      const searchQuery = event.target.value
      this.$store.commit('SET_ASSET_SEARCH', searchQuery)
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },
    currentProduction () {
      const oldPath = `${this.$route.path}`
      const newPath = {
        name: 'assets',
        params: {production_id: this.currentProduction.id}
      }
      if (this.$route.path.length === 56) this.$router.push(newPath)
      const path = this.$route.path

      if (oldPath !== path) this.$store.dispatch('loadAssets')
    }
  },

  metaInfo () {
    return {
      title: `${this.currentProduction.name} ${this.$t('assets.title')} - Kitsu`
    }
  }

}
</script>

<style scoped>
.data-list {
  margin-top: 0;
}
</style>
