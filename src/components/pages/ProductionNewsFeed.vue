<template>
  <div class="columns fixed-page">
    <div class="column main-column">
      <div class="news page" ref="body" @scroll.passive="onBodyScroll">
        <div class="timeline-wrapper">
          <news-filters
            :is-studio="isStudio"
            v-model:episode-id="episodeId"
            v-model:task-status-id="taskStatusId"
            v-model:task-type-id="taskTypeId"
            v-model:person="person"
            v-model:before="before"
            v-model:after="after"
            v-model:preview-mode="previewMode"
          />

          <div :class="{ timeline: true, 'timeline-blank': isTimelineBlank }">
            <div
              class="empty-state"
              v-if="!loading.news && (!newsList || newsList.length === 0)"
            >
              <newspaper-icon class="empty-icon" :size="48" />
              <p class="empty-title">{{ $t('news.no_news') }}</p>
              <p class="empty-hint">{{ $t('news.no_news_hint') }}</p>
            </div>
            <news-skeleton v-if="loading.news" />

            <template v-if="!loading.news">
              <div
                :key="dayList.length > 0 ? dayList[0].created_at : ''"
                v-for="dayList in newsListByDay(timezone)"
              >
                <div
                  class="has-text-centered subtitle timeline-entry day-sticky"
                >
                  <span class="big-dot"></span>
                  {{
                    dayList.length > 0 ? formatDay(dayList[0].created_at) : ''
                  }}
                </div>
                <news-row
                  :key="`news-${news.id}`"
                  :ref="el => setNewsRef(news.id, el?.root)"
                  :canvas-id="`annotation-canvas-${dayList[0].created_at.substring(0, 10)}-${index}`"
                  :is-new="recentNewsIds.has(news.id)"
                  :is-selected="news.id === currentNewsId"
                  :is-studio="isStudio"
                  :news="news"
                  :preview-mode="previewMode"
                  @select="onNewsSelected"
                  v-for="(news, index) in dayList"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div
      class="drawer-backdrop"
      :class="{ 'is-open': isDrawerOpen }"
      @click="closeTask"
    ></div>

    <div
      id="side-column"
      :class="{ column: true, 'side-column': true, 'is-open': isDrawerOpen }"
    >
      <button
        class="drawer-close"
        type="button"
        :title="$t('main.close')"
        @click="closeTask"
      >
        <x-icon :size="20" />
      </button>
      <task-info
        :entity-type="currentEntityType"
        :is-loading="loading.currentTask"
        :task="currentTask"
        with-actions
      />
    </div>
  </div>
</template>

<script setup>
/*
 * This module displays what happened on the production during the last few
 * days. News entries are fetched by page of 50; older entries load via
 * infinite scrolling.
 */
import { useHead } from '@unhead/vue'
import { NewspaperIcon, XIcon } from 'lucide-vue-next'
import moment from 'moment-timezone'
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { useTime } from '@/composables/time'
import { formatFullDateWithRevertedTimezone } from '@/lib/time'

import NewsFilters from '@/components/pages/news/NewsFilters.vue'
import NewsRow from '@/components/pages/news/NewsRow.vue'
import NewsSkeleton from '@/components/pages/news/NewsSkeleton.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const { timezone } = useTime()

const instance = getCurrentInstance()
const socket = instance.appContext.config.globalProperties.$socket

// State

const after = ref(null)
const before = ref(null)
const body = ref(null)
const currentNewsId = ref(null)
const currentPage = ref(1)
const currentTask = ref(null)
const episodeId = ref('')
const person = ref(null)
const previewMode = ref('comments')
const recentNewsIds = ref(new Set())
const taskStatusId = ref('')
const taskTypeId = ref('')

const errors = reactive({ news: false })
const loading = reactive({ more: false, news: false, currentTask: true })

// Non-reactive scheduling/selection state.
const newsRefs = new Map()
let lastSelection = null
let silent = false

const setNewsRef = (id, el) => {
  if (el) newsRefs.set(id, el)
  else newsRefs.delete(id)
}

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const newsList = computed(() => store.getters.newsList)
const newsListByDay = computed(() => store.getters.newsListByDay)

