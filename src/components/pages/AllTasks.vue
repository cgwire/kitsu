<template>
  <page-layout :class="{ 'with-info': hasSelection }">
    <template #main>
      <div class="all-tasks" :class="{ collapsed: !showFilters }">
        <div class="filters-panel">
          <div class="filters flexrow">
            <combobox-production
              class="combobox-production flexrow-item mb0"
              :label="$t('main.production')"
              :production-list="productionList"
              v-model="filters.productionId"
            />
            <combobox-status
              class="flexrow-item mb0 collapsible"
              :label="$t('news.task_status')"
              :task-status-list="taskStatusList"
              v-model="filters.taskStatusId"
            />
            <combobox-task-type
              class="flexrow-item mb0 collapsible"
              :label="$t('news.task_type')"
              :task-type-list="taskTypeList"
              v-model="filters.taskTypeId"
            />
            <div class="filler"></div>
            <button-simple
              class="flexrow-item burndown-button"
              icon="chart"
              :active="showBurndown"
              :title="$t('burndown.title')"
              @click="showBurndown = !showBurndown"
            />
            <button-simple
              class="flexrow-item reset-filters"
              icon="remove"
              :title="$t('main.clear_filters')"
              @click="resetFilters"
              v-if="hasFilters"
            />
            <button-simple
              class="flexrow-item filters-toggle"
              :icon="showFilters ? 'minus' : 'plus'"
              :aria-expanded="`${showFilters}`"
              :is-on="showFilters"
              :text="secondRowFilterCount ? `${secondRowFilterCount}` : ''"
              :title="
                $t(showFilters ? 'main.less_filters' : 'main.more_filters')
              "
              @click="showFilters = !showFilters"
            />
          </div>
          <div class="filters flexrow collapsible">
            <combobox-studio
              class="flexrow-item"
              all-studios-label
              :label="$t('people.fields.studio')"
              v-model="filters.studioId"
            />
            <combobox-department
              class="flexrow-item"
              all-departments-label
              :label="$t('main.department')"
              v-model="filters.departmentId"
            />
            <people-field
              class="flexrow-item"
              :label="$t('main.person')"
              multiple
              :people="personList"
              v-model="filters.person"
            />
            <date-field
              class="flexrow-item"
              :label="$t('tasks.fields.start_date')"
              model-type="yyyy-MM-dd"
              :with-margin="false"
              v-model="filters.startDate"
            />
            <date-field
              class="flexrow-item"
              :label="$t('tasks.fields.due_date')"
              model-type="yyyy-MM-dd"
              :with-margin="false"
              v-model="filters.dueDate"
            />
          </div>
        </div>
        <div class="list-panel">
          <search-query-list
            class="query-list"
            :groups="allTasksSearchFilterGroups"
            :is-group-enabled="true"
            :queries="allTasksSearchQueries"
            type="allTasks"
            with-route-query
          />
          <template v-if="showBurndown">
            <burndown-chart
              :burndown="burndown"
              :is-loading="isBurndownLoading"
              :is-error="isBurndownError"
            />
            <tasks-stats-line
              class="burndown-stats"
              :stats="stats"
              v-if="!isLoading"
            />
          </template>
          <all-task-list
            :tasks="tasks"
            :stats="stats"
            :is-loading="isLoading"
            :is-error="isLoadingError"
            :is-more="isMore"
            :is-more-loading="isMoreLoading"
            @more-clicked="loadMore"
            v-else
          />
        </div>
      </div>
    </template>
    <template #side>
      <button-simple
        class="back-to-list"
        icon="left"
        :text="$t('main.back')"
        @click="store.dispatch('clearSelectedTasks')"
      />
      <task-info :task="selectedTasks.values().next().value">
        <status-stats :stats="statusStatsList" v-if="!isLoading" />
      </task-info>
    </template>
  </page-layout>
</template>

<script setup>
// Imports
import { useHead } from '@unhead/vue'
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

import { sortPeople } from '@/lib/sorting'
import { getStatusColor } from '@/lib/stats'

import PageLayout from '@/components/layouts/PageLayout.vue'
import AllTaskList from '@/components/lists/AllTaskList.vue'
import TaskInfo from '@/components/sides/TaskInfo.vue'
import BurndownChart from '@/components/widgets/BurndownChart.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ComboboxDepartment from '@/components/widgets/ComboboxDepartment.vue'
import ComboboxProduction from '@/components/widgets/ComboboxProduction.vue'
import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'
import ComboboxStudio from '@/components/widgets/ComboboxStudio.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import DateField from '@/components/widgets/DateField.vue'
import PeopleField from '@/components/widgets/PeopleField.vue'
import SearchQueryList from '@/components/widgets/SearchQueryList.vue'
import StatusStats from '@/components/widgets/StatusStats.vue'
import TasksStatsLine from '@/components/widgets/TasksStatsLine.vue'

// Composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

// State
// --------------------------------------------------------------------------
const burndown = ref(null)
const isBurndownLoading = ref(false)
const isBurndownError = ref(false)
const isLoading = ref(false)
const isLoadingError = ref(false)
const isMore = ref(false)
const isMoreLoading = ref(false)
const showBurndown = ref(route.query.view === 'burndown')
const showFilters = ref(false)
const stats = ref({ status: [] })
const tasks = ref([])

// A filter missing from the query is unset: a saved search replaces the
// whole query. The person map holds the people gone inactive since the search
// was saved, whom dropping would widen it to everybody.
const filtersFromQuery = query => ({
  departmentId: query.department_id || null,
  dueDate: query.due_date || null,
  person: query.person_id
    ? query.person_id
        .split(',')
        .map(personId => store.getters.personMap.get(personId))
        .filter(Boolean)
    : null,
  productionId: query.project_id || null,
  startDate: query.start_date || null,
  studioId: query.studio_id || null,
  taskStatusId: query.task_status_id || null,
  taskTypeId: query.task_type_id || null
})

// reading the query here instead of in onMounted spares the double reload
// the deep filters watcher used to trigger on pages opened with filters
const filters = reactive(filtersFromQuery(route.query))

let page = 1
// The route watcher sees the query of the next page too, before this one
// unmounts.
const pagePath = route.path

// Computed
// --------------------------------------------------------------------------
const activePeopleWithoutBot = computed(
  () => store.getters.activePeopleWithoutBot
)
const allTasksSearchFilterGroups = computed(
  () => store.getters.allTasksSearchFilterGroups
)
const allTasksSearchQueries = computed(
  () => store.getters.allTasksSearchQueries
)
const getProductionTaskStatuses = computed(
  () => store.getters.getProductionTaskStatuses
)
const getProductionTaskTypes = computed(
  () => store.getters.getProductionTaskTypes
)
const openProductions = computed(() => store.getters.openProductions)
const personMap = computed(() => store.getters.personMap)
const productionMap = computed(() => store.getters.productionMap)
const selectedTasks = computed(() => store.getters.selectedTasks)
const hasSelection = computed(() => selectedTasks.value.size > 0)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const addAllValue = list => [
  { id: '', color: '#999', name: t('main.all'), short_name: t('main.all') },
  ...list
]

const productionList = computed(() => addAllValue(openProductions.value))

const taskStatusList = computed(() =>
  addAllValue(
    getProductionTaskStatuses
      .value(filters.productionId)
      .filter(status => !status.for_concept)
  )
)

const taskTypeList = computed(() =>
  addAllValue(
    getProductionTaskTypes
      .value(filters.productionId)
      .filter(type => type.for_entity !== 'Concept')
  )
)

const selectablePeople = computed(() => {
  const production = productionMap.value.get(filters.productionId)
  if (!production) return activePeopleWithoutBot.value
  return sortPeople(
    production.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot)
  )
})

// The field drops a selected person it does not list: the people of the
// filter stay listed, gone inactive or out of the team.
const personList = computed(() => {
  const missingPeople = (filters.person || []).filter(
    person => !selectablePeople.value.some(({ id }) => id === person.id)
  )
  return missingPeople.length > 0
    ? sortPeople([...selectablePeople.value, ...missingPeople])
    : selectablePeople.value
})

const params = computed(() => ({
  project_id: filters.productionId,
  task_status_id: filters.taskStatusId,
  task_type_id: filters.taskTypeId,
  person_id: filters.person?.map(person => person.id).join(',') || null,
  department_id: filters.departmentId,
  studio_id: filters.studioId,
  start_date: filters.startDate,
  due_date: filters.dueDate
}))

// The toggle shows how many filters its folded row holds.
const secondRowFilterCount = computed(
  () =>
    [
      filters.studioId,
      filters.departmentId,
      filters.person?.length,
      filters.startDate,
      filters.dueDate
    ].filter(Boolean).length
)

const hasFilters = computed(() => Object.values(params.value).some(Boolean))

