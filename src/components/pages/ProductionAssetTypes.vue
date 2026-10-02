<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <combobox-visible-options
        class="flexrow-item options-filter"
        :label="$t('asset_types.title')"
        :options="assetTypeOptions"
        v-model:hidden="hiddenAssetTypeIds"
      />
      <combobox-task-type-options
        class="flexrow-item options-filter"
        :label="$t('task_types.title')"
        :task-types="columnTaskTypes"
        v-model:hidden="hiddenTaskTypeIds"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.display_mode')"
        locale-key-prefix="statistics."
        :options="STATS_DISPLAY_MODE_OPTIONS"
        v-model="displayMode"
      />
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :title="$t('main.reload')"
        @click="reset"
      />
      <button-simple
        class="flexrow-item export-button"
        icon="download"
        :title="$t('main.csv.export_file')"
        @click="exportStatisticsToCsv"
      />
    </div>

    <production-asset-type-list
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading || initialLoading"
      :is-error="isAssetsLoadingError"
      :is-filtered="isFiltered"
      :validation-columns="displayedColumns"
      :asset-type-stats="displayedStats"
      :asset-counts="assetTypeAssetCounts"
      :display-mode="displayMode"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import moment from 'moment'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import {
  STATS_DISPLAY_MODE_OPTIONS,
  useStatsPage
} from '@/composables/statsPage'
import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const { t } = useI18n()
const store = useStore()

// State
// --------------------------------------------------------------------------
const initialLoading = ref(true)

// Computed
// --------------------------------------------------------------------------
const assetTypeAssetCounts = computed(() => store.getters.assetTypeAssetCounts)
const assetTypeMap = computed(() => store.getters.assetTypeMap)
const assetTypeStats = computed(() => store.getters.assetTypeStats)
const assetValidationColumns = computed(
  () => store.getters.assetValidationColumns
)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isAssetsLoading = computed(() => store.getters.isAssetsLoading)
const isAssetsLoadingError = computed(() => store.getters.isAssetsLoadingError)
const isTVShow = computed(() => store.getters.isTVShow)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)
const usedAssetTypes = computed(() => store.getters.usedAssetTypes)

const {
  columnTaskTypes,
  displayMode,
  displayedColumns,
  displayedRows: displayedAssetTypes,
  getDisplayedStats,
  hiddenColumnIds: hiddenTaskTypeIds,
  hiddenRowIds: hiddenAssetTypeIds,
  isFiltered,
  rowOptions: assetTypeOptions
} = useStatsPage({
  preferenceKey: 'stats:asset-type-display-mode',
  rowsParam: 'hiddenAssetTypes',
  rows: usedAssetTypes,
  columnIds: assetValidationColumns
})

const displayedStats = computed(() => getDisplayedStats(assetTypeStats.value))

// Functions
// --------------------------------------------------------------------------
const exportStatisticsToCsv = () => {
  const nameData = [
    moment().format('YYYYMMDD'),
    currentProduction.value.name,
    ...(currentEpisode.value ? [currentEpisode.value.name] : []),
    'asset_types',
    'statistics'
  ]
  const name = stringHelpers.slugify(nameData.join('_'))
  csv.generateStatReports(
    name,
    displayedStats.value,
    taskTypeMap.value,
    taskStatusMap.value,
    assetTypeMap.value,
    'count',
    currentProduction.value
  )
}

const reset = async () => {
  initialLoading.value = true
  await store.dispatch('loadAssets')
  store.dispatch('computeAssetTypeStats')
  initialLoading.value = false
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, () => {
  if (!isTVShow.value) reset()
})

watch(currentEpisode, () => {
  if (isTVShow.value) reset()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  store.dispatch('setLastProductionScreen', 'production-asset-types')
  reset()
})

// Head
// --------------------------------------------------------------------------
const episodeName = computed(() => {
  if (!isTVShow.value || !currentEpisode.value) return ''
  if (currentEpisode.value.id === 'all') return t('main.all')
  if (currentEpisode.value.id === 'main') return t('main.main_pack')
  return currentEpisode.value.name
})

useHead({
  title: computed(() => {
    const production = currentProduction.value?.name || ''
    const episode = episodeName.value ? ` - ${episodeName.value}` : ''
    return `${production}${episode} | ${t('asset_types.production_title')} - Kitsu`
  })
})
</script>

<style lang="scss" scoped>
// The filters carry a label above them, so the row is aligned on its bottom.
// Its controls differ in height (select 42px, option combos 40px, buttons
// 32px): the bottom margins centre them all on the select.
.asset-type-list-header {
  align-items: flex-end;

  .options-filter {
    margin-bottom: 1px;
  }

  .button {
    margin-bottom: 5px;
  }
}

@media screen and (max-width: 768px) {
  .asset-type-list-header {
    flex-wrap: wrap;
    margin-top: 1em;
    row-gap: 0.5em;
  }

  // Mobile is read-only.
  .export-button {
    display: none;
  }

  // Tighter gaps leave room for the reload button next to the filters. When
  // longer labels still wrap it under them, it stays on the right edge.
  .asset-type-list-header {
    .flexrow-item {
      margin-right: 0.5em;
    }

    .button {
      margin-left: auto;
      margin-right: 0;
    }
  }
}
</style>
