<template>
  <span>
    <template v-if="!minimized">
      <router-link
        class="tag dynamic"
        :to="taskPath"
        :style="tagStyle"
        :title="taskStatus.name"
        v-if="!isStatic && !isCurrentUserClient && taskPath"
      >
        {{ taskStatus.short_name }}
      </router-link>

      <span
        class="tag"
        :style="tagStyle"
        :title="taskStatus.name"
        @click="$event => $emit('click', $event)"
        v-else
      >
        {{ taskStatus.short_name }}
      </span>
      <span
        :class="{
          priority: true,
          high: task.priority === 1,
          veryhigh: task.priority === 2,
          emergency: task.priority === 3
        }"
        :title="formatPriority"
        v-if="isPriority && !isCurrentUserClient && task.priority > 0"
      >
        {{ priority }}
      </span>
    </template>
    <template v-else>
      <router-link
        :to="taskPath"
        class="tag dynamic"
        :style="tagStyle"
        :title="taskStatus.name"
        v-if="!isStatic && !isCurrentUserClient && taskPath"
      >
        &nbsp;
      </router-link>
      <span class="tag" v-else> &nbsp; </span>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import colors from '@/lib/colors'
import { pluralizeEntityType } from '@/lib/path'
import { useTaskStatusStyle } from '@/composables/taskStatus'

const { t } = useI18n()
const store = useStore()
const { backgroundColor: statusBgColor, color: statusColor, isDarkTheme } =
  useTaskStatusStyle()

const props = defineProps({
  task: {
    default: () => {},
    type: Object
  },
  isStatic: {
    default: false,
    type: Boolean
  },
  isPriority: {
    default: true,
    type: Boolean
  },
  minimized: {
    default: false,
    type: Boolean
  },
  pointer: {
    default: false,
    type: Boolean
  },
  thin: {
    default: false,
    type: Boolean
  }
})

defineEmits(['click'])

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isTVShow = computed(() => store.getters.isTVShow)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const cursor = computed(() => {
  return props.pointer ? 'pointer' : 'default'
})

const taskStatus = computed(() => {
  const taskStatusId = props.task?.task_status_id
  return taskStatusMap.value?.get(taskStatusId) || {}
})

const backgroundColor = computed(() => statusBgColor(taskStatus.value))

const color = computed(() => statusColor(taskStatus.value))

const priority = computed(() => {
  if (props.task.priority && !taskStatus.value.is_done) {
    if (props.task.priority === 3) {
      return '!!!'
    } else if (props.task.priority === 2) {
      return '!!'
    } else if (props.task.priority === 1) {
      return '!'
    } else {
      return ''
    }
  } else {
    return ''
  }
})

const tagStyle = computed(() => {
  const isStaticVal = !props.isStatic && !isCurrentUserClient.value
  const isTodo = taskStatus.value.name === 'Todo'
  if (props.thin && !isTodo) {
    if (isDarkTheme.value) {
      return {
        background: 'transparent',
        border:
          '1px solid ' +
          (isTodo
            ? 'grey'
            : colors.lightenColor(backgroundColor.value, 0.5)),
        color: colors.lightenColor(backgroundColor.value, 0.5),
        cursor: isStaticVal ? 'pointer' : cursor.value
      }
    } else {
      return {
        background: 'transparent',
        border: '1px solid ' + (isTodo ? 'grey' : backgroundColor.value),
        color: backgroundColor.value,
        cursor: isStaticVal ? 'pointer' : cursor.value
      }
    }
  } else {
    return {
      background: backgroundColor.value,
      color: color.value,
      cursor: isStaticVal ? 'pointer' : cursor.value
    }
  }
})

const taskPath = computed(() => {
  if (!currentProduction.value?.id) return
  const task = props.task
  const productionId = props.task.project_id
    ? props.task.project_id
    : currentProduction.value.id
  const route = {
    name: 'task',
    params: {
      production_id: productionId,
      task_id: task.id
    }
  }

  if (isTVShow.value && currentEpisode.value) {
    route.name = 'episode-task'
    route.params.episode_id = task.episode_id || currentEpisode.value.id
  }

  const taskType = taskTypeMap.value.get(task.task_type_id)
  route.params.type = pluralizeEntityType(taskType.for_entity)

  return route
})

const formatPriority = computed(() => {
  const p = props.task.priority
  let label = p + ''
  if (p === 0) {
    label = 'normal'
  } else if (p === 1) {
    label = t('tasks.priority.high')
  } else if (p === 2) {
    label = t('tasks.priority.very_high')
  } else if (p === 3) {
    label = t('tasks.priority.emergency')
  }
  return label
})
</script>

<style lang="scss" scoped>
.tag {
  letter-spacing: 1px;
  margin-right: 0.1em;
  text-transform: uppercase;
}

.tag.dynamic:hover {
  cursor: pointer;
  transform: scale(1.15);
  transition: all 0.1s ease-in-out;
}

.priority {
  border-radius: 5px;
  display: inline-block;
  color: white;
  margin-left: 5px;
  font-weight: bold;
  min-width: 23px;
  text-align: center;
}

.high {
  background: $yellow;
}

.veryhigh {
  background: $orange;
}

.emergency {
  background: $red;
}
</style>
