<template>
<div class="estimation-wrapper">
  <div
    class="estimation-helper columns"
  >
    <div ref="body" class="task-list column datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th class="assignees">
              {{ $t('tasks.fields.assignees') }}
            </th>
            <th class="thumbnail">
            </th>
            <th class="asset-type" v-if="isAssets">
              {{ $t('tasks.fields.asset_type') }}
            </th>
            <th class="sequence" v-else>
              {{ $t('tasks.fields.sequence') }}
            </th>
            <th class="name">
              {{ $t('tasks.fields.entity_name') }}
            </th>
            <th class="frames numeric-cell" v-if="!isAssets">
              {{ $t('tasks.fields.frames') }}
            </th>
            <th class="seconds numeric-cell" v-if="!isAssets">
              {{ $t('tasks.fields.seconds').substring(0, 3) }}.
            </th>
            <th class="estimation numeric-cell">
              {{ $t('tasks.fields.estimation').substring(0, 3) }}.
            </th>
            <th class="empty">
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
              'datatable-row': true,
              selected: selectionGrid[task.id],
              'task-line': true
            }"
            v-for="(task, index) in tasksByPerson"
          >
            <td class="assignees flexrow">
              <people-avatar
                class="flexrow-item"
                :person="personMap[personId]"
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
                  :person="personMap[personId]"
                  :size="30"
                  :font-size="17"
                />
                <people-name
                  class="flexrow-item"
                  :person="personMap[personId]"
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
            <td class="sequence" v-else>
              {{ getEntity(task.entity.id).sequence_name }}
            </td>
            <td class="name">
              {{ getEntity(task.entity.id).name }}
            </td>
            <td class="frames numeric-cell" v-if="!isAssets">
              {{ getEntity(task.entity.id).nb_frames }}
            </td>
            <td class="frames numeric-cell" v-if="!isAssets">
              {{ getSeconds(task) }}
            </td>
            <td
              @click="selectTask($event, task, index)"
              class="estimation numeric-cell"
            >
              <input
                :ref="task.id + '-estimation'"
                class="input stylehidden"
                @blur="onInputBlur"
                @change="estimationUpdated($event, task, index)"
                @keydown="onKeyDown"
                @mouseout="onInputMouseOut"
                @mouseover="onInputMouseOver"
                :value="formatDuration(task.estimation)"
                v-if="isCurrentUserManager"
              />
              <span v-else>
                {{ formatDuration(task.estimation) }}
              </span>
            </td>
            <td>
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
              {{ $t('tasks.fields.estimated_quota') }}.
            </th>
            <th class="empty">
              &nbsp;
            </th>
          </tr>
        </thead>

        <tbody
          class="datatable-body"
        >
          <tr
            :ref="'person-' + person.id"
            :key="person.id"
            :class="{
              'datatable-row': true,
              'task-line': true
            }"
            v-for="person in assignees"
          >
            <td class="person flexrow">
              <people-avatar
                class="flexrow-item"
                :person="person"
                :size="30"
                :font-size="17"
              />
              <people-name
                class="flexrow-item"
                :person="person"
              />
            </td>
            <td class="count numeric-cell">
              {{ person.count }}
            </td>
            <td class="frames numeric-cell">
              {{ person.frames }}
            </td>
            <td class="seconds numeric-cell">
              {{ person.seconds }}
            </td>
            <td class="estimation numeric-cell">
              {{ person.estimation }}
            </td>
            <td class="quota numeric-cell">
              {{ person.quota }}
            </td>
            <td>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'

import EntityThumbnail from '@/components/widgets/EntityThumbnail'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import PeopleName from '@/components/widgets/PeopleName'

import { domMixin } from '@/components/mixins/dom'
import { formatListMixin } from '@/components/lists/format_mixin'
import { minutesToDays, range } from '@/lib/time'
import { frameToSeconds } from '@/lib/video'
import firstBy from 'thenby'

