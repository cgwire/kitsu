<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable datatable--cards">
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
          <tr class="all-line datatable-row" v-if="entries.length > 0">
            <td class="expander"></td>

            <td class="name datatable-row-header card-head">
              {{ $t('episodes.all_episodes') }}
            </td>

            <stats-cell
              :data-label="$t('main.all')"
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
              :data-label="taskTypeMap.get(columnId)?.name"
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
                v-if="isRetakes"
              >
                <chevron-down-icon v-if="expanded[entry.id]" />
                <chevron-right-icon v-else />
              </td>
              <td class="expander" v-else></td>

              <td class="name datatable-row-header card-head">
                <router-link :to="shotsPath(entry)">
                  {{ entry.name }}
                </router-link>
              </td>

              <stats-cell
                :data-label="$t('main.all')"
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
                  :data-label="taskTypeMap.get(columnId)?.name"
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
                class="datatable-row take-row"
                :class="{
                  'take-row--first': takeNumber === 1,
                  'take-row--last': takeNumber === takeRange(entry.id).length
                }"
                :key="takeNumber + '-' + entry.id"
                v-for="takeNumber in takeRange(entry.id)"
              >
                <td class="expander"></td>
                <td class="name datatable-row-header take-name card-head">
                  <span
                    class="tag take-tag"
                    :style="{ backgroundColor: takeColor(takeNumber) }"
                  >
                    Take {{ takeNumber }}
                  </span>
                </td>
                <td></td>

                <template v-for="columnId in validationColumns">
                  <stats-cell
                    :key="takeNumber + entry.id + columnId"
                    :data-label="taskTypeMap.get(columnId)?.name"
                    :style="getValidationStyle(columnId)"
                    :colors="chartColors(entry.id, columnId)"
                    :data="chartData(entry.id, columnId, 'count', takeNumber)"
                    :frames-data="
                      chartData(entry.id, columnId, 'frames', takeNumber)
                    "
                    :drawings-data="
                      chartData(entry.id, columnId, 'drawings', takeNumber)
                    "
                    :count-mode="countMode"
                    :display-mode="displayMode"
                    v-if="
                      chartRetakeMaxCount(entry.id, columnId) + 1 > takeNumber
                    "
                  />

                  <stats-cell
                    :key="takeNumber + entry.id + columnId"
                    :data-label="taskTypeMap.get(columnId)?.name"
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

    <p class="has-text-centered all-hidden" v-if="isAllHidden">
      {{ $t('episodes.all_hidden') }}
    </p>
    <p
      class="has-text-centered nb-episodes"
      v-else-if="!isEmptyList && !isLoading"
    >
      {{ entries.length }}
      {{ $t('episodes.number', { count: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

import colors from '@/lib/colors'
import { getEntitiesPath } from '@/lib/path'
import {
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
  episodeRetakeStats: { type: Object, default: () => ({}) },
  episodeStats: { type: Object, default: () => ({}) },
  isError: { type: Boolean, default: false },
  isFiltered: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] }
})

// State
// --------------------------------------------------------------------------
const expanded = ref({})

const takeLabelColors = ['#FB8C00', '#EF6C00', '#d35400', '#e74c3c', '#c0392b']

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const episodeSearchText = computed(() => store.getters.episodeSearchText)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    !props.isFiltered &&
    !episodeSearchText.value
)

const isAllHidden = computed(
  () =>
    props.isFiltered &&
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError
)

const isRetakes = computed(() => props.dataMode === 'retakes')

// Functions
// --------------------------------------------------------------------------
// The status stats come from the server without the done flag of their
// statuses: the status map provides it.
const chartData = (entryId, columnId, dataType = 'count', takeNumber = null) =>
  isRetakes.value
    ? getRetakeChartData(
        props.episodeRetakeStats,
        entryId,
        columnId,
        dataType,
        takeNumber
      )
    : getChartData(
        props.episodeStats,
        entryId,
        columnId,
        dataType,
        taskStatusMap.value
      )

const chartColors = (entryId, columnId) =>
  chartData(entryId, columnId).map(data => data[2])

const chartRetakeMaxCount = (entryId, columnId) =>
  getChartRetakeCount(props.episodeRetakeStats, entryId, columnId)

const chartLabel = (entryId, columnId) => {
  if (!isRetakes.value) return ''
  const count = chartRetakeMaxCount(entryId, columnId)
  return count >= 1 ? `Take ${count + 1}` : ''
}

// A cell is labelled with its current take, one more than its retake count.
const takeColor = takeNumber => takeLabelColors[Math.min(takeNumber - 1, 4)]

const chartLabelColor = (entryId, columnId) => {
  if (!isRetakes.value) return ''
  return takeColor(chartRetakeMaxCount(entryId, columnId) + 1)
}

const takeRange = entryId => range(1, chartRetakeMaxCount(entryId, 'all') + 1)

const isStats = (entryId, columnId) => props.episodeStats[entryId]?.[columnId]

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
  name: 'episodes-task-type',
  params: {
    production_id: currentProduction.value.id,
    task_type_id: taskTypeId
  }
})

const shotsPath = episode =>
  getEntitiesPath(currentProduction.value?.id, 'shots', episode.id)

// Watchers
// --------------------------------------------------------------------------
watch(isRetakes, () => {
  if (!isRetakes.value) expanded.value = {}
})
</script>

<style lang="scss" scoped>
@use '@/styles/stats.scss' as stats;

@include stats.list;

.name {
  min-width: 100px;
  width: 100px;
}

// Take rows detail the episode above them: indented, and tagged like the
// "Take N" label of the cells rather than titled like an episode.
td.take-name {
  // Rail linking the takes to their episode. A background layer spans the
  // whole cell height whatever its positioning, and joins from row to row.
  background-image: linear-gradient(var(--border-alt), var(--border-alt));
  background-position: 1em 0;
  background-repeat: no-repeat;
  background-size: 1px 100%;
  font-size: 1em;
  padding-left: 2em;
}

// The rail stops short at both ends of the group of takes.
.take-row--first td.take-name {
  background-position: 1em 100%;
  background-size: 1px 70%;
}

.take-row--last td.take-name {
  background-size: 1px 70%;
}

.take-row--first.take-row--last td.take-name {
  background-position: 1em 50%;
  background-size: 1px 40%;
}

.take-tag {
  color: white;
  cursor: default;
  font-weight: bold;
  text-transform: uppercase;
}

.expander {
  min-width: 10px;
  width: 10px;
  padding-top: 10px;

  &[role='button'] {
    cursor: pointer;
  }
}

.actions {
  min-width: 150px;
  width: 150px;
}

@media screen and (max-width: 768px) {
  // The expander sits in the top right corner of the card of its episode.
  .datatable-body .datatable-row {
    position: relative;
  }

  .datatable-body td.expander[role='button'] {
    display: block;
    padding: 0;
    position: absolute;
    right: 1em;
    top: 1em;
    width: auto;
    // The name cell keeps the z-index of the sticky column and spans the
    // card: without this it covers the expander and takes its clicks.
    z-index: 2;
  }

  // The cards of the takes nest under the card of their episode.
  .datatable-body .take-row.datatable-row {
    margin-left: 1.5em;
  }
}
</style>
