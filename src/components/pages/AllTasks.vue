<template>
  <page-layout :class="{ 'with-info': hasSelection }">
    <template #main>
      <div class="all-tasks" :class="{ collapsed: !showFilters }">
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
            class="flexrow-item filters-toggle"
            icon="funnel"
            :aria-expanded="`${showFilters}`"
            :is-on="showFilters"
            :title="$t(showFilters ? 'main.less_filters' : 'main.more_filters')"
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

// reading the query here instead of in onMounted spares the double reload
// the deep filters watcher used to trigger on pages opened with filters
const filters = reactive({
  departmentId: route.query.department_id || null,
  dueDate: route.query.due_date || null,
  person: route.query.person_id
    ? store.getters.activePeopleWithoutBot.filter(person =>
        route.query.person_id.split(',').includes(person.id)
      )
    : null,
  productionId: route.query.project_id || null,
  startDate: route.query.start_date || null,
  studioId: route.query.studio_id || null,
  taskStatusId: route.query.task_status_id || null,
  taskTypeId: route.query.task_type_id || null
})

let page = 1

// Computed
// --------------------------------------------------------------------------
const activePeopleWithoutBot = computed(
  () => store.getters.activePeopleWithoutBot
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

const personList = computed(() => {
  const production = productionMap.value.get(filters.productionId)
  if (!production) return activePeopleWithoutBot.value
  return sortPeople(
    production.team
      .map(personId => personMap.value.get(personId))
      .filter(person => person && !person.is_bot)
  )
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
        value: stat.amount
      }
    })
    .filter(Boolean)
)

// Functions
// --------------------------------------------------------------------------
const syncRouteQuery = () => {
  const query = Object.fromEntries(
    Object.entries(params.value).filter(([, value]) => value)
  )
  if (showBurndown.value) query.view = 'burndown'
  router.push({ query })
}

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
  page = 1
  store.dispatch('clearSelectedTasks')
  tasks.value = []
  syncRouteQuery()
  if (showBurndown.value) loadBurndown()
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
  if (showBurndown.value) loadBurndown()
})

// Lifecycle
// --------------------------------------------------------------------------
onMounted(() => {
  socket.on('task:update', onTaskUpdate)
  reload()
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
  gap: 1em;
  // a definite height (not only a max) so the burndown chart can flex to
  // fill the page; the task list scrolls inside either way
  height: 100%;
  padding: 5em 1em 1em 1em;
  color: var(--text);
}

.filters {
  align-items: flex-start;
  flex-wrap: wrap;
  row-gap: 1em;
}

.burndown-button,
.filters-toggle {
  align-self: flex-end;
  height: 42px;
}

// small screens only: the second filter row folds behind the toggle and
// the back button brings the list back in place of the task panel
.filters-toggle,
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
  .filters-toggle {
    display: flex;
    flex: none;
  }

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

  // the panel takes the whole width in place of the list
  .with-info :deep(.main-column) {
    display: none;
  }

  :deep(.column.side-column) {
    display: none;
    max-width: none;
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
