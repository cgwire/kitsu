<template>
<div class="data-list">
  <div
    ref="body"
    class="datatable-wrapper"
    v-scroll="onBodyScroll"
    v-if="!isContactSheet"
 >
    <table class="datatable">
      <thead ref="thead" class="datatable-head">
        <tr class="row-header">
          <th class="thumbnail" ref="th-thumbnail">
          </th>
          <th class="asset-type" ref="th-type" v-if="isAssets">
            {{ $t('tasks.fields.asset_type') }}
          </th>
          <th class="sequence" ref="th-type" v-else-if="!isEpisodes">
            {{ $t('tasks.fields.sequence') }}
          </th>
          <th class="name" ref="th-name">
            {{ $t('tasks.fields.entity_name') }}
          </th>
          <th class="status" ref="th-status">
            {{ $t('tasks.fields.task_status') }}
          </th>
          <th class="assignees" ref="th-assignees">
            {{ $t('tasks.fields.assignees') }}
          </th>
          <th class="frames number-cell" ref="th-frames" v-if="isShots">
            {{ $t('tasks.fields.frames') }}
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
          <th class="retake-count number-cell" ref="th-retake-count">
            {{ $t('tasks.fields.retake_count') }}
          </th>
          <th class="start-date" ref="th-estimation">
            {{ $t('tasks.fields.start_date') }}
          </th>
          <th class="due-date" ref="th-estimation">
            {{ $t('tasks.fields.due_date') }}
          </th>
          <th class="real-start-date" ref="th-status">
            {{ $t('tasks.fields.real_start_date') }}
          </th>
          <th class="real-end-date" ref="th-status">
            {{ $t('tasks.fields.real_end_date') }}
          </th>
          <th class="last-comment-date" ref="th-status">
            {{ $t('tasks.fields.last_comment_date') }}
          </th>
          <th class="empty" ref="">
            &nbsp;
          </th>
        </tr>
      </thead>

      <tbody
        class="datatable-body"
      >
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
          <td class="thumbnail flexrow">
            <entity-thumbnail
              class="flexrow-item"
              :entity="getEntity(task.entity.id)"
              :width="50"
              :height="33"
              :empty-width="50"
              :empty-height="33"
              v-if="task.entity"
            />
          </td>
          <td class="asset-type" v-if="isAssets">
            {{ getEntity(task.entity.id).asset_type_name }}
          </td>
          <td class="sequence" v-else-if="!isEpisodes">
            {{ getEntity(task.entity.id).sequence_name }}
          </td>
          <td class="name">
            {{ getEntity(task.entity.id).name }}
          </td>
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
          <td class="frames" v-if="isShots">
            {{ getEntity(task.entity.id).nb_frames }}
          </td>
          <td class="estimation number-cell">
            <input
              v-if="isInDepartment(task) && selectionGrid[task.id]"
              :ref="task.id + '-estimation'"
              class="input"
              @change="updateEstimation($event.target.value)"
              :value="formatDuration(task.estimation)"
            />
            <span v-else>
              {{ formatDuration(task.estimation) }}
            </span>
          </td>
          <td :class="{
            duration: true,
            'number-cell': true,
            error: isEstimationBurned(task)
          }">
            {{ formatDuration(task.duration) }}
          </td>
          <td class="retake-count number-cell">
            <span
              v-for="index in task.retake_count"
              :key="index"
            >
              &bull;
            </span>
          </td>
          <td class="start-date">
            <date-field
              class="flexrow-item"
              :with-margin="false"
              :value="getDate(task.start_date)"
              :disabled-dates="disabledDates"
              @input="updateStartDate"
              v-if="isInDepartment(task) && selectionGrid[task.id]"
            />
            <span v-else>
              {{ formatDate(task.start_date) }}
            </span>
          </td>
          <td class="due-date">
            <date-field
              class="flexrow-item"
              :with-margin="false"
              :value="getDate(task.due_date)"
              :disabled-dates="disabledDates"
              @input="updateDueDate"
              v-if="isInDepartment(task) && selectionGrid[task.id]"
            />
            <span v-else>
              {{ formatDate(task.due_date) }}
            </span>

          </td>
          <td class="real-start-date">
            {{ formatDate(task.real_start_date) }}
          </td>
          <td class="real-end-date">
            {{ formatDate(task.end_date) }}
          </td>
          <td class="last-comment-date">
            {{ formatDate(task.last_comment_date) }}
          </td>
          <td>
          </td>
        </tr>
      </tbody>
    </table>
    <table-info
      :is-loading="isLoading"
      :is-error="isError"
    />
  </div>
  <div
    class="list-wrapper"
    v-else-if="tasksByParent && tasksByParent.length > 0 && this.isGrouped"
  >
    <div
      :key="'task-section-' + i"
      v-for="(taskGroup, i) in tasksByParent"
    >
      <h2>
      {{ taskGroup.name }}
      </h2>
      <div class="task-grid">
        <div
          :class="{
            'task-card': true,
            selected: selectionGrid[task.id]
          }"
          :key="task.id"
          @click="selectTask($event, index, task)"
          v-for="(task, index) in taskGroup.tasks"
        >
          <entity-thumbnail
            class="flexrow-item"
            :entity="getEntity(task.entity.id)"
            :width="200"
            :height="133"
            :empty-width="200"
            :empty-height="133"
            no-preview
            v-if="task.entity"
          />
          <span class="task-name">
            {{ getTaskName(task) }}
          </span>
          <div class="flexrow task-data">
            <validation-tag class="flexrow-item" :task="task" thin />
            <div class="filler"></div>
            <people-avatar-with-menu
              class="flexrow-item"
              :key="task.id + '-' + personId"
              :person="personMap.get(personId)"
              :size="20"
              :font-size="10"
              @unassign="person => onUnassign(task, person)"
              v-for="personId in task.assignees"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="task-grid list-wrapper" v-else>
    <div
      :class="{
        'task-card': true,
        selected: selectionGrid[task.id]
      }"
      :key="task.id"
      @click="selectTask($event, index, task)"
      v-for="(task, index) in displayedTasks"
    >
      <entity-thumbnail
        class="flexrow-item"
        :entity="getEntity(task.entity.id)"
        :width="200"
        :height="133"
        :empty-width="200"
        :empty-height="133"
        no-preview
        v-if="task.entity"
      />
      <span class="task-name">
        {{ getTaskName(task) }}
      </span>
      <div class="flexrow task-data">
        <validation-tag class="flexrow-item" :task="task" thin />
        <div class="filler"></div>
        <people-avatar-with-menu
          class="flexrow-item"
          :key="task.id + '-' + personId"
          :person="personMap.get(personId)"
          :size="20"
          :font-size="10"
          @unassign="person => onUnassign(task, person)"
          v-for="personId in task.assignees"
        />
      </div>
    </div>
  </div>
  <p
    class="has-text-centered nb-tasks"
    v-if="!isLoading"
  >
    {{ tasks.length }} {{ $tc('tasks.number', tasks.length) }}
    ({{ formatDuration(timeEstimated) }}
     {{ $tc('main.days_estimated', isTimeEstimatedPlural) }},
     {{ formatDuration(timeSpent) }}
     {{ $tc('main.days_spent', isTimeSpentPlural) }}<span v-if="!isAssets">,
     {{ nbFrames }} {{ $tc('main.nb_frames', nbFrames) }}</span>)
  </p>
