<template>
  <div class="news flexcolumn">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="timeline mt1" v-else-if="newsList.length">
      <div
        class="timeline-entry flexrow"
        :key="`news-${news.id}`"
        v-for="news in newsList"
      >
        <span
          :class="{
            dot: true,
            red: hasRetakeValue(news),
            green: hasDoneValue(news)
          }"
        ></span>
        <span class="date flexrow-item">
          {{ formatDisplayDate(news.created_at) }}
        </span>

        <people-avatar
          class="flexrow-item"
          :font-size="14"
          :is-link="false"
          :person="news.person"
          :size="30"
          v-if="news.person"
        />

        <div class="flexrow-item task-type-wrapper ml1">
          <task-type-name
            class="task-type-name"
            :is-static="true"
            :production-id="currentProduction.id"
            :task-type="buildTaskTypeFromNews(news)"
          />
        </div>

        <div class="flexrow-item validation-wrapper">
          <validation-tag
            :is-priority="false"
            :is-static="true"
            :task="buildTaskFromNews(news)"
            :thin="!news.change"
          />
        </div>
      </div>
    </div>
    <empty-section :icon="NewspaperIcon" :text="$t('news.no_news')" v-else />
  </div>
</template>

<script setup>
import { NewspaperIcon } from 'lucide-vue-next'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import { useStore } from 'vuex'

import { useFormat } from '@/composables/format'

/* eslint-disable no-unused-vars */
import EmptySection from '@/components/widgets/EmptySection.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import Spinner from '@/components/widgets/Spinner.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'
import ValidationTag from '@/components/widgets/ValidationTag.vue'
/* eslint-enable no-unused-vars */

const store = useStore()
const { formatDisplayDate } = useFormat()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  entity: { type: Object, default: null }
})

// State
// --------------------------------------------------------------------------
const isLoading = ref(false)
const newsList = ref([])

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const taskStatusMap = computed(() => store.getters.taskStatusMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

// Functions
// --------------------------------------------------------------------------
const buildTaskFromNews = news => ({ task_status_id: news.task_status_id })

const buildTaskTypeFromNews = news => {
  const taskType = taskTypeMap.value.get(news.task_type_id)
  return taskType ? { ...taskType, episode_id: news.episode_id } : null
}

const hasRetakeValue = news => {
  const taskStatus = taskStatusMap.value.get(news.task_status_id)
  return taskStatus ? news.change && taskStatus.is_retake : false
}

const hasDoneValue = news => {
  const taskStatus = taskStatusMap.value.get(news.task_status_id)
  return taskStatus ? news.change && taskStatus.is_done : false
}

const reset = async () => {
  if (!props.entity) return
  isLoading.value = true
  try {
    // The author is already resolved and enriched by the store action.
    const data = await store.dispatch('getEntityNews', props.entity.id)
    newsList.value = data.data
  } catch (err) {
    console.error(err)
    newsList.value = []
  }
  isLoading.value = false
}

const onNewsNew = eventData => {
  if (eventData.project_id === currentProduction.value.id) reset()
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.entity, reset)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('news:new', onNewsNew)
  reset()
})

onBeforeUnmount(() => {
  socket.off('news:new', onNewsNew)
})
</script>

<style lang="scss" scoped>
.news {
  overflow: auto;
}

.timeline {
  border-left: 4px solid $blue-light;
  margin-left: 8px;
  padding-bottom: 1em;
  margin-bottom: 1em;

  .timeline-entry {
    padding: 0.5em;
    position: relative;

    .dot {
      position: absolute;
      display: block;
      left: -9px;
      background: $blue-light;
      width: 14px;
      height: 14px;
      border-radius: 16px;
      z-index: 10;

      &.red {
        background: $red;
      }

      &.green {
        background: $light-green;
      }
    }
  }

  .date {
    min-width: 30px;
    margin-left: 0.5em;
    margin-right: 3em;
    font-size: 0.8em;
    color: $grey;
    white-space: nowrap;
  }

  .task-type-wrapper {
    min-width: 100px;
  }

  .validation-wrapper {
    min-width: 60px;
  }
}
</style>
