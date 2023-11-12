<template>
  <div class="asset-types page fixed-page">
    <list-page-header
      :title="$t('asset_types.title')"
      :new-entry-label="$t('asset_types.new_asset_type')"
      @new-clicked="onNewClicked"
    />

    <route-tabs
      class="mt2"
      :active-tab="activeTab"
      :tabs="tabs"
      route-name="asset-types"
    />

    <asset-type-list
      class="asset-type-list"
      :entries="assetTypesList"
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
import AssetTypeList from '@/components/lists/AssetTypeList'
import DeleteModal from '@/components/modals/DeleteModal'
import EditAssetTypeModal from '@/components/modals/EditAssetTypeModal'
import ListPageHeader from '@/components/widgets/ListPageHeader'
import RouteTabs from '@/components/widgets/RouteTabs'

export default {
  name: 'asset-types',

  components: {
    AssetTypeList,
    DeleteModal,
    EditAssetTypeModal,
    ListPageHeader,
    RouteTabs
  },

  data() {
    return {
      activeTab: 'active',
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
      },
      tabs: [
        {
          name: 'active',
          label: this.$t('main.active')
        },
        {
          name: 'archived',
          label: this.$t('main.archived')
        }
      ]
    }
  },

  mounted() {
    this.activeTab = this.$route.query.tab || 'active'
  },

  computed: {
    ...mapGetters(['assetTypes', 'archivedAssetTypes', 'getAssetType']),

    assetTypesList() {
      return this.activeTab === 'active'
        ? this.assetTypes
        : this.archivedAssetTypes
    },

    deleteText() {
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

    confirmEditAssetType(form) {
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
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    confirmDeleteAssetType() {
      this.loading.del = true
      this.errors.del = false
      this.deleteAssetType(this.assetTypeToDelete)
        .then(() => {
          this.loading.del = false
          this.modals.del = false
        })
        .catch(err => {
          console.error(err)
          this.errors.del = true
          this.loading.del = false
        })
    },

    onNewClicked() {
      this.assetTypeToEdit = {}
      this.errors.edit = false
      this.modals.edit = true
    },

    onEditClicked(assetType) {
      this.assetTypeToEdit = assetType
      this.errors.edit = false
      this.modals.edit = true
    },

    onDeleteClicked(assetType) {
      this.assetTypeToDelete = assetType
      this.errors.del = false
      this.modals.del = true
    }
  },

  watch: {
    $route() {
      this.activeTab = this.$route.query.tab
    }
  },

  metaInfo() {
    return {
      title: `${this.$t('asset_types.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-type-list {
  margin-top: 0rem;
}
</style>
