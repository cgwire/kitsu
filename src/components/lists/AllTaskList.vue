<template>
  <div class="data-list">
    <div ref="body" class="datatable-wrapper">
      <table class="datatable">
        <thead ref="thead" class="datatable-head">
          <tr class="row-header">
            <th class="project" ref="th-name">
              {{ $t('tasks.fields.production') }}
            </th>
            <th class="thumbnail" ref="th-thumbnail"></th>
            <th class="asset-type" ref="th-type">
              {{ $t('tasks.fields.parent') }}
            </th>
            <th class="name" ref="th-name">
              {{ $t('tasks.fields.entity') }}
            </th>
            <th class="name" ref="th-name">
              {{ $t('tasks.fields.task_type') }}
            </th>
            <th class="status" ref="th-status">
              {{ $t('tasks.fields.task_status') }}
            </th>
            <th class="assignees" ref="th-assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th
              ref="th-estimation"
              class="estimation number-cell"
              :title="$t('main.estimation')"
            >
              {{ $t('tasks.fields.estimation').substring(0, 3) }}.
            </th>
            <th class="duration number-cell" ref="th-duration">
              {{ $t('tasks.fields.duration').substring(0, 3) }}.
            </th>
            <th class="start-date" ref="th-date">
              {{ $t('tasks.fields.start_date') }}
            </th>
            <th class="due-date" ref="th-date">
              {{ $t('tasks.fields.due_date') }}
            </th>
            <th class="done-date" ref="th-date">
              {{ $t('tasks.fields.done_date') }}
            </th>
            <th class="empty" ref="">&nbsp;</th>
          </tr>
        </thead>

        <tbody class="datatable-body">
          <tr
            :ref="'task-' + task.id"
            :key="task.id"
            :class="{
              'task-line': true,
              'datatable-row': true,
              selected: selectionGrid[task.id]
            }"
            @click="selectTask($event, index, task)"
            v-for="(task, index) in tasks"
          >
            <td class="project">
              <production-name-cell
                class="project"
                :entry="{ id: task.project_id, name: task.project_name }"
                :only-avatar="true"
                :is-link="false"
              />
            </td>
            <td class="thumbnail">
              <entity-thumbnail
                class="flexrow-item"
                :preview-file-id="task.last_preview_file_id"
                :width="50"
                :height="33"
                :empty-width="50"
                :empty-height="33"
              />
            </td>
            <td class="asset-type">
              {{ getParentName(task) }}
            </td>
            <td class="name">
              {{ task.entity_name }}
            </td>
            <task-type-cell
              class="name"
              :task-type="taskTypeMap.get(task.task_type_id)"
            />
            <validation-cell
              class="status unselectable"
              :task-test="task"
              :is-border="false"
              :is-assignees="false"
              :selectable="false"
              :is-static="true"
            />
            <td class="assignees">
              <div class="flexrow">
                <people-avatar-with-menu
                  class="flexrow-item"
                  :key="task.id + '-' + personId"
                  :person="personMap.get(personId)"
                  :size="30"
                  :font-size="16"
                  @unassign="person => onUnassign(task, person)"
                  v-for="personId in task.assignees"
                />
              </div>
            </td>
            <td class="estimation number-cell">
              {{ formatDuration(task.estimation) }}
            </td>
            <td
              :class="{
                duration: true,
                'number-cell': true,
                error: isEstimationBurned(task)
              }"
            >
              {{ formatDuration(task.duration) }}
            </td>
            <td class="start-date">
              {{ formatDate(task.start_date) }}
            </td>
            <td class="due-date">
              {{ formatDate(task.due_date) }}
            </td>
            <td class="done-date">
              {{ formatDate(task.done_date) }}
            </td>
            <td class="empty"></td>
          </tr>
        </tbody>
      </table>
      <div class="has-text-centered" v-if="isMore && !isLoading">
        <spinner class="mt2" v-if="isMoreLoading" />
        <button
          class="button mt2"
          @click="$emit('more-clicked')"
          v-else-if="!isLoading"
        >
          {{ $t('main.load_more') }}
        </button>
      </div>
      <table-info :is-loading="isLoading" :is-error="isError" />
    </div>
    <p class="has-text-centered nb-tasks" v-if="!isLoading">
      {{ stats.total }} {{ $tc('tasks.number', stats.total) }} ({{
        formatDuration(stats.total_estimation)
      }}
      {{ $tc('main.days_estimated', isTimeEstimatedPlural) }},
      {{ formatDuration(stats.total_duration) }}
      {{ $tc('main.days_spent', isTimeSpentPlural) }})
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'

import { formatListMixin } from '@/components/mixins/format'
import { domMixin } from '@/components/mixins/dom'

import EntityThumbnail from '@/components/widgets/EntityThumbnail.vue'
import PeopleAvatarWithMenu from '@/components/widgets/PeopleAvatarWithMenu.vue'
import ProductionNameCell from '@/components/cells/ProductionNameCell.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import ValidationCell from '@/components/cells/ValidationCell.vue'