</div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment-timezone'
import {
  daysToMinutes,
  formatSimpleDate,
  getDatesFromStartDate,
  getDatesFromEndDate,
  parseSimpleDate,
  minutesToDays,
  range
} from '@/lib/time'
import { formatListMixin } from '@/components/mixins/format'
import { domMixin } from '@/components/mixins/dom'

import DateField from '@/components/widgets/DateField'
import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatarWithMenu from '@/components/widgets/PeopleAvatarWithMenu'
import TableInfo from '@/components/widgets/TableInfo'
import ValidationCell from '@/components/cells/ValidationCell'
import ValidationTag from '@/components/widgets/ValidationTag'

export default {
  name: 'task-list',
  mixins: [domMixin, formatListMixin],

  components: {
    DateField,
    EntityThumbnail,
    PeopleAvatarWithMenu,
    TableInfo,
    ValidationCell,
    ValidationTag
  },

  data () {
    return {
      lastSelection: null,
      page: 1,
      selectionGrid: {},
      selectedDate: moment().toDate() // By default current day.
    }
  },

  props: {
    disabledDates: {
      type: Object,
      default: () => {}
    },
    entityType: {
      type: String,
      default: 'Asset'
    },
    isContactSheet: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    isGrouped: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    tasks: {
      type: Array,
      default: () => []
    },
    taskType: {
      type: Object,
      default: () => {}
    }
  },

  mounted () {
    window.addEventListener('keydown', this.onKeyDown, false)
  },

  beforeDestroy () {
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

    isAssets () {
      return this.entityType === 'Asset'
    },

    isEpisodes () {
      return this.entityType === 'Episode'
    },

    isShots () {
      return this.entityType === 'Shot'
    },

    timeSpent () {
      return this.tasks.reduce((acc, task) => acc + task.duration, 0)
    },

    isTimeSpentPlural () {
      return Math.floor(
        (this.timeSpent ? this.timeSpent : 0) / 60 / 8
      ) <= 1
    },

    timeEstimated () {
      return this.tasks.reduce((acc, task) => acc + task.estimation, 0)
    },

    isTimeEstimatedPlural () {
      return Math.floor(
        (this.timeEstimated ? this.timeEstimated : 0) / 60 / 8
      ) <= 1
    },

    nbFrames () {
      let total = 0
      this.tasks.forEach(task => {
        const entity = this.shotMap.get(task.entity.id)
        if (entity && entity.nb_frames) total += entity.nb_frames
      })
      return total
    },

    displayedTasks () {
      if (this.tasks && this.tasks.length > 0) {
        return this.tasks.slice(0, 60 * this.page)
      } else {
        return []
      }
    },

    tasksByParent () {
      const result = []
      if (this.tasks.length > 0) {
        if (this.isShots) {
          let currentTasks = {
            name: this.tasks[0].sequence_name,
            tasks: []
          }
          let previousTask = null
          this.tasks.forEach(task => {
            const entity = this.shotMap.get(task.entity.id)
            if (previousTask) {
              const previousEntity = this.shotMap.get(previousTask.entity.id)
              if (previousEntity.sequence_id !== entity.sequence_id) {
                result.push(currentTasks)
                currentTasks = {
                  name: task.sequence_name,
                  tasks: []
                }
              }
            }
            currentTasks.tasks.push(task)
            previousTask = task
          })
          result.push(currentTasks)
        } else if (this.isAssets) {
          let currentTasks = {
            name: this.tasks[0].entity_type_name,
            tasks: []
          }
          let previousTask = null
          this.tasks.forEach(task => {
            const entity = this.assetMap.get(task.entity.id)
            if (previousTask) {
              const previousEntity = this.assetMap.get(previousTask.entity.id)
              if (previousEntity.asset_type_id !== entity.asset_type_id) {
                result.push(currentTasks)
                currentTasks = {
                  name: task.entity_type_name,
                  tasks: []
                }
              }
            }
            currentTasks.tasks.push(task)
            previousTask = task
          })
          result.push(currentTasks)
        }
      }
      return result
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

    getTaskName (task) {
      if (this.entityType === 'Shot') {
        return task.sequence_name + ' / ' + this.getEntity(task.entity.id).name
      } else {
        return task.entity_name
      }
    },

    isTaskChanged (task, data) {
      const taskStart = task.start_date ? task.start_date.substring(0, 10) : ''
      const taskDue = task.due_date ? task.due_date.substring(0, 10) : ''
      return (
        (data.start_date !== undefined && taskStart !== data.start_date) ||
        (data.due_date !== undefined && taskDue !== data.due_date) ||
        (data.estimation !== undefined && task.estimation !== data.estimation)
      )
    },

    getDate (date) {
      return date ? moment(date, 'YYYY-MM-DD').toDate() : null
    },

    updateEstimation (days) {
      const estimation = daysToMinutes(this.organisation, days)
      this.updateTasksEstimation({ estimation })
    },

    onUnassign (task, person) {
      if (this.selectedTasks.size > 0) {
        this.selectedTasks.forEach(t => {
          this.unassignPersonFromTask({ task: t, person })
        })
      }
      this.unassignPersonFromTask({ task, person })
    },

    updateStartDate (date) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        let data = {
          start_date: null,
          due_date: null
        }
        const task = this.taskMap.get(taskId)
        const dueDate = task.due_date ? parseSimpleDate(task.due_date) : null
        if (date) {
          const startDate = moment(date)
          if (
            task.start_date &&
            task.start_date.substring(0, 10) === formatSimpleDate(startDate)
          ) return
          data = getDatesFromStartDate(
            startDate,
            dueDate,
            minutesToDays(this.organisation, task.estimation)
          )
        } else {
          data = {
            start_date: null,
            due_date: dueDate
          }
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data })
            .catch(console.error)
        }
      })
    },

    updateDueDate (date) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        let data = {
          start_date: null,
          due_date: null
        }
        const task = this.taskMap.get(taskId)
        const startDate = task.start_date ? parseSimpleDate(task.start_date) : null
        if (date) {
          const dueDate = moment(date)
          if (
            task.due_date &&
            task.due_date.substring(0, 10) === formatSimpleDate(dueDate)
          ) return
          data = getDatesFromEndDate(
            startDate,
            dueDate,
            minutesToDays(this.organisation, task.estimation)
          )
        } else {
          data = {
            start_date: startDate,
            due_date: null
          }
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data })
            .catch(console.error)
        }
      })
    },

    updateTasksEstimation ({ estimation }) {
      Object.keys(this.selectionGrid).forEach(taskId => {
        const task = this.taskMap.get(taskId)
        let data = { estimation }
        if (task.start_date) {
          const startDate = moment(task.start_date)
          const dueDate = task.due_date ? moment(task.due_date) : null
          data = getDatesFromStartDate(
            startDate,
            dueDate,
            minutesToDays(this.organisation, estimation)
          )
          data.estimation = estimation
        }
        if (this.isTaskChanged(task, data)) {
          this.updateTask({ taskId, data })
            .catch(console.error)
        }
      })
    },

    formatDate (date) {
      if (date) return moment(date).format('YYYY-MM-DD')
      else return ''
    },

    isEstimationBurned (task) {
      return task.estimation &&
        task.estimation > 0 &&
        task.duration > task.estimation
    },

    onBodyScroll (event, position) {
      this.$emit('scroll', position.scrollTop)
      const maxHeight =
        this.$refs.body.scrollHeight - this.$refs.body.offsetHeight
      if (maxHeight < (position.scrollTop + 100)) {
        this.page++
      }
    },

    getEntity (entityId) {
      return this[`${this.entityType.toLowerCase()}Map`].get(entityId)
    },

    onKeyDown (event) {
      if (this.tasks.length > 0 && event.altKey) {
        let index = this.lastSelection ? this.lastSelection : 0
        if ([37, 38].includes(event.keyCode)) {
          index = (index - 1) < 0 ? index = this.tasks.length - 1 : index - 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        } else if ([39, 40].includes(event.keyCode)) {
          index = (index + 1) >= this.tasks.length ? index = 0 : index + 1
          this.selectTask({}, index, this.tasks[index])
          this.pauseEvent(event)
        }
      }
    },

    selectTask (event, index, task) {
      if (event && event.target && (
        // Dirty hack needed to make date picker and inputs work properly
        ['INPUT'].includes(event.target.nodeName) ||
        (
          event.target.parentNode &&
          ['HEADER'].includes(event.target.parentNode.nodeName)
        ) ||
        ['cell day selected'].includes(event.target.className)
      )) return
      const isSelected = this.selectionGrid[task.id]
      const isManySelection = Object.keys(this.selectionGrid).length > 1
      if (!(event.ctrlKey || event.metaKey) && !event.shiftKey) {
        this.clearSelectedTasks({ task })
        this.resetSelection()
      }

      if (!event.shiftKey) {
        if (this.selectionGrid[task.id]) {
          this.removeSelectedTask({ task })
          Vue.set(this.selectionGrid, task.id, undefined)
        } else if (!isSelected || isManySelection) {
          this.addSelectedTask({ task })
          this.$emit('task-selected', task)
          Vue.set(this.selectionGrid, task.id, true)
          this.lastSelection = index
        }
      } else {
        this.selectionGrid = {}
        let taskIndices = []
        if (this.lastSelection > index) {
          taskIndices = range(index, this.lastSelection)
        } else {
          taskIndices = range(this.lastSelection, index)
        }
        const selection = taskIndices.map(i => ({ task: this.tasks[i] }))
        selection.forEach(task => {
          Vue.set(this.selectionGrid, task.task.id, true)
        })
        this.addSelectedTasks(selection)
      }
      this.scrollToLine(task.id)
    },

    setScrollPosition (scrollPosition) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = scrollPosition
      }
    },

    scrollToLine (taskId) {
      const taskLine = this.$refs['task-' + taskId]
      if (taskLine && this.$refs.body) {
        const margin = 30
        const rect = taskLine[0].getBoundingClientRect()
        const listRect = this.$refs.body.getBoundingClientRect()
        const isBelow = rect.bottom > listRect.bottom - margin
        const isAbove = rect.top < listRect.top + margin

        if (isBelow) {
          const scrollingRequired = rect.bottom - listRect.bottom + margin
          this.setScrollPosition(
            this.$refs.body.scrollTop + scrollingRequired
          )
        } else if (isAbove) {
          const scrollingRequired = listRect.top - rect.top + margin
          this.setScrollPosition(
            this.$refs.body.scrollTop - scrollingRequired
          )
        }
      }
    },

    isInDepartment (task) {
      if (this.isCurrentUserManager) {
        return true
      } else if (this.isCurrentUserSupervisor) {
        if (this.user.departments.length === 0) {
          return true
        } else {
          const taskType = this.taskTypeMap.get(task.task_type_id)
          return taskType.department_id && this.user.departments.includes(
            taskType.department_id)
        }
      } else {
        return false
      }
    },

    resetSelection () {
      this.selectionGrid = {}
      this.lastSelection = null
    },

    getTableData () {
      const headers = [
        this.isAssets ? this.$t('tasks.fields.asset_type') : this.$t('tasks.fields.sequence'),
        this.$t('tasks.fields.entity_name'),
        this.$t('tasks.fields.task_status'),
        this.$t('tasks.fields.assignees'),
        this.$t('tasks.fields.estimation'),
        this.$t('tasks.fields.duration'),
        this.$t('tasks.fields.retake_count'),
        this.$t('tasks.fields.start_date'),
        this.$t('tasks.fields.due_date'),
        this.$t('tasks.fields.real_start_date'),
        this.$t('tasks.fields.real_end_date'),
        this.$t('tasks.fields.last_comment_date')
      ]
      if (!this.isAssets) {
        headers.splice(4, 0, 'Frames')
      }
      const taskLines = [headers]
      this.tasks.forEach((task) => {
        if (!task) return
        const assignees = task.assignees.map(personId => {
          const person = this.personMap.get(personId)
          if (person) return person.name
          else return ''
        }).join(', ')

        const line = [
          this.isAssets
            ? this.getEntity(task.entity.id).asset_type_name
            : this.getEntity(task.entity.id).sequence_name,
          this.getEntity(task.entity.id).name,
          task.task_status_short_name,
          assignees,
          this.formatDuration(task.estimation),
          this.formatDuration(task.duration),
          task.retake_count,
          this.formatDate(task.start_date),
          this.formatDate(task.due_date),
          this.formatDate(task.real_start_date),
          this.formatDate(task.end_date),
          this.formatDate(task.last_comment_date)
        ]
        if (!this.isAssets) {
          const value = this.getEntity(task.entity.id).nb_frames
          line.splice(4, 0, value)
        }
        taskLines.push(line)
      })
      return taskLines
    }
  },

  watch: {
    tasks () {
      this.page = 1
      this.resetSelection()
    },

    nbSelectedTasks () {
      if (this.nbSelectedTasks === 0) this.resetSelection()
    }
  }
}
</script>

