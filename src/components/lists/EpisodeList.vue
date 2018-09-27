<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="name" ref="th-episode">
            {{ $t('shots.fields.episode') }}
          </th>
          <th class="description">
            {{ $t('shots.fields.description') }}
          </th>
          <th
            class="validation"
            :style="validationStyle(taskTypeMap[columnId].color)"
            :key="taskTypeMap[columnId].id"
            v-for="columnId in validationColumns">
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

  <div class="has-text-centered" v-if="isEmptyList && !isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('episodes.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_episodes')"
      :path="{
        name: 'manage-shots',
        params: {production_id: currentProduction.id}
      }"
    />
  </div>
  <div class="has-text-centered" v-if="isEmptyList && isCurrentUserClient">
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('episodes.empty_list_client') }}</p>
  </div>

  <div
    ref="body"
    class="table-body"
    v-infinite-scroll="loadMoreEpisodes"
    v-scroll="onBodyScroll"
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
            :style="validationStyle(taskTypeMap[columnId].color)"
            :key="columnId"
            v-for="columnId in validationColumns">
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

          <td class="actions" v-else>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="has-text-centered nb-episodes" v-if="!isEmptyList">
    {{ displayedEpisodesLength }}
    {{ $tc('episodes.number', displayedEpisodesLength) }}
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
  name: 'episode-list',
  props: [
    'entries',
    'isLoading',
    'isError',
    'episodeStats',
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

    validationStyle (color) {
      return {
        'border-left': `2px solid ${color}`
      }
    },

    chartColors (entry, column) {
      const stats = this.episodeStats[entry.id][column.id]
      const taskStatusIds = Object.keys(stats)
      return taskStatusIds.map((key) => {
        return this.episodeStats[entry.id][column.id][key].color
      })
    },

    chartData (entry, column) {
      return Object.keys(this.episodeStats[entry.id][column.id]).map((key) => {
        return [
          this.episodeStats[entry.id][column.id][key].name,
          this.episodeStats[entry.id][column.id][key].value
        ]
      })
    },

    isStats (entry, column) {
      return this.episodeStats[entry.id] &&
             this.episodeStats[entry.id][column.id]
    },

    onHeaderScroll (event, position) {
      this.$refs.tableWrapper.scrollLeft = position.scrollLeft
    },

    onBodyScroll (event, position) {
      this.$refs.headerWrapper.style.left = `-${position.scrollLeft}px`
      this.$emit('scroll', position.scrollTop)
    },

    loadMoreEpisodes () {
      this.displayMoreEpisodes()
    },

    setScrollPosition (scrollPosition) {
      this.$refs.body.scrollTop = scrollPosition
    },

    resizeHeaders () {
      if (this.$refs['body-tbody'].children.length > 0) {
        const episodeWidth =
          this.$refs['body-tbody'].children[0].children[0].offsetWidth
        this.$refs['th-episode'].style = `min-width: ${episodeWidth}px`
      }
    },

    editPath (episodeId) {
      return this.getPath('edit-episode', episodeId)
    },

    deletePath (episodeId) {
      return this.getPath('delete-episode', episodeId)
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

      if (this.isTVShow) {
        route.name = `episode-task-type`
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    getPath (section, episodeId) {
      let route = {
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

<style scoped>
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