const pageQuery = computed(() => {
  const query = Object.fromEntries(
    Object.entries(params.value).filter(([, value]) => value)
  )
  if (showBurndown.value) query.view = 'burndown'
  return query
})

// statusStats would shadow the StatusStats component tag in the template
const statusStatsList = computed(() =>
  [...stats.value.status]
    .sort((a, b) => b.amount - a.amount)
    .map(stat => {
      const taskStatus = taskStatusMap.value.get(stat.task_status_id)
      if (!taskStatus) return null
      return {
        name: taskStatus.short_name.toUpperCase(),
        color: getStatusColor(taskStatus),
        status: taskStatus,
        value: stat.amount
      }
    })
    .filter(Boolean)
)

// Functions
// --------------------------------------------------------------------------
// The route watcher clears the filters the query no longer holds.
const resetFilters = () => {
  router.push({ query: showBurndown.value ? { view: 'burndown' } : {} })
}

const syncRouteQuery = () => {
  router.push({ query: pageQuery.value })
}

const toSortedQueryString = query => {
  const searchParams = new URLSearchParams(query)
  searchParams.sort()
  return searchParams.toString()
}

const isPageQuery = query =>
  toSortedQueryString(query) === toSortedQueryString(pageQuery.value)

const loadBurndown = async () => {
  isBurndownLoading.value = true
  isBurndownError.value = false
  try {
    burndown.value = await store.dispatch('loadOpenTasksBurndown', params.value)
  } catch (error) {
    isBurndownError.value = true
    console.error(error)
  }
  isBurndownLoading.value = false
}

const reload = async () => {
  isLoading.value = true
  isLoadingError.value = false
  page = 1
  store.dispatch('clearSelectedTasks')
  tasks.value = []
  syncRouteQuery()
  try {
    const taskInfos = await store.dispatch('loadOpenTasks', params.value)
    tasks.value = taskInfos.data
    stats.value = taskInfos.stats
    isMore.value = taskInfos.is_more
  } catch (error) {
    isLoadingError.value = true
    console.error(error)
  }
  isLoading.value = false
}

const loadMore = async () => {
  isMoreLoading.value = true
  try {
    const taskInfos = await store.dispatch('loadOpenTasks', {
      ...params.value,
      page: page + 1
    })
    page += 1
    tasks.value = tasks.value.concat(taskInfos.data)
    isMore.value = taskInfos.is_more
  } catch (error) {
    console.error(error)
  }
  isMoreLoading.value = false
}

const onTaskUpdate = async eventData => {
  const task = tasks.value.find(({ id }) => id === eventData.task_id)
  if (task) {
    const updatedTask = await store.dispatch('loadTask', { taskId: task.id })
    Object.assign(task, updatedTask)
  }
}

// Watchers
// --------------------------------------------------------------------------
watch(filters, () => {
  reload()
})

watch(showBurndown, () => {
  syncRouteQuery()
})

// A query setting the filters and the view at once loads the burndown once.
watch([params, showBurndown], ([, isShown]) => {
  if (isShown) loadBurndown()
})

// A saved search, or the back button, sets a query the page did not write.
watch(
  () => route.query,
  query => {
    if (route.path === pagePath && !isPageQuery(query)) {
      Object.assign(filters, filtersFromQuery(query))
      showBurndown.value = query.view === 'burndown'
    }
  }
)

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('task:update', onTaskUpdate)
  reload()
  if (showBurndown.value) loadBurndown()
})

onBeforeUnmount(() => {
  socket.off('task:update', onTaskUpdate)
})

// Head
// --------------------------------------------------------------------------
useHead({ title: computed(() => `${t('tasks.all_tasks')} - Kitsu`) })
</script>

<style lang="scss" scoped>
.all-tasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  // a definite height (not only a max) so the burndown chart can flex to
  // fill the page; the task list scrolls inside either way
  height: 100%;
  // 20px under the 60px topbar, as the Concepts filters
  padding: 80px 1em 1em 1em;
  color: var(--text);
}

// the panel of the Concepts filters
.filters-panel {
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1em;
  // the labels of this page lose the 5px padding-top Concepts keeps
  padding: 14px;
}

.filters {
  align-items: flex-start;
  flex-wrap: wrap;
  row-gap: 1em;
}

.reset-filters,
.burndown-button,
.filters-toggle {
  align-self: flex-end;
  height: 42px;
  padding: 0 14px;
  // Bulma's near-black button text outweighs the grey of the filter labels
  color: var(--text);
}

