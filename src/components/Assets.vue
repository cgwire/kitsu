<template>
  <div class="assets page">
   <div class="assets-list">
      <h1 class="title">{{ $t('assets.title') }}</h1>

      <div class="level">
        <div class="level-left">
        </div>
        <div class="level-right">
          <div class="level-item">
            <button-link
              class="level-item"
              :text="$t('main.csv.import_file')"
              icon="fa-upload"
              :path="{
                name: 'import-assets',
                params: {production_id: getCurrentProduction.id}
              }"
            >
            </button-link>
            <button-href-link
              class="level-item"
              :text="$t('main.csv.export_file')"
              icon="fa-download"
              :path="'/api/export/csv/assets.csv?project_id=' + getCurrentProduction.id"
            >
            </button-href-link>
            <button-link
              class="level-item"
              :text="$t('assets.new_asset')"
              icon="fa-plus"
              :path="{
                name: 'new-asset',
                params: {production_id: getCurrentProduction.id}
              }"
            >
            </button-link>
          </div>
        </div>
      </div>

      <asset-list
        :entries="assets"
        :is-loading="isAssetsLoading"
        :is-error="isAssetsLoadingError"
        :validation-columns="assetValidationColumns"
      ></asset-list>
    </div>

    <edit-asset-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-loading-stay="loading.stay"
      :is-error="editAsset.isCreateError"
      :is-success="editAsset.isSuccess"
      :cancel-route="{
        name: 'assets',
        params: {production_id: getCurrentProduction.id}
      }"
      :asset-to-edit="assetToEdit"
      @confirm="confirmEditAsset"
      @confirmAndStay="confirmNewAssetStay"
    >
    </edit-asset-modal>

    <delete-modal
      :active="modals.isDeleteDisplayed"
      :is-loading="deleteAsset.isLoading"
      :is-error="deleteAsset.isCreateError"
      :cancel-route="{
        name: 'assets',
        params: {production_id: getCurrentProduction.id}
      }"
      :text="deleteText()"
      :error-text="$t('assets.delete_error')"
      @confirm="confirmDeleteAsset"
    >
    </delete-modal>

    <import-modal
      :active="modals.isImportDisplayed"
      :is-loading="loading.importing"
      :is-error="errors.importing"
      :cancel-route="{
        name: 'assets',
        params: {production_id: getCurrentProduction.id}
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
        params: {production_id: getCurrentProduction.id}
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
import AssetList from './lists/AssetList.vue'
import EditAssetModal from './modals/EditAssetModal'
import DeleteModal from './widgets/DeleteModal'
import ImportModal from './modals/ImportModal'
import Filters from './widgets/Filters'
import ButtonLink from './widgets/ButtonLink'
import ButtonHrefLink from './widgets/ButtonHrefLink'
import CreateTasksModal from './modals/CreateTasksModal'

export default {
  name: 'menu',

  components: {
    AssetList,
    CreateTasksModal,
    DeleteModal,
    ImportModal,
    EditAssetModal,
    Filters,
    ButtonLink,
    ButtonHrefLink
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
      assetToEdit: null,
      choices: [],
      assetFilters: [{
        type: 'Type',
        value: {
          name: 'open'
        }
      }],
      columns: [
        'Project',
        'Category',
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
      'assetsCsvFormData',
      'assetTypes',
      'openProductions',
      'isAssetsLoading',
      'isAssetsLoadingError',
      'editAsset',
      'deleteAsset',
      'getAsset',
      'assetValidationColumns',
      'currentProduction',
      'getCurrentProduction'
    ])
  },

  created () {
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
              params: {production_id: this.getCurrentProduction.id}
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

    confirmCreateTasks (form) {
      this.loading.creatingTasks = true
      this.errors.creatingTasks = false
      this.$store.dispatch('createTasks', {
        task_type_id: form.task_type_id,
        type: 'assets',
        project_id: this.getCurrentProduction.id,
        callback: (err) => {
          this.loading.creatingTasks = false
          if (err) {
            this.errors.creatingTasks = true
          } else {
            this.modals.isCreateTasks = false
            this.$router.push({
              name: 'assets',
              params: {production_id: this.getCurrentProduction.id}
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
      } else if (path.indexOf('import') > 0) {
        this.modals.isImportDisplayed = true
      } else if (path.indexOf('create-tasks') > 0) {
        this.modals.isCreateTasksDisplayed = true
      } else {
        this.modals = {
          isNewDisplayed: false,
          isDeleteDisplayed: false,
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
            params: {production_id: this.getCurrentProduction.id}
          })
        } else {
          this.loading.importing = false
          this.errors.importing = true
        }
      })
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() },
    currentProduction () {
      const newPath = {
        name: 'assets',
        params: {production_id: this.getCurrentProduction.id}
      }
      if (this.$route.path.length === 56) this.$router.push(newPath)

      this.$store.dispatch('loadAssets')
    }
  }
}
</script>

<style scoped>
.assets-list {
  margin-top: 2em;
}
</style>
