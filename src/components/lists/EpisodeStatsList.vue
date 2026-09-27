<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th class="expander"></th>
            <th scope="col" class="name datatable-row-header">
              {{ $t('shots.fields.episode') }}
            </th>
            <th scope="col" class="validation">{{ $t('main.all') }}</th>
            <th
              scope="col"
              class="validation validation-cell"
              :key="columnId"
              v-for="columnId in validationColumns"
            >
              <div
                class="flexrow validation-content"
                :style="getValidationStyle(columnId)"
              >
                <router-link
                  class="flexrow-item ellipsis"
                  :title="taskTypeMap.get(columnId)?.name"
                  :to="taskTypePath(columnId)"
                  v-if="!isCurrentUserClient"
                >
                  {{ taskTypeMap.get(columnId)?.name }}
                </router-link>
                <span
                  class="flexrow-item ellipsis"
                  :title="taskTypeMap.get(columnId)?.name"
                  v-else
                >
                  {{ taskTypeMap.get(columnId)?.name }}
                </span>
              </div>
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isLoading">
          <tr class="all-line datatable-row" v-if="showAll && !isEmptyList">
            <td class="expander"></td>

            <td scope="col" class="name datatable-row-header">
              {{ $t('episodes.all_episodes') }}
            </td>

            <stats-cell
              :colors="chartColors('all', 'all')"
              :data="chartData('all', 'all')"
              :frames-data="chartData('all', 'all', 'frames')"
              :drawings-data="chartData('all', 'all', 'drawings')"
              :count-mode="countMode"
              :display-mode="displayMode"
            />

            <stats-cell
              :style="getValidationStyle(columnId)"
              :key="'all-' + columnId"
              :colors="chartColors('all', columnId)"
              :data="chartData('all', columnId)"
              :frames-data="chartData('all', columnId, 'frames')"
              :drawings-data="chartData('all', columnId, 'drawings')"
              :count-mode="countMode"
              :display-mode="displayMode"
              v-for="columnId in validationColumns"
            />

            <td class="actions"></td>
          </tr>

          <template v-for="entry in entries" :key="entry.id">
            <tr class="datatable-row">
              <td
                class="expander"
                role="button"
                tabindex="0"
                @click="toggleExpanded(entry.id)"
                @keydown.enter.prevent="toggleExpanded(entry.id)"
              >
                <chevron-right-icon
                  v-if="isRetakes && expanded[entry.id] !== true"
                />
                <chevron-down-icon
                  v-if="isRetakes && expanded[entry.id] === true"
                />
              </td>

              <td class="name datatable-row-header">
                {{ entry.name }}
              </td>

              <stats-cell
                :colors="chartColors(entry.id, 'all')"
                :data="chartData(entry.id, 'all')"
                :frames-data="chartData(entry.id, 'all', 'frames')"
                :drawings-data="chartData(entry.id, 'all', 'drawings')"
                :count-mode="countMode"
                :display-mode="displayMode"
                v-if="isStats(entry.id, 'all')"
              />
              <td v-else></td>

              <template v-for="columnId in validationColumns">
                <stats-cell
                  :key="entry.id + columnId"
                  :style="getValidationStyle(columnId)"
                  :colors="chartColors(entry.id, columnId)"
                  :data="chartData(entry.id, columnId)"
                  :frames-data="chartData(entry.id, columnId, 'frames')"
                  :drawings-data="chartData(entry.id, columnId, 'drawings')"
                  :count-mode="countMode"
                  :display-mode="displayMode"
                  :label="chartLabel(entry.id, columnId)"
                  :label-color="chartLabelColor(entry.id, columnId)"
                  v-if="isStats(entry.id, columnId)"
                />
                <td
                  :key="entry.id + columnId + '-td'"
                  :style="getValidationStyle(columnId)"
                  v-else
                ></td>
              </template>

              <td class="actions"></td>
            </tr>
            <template v-if="expanded[entry.id]">
              <tr
                class="datatable-row"
                :key="takeNumber + '-' + entry.id"
                v-for="takeNumber in takeRange(entry.id)"
              >
                <td class="expander"></td>
                <td class="name datatable-row-header">
                  - Take {{ takeNumber }}
                </td>
                <td></td>

                <template v-for="columnId in validationColumns">
                  <stats-cell
                    :key="takeNumber + entry.id + columnId"
                    :style="getValidationStyle(columnId)"
                    :colors="chartColors(entry.id, columnId)"
                    :data="chartTakeData(entry.id, columnId, takeNumber)"
                    :frames-data="
                      chartTakeData(entry.id, columnId, takeNumber, 'frames')
                    "
                    :drawings-data="
                      chartTakeData(entry.id, columnId, takeNumber, 'drawings')
                    "
                    :count-mode="countMode"
                    :display-mode="displayMode"
                    v-if="
                      chartRetakeMaxCount(entry.id, columnId) + 1 > takeNumber
                    "
                  />

                  <stats-cell
                    :key="takeNumber + entry.id + columnId"
                    :style="getValidationStyle(columnId)"
                    :colors="chartColors(entry.id, columnId)"
                    :data="chartData(entry.id, columnId)"
                    :frames-data="chartData(entry.id, columnId, 'frames')"
                    :drawings-data="chartData(entry.id, columnId, 'drawings')"
                    :count-mode="countMode"
                    :display-mode="displayMode"
                    v-else-if="
                      isStats(entry.id, columnId) &&
                      chartRetakeMaxCount(entry.id, columnId) + 1 === takeNumber
                    "
                  />

                  <td
                    :key="takeNumber + entry.id + columnId"
                    :style="getValidationStyle(columnId)"
                    v-else
                  ></td>
                </template>

                <td class="actions"></td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :with-thumbnail="false"
      :with-actions="false"
    />

    <empty-list
      :text="$t('episodes.empty_list')"
      :read-only-text="$t('episodes.empty_list_read_only')"
      v-if="isEmptyList"
    />

    <p class="has-text-centered nb-episodes" v-if="!isEmptyList">
      {{ displayedEpisodesLength }}
      {{ $t('episodes.number', { count: displayedEpisodesLength }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import colors from '@/lib/colors'
import {
  aggregateRetakeStats,
  aggregateStats,
  getChartData,
  getChartRetakeCount,
  getRetakeChartData
} from '@/lib/stats'
import { range } from '@/lib/time'

import StatsCell from '@/components/cells/StatsCell.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  countMode: { type: String, default: 'count' },
  dataMode: { type: String, default: 'retakes' },
  displayMode: { type: String, default: 'pie' },
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  showAll: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] }
})

