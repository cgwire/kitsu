<template>
<div class="data-list">
  <div class="table-header-wrapper">
    <table class="table table-header" ref="headerWrapper">
      <thead>
        <tr>
          <th class="thumbnail"></th>
          <th class="sequence" ref="th-sequence" >
            {{ $t('shots.fields.sequence') }}
          </th>
          <th class="name shot-name" ref="th-shot" >
            {{ $t('shots.fields.name') }}
          </th>
          <th class="framein" v-if="isFrameIn">
            {{ $t('shots.fields.frame_in') }}
          </th>
          <th class="frameout" v-if="isFrameOut">
            {{ $t('shots.fields.frame_out') }}
          </th>
          <th class="fps" v-if="isFps">{{ $t('shots.fields.fps') }}</th>
          <th class="description" v-if="!isCurrentUserClient">
            {{ $t('shots.fields.description') }}
          </th>
          <th
            class="validation-cell"
            :key="columnId"
            :style="{
              'border-left': '1px solid ' + taskTypeMap[columnId].color,
              'background': getBackground(taskTypeMap[columnId].color)
            }"
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
            <button-link
              class="is-small"
              icon="plus"
              :text="$t('tasks.create_tasks')"
              :path="createTasksPath"
              v-if="isCurrentUserManager"
            >
            </button-link>
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

  <div
    class="has-text-centered"
    v-if="isEmptyList && !isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('shots.empty_list') }}</p>
    <button-link
      class="level-item big-button"
      :text="$t('shots.new_shots')"
      :path="manageShotsPath"
    />
  </div>
  <div
    class="has-text-centered"
    v-if="isEmptyList && isCurrentUserClient && !isLoading"
  >
    <p class="info">
      <img src="../../assets/illustrations/empty_shot.png" />
    </p>
    <p class="info">{{ $t('shots.empty_list_client') }}</p>
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
          :key="shot.id"
          :class="{canceled: shot.canceled}"
          v-for="(shot, i) in entries"
        >
          <td class="thumbnail">
            <entity-thumbnail :entity="shot" />
          </td>
          <td :class="{name: true, bold: !shot.canceled}">
            {{ shot.sequence_name }}
          </td>
          <td :class="{'shot-name': true, name: true, bold: !shot.canceled}">
            <router-link :to="shotPath(shot.id)">
              {{ shot.name }}
            </router-link>
          </td>
          <td class="framein" v-if="isFrameIn">
            {{ shot.data && shot.data.frame_in ? shot.data.frame_in : ''}}
          </td>
          <td class="frameout" v-if="isFrameOut">
            {{ shot.data && shot.data.frame_out ? shot.data.frame_out : ''}}
          </td>
          <td class="fps" v-if="isFps">
            {{ shot.data && shot.data.fps ? shot.data.fps : ''}}
          </td>
          <description-cell
            class="description"
            :entry="shot"
            v-if="!isCurrentUserClient"
          />
          <validation-cell
            class="unselectable validation-cell"
            :key="columnId + '-' + shot.id"
            :ref="'validation-' + i + '-' + j"
            :column="taskTypeMap[columnId]"
            :entity="shot"
            :selected="shotSelectionGrid[i][j]"
            :rowX="i"
            :columnY="j"
            @select="onTaskSelected"
            @unselect="onTaskUnselected"
            v-for="(columnId, j) in sortedValidationColumns"
          />
          <row-actions v-if="isCurrentUserManager"
            :entry="shot"
            :edit-route="editPath(shot.id)"
            :restore-route="restorePath(shot.id)"
            :delete-route="deletePath(shot.id)"
          />
          <td class="actions" v-else></td>
        </tr>
      </tbody>
    </table>
  </div>

  <p
    class="has-text-centered nb-shots"
    v-if="!isEmptyList && !isLoading"
  >
    {{ displayedShotsLength }} {{ $tc('shots.number', displayedShotsLength) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import colors from '../../lib/colors'

import DescriptionCell from '../cells/DescriptionCell'
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
      lastSelection: null
    }
  },

  components: {
    ButtonLink,
    ButtonHrefLink,
    DescriptionCell,
    EntityThumbnail,
    PageTitle,
    RowActions,
    TableInfo,
    ValidationCell
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'currentEpisode',
      'displayedShotsLength',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isFps',
      'isFrameIn',
      'isFrameOut',
      'isSingleEpisode',
      'isTVShow',
      'nbSelectedTasks',
      'shotSearchText',
      'shotSelectionGrid',
      'taskTypeMap'
    ]),

    isEmptyList () {
      return this.entries &&
             this.entries.length === 0 &&
             !this.isLoading &&
             !this.isError &&
             (!this.shotSearchText || this.shotSearchText.length === 0)
    },

    createTasksPath () {
      return this.getPath('create-shot-tasks')
    },

    manageShotsPath () {
      let route = {
        name: 'manage-shots',
        params: {
          production_id: this.currentProduction.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-manage-shots'
        route.params.episode_id = this.currentEpisode.id
      }

      return route
    },

    sortedValidationColumns () {
      return [...this.validationColumns].sort((a, b) => {
        return this.taskTypeMap[a].priority < this.taskTypeMap[b].priority
      })
    }
  },

  methods: {
    ...mapActions([
      'displayMoreShots'
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
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.loadMoreShots()
      }
    },

    loadMoreShots () {
      this.displayMoreShots()
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    getBackground (color) {
      return colors.hexToRGBa(color, 0.08)
    },

    resizeHeaders () {
      if (
        this.$refs['body-tbody'] &&
        this.$refs['body-tbody'].children.length > 0
      ) {
        let sequenceWidth, shotWidth
        sequenceWidth =
          this.$refs['body-tbody'].children[0].children[1].offsetWidth
        shotWidth =
          this.$refs['body-tbody'].children[0].children[2].offsetWidth

        this.$refs['th-sequence'].style = `min-width: ${sequenceWidth}px`
        this.$refs['th-shot'].style = `min-width: ${shotWidth}px`
      }
    },

    taskTypePath (taskTypeId) {
      if (this.isTVShow && this.currentEpisode) {
        return {
          name: 'episode-task-type',
          params: {
            production_id: this.currentProduction.id,
            episode_id: this.currentEpisode.id,
            task_type_id: taskTypeId,
            type: 'shots'
          }
        }
      } else {
        return {
          name: 'task-type',
          params: {
            production_id: this.currentProduction.id,
            task_type_id: taskTypeId,
            type: 'shots'
          }
        }
      }
    },

    shotPath (shotId) {
      return this.getPath('shot', shotId)
    },

    editPath (shotId) {
      return this.getPath('edit-shot', shotId)
    },

    deletePath (shotId) {
      return this.getPath('delete-shot', shotId)
    },

    restorePath (shotId) {
      return this.getPath('restore-shot', shotId)
    },

    getPath (section, shotId) {
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

      if (shotId) {
        route.params.shot_id = shotId
      }

      return route
    }
  }
}
</script>

<style scoped>
.project {
  min-width: 60px;
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
}

.bold {
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
  width: 100px;
}

.sequence {
  min-width: 100px;
  width: 100px;
  font-weight: bold;
}

.framein {
  min-width: 60px;
  width: 60px;
}

.frameout {
  min-width: 60px;
  width: 60px;
}

.fps {
  min-width: 50px;
  max-width: 50px;
  width: 50px;
}

.description {
  min-width: 200px;
  max-width: 200px;
  width: 200px;
}

.validation-cell {
  min-width: 150px;
  max-width: 150px;
  width: 150px;
}

td.name {
  font-size: 1.2em;
}

td.sequence {
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
