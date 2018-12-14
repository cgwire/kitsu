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
          <th
            class="validation"
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
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_sequences')"
      :path="manageShotPath"
    >
    </button-link>
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
    v-infinite-scroll="loadMoreSequences"
    v-scroll="onBodyScroll"
    v-if="!isLoading"
  >
    <table class="table">
      <tbody ref="body-tbody">
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

          <td
            class="validation"
            :style="getValidationStyle(columnId)"
            :key="columnId"
            v-for="columnId in sortedValidationColumns">
            <pie-chart
              width="70px"
              height="50px"
              :legend="false"
              :colors="chartColors(entry, taskTypeMap[columnId])"
              :data="chartData(entry, taskTypeMap[columnId])"
              v-if="isStats(entry, taskTypeMap[columnId])"
            />
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
import { entityListMixin } from './base'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'sequence-list',
  mixins: [entityListMixin],

  props: [
    'entries',
    'isLoading',
    'isError',
    'sequenceStats',
    'validationColumns'
  ],

  data () {
    return {
      busy: false,
      lastSelection: null
    }
  },

  components: {
    ButtonLink,
    PageTitle,
    RowActions,
    TableInfo
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedSequencesLength',
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
    },

    manageShotPath () {
      return this.getPath('manage-shots')
    }
  },

  methods: {
    ...mapActions([
      'displayMoreSequences',
      'loadMoreSequences'
    ]),

    chartColors (entry, column) {
      const stats = this.sequenceStats[entry.id][column.id]
      const taskStatusIds = Object.keys(stats)
      return taskStatusIds.map((key) => {
        return this.sequenceStats[entry.id][column.id][key].color
      })
    },

    chartData (entry, column) {
      return Object.keys(this.sequenceStats[entry.id][column.id]).map((key) => {
        return [
          this.sequenceStats[entry.id][column.id][key].name,
          this.sequenceStats[entry.id][column.id][key].value
        ]
      })
    },

    isStats (entry, column) {
      return this.sequenceStats[entry.id] &&
             this.sequenceStats[entry.id][column.id]
    },

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    loadMoreSequences () {
      this.displayMoreSequences()
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

<style scoped>
.episode {
  min-width: 100px;
  width: 100px;
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
  width: 200px;
}

.validation {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
  word-wrap: break-word;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}
</style>
