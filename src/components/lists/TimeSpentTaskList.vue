<template>
  <div class="data-list">
    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="2"
      :with-thumbnail="false"
      :with-actions="false"
    />

    <div class="aggregated-time-spents">
      <div class="by-project" :key="project.id" v-for="project in projects">
        <production-name :production="project" />

        <div
          class="by-task-type-id"
          :key="taskType.id"
          v-for="taskType in project.taskTypes"
        >
          <task-type-name :task-type="taskTypeMap.get(taskType.id)" />

          <div class="table-body">
            <table class="datatable">
              <tbody class="datatable-body">
                <tr
                  class="datatable-row"
                  :key="task.id"
                  v-for="task in taskType.tasks"
                >
                  <router-link :to="getTaskPath(task)">
                    <td class="name">
                      {{ task.name }}
                    </td>
                    <td class="duration">
                      {{ duration(task) }}
                    </td>
                  </router-link>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports
import { firstBy } from 'thenby'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { getTaskPath as buildTaskPath } from '@/lib/path'
import { sortByName } from '@/lib/sorting'
import { convertHours, formatTimesheetValue } from '@/lib/timesheet'

import ProductionName from '@/components/widgets/ProductionName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

// Composables
const { t } = useI18n()
const store = useStore()

// Props
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  unit: { type: String, default: 'hour' },
  dailyRate: { type: Number, default: 0 }
})

// Computed
// --------------------------------------------------------------------------
const organisation = computed(() => store.getters.organisation)
const use12HourClock = computed(() => store.getters.use12HourClock)
const productionMap = computed(() => store.getters.productionMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// tasks grouped by production then task type, productions and tasks
// sorted by name
const projects = computed(() => {
  const groups = {}
  props.tasks.forEach(task => {
    if (!groups[task.project_id]) {
      groups[task.project_id] = {
        id: task.project_id,
        name: productionLabel(task),
        taskTypes: {}
      }
    }
    const taskTypes = groups[task.project_id].taskTypes
    if (!taskTypes[task.task_type_id]) taskTypes[task.task_type_id] = []
    taskTypes[task.task_type_id].push({
      id: task.task_id,
      project_id: task.project_id,
      task_type_id: task.task_type_id,
      name: entityName(task),
      duration: task.duration
    })
  })
  return Object.values(groups)
    .sort(firstBy('name'))
    .map(project => ({
      ...project,
      taskTypes: Object.entries(project.taskTypes).map(([id, tasks]) => ({
        id,
        tasks: sortByName(tasks)
      }))
    }))
})

// Functions
// --------------------------------------------------------------------------
const productionLabel = task => {
  const production = productionMap.value.get(task.project_id)
  return production?.project_status_name === 'Closed'
    ? t('productions.closed_name', { name: task.project_name })
    : task.project_name
}

const entityName = task => {
  if (!['Shot', 'Sequence'].includes(task.entity_type_name)) {
    return `${task.entity_type_name} / ${task.entity_name}`
  }
  const name = `${task.sequence_name} / ${task.entity_name}`
  return task.episode_name ? `${task.episode_name} / ${name}` : name
}

// selected unit, one decimal max without padding; salaries in whole units
const duration = task => {
  const value = convertHours(
    task.duration / 60,
    props.unit,
    organisation.value,
    props.dailyRate
  )
  return formatTimesheetValue(value, props.unit, use12HourClock.value)
}

// closed productions have no task page: the empty target resolves to the
// current route, so the row stays put
const getTaskPath = task => {
  const production = productionMap.value.get(task.project_id)
  if (!production || production.project_status_name === 'Closed') return ''
  const isTVShow = production.production_type === 'tvshow'
  const episode = { id: production.first_episode_id }
  return buildTaskPath(task, null, isTVShow, episode, taskTypeMap.value)
}
</script>

<style lang="scss" scoped>
// the side panel is narrow: let the name column flex and keep a real
// column for the numbers instead of a fixed 300px name squeezing them
.name {
  width: 100%;
}

.duration {
  min-width: 70px;
  text-align: right;
  white-space: nowrap;
}

.by-task-type-id {
  margin-top: 1em;
}

// the global 10px radius, minus the corner under the task type tag so
// the tag reads as a tab on the list
.table-body {
  border-top-left-radius: 0;
}

.by-project {
  margin-bottom: 2em;
}

a {
  color: var(--text);
}

// the production name widget paints itself black in light theme
:deep(.avatar-name) {
  color: var(--text);
}

// the widget hides its label on small screens for the top bar's sake:
// the panel has the room and nothing else names the production
@media screen and (max-width: 768px) {
  .by-project :deep(.avatar-name) {
    display: inline;
  }
}
</style>
