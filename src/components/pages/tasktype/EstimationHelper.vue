<template>
  <div class="estimation-wrapper">
    <div class="estimation-helper columns">
      <div ref="body" class="task-list column datatable-wrapper">
        <table class="datatable">
          <thead class="datatable-head">
            <tr>
              <th class="assignees">
                {{ $t('tasks.fields.assignees') }}
              </th>
              <th class="thumbnail"></th>
              <th class="asset-type" v-if="isAssets">
                {{ $t('tasks.fields.asset_type') }}
              </th>
              <th class="sequence" v-else-if="isShots">
                {{ $t('tasks.fields.sequence') }}
              </th>
              <th class="name">
                {{ $t('tasks.fields.entity_name') }}
              </th>
              <th class="frames numeric-cell" v-if="isShots">
                {{ $t('tasks.fields.frames') }}
              </th>
              <th class="seconds numeric-cell" v-if="isShots">
                {{ $t('tasks.fields.seconds').substring(0, 3) }}.
              </th>
              <th class="estimation numeric-cell">
                {{ $t('tasks.fields.estimation').substring(0, 3) }}.
              </th>
            </tr>
          </thead>

          <tbody class="datatable-body">
            <tr
              :ref="'task-' + task.id"
              :key="task.id"
              :class="{
                'datatable-row': true,
                selected: selectionGrid[task.id],
                'task-line': true
              }"
              v-for="(task, index) in tasksByPerson"
            >
              <td class="assignees flexrow">
                <people-avatar
                  class="flexrow-item"
                  :person="personMap.get(personId)"
                  :size="30"
                  :font-size="17"
                  v-for="personId in task.assignees"
                  :key="task.id + '-' + personId"
                  v-if="task.assignees.length > 1"
                />
                <span
                  class="flexrow"
                  :key="task.id + '-' + personId"
                  v-for="personId in task.assignees"
                  v-else
                >
                  <people-avatar
                    class="flexrow-item"
                    :person="personMap.get(personId)"
                    :size="30"
                    :font-size="17"
                  />
                  <people-name
                    class="flexrow-item"
                    :person="personMap.get(personId)"
                  />
                </span>
              </td>
              <td class="thumbnail">
                <entity-thumbnail
                  :entity="getEntity(task.entity.id)"
                  :width="50"
                  :height="33"
                  :empty-width="50"
                  :empty-height="31"
                />
              </td>
              <td class="asset-type" v-if="isAssets">
                {{ getEntity(task.entity.id).asset_type_name }}
              </td>
              <td class="sequence" v-else-if="isShots">
                {{ getEntity(task.entity.id).sequence_name }}
              </td>
              <td class="name">
                {{ getEntity(task.entity.id).name }}
              </td>
              <td class="frames numeric-cell" v-if="isShots">
                {{ getEntity(task.entity.id).nb_frames }}
              </td>
              <td class="frames numeric-cell" v-if="isShots">
                {{ getSeconds(task) }}
              </td>
              <td
                @click="selectTask($event, task, index)"
                class="estimation numeric-cell"
              >
                <input
                  :ref="task.id + '-estimation'"
                  class="input stylehidden"
                  min="0"
                  step="any"
                  type="number"
                  @blur="onInputBlur"
                  @change="estimationUpdated($event, task, index)"
                  @keydown="onKeyDown"
                  @mouseout="onInputMouseOut"
                  @mouseover="onInputMouseOver"
                  :value="formatDuration(task.estimation, false)"
                  v-if="isInDepartment(task)"
                />
                <span v-else>
                  {{ formatDuration(task.estimation) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="person-list column datatable-wrapper">
        <table class="datatable">
          <thead ref="thead" class="datatable-head">
            <tr>
              <th class="assignees">
                {{ $t('tasks.fields.assignees') }}
              </th>
              <th class="count numeric-cell">
                {{ $t('tasks.fields.count') }}
              </th>
              <th class="frames numeric-cell">
                {{ $t('tasks.fields.frames') }}
              </th>
              <th class="seconds numeric-cell">
                {{ $t('tasks.fields.seconds').substring(0, 3) }}.
              </th>
              <th class="estimation numeric-cell">
                {{ $t('tasks.fields.estimation').substring(0, 3) }}.
              </th>
              <th class="quota numeric-cell">
                {{
                  $t('tasks.fields.estimated_quota') +
                  ' ' +
                  $t('tasks.fields.seconds').substring(0, 3)
                }}.
              </th>
              <th class="quota numeric-cell">
                {{
                  $t('tasks.fields.estimated_quota') +
                  ' ' +
                  $t('tasks.fields.frames').substring(0, 3)
                }}.
              </th>
              <th class="quota numeric-cell">
                {{
                  $t('tasks.fields.estimated_quota') +
                  ' ' +
                  $t('tasks.fields.count')
                }}.
              </th>
              <th class="empty">&nbsp;</th>
            </tr>
          </thead>

          <tbody class="datatable-body">
            <template v-for="person in assignees">
              <template>
                <tr
                  class="datatable-row task-line"
                  :key="`${person.id}-alltasks`"
                >
                  <td class="person flexrow">
                    <people-avatar
                      class="flexrow-item"
                      :person="person"
                      :size="30"
                      :font-size="17"
                    />
                    <people-name class="flexrow-item" :person="person" />
                  </td>
                  <td class="count numeric-cell">
                    {{ person.alltasks.count }}
                  </td>
                  <td class="frames numeric-cell">
                    {{ person.alltasks.frames }}
                  </td>
                  <td class="seconds numeric-cell">
                    {{ person.alltasks.seconds }}
                  </td>
                  <td class="estimation numeric-cell">
                    {{ person.alltasks.estimation }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.alltasks.quota }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.alltasks.quotaFrames }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.alltasks.quotaCount }}
                  </td>
                  <td></td>
                </tr>
                <tr
                  class="datatable-row task-line"
                  :key="`${person.id}-remaining`"
                >
                  <td class="person flexrow">
                    <corner-down-right-icon class="ml05 mr05" size="0.9x" />
                    {{ $t('main.remaining') }}
                  </td>
                  <td class="count numeric-cell">
                    {{ person.remaining.count }}
                  </td>
                  <td class="frames numeric-cell">
                    {{ person.remaining.frames }}
                  </td>
                  <td class="seconds numeric-cell">
                    {{ person.remaining.seconds }}
                  </td>
                  <td class="estimation numeric-cell">
                    {{ person.remaining.estimation }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.remaining.quota }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.remaining.quotaFrames }}
                  </td>
                  <td class="quota numeric-cell">
                    {{ person.remaining.quotaCount }}
                  </td>
                  <td></td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue/dist/vue'
