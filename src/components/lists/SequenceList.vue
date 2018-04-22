<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="episode" v-if="!isSingleEpisode">
            {{ $t('shots.fields.episode') }}
          </th>
          <th class="name">{{ $t('shots.fields.sequence') }}</th>
          <th class="description">{{ $t('shots.fields.description') }}</th>
          <th
            class="validation"
            :style="validationStyle(column.color)"
            v-for="column in validationColumns">
            {{ column.name }}
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

  <div class="has-text-centered" v-if="isEmptyList">
    <p class="info">{{ $t('sequences.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_shots')"
      :path="{
        name: 'manage-shots',
        params: {production_id: currentProduction.id}
      }"
    >
    </button-link>
  </div>

  <div
    ref="body"
    class="table-body"
    v-infinite-scroll="loadMoreSequences"
    v-scroll="onBodyScroll"
  >
    <table class="table">
      <tbody>
        <tr
          :key="entry.id"
          v-for="(entry, i) in entries"
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
            :style="validationStyle(column.color)"
            v-for="column in validationColumns">
            <pie-chart
              width="70px"
              height="50px"
              :legend="false"
              :colors="chartColors(entry, column)"
              :data="chartData(entry, column)"
              v-if="isStats(entry, column)"
            >
            </pie-chart>
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
import ValidationCell from '../cells/ValidationCell'
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
    TableInfo,
    ValidationCell
  },
  computed: {
    ...mapGetters([
      'currentProduction',
      'isCurrentUserManager',
      'isSingleEpisode',
      'displayedSequencesLength',
      'sequenceSearchText'
    ]),
    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.shotSearchText || this.shotSearchText.length === 0)
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
    }
  }
}
</script>

<style scoped>
.episode {
  min-width: 100px;
  max-width: 100px;
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
  max-width: 200px;
  width: 200px;
}

.validation {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}
</style>