<style scoped lang="scss">
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
  min-width: 100px;
  width: 100px;
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

.selected {
  .estimation {
    padding: 0;
  }
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

.retake-count {
  min-width: 90px;
  width: 90px;
}

td.retake-count {
  line-height: 0.5em;
  color: $red;
  font-weight: bold;
  font-size: 1.6em;
  padding-left: 2px;
}

.empty {
  width: 100%
}

.nb-tasks {
  padding: 0.5em;
}

.table-header th {
  padding: 0.5em 0;

  &.retake-count {
    padding-right: 1em;
  }

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
  padding: 0.5em
}

.datatable-wrapper {
  min-height: calc(100% - 50px);
}

.data-list {
  margin-top: .6em;
}

.list-wrapper {
  overflow-x: auto;
  overflow-y: auto;
}

.list-wrapper div:first-child h2 {
  margin-top: 0em;
}

.task-grid {
  display: grid;
  gap: 10px;
  // grid-template-columns: repeat(auto-fill, 202px);
  grid-template-columns: 204px 204px 204px 204px 204px 204px;

  .task-card {
    border: 2px solid transparent;
    border-radius: 5px;
    box-shadow: 0 0 2px var(--box-shadow);
    background: var(--background-alt);
    cursor: pointer;
    display: flex;
    font-weight: bold;
    flex-direction: column;
    padding: 0;
    padding-bottom: .2em;
    transition: border .3s ease;

    &.selected {
      border: 2px solid $dark-purple;
    }

    .task-name {
      font-size: .9em;
      margin-bottom: .5em;
      margin-top: .3em;
      padding: 0 .5em;
    }
    .task-data {
      padding: 0 .1em 0 .3em;

      .avatar-wrapper:last-child {
        margin-right: 0em;
      }
    }
  }
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
</style>