export default {
  name: 'estimation-helper',

  mixins: [domMixin, formatListMixin],

  components: {
    EntityThumbnail,
    PeopleAvatar,
    PeopleName
  },

  props: {
    isAssets: {
      type: Boolean,
      default: true
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      lastSelection: 0,
      lastShiftSelection: 0,
      selectionGrid: {}
    }
  },

  mounted () {
  },

  computed: {
    ...mapGetters([
      'assetMap',
      'currentProduction',
      'isCurrentUserManager',
      'organisation',
      'personMap',
      'shotMap'
    ]),

    assignees () {
      const assigneeSet = new Set()
      const countMap = new Map()
      const secondMap = new Map()
      const frameMap = new Map()
      const estimationMap = new Map()
      const assignees = []
      this.tasks.forEach(task => {
        const entity = this.getEntity(task.entity_id)
        task.assignees.forEach(personId => {
          assigneeSet.add(personId)
          countMap.set(personId, (countMap.get(personId) || 0) + 1)
          estimationMap.set(
            personId,
            (estimationMap.get(personId) || 0) + task.estimation
          )
          if (!this.isAssets) {
            const frames = entity.nb_frames || 0
            const seconds = frameToSeconds(
              frames,
              this.currentProduction,
              entity
            )
            secondMap.set(personId, (secondMap.get(personId) || 0) + seconds)
            frameMap.set(personId, (frameMap.get(personId) || 0) + frames)
          }
        })
      })
      assigneeSet.forEach(
        (val, personId) => assignees.push(this.personMap[personId])
      )
      return assignees
        .sort(firstBy('name'))
        .map(person => {
          const estimation = estimationMap.get(person.id) || 0
          const seconds = secondMap.get(person.id) || 0
          const frames = frameMap.get(person.id) || 0
          const estimationDays = minutesToDays(this.organisation, estimation)
          const quota = estimation > 0 ? (seconds / estimationDays) : 0
          return {
            ...person,
            count: countMap.get(person.id) || 0,
            estimation: this.formatDuration(estimation),
            frames,
            quota: quota.toFixed(2),
            seconds: seconds.toFixed(2)
          }
        })
    },

    tasksByPerson () {
      return [...this.tasks]
        .sort(firstBy(this.compareFirstAssignees))
    }
  },

  methods: {
    ...mapActions([
      'updateTask'
    ]),

    frameToSeconds,

    getEntity (entityId) {
      if (this.isAssets) {
        return this.assetMap[entityId]
      } else {
        return this.shotMap[entityId]
      }
    },

    compareFirstAssignees (a, b) {
      if (a.assignees.length > 0 && b.assignees.length > 0) {
        const personA = this.personMap[a.assignees[0]]
        const personB = this.personMap[b.assignees[0]]
        return personA.name.localeCompare(personB.name)
      } else if (a.assignees.length > 0) {
        return -1
      } else if (b.assignees.length > 0) {
        return 1
      } else {
        return -1
      }
    },

    getSeconds (task) {
      const shot = this.getEntity(task.entity_id)
      return frameToSeconds(
        shot.nb_frames,
        this.currentProduction,
        shot
      )
    },

    estimationUpdated (event, task) {
      const value = event.target.value
      if (value && value.length > 0) {
        const estimation = parseFloat(event.target.value)
        this.saveEstimations(estimation, task)
      }
    },

    saveEstimations (days, task) {
      const selection = Object.keys(this.selectionGrid)
      if (selection.length > 1) {
        selection.forEach(taskId => {
          this.$emit('estimation-changed', { taskId, days })
        })
      } else {
        this.$emit('estimation-changed', { taskId: task.id, days })
      }
    },

    onKeyDown (event) {
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

    clearSelection () {
      this.selectionGrid = {}
    },

    addToSelection (taskId) {
      Vue.set(this.selectionGrid, taskId, true)
    },

    selectTask (event, task, index) {
      if (event.shiftKey) {
        if (!event.ctrlKey) this.clearSelection()
        this.selectTaskRange(index)
      } else {
        if (!event.ctrlKey) this.clearSelection()
        this.selectSingleTask(index)
      }
      if (this.isCurrentUserManager) {
        this.focusInput(
          this.$refs[this.tasksByPerson[index].id + '-estimation'][0]
        )
      }
    },

    selectPrevious (shiftKey) {
      let index = this.lastSelection
      index = (index - 1) < 0 ? index =
        this.tasksByPerson.length - 1 : index - 1
      this.selectTask({ shiftKey }, this.tasksByPerson[index], index)
    },

    selectNext (shiftKey) {
      let index = this.lastSelection
      index = (index + 1) >= this.tasksByPerson.length ? index = 0 : index + 1
      this.selectTask({ shiftKey }, this.tasksByPerson[index], index)
    },

    selectSingleTask (index) {
      const task = this.tasksByPerson[index]
      this.addToSelection(task.id)
      this.lastSelection = index
      this.lastShiftSelection = index
    },

    selectTaskRange (index) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
th {
  padding: 0.4em 0;
}

td {
  padding: 0;

  &.thumbnail {
    padding-top: 0.2em;
  }

  &.assignees {
    padding-left: 0.4em;
    padding-top: 0.2em;
  }
}

.assignees {
  min-width: 260px;
  max-width: 260px;
  width: 260px;

  span {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }
}

.thumbnail {
  min-width: 80px;
  max-width: 80px;
  width: 80px;
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

.number {
  min-width: 80px;
  width: 80px;
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
  flex: 1.5;
}

.person-list {
  flex: 1;

  td {
    padding: 0.2em;
  }
}
</style>