.filters-toggle {
  flex: none;
}

.collapsed .filters.collapsible {
  display: none;
}

// the saved searches and the list or the burndown, as the Concepts list
.list-panel {
  background: var(--background-panel);
  border-radius: 12px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5em;
  min-height: 0;
  padding: 14px;
}

// the table frame takes the panel corners, and sits right under the saved
// searches
.list-panel :deep(.data-list) {
  margin-top: 0;
}

.list-panel :deep(.datatable-wrapper) {
  border-radius: 10px;
}

// phones get borderless cards instead
@media screen and (min-width: 769px) {
  .list-panel :deep(.datatable-wrapper) {
    border: 1px solid var(--border);
    // the last row draws the bottom line
    border-bottom: 0;
  }
}

// the tags take the panel tag color: the page one is the panel gray in light
// theme (groups keep their inline tint)
.list-panel :deep(.search-queries .tag:not(.empty)) {
  background-color: var(--background-panel-tag);
}

// the dropdown of a group takes the same color, lifted off the panel
.list-panel :deep(.search-queries .group-list) {
  background-color: var(--background-panel-tag);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

// the global .query-list margins indent it from the filters, and the page
// already spaces its blocks with a gap
.query-list {
  margin: 0;
}

// as on the Timesheets page, the task panel is its own surface: the column
// only frames it
// 20px under the 60px margin of the column puts the panel top level with
// the filters panel, at the 80px padding of the main column
:deep(.column.side-column) {
  background: transparent;
  padding: 20px 1em 1em 0;
}

:deep(.side.task-info) {
  background: var(--background-panel);
  border-radius: 12px;
}

// its first line sits as high as the first filter label
:deep(.side.task-info.empty) {
  padding-top: 6px;
}

// the resize gutter already separates the list from the panel
@media screen and (min-width: 769px) {
  .all-tasks {
    padding-right: 0;
  }
}

// the resize handle becomes the gutter before the panel, its line showing
// only on hover (the column selector outweighs the dark theme color)
:deep(.column.side-column .extend-bar) {
  background: transparent;
  margin-left: 0;
  width: 1em;

  &:hover {
    background: linear-gradient(var(--border), var(--border)) center / 3px 100%
      no-repeat;
  }
}

// small screens only: the back button brings the list back in place of the
// task panel
.back-to-list {
  display: none;
}

// measured on the live rows: the status and task-type labels carry a 5px
// padding-top the other labels lack, which the old 7px padding hack on the
// production combobox compensated approximately
.filters :deep(.label) {
  margin-bottom: 5px;
  padding-top: 0;
}

// the status combobox carries its own 1px margin-top the siblings lack
.filters :deep(.status-combo) {
  margin-top: 0;
}

// measured on the live rows: both combos render a 38px control against
// the 42px of the Bulma selects and the person multiselect
.filters :deep(.studio-combo),
.filters :deep(.department-combo) {
  display: flex;
  flex-direction: column;
  height: 42px;
  justify-content: center;
}

// the date picker input ships its own 38px height, same story
.filters :deep(.dp__input) {
  height: 42px;
}

@media screen and (max-width: 768px) {
  // the production combobox is 300px wide by default, which pushed the
  // toggle to a second line on phones
  .combobox-production {
    flex: 1;
    min-width: 0;

    :deep(.production-combo),
    :deep(.select-input) {
      min-width: 0;
      width: 100%;
    }
  }

  .filler {
    display: none;
  }

  .collapsed .collapsible {
    display: none;
  }

  // unfolded, the status and type combos take a line each under the
  // production one instead of squeezing it next to the toggle
  .filters > .collapsible {
    flex: 0 0 100%;
    margin-right: 0;
    order: 1;
  }

  .burndown-button,
  .burndown-chart,
  .burndown-stats {
    display: none;
  }

  // read-only: the saved searches stay, without their editing
  .query-list :deep(.tag.folder) {
    display: none;
  }

  // the panel takes the whole width in place of the list
  .with-info :deep(.main-column) {
    display: none;
  }

  // TaskInfo writes the width of its resizable panel inline on the column
  :deep(.column.side-column) {
    display: none;
    max-width: none;
    min-width: 0 !important;
    padding: 0.5em;
    width: 100%;
  }

  .with-info :deep(.column.side-column) {
    display: block;
  }

  .back-to-list {
    display: flex;
    margin-bottom: 0.5em;
  }
}
</style>
