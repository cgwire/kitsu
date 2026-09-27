<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
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
          <tr class="all-line datatable-row" v-if="showAll && !isEmptyList">
            <th scope="row" class="name datatable-row-header">
              {{ $t('asset_types.all_asset_types') }}
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
              {{ entry.name }}
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

    <p
      class="has-text-centered nb-asset-types"
      v-if="!isEmptyList && !isLoading"
    >
      {{ displayedAssetTypesLength }}
      {{ $t('asset_types.number', { count: displayedAssetTypesLength }) }}
    </p>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import emptyAssetIllustration from '@/assets/illustrations/empty_asset.png'
import colors from '@/lib/colors'
import { getChartColors, getChartData } from '@/lib/stats'

import StatsCell from '@/components/cells/StatsCell.vue'
import EmptyList from '@/components/widgets/EmptyList.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  assetTypeStats: { type: Object, default: () => ({}) },
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

// Computed
// --------------------------------------------------------------------------
const assetTypeSearchText = computed(() => store.getters.assetTypeSearchText)
const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const displayedAssetTypesLength = computed(
  () => store.getters.displayedAssetTypesLength
)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isEmptyList = computed(
  () =>
    props.entries.length === 0 &&
    !props.isLoading &&
    !props.isError &&
    !assetTypeSearchText.value
)

// Functions
// --------------------------------------------------------------------------
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

const onBodyScroll = event => {
  emit('scroll', event.target.scrollTop)
}

const setScrollPosition = scrollPosition => {
  if (bodyRef.value) bodyRef.value.scrollTop = scrollPosition
}

defineExpose({ setScrollPosition })
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
