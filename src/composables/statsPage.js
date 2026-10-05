import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import preferences from '@/lib/preferences'
import { aggregateStats, omitStatsColumns } from '@/lib/stats'

export const STATS_DISPLAY_MODE_OPTIONS = [
  { label: 'pie', value: 'pie' },
  { label: 'count', value: 'count' },
  { label: 'bars', value: 'bars' },
  { label: 'heatmap', value: 'heatmap' }
]

// A query param repeated in the URL reaches the page as an array of values.
const parseIds = queryValue =>
  [queryValue]
    .flat()
    .filter(Boolean)
    .flatMap(value => value.split(','))

/*
 * Display state shared by the statistics pages: the display mode kept in the
 * preferences, and the rows and task type columns the user hid, kept in the
 * URL.
 *
 * rows and columnIds are refs: the entities listed by the page and the ids of
 * its task type columns. rowsParam names the URL param of the hidden rows.
 */
export const useStatsPage = ({ preferenceKey, rowsParam, rows, columnIds }) => {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  const displayMode = ref(preferences.getPreference(preferenceKey) || 'pie')
  const hiddenRowIds = ref(parseIds(route.query[rowsParam]))
  const hiddenColumnIds = ref(parseIds(route.query.hiddenTaskTypes))

  const rowOptions = computed(() =>
    rows.value.map(({ id, name }) => ({ label: name, value: id }))
  )

  const displayedRows = computed(() =>
    rows.value.filter(row => !hiddenRowIds.value.includes(row.id))
  )

  const isFiltered = computed(
    () => displayedRows.value.length < rows.value.length
  )

  const columnTaskTypes = computed(() =>
    columnIds.value.map(id => store.getters.taskTypeMap.get(id)).filter(Boolean)
  )

  const displayedColumns = computed(() =>
    columnIds.value.filter(id => !hiddenColumnIds.value.includes(id))
  )

  // Totals only cover what is displayed: the "all" column of a row sums its
  // visible task types, the "all" entry sums the displayed rows. The table
  // and the CSV export both read the result.
  const getDisplayedStats = (
    stats,
    { omitColumns = omitStatsColumns, aggregate = aggregateStats } = {}
  ) => {
    const ids = displayedRows.value.map(row => row.id).filter(id => stats[id])
    const entries = Object.fromEntries(
      ids.map(id => [id, omitColumns(stats[id], hiddenColumnIds.value)])
    )
    return { ...entries, all: { all: {}, ...aggregate(entries, ids) } }
  }

  // The page is reused when the route changes under it (another production
  // or episode): the hidden ids keep following the URL after the setup.
  watch(
    () => route.query,
    query => {
      hiddenRowIds.value = parseIds(query[rowsParam])
      hiddenColumnIds.value = parseIds(query.hiddenTaskTypes)
    }
  )

  watch([hiddenRowIds, hiddenColumnIds], () => {
    router.replace({
      query: {
        ...route.query,
        [rowsParam]: hiddenRowIds.value.join(',') || undefined,
        hiddenTaskTypes: hiddenColumnIds.value.join(',') || undefined
      }
    })
  })

  watch(displayMode, () => {
    preferences.setPreference(preferenceKey, displayMode.value)
  })

  return {
    columnTaskTypes,
    displayMode,
    displayedColumns,
    displayedRows,
    getDisplayedStats,
    hiddenColumnIds,
    hiddenRowIds,
    isFiltered,
    rowOptions
  }
}