export default {
  name: 'all-task-list',

  mixins: [domMixin, formatListMixin],

  components: {
    EntityThumbnail,
    PeopleAvatarWithMenu,
    ProductionNameCell,
    Spinner,
    TableInfo,
    TaskTypeCell,
    ValidationCell
  },

  emits: ['more-clicked', 'task-selected'],

  data() {
    return {
      lastSelection: null,
      page: 1,
      selectionGrid: {}
    }
  },

  props: {
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isMore: {
      type: Boolean,
      default: false
    },
    isMoreLoading: {
      type: Boolean,
      default: false
    },
    stats: {
      type: Object,
      default: () => {}
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeyDown, false)
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'editMap',
      'episodeMap',
      'nbSelectedTasks',
      'personMap',
      'user',
      'selectedTasks',
      'sequenceMap',
      'shotMap',
      'taskMap',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'taskTypeMap'
    ]),

    isTimeSpentPlural() {
      return (
        Math.floor(
          (this.stats.total_duration ? this.stats.total_duration : 0) / 60 / 8
        ) >= 1
      )
    },

    isTimeEstimatedPlural() {
      return (
        Math.floor(
          (this.stats.total_estimation ? this.stats.total_estimation : 0) /
            60 /
            8
        ) >= 1
      )
    },

    nbFrames() {
      let total = 0
      this.tasks.forEach(task => {
        total += task.entity_nb_frames
      })
      return total
    }
  },

  methods: {
    ...mapActions([
      'addSelectedTask',
      'addSelectedTasks',
      'clearSelectedTasks',
      'updateTask',
      'unassignPersonFromTask',
      'removeSelectedTask'
    ]),

    getParentName(task) {
      if (task.sequence_name) {
        if (task.episode_name) {
          return `${task.episode_name} - ${task.sequence_name}`
        } else {
          return task.sequence_name
        }
      } else {
        return task.entity_type_name
      }
    },

    getTaskName(task) {
      return task.entity_name
    },

    getDate(date) {
      return date ? moment(date, 'YYYY-MM-DD').toDate() : null
    },

    formatDate(date) {
      if (date) return moment(date).format('YYYY-MM-DD')
      return ''
    },

    isEstimationBurned(task) {
      return (
        task.estimation &&
        task.estimation > 0 &&
        task.duration > task.estimation
      )
    },

    onKeyDown(event) {
      if (this.tasks.length > 0 && event.altKey) {
        let index = this.lastSelection ? this.lastSelection : 0
        if ([37, 38].includes(event.keyCode)) {
          index = index - 1 < 0 ? (index = this.tasks.length - 1) : index - 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        } else if ([39, 40].includes(event.keyCode)) {
          index = index + 1 >= this.tasks.length ? (index = 0) : index + 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        }
      }
    },

    selectTask(event, index, task) {
      if (
        event &&
        event.target &&
        // Dirty hack needed to make date picker and inputs work properly
        (['INPUT'].includes(event.target.nodeName) ||
          (event.target.parentNode &&
            ['HEADER'].includes(event.target.parentNode.nodeName)) ||
          ['cell day selected'].includes(event.target.className))
      )
        return
      const isSelected = this.selectionGrid[task.id]
      const isManySelection = Object.keys(this.selectionGrid).length > 1
      this.clearSelectedTasks({ task })
      this.resetSelection()

      if (this.selectionGrid[task.id]) {
        this.removeSelectedTask({ task })
        this.selectionGrid[task.id] = undefined
      } else if (!isSelected || isManySelection) {
        this.addSelectedTask({ task })
        this.$emit('task-selected', task)
        this.selectionGrid[task.id] = true
        this.lastSelection = index
      }
    },

    setScrollPosition(scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    resetSelection() {
      this.selectionGrid = {}
      this.lastSelection = null
    }
  },

  watch: {
    tasks() {
      this.page = 1
      this.resetSelection()
    },

    nbSelectedTasks() {
      if (this.nbSelectedTasks === 0) this.resetSelection()
    }
  }
}
</script>

<style lang="scss" scoped>
.thumbnail {
  min-width: 63px;
  max-width: 63px;
  width: 63px;
}

.asset-type {
  min-width: 120px;
  width: 120px;
}

.sequence {
  min-width: 120px;
  width: 120px;
}

.name {
  min-width: 120px;
  width: 120px;
  font-weight: bold;
}

.status {
  min-width: 140px;
  width: 140px;
}

.assignees {
  min-width: 100px;
  width: 100px;
}

.frames,
.duration,
.estimation {
  min-width: 60px;
  width: 60px;
}

.last-comment-date,
.real-start-date,
.real-end-date {
  min-width: 110px;
  max-width: 110px;
  width: 110px;
}

th.start-date,
th.due-date {
  min-width: 106px;
  max-width: 106px;
  width: 106px;
}

td.start-date,
td.due-date {
  text-align: center;
  margin: 0;
  padding: 0;
}

.empty {
  width: 100%;
}

.nb-tasks {
  padding: 0.5em;
}

.table-header th {
  padding: 0.5em 0;

  &.status {
    padding-left: 1em;
  }
}

.datatable-head {
  th {
    padding-left: 5px;

    &.retake-count {
      padding-right: 1em;
    }

    &.status {
      padding-left: 1em;
      padding-right: 1em;
    }
  }
}

.input {
  padding: 0.5em;
}

.datatable-wrapper {
  min-height: calc(100% - 50px);
}

.data-list {
  margin-top: 0.6em;
}

.list-wrapper {
  overflow-x: auto;
  overflow-y: auto;
}

.list-wrapper div:first-child h2 {
  margin-top: 0;
}

.datatable-body {
  overflow-x: auto;
  overflow-y: scroll;
  min-height: 100%;

  td,
  tr {
    padding-bottom: 0;
    padding-top: 0;

    &.thumbnail {
      padding: 6px;
    }
  }

  td.retake-count {
    padding-right: 0.5em;
  }

  td.name {
    border-right: 1px solid var(--border);
  }

  td.status {
    padding-left: 1em;
    padding-right: 1em;
  }

  tr.task-line {
    cursor: pointer;
  }
}

.error {
  color: $red;
}

.datatable-row:hover {
  background: var(--background-selectable);
}
</style>
