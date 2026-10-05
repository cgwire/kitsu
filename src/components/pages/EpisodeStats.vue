<template>
  <div class="episodes page fixed-page">
    <div class="episode-list-header page-header flexrow">
      <search-field
        class="flexrow-item search-field"
        ref="episode-search-field"
        placeholder="ex: e01"
        @change="onSearchChange"
      />
      <combobox-visible-options
        class="flexrow-item options-filter"
        :label="$t('episodes.title')"
        :options="episodeOptions"
        v-model:hidden="hiddenEpisodeIds"
      />
      <combobox-task-type-options
        class="flexrow-item options-filter"
        :label="$t('task_types.title')"
        :task-types="columnTaskTypes"
        v-model:hidden="hiddenTaskTypeIds"
      />
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :label="$t('statistics.data_mode')"
        :options="dataModeOptions"
        v-model="dataMode"
      />
      <combobox
        class="mb0 flexrow-item"
        locale-key-prefix="statistics."
        :label="$t('statistics.display_mode')"
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
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.episode_status')"
        locale-key-prefix="statistics."
        :options="statusModeOptions"
        v-model="statusMode"
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
        :disabled="isLoading"
        icon="download"
        :title="$t('main.csv.export_file')"
        @click="exportStatisticsToCsv"
      />
    </div>

    <episode-stats-list
      :count-mode="countMode"
      :data-mode="dataMode"
      :display-mode="displayMode"
      :entries="displayedEpisodeEntries"
      :episode-retake-stats="displayedRetakeStats"
      :episode-stats="displayedStats"
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :is-filtered="isFiltered"
      :validation-columns="displayedColumns"
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
import preferences from '@/lib/preferences'
import {
  aggregateRetakeStats,
  omitRetakeStatsColumns,
  omitStatsColumns
} from '@/lib/stats'
import stringHelpers from '@/lib/string'

import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import ComboboxTaskTypeOptions from '@/components/widgets/ComboboxTaskTypeOptions.vue'
import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'
import SearchField from '@/components/widgets/SearchField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const DATA_MODE_PREFERENCE = 'stats:episode-mode'

const searchFieldRef = useTemplateRef('episode-search-field')

const countMode = ref('count')
const dataMode = ref(
  preferences.getPreference(DATA_MODE_PREFERENCE) || 'retakes'
)
const isLoading = ref(true)
const isLoadingError = ref(false)
const statusMode = ref('running')

const dataModeOptions = [
  { label: 'retakes', value: 'retakes' },
  { label: 'status', value: 'status' }
]
const statusModeOptions = [
  { label: 'only_running', value: 'running' },
  { label: 'all', value: 'all' }
]

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const displayedEpisodes = computed(() => store.getters.displayedEpisodes)
const episodeMap = computed(() => store.getters.episodeMap)
const episodeRetakeStats = computed(() => store.getters.episodeRetakeStats)
const episodeStats = computed(() => store.getters.episodeStats)
const episodeValidationColumns = computed(
  () => store.getters.episodeValidationColumns
)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const countModeOptions = computed(() => [
  { label: 'shots', value: 'count' },
  isPaperProduction.value
    ? { label: 'drawings', value: 'drawings' }
    : { label: 'frames', value: 'frames' }
])

const episodeEntries = computed(() =>
  statusMode.value === 'running'
    ? displayedEpisodes.value.filter(episode => episode.status === 'running')
    : displayedEpisodes.value
)

const isRetakeDataMode = computed(() => dataMode.value === 'retakes')

// The selector works on the result of the search and of the status filter.
const {
  columnTaskTypes,
  displayMode,
  displayedColumns,
  displayedRows: displayedEpisodeEntries,
  getDisplayedStats,
  hiddenColumnIds: hiddenTaskTypeIds,
  hiddenRowIds: hiddenEpisodeIds,
  isFiltered,
  rowOptions: episodeOptions
} = useStatsPage({
  preferenceKey: 'stats:episode-display-mode',
  rowsParam: 'hiddenEpisodes',
  rows: episodeEntries,
  columnIds: episodeValidationColumns
})

// The server totals an episode by counting each shot once, which is not the
// sum of its task type columns: its "all" column is kept as long as every
// column is displayed, and rebuilt from the visible ones otherwise.
const omitWhenHidden = omitColumns => (entryStats, hiddenColumnIds) =>
  hiddenColumnIds.length > 0
    ? omitColumns(entryStats, hiddenColumnIds)
    : entryStats

const displayedStats = computed(() =>
  getDisplayedStats(episodeStats.value, {
    omitColumns: omitWhenHidden(omitStatsColumns)
  })
)

const displayedRetakeStats = computed(() =>
  getDisplayedStats(episodeRetakeStats.value, {
    omitColumns: omitWhenHidden(omitRetakeStatsColumns),
    aggregate: aggregateRetakeStats
  })
)

// Functions
// --------------------------------------------------------------------------
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
  store.dispatch('setEpisodeSearch', searchQuery)
}

const exportStatisticsToCsv = () => {
  const nameData = [
    moment().format('YYYYMMDD'),
    currentProduction.value.name,
    'episodes',
    ...(isRetakeDataMode.value ? ['retake'] : []),
    'statistics'
  ]
  const name = stringHelpers.slugify(nameData.join('_'))
  const generateReports = isRetakeDataMode.value
    ? csv.generateRetakeStatReports
    : csv.generateStatReports
  generateReports(
    name,
    isRetakeDataMode.value ? displayedRetakeStats.value : displayedStats.value,
    taskTypeMap.value,
    taskStatusMap.value,
    episodeMap.value,
    countMode.value,
    currentProduction.value
  )
}

const reset = async () => {
  isLoading.value = true
  isLoadingError.value = false
  countMode.value = 'count'
  try {
    await store.dispatch('loadEpisodeStats', currentProduction.value.id)
    await store.dispatch('loadEpisodeRetakeStats', currentProduction.value.id)
  } catch (err) {
    console.error(err)
    isLoadingError.value = true
  }
  isLoading.value = false
}

// Watchers
// --------------------------------------------------------------------------
watch(currentProduction, () => {
  searchFieldRef.value.setValue('')
  reset()
})

watch(dataMode, () => {
  preferences.setPreference(DATA_MODE_PREFERENCE, dataMode.value)
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  setSearchFromUrl()
  try {
    await store.dispatch('initEpisodeStats')
    onSearchChange()
  } catch (err) {
    console.error(err)
    isLoadingError.value = true
  }
  isLoading.value = false
})

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(
    () =>
      `${currentProduction.value?.name || ''} ${t('episodes.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
// The filters carry a label above them, so the row is aligned on its bottom.
// Its controls differ in height (select 42px, option combos 40px, buttons
// 32px): the bottom margins centre them all on the select.
.episode-list-header {
  align-items: flex-end;
  // Nine controls do not fit on one line below a wide desktop.
  flex-wrap: wrap;
  row-gap: 0.5em;

  .options-filter {
    margin-bottom: 1px;
  }

  .button {
    margin-bottom: 5px;
  }
}

@media screen and (max-width: 768px) {
  .episode-list-header {
    margin-top: 1em;

    .flexrow-item {
      margin-right: 0.5em;
    }

    // The search field takes the first line: detach it from the filters.
    .search-field {
      margin-bottom: 0.5em;
      margin-right: 0;
    }

    // The two option filters share a line, the comboboxes wrap after them.
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
}
</style>
