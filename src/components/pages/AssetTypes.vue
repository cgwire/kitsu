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

<script setup>
import { useHead } from '@unhead/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import AssetTypeList from '@/components/lists/AssetTypeList.vue'
import DeleteModal from '@/components/modals/DeleteModal.vue'
import EditAssetTypeModal from '@/components/modals/EditAssetTypeModal.vue'
import ListPageHeader from '@/components/widgets/ListPageHeader.vue'
import RouteTabs from '@/components/widgets/RouteTabs.vue'

const { t } = useI18n()
const route = useRoute()
const store = useStore()

// State

const activeTab = ref('active')
const assetTypeToDelete = ref(null)
const assetTypeToEdit = ref({})

const errors = reactive({ del: false, edit: false, list: false })
const loading = reactive({ del: false, edit: false, list: false })
const modals = reactive({ del: false, edit: false })

// Computed

const archivedAssetTypes = computed(() => store.getters.archivedAssetTypes)
const assetTypes = computed(() => store.getters.assetTypes)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isActiveTab = computed(() => activeTab.value === 'active')

const assetTypesList = computed(() =>
  isActiveTab.value ? assetTypes.value : archivedAssetTypes.value
)

const tabs = computed(() => [
  { name: 'active', label: t('main.active') },
  { name: 'archived', label: t('main.archived') }
])

const deleteText = computed(() => {
  const assetType = assetTypeToDelete.value
  return assetType ? t('asset_types.delete_text', { name: assetType.name }) : ''
})

// Functions

const confirmEditAssetType = async form => {
  loading.edit = true
  errors.edit = false
  try {
    if (assetTypeToEdit.value?.id) {
      await store.dispatch('editAssetType', {
        ...form,
        id: assetTypeToEdit.value.id
      })
    } else {
      await store.dispatch('newAssetType', form)
    }
    modals.edit = false
  } catch (err) {
    console.error(err)
    errors.edit = true
  }
  loading.edit = false
}

const confirmDeleteAssetType = async () => {
  loading.del = true
  errors.del = false
  try {
    await store.dispatch('deleteAssetType', assetTypeToDelete.value)
    modals.del = false
  } catch (err) {
    console.error(err)
    errors.del = true
  }
  loading.del = false
}

const onExportClicked = () => {
  const name = stringHelpers.slugify(t('asset_types.title'))
  const headers = [
    t('main.type'),
    t('asset_types.fields.name'),
    t('asset_types.fields.short_name'),
    t('asset_types.fields.description'),
    t('asset_types.fields.task_types')
  ]
  const rows = assetTypes.value.map(assetType => [
    assetType.type,
    assetType.name,
    assetType.short_name,
    assetType.description,
    assetType.task_types.length
      ? assetType.task_types
          .map(taskTypeId => taskTypeMap.value.get(taskTypeId)?.name)
          .join(', ')
      : t('asset_types.include_all')
  ])
  csv.buildCsvFile(name, [headers, ...rows])
}

const onNewClicked = () => {
  assetTypeToEdit.value = {}
  errors.edit = false
  modals.edit = true
}

const onEditClicked = assetType => {
  assetTypeToEdit.value = assetType
  errors.edit = false
  modals.edit = true
}

const onDeleteClicked = assetType => {
  assetTypeToDelete.value = assetType
  errors.del = false
  modals.del = true
}

// Watchers

watch(
  () => route.query.tab,
  tab => {
    activeTab.value = tab || 'active'
  }
)

// Lifecycle

onMounted(() => {
  activeTab.value = route.query.tab || 'active'
})

// Head

useHead({ title: computed(() => `${t('asset_types.title')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.asset-type-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .asset-types {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
</style>
