<template>
  <div class="sequences page fixed-page">
    <div class="sequence-list-header page-header flexrow">
      <search-field
        class="flexrow-item mt1"
        ref="sequence-search-field"
        :can-save="true"
        @change="onSearchChange"
        @save="saveSearchQuery"
        placeholder="ex: e01 s01 anim=wip"
      />
      <combobox
        class="mb0 flexrow-item"
        :label="$t('statistics.display_mode')"
        locale-key-prefix="statistics."
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
      <span class="filler"></span>
      <button-simple
        class="flexrow-item"
        icon="refresh"
        :title="$t('main.reload')"
        @click="reloadData"
      />
      <button-simple
        class="flexrow-item"
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
      ref="sequence-list"
      :count-mode="countMode"
      :display-mode="displayMode"
      :entries="displayedSequences"
      :is-loading="isShotsLoading || initialLoading"
      :is-error="isShotsLoadingError"
      :validation-columns="shotValidationColumns"
      :sequence-stats="sequenceStats"
      :show-all="!sequenceSearchText"
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

import SequenceStatsList from '@/components/lists/SequenceStatsList.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import Combobox from '@/components/widgets/Combobox.vue'
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
const displayMode = ref('pie')
const initialLoading = ref(true)
const isSavingSearch = ref(false)

const displayModeOptions = [
  { label: 'pie', value: 'pie' },
  { label: 'count', value: 'count' }
]

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedSequences = computed(() => store.getters.displayedSequences)
const isPaperProduction = computed(() => store.getters.isPaperProduction)
const isShotsLoading = computed(() => store.getters.isShotsLoading)
const isShotsLoadingError = computed(() => store.getters.isShotsLoadingError)
const isTVShow = computed(() => store.getters.isTVShow)
const searchSequenceFilters = computed(
  () => store.getters.searchSequenceFilters
)
const sequenceMap = computed(() => store.getters.sequenceMap)
const sequenceSearchQueries = computed(
  () => store.getters.sequenceSearchQueries
)
const sequenceSearchText = computed(() => store.getters.sequenceSearchText)
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
  await store.dispatch('loadShots')
  initialLoading.value = false
  store.dispatch('computeSequenceStats')
}

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

const saveScrollPosition = scrollPosition => {
  store.dispatch('setSequenceListScrollPosition', scrollPosition)
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
    sequenceStats.value,
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
  store.commit('SET_SEQUENCE_LIST_SCROLL_POSITION', 0)
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
  // Wait for the stats to be computed before filtering them.
  setTimeout(() => {
    setSearchFromUrl()
    onSearchChange()
  }, 100)
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
