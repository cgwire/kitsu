<template>
  <div class="asset-types page fixed-page">

    <list-page-header
      :title="$t('asset_types.title')"
      :new-entry-label="$t('asset_types.new_asset_type')"
      @new-clicked="onNewClicked"
    />

    <asset-type-list
      class="mt2"
      :entries="assetTypes"
      :is-loading="loading.list"
      :is-error="errors.list"
      @edit-clicked="onEditClicked"
      @delete-clicked="onDeleteClicked"
    />

    <edit-asset-type-modal
      :active="modals.edit"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      :asset-type-to-edit="assetTypeToEdit"
      @cancel="modals.edit = false"
      @confirm="confirmEditAssetType"
    />

    <delete-modal
      :active="modals.del"
      :is-loading="loading.del"
      :is-error="errors.del"
      :text="deleteText"
      :error-text="$t('asset_types.delete_error')"
      @cancel="modals.del = false"
      @confirm="confirmDeleteAssetType"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AssetTypeList from '../lists/AssetTypeList'
import DeleteModal from '../modals/DeleteModal'
import EditAssetTypeModal from '../modals/EditAssetTypeModal'
import ListPageHeader from '../widgets/ListPageHeader'

export default {
  name: 'asset-types',

  components: {
    AssetTypeList,
    DeleteModal,
    EditAssetTypeModal,
    ListPageHeader
  },

  data () {
    return {
      assetTypeToDelete: null,
      assetTypeToEdit: {},
      choices: [],
      errors: {
        del: false,
        edit: false,
        list: false
      },
      modals: {
        del: false,
        edit: false
      },
      loading: {
        del: false,
        edit: false,
        list: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'assetTypes',
      'getAssetType'
    ]),

    deleteText () {
      const assetType = this.assetTypeToDelete
      if (assetType) {
        return this.$t('asset_types.delete_text', { name: assetType.name })
      } else {
        return ''
      }
    }
  },

  methods: {
    ...mapActions([
      'deleteAssetType',
      'editAssetType',
      'newAssetType',
      'loadAssetTypes'
    ]),

    confirmEditAssetType (form) {
      let action = 'newAssetType'
      if (this.assetTypeToEdit && this.assetTypeToEdit.id) {
        action = 'editAssetType'
        form.id = this.assetTypeToEdit.id
      }

      this.loading.edit = true
      this.errors.edit = false
      this[action](form)
        .then(() => {
          this.loading.edit = false
          this.modals.edit = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.edit = true
          this.modals.isNewDisplayed = false
        })
    },

    confirmDeleteAssetType () {
      this.loading.del = true
      this.errors.del = false
      this.deleteAssetType(this.assetTypeToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch((err) => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onNewClicked () {
      this.assetTypeToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked (assetType) {
      this.assetTypeToEdit = assetType
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked (assetType) {
      this.assetTypeToDelete = assetType
      this.errors.del = false
      this.modals.del = true
    }
  },

  watch: {
  },

  metaInfo () {
    return {
      title: `${this.$t('asset_types.title')} - Kitsu`
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
