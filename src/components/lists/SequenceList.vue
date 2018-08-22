<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="episode" ref="th-episode" v-if="!isSingleEpisode">
            {{ $t('shots.fields.episode') }}
          </th>
          <th class="name" ref="th-sequence">
            {{ $t('shots.fields.sequence') }}
          </th>
          <th class="description">{{ $t('shots.fields.description') }}</th>
          <th
            class="validation"
            :style="validationStyle(taskTypeMap[columnId].color)"
            :key="columnId"
            v-for="columnId in validationColumns"
          >
            <router-link
              :to="{
                name: 'task-type',
                params: {
                  production_id: currentProduction.id,
                  task_type_id: columnId
                }
              }"
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
  >
  </table-info>

  <div class="has-text-centered" v-if="isEmptyList && !isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('sequences.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_sequences')"
      :path="{
        name: 'manage-shots',
        params: {production_id: currentProduction.id}
      }"
    >
    </button-link>
  </div>
  <div class="has-text-centered" v-if="isEmptyList && isCurrentUserClient">
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
  >
    <table class="table">
      <tbody ref="body-tbody">
        <tr
          :key="entry.id"
          v-for="entry in entries"
        >

          <td class="name" v-if="!isSingleEpisode">
            {{ entry.episode_name }}
          </td>

          <td class="name">
            {{ entry.name }}
          </td>

          <td class="description">
            {{ entry.description }}
          </td>

          <td
            class="validation"
            :style="validationStyle(taskTypeMap[column].color)"
            :key="column.id"
            v-for="column in validationColumns">
            <pie-chart
              width="70px"
              height="50px"
              :legend="false"
              :colors="chartColors(entry, taskTypeMap[column])"
              :data="chartData(entry, taskTypeMap[column])"
              v-if="isStats(entry, taskTypeMap[column])"
            />
          </td>

          <row-actions v-if="isCurrentUserManager"
            :entry="entry"
            :edit-route="{
              name: 'edit-sequence',
              params: {
                sequence_id: entry.id,
                production_id: currentProduction.id
              }
            }"
            :delete-route="{
              name: 'delete-sequence',
              params: {
                sequence_id: entry.id,
                production_id: currentProduction.id
              }
            }"
          >
          </row-actions>

          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-sequences" v-if="!isEmptyList">
    {{ displayedSequencesLength }}
    {{ $tc('sequences.number', displayedSequencesLength) }}
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'

export default {
  name: 'sequence-list',

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
      'displayedSequencesLength',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isSingleEpisode',
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

    validationStyle (color) {
      return {
        'border-left': `2px solid ${color}`
      }
    },

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
      this.$refs.body.scrollTop = scrollPosition
    },

    resizeHeaders () {
      if (this.$refs['body-tbody'].children.length > 0) {
        let sequenceWidth
        if (this.isSingleEpisode) {
          sequenceWidth =
            this.$refs['body-tbody'].children[0].children[0].offsetWidth
        } else {
          sequenceWidth =
            this.$refs['body-tbody'].children[0].children[1].offsetWidth
          const episodeWidth =
            this.$refs['body-tbody'].children[0].children[0].offsetWidth
          this.$refs['th-episode'].style = `min-width: ${episodeWidth}px`
        }

        this.$refs['th-sequence'].style = `min-width: ${sequenceWidth}px`
      }
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
  min-width: 100px;
  width: 100px;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}
</style>
