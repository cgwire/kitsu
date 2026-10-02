<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <combobox-visible-options
        class="flexrow-item"
        :label="$t('asset_types.title')"
        :options="assetTypeOptions"
        v-model:hidden="hiddenAssetTypeIds"
      />
      <combobox-task-type-options
        class="flexrow-item"
        :label="$t('task_types.title')"
        :task-types="columnTaskTypes"
        v-model:hidden="hiddenTaskTypeIds"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.display_mode')"
        locale-key-prefix="statistics."
        :options="displayModeOptions"
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
        class="flexrow-item"
        icon="download"
        :title="$t('main.csv.export_file')"
        @click="exportStatisticsToCsv"
      />
    </div>

    <production-asset-type-list
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading || initialLoading"
      :is-error="isAssetsLoadingError"
      :is-filtered="displayedAssetTypes.length < usedAssetTypes.length"
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
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import preferences from '@/lib/preferences'
import { aggregateStats, omitStatsColumns } from '@/lib/stats'
import stringHelpers from '@/lib/string'

import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const DISPLAY_MODE_PREFERENCE = 'stats:asset-type-display-mode'

// A query param repeated in the URL reaches the page as an array of values.
const parseIds = queryValue =>
  [queryValue]
    .flat()
    .filter(Boolean)
    .flatMap(value => value.split(','))

const displayMode = ref(
  preferences.getPreference(DISPLAY_MODE_PREFERENCE) || 'pie'
)
const initialLoading = ref(true)
const hiddenAssetTypeIds = ref(parseIds(route.query.hiddenAssetTypes))
const hiddenTaskTypeIds = ref(parseIds(route.query.hiddenTaskTypes))

const displayModeOptions = [
  { label: 'pie', value: 'pie' },
  { label: 'count', value: 'count' },
  { label: 'bars', value: 'bars' },
  { label: 'heatmap', value: 'heatmap' }
]

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

const assetTypeOptions = computed(() =>
  usedAssetTypes.value.map(({ id, name }) => ({ label: name, value: id }))
)

const columnTaskTypes = computed(() =>
  assetValidationColumns.value
    .map(id => taskTypeMap.value.get(id))
    .filter(Boolean)
)

const displayedAssetTypes = computed(() =>
  usedAssetTypes.value.filter(
    assetType => !hiddenAssetTypeIds.value.includes(assetType.id)
  )
)

const displayedColumns = computed(() =>
  assetValidationColumns.value.filter(
    id => !hiddenTaskTypeIds.value.includes(id)
  )
)

// Totals only cover what is displayed: the "all" column of an asset type sums
// its visible task types, the "all" entry sums the visible asset types. The
// table and the CSV export both read these stats.
const displayedStats = computed(() => {
  const stats = assetTypeStats.value
  const ids = displayedAssetTypes.value
    .map(assetType => assetType.id)
    .filter(id => stats[id])
  const entries = Object.fromEntries(
    ids.map(id => [id, omitStatsColumns(stats[id], hiddenTaskTypeIds.value)])
  )
  return { ...entries, all: { all: {}, ...aggregateStats(entries, ids) } }
})

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

watch([hiddenAssetTypeIds, hiddenTaskTypeIds], () => {
  router.replace({
    query: {
      ...route.query,
      hiddenAssetTypes: hiddenAssetTypeIds.value.join(',') || undefined,
      hiddenTaskTypes: hiddenTaskTypeIds.value.join(',') || undefined
    }
  })
})

watch(displayMode, () => {
  preferences.setPreference(DISPLAY_MODE_PREFERENCE, displayMode.value)
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
