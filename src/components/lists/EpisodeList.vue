<template>
<div class="data-list">
  <div
    class="datatable-wrapper"
    ref="body"
    v-scroll="onBodyScroll"
  >
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name datatable-row-header" ref="th-episode">
            {{ $t('shots.fields.episode') }}
          </th>
          <th scope="col" class="description">
            {{ $t('shots.fields.description') }}
          </th>
          <th scope="col" class="validation">{{ $t('main.all') }}</th>
          <th
            scope="col"
            class="validation validation-cell"
            :key="taskTypeMap[columnId].id"
            v-for="columnId in validationColumns">
            <div
              class="flexrow validation-content"
              :style="getValidationStyle(columnId)"
            >
              <router-link
                :to="taskTypePath(columnId)"
              >
                {{ taskTypeMap[columnId].name }}
              </router-link>
            </div>
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
      >
        <tr
          class="all-line datatable-row"
          v-if="showAll && !isEmptyList"
        >
          <th scope="col" class="name datatable-row-header">
            {{ $t('episodes.all_episodes') }}
          </th>

          <td class="description"></td>

          <stats-cell
            :colors="chartColors('all', 'all')"
            :data="chartData('all', 'all')"
            :frames-data="chartData('all', 'all', 'frames')"
            :countMode="countMode"
            :displayMode="displayMode"
          />

          <stats-cell
            :style="getValidationStyle(columnId)"
            :key="'all-' + columnId"
            :colors="chartColors('all', columnId)"
            :data="chartData('all', columnId)"
            :frames-data="chartData('all', columnId, 'frames')"
            :countMode="countMode"
            :displayMode="displayMode"
            v-for="columnId in validationColumns"
          />

          <td class="actions"></td>
        </tr>

        <tr
          class="datatable-row"
          :key="entry.id"
          v-for="entry in entries"
        >

          <th class="name datatable-row-header">
            {{ entry.name }}
          </th>

          <td class="description">
            {{ entry.description }}
          </td>

          <stats-cell
            :colors="chartColors(entry.id, 'all')"
            :data="chartData(entry.id, 'all')"
            :frames-data="chartData(entry.id, 'all', 'frames')"
            :countMode="countMode"
            :displayMode="displayMode"
            v-if="isStats(entry.id, 'all')"
          />
          <td
            v-else
          >
          </td>

          <stats-cell
            :key="entry.id + columnId"
            :style="getValidationStyle(columnId)"
            :colors="chartColors(entry.id, columnId)"
            :data="chartData(entry.id, columnId)"
            :frames-data="chartData(entry.id, columnId, 'frames')"
            :countMode="countMode"
            :displayMode="displayMode"
            v-for="columnId in validationColumns"
            v-if="isStats(entry.id, columnId)"
          />
          <td
            :style="getValidationStyle(columnId)"
            v-else
          >
          </td>

          <row-actions v-if="isCurrentUserManager"
            :entry="entry"
            :edit-route="{
              name: 'edit-episode',
              params: {
                episode_id: entry.id,
                production_id: currentProduction.id
              }
            }"
            :delete-route="{
              name: 'delete-episode',
              params: {
                episode_id: entry.id,
                production_id: currentProduction.id
              }
            }"
          />
          <td class="actions" v-else></td>
        </tr>
      </tbody>
    </table>
  </div>

  <table-info
    :is-loading="isLoading"
    :is-error="isError"
  />

  <div class="has-text-centered" v-if="isEmptyList && !isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('episodes.empty_list') }}</p>
  </div>
  <div class="has-text-centered" v-if="isEmptyList && isCurrentUserClient">
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
import { mapGetters, mapActions } from 'vuex'
import { entityListMixin } from './base'
import { getChartColors, getChartData } from '../../lib/stats'
import RowActions from '../widgets/RowActions'
import StatsCell from '../cells/StatsCell'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'episode-list',
  mixins: [entityListMixin],

  components: {
    RowActions,
    StatsCell,
    TableInfo
  },

  props: {
    countMode: {
      type: String,
      default: 'count'
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
    episodeStats: {
      type: Object,
      default: () => {}
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

  data () {
    return {
      busy: false,
      lastSelection: null
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedEpisodesLength',
      'episodeSearchText',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isSingleEpisode',
      'taskTypeMap'
    ]),

    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.episodeSearchText || this.episodeSearchText.length === 0)
    }
  },

  methods: {
    ...mapActions([
      'displayMoreEpisodes',
      'loadMoreEpisodes'
    ]),

    chartColors (entryId, columnId) {
      return getChartColors(this.episodeStats, entryId, columnId)
    },

    chartData (entryId, columnId, dataType = 'count') {
      return getChartData(this.episodeStats, entryId, columnId, dataType)
    },

    isStats (entryId, columnId) {
      return this.episodeStats[entryId] &&
             this.episodeStats[entryId][columnId]
    },

    onBodyScroll (event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreEpisodes()
      }
    },

    loadMoreEpisodes () {
      this.displayMoreEpisodes()
    },

    setScrollPosition (scrollPosition) {
      this.$refs.body.scrollTop = scrollPosition
    },

    // Remaining function for retrocompatibility
    resizeHeaders () {
      return true
    },
    //

    editPath (episodeId) {
      return this.getPath('edit-episode', episodeId)
    },

    deletePath (episodeId) {
      return this.getPath('delete-episode', episodeId)
    },

    taskTypePath (taskTypeId) {
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

    getPath (section, episodeId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id,
          episode_id: episodeId
        }
      }

      return route
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
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}

.info img {
  max-width: 80vh;
}
</style>
