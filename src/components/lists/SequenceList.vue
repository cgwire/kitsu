<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name" ref="th-sequence">
            {{ $t('shots.fields.sequence') }}
          </th>
          <th class="description">{{ $t('shots.fields.description') }}</th>
          <th class="validation">{{ $t('main.all') }}</th>
          <th
            class="validation validation-cell"
            :style="getValidationStyle(columnId)"
            :key="columnId"
            v-for="columnId in sortedValidationColumns"
            v-if="!isLoading"
          >
            <router-link
              :to="taskTypePath(columnId)"
            >
              {{ taskTypeMap[columnId].name }}
            </router-link>
          </th>
          <th class="actions">
          </th>
        </tr>
      </thead>
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

  <div
    ref="body"
    class="table-body"
    v-scroll="onBodyScroll"
    v-if="!isLoading"
  >
    <table class="table">
      <tbody ref="body-tbody">

        <tr
          class="all-line"
          v-if="showAll && !isEmptyList"
        >
          <td class="name">
            {{ $t('sequences.all_sequences') }}
          </td>

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
            v-for="columnId in sortedValidationColumns"
          />

          <td class="actions">
          </td>
        </tr>

        <tr
          :key="entry.id"
          v-for="entry in entries"
        >

          <td class="name">
            {{ entry.name }}
          </td>

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
            v-for="columnId in sortedValidationColumns"
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
          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
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

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreSequences()
      }
    },

    loadMoreSequences () {
      this.displayMoreSequences()
      this.$nextTick(this.resizeHeaders)
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    resizeHeaders () {
      if (this.$refs['body-tbody'] &&
          this.$refs['body-tbody'].children.length > 0) {
        const sequenceWidth =
          this.$refs['body-tbody'].children[0].children[0].offsetWidth
        this.$refs['th-sequence'].style = `min-width: ${sequenceWidth}px`
      }
    },

    editPath (sequenceId) {
      return this.getPath('edit-sequence', sequenceId)
    },

    deletePath (sequenceId) {
      return this.getPath('delete-sequence', sequenceId)
    },

    taskTypePath (taskTypeId) {
      let route = {
        name: 'task-type',
        params: {
          production_id: this.currentProduction.id,
          task_type_id: taskTypeId,
          type: 'shots'
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = `episode-task-type`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath (section, sequenceId) {
      let route = {
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
</style>
