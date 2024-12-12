<template>
  <div class="project-stats" :class="{ expandable }" @click="expandStats">
    <div class="nb-tasks">
      <span class="tag">
        {{ stats.amount_done || 0 }} {{ $t('tasks.done') }}
        /
        {{ stats.amount || 0 }} {{ $t('tasks.tasks') }}
      </span>
      <span class="tag">
        {{ formatDuration(stats.total_duration) }}
        {{
          isDurationInHours()
            ? $tc('main.hours_spent', formatDuration(stats.total_duration))
            : $tc('main.days_spent', formatDuration(stats.total_duration))
        }}
        /
        {{ formatDuration(stats.total_estimation) }}
        {{
          isDurationInHours()
            ? $tc(
                'main.hours_estimated',
                formatDuration(stats.total_estimation)
              )
            : $tc('main.days_estimated', formatDuration(stats.total_estimation))
        }}
      </span>
    </div>
    <div class="color-wrapper">
      <div
        class="stat"
        :style="{
          backgroundColor: taskStatusMap.get(statusId).color,
          width: `${(statsByStatus[statusId] / stats.amount) * 100}%`
        }"
        :key="statusId"
        :title="`${taskStatusMap.get(statusId).name} - ${statsByStatus[statusId]} tasks`"
        v-for="statusId in statusIds"
      ></div>
    </div>

    <div class="task-type-stats" v-if="expanded">
      <div
        class="flexrow task-type-stat"
        :key="taskType.id"
        v-for="taskType in taskTypes"
      >
        <div class="task-type-wrapper flexrow-item">
          <task-type-name
            class="flexrow-item task-type-name"
            :task-type="taskType"
          />
        </div>
        <div class="task-type-wrapper flexrow-item">
          {{ taskTypeStatsMap[taskType.id].amount_done }}
          /
          {{ taskTypeStatsMap[taskType.id].amount }} {{ $t('tasks.tasks') }}
        </div>
        <div class="task-type-wrapper flexrow-item">
          {{ formatDuration(taskTypeStatsMap[taskType.id].total_duration) }}
          /
          {{ formatDuration(taskTypeStatsMap[taskType.id].total_estimation) }}
          {{ $tc('main.days') }}
        </div>
        <div class="color-wrapper flexrow-item">
          <div
            class="stat"
            :style="{
              backgroundColor: taskStatusMap.get(statusStats.task_status_id)
                .color,
              width: `${(statusStats.amount / taskTypeStatsMap[taskType.id].amount) * 100}%`
            }"
            :key="taskType.id + statusStats.task_status_id"
            :title="`${taskStatusMap.get(statusStats.task_status_id).name} - ${statusStats.amount} tasks`"
            v-for="statusStats in sortStatuses(
              taskTypeStatsMap[taskType.id].task_statuses
            )"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
  This component displays the stats of a given production.
  It shows the number of tasks done, the number of tasks in total, the total
  duration spent on tasks and the total estimation of the tasks.
  It also shows the repartition of the tasks by status as colored line.
  When expanded, it shows the repartition of the tasks by task type.
*/
import { mapGetters } from 'vuex'

import { formatListMixin } from '@/components/mixins/format'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'production-stats',

  mixins: [formatListMixin],

  components: {
    TaskTypeName
  },

  props: {
    stats: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      expanded: false
    }
  },

  computed: {
    ...mapGetters(['taskStatusMap', 'taskTypeMap']),

    expandable() {
      return this.stats.task_types?.length > 0
    },

    statusIds() {
      return Object.keys(this.statsByStatus).sort((a, b) => {
        return (
          this.taskStatusMap.get(a).priority <
          this.taskStatusMap.get(b).priority
        )
      })
    },

    taskTypes() {
      const entityPriority = {
        Asset: 1,
        Shot: 2,
        Sequence: 3,
        Episode: 4,
        Edit: 5,
        Concept: 6
      }
      return Object.keys(this.taskTypeStatsMap)
        .map(taskTypeId => {
          return this.taskTypeMap.get(taskTypeId)
        })
        .sort((a, b) => {
          if (a.for_entity !== b.for_entity) {
            return entityPriority[a.for_entity] > entityPriority[b.for_entity]
          } else {
            return a.priority > b.priority
          }
        })
    },

    taskTypeStatsMap() {
      const taskTypeStatsMap = {}
      this.stats.task_types?.forEach(taskTypeStat => {
        if (!taskTypeStatsMap[taskTypeStat.task_type_id]) {
          taskTypeStatsMap[taskTypeStat.task_type_id] = {
            task_type_id: taskTypeStat.task_type_id,
            amount: 0,
            amount_done: 0,
            total_duration: 0,
            total_estimation: 0,
            task_statuses: []
          }
        }
        taskTypeStatsMap[taskTypeStat.task_type_id].amount +=
          taskTypeStat.amount
        taskTypeStatsMap[taskTypeStat.task_type_id].amount_done +=
          taskTypeStat.amount_done
        taskTypeStatsMap[taskTypeStat.task_type_id].total_duration +=
          taskTypeStat.total_duration
        taskTypeStatsMap[taskTypeStat.task_type_id].total_estimation +=
          taskTypeStat.total_estimation
        taskTypeStatsMap[taskTypeStat.task_type_id].task_statuses.push(
          taskTypeStat
        )
      })
      return taskTypeStatsMap
    },

    statsByStatus() {
      const statsByStatus = {}
      this.stats.task_types?.forEach(taskTypeStat => {
        if (!statsByStatus[taskTypeStat.task_status_id]) {
          statsByStatus[taskTypeStat.task_status_id] = 0
        }
        statsByStatus[taskTypeStat.task_status_id] += taskTypeStat.amount
      })
      return statsByStatus
    }
  },

  methods: {
    expandStats() {
      if (this.expandable) {
        this.expanded = !this.expanded
      }
    },

    sortStatuses(statuses) {
      return statuses.sort((a, b) => {
        return (
          this.taskStatusMap.get(a.task_status_id).priority <
          this.taskStatusMap.get(b.task_status_id).priority
        )
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.project-stats {
  background: var(--background);
  padding: 1em;
  border-radius: 5px;

  &.expandable {
    cursor: pointer;
  }
}

.color-wrapper {
  border: 1px solid var(--border-alt);
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 14px;

  .dark & {
    border: 1px solid var(--border);
  }
}

.stat {
  &:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  &:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}

.nb-tasks .tag {
  background: var(--background-selected);
  color: $black;
  margin: 0 0.5em 0.5em 0;

  .dark & {
    color: $white;
  }
}

.tag {
  border: 1px solid var(--border);
}

.task-type-stats {
  margin-top: 1em;
}

.task-type-wrapper {
  margin-right: 1em;
  margin-top: 0.5em;
  min-width: 120px;
}
</style>
