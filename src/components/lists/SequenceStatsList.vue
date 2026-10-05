<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable datatable--cards">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('shots.fields.sequence') }}
            </th>
            <th scope="col" class="validation">{{ $t('main.all') }}</th>
            <template v-if="!isLoading">
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
            </template>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="!isLoading">
          <tr class="all-line datatable-row" v-if="entryStats.length > 0">
            <th scope="row" class="name datatable-row-header card-head">
              {{ $t('sequences.all_sequences') }}
              <span class="shot-count">
                {{ totalShotCount }}
                {{ $t('shots.number', { count: totalShotCount }) }}
              </span>
            </th>

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

          <tr class="datatable-row" :key="entry.id" v-for="entry in entryStats">
            <td class="name datatable-row-header card-head">
              <router-link :to="shotsPath(entry)">
                {{ entry.name }}
              </router-link>
              <span class="shot-count">
                {{ shotCount(entry.id) }}
                {{ $t('shots.number', { count: shotCount(entry.id) }) }}
              </span>
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

            <template
              :key="entry.id + '-' + columnId"
              v-for="columnId in validationColumns"
            >
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
                v-if="isStats(entry.id, columnId)"
              />
              <td :style="getValidationStyle(columnId)" v-else></td>
            </template>

            <td class="actions"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="5"
      :with-thumbnail="false"
      :with-actions="false"
    />

    <empty-list
      :text="$t('sequences.empty_list')"
      :read-only-text="$t('sequences.empty_list_read_only')"
      v-if="isEmptyList"
    />

    <p class="has-text-centered all-hidden" v-if="isAllHidden">
      {{ $t('sequences.all_hidden') }}
    </p>
    <p
      class="has-text-centered nb-sequences"
      v-else-if="!isEmptyList && !isLoading"
    >
      {{ sequenceCount }}
      {{ $t('sequences.number', { count: sequenceCount }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useStore } from 'vuex'

import colors from '@/lib/colors'
import { getEntitiesPath } from '@/lib/path'
import { getChartColors, getChartData } from '@/lib/stats'

import StatsCell from '@/components/cells/StatsCell.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  countMode: { type: String, default: 'count' },
  displayMode: { type: String, default: 'pie' },
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isFiltered: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  sequenceStats: { type: Object, default: () => ({}) },
  shotCounts: { type: Object, default: () => ({}) },
  validationColumns: { type: Array, default: () => [] }
})

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const sequenceSearchText = computed(() => store.getters.sequenceSearchText)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const entryStats = computed(() =>
  props.entries.filter(entry => isEntryStats(entry.id))
)

const isEmptyList = computed(
  () =>
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    !props.isFiltered &&
    !sequenceSearchText.value
)

const isAllHidden = computed(
  () =>
    props.isFiltered &&
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError
)

const sequenceCount = computed(
  () => props.entries.filter(entry => !entry.canceled).length
)

const totalShotCount = computed(() =>
  entryStats.value.reduce((total, entry) => total + shotCount(entry.id), 0)
)

// Functions
// --------------------------------------------------------------------------
const shotCount = entryId => props.shotCounts[entryId] || 0

const chartColors = (entryId, columnId) =>
  getChartColors(props.sequenceStats, entryId, columnId)

const chartData = (entryId, columnId, dataType = 'count') =>
  getChartData(props.sequenceStats, entryId, columnId, dataType)

const isStats = (entryId, columnId) => props.sequenceStats[entryId]?.[columnId]

// A sequence without stats is kept, unless a search is filtering the list.
const isEntryStats = entryId => {
  const stats = props.sequenceStats[entryId]
  if (!stats) return !sequenceSearchText.value
  return Object.values(stats).some(Boolean)
}

const getValidationStyle = columnId => {
  const taskType = taskTypeMap.value.get(columnId)
  if (!taskType) return {}
  return {
    'border-left': `1px solid ${taskType.color}`,
    background: colors.hexToRGBa(taskType.color, 0.08)
  }
}

const taskTypePath = taskTypeId => {
  const withEpisode = isTVShow.value && currentEpisode.value
  return {
    name: withEpisode ? 'episode-task-type' : 'task-type',
    params: {
      production_id: currentProduction.value.id,
      task_type_id: taskTypeId,
      type: 'shots',
      ...(withEpisode ? { episode_id: currentEpisode.value.id } : {})
    }
  }
}

// Quoted, a name made of several words is searched as a whole.
const shotsPath = sequence => ({
  ...getEntitiesPath(
    currentProduction.value?.id,
    'shots',
    isTVShow.value ? currentEpisode.value?.id : null
  ),
  query: { search: `"${sequence.name}"` }
})
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 150px;
  width: 150px;
  font-weight: bold;
}

td.name {
  font-size: 1.2em;
}

// Row titles are links: keep the text colour of the row instead of the grey
// of plain links, which reads as dimmed in dark mode.
.name a {
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
}

.shot-count {
  display: block;
  color: var(--text-alt);
  font-size: 0.8rem;
  font-weight: normal;
}

.validation {
  min-width: 170px;
  max-width: 170px;
  width: 170px;
  word-wrap: break-word;
}

th.actions {
  padding: 0.4em;
}

.actions {
  width: 100%;
  min-width: 150px;
}

@media screen and (max-width: 768px) {
  .data-list {
    margin-top: 1em;
  }

  .datatable-wrapper {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  // The global card layout only styles td: the total row is headed by a th.
  .all-line th.card-head {
    background: transparent;
    border: 0;
    display: block;
    min-width: 0;
    order: -1;
    padding: 0.75em 0 1em;
    position: static;
    width: auto;

    &::after {
      display: none;
    }
  }
}
</style>
