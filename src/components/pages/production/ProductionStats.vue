<template>
  <div
    class="project-stats"
    :class="{ expandable }"
    :role="expandable ? 'button' : undefined"
    :tabindex="expandable ? 0 : undefined"
    @click="expandStats"
    @keydown.enter.prevent="expandStats"
    @keydown.space.prevent="expandStats"
  >
    <div class="nb-tasks">
      <span class="tag">
        {{ stats.amount_done || 0 }} {{ $t('tasks.done') }}
        /
        {{ stats.amount || 0 }}
        {{ $t('tasks.number', { count: stats.amount || 0 }) }}
      </span>
      <span class="tag">
        {{ formatDuration(organisation, stats.total_duration) }}
        {{
          isDurationInHours
            ? $t('main.hours_spent', {
                count: formatDuration(organisation, stats.total_duration, false)
              })
            : $t('main.days_spent', {
                count: formatDuration(organisation, stats.total_duration, false)
              })
        }}
        /
        {{ formatDuration(organisation, stats.total_estimation) }}
        {{
          isDurationInHours
            ? $t('main.hours_estimated', {
                count: formatDuration(
                  organisation,
                  stats.total_estimation,
                  false
                )
              })
            : $t('main.days_estimated', {
                count: formatDuration(
                  organisation,
                  stats.total_estimation,
                  false
                )
              })
        }}
      </span>
    </div>
    <div class="color-wrapper">
      <div
        class="stat"
        :style="{
          backgroundColor: taskStatusMap.get(statusId)?.color,
          width: `${(statsByStatus[statusId] / stats.amount) * 100}%`
        }"
        :key="statusId"
        :title="`${taskStatusMap.get(statusId)?.name} - ${statsByStatus[statusId]} tasks`"
        v-for="statusId in statusIds"
      ></div>
    </div>

    <div class="task-type-stats" v-if="expanded">
      <div
        class="task-type-group"
        :key="group.entity"
        v-for="group in taskTypeGroups"
      >
        <div class="task-type-group-title">{{ group.title }}</div>
        <div
          class="flexrow task-type-stat"
          :key="taskType.id"
          v-for="taskType in group.taskTypes"
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
            {{ taskTypeStatsMap[taskType.id].amount }}
            {{
              $t('tasks.number', {
                count: taskTypeStatsMap[taskType.id].amount
              })
            }}
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
                ? $t('main.hours', {
                    count: formatDuration(
                      organisation,
                      taskTypeStatsMap[taskType.id].total_estimation,
                      false
                    )
                  })
                : $t('main.days', {
                    count: formatDuration(
                      organisation,
                      taskTypeStatsMap[taskType.id].total_estimation,
                      false
                    )
                  })
            }}
          </div>
          <div class="color-wrapper flexrow-item">
            <div
              class="stat"
              :style="{
                backgroundColor: taskStatusMap.get(statusStats.task_status_id)
                  ?.color,
                width: `${(statusStats.amount / taskTypeStatsMap[taskType.id].amount) * 100}%`
              }"
              :key="taskType.id + statusStats.task_status_id"
              :title="`${taskStatusMap.get(statusStats.task_status_id)?.name} - ${statusStats.amount} tasks`"
              v-for="statusStats in sortStatuses(
                taskTypeStatsMap[taskType.id].task_statuses
              )"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { firstBy } from 'thenby'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { sortTaskStatuses } from '@/lib/sorting'
import { formatDuration } from '@/lib/time'

import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

// The tabs of the production settings, in their order, then the concepts,
// which have no tab there. Any other entity comes last, under its own name.
const ENTITY_TYPES = ['asset', 'shot', 'sequence', 'episode', 'edit', 'concept']
// A task type with no entity counts as an asset one, the entity Zou gives by
// default.
const entityOf = taskType => (taskType.for_entity || 'Asset').toLowerCase()
const entityRank = entity =>
  ENTITY_TYPES.includes(entity)
    ? ENTITY_TYPES.indexOf(entity)
    : ENTITY_TYPES.length

const props = defineProps({
  production: { type: Object, default: () => ({}) },
  stats: { type: Object, default: () => ({}) }
})

const { availableLocales, locale, t } = useI18n()
const store = useStore()

// State

const expanded = ref(false)

// Computed

const organisation = computed(() => store.getters.organisation)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskStatuses = computed(() => store.getters.taskStatuses)
const archivedTaskStatuses = computed(() => store.getters.archivedTaskStatus)
const activeTaskTypes = computed(() => store.getters.taskTypes)
const archivedTaskTypes = computed(() => store.getters.archivedTaskTypes)

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

// The order of the status menus of the production, archived statuses
// included. Read from the status lists: the status map is a cache Vue does
// not watch, so a changed priority would not sort the bars again.
const statusRanks = computed(
  () =>
    new Map(
      sortTaskStatuses(
        [...taskStatuses.value, ...archivedTaskStatuses.value],
        props.production
      ).map((status, index) => [status.id, index])
    )
)

const statusIds = computed(() =>
  Object.keys(statsByStatus.value)
    .filter(statusId => statusRanks.value.has(statusId))
    .sort((a, b) => statusRanks.value.get(a) - statusRanks.value.get(b))
)

// The task types with stats, archived ones included. Read from the task type
// lists, for the same reason as the statuses: the task type map is a cache
// too.
const taskTypes = computed(() =>
  [...activeTaskTypes.value, ...archivedTaskTypes.value].filter(
    taskType => taskTypeStatsMap.value[taskType.id]
  )
)

// In English, the words of the row's own production, whatever production is
// current: a style with an English overlay, such as an NFT or a video game
// one, names its shots otherwise.
const titleLocale = computed(() => {
  if (!locale.value.startsWith('en')) return locale.value
  const overlay = `en_${props.production.production_style}`
  return availableLocales.includes(overlay) ? overlay : 'en'
})

// One group per entity, titled like its tab in the production settings. In
// a group, the task types go by the priorities of the production, then by
// name, as in the task type menus. No warning when a title falls back to
// English: the overlays leave most titles to it, as does a language whose
// messages are still loading.
const taskTypeGroups = computed(() =>
  [...new Set(taskTypes.value.map(entityOf))]
    .sort((a, b) => entityRank(a) - entityRank(b))
    .map(entity => {
      const groupTaskTypes = taskTypes.value
        .filter(taskType => entityOf(taskType) === entity)
        .sort(
          firstBy(taskType =>
            getTaskTypePriorityOfProd(taskType, props.production)
          ).thenBy('name')
        )
      return {
        entity,
        title: ENTITY_TYPES.includes(entity)
          ? t(
              `${entity}s.title`,
              {},
              {
                locale: titleLocale.value,
                missingWarn: false,
                fallbackWarn: false
              }
            )
          : groupTaskTypes[0].for_entity,
        taskTypes: groupTaskTypes
      }
    })
)

// Functions

const expandStats = () => {
  if (expandable.value) {
    expanded.value = !expanded.value
  }
}

const sortStatuses = statuses =>
  statuses
    .filter(status => statusRanks.value.has(status.task_status_id))
    .sort(
      (a, b) =>
        statusRanks.value.get(a.task_status_id) -
        statusRanks.value.get(b.task_status_id)
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

.task-type-group + .task-type-group {
  margin-top: 1em;
}

// The captions of the menu groups of the production settings
.task-type-group-title {
  color: var(--text-alt);
  font-size: 0.8em;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.task-type-wrapper {
  margin-right: 1em;
  margin-top: 0.5em;
  min-width: 120px;
}
</style>
