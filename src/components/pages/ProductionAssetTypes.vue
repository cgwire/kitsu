<template>
  <div class="asset-types page fixed-page">
    <div class="asset-type-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="asset-type-search-field"
        @change="onSearchChange"
        placeholder="ex: chars, agent327"
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
        @click="exportStatisticsToCsv"
      />
    </div>

    <production-asset-type-list
      ref="asset-type-list"
      :entries="displayedAssetTypes"
      :is-loading="isAssetsLoading || initialLoading"
      :is-error="isAssetsLoadingError"
      :validation-columns="assetValidationColumns"
      :asset-type-stats="assetTypeStats"
      :display-mode="displayMode"
      :show-all="!assetTypeSearchText"
      @scroll="saveScrollPosition"
    />
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import moment from 'moment'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import ProductionAssetTypeList from '@/components/lists/ProductionAssetTypeList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import SearchField from '@/components/widgets/SearchField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const assetTypeListRef = useTemplateRef('asset-type-list')
const searchFieldRef = useTemplateRef('asset-type-search-field')

const displayMode = ref('pie')
const initialLoading = ref(true)

const displayModeOptions = [
  { label: 'pie', value: 'pie' },
  { label: 'count', value: 'count' }
]

// Computed
// --------------------------------------------------------------------------
const assetTypeListScrollPosition = computed(
  () => store.getters.assetTypeListScrollPosition
)
const assetTypeMap = computed(() => store.getters.assetTypeMap)
const assetTypeSearchText = computed(() => store.getters.assetTypeSearchText)
const assetTypeStats = computed(() => store.getters.assetTypeStats)
const assetValidationColumns = computed(
  () => store.getters.assetValidationColumns
)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedAssetTypes = computed(() => store.getters.displayedAssetTypes)
const isAssetsLoading = computed(() => store.getters.isAssetsLoading)
const isAssetsLoadingError = computed(() => store.getters.isAssetsLoadingError)
const isTVShow = computed(() => store.getters.isTVShow)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// Functions
// --------------------------------------------------------------------------
const onSearchChange = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  store.dispatch('setAssetTypeSearch', searchQuery)
  router.push({
    query: { ...route.query, search: searchQuery || undefined }
  })
}

const setSearchFromUrl = () => {
  const searchFromUrl = route.query.search
  if (!searchFieldRef.value?.getValue() && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
}

const saveScrollPosition = scrollPosition => {
  store.dispatch('setAssetTypeListScrollPosition', scrollPosition)
}

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
    assetTypeStats.value,
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
  store.dispatch('setAssetTypeListScrollPosition', 0)
  initialLoading.value = false
  setSearchFromUrl()
  onSearchChange()
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
  if (assetTypeSearchText.value) {
    searchFieldRef.value.setValue(assetTypeSearchText.value)
  }
  assetTypeListRef.value.setScrollPosition(assetTypeListScrollPosition.value)
  setTimeout(reset, 100)
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () =>
      `${currentProduction.value?.name} | ${t('asset_types.production_title')} - Kitsu`
  )
})
</script>
