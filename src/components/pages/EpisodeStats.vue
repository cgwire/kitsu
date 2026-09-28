<template>
  <div class="episodes page fixed-page">
    <div class="episode-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="episode-search-field"
        placeholder="ex: e01 s01, anim=wip"
        @change="onSearchChange"
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
        :options="displayModeOptions"
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
        class="flexrow-item"
        :disabled="isLoading"
        icon="download"
        @click="exportStatisticsToCsv"
      />
    </div>

    <episode-stats-list
      ref="episode-list"
      :count-mode="countMode"
      :data-mode="dataMode"
      :display-mode="displayMode"
      :entries="episodeEntries"
      :is-loading="isLoading"
      :is-error="isLoadingError"
      :show-all="!episodeSearchText"
      :validation-columns="episodeValidationColumns"
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
import preferences from '@/lib/preferences'
import stringHelpers from '@/lib/string'

import EpisodeStatsList from '@/components/lists/EpisodeStatsList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
import SearchField from '@/components/widgets/SearchField.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()

// State
// --------------------------------------------------------------------------
const episodeListRef = useTemplateRef('episode-list')
const searchFieldRef = useTemplateRef('episode-search-field')

const countMode = ref('count')
const dataMode = ref('retakes')
const displayMode = ref('pie')
const isLoading = ref(true)
const isLoadingError = ref(false)
const statusMode = ref('running')

const dataModeOptions = [
  { label: 'retakes', value: 'retakes' },
  { label: 'status', value: 'status' }
]
const displayModeOptions = [
  { label: 'pie', value: 'pie' },
  { label: 'count', value: 'count' }
]
const statusModeOptions = [
  { label: 'only_running', value: 'running' },
  { label: 'all', value: 'all' }
]

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const displayedEpisodes = computed(() => store.getters.displayedEpisodes)
const episodeListScrollPosition = computed(
  () => store.getters.episodeListScrollPosition
)
const episodeMap = computed(() => store.getters.episodeMap)
const episodeRetakeStats = computed(() => store.getters.episodeRetakeStats)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
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
  router.push({
    query: { ...route.query, search: searchQuery || undefined }
  })
  store.dispatch('setEpisodeSearch', searchQuery)
}

const saveScrollPosition = scrollPosition => {
  store.dispatch('setEpisodeListScrollPosition', scrollPosition)
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
    isRetakeDataMode.value ? episodeRetakeStats.value : episodeStats.value,
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
  store.commit('SET_EPISODE_LIST_SCROLL_POSITION', 0)
  reset()
})

watch(dataMode, () => {
  preferences.setPreference('stats:episode-mode', dataMode.value)
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(async () => {
  dataMode.value = preferences.getPreference('stats:episode-mode') || 'retakes'
  episodeListRef.value.setScrollPosition(episodeListScrollPosition.value)
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
    () => `${currentProduction.value?.name} ${t('episodes.title')} - Kitsu`
  )
})
</script>