import { mapGetters, mapActions } from 'vuex'
import { CornerDownRightIcon } from 'vue-feather-icons'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/mixins/format'
import { minutesToDays, range } from '@/lib/time'
import { frameToSeconds } from '@/lib/video'
import firstBy from 'thenby'

export default {
  name: 'estimation-helper',

  mixins: [domMixin, formatListMixin],

  components: {
    CornerDownRightIcon,
    EntityThumbnail,
    PeopleAvatar,
    PeopleName
  },

  props: {
    entityType: {
      type: String,
      default: 'Asset'
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      lastSelection: 0,
      lastShiftSelection: 0,
      selectionGrid: {}
    }
  },

  mounted() {},

  computed: {
    ...mapGetters([
      'assetMap',
      'editMap',
      'episodeMap',
      'currentProduction',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'user',
      'organisation',
      'personMap',
      'sequenceMap',
      'shotMap',
      'taskStatusMap',
      'taskTypeMap'
    ]),

    isAssets() {
      return this.entityType === 'Asset'
    },

    isShots() {
      return this.entityType === 'Shot'
    },

    tasksByPerson() {
      return [...this.tasks].sort(firstBy(this.compareFirstAssignees))
    },

    entityMap() {
      return this[`${this.entityType.toLowerCase()}Map`]
    },

    assignees() {
      const assigneeSet = new Set()
      const alltasks = {
        countMap: new Map(),
        frameMap: new Map(),
        estimationMap: new Map(),
        secondMap: new Map()
      }
      const remaining = {
        countMap: new Map(),
        frameMap: new Map(),
        estimationMap: new Map(),
        secondMap: new Map()
      }
      const assignees = []
      this.tasks.forEach(task => {
        const entity = this.getEntity(task.entity_id)
        task.assignees.forEach(personId => {
          assigneeSet.add(personId)
          this.addAssigneeStatsToMaps(alltasks, personId, task, entity)
          const status = this.taskStatusMap.get(task.task_status_id)
          if (!status.is_done && !status.is_feedback_request) {
            this.addAssigneeStatsToMaps(remaining, personId, task, entity)
          }
        })
      })
      assigneeSet.forEach((val, personId) =>
        assignees.push(this.personMap.get(personId))
      )
      return assignees.sort(firstBy('name')).map(person => {
        const allTasksStats = this.getAssigneeStats(person, alltasks)
        const remainingStats = this.getAssigneeStats(person, remaining)
        return {
          ...person,
          alltasks: allTasksStats,
          remaining: remainingStats
        }
      })
    }
  },

  methods: {
    ...mapActions(['updateTask']),

    frameToSeconds,

    getEntity(entityId) {
      return this.entityMap.get(entityId)
    },

    compareFirstAssignees(a, b) {
      if (a.assignees.length > 0 && b.assignees.length > 0) {
        const personA = this.personMap.get(a.assignees[0])
        const personB = this.personMap.get(b.assignees[0])
        return personA.name.localeCompare(personB.name)
      } else if (a.assignees.length > 0) {
        return -1
      } else if (b.assignees.length > 0) {
        return 1
      } else {
        return -1
      }
    },

    getSeconds(task) {
      const shot = this.getEntity(task.entity_id)
      return frameToSeconds(shot.nb_frames, this.currentProduction, shot)
    },

    estimationUpdated(event, task) {
      const value = event.target.value
      if (value && value.length > 0) {
        const estimation = parseFloat(event.target.value)
        this.saveEstimations(estimation, task)
      }
    },

    saveEstimations(days, task) {
      const selection = Object.keys(this.selectionGrid)
      if (selection.length > 1) {
        selection.forEach(taskId => {
          this.$emit('estimation-changed', { taskId, days })
        })
      } else {
        this.$emit('estimation-changed', { taskId: task.id, days })
      }
    },

    onKeyDown(event) {
      if (event.key === 'Tab') {
        this.pauseEvent(event)
        if (event.shiftKey) {
          this.selectPrevious()
        } else {
          this.selectNext()
        }
      } else if (event.key === 'ArrowDown') {
        this.pauseEvent(event)
        this.selectNext(event.shiftKey)
      } else if (event.key === 'ArrowUp') {
        this.pauseEvent(event)
        this.selectPrevious(event.shiftKey)
      }
    },

    clearSelection() {
      this.selectionGrid = {}
    },

    addToSelection(taskId) {
      Vue.set(this.selectionGrid, taskId, true)
    },

    selectTask(event, task, index) {
      if (event.shiftKey) {
        if (!(event.ctrlKey || event.metaKey)) this.clearSelection()
        this.selectTaskRange(index)
      } else {
        if (!(event.ctrlKey || event.metaKey)) this.clearSelection()
        this.selectSingleTask(index)
      }
      if (this.isInDepartment(task)) {
        this.focusInput(
          this.$refs[this.tasksByPerson[index].id + '-estimation'][0]
        )
      }
    },

    selectPrevious(shiftKey) {
      let index = this.lastSelection
      index = index - 1 < 0 ? this.tasksByPerson.length - 1 : index - 1
      this.selectTask({ shiftKey }, this.tasksByPerson[index], index)
    },

    selectNext(shiftKey) {
      let index = this.lastSelection
      index = index + 1 >= this.tasksByPerson.length ? 0 : index + 1
      this.selectTask({ shiftKey }, this.tasksByPerson[index], index)
    },

    selectSingleTask(index) {
      const task = this.tasksByPerson[index]
      this.addToSelection(task.id)
      this.lastSelection = index
      this.lastShiftSelection = index
    },

    selectTaskRange(index) {
      let taskIndices = []
      this.lastSelection = index
      if (this.lastShiftSelection > index) {
        taskIndices = range(index, this.lastShiftSelection)
      } else {
        taskIndices = range(this.lastShiftSelection, index)
      }
      const selection = taskIndices.map(i => this.tasksByPerson[i].id)
      selection.forEach(taskId => {
        this.addToSelection(taskId)
      })
    },

    isInDepartment(task) {
      if (this.isCurrentUserManager) {
        return true
      } else if (this.isCurrentUserSupervisor) {
        if (this.user.departments.length === 0) {
          return true
        } else {
          const taskType = this.taskTypeMap.get(task.task_type_id)
          return (
            taskType.department_id &&
            this.user.departments.includes(taskType.department_id)
          )
        }
      } else {
        return false
      }
    },

    getAssigneeStats(person, maps) {
      const estimation = maps.estimationMap.get(person.id) || 0
      const seconds = maps.secondMap.get(person.id) || 0
      const frames = maps.frameMap.get(person.id) || 0
      const count = maps.countMap.get(person.id) || 0
      const estimationDays = minutesToDays(this.organisation, estimation)
      const quota = estimation > 0 ? seconds / estimationDays : 0
      const quotaCount = estimation > 0 ? count / estimationDays : 0
      const quotaFrames = estimation > 0 ? frames / estimationDays : 0

      return {
        count: maps.countMap.get(person.id) || 0,
        estimation: this.formatDuration(estimation),
        frames,
        quota: quota.toFixed(2),
        quotaFrames: quotaFrames.toFixed(2),
        quotaCount: quotaCount.toFixed(2),
        seconds: seconds.toFixed(2)
      }
    },

    addAssigneeStatsToMaps(maps, personId, task, entity) {
      maps.countMap.set(personId, (maps.countMap.get(personId) || 0) + 1)
      maps.estimationMap.set(
        personId,
        (maps.estimationMap.get(personId) || 0) + task.estimation
      )
      if (!this.isAssets) {
        const frames = entity.nb_frames || 0
        const seconds = frameToSeconds(frames, this.currentProduction, entity)
        maps.secondMap.set(
          personId,
          (maps.secondMap.get(personId) || 0) + seconds
        )
        maps.frameMap.set(personId, (maps.frameMap.get(personId) || 0) + frames)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
th {
  padding: 0.4em 0;
}

td {
  padding: 0 0.4em;

  &.thumbnail {
    padding-top: 0.2em;
  }

  &.assignees {
    padding-left: 0.4em;
    padding-top: 0.2em;
  }
}

.assignees {
  min-width: 200px;
  max-width: 200px;
  width: 200px;

  span {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
}

.thumbnail {
  vertical-align: middle;
  min-width: 64px;
  max-width: 64px;
  width: 64px;
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

.frames,
.estimation,
.seconds,
.count {
  min-width: 60px;
  width: 60px;
}

.number {
  min-width: 80px;
  width: 80px;
  text-align: right;
}

.estimation-helper {
  max-height: 100%;
}

.estimation-wrapper {
  flex: 1;
}

.columns {
  margin-top: 1em;
}

.column {
  padding: 0 1em 1em 1em;
}

.task-list {
  .empty {
    border-left: 0px solid transparent;
  }
}

.task-list .numeric-cell,
.person-list .numeric-cell {
  padding-right: 0.4em;
  text-align: right;

  input {
    text-align: right;
  }
}
.task-list .numeric-cell input.input {
  padding-right: 0.5em;
}

.person-list {
  flex: 1;

  td {
    padding: 0.2em;
  }
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