const isStudio = computed(() => !route.path.includes('productions'))

const currentEntityType = computed(
  () => currentTask.value?.task_type?.for_entity
)

const isTimelineBlank = computed(
  () => loading.news || !newsList.value || newsList.value.length === 0
)

const isDrawerOpen = computed(() => Boolean(currentNewsId.value))

const params = computed(() => ({
  isStudio: isStudio.value || undefined,
  productionId: !isStudio.value ? currentProduction.value?.id : undefined,
  only_preview: previewMode.value === 'previews',
  page_size: previewMode.value === 'previews' ? 6 : 50,
  task_type_id: taskTypeId.value !== '' ? taskTypeId.value : undefined,
  task_status_id: taskStatusId.value !== '' ? taskStatusId.value : undefined,
  person_id: person.value ? person.value.id : undefined,
  page: currentPage.value,
  episode_id: episodeId.value !== 'all' ? episodeId.value : undefined,
  before: formatFullDateWithRevertedTimezone(before.value, timezone.value),
  after: formatFullDateWithRevertedTimezone(after.value, timezone.value)
}))

// Functions

const formatDay = date => moment.tz(date, 'UTC').tz(timezone.value).format('LL')

const setScrollPosition = scrollPosition => {
  if (body.value) {
    body.value.scrollTop = scrollPosition
  }
}

const scrollToLine = news => {
  const newsLine = newsRefs.get(news.id)
  if (newsLine && body.value) {
    const margin = 30
    const rect = newsLine.getBoundingClientRect()
    const listRect = body.value.getBoundingClientRect()
    const isBelow = rect.bottom > listRect.bottom - margin
    const isAbove = rect.top < listRect.top + margin

    if (isBelow) {
      const scrollingRequired = rect.bottom - listRect.bottom + margin
      setScrollPosition(body.value.scrollTop + scrollingRequired)
    } else if (isAbove) {
      const scrollingRequired = listRect.top - rect.top + margin
      setScrollPosition(body.value.scrollTop - scrollingRequired)
    }
  }
}

const closeTask = () => {
  lastSelection = -1
  currentTask.value = null
  currentNewsId.value = ''
}

const onNewsSelected = news => {
  loading.currentTask = true
  const index = newsList.value.findIndex(n => n.id === news.id)
  if (lastSelection !== index) {
    lastSelection = index
    store
      .dispatch('loadTask', { taskId: news.task_id })
      .then(task => {
        loading.currentTask = false
        currentTask.value = task
        currentNewsId.value = news.id
      })
      .catch(console.error)
    scrollToLine(news)
  } else {
    closeTask()
  }
}

const init = () => {
  if (loading.news) return
  if (!silent) {
    currentPage.value = 1
    loading.news = true
    errors.news = false
    currentTask.value = null
    router.push({
      query: {
        task_status_id: params.value.task_status_id,
        task_type_id: params.value.task_type_id
      }
    })
    store
      .dispatch('loadNews', params.value)
      .then(() => {
        loading.news = false
      })
      .catch(err => {
        console.error(err)
        loading.news = false
        errors.news = true
      })
  }
}

const loadFollowingNews = () => {
  if (!loading.more && !loading.news) {
    loading.more = true
    currentPage.value += 1
    store.dispatch('loadMoreNews', params.value).then(() => {
      loading.more = false
    })
  }
}

const onBodyScroll = event => {
  if (!body.value) return
  const position = event.target
  const maxHeight = body.value.scrollHeight - body.value.offsetHeight
  if (maxHeight < position.scrollTop + 200) {
    loadFollowingNews()
  }
}

const onKeyDown = event => {
  if (event.key === 'Escape' && isDrawerOpen.value) {
    closeTask()
    return
  }
  if (newsList.value && newsList.value.length > 0 && event.altKey) {
    let index = lastSelection ? lastSelection : 0
    if ([37, 38].includes(event.keyCode)) {
      index = index - 1 < 0 ? newsList.value.length - 1 : index - 1
      onNewsSelected(newsList.value[index])
    } else if ([39, 40].includes(event.keyCode)) {
      index = index + 1 >= newsList.value.length ? 0 : index + 1
      onNewsSelected(newsList.value[index])
    }
  }
}

