<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="episode" v-if="!isSingleEpisode">
            {{ $t('shots.fields.episode') }}
          </th>
          <th class="sequence">{{ $t('shots.fields.sequence') }}</th>
          <th class="description">{{ $t('shots.fields.description') }}</th>
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
          :class="{canceled: entry.canceled}"
          v-for="(entry, i) in entries"
        >
          <td :class="{name: !entry.canceled}" v-if="!isSingleEpisode">
            {{ entry.episode_name }}
          </td>
          <td :class="{'shot-name': true, 'name': !entry.canceled}">
            {{ entry.name }}
          </td>
          <td class="description">
            {{ entry.description }}
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
    {{ displayedSequencesLength }} {{ $tc('sequences.number', displayedSequencesLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ValidationCell from '../cells/ValidationCell'
import RowActions from '../widgets/RowActions'
import ButtonLink from '../widgets/ButtonLink'
import ButtonHrefLink from '../widgets/ButtonHrefLink'
import PageTitle from '../widgets/PageTitle'
import TableInfo from '../widgets/TableInfo'
import EntityThumbnail from '../widgets/EntityThumbnail'

export default {
  name: 'shot-list',
  props: [
    'entries',
    'isLoading',
    'isError',
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
    ButtonHrefLink,
    EntityThumbnail,
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
      'sequenceSearchText',
      'sequenceSelectionGrid'
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

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onTaskSelected (validationInfo) {
      if (validationInfo.isShiftKey) {
        if (this.lastSelection) {
          let startX = this.lastSelection.x
          let endX = validationInfo.x
          let startY = this.lastSelection.y
          let endY = validationInfo.y
          if (validationInfo.x < this.lastSelection.x) {
            startX = validationInfo.x
            endX = this.lastSelection.x
          }
          if (validationInfo.y < this.lastSelection.y) {
            startY = validationInfo.y
            endY = this.lastSelection.y
          }

          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const ref = 'validation-' + i + '-' + j
              const validationCell = this.$refs[ref][0]
              if (!this.shotSelectionGrid[i][j]) {
                validationCell.select({ctrlKey: true, isUserClick: false})
              }
            }
          }
        }
      } else if (!validationInfo.isCtrlKey) {
        this.$store.commit('CLEAR_SELECTED_TASKS')
      }
      this.$store.commit('ADD_SELECTED_TASK', validationInfo)

      if (!validationInfo.isShiftKey && validationInfo.isUserClick) {
        this.lastSelection = {
          x: validationInfo.x,
          y: validationInfo.y
        }
      }
    },

    onTaskUnselected (validationInfo) {
      if (!validationInfo.isCtrlKey) {
        if (this.nbSelectedTasks === 1) {
          this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
        } else {
          this.$store.commit('CLEAR_SELECTED_TASKS')
          this.$store.commit('ADD_SELECTED_TASK', validationInfo)
        }
      } else {
        this.$store.commit('REMOVE_SELECTED_TASK', validationInfo)
      }
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
.project {
  min-width: 60px;
  max-width: 60px;
  width: 60px;
}

.actions {
  min-width: 100px;
}

th.actions {
  padding: 0.4em;
}

.name {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

.name a {
  color: inherit;
}

.name.shot-name {
  min-width: 110px;
  width: 110px;
}

.episode {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
}

.sequence {
  min-width: 100px;
  max-width: 100px;
  width: 100px;
  font-weight: bold;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

td.name {
  font-size: 1.2em;
}

.canceled {
  text-decoration: line-through;
}

.thumbnail {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
  padding: 0;
}

.thumbnail img {
  margin-top: 5px;
}

span.thumbnail-empty {
  display: block;
  width: 50px;
  height: 30px;
  background: #F3F3F3;
}

.info {
  margin-top: 2em;
}
</style>
