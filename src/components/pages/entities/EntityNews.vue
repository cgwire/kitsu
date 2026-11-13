<template>
  <div class="news flexcolumn">
    <div class="has-text-centered" v-if="isLoading">
      <spinner />
    </div>
    <div class="timeline mt1" v-else-if="shownNews.length">
      <div
        class="timeline-entry flexrow"
        :key="`news-${news.id}`"
        v-for="news in shownNews"
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
            :production-id="currentProduction?.id"
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
import { logRequestFailure } from '@/lib/errors'

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
// The entity the list comes from: the list of another one never shows.
const newsEntityId = ref(null)
// A load that ends after the deletion of a news keeps it out.
const deletedNewsIds = new Set()
// Loads may answer out of order: each takes a number, and an answer older
// than the last one shown for its entity is dropped, even after a visit to
// another entity.
let lastLoadId = 0
const shownLoadIds = new Map()

// Computed
// --------------------------------------------------------------------------
const currentProduction = computed(() => store.getters.currentProduction)
const shownNews = computed(() =>
  newsEntityId.value === props.entity?.id ? newsList.value : []
)
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

const loadNews = async entityId => {
  // The author is already resolved and enriched by the store action.
  const data = await store.dispatch('getEntityNews', entityId)
  return data.data.filter(news => !deletedNewsIds.has(news.id))
}

const showNews = (loadId, entityId, list) => {
  const isOlder = loadId < (shownLoadIds.get(entityId) ?? 0)
  if (entityId !== props.entity?.id || isOlder) return
  shownLoadIds.set(entityId, loadId)
  newsEntityId.value = entityId
  newsList.value = list
}

const reset = async () => {
  if (!props.entity) return
  const entityId = props.entity.id
  const loadId = ++lastLoadId
  isLoading.value = true
  try {
    showNews(loadId, entityId, await loadNews(entityId))
  } catch (err) {
    console.error(err)
  }
  isLoading.value = false
}

// Zou sends no event again once the socket is back. The socket may come back
// before the API: a failed load keeps the list as it was.
const onSocketConnect = async () => {
  if (!props.entity) return
  const entityId = props.entity.id
  const loadId = ++lastLoadId
  try {
    showNews(loadId, entityId, await loadNews(entityId))
  } catch (err) {
    logRequestFailure(err)
  }
}

const onNewsNew = eventData => {
  if (eventData.project_id === currentProduction.value?.id) reset()
}

// A task removal sends one event per news: drop the news here rather than
// load the whole list again for each of them.
const onNewsDelete = eventData => {
  deletedNewsIds.add(eventData.news_id)
  const index = newsList.value.findIndex(news => news.id === eventData.news_id)
  if (index !== -1) newsList.value.splice(index, 1)
}

// Watchers
// --------------------------------------------------------------------------
watch(() => props.entity, reset)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('news:new', onNewsNew)
  socket.on('news:delete', onNewsDelete)
  socket.on('connect', onSocketConnect)
  reset()
})

onBeforeUnmount(() => {
  socket.off('news:new', onNewsNew)
  socket.off('news:delete', onNewsDelete)
  socket.off('connect', onSocketConnect)
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
