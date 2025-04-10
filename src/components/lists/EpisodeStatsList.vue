<template>
  <div class="data-list">
    <div class="datatable-wrapper" ref="body" @scroll.passive="onBodyScroll">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th class="expander"></th>
            <th scope="col" class="name datatable-row-header" ref="th-episode">
              {{ $t('shots.fields.episode') }}
            </th>
            <th scope="col" class="validation">{{ $t('main.all') }}</th>
            <th
              scope="col"
              class="validation validation-cell"
              :key="taskTypeMap.get(columnId).id"
              v-for="columnId in validationColumns"
            >
              <div
                class="flexrow validation-content"
                :style="getValidationStyle(columnId)"
              >
                <router-link
                  class="flexrow-item ellipsis"
                  :title="taskTypeMap.get(columnId).name"
                  :to="taskTypePath(columnId)"
                  v-if="!isCurrentUserClient"
                >
                  {{ taskTypeMap.get(columnId).name }}
                </router-link>
                <span
                  class="flexrow-item ellipsis"
                  :title="taskTypeMap.get(columnId).name"
                  v-else
                >
                  {{ taskTypeMap.get(columnId).name }}
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
              <td class="expander" @click="toggleExpanded(entry.id)">
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

    <table-info :is-loading="isLoading" :is-error="isError" />

    <div
      class="has-text-centered"
      v-if="!isLoading && isEmptyList && !isCurrentUserClient"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('episodes.empty_list') }}</p>
    </div>
    <div
      class="has-text-centered"
      v-if="!isLoading && isEmptyList && isCurrentUserClient"
    >
      <p class="info">
        <img src="../../assets/illustrations/empty_shot.png" />
      </p>
      <p class="info">{{ $t('episodes.empty_list_client') }}</p>
    </div>

    <p class="has-text-centered nb-episodes" v-if="!isEmptyList">
      {{ displayedEpisodesLength }}
      {{ $tc('episodes.number', displayedEpisodesLength) }}
    </p>
  </div>
</template>

<script>
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import { entityListMixin } from '@/components/mixins/entity_list'
import { range } from '@/lib/time'
import {
  getChartColors,
  getChartData,
  getChartRetakeCount,
  getRetakeChartData
} from '@/lib/stats'

import StatsCell from '@/components/cells/StatsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

export default {
  name: 'episode-stats-list',

  mixins: [entityListMixin],

  components: {
    ChevronDownIcon,
    ChevronRightIcon,
    StatsCell,
    TableInfo
  },

  props: {
    countMode: {
      type: String,
      default: 'count'
    },
    dataMode: {
      type: String,
      default: 'retakes'
    },
    displayMode: {
      type: String,
      default: 'pie'
    },
    entries: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    showAll: {
      type: Boolean,
      default: false
    },
    validationColumns: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      expanded: {},
      lastSelection: null,
      takeLabelColors: ['#FB8C00', '#EF6C00', '#d35400', '#e74c3c', '#c0392b']
    }
  },

  mounted() {
    this.entries.forEach(e => {
      this.expanded[e.id] = false
    })
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'displayedEpisodesLength',
      'episodeSearchText',
      'episodeStats',
      'episodeRetakeStats',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isSingleEpisode',
      'isTVShow',
      'taskTypeMap'
    ]),

    isEmptyList() {
      return (
        this.entries &&
        this.entries.length === 0 &&
        !this.isLoading &&
        !this.isError &&
        (!this.episodeSearchText || this.episodeSearchText.length === 0)
      )
    },

    isRetakes() {
      return this.dataMode === 'retakes'
    }
  },

  methods: {
    chartColors(entryId, columnId) {
      if (this.isRetakes) {
        return ['#ff3860', '#6f727a', '#22d160']
      } else {
        return getChartColors(this.episodeStats, entryId, columnId)
      }
    },

    chartData(entryId, columnId, dataType = 'count') {
      if (this.isRetakes) {
        return getRetakeChartData(
          this.episodeRetakeStats,
          entryId,
          columnId,
          dataType
        )
      } else {
        return getChartData(this.episodeStats, entryId, columnId, dataType)
      }
    },

    chartTakeData(entryId, columnId, takeNumber, dataType = 'count') {
      const evolutionStats =
        this.episodeRetakeStats[entryId][columnId].evolution
      const nbRetakes = evolutionStats[takeNumber].retake[dataType]
      const nbDones = evolutionStats[takeNumber].done[dataType]
      const nbOthers = evolutionStats[takeNumber].other[dataType]
      // Order here is important
      return [
        ['retake', nbRetakes, '#ff3860'],
        ['other', nbOthers, '#6f727a'],
        ['done', nbDones, '#22d160']
      ]
    },

    chartLabel(entryId, columnId) {
      if (this.isRetakes) {
        const count = getChartRetakeCount(
          this.episodeRetakeStats,
          entryId,
          columnId
        )
        return count >= 1 ? `Take ${count + 1}` : ''
      } else {
        return ''
      }
    },

    chartLabelColor(entryId, columnId) {
      if (this.isRetakes) {
        let count = getChartRetakeCount(
          this.episodeRetakeStats,
          entryId,
          columnId
        )
        count = Math.min(count, 4)
        return this.takeLabelColors[count]
      } else {
        return ''
      }
    },

    chartRetakeMaxCount(entryId, columnId) {
      return getChartRetakeCount(this.episodeRetakeStats, entryId, columnId)
    },

    takeRange(entryId) {
      return range(1, this.chartRetakeMaxCount(entryId, 'all') + 1)
    },

    isStats(entryId, columnId) {
      return this.episodeStats[entryId] && this.episodeStats[entryId][columnId]
    },

    taskTypePath(taskTypeId) {
      const route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'count'
        }
      }

      if (this.isTVShow) {
        route.name = 'episode-task-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath(section, episodeId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id,
          episode_id: episodeId
        }
      }

      return route
    },

    toggleExpanded(episodeId) {
      this.expanded[episodeId] = !this.expanded[episodeId]
    }
  },

  watch: {
    entries: {
      deep: true,
      handler() {
        this.entries.forEach(e => {
          const value = this.expanded[e.id] || false
          this.expanded[e.id] = value
        })
      }
    },

    isRetakes() {
      if (!this.isRetakes) {
        this.entries.forEach(e => {
          this.expanded[e.id] = false
        })
      }
    }
  }
}
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

.name a {
  color: inherit;
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

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
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

.info img {
  max-width: 80vh;
}
</style>
