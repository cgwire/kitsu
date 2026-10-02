<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name datatable-row-header">
              {{ $t('asset_types.fields.name') }}
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
          <tr class="all-line datatable-row" v-if="entries.length > 0">
            <th scope="row" class="name datatable-row-header">
              {{ $t('asset_types.all_asset_types') }}
              <span class="asset-count">
                {{ totalAssetCount }}
                {{ $t('assets.number', { count: totalAssetCount }) }}
              </span>
            </th>

            <stats-cell
              :colors="chartColors('all', 'all')"
              :data="chartData('all', 'all')"
              :display-mode="displayMode"
            />

            <stats-cell
              :style="getValidationStyle(columnId)"
              :key="'all-' + columnId"
              :colors="chartColors('all', columnId)"
              :data="chartData('all', columnId)"
              :display-mode="displayMode"
              v-for="columnId in validationColumns"
            />

            <td class="actions"></td>
          </tr>

          <tr class="datatable-row" :key="entry.id" v-for="entry in entries">
            <td class="name datatable-row-header">
              <router-link :to="assetsPath(entry)">
                {{ entry.name }}
              </router-link>
              <span class="asset-count">
                {{ assetCount(entry.id) }}
                {{ $t('assets.number', { count: assetCount(entry.id) }) }}
              </span>
            </td>

            <stats-cell
              :colors="chartColors(entry.id, 'all')"
              :data="chartData(entry.id, 'all')"
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
                :style="getValidationStyle(columnId)"
                :colors="chartColors(entry.id, columnId)"
                :data="chartData(entry.id, columnId)"
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
      :text="$t('assets.empty_list')"
      :read-only-text="$t('assets.empty_list_read_only')"
      :illustration="emptyAssetIllustration"
      v-if="isEmptyList"
    />

    <p class="has-text-centered all-hidden" v-if="isAllHidden">
      {{ $t('asset_types.all_hidden') }}
    </p>
    <p
      class="has-text-centered nb-asset-types"
      v-else-if="!isEmptyList && !isLoading"
    >
      {{ entries.length }}
      {{ $t('asset_types.number', { count: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useStore } from 'vuex'

import emptyAssetIllustration from '@/assets/illustrations/empty_asset.png'
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
  assetCounts: { type: Object, default: () => ({}) },
  assetTypeStats: { type: Object, default: () => ({}) },
  displayMode: { type: String, default: 'pie' },
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isFiltered: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  validationColumns: { type: Array, default: () => [] }
})

// Computed
// --------------------------------------------------------------------------
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    !props.isFiltered
)

const isAllHidden = computed(
  () =>
    props.isFiltered &&
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError
)

const totalAssetCount = computed(() =>
  props.entries.reduce((total, entry) => total + assetCount(entry.id), 0)
)

// Functions
// --------------------------------------------------------------------------
const assetCount = entryId => props.assetCounts[entryId] || 0

const chartColors = (entryId, columnId) =>
  getChartColors(props.assetTypeStats, entryId, columnId)

const chartData = (entryId, columnId) =>
  getChartData(props.assetTypeStats, entryId, columnId)

const isStats = (entryId, columnId) => props.assetTypeStats[entryId]?.[columnId]

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
      type: 'assets',
      ...(withEpisode ? { episode_id: currentEpisode.value.id } : {})
    }
  }
}

const assetsPath = assetType => ({
  ...getEntitiesPath(
    currentProduction.value?.id,
    'assets',
    isTVShow.value ? currentEpisode.value?.id : null
  ),
  query: { search: `type=[${assetType.name}]` }
})
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  min-width: 200px;
  width: 200px;
  font-weight: bold;
}

td.name {
  font-size: 1.2em;
}

.asset-count {
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

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}
</style>