// Socket event handlers

const onPreviewFileAddFile = eventData => {
  store.commit('NEWS_ADD_PREVIEW', {
    previewId: eventData.preview_file_id,
    commentId: eventData.comment_id,
    extension: eventData.extension
  })
}

const markRecent = newsId => {
  const next = new Set(recentNewsIds.value)
  next.add(newsId)
  recentNewsIds.value = next
  setTimeout(() => {
    const after = new Set(recentNewsIds.value)
    after.delete(newsId)
    recentNewsIds.value = after
  }, 3000)
}

const onNewsNew = eventData => {
  if (
    (isStudio.value || eventData.project_id === currentProduction.value.id) &&
    (!taskTypeId.value || taskTypeId.value === eventData.task_type_id) &&
    (!taskStatusId.value || taskStatusId.value === eventData.task_status_id)
  ) {
    store
      .dispatch('loadSingleNews', {
        productionId: eventData.project_id,
        newsId: eventData.news_id
      })
      .then(() => markRecent(eventData.news_id))
  }
}

const onTaskUpdate = eventData => {
  const relatedNews = newsList.value.find(
    news =>
      news.project_id === eventData.project_id &&
      news.task_id === eventData.task_id
  )
  if (relatedNews) {
    store.dispatch('loadSingleNews', {
      productionId: relatedNews.project_id,
      newsId: relatedNews.id
    })
  }
}

// Watchers

watch(currentProduction, init)
watch(isStudio, init)
watch(person, init)
watch(before, init)
watch(after, init)
watch(episodeId, init)
watch(() => route.fullPath, init)

watch(previewMode, value => {
  localStorage.setItem('news:preview-mode', value)
  init()
})

watch(taskTypeId, value => {
  localStorage.setItem('news:task-type-id', value)
  init()
})

watch(taskStatusId, value => {
  localStorage.setItem('news:task-status-id', value)
  init()
})

// Lifecycle

