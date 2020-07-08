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
          <th scope="col" class="name datatable-row-header" ref="th-sequence">
            {{ $t('shots.fields.sequence') }}
          </th>
          <th scope="col" class="description">{{ $t('shots.fields.description') }}</th>
          <th scope="col" class="validation">{{ $t('main.all') }}</th>
          <th
            scope="col"
            class="validation validation-cell"
            :key="columnId"
            v-for="columnId in validationColumns"
            v-if="!isLoading"
          >
            <div
              class="flexrow validation-content"
              :style="getValidationStyle(columnId)"
            >
              <router-link
                class="flexrow-item"
                :to="taskTypePath(columnId)"
                v-if="!isCurrentUserClient"
              >
                {{ taskTypeMap[columnId].name }}
              </router-link>
              <span
                class="flexrow-item"
                v-else
              >
                {{ taskTypeMap[columnId].name }}
              </span>
            </div>
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody
        class="datatable-body"
        v-if="!isLoading"
      >

        <tr
          class="all-line datatable-row"
          v-if="showAll && !isEmptyList"
        >
          <th scope="row" class="name datatable-row-header">
            {{ $t('sequences.all_sequences') }}
          </th>

          <td class="description"></td>

          <stats-cell
            class="all-validation"
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
          v-if="isEntryStats(entry.id)"
        >

          <th scope="row" class="name datatable-row-header">
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
            v-if="isStats(entry.id, columnId)"
            v-for="columnId in validationColumns"
          />
          <td
            :style="getValidationStyle(columnId)"
            v-else
          >
          </td>

          <row-actions v-if="isCurrentUserManager"
            :entry="entry"
            :edit-route="editPath(entry.id)"
            :delete-route="deletePath(entry.id)"
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

  <div
    class="has-text-centered"
    v-if="isEmptyList && !isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('sequences.empty_list') }}</p>
  </div>
  <div
    class="has-text-centered"
    v-if="isEmptyList && isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('sequences.empty_list_client') }}</p>
  </div>

  <p
    class="has-text-centered nb-sequences"
    v-if="!isEmptyList && !isLoading"
  >
    {{ displayedSequencesLength }}
    {{ $tc('sequences.number', displayedSequencesLength) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getChartColors, getChartData } from '../../lib/stats'
import { entityListMixin } from './base'
import RowActions from '../widgets/RowActions'
import TableInfo from '../widgets/TableInfo'
import StatsCell from '../cells/StatsCell'

export default {
  name: 'sequence-list',
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
    sequenceStats: {
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
      'currentEpisode',
      'displayedSequencesLength',
      'isDarkTheme',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isTVShow',
      'sequenceSearchText',
      'taskTypeMap'
    ]),

    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.sequenceSearchText || this.sequenceSearchText.length === 0)
    }
  },

  methods: {
    ...mapActions([
      'displayMoreSequences',
      'loadMoreSequences'
    ]),

    chartColors (entryId, columnId) {
      return getChartColors(this.sequenceStats, entryId, columnId)
    },

    chartData (entryId, columnId, dataType = 'count') {
      return getChartData(this.sequenceStats, entryId, columnId, dataType)
    },

    isStats (entryId, columnId) {
      return this.sequenceStats[entryId] &&
             this.sequenceStats[entryId][columnId]
    },

    isEntryStats (entryId) {
      if (!this.sequenceStats[entryId] && this.sequenceSearchText) return false
      if (!this.sequenceStats[entryId]) return true
      let isStats = false
      Object.keys(this.sequenceStats[entryId]).forEach((statKey) => {
        isStats = isStats || this.sequenceStats[entryId][statKey]
      })
      return isStats
    },

    onBodyScroll (event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreSequences()
      }
    },

    loadMoreSequences () {
      this.displayMoreSequences()
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    // Remaining function for retrocompatibility
    resizeHeaders () {
      return true
    },
    //

    editPath (sequenceId) {
      return this.getPath('edit-sequence', sequenceId)
    },

    deletePath (sequenceId) {
      return this.getPath('delete-sequence', sequenceId)
    },

    taskTypePath (taskTypeId) {
      const route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'shots'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-task-type'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath (section, sequenceId) {
      const route = {
        name: section,
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-${section}`
        route.params.episode_id = this.currentEpisode.id
      }

      if (sequenceId) {
        route.params.sequence_id = sequenceId
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
.episode {
  min-width: 100px;
  width: 100px;
}

.name {
  min-width: 150px;
  width: 150px;
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

.actions {
  width: 100%;
}
</style>
