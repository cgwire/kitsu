<template>
  <div class="project-stats" :class="{ expandable }" @click="expandStats">
    <div class="nb-tasks">
      <span class="tag">
        {{ stats.amount_done || 0 }} {{ $t('tasks.done') }}
        /
        {{ stats.amount || 0 }} {{ $t('tasks.tasks') }}
      </span>
      <span class="tag">
        {{ formatDuration(organisation, stats.total_duration) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_spent',
                formatDuration(organisation, stats.total_duration, false)
              )
            : $t(
                'main.days_spent',
                formatDuration(organisation, stats.total_duration, false)
              )
        }}
        /
        {{ formatDuration(organisation, stats.total_estimation) }}
        {{
          isDurationInHours
            ? $t(
                'main.hours_estimated',
                formatDuration(organisation, stats.total_estimation, false)
              )
            : $t(
                'main.days_estimated',
                formatDuration(organisation, stats.total_estimation, false)
              )
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
          {{
            formatDuration(
              organisation,
              taskTypeStatsMap[taskType.id].total_duration
            )
          }}
          /
          {{
            formatDuration(
              organisation,
              taskTypeStatsMap[taskType.id].total_estimation
            )
          }}
          {{
            isDurationInHours
              ? $t(
                  'main.hours',
                  formatDuration(
                    organisation,
                    taskTypeStatsMap[taskType.id].total_estimation,
                    false
                  )
                )
              : $t(
                  'main.days',
                  formatDuration(
                    organisation,
                    taskTypeStatsMap[taskType.id].total_estimation,
                    false
                  )
                )
          }}
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

<script setup>
/*
  Displays the stats of a production: number of done tasks, totals duration,
  estimation, and a status repartition bar. When expanded, shows the same
  breakdown per task type.
*/
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { formatDuration } from '@/lib/time'

import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const ENTITY_PRIORITY = {
  Asset: 1,
  Shot: 2,
  Sequence: 3,
  Episode: 4,
  Edit: 5,
  Concept: 6
}

const props = defineProps({
  stats: { type: Object, default: () => ({}) }
})

const store = useStore()

const expanded = ref(false)

const organisation = computed(() => store.getters.organisation)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const isDurationInHours = computed(
  () => organisation.value.format_duration_in_hours
)

const expandable = computed(() => props.stats.task_types?.length > 0)

const taskTypeStatsMap = computed(() => {
  const map = {}
  props.stats.task_types?.forEach(stat => {
    if (!map[stat.task_type_id]) {
      map[stat.task_type_id] = {
        task_type_id: stat.task_type_id,
        amount: 0,
        amount_done: 0,
        total_duration: 0,
        total_estimation: 0,
        task_statuses: []
      }
    }
    map[stat.task_type_id].amount += stat.amount
    map[stat.task_type_id].amount_done += stat.amount_done
    map[stat.task_type_id].total_duration += stat.total_duration
    map[stat.task_type_id].total_estimation += stat.total_estimation
    map[stat.task_type_id].task_statuses.push(stat)
  })
  return map
})

const statsByStatus = computed(() => {
  const result = {}
  props.stats.task_types?.forEach(stat => {
    if (!result[stat.task_status_id]) {
      result[stat.task_status_id] = 0
    }
    result[stat.task_status_id] += stat.amount
  })
  return result
})

const statusIds = computed(() =>
  Object.keys(statsByStatus.value).sort(
    (a, b) =>
      taskStatusMap.value.get(a).priority < taskStatusMap.value.get(b).priority
  )
)

const taskTypes = computed(() =>
  Object.keys(taskTypeStatsMap.value)
    .map(taskTypeId => taskTypeMap.value.get(taskTypeId))
    .sort((a, b) => {
      if (a.for_entity !== b.for_entity) {
        return ENTITY_PRIORITY[a.for_entity] > ENTITY_PRIORITY[b.for_entity]
      }
      return a.priority > b.priority
    })
)

const expandStats = () => {
  if (expandable.value) {
    expanded.value = !expanded.value
  }
}

const sortStatuses = statuses =>
  statuses.sort(
    (a, b) =>
      taskStatusMap.value.get(a.task_status_id).priority <
      taskStatusMap.value.get(b.task_status_id).priority
  )
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