onMounted(() => {
  silent = true
  previewMode.value = localStorage.getItem('news:preview-mode') || 'comments'
  taskTypeId.value = localStorage.getItem('news:task-type-id') || ''
  if (route.query?.task_type_id) {
    taskTypeId.value = route.query.task_type_id
  }
  taskStatusId.value = localStorage.getItem('news:task-status-id') || ''
  if (route.query?.task_status_id) {
    taskStatusId.value = route.query.task_status_id
  }
  before.value = null
  after.value = null
  silent = false

  window.addEventListener('keydown', onKeyDown, false)
  socket.on('preview-file:add-file', onPreviewFileAddFile)
  socket.on('news:new', onNewsNew)
  socket.on('task:update', onTaskUpdate)

  if (!loading.news) {
    init()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  socket.off('preview-file:add-file', onPreviewFileAddFile)
  socket.off('news:new', onNewsNew)
  socket.off('task:update', onTaskUpdate)
})

// Head

useHead({
  title: computed(() =>
    currentProduction.value
      ? `${currentProduction.value.name} | ${t('news.title')} - Kitsu`
      : `${t('news.title')} - Kitsu`
  )
})
</script>

<style lang="scss" scoped>
.dark {
  .page {
    background: $dark-grey-light;
  }

  .icon,
  .comment-text {
    color: $light-grey-light;
  }

  a {
    color: $light-grey-light;
  }

  .timeline-wrapper {
    background: $dark-grey;
  }

  .timeline {
    border-color: $blue;

    .big-dot {
      background: $blue;
    }
  }
}

.columns {
  display: flex;
  flex-direction: row;
}

.column {
  overflow-y: auto;
  padding: 0;
}

.main-column {
  flex: 1 1 auto;
  padding-top: 60px;
  background: $white-grey-light;
  height: 100%;
  overflow: hidden;
}

.news {
  background: $white-grey-light;
  width: 100%;
  padding: 0;
  overflow-y: auto;
  height: 100%;
}

.timeline-wrapper {
  margin: auto;
  max-width: 920px;
  padding-top: 25px;
  padding-left: 25px;
  padding-right: 25px;
  background: $white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.timeline {
  border-left: 4px solid $blue-light;
  padding-left: 25px;
  padding-bottom: 2em;
  transition: border-left-color 0.2s ease;

  .subtitle {
    margin-top: 2em;
  }

  .timeline-entry {
    position: relative;

    .big-dot {
      position: absolute;
      display: block;
      left: -33px;
      top: 3px;
      background: $blue-light;
      width: 12px;
      height: 12px;
      border-radius: 6px;
    }
  }
}

// Sticky day header: keep the original centered subtitle styling but pin
// it to the top of the scroll container so the date stays visible while
// scrolling long feeds. The compound `.timeline-entry.day-sticky` selector
// is needed to outrank `.timeline .timeline-entry { position: relative }`,
// which would otherwise win on specificity and disable sticky entirely.
// `position: sticky` still establishes a positioning context for the
// absolutely-placed `.big-dot`, so the dot keeps sitting on the rail.
.timeline-entry.day-sticky {
  background: $white;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  position: sticky;
  top: 0;
  z-index: 2;

  .dark & {
    background: $dark-grey;
  }
}

.empty-state {
  align-items: center;
  color: var(--text-alt);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 3em 1em;
  text-align: center;
}

.empty-icon {
  color: var(--text-alt);
  opacity: 0.5;
}

.empty-title {
  color: var(--text);
  font-size: 1.1em;
  font-weight: 600;
  margin: 0;
}

.empty-hint {
  margin: 0;
  max-width: 380px;
}

.side-column {
  width: 450px;
  min-width: 450px;
  max-width: 450px;
}

.drawer-close {
  display: none;
}

.drawer-backdrop {
  display: none;
}

.timeline.timeline-blank {
  border-left-color: transparent;
}

// Mobile: drop the timeline rail + big-dot — the chronological grouping
// still reads via the sticky day headers, and the rail is visual noise
// at narrow widths.
@media screen and (max-width: 768px) {
  .timeline {
    border-left: 0;
    padding-left: 0;
  }

  .timeline .timeline-entry .big-dot {
    display: none;
  }

  .timeline-wrapper {
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}

// Mobile / tablet drawer: under 1024px the side panel slides in from
// the right when a news is selected. Backdrop catches outside taps to
// close.
@media (max-width: 1024px) {
  // Override App.vue's global `.side-column { max-width: 400px; width: 400px;
  // margin-top: 60px }` — the drawer needs to span the full viewport and
  // sit ABOVE the topbar (z-index 204), so no top offset and no width cap.
  .side-column {
    background: $white;
    bottom: 0;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
    margin-top: 0 !important;
    max-width: min(100vw, 420px) !important;
    min-width: 0 !important;
    overflow-y: auto;
    padding-top: 56px;
    position: fixed;
    right: 0;
    top: 0;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    width: min(100vw, 420px) !important;
    z-index: 250;

    &.is-open {
      transform: translateX(0);
    }
  }

  .dark .side-column {
    background: $dark-grey-light;
  }

  .drawer-close {
    align-items: center;
    align-self: flex-end;
    background: var(--background);
    border: 0;
    border-radius: 50%;
    color: var(--text);
    cursor: pointer;
    display: flex;
    height: 36px;
    justify-content: center;
    margin: -44px 12px 8px 0;
    padding: 6px;
    position: sticky;
    top: 12px;
    width: 36px;
    z-index: 2;

    &:hover {
      background: var(--background-hover);
    }
  }

  // The drawer needs to be a flex column so the sticky close button can
  // align itself to the right edge.
  .side-column {
    display: flex;
    flex-direction: column;
  }

  .drawer-backdrop {
    background: rgba(0, 0, 0, 0.4);
    display: block;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    transition: opacity 0.25s ease;
    z-index: 249;

    &.is-open {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