const emit = defineEmits(['scroll'])

// State
// --------------------------------------------------------------------------
const bodyRef = useTemplateRef('body')

const expanded = ref({})

const retakeColors = ['#ff3860', '#6f727a', '#22d160']
const takeLabelColors = ['#FB8C00', '#EF6C00', '#d35400', '#e74c3c', '#c0392b']

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedEpisodesLength = computed(
  () => store.getters.displayedEpisodesLength
)
const episodeRetakeStats = computed(() => store.getters.episodeRetakeStats)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
const episodeStats = computed(() => store.getters.episodeStats)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    !episodeSearchText.value
)

const isRetakes = computed(() => props.dataMode === 'retakes')

// The "all" row aggregates the displayed entries only, so it stays
// consistent when episodes are filtered (e.g. "only running").
const entryIds = computed(() => props.entries.map(entry => entry.id))

const displayedEntriesStats = computed(() => ({
  all: aggregateStats(episodeStats.value, entryIds.value)
}))

const displayedEntriesRetakeStats = computed(() => ({
  all: aggregateRetakeStats(episodeRetakeStats.value, entryIds.value)
}))

// Functions
// --------------------------------------------------------------------------
const chartData = (entryId, columnId, dataType = 'count') => {
  const isAll = entryId === 'all'
  if (isRetakes.value) {
    const stats = isAll
      ? displayedEntriesRetakeStats.value
      : episodeRetakeStats.value
    return getRetakeChartData(stats, entryId, columnId, dataType)
  }
  const stats = isAll ? displayedEntriesStats.value : episodeStats.value
  return getChartData(stats, entryId, columnId, dataType)
}

const chartColors = (entryId, columnId) =>
  isRetakes.value
    ? retakeColors
    : chartData(entryId, columnId).map(data => data[2])

const chartTakeData = (entryId, columnId, takeNumber, dataType = 'count') => {
  const take = episodeRetakeStats.value[entryId][columnId].evolution[takeNumber]
  // Order matters: it matches retakeColors.
  return [
    ['retake', take.retake[dataType], retakeColors[0]],
    ['other', take.other[dataType], retakeColors[1]],
    ['done', take.done[dataType], retakeColors[2]]
  ]
}

const chartRetakeMaxCount = (entryId, columnId) =>
  getChartRetakeCount(episodeRetakeStats.value, entryId, columnId)

const chartLabel = (entryId, columnId) => {
  if (!isRetakes.value) return ''
  const count = chartRetakeMaxCount(entryId, columnId)
  return count >= 1 ? `Take ${count + 1}` : ''
}

const chartLabelColor = (entryId, columnId) => {
  if (!isRetakes.value) return ''
  return takeLabelColors[Math.min(chartRetakeMaxCount(entryId, columnId), 4)]
}

const takeRange = entryId => range(1, chartRetakeMaxCount(entryId, 'all') + 1)

const isStats = (entryId, columnId) => episodeStats.value[entryId]?.[columnId]

const toggleExpanded = episodeId => {
  expanded.value[episodeId] = !expanded.value[episodeId]
}

const getValidationStyle = columnId => {
  const taskType = taskTypeMap.value.get(columnId)
  if (!taskType) return {}
  return {
    'border-left': `1px solid ${taskType.color}`,
    background: colors.hexToRGBa(taskType.color, 0.08)
  }
}

const taskTypePath = taskTypeId => ({
  name: isTVShow.value ? 'episode-task-type' : 'task-type',
  params: {
    production_id: currentProduction.value.id,
    task_type_id: taskTypeId,
    type: 'count',
    ...(isTVShow.value ? { episode_id: currentEpisode.value.id } : {})
  }
})

const onBodyScroll = event => {
  emit('scroll', event.target.scrollTop)
}

const setScrollPosition = scrollPosition => {
  if (bodyRef.value) bodyRef.value.scrollTop = scrollPosition
}

// Watchers
// --------------------------------------------------------------------------
watch(isRetakes, () => {
  if (!isRetakes.value) expanded.value = {}
})

defineExpose({ setScrollPosition })
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

td.name {
  font-size: 1.2em;
}

.expander {
  cursor: pointer;
  min-width: 10px;
  width: 10px;
  padding-top: 10px;
}

.validation {
  min-width: 170px;
  max-width: 170px;
  width: 170px;
  word-wrap: break-word;
}

.actions {
  min-width: 150px;
  width: 150px;
}

th.actions {
  padding: 0.4em;
}
</style>
