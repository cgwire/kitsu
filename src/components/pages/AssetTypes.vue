<template>
  <div class="asset-types page fixed-page">
    <list-page-header
      :title="$t('asset_types.library_title')"
      :new-entry-label="$t('asset_types.new_asset_type')"
      :is-exportable="isActiveTab"
      @export-clicked="onExportClicked"
      @new-clicked="onNewClicked"
    />

    <route-tabs class="mt2" :active-tab="activeTab" :tabs="tabs" />

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

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import AssetTypeList from '@/components/lists/AssetTypeList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditAssetTypeModal from '@/components/modals/EditAssetTypeModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

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
    ...mapGetters([
      'assetTypes',
      'archivedAssetTypes',
      'getAssetType',
      'taskTypeMap'
    ]),

    isActiveTab() {
      return this.activeTab === 'active'
    },

    assetTypesList() {
      return this.isActiveTab ? this.assetTypes : this.archivedAssetTypes
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

    onExportClicked() {
      const name = stringHelpers.slugify(this.$t('asset_types.title'))
      const headers = [
        this.$t('main.type'),
        this.$t('asset_types.fields.name'),
        this.$t('asset_types.fields.short_name'),
        this.$t('asset_types.fields.description'),
        this.$t('asset_types.fields.task_types')
      ]
      const entries = [headers].concat(
        this.assetTypes.map(assetType => [
          assetType.type,
          assetType.name,
          assetType.short_name,
          assetType.description,
          assetType.task_types.length
            ? assetType.task_types
                .map(taskTypeId => this.taskTypeMap.get(taskTypeId)?.name)
                .join(', ')
            : this.$t('asset_types.include_all')
        ])
      )
      csv.buildCsvFile(name, entries)
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
    '$route.query.tab'() {
      this.activeTab = this.$route.query.tab || 'active'
    }
  },

  head() {
    return {
      title: `${this.$t('asset_types.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-type-list {
  margin-top: 0;
}
</style>
