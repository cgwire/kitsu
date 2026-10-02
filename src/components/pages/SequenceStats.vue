<template>
  <div class="sequences page fixed-page">
    <div class="sequence-list-header page-header flexrow">
      <search-field
        class="flexrow-item search-field"
        ref="sequence-search-field"
        :can-save="true"
        @change="onSearchChange"
        @save="saveSearchQuery"
        placeholder="ex: e01 s01"
      />
      <combobox-visible-options
        class="flexrow-item options-filter"
        :label="$t('sequences.title')"
        :options="sequenceOptions"
        v-model:hidden="hiddenSequenceIds"
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
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.count_mode')"
        locale-key-prefix="statistics."
        :options="countModeOptions"
        v-model="countMode"
      />
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :title="$t('main.reload')"
        @click="reloadData"
      />
      <button-simple
        class="flexrow-item export-button"
        icon="download"
        :title="$t('main.csv.export_file')"
        @click="exportStatisticsToCsv"
      />
    </div>

    <div class="query-list mt1">
      <search-query-list
        :queries="sequenceSearchQueries"
        type="sequenceStat"
        :production-id="currentProduction?.id"
        @remove-search="removeSearchQuery"
      />
    </div>

    <sequence-stats-list
      :count-mode="countMode"
      :display-mode="displayMode"
      :entries="displayedSequences"
      :is-loading="isShotsLoading || initialLoading"
      :is-error="isShotsLoadingError"
      :is-filtered="isFiltered"
      :validation-columns="displayedColumns"
      :sequence-stats="displayedStats"
      :shot-counts="sequenceShotCounts"
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

import {
  STATS_DISPLAY_MODE_OPTIONS,
  useStatsPage
} from '@/composables/statsPage'
import csv from '@/lib/csv'
import stringHelpers from '@/lib/string'

import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'
import SearchField from '@/components/widgets/SearchField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const searchFieldRef = useTemplateRef('sequence-search-field')

const countMode = ref('count')
const initialLoading = ref(true)
const isSavingSearch = ref(false)

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isShotsLoading = computed(() => store.getters.isShotsLoading)
const isShotsLoadingError = computed(() => store.getters.isShotsLoadingError)
const isTVShow = computed(() => store.getters.isTVShow)
const searchedSequences = computed(() => store.getters.displayedSequences)
const searchSequenceFilters = computed(
  () => store.getters.searchSequenceFilters
)
const sequenceMap = computed(() => store.getters.sequenceMap)
const sequenceSearchQueries = computed(
  () => store.getters.sequenceSearchQueries
)
const sequenceShotCounts = computed(() => store.getters.sequenceShotCounts)
const sequenceStats = computed(() => store.getters.sequenceStats)
const shotValidationColumns = computed(
  () => store.getters.shotValidationColumns
)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const countModeOptions = computed(() => [
  { label: 'shots', value: 'count' },
  isPaperProduction.value
    ? { label: 'drawings', value: 'drawings' }
    : { label: 'frames', value: 'frames' }
])

// The selector works on the result of the search: both narrow the table.
const {
  columnTaskTypes,
  displayMode,
  displayedColumns,
  displayedRows: displayedSequences,
  getDisplayedStats,
  hiddenColumnIds: hiddenTaskTypeIds,
  hiddenRowIds: hiddenSequenceIds,
  isFiltered,
  rowOptions: sequenceOptions
} = useStatsPage({
  preferenceKey: 'stats:sequence-display-mode',
  rowsParam: 'hiddenSequences',
  rows: searchedSequences,
  columnIds: shotValidationColumns
})

const displayedStats = computed(() => getDisplayedStats(sequenceStats.value))

// Functions
// --------------------------------------------------------------------------
const loadSequences = async () => {
  try {
    await store.dispatch('loadShots')
    await store.dispatch('initSequences')
  } catch (err) {
    console.error(err)
  }
}

const reloadData = async () => {
  initialLoading.value = true
  try {
    await store.dispatch('loadShots')
    store.dispatch('computeSequenceStats')
  } catch (err) {
    console.error(err)
  }
  initialLoading.value = false
}

const setSearchFromUrl = () => {
  const searchFromUrl = route.query.search
  if (!searchFieldRef.value?.getValue() && searchFromUrl) {
    searchFieldRef.value?.setValue(searchFromUrl)
  }
}

const onSearchChange = () => {
  const searchQuery = searchFieldRef.value?.getValue()
  router.replace({
    query: { ...route.query, search: searchQuery || undefined }
  })
  store.dispatch('setSequenceStatsSearch', searchQuery)
}

const saveSearchQuery = async searchQuery => {
  if (isSavingSearch.value) return
  isSavingSearch.value = true
  try {
    await store.dispatch('saveSequenceSearch', searchQuery)
  } catch (err) {
    console.error(err)
  }
  isSavingSearch.value = false
}

const removeSearchQuery = searchQuery => {
  store.dispatch('removeSequenceSearch', searchQuery).catch(console.error)
}

const exportStatisticsToCsv = () => {
  const nameData = [
    moment().format('YYYYMMDD'),
    currentProduction.value.name,
    ...(currentEpisode.value ? [currentEpisode.value.name] : []),
    'sequences',
    'statistics'
  ]
  const name = stringHelpers.slugify(nameData.join('_'))
  csv.generateStatReports(
    name,
    displayedStats.value,
    taskTypeMap.value,
    taskStatusMap.value,
    sequenceMap.value,
    countMode.value,
    currentProduction.value
  )
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, () => {
  searchFieldRef.value.setValue('')
  countMode.value = 'count'
  if (!isTVShow.value) loadSequences()
})

watch(currentEpisode, async () => {
  if (isTVShow.value && currentEpisode.value) {
    await loadSequences()
    initialLoading.value = false
  }
})

watch(
  searchSequenceFilters,
  () => {
    store.dispatch('computeSequenceStats')
  },
  { deep: true }
)

watch(
  () => route.query.search,
  search => {
    searchFieldRef.value?.setValue(search)
    onSearchChange()
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  await loadSequences()
  initialLoading.value = false
  setSearchFromUrl()
  onSearchChange()
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => {
    const production = currentProduction.value?.name || ''
    const episode = isTVShow.value
      ? ` - ${currentEpisode.value?.name || ''}`
      : ''
    return `${production}${episode} | ${t('sequences.title')} - Kitsu`
  })
})
</script>

<style lang="scss" scoped>
// The filters carry a label above them, so the row is aligned on its bottom.
// Its controls differ in height (select 42px, option combos 40px, buttons
// 32px): the bottom margins centre them all on the select.
.sequence-list-header {
  align-items: flex-end;

  .options-filter {
    margin-bottom: 1px;
  }

  .button {
    margin-bottom: 5px;
  }
}

@media screen and (max-width: 768px) {
  .sequence-list-header {
    flex-wrap: wrap;
    margin-top: 1em;
    row-gap: 0.5em;

    .flexrow-item {
      margin-right: 0.5em;
    }

    // The search field takes the first line: detach it from the filters.
    .search-field {
      margin-bottom: 0.5em;
      margin-right: 0;
    }

    // The two option filters share a line, which sends Display to the next
    // one, next to Count.
    .options-filter {
      flex: 1 1 40%;
    }

    // When the buttons wrap under the filters, they stay on the right edge.
    .button {
      margin-left: auto;
      margin-right: 0;
    }
  }

  // Mobile is read-only.
  .export-button {
    display: none;
  }

  // Without saved searches this block is empty: its margin only pushed the
  // cards down.
  .query-list {
    margin-bottom: 0;
  }
}
</style>
